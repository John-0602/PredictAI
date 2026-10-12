import io
import json
import csv
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.database import get_db

router = APIRouter(prefix="/api/history", tags=["Prediction History"])

@router.get("")
def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: str = Query(None, description="Filter: Low Risk, Medium Risk, High Risk, Critical Risk"),
    machine_type: str = Query(None, description="Filter: L, M, H"),
    prediction: int = Query(None, description="Filter: 0 or 1"),
    search: str = Query("", description="Search Prediction ID or notes")
):
    conn = get_db()
    cursor = conn.cursor()

    conditions = []
    params = []

    if risk_level:
        conditions.append("risk_level = ?")
        params.append(risk_level)
    if machine_type:
        conditions.append("machine_type = ?")
        params.append(machine_type.upper())
    if prediction is not None:
        conditions.append("prediction = ?")
        params.append(prediction)
    if search:
        conditions.append("(prediction_id LIKE ? OR notes LIKE ?)")
        params.append(f"%{search}%")
        params.append(f"%{search}%")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    # Total count
    cursor.execute(f"SELECT COUNT(*) as total FROM predictions {where_clause}", params)
    total = cursor.fetchone()["total"]

    # Paginated rows
    offset = (page - 1) * page_size
    query = f"""
    SELECT * FROM predictions
    {where_clause}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    """
    cursor.execute(query, params + [page_size, offset])
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        factors = []
        try:
            factors = json.loads(r["contributing_factors"])
        except Exception:
            pass
        items.append({
            "id": r["id"],
            "prediction_id": r["prediction_id"],
            "timestamp": r["timestamp"],
            "machine_type": r["machine_type"],
            "air_temperature": r["air_temperature"],
            "process_temperature": r["process_temperature"],
            "rotational_speed": r["rotational_speed"],
            "torque": r["torque"],
            "tool_wear": r["tool_wear"],
            "prediction": r["prediction"],
            "failure_probability": r["failure_probability"],
            "risk_level": r["risk_level"],
            "model_used": r["model_used"],
            "contributing_factors": factors,
            "recommended_action": r["recommended_action"],
            "notes": r["notes"]
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
        "items": items
    }

@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions WHERE prediction_id = ?", (prediction_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found.")
    return {"message": f"Prediction {prediction_id} deleted successfully."}

@router.delete("")
def clear_all_history():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions")
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return {"message": f"Cleared {deleted} prediction records."}

@router.get("/export")
def export_history_csv():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Prediction ID", "Timestamp", "Machine Type", "Air Temp (K)",
        "Process Temp (K)", "Rotational Speed (RPM)", "Torque (Nm)",
        "Tool Wear (min)", "Prediction", "Failure Probability",
        "Risk Level", "Model Used", "Recommended Action", "Notes"
    ])

    for r in rows:
        writer.writerow([
            r["prediction_id"], r["timestamp"], r["machine_type"],
            r["air_temperature"], r["process_temperature"],
            r["rotational_speed"], r["torque"], r["tool_wear"],
            r["prediction"], r["failure_probability"],
            r["risk_level"], r["model_used"], r["recommended_action"],
            r["notes"]
        ])

    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=predictai_prediction_history.csv"
    return response
