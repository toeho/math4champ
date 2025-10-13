from fastapi import APIRouter, Depends, HTTPException ,Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.schemas import Message as MessageSchema, Chat as ChatSchema
from models.models import Chat, Message
from deps import get_db
from google import genai
import base64, uuid
import os
client = genai.Client(api_key="AIzaSyDt6D-1Ss-cJhLGfNhfOTwtjvks1ynQ8ac")
router = APIRouter(prefix="/chat", tags=["chat"])

# Read from environment: True → user must be logged in, False → guest allowed
CHAT_AUTH_REQUIRED = os.getenv("CHAT_AUTH_REQUIRED", "false").lower() == "true"


@router.post("/send", response_model=ChatSchema)
def send_message(
    message: MessageSchema,
    db: Session = Depends(get_db),
    user_id: int | None = Header(default=None),  # Optional header
):
    """
    Send a message to the bot.
    If CHAT_AUTH_REQUIRED=True, user_id header is required.
    If CHAT_AUTH_REQUIRED=False, user_id can be omitted for guest chat.
    """

    try:
        if CHAT_AUTH_REQUIRED and not user_id:
            raise HTTPException(status_code=401, detail=f"Login required to chat {CHAT_AUTH_REQUIRED}")

        session_id = message.session_id or str(uuid.uuid4())  # generate new if not given

        # --- Find or create chat for this session ---
        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(
                title=message.text[:20] if message.text else "Image Chat",
                session_id=session_id
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
            user_id=user_id if user_id else None,  # link user if available
        )
        db.add(user_msg)
        db.commit()

        # --- Prepare Gemini prompt ---
        prompt = message.text or ""
        if message.image:
            image_bytes = base64.b64decode(message.image.split(",")[1]) if message.image.startswith("data:") else base64.b64decode(message.image)
            contents = [
                {"inlineData": {"mimeType": "image/jpeg", "data": image_bytes}},
                {"text": prompt},
            ]
        else:
            contents = [{"text": prompt}]

        # --- Send to Gemini ---
        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=contents,
        )

        bot_text = getattr(response, "text", "No response received.")

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


# --- New: Get all chats for a user (future user_id integration) ---
@router.get("/user/{user_id}", response_model=list[ChatSchema])
def get_chats_by_user(user_id: int, db: Session = Depends(get_db)):
    if CHAT_AUTH_REQUIRED is False:
        raise HTTPException(status_code=403, detail="Guest mode active. No user chats available.")
    
    chats = (
        db.query(Chat)
        .join(Message)
        .filter(Message.user_id == user_id, Message.sender == "user")
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
