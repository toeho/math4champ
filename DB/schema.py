from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
# shared fields
class UserBase(BaseModel):
    user_id: str
    name: str
    age: int
    email: str
    password_hash: str

# request model for creating a user
class UserCreate(UserBase):
    pass

# response model (hide password!)
class UserResponse(BaseModel):
    user_id: str
    name: str
    age: int
    email: str

    class Config:
        orm_mode = True  # 👈 allows SQLAlchemy models to be returned


class SessionBase(BaseModel):
    id: int
    started_at: datetime


class SessionCreate(BaseModel):
    pass  


class SessionResponse(SessionBase):
    messages: List["MessageResponse"] = []  

    class Config:
        orm_mode = True


# ---------------- MESSAGE MODELS ----------------
class MessageBase(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class MessageCreate(MessageBase):
    session_id: int


class MessageResponse(MessageBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

SessionResponse.model_rebuild()