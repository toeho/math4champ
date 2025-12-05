from fastapi import APIRouter, Depends, HTTPException ,Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.schemas import Message as MessageSchema, Chat as ChatSchema
from models.models import Chat, Message,User
from helper import get_db
import base64, uuid
import os, json
from pathlib import Path
import llm


router = APIRouter(prefix="/chat", tags=["chat"])

# Read from environment: True → user must be logged in, False → guest allowed
CHAT_AUTH_REQUIRED = os.getenv("CHAT_AUTH_REQUIRED", "true").lower() == "true"
@router.post("/send/instant/{username}")
def send_message_instant(
    username: str,
    message: MessageSchema,
    db: Session = Depends(get_db),
):
    """Send a message using username — return only bot’s reply."""
    # --- Look up user ---
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user.id

    try:
        session_id = message.session_id or str(uuid.uuid4())

        # --- Find or create chat ---
        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(
                title=llm.get_chat_title(message.text),
                session_id=session_id,
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

        # --- Save user message ---
        user_msg = Message(
            text=message.text,
            image=message.image,
            sender="user",
            chat_id=chat.id,
            user_id=user_id,
        )
        db.add(user_msg)
        db.commit()

        # ✅ Update user's time metrics
        if message.time_taken and message.time_taken > 0:
            # Use the column expression (User.total_time_taken) as the key
            # — don't use the instance value `user.total_time_taken` which is a float
            # (that caused the "got 0.0" error when used as a dict key).
            from sqlalchemy import func

            # Safely add time_taken; coalesce handles NULLs in the DB.
            db.query(User).filter(User.id == user_id).update(
                {
                    User.total_time_taken: (func.coalesce(User.total_time_taken, 0.0) + (message.time_taken)/60),
                },
                synchronize_session=False,
            )
            db.commit()
        #  Check if user has given final answer
        
        
            # Load previous messages for context
            previous_messages = (
                db.query(Message)
                .filter(Message.chat_id == chat.id)
                .order_by(desc(Message.id))
                .limit(10)
                .all()
            )
            previous_messages.reverse()

            # Convert to conversation format
            conversation = [
                {"role": "assistant" if m.sender == "bot" else "user", "content": m.text}
                for m in previous_messages
                if m.text
            ]

            # Helper to load class topics
            def get_topics_for_class(level):
                try:
                    base = Path(__file__).resolve().parents[1] / "syllabus" / "topics.json"
                    if not base.exists():
                        return None
                    data = json.load(open(base, encoding="utf-8"))
                    key = f"class_{str(level).strip().replace('class_', '')}"
                    return data.get(key)
                except Exception:
                    return None

            topics = get_topics_for_class(user.class_level or user.level)

        previous_messages = (
            db.query(Message)
            .filter(Message.chat_id == chat.id)
            .order_by(desc(Message.id))
            .limit(6)
            .all()
        )
        previous_messages.reverse()
        last_context = "\n".join(
            [f"{msg.sender.capitalize()}: {msg.text}" for msg in previous_messages if msg.text]
        )

        # Generate hint
        if message.image:
            image_b64 = (
                message.image.split(",")[1]
                if message.image.startswith("data:")
                else message.image
            )
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                    image_b64=image_b64,
                    user_class=user.class_level or user.level,
                    parent_feedback=getattr(user, "Parent_feedback", None),
            )
        else:
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                    user_class=user.class_level or user.level,
                    topics=topics,
                    parent_feedback=getattr(user, "Parent_feedback", None),
            )

        print(bot_text)

        # --- Save bot reply ---
        bot_msg = Message(
            text=bot_text,
            sender="bot",
            chat_id=chat.id,
        )
        db.add(bot_msg)
        db.commit()

        # Return only current interaction
        return {
            "bot_message": {
                "text": bot_msg.text,
                "sender": bot_msg.sender,
                "session_id": session_id,
            }
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send/{username}", response_model=ChatSchema)
def send_message_by_username(
    username: str,                       # path variable
    message: MessageSchema,
    db: Session = Depends(get_db),
):
    """
    Send a message using the username instead of user_id.
    Backend looks up user_id from username.
    """

    # --- Look up user_id from username ---
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user.id

    try:
        session_id = message.session_id or str(uuid.uuid4())

        # --- Find or create chat ---
        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(
                title=message.text[:20] if message.text else "Image Chat",
                session_id=session_id,
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

        # --- Save user message ---
        user_msg = Message(
            text=message.text,
            image=message.image,
            sender="user",
            chat_id=chat.id,
            user_id=user_id,
        )
        db.add(user_msg)
        db.commit()

        # --- Fetch previous 6 messages as context ---
        previous_messages = (
            db.query(Message)
            .filter(Message.chat_id == chat.id)
            .order_by(desc(Message.id))
            .limit(6)
            .all()
        )

        # Reverse so oldest first
        previous_messages.reverse()
        # Combine messages into readable context text
        last_context = "\n".join(
            [f"{msg.sender.capitalize()}: {msg.text}" for msg in previous_messages if msg.text]
        )


        if message.image:
            # Extract base64 cleanly (support both with/without 'data:' prefix)
            image_b64 = (
                message.image.split(",")[1]
                if message.image.startswith("data:")
                else message.image
            )
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                image_b64=image_b64,
                user_class=user.class_level or user.level,
                parent_feedback=getattr(user, "Parent_feedback", None),
            )
        else:
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                user_class=user.class_level or user.level,
                parent_feedback=getattr(user, "Parent_feedback", None),
            )

       
        #try
        # bot_text=llm.generate_hint(message.text)
        print(bot_text)


        # --- Save bot reply ---
        bot_msg = Message(
            text=bot_text,
            sender="bot",
            chat_id=chat.id,
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(chat)

        return chat

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise e


@router.get("/user/{username}", response_model=list[ChatSchema])
def get_chats_by_username(username: str, db: Session = Depends(get_db)):
    # Find user by username
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    chats = (
        db.query(Chat)
        .join(Message)
        .filter(Message.user_id == user.id, Message.sender == "user")
        .order_by(desc(Chat.id))
        .all()
    )
    return chats

# --- New: Get chats by session_id ---
@router.get("/session/{session_id}", response_model=list[ChatSchema])
def get_chats_by_session(session_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.session_id == session_id).all()
    if not chats:
        raise HTTPException(status_code=404, detail="No chats for this session")
    return chats


@router.post("/send/check/{username}")
##divide the check answer
def check_message_instant(
    username: str,
    message: MessageSchema,
    db: Session = Depends(get_db),
):
    """Send a message using username — return only bot’s reply."""
    # --- Look up user ---
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user.id

    try:
        session_id = message.session_id or str(uuid.uuid4())

        # --- Find or create chat ---
        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(
                title=llm.get_chat_title(message.text),
                session_id=session_id,
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)

        # --- Save user message ---
        user_msg = Message(
            text=message.text,
            image=message.image,
            sender="user",
            chat_id=chat.id,
            user_id=user_id,
        )
        db.add(user_msg)
        db.commit()

        # ✅ Update user's time metrics
        if message.time_taken and message.time_taken > 0:
            # Use the column expression (User.total_time_taken) as the key
            # — don't use the instance value `user.total_time_taken` which is a float
            # (that caused the "got 0.0" error when used as a dict key).
            from sqlalchemy import func

            # Safely add time_taken; coalesce handles NULLs in the DB.
            db.query(User).filter(User.id == user_id).update(
                {
                    User.total_time_taken: (func.coalesce(User.total_time_taken, 0.0) + (message.time_taken)/60),
                },
                synchronize_session=False,
            )
            db.commit()
        #  Check if user has given final answer
        
        try:
            # Load previous messages for context
            previous_messages = (
                db.query(Message)
                .filter(Message.chat_id == chat.id)
                .order_by(desc(Message.id))
                .limit(10)
                .all()
            )
            previous_messages.reverse()

            # Convert to conversation format
            conversation = [
                {"role": "assistant" if m.sender == "bot" else "user", "content": m.text}
                for m in previous_messages
                if m.text
            ]

            # Helper to load class topics
            def get_topics_for_class(level):
                try:
                    base = Path(__file__).resolve().parents[1] / "syllabus" / "topics.json"
                    if not base.exists():
                        return None
                    data = json.load(open(base, encoding="utf-8"))
                    key = f"class_{str(level).strip().replace('class_', '')}"
                    return data.get(key)
                except Exception:
                    return None

            topics = get_topics_for_class(user.class_level or user.level)

            # Ask LLM to detect if final + correct
            judge = llm.check_answer(conversation=conversation, class_topics=topics)
            print("Judge output:", judge, flush=True)

            if isinstance(judge, dict):
                if judge.get("final"):
                    # Use atomic UPDATEs to avoid race conditions and ensure counters increment correctly.
                    try:
                        is_correct = bool(judge.get("correct"))

                        if is_correct:
                            print("✅ correct answer (atomic update)", flush=True)
                            db.query(User).filter(User.id == user_id).update(
                                {
                                    User.total_attempts: (User.total_attempts + 1),
                                    User.correct_attempts: (User.correct_attempts + 1),
                                    User.score: (User.score + 1.0),
                                },
                                synchronize_session=False,
                            )
                        else:
                            print("❌ incorrect answer (atomic update)", flush=True)
                            db.query(User).filter(User.id == user_id).update(
                                {
                                    User.total_attempts: (User.total_attempts + 1),
                                    User.score: (User.score - 0.25),
                                },
                                synchronize_session=False,
                            )

                        # Commit the atomic update
                        db.commit()

                        # Clamp negative score to 0.0 if it happened
                        try:
                            u_after = db.query(User).filter(User.id == user_id).first()
                            if u_after and (u_after.score or 0.0) < 0.0:
                                db.query(User).filter(User.id == user_id).update({User.score: 0.0}, synchronize_session=False)
                                db.commit()

                            # Log resulting values for verification
                            if u_after:
                                print(
                                    f"ℹ️ Post-update user id={user_id} -> total_attempts={u_after.total_attempts}, correct_attempts={u_after.correct_attempts}, score={u_after.score}",
                                    flush=True,
                                )
                            else:
                                print(f"⚠️ User id={user_id} not found after update", flush=True)
                        except Exception as requery_err:
                            # Non-fatal: log and continue
                            db.rollback()
                            print(f"⚠️ Could not re-query/normalize user id={user_id} after commit: {requery_err}", flush=True)

                        # Update streaks based on correctness: maintain current_streak and max_streak
                        try:
                            u_after = db.query(User).filter(User.id == user_id).first()
                            if u_after:
                                prev_streak = int(u_after.current_streak or 0)
                                prev_max = int(u_after.max_streak or 0)
                                # Compute new streak: if last update was a correct answer, increment, else reset to 0
                                if is_correct:
                                    new_streak = prev_streak + 1
                                else:
                                    new_streak = 0

                                new_max = prev_max
                                if new_streak > prev_max:
                                    new_max = new_streak

                                # Only write if changed
                                if new_streak != prev_streak or new_max != prev_max:
                                    db.query(User).filter(User.id == user_id).update(
                                        {
                                            User.current_streak: new_streak,
                                            User.max_streak: new_max,
                                        },
                                        synchronize_session=False,
                                    )
                                    db.commit()
                        except Exception as streak_err:
                            db.rollback()
                            print(f"⚠️ Could not update streaks for user id={user_id}: {streak_err}", flush=True)
                    except Exception as commit_err:
                        db.rollback()
                        print(f"❗ Failed to apply atomic user update for id={user_id}: {commit_err}", flush=True)
                else:
                    print("🕐 Not a final answer yet", flush=True)

        except Exception as e:
            print("⚠️ Answer-check skipped due to error:", e, flush=True)

        # ------------------------------------------
        #  2️⃣ Generate bot’s reply (LLM Hint)
        # ------------------------------------------
        previous_messages = (
            db.query(Message)
            .filter(Message.chat_id == chat.id)
            .order_by(desc(Message.id))
            .limit(6)
            .all()
        )
        previous_messages.reverse()
        last_context = "\n".join(
            [f"{msg.sender.capitalize()}: {msg.text}" for msg in previous_messages if msg.text]
        )

        # Generate hint
        if message.image:
            image_b64 = (
                message.image.split(",")[1]
                if message.image.startswith("data:")
                else message.image
            )
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                    image_b64=image_b64,
                    user_class=user.class_level or user.level,
                    parent_feedback=getattr(user, "Parent_feedback", None),
            )
        else:
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context,
                user_class=user.class_level or user.level,
                parent_feedback=getattr(user, "Parent_feedback", None),
            )

        print(bot_text)

        # --- Save bot reply ---
        bot_msg = Message(
            text=bot_text,
            sender="bot",
            chat_id=chat.id,
        )
        db.add(bot_msg)
        db.commit()

        # Return only current interaction
        return {
            "bot_message": {
                "text": bot_msg.text,
                "sender": bot_msg.sender,
                "session_id": session_id,
            }
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

