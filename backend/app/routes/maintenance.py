import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import TaskCreate, TaskUpdate

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

@router.get("/tasks")
def list_tasks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM maintenance_tasks ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    tasks = []
    for r in rows:
        tasks.append({
            "id": r["id"],
            "task_id": r["task_id"],
            "machine_id": r["machine_id"],
            "title": r["title"],
            "failure_mode": r["failure_mode"],
            "priority": r["priority"],
            "status": r["status"],
            "assigned_to": r["assigned_to"],
            "notes": r["notes"],
            "due_date": r["due_date"],
            "created_at": r["created_at"],
            "completed_at": r["completed_at"]
        })
    return tasks

@router.post("/tasks")
def create_task(payload: TaskCreate):
    conn = get_db()
    cursor = conn.cursor()
    task_id = f"TASK-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO maintenance_tasks (
        task_id, machine_id, title, failure_mode, priority, status, assigned_to, notes, due_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task_id, payload.machine_id, payload.title, payload.failure_mode or "General",
        payload.priority, payload.status or "Pending", payload.assigned_to or "Maintenance Technician",
        payload.notes or "", payload.due_date, now
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    return {
        "id": new_id,
        "task_id": task_id,
        "message": "Maintenance task created successfully."
    }

@router.put("/tasks/{task_id}")
def update_task(task_id: str, payload: TaskUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM maintenance_tasks WHERE task_id = ?", (task_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found.")

    update_fields = []
    values = []

    if payload.title is not None:
        update_fields.append("title = ?")
        values.append(payload.title)
    if payload.failure_mode is not None:
        update_fields.append("failure_mode = ?")
        values.append(payload.failure_mode)
    if payload.priority is not None:
        update_fields.append("priority = ?")
        values.append(payload.priority)
    if payload.status is not None:
        update_fields.append("status = ?")
        values.append(payload.status)
        if payload.status == "Completed" and not existing["completed_at"]:
            update_fields.append("completed_at = ?")
            values.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        elif payload.status != "Completed":
            update_fields.append("completed_at = NULL")
    if payload.assigned_to is not None:
        update_fields.append("assigned_to = ?")
        values.append(payload.assigned_to)
    if payload.notes is not None:
        update_fields.append("notes = ?")
        values.append(payload.notes)
    if payload.due_date is not None:
        update_fields.append("due_date = ?")
        values.append(payload.due_date)

    if not update_fields:
        conn.close()
        return {"message": "No changes requested."}

    values.append(task_id)
    sql = f"UPDATE maintenance_tasks SET {', '.join(update_fields)} WHERE task_id = ?"
    cursor.execute(sql, values)
    conn.commit()
    conn.close()

    return {"message": f"Task {task_id} updated successfully."}

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM maintenance_tasks WHERE task_id = ?", (task_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found.")
    return {"message": f"Task {task_id} deleted."}

@router.get("/recommendations")
def get_recommendations_summary():
    conn = get_db()
    cursor = conn.cursor()
    # Fetch recent high-risk predictions
    cursor.execute("""
    SELECT * FROM predictions
    WHERE risk_level IN ('High Risk', 'Critical Risk')
    ORDER BY id DESC LIMIT 5
    """)
    high_risks = cursor.fetchall()
    conn.close()

    recent_critical_actions = []
    for r in high_risks:
        recent_critical_actions.append({
            "prediction_id": r["prediction_id"],
            "machine_type": r["machine_type"],
            "timestamp": r["timestamp"],
            "risk_level": r["risk_level"],
            "action": r["recommended_action"],
            "tool_wear": r["tool_wear"],
            "torque": r["torque"],
            "rotational_speed": r["rotational_speed"]
        })

    return {
        "standard_guidelines": [
            {
                "subsystem": "Tooling & Cutters (TWF)",
                "interval": "Every 150-180 operational minutes",
                "trigger_condition": "Tool wear >= 180 min or severe surface roughness",
                "prescribed_action": "Exchange indexable carbide inserts, recalibrate zero-datum probe."
            },
            {
                "subsystem": "Cooling Loop & Radiator (HDF)",
                "interval": "Weekly or on thermal gradient < 9.0 K",
                "trigger_condition": "ΔT < 8.6 K at rotational speed < 1380 RPM",
                "prescribed_action": "Flush coolant reservoir, clean particulate filters, blow out radiator cooling fins."
            },
            {
                "subsystem": "Spindle Motor & VFD (PWF)",
                "interval": "Monthly or on power anomaly",
                "trigger_condition": "Power < 3500 W (Stall) or > 9000 W (Surge)",
                "prescribed_action": "Perform insulation resistance check, verify VFD current limit and bearing runout."
            },
            {
                "subsystem": "Mechanical Transmission (OSF)",
                "interval": "Continuous telemetry threshold check",
                "trigger_condition": "Wear × Torque product > 11,000 (L), 12,000 (M), 13,000 (H)",
                "prescribed_action": "Throttle feed rate, inspect ballscrew back-lash, lubricate guideways."
            }
        ],
        "recent_critical_alerts": recent_critical_actions
    }
