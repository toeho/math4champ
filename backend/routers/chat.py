from fastapi import APIRouter, Depends, HTTPException ,Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.schemas import Message as MessageSchema, Chat as ChatSchema
from models.models import Chat, Message,User
from deps import get_db
from google import genai
import base64, uuid
import os
import llm

client = genai.Client(api_key="AIzaSyDt6D-1Ss-cJhLGfNhfOTwtjvks1ynQ8ac")
router = APIRouter(prefix="/chat", tags=["chat"])

# Read from environment: True → user must be logged in, False → guest allowed
CHAT_AUTH_REQUIRED = os.getenv("CHAT_AUTH_REQUIRED", "true").lower() == "true"

@router.post("/send/instant/{username}")
def send_message_instant(
    username: str,
    message: MessageSchema,
    db: Session = Depends(get_db),
):
    """
    Send a message using the username but only return the bot's reply (not full chat history).
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
                title= llm.get_chat_title(message.text),
                session_id=session_id,
            )
            # chat = Chat(
            #     title=message.text[:20] if message.text else "Image Chat",
            #     title= llm.get_chat_title(message.text),
            #     session_id=session_id,
            # )
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
                image_b64=image_b64
            )
        
        else:
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context

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

        # ✅ Return only current interaction result
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
                image_b64=image_b64
            )
        
        else:
            bot_text = llm.generate_hint(
                question=message.text,
                last_context=last_context

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
