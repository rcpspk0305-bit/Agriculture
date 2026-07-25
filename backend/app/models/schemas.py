from pydantic import BaseModel
from typing import List, Optional

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

class TrendPoint(BaseModel):
    slot: str
    temperature: float
    humidity: float

class DashboardMetric(BaseModel):
    label: str
    value: float
    unit: str
    trend: float

class DashboardWindow(BaseModel):
    id: str
    title: str
    status: str
    summary: str

class DashboardOverviewResponse(BaseModel):
    status: str
    generated_at: str
    theme: str
    health_score: int
    metrics: List[DashboardMetric]
    trend: List[TrendPoint]
    windows: List[DashboardWindow]

class DashboardWindowResponse(BaseModel):
    status: str
    window: str
    title: str
    payload: dict
