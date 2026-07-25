import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Determine if we are running in Streamlit Cloud
IS_STREAMLIT_CLOUD = (
    os.environ.get("STREAMLIT_SERVER_PORT") is not None 
    or "mount" in os.path.abspath(__file__) 
    or "home/adminuser" in os.path.abspath(__file__)
)

if IS_STREAMLIT_CLOUD:
    # Use relative path in the current working directory for Streamlit Cloud
    SQLALCHEMY_DATABASE_URL = "sqlite:///agritech.db"
else:
    # Local development - use absolute path to backend/agritech.db to share database state
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BACKEND_DIR = os.path.dirname(BASE_DIR)
    DB_PATH = os.path.join(BACKEND_DIR, "agritech.db")
    DB_PATH_CLEAN = DB_PATH.replace("\\", "/")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH_CLEAN}"


# connect_args={"check_same_thread": False} is needed only for SQLite.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency to be used in FastAPI routes to get a database session.
    Example:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
