from conn import Base, engine
from data_models import User   # 👈 makes SQLAlchemy aware of User

Base.metadata.create_all(bind=engine)
print("✅ Tables created!")
