from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from conn import SessionLocal
from data_models import User

SECRET_KEY = "abc"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(userid: str):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.user_id == userid).first()
        if user:
            return {
                "user_id": user.user_id,
                "name": user.name,
                "email": getattr(user, "email", None),
                "age":user.age,
                "password_hash": user.password_hash
            }
        return None
    finally:
        session.close()

def hash_password(password_hash: str):
    return pwd_context.hash(password_hash)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None

if __name__ == "__main__":
    test_user_id = "john_doe11"
    user = get_user(test_user_id)
    print(user)
