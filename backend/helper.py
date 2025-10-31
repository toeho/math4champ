# deps.py
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Request, Depends
import jwt
from typing import Optional
import re

from models.models import User
from auth import SECRET_KEY, ALGORITHM


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_class(request: Request, db: Session = Depends(get_db)) -> dict:
    """
    Resolve the user's class for any incoming request.

    Behavior:
    - If the request has a Bearer token, try to decode it and look up the user.
    - If a valid user is found, return their `level` and `class_level` and a resolved class key.
    - If no token / invalid token / user not found, return a sensible guest default (class_5).

    Returns a dict with keys:
      - user: User | None (SQLAlchemy user object if found)
      - level: int | None
      - class_level: str | None (raw class_level field from DB)
      - resolved_class_key: str (like 'class_5') — useful for loading syllabus/topics
      - is_guest: bool
    """
    auth_header: Optional[str] = request.headers.get("authorization")

    # Default guest values
    guest = {"user": None, "level": 5, "class_level": None, "resolved_class_key": "class_5", "is_guest": True}

    if not auth_header:
        return guest

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return guest

    token = parts[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if not username:
            return guest
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return guest

        raw_class = getattr(user, "class_level", None)
        level = getattr(user, "level", None) or 5
        # normalized class key: prefer explicit class_level if it looks like 'class_X', else use level
        if raw_class and isinstance(raw_class, str) and raw_class.strip():
            cl = raw_class.strip()
            if cl.startswith("class_"):
                resolved = cl
            else:
                # allow values like '5' or 'Grade 5'
                digits = "".join(c for c in cl if c.isdigit())
                resolved = f"class_{digits or level}"
        else:
            resolved = f"class_{level}"

        return {"user": user, "level": level, "class_level": raw_class, "resolved_class_key": resolved, "is_guest": False}

    except jwt.ExpiredSignatureError:
        return guest
    except jwt.InvalidTokenError:
        return guest


def get_user_class_number(request: Request, db: Session = Depends(get_db)) -> int:
    """
    FastAPI dependency that returns only the numeric class number for the request user.

    Returns an int (e.g. 1..12). Defaults to 5 for guests or on error.
    """
    info = get_user_class(request, db)
    # info should be a dict as returned by get_user_class
    if not isinstance(info, dict):
        return 5

    # Prefer resolved_class_key like 'class_5'
    resolved = info.get("resolved_class_key")
    if isinstance(resolved, str):
        m = re.search(r"(\d+)", resolved)
        if m:
            try:
                return int(m.group(1))
            except Exception:
                pass

    # Fallback to level
    level = info.get("level")
    try:
        return int(level)
    except Exception:
        return 5
