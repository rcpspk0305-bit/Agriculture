import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import sensors, predict, chat
from app.services.mqtt_service import start_mqtt

app = FastAPI(title="AgriTech God-Mode API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors.router)
app.include_router(predict.router)
app.include_router(chat.router)

@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=start_mqtt, daemon=True)
    thread.start()

@app.get("/")
def root():
    return {"status": "ok", "message": "AgriTech backend is running"}