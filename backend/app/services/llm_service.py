from app.models.schemas import GenAIRequest, ChatRequest
from app.core.config import settings

try:
    from google import genai
    from google.genai import types
except Exception:
    genai = None

client_model = None
if genai and settings.GEMINI_API_KEY:
    try:
        client_model = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print("Config Error:", e)
        client_model = None


async def generate_action_plan(request: GenAIRequest):
    prompt = f"""
You are an expert agronomist AI with deep knowledge of agriculture basics.
You know that for good water quality, Water TDS must be < 200. You also deeply understand Potassium Multinutrients NPK, Soil Moisture, and pH levels.

Crop: {request.crop}
Detected disease: {request.disease}
Temperature: {request.sensor_data.get('temperature', 25.0):.1f}°C
Moisture (Humidity): {request.sensor_data.get('humidity', 60.0):.1f}%
Soil pH: {request.sensor_data.get('ph', 6.5)}
Water TDS: {request.sensor_data.get('tds', 150.0):.1f}
NPK: N={request.sensor_data.get('N', 0)}, P={request.sensor_data.get('P', 0)}, K={request.sensor_data.get('K', 0)}

Given this data, analyze the soil and water health against the detected disease.
Provide exactly 3 short bullet points with practical guidance.
IMPORTANT: Your entire response must be written in {request.language}.
"""
    plan = None
    if client_model:
        try:
            # Notice the use of 'await' and 'client.aio'
            response = await client_model.aio.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            if response.candidates and response.candidates[0].content.parts:
                plan = response.text
        except Exception as e:
            print(f"Action Plan GenAI Error: {e}")

    if not plan:
        plan = (
            f"* Irrigation adjustment: reduce excess moisture exposure because humidity is {request.sensor_data.get('humidity', 60):.1f}%.\n"
            f"* Disease mitigation: isolate affected leaves and apply treatment for {request.disease}.\n"
            f"* Nutrient balancing: keep soil pH near {request.sensor_data.get('ph', 6.5)} and monitor nutrient uptake."
        )

    return plan.strip()


async def generate_chat_response(request: ChatRequest):
    config = types.GenerateContentConfig(
        system_instruction=f"You are KrishiNidhi, an expert AI Agronomist chatbot assisting farmers. Respond strictly in {request.language}."
    )
    
    formatted_contents = []
    if hasattr(request, 'history') and request.history:
        for msg in request.history:
            role = "user" if msg.get("role") == "user" else "model"
            formatted_contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=msg.get("text", ""))])
            )
            
    formatted_contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=request.message)])
    )
    
    response_text = "I'm sorry, I cannot connect to the AI model right now."
    if client_model:
        try:
            # Notice the use of 'await' and 'client.aio'
            response = await client_model.aio.models.generate_content(
                model="gemini-1.5-flash",
                contents=formatted_contents,
                config=config
            )
            if response.candidates and response.candidates[0].content.parts:
                response_text = response.text
        except Exception as e:
            print("Chat GenAI Error:", e)

    return response_text.strip()