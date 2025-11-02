from pydantic import BaseModel, EmailStr
from typing import List, Optional

from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    level: Optional[int] = 1
    email: Optional[str] = None
    avatar: Optional[str] = None
    class_level: Optional[str] = None
    age: Optional[int] = None
    school: Optional[str] = None
    # Backend-only tracking (exposed read-only in responses)
    total_attempts: Optional[int] = 0
    correct_attempts: Optional[int] = 0
    score: Optional[float] = 0.0

    class Config:
        orm_mode = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    level: Optional[int] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    class_level: Optional[str] = None
    age: Optional[int] = None
    school: Optional[str] = None

class UserOut(UserBase):
    id: int

# ---------- Chat / Messages ----------
class Message(BaseModel):
    text: Optional[str] = None
    image: Optional[str] = None
    sender: str
    session_id: Optional[str] = None
    user_id: Optional[int] = None  # <-- new
    time_taken: Optional[float] = 0.0

class Chat(BaseModel):
    id: int
    title: str
    session_id: Optional[str] = None  # add session_id here
    messages: List[Message]

# ---------- Explore ----------
class Progress(BaseModel):
    percentage: int
    mastered: int
    total: int


class Practice(BaseModel):
    problems: int
    minutes: int
    streak: int


class Strengths(BaseModel):
    strongest: str
    focus: str


class WeeklyGoal(BaseModel):
    solved: int
    goal: int


class ExploreData(BaseModel):
    progress: Progress
    accuracy: int
    practice: Practice
    strengths: Strengths
    weeklyGoal: WeeklyGoal
    badges: List[str]