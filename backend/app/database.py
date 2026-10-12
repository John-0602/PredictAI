import sqlite3
import json
from datetime import datetime
from app.config import DB_PATH

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_id TEXT UNIQUE NOT NULL,
        timestamp TEXT NOT NULL,
        machine_type TEXT NOT NULL,
        air_temperature REAL NOT NULL,
        process_temperature REAL NOT NULL,
        rotational_speed REAL NOT NULL,
        torque REAL NOT NULL,
        tool_wear REAL NOT NULL,
        prediction INTEGER NOT NULL,
        failure_probability REAL NOT NULL,
        risk_level TEXT NOT NULL,
        model_used TEXT NOT NULL,
        contributing_factors TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        notes TEXT DEFAULT ''
    )
    """)
    
    # Maintenance tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT UNIQUE NOT NULL,
        machine_id TEXT NOT NULL,
        title TEXT NOT NULL,
        failure_mode TEXT DEFAULT 'General',
        priority TEXT NOT NULL, -- Low, Medium, High, Critical
        status TEXT NOT NULL DEFAULT 'Pending', -- Pending, In Progress, Completed
        assigned_to TEXT DEFAULT 'Maintenance Technician',
        notes TEXT DEFAULT '',
        due_date TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
    )
    """)
    
    # System settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)
    
    # Default settings if not exist
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('active_model', 'gradient_boosting')")
    cursor.execute("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('risk_threshold', '0.35')")
    
    # Seed initial maintenance tasks if empty
    cursor.execute("SELECT COUNT(*) as count FROM maintenance_tasks")
    count = cursor.fetchone()['count']
    if count == 0:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_tasks = [
            ("TASK-1001", "CNC-042", "Replace heavily worn milling tool insert", "Tool Wear Failure (TWF)", "Critical", "Pending", "Alex Mercer", "Tool wear exceeds 210 minutes threshold. High chatter detected.", "2026-10-14", now, None),
            ("TASK-1002", "LATHE-019", "Check spindle motor torque & bearing lubrication", "Power Failure (PWF)", "High", "In Progress", "Sarah Connor", "Torque spikes above 65 Nm observed at 1400 RPM.", "2026-10-15", now, None),
            ("TASK-1003", "PRESS-007", "Coolant system flushing and radiator fan check", "Heat Dissipation Failure (HDF)", "Medium", "Completed", "David Miller", "Cleaned secondary heat exchanger. Temperature gradient restored to 10.5 K.", "2026-10-10", now, now)
        ]
        cursor.executemany("""
        INSERT INTO maintenance_tasks (task_id, machine_id, title, failure_mode, priority, status, assigned_to, notes, due_date, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_tasks)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
