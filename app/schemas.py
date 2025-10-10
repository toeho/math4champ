# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    sender: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class ChatBase(BaseModel):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class ChatWithMessages(ChatBase):
    messages: List[MessageResponse]

class StudentBase(BaseModel):
    name: str
    grade: int
    email: EmailStr

class StudentCreate(StudentBase):
    password: str

class StudentResponse(StudentBase):
    id: int
    score: float
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    student_id: Optional[int] = None
    is_admin: Optional[bool] = False

class AnswerSubmission(BaseModel):
    question: str
    answer: str

class AnswerResult(BaseModel):
    correct: bool
    feedback: str
    correct_answer: Optional[str] = None

class StudentReport(BaseModel):
    id: int
    name: str
    grade: int
    score: float
    total_attempts: int
    correct_attempts: int
    accuracy: float
    class Config:
        orm_mode = True
