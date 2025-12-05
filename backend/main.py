import sys
from pathlib import Path

from fastapi import FastAPI
from database import Base, engine
from sqlalchemy import text

# Ensure the backend directory is on sys.path so imports like `from routers import ...`
# work whether uvicorn is started from the repo root (uvicorn backend.main:app)
# or from inside the backend folder (uvicorn main:app).
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from routers import user, chat, history, explore, syllabus, topics, parent
from fastapi.middleware.cors import CORSMiddleware
# create tables
def ensure_streak_columns():
    """Add `current_streak` and `max_streak` columns to `users` table if missing (SQLite).

    This is a lightweight dev-time migration to avoid manual DB edits.
    """
    try:
        conn = engine.connect()
        try:
            res = conn.execute(text("PRAGMA table_info('users')")).mappings().all()
            cols = [r["name"] for r in res]
            stmts = []
            if "current_streak" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0")
            if "max_streak" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN max_streak INTEGER DEFAULT 0")
            # add Parent_feedback column if missing
            if "Parent_feedback" not in cols:
                stmts.append("ALTER TABLE users ADD COLUMN Parent_feedback TEXT")
            for s in stmts:
                conn.execute(text(s))
            if stmts:
                print(f"DB migration applied: added columns -> {stmts}", flush=True)
        finally:
            conn.close()
    except Exception as e:
        print(f"DB migration error (non-fatal): {e}", flush=True)


# Ensure schema exists and run lightweight migrations
ensure_streak_columns()
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
app.include_router(parent.router)
