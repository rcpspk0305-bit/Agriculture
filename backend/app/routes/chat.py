from fastapi import APIRouter
from app.models.schemas import GenAIRequest
from app.services.llm_service import generate_action_plan

router = APIRouter()

@router.post("/chat/action-plan")
def action_plan_endpoint(request: GenAIRequest):
    plan = generate_action_plan(request)
    return {"status": "success", "action_plan": plan}
