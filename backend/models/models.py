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
    # Parent feedback column: stores latest parent feedback for this student
    Parent_feedback = Column(Text, nullable=True)

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


# ---------- Parent ----------
class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=True)

    # Link to student (user) this parent belongs to (by username)
    student_username = Column(String, ForeignKey("users.username"), nullable=False)
    student = relationship("User", foreign_keys=[student_username])


# ---------- Teacher ----------
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(Text, nullable=True)
    
    # Videos uploaded by this teacher
    videos = relationship("Video", back_populates="teacher", cascade="all, delete")


# ---------- Video ----------
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    class_level = Column(String, nullable=False)  # e.g., "class_6", "class_10"
    subject = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    file_path = Column(String, nullable=False)  # path to video file
    file_size = Column(Integer, nullable=True)  # in bytes
    thumbnail = Column(Text, nullable=True)  # thumbnail image path or URL
    
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    teacher = relationship("Teacher", back_populates="videos")
    
    # Metadata
    upload_date = Column(String, nullable=False)  # ISO format date
    view_count = Column(Integer, default=0)