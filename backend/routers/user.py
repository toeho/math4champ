# routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import UserCreate, UserLogin, UserOut, UserUpdate
from models.models import User
from deps import get_db
from auth import create_access_token, verify_token
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["users"])

# ---------- Signup ----------
@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        username=user.username,
        password=user.password,  # ⚠️ should hash later
        name=user.name,
        level=user.level,
        email=user.email,
        avatar=user.avatar,
        classLevel=user.classLevel,
        age=user.age,
        school=user.school,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ---------- Login ----------
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == data.username).first()
    if not db_user or db_user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=timedelta(minutes=60),
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ---------- Get Profile ----------
@router.get("/me", response_model=UserOut)
def get_user(
    username: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# ---------- Update Profile ----------
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
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user
