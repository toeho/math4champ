from data_models import User
from conn import Base, engine, SessionLocal


Base.metadata.create_all(bind=engine)
db = SessionLocal()

#new user
all_user = [
    User(
    user_id="john_doe12",
    name="Doe",
    age=6,
    email="john_doe12@example.com",
    password_hash="123" # hashes the password
    ),
    User(
    user_id="john1",
    name="john",
    age=5,
    email="john12@example.com",
    password_hash="password123" # hashes the password
    
    )

]



db.add_all(all_user)
db.commit()

all_user = db.query(User).all()
for u in all_user:
    print(u.user_id, u.name, u.age, u.email)

db.close()
