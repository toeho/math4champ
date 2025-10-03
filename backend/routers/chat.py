from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.schemas import Message as MessageSchema, Chat as ChatSchema
from models.models import Chat, Message
from deps import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=ChatSchema)
def send_message(message: MessageSchema, db: Session = Depends(get_db)):
    # create new chat
    new_chat = Chat(title=message.text[:20] if message.text else "Image Chat")
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    # user message
    user_msg = Message(text=message.text, image=message.image, sender=message.sender, chat_id=new_chat.id)
    db.add(user_msg)

    # bot reply
    bot_text = f"Echo: {message.text}" if message.text else "Got image!"
    bot_msg = Message(text=bot_text, sender="bot", chat_id=new_chat.id)
    db.add(bot_msg)

    db.commit()
    db.refresh(new_chat)

    return new_chat
