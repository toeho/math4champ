from fastapi import FastAPI
from database import Base, engine
from routers import user, chat, history, explore

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# routers
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(explore.router)
