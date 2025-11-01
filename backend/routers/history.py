from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.schemas import Chat as ChatSchema
from models.models import Chat
from helper import get_db

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=list[ChatSchema])
def get_history(db: Session = Depends(get_db)):
    chats = db.query(Chat).all()
    return chats
