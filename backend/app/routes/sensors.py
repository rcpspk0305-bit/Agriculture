import random
from fastapi import APIRouter
from app.services.mqtt_service import latest_iot_data

router = APIRouter()

def clamp(val, low, high):
    return max(low, min(high, val))

@router.get("/iot/live")
def get_live_data():
    latest_iot_data["temperature"] = round(clamp(latest_iot_data["temperature"] + random.uniform(-0.5, 0.5), 10, 50), 1)
    latest_iot_data["humidity"] = round(clamp(latest_iot_data["humidity"] + random.uniform(-1.0, 1.0), 0, 100), 1)
    latest_iot_data["ph"] = round(clamp(latest_iot_data["ph"] + random.uniform(-0.05, 0.05), 3, 10), 2)
    latest_iot_data["rainfall"] = round(clamp(latest_iot_data["rainfall"] + random.uniform(-3, 3), 0, 500), 1)
    return {"status": "success", "data": latest_iot_data}
