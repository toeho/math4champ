import sys
from pathlib import Path

from fastapi import FastAPI
from database import Base, engine

# Ensure the backend directory is on sys.path so imports like `from routers import ...`
# work whether uvicorn is started from the repo root (uvicorn backend.main:app)
# or from inside the backend folder (uvicorn main:app).
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from routers import user, chat, history, explore, syllabus, topics
from fastapi.middleware.cors import CORSMiddleware
# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# routers
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(explore.router)
app.include_router(syllabus.router)
app.include_router(topics.router)
