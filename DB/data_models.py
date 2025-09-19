from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.ext.declarative import declarative_base
from conn import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)