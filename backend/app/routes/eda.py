from fastapi import APIRouter, HTTPException
from app.eda_service import eda_service

router = APIRouter(prefix="/api/eda", tags=["EDA & Analytics"])

@router.get("/distributions")
def get_distributions():
    try:
        return eda_service.get_distributions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlations")
def get_correlations():
    try:
        return eda_service.get_correlations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scatter")
def get_scatter_data(sample_size: int = 400):
    try:
        return eda_service.get_scatter_samples(sample_size=sample_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
