import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
    TWILIO_TO_NUMBER = os.getenv("TWILIO_TO_NUMBER")

settings = Settings()
