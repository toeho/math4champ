# auth.py
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional


# JWT Settings
SECRET_KEY = "your-secret-key"   # ⚠️ change to strong secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# Create JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify JWT
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")





# Helper: resolve class number from username and DB (keeps deps minimal to avoid circular imports)
def get_user_class_number_by_username(username: str, db: Session) -> int:
    """
    Return the numeric class for the given username by looking up the User in the DB.

    - If the user has `class_level` like 'class_5' or '5', the numeric portion is returned.
    - Else falls back to the `level` integer column.
    - Defaults to 5 when missing or on error.
    """
    try:
        # local import to avoid circular imports at module import time
        from models.models import User

        user = db.query(User).filter(User.username == username).first()
        if not user:
            return 5

        # Prefer class_level if present
        raw = getattr(user, "class_level", None)
        if raw and isinstance(raw, str):
            # extract digits from strings like 'class_5' or 'Grade 5' or '5'
            digits = "".join(c for c in raw if c.isdigit())
            if digits:
                try:
                    return int(digits)
                except Exception:
                    pass

        # Fall back to level column
        lvl = getattr(user, "level", None)
        if lvl is not None:
            try:
                return int(lvl)
            except Exception:
                pass

        return 5
    except Exception:
        return 5
