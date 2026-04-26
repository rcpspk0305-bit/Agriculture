from pydantic import BaseModel

class SensorData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    tds: float

class GenAIRequest(BaseModel):
    crop: str
    disease: str
    sensor_data: dict
    language: str = "English"

class ChatRequest(BaseModel):
    message: str
    history: list = []
    language: str = "English"
