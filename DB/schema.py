from pydantic import BaseModel

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
