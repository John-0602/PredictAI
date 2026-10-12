from fastapi import APIRouter
from app.eda_service import eda_service
from app.database import get_db
from app.ml_pipeline import ml_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats():
    # Dataset historical stats
    ds_summary = eda_service.get_dataset_summary()
    
    # Live predictions stats from SQLite
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    live_total = cursor.fetchone()["total"]
    
    cursor.execute("SELECT COUNT(*) as cnt FROM predictions WHERE prediction = 1")
    live_failures = cursor.fetchone()["cnt"]
    
    cursor.execute("SELECT COUNT(*) as cnt FROM predictions WHERE risk_level = 'Critical Risk'")
    live_critical = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM predictions WHERE risk_level = 'High Risk'")
    live_high = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM predictions WHERE risk_level = 'Medium Risk'")
    live_medium = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM predictions WHERE risk_level = 'Low Risk'")
    live_low = cursor.fetchone()["cnt"]

    # Latest 5 live predictions
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT 5")
    recent_preds_rows = cursor.fetchall()

    # Maintenance task counts
    cursor.execute("SELECT COUNT(*) as open_tasks FROM maintenance_tasks WHERE status != 'Completed'")
    open_tasks = cursor.fetchone()["open_tasks"]
    
    cursor.execute("SELECT COUNT(*) as critical_tasks FROM maintenance_tasks WHERE priority = 'Critical' AND status != 'Completed'")
    critical_tasks = cursor.fetchone()["critical_tasks"]

    conn.close()

    recent_predictions = []
    for r in recent_preds_rows:
        recent_predictions.append({
            "prediction_id": r["prediction_id"],
            "timestamp": r["timestamp"],
            "machine_type": r["machine_type"],
            "prediction": r["prediction"],
            "failure_probability": r["failure_probability"],
            "risk_level": r["risk_level"],
            "tool_wear": r["tool_wear"],
            "torque": r["torque"],
            "recommended_action": r["recommended_action"]
        })

    active_model = ml_service.get_active_model_name()
    best_model = ml_service.metrics.get("best_model", "gradient_boosting")

    return {
        "dataset_historical": {
            "total_records": ds_summary["total_records"],
            "total_failures": ds_summary["total_failures"],
            "failure_rate": ds_summary["failure_rate"],
            "type_distribution": ds_summary["type_distribution"],
            "failure_breakdown": ds_summary["failure_breakdown"]
        },
        "live_predictions": {
            "total_inferred": live_total,
            "failure_count": live_failures,
            "normal_count": live_total - live_failures,
            "critical_risk_count": live_critical,
            "high_risk_count": live_high,
            "medium_risk_count": live_medium,
            "low_risk_count": live_low,
            "recent_predictions": recent_predictions
        },
        "maintenance_summary": {
            "open_tasks": open_tasks,
            "critical_tasks": critical_tasks
        },
        "system_health": {
            "active_model": active_model,
            "best_model": best_model,
            "accuracy": ml_service.metrics.get("models", {}).get(active_model, {}).get("accuracy", 0.99),
            "f1_score": ml_service.metrics.get("models", {}).get(active_model, {}).get("f1_score", 0.87),
            "recall": ml_service.metrics.get("models", {}).get(active_model, {}).get("recall", 0.81)
        }
    }
