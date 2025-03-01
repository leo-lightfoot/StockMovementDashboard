from sqlalchemy import create_engine
from ..models.stock import Base
from .config import settings

def init_db():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!") 