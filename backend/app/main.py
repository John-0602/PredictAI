from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.database import init_db
from app.routes import (
    predict,
    dataset,
    eda,
    models_eval,
    explainability,
    maintenance,
    history,
    dashboard
)

# Initialize database tables on startup
init_db()

app = FastAPI(
    title="PredictAI — Smart Predictive Maintenance API",
    description="Backend REST API for machine sensor failure prediction, EDA, model evaluation, and maintenance management.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route routers
app.include_router(dashboard.router)
app.include_router(predict.router)
app.include_router(dataset.router)
app.include_router(eda.router)
app.include_router(models_eval.router)
app.include_router(explainability.router)
app.include_router(maintenance.router)
app.include_router(history.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "PredictAI Backend",
        "version": "1.0.0"
    }
