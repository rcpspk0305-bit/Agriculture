import random
from app.models.schemas import SensorData

def predict_crop(data: SensorData):
    if data.humidity > 75 and data.rainfall > 150:
        recommended = "Rice"
    elif data.ph < 6.0:
        recommended = "Potato"
    elif data.temperature > 30 and data.humidity < 60:
        recommended = "Cotton"
    elif data.N > 80:
        recommended = "Maize"
    else:
        recommended = random.choice(["Wheat", "Chickpea", "Coffee", "Apple", "Grapes"])
    return recommended
