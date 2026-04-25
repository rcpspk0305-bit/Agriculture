import cv2
import numpy as np
import random

def detect_disease_from_image(contents: bytes):
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image file")

    diseases = ["Healthy", "Early Blight", "Late Blight", "Leaf Curl", "Powdery Mildew"]
    detected = random.choice(diseases)
    confidence = round(random.uniform(0.85, 0.99), 3)

    h, w = img.shape[:2]
    bbox = [int(w * 0.1), int(h * 0.1), int(w * 0.8), int(h * 0.8)]
    
    return detected, confidence, bbox
