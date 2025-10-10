# app/main.py
from fastapi import FastAPI
from .database import Base, engine
from .routers import students, chat, questions

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Math Tutor")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(chat.router)
app.include_router(questions.router)
