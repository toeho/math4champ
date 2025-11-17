from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

# ---------- User ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)  # ⚡ primary unique
    password = Column(String, nullable=False)

    # Optional fields
    name = Column(String, nullable=True)
    level = Column(Integer, default=1)
    email = Column(String, nullable=True)  # ⚡ remove unique
    avatar = Column(Text, nullable=True)
    class_level = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    school = Column(String, nullable=True)
    # Tracking attempts and scoring (updated automatically by backend checks)
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    total_time_taken = Column(Float, default=0.0)
    # Streak tracking
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)

# ---------- Chat ----------
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    session_id = Column(String, index=True, nullable=True)  # belongs to chat

    messages = relationship("Message", back_populates="chat", cascade="all, delete")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=True)
    image = Column(Text, nullable=True)
    sender = Column(String, nullable=False)  # "user" or "bot"
    
    chat_id = Column(Integer, ForeignKey("chats.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # <-- new
    chat = relationship("Chat", back_populates="messages")