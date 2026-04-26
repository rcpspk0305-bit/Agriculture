from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.core.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)
    humidity = Column(Float)
    ph = Column(Float)
    rainfall = Column(Float)
    n = Column(Float)
    p = Column(Float)
    k = Column(Float)
    tds = Column(Float)
