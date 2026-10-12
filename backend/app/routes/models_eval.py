from fastapi import APIRouter, HTTPException
from app.ml_pipeline import ml_service
from app.schemas import ModelSwitchRequest

router = APIRouter(prefix="/api/models", tags=["Models & Evaluation"])

@router.get("/comparison")
def get_model_comparison():
    try:
        active_model = ml_service.get_active_model_name()
        metrics = ml_service.metrics
        return {
            "active_model": active_model,
            "best_model": metrics.get("best_model", "gradient_boosting"),
            "models": metrics.get("models", {}),
            "feature_names": metrics.get("feature_names", []),
            "dataset_stats": metrics.get("dataset_stats", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
def get_active_model():
    return {
        "active_model": ml_service.get_active_model_name(),
        "available_models": list(ml_service.models.keys())
    }

@router.post("/active")
def set_active_model(payload: ModelSwitchRequest):
    success = ml_service.set_active_model_name(payload.model_name)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{payload.model_name}' not available. Choose from: {list(ml_service.models.keys())}"
        )
    return {
        "status": "success",
        "active_model": payload.model_name,
        "message": f"Active prediction model successfully switched to {payload.model_name}."
    }
