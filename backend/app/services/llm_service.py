from app.models.schemas import GenAIRequest
from app.core.config import settings

try:
    from google import genai
except Exception:
    genai = None

client_model = None
if genai and settings.GEMINI_API_KEY:
    try:
        client_model = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception:
        client_model = None

def generate_action_plan(request: GenAIRequest):
    prompt = f"""
You are an expert agronomist AI.
Crop: {request.crop}
Detected disease: {request.disease}
Temperature: {request.sensor_data.get('temperature', 25.0):.1f}°C
Humidity: {request.sensor_data.get('humidity', 60.0):.1f}%
Soil pH: {request.sensor_data.get('ph', 6.5)}
Give exactly 3 short bullet points with practical guidance.
"""
    plan = None
    try:
        if client_model and settings.GEMINI_API_KEY:
            response = client_model.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )
            plan = response.text
    except Exception:
        plan = None

    if not plan:
        plan = (
            f"* Irrigation adjustment: reduce excess moisture exposure because humidity is {request.sensor_data.get('humidity', 60):.1f}%.\n"
            f"* Disease mitigation: isolate affected leaves and apply treatment for {request.disease}.\n"
            f"* Nutrient balancing: keep soil pH near {request.sensor_data.get('ph', 6.5)} and monitor nutrient uptake."
        )

    return plan.strip()
