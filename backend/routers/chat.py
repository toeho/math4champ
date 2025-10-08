from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.schemas import Message as MessageSchema, Chat as ChatSchema
from models.models import Chat, Message
from deps import get_db
from google import genai
import base64

# Initialize Gemini client
client = genai.Client(api_key="AIzaSyDt6D-1Ss-cJhLGfNhfOTwtjvks1ynQ8ac")

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/send", response_model=ChatSchema)
def send_message(message: MessageSchema, db: Session = Depends(get_db)):
    try:
        # --- Step 1: Create new chat ---
        new_chat = Chat(title=message.text[:20] if message.text else "Image Chat")
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)

        # --- Step 2: Save user message ---
        user_msg = Message(
            text=message.text,
            image=message.image,
            sender=message.sender,
            chat_id=new_chat.id
        )
        db.add(user_msg)
        db.commit()

        # --- Step 3: Prepare input for Gemini ---
        prompt = message.text or ""

        if message.image:
            # Decode base64 image
            image_bytes = base64.b64decode(message.image.split(",")[1]) if message.image.startswith("data:") else base64.b64decode(message.image)
            contents = [
                {"inlineData": {"mimeType": "image/jpeg", "data": image_bytes}},
                {"text": prompt}
            ]
        else:
            contents = [{"text": prompt}]

        # --- Step 4: Send to Gemini ---
        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=contents
        )


        bot_text = getattr(response, "text", "No response received.")

        # --- Step 5: Save bot reply ---
        bot_msg = Message(
            text=bot_text,
            sender="bot",
            chat_id=new_chat.id
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(new_chat)

        return new_chat

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise e
