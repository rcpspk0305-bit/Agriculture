import os
import json
import random
import threading
import cv2
import numpy as np
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import paho.mqtt.client as mqtt

# ---------------------------------------------------------
# DUMMY IMPORTS FOR DEEP LEARNING & MACHINE LEARNING
# In a real environment, uncomment these:
# import joblib
# import torch
# import torchvision.transforms as transforms
# ---------------------------------------------------------

# ---------------------------------------------------------
# 1. CONFIGURATION & INITIALIZATION
# ---------------------------------------------------------
app = FastAPI(title="AgriTech God-Mode API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, set to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Generative AI (Gemini)
# Expects GEMINI_API_KEY environment variable. Using a dummy for execution safety.
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "DUMMY_KEY"))
generation_config = {
  "temperature": 0.4,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
}
# Fallback to avoid crash if no real key is present
try:
    model = genai.GenerativeModel("gemini-1.5-flash", generation_config=generation_config)
except Exception:
    model = None

# Global State to hold the latest IoT Data from MQTT
latest_iot_data = {
    "N": 88, "P": 50, "K": 42, "temperature": 25.5, 
    "humidity": 81.0, "ph": 6.8, "rainfall": 210.0
}

# ---------------------------------------------------------
# 2. IoT DATA LAYER (MQTT SIMULATOR THREAD)
# ---------------------------------------------------------
def on_mqtt_message(client, userdata, msg):
    """Background MQTT subscriber catching sensor telemetry."""
    global latest_iot_data
    try:
        payload = json.loads(msg.payload.decode())
        latest_iot_data.update(payload)
    except Exception as e:
        print(f"MQTT Parse Error: {e}")

def start_mqtt():
    """Starts the MQTT listener in a daemon thread so it doesn't block FastAPI."""
    client = mqtt.Client("agritech_god_server")
    client.on_message = on_mqtt_message
    try:
        # Connecting to public HiveMQ broker for demo purposes
        client.connect("broker.hivemq.com", 1883, 60)
        client.subscribe("agritech/ps10/sensors")
        client.loop_forever()
    except Exception as e:
        print(f"MQTT Connection Failed (Running without MQTT): {e}")

# Spin up the background thread
threading.Thread(target=start_mqtt, daemon=True).start()

class SensorData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.get("/iot/live")
def get_live_data():
    """Endpoint for frontend to poll the latest real-time sensor data."""
    # To simulate real-time changes if MQTT isn't active
    latest_iot_data["temperature"] += random.uniform(-0.5, 0.5)
    latest_iot_data["humidity"] += random.uniform(-1.0, 1.0)
    return {"status": "success", "data": latest_iot_data}


# ---------------------------------------------------------
# 3. TABULAR ML LAYER (SCIKIT-LEARN)
# ---------------------------------------------------------
@app.post("/predict")
def predict_crop(data: SensorData):
    """
    ML Layer: Recommends the optimal crop based on IoT telemetry.
    Production Code:
        rf_model = joblib.load('crop_model.pkl')
        prediction = rf_model.predict([[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]])
    """
    # Mocking scikit-learn random forest prediction
    crops = ["Rice", "Maize", "Chickpea", "Coffee", "Apple", "Cotton", "Grapes"]
    recommended = random.choice(crops)
    return {
        "status": "success",
        "input_data": data.dict(),
        "recommended_crop": recommended
    }


# ---------------------------------------------------------
# 4. COMPUTER VISION LAYER (OPENCV + PYTORCH/TF)
# ---------------------------------------------------------
@app.post("/vision/disease-detect")
async def detect_disease(file: UploadFile = File(...)):
    """
    Deep Learning Layer: Processes leaf image via OpenCV + Model.
    Returns the detected disease and confidence score.
    """
    # 1. Read bytes into OpenCV format
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 2. Preprocessing pipeline for Deep Learning
    # img_resized = cv2.resize(img, (224, 224))
    # tensor = transforms.ToTensor()(img_resized).unsqueeze(0)
    # output = pytorch_disease_model(tensor)
    # _, predicted = torch.max(output, 1)
    
    # Mocking detection result
    diseases = ["Healthy", "Early Blight", "Late Blight", "Leaf Curl", "Powdery Mildew"]
    detected = random.choice(diseases)
    confidence = round(random.uniform(0.85, 0.99), 3)
    
    return {
        "status": "success",
        "disease": detected,
        "confidence": confidence,
        "bbox": [10, 10, 200, 200] # Mock object detection bounding box
    }


# ---------------------------------------------------------
# 5. GENERATIVE AI LAYER (GEMINI / HUGGING FACE)
# ---------------------------------------------------------
class GenAIRequest(BaseModel):
    crop: str
    disease: str
    sensor_data: dict

@app.post("/chat/action-plan")
def generate_action_plan(request: GenAIRequest):
    """
    GenAI Layer: Consumes IoT, ML, and CV data to stream a personalized action plan.
    """
    prompt = f"""
    You are an Expert Agronomist AI. The farmer is currently growing '{request.crop}'.
    Recent computer vision scans indicate the crop condition is: '{request.disease}'.
    Current IoT Telemetry:
    - Temperature: {request.sensor_data.get('temperature', 25.0):.1f}°C
    - Humidity: {request.sensor_data.get('humidity', 60.0):.1f}%
    - Soil pH: {request.sensor_data.get('ph', 6.5)}
    
    Provide a highly technical, robust 3-bullet-point survival guide/action plan.
    Format your response purely as the 3 bullet points, using markdown. No extra fluff.
    """
    
    try:
        if model:
            response = model.generate_content(prompt)
            plan = response.text
        else:
            raise Exception("Model not initialized (Missing API Key)")
    except Exception as e:
        # Fallback plan if GenAI fails or no API key is provided
        plan = f"""
        * **Irrigation Adjustment**: Modify watering schedule due to {request.sensor_data.get('humidity', 60):.1f}% humidity.
        * **Disease Mitigation**: Immediate isolation and fungicide treatment targeted at '{request.disease}'.
        * **Nutrient Balancing**: Monitor pH levels strictly around {request.sensor_data.get('ph', 6.5)} to prevent nutrient lockout.
        """
        
    return {"status": "success", "action_plan": plan.strip()}
