# app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..auth import get_db, get_current_student

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/new", response_model=schemas.ChatBase)
def create_chat(db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    chat = models.ChatSession(student_id=current.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/{chat_id}", response_model=schemas.ChatWithMessages)
def get_chat(chat_id: int, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    chat = db.query(models.ChatSession).filter(models.ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.student_id != current.id and not current.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this chat")
    return chat


@router.get("/me/sessions", response_model=List[schemas.ChatBase])
def list_my_sessions(db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    """Return all chat sessions for the currently authenticated student."""
    sessions = db.query(models.ChatSession).filter(models.ChatSession.student_id == current.id).all()
    return sessions



#to get sessions of all the users
# @router.get("/student/{student_id}/sessions", response_model=List[schemas.ChatBase])
# def list_sessions_for_student(student_id: int, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
#     """Return all chat sessions for a given student. Accessible by the student themself or admins."""
#     if student_id != current.id and not current.is_admin:
#         raise HTTPException(status_code=403, detail="Not authorized to view sessions for this student")
#     sessions = db.query(models.ChatSession).filter(models.ChatSession.student_id == student_id).all()
#     return sessions
