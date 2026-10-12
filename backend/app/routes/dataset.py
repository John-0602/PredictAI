import os
import io
import pandas as pd
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.eda_service import eda_service
from app.config import DATASET_PATH

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

@router.get("/summary")
def get_dataset_summary():
    try:
        return eda_service.get_dataset_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preview")
def get_dataset_preview(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search Product ID or UDI"),
    machine_type: str = Query(None, description="Filter Type L, M, H"),
    failure_only: bool = Query(None, description="Filter only failures")
):
    try:
        return eda_service.get_paginated_data(
            page=page,
            page_size=page_size,
            search=search,
            machine_type=machine_type,
            failure_only=failure_only
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download")
def download_cleaned_dataset():
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="Dataset file not found.")

    try:
        df = eda_service.df
        if df is None:
            df = pd.read_csv(DATASET_PATH)

        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=predictai_cleaned_features.csv"
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
