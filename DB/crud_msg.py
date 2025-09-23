from sqlalchemy.orm import Session
import data_models, schema

# Session (chat)
def create_session(db: Session, user_id: str):
    db_session = data_models.Session(user_id=user_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_sessions_for_user(db: Session, user_id: str):
    return db.query(data_models.Session).filter(data_models.Session.user_id == user_id).all()

# Messages
def add_message(db: Session, message: schema.MessageCreate):
    db_msg = data_models.Message(**message.dict())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_messages(db: Session, session_id: int):
    return db.query(data_models.Message).filter(data_models.Message.session_id == session_id).all()
