# conn.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#connection
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = "sqlite:///studentss.db"

#engine creation
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

#local session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #pyright: ignore[reportGeneralTypeIssues]

#base class
Base = declarative_base()


