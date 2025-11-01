from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.schemas import UserCreate, UserLogin, UserOut, UserUpdate
from models.models import User
from helper import get_db
from auth import create_access_token, verify_token
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["users"])

# ---------------- Signup ----------------
@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=user.username,
        password=user.password,  # plain text for demo
        name=user.name or user.username,
        level=user.level or 1,
        email=user.email,
        avatar=user.avatar,
        class_level=user.class_level,
        age=user.age,
        school=user.school,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ---------------- Login ----------------
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == data.username).first()
    if not db_user or db_user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=timedelta(hours=1),
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------- Get current user ----------------
@router.get("/me", response_model=UserOut)
def get_user(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# ---------------- Update user ----------------
@router.put("/update", response_model=UserOut)
def update_user(
    updates: UserUpdate,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)  # no hashing

    db.commit()
    db.refresh(db_user)
    return db_user
