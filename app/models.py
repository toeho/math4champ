# app/models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    grade = Column(Integer, nullable=False)
    score = Column(Float, default=0.0)            # hidden performance score
    total_attempts = Column(Integer, default=0)   # total answer attempts
    correct_attempts = Column(Integer, default=0) # total correct answers
    is_admin = Column(Boolean, default=False)     # admin/teacher flag

    chats = relationship("ChatSession", back_populates="student")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="chats")
    messages = relationship("Message", back_populates="chat", order_by="Message.id")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String)  # "student" or "ai"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    chat = relationship("ChatSession", back_populates="messages")
