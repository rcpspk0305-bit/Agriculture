from pydantic import BaseModel

class SensorData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class GenAIRequest(BaseModel):
    crop: str
    disease: str
    sensor_data: dict
