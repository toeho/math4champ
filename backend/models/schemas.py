from pydantic import BaseModel, EmailStr
from typing import List, Optional



# ---------- User ----------

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    level: Optional[int] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    class_level: Optional[str] = None  # snake_case
    age: Optional[int] = None
    school: Optional[str] = None

    class Config:
        allow_population_by_field_name = True  # allows camelCase from frontend
        
# In your schemas.py
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    level: int = 1
    email: str | None = None
    avatar: str | None = None
    class_level: int | None 
    age: int | None = None
    school: str | None = None
    
    class Config:
        populate_by_name = True  # Allow both field name and alias

class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    level: Optional[int] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    classLevel: Optional[str] = None
    age: Optional[int] = None
    school: Optional[str] = None


class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True
# ---------- Chat / Messages ----------
class Message(BaseModel):
    text: Optional[str] = None
    image: Optional[str] = None  # base64 string if image
    sender: str   # "user" or "bot"


class Chat(BaseModel):
    id: int
    title: str
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
