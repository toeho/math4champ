from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import UserCreate, UserLogin, UserOut, UserUpdate
from models.models import User
from deps import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(400, "User already exists")

    new_user = User(username=user.username, name=user.name, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == data.username).first()
    if not db_user or db_user.password != data.password:
        raise HTTPException(401, "Invalid credentials")
    return {"user": db_user, "token": "dummy-jwt"}


@router.get("/me", response_model=UserOut)
def get_user(username: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    return db_user


@router.put("/update", response_model=UserOut)
def update_user(username: str, updates: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(404, "User not found")

    if updates.name:
        db_user.name = updates.name
    if updates.password:
        db_user.password = updates.password

    db.commit()
    db.refresh(db_user)
    return db_user
