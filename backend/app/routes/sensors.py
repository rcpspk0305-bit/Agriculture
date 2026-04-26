import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.mqtt_service import latest_iot_data
from app.core.database import get_db
from app.models import db_models

router = APIRouter()

def clamp(val, low, high):
    return max(low, min(high, val))

@router.get("/iot/live")
def get_live_data(db: Session = Depends(get_db)):
    latest_iot_data["temperature"] = round(clamp(latest_iot_data["temperature"] + random.uniform(-0.5, 0.5), 10, 50), 1)
    latest_iot_data["humidity"] = round(clamp(latest_iot_data["humidity"] + random.uniform(-1.0, 1.0), 20, 60), 1)
    latest_iot_data["ph"] = round(clamp(latest_iot_data["ph"] + random.uniform(-0.05, 0.05), 3, 10), 2)
    latest_iot_data["rainfall"] = round(clamp(latest_iot_data["rainfall"] + random.uniform(-1.5, 1.5), 40, 60), 1)
    latest_iot_data["tds"] = round(clamp(latest_iot_data.get("tds", 150.0) + random.uniform(-2, 2), 0, 500), 1)
    
    # Store reading into DB
    new_reading = db_models.SensorReading(
        temperature=latest_iot_data["temperature"],
        humidity=latest_iot_data["humidity"],
        ph=latest_iot_data["ph"],
        rainfall=latest_iot_data["rainfall"],
        n=latest_iot_data["N"],
        p=latest_iot_data["P"],
        k=latest_iot_data["K"],
        tds=latest_iot_data["tds"]
    )
    db.add(new_reading)
    db.commit()

    return {"status": "success", "data": latest_iot_data}
