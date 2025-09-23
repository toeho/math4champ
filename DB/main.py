# main.py
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from conn import SessionLocal, engine, Base
from data_models import *
import crud_msg
import schema
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from auth_utils import get_user, verify_password, hash_password, create_access_token, decode_access_token

app = FastAPI()
Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/users", response_model=list[schema.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/users", response_model=schema.UserResponse)
def add_user(user: schema.UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password_hash)  # hash the plain password
    new_user = User(
        user_id=user.user_id,
        name=user.name,
        age=user.age,
        email=user.email,
        password_hash=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)

    hashed_pw = user.get("password_hash") if user else None

    if not user or not hashed_pw or not verify_password(form_data.password, hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["user_id"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile")
def read_profile(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": payload}



@app.post("/sessions/{user_id}", response_model=schema.SessionResponse)
def start_session(user_id: str, db: Session = Depends(get_db)):
    return crud_msg.create_session(db, user_id)

@app.get("/sessions/{user_id}", response_model=list[schema.SessionResponse])
def get_sessions(user_id: str, db: Session = Depends(get_db)):
    return crud_msg.get_sessions_for_user(db, user_id)

@app.post("/messages", response_model=schema.MessageResponse)
def add_message(message: schema.MessageCreate, db: Session = Depends(get_db)):
    return crud_msg.add_message(db, message)

@app.get("/sessions/{session_id}/messages", response_model=list[schema.MessageResponse])
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    return crud_msg.get_messages(db, session_id)