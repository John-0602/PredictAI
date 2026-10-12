from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PredictionInput(BaseModel):
    machine_type: str = Field(..., description="Machine quality variant: L (Low), M (Medium), H (High)", example="M")
    air_temperature: float = Field(..., description="Air temperature in Kelvin [K]", ge=250.0, le=350.0, example=298.5)
    process_temperature: float = Field(..., description="Process temperature in Kelvin [K]", ge=250.0, le=350.0, example=308.8)
    rotational_speed: float = Field(..., description="Rotational speed in RPM", ge=500.0, le=4000.0, example=1500.0)
    torque: float = Field(..., description="Torque in Newton-meters [Nm]", ge=0.0, le=150.0, example=42.0)
    tool_wear: float = Field(..., description="Tool wear in minutes [min]", ge=0.0, le=500.0, example=65.0)
    model_name: Optional[str] = Field(None, description="Model to use (optional, defaults to active system model)")
    notes: Optional[str] = Field("", description="Optional technician notes or machine asset tag")

class ContributingFactor(BaseModel):
    feature: str
    label: str
    observed_value: float
    unit: str
    status: str # "Normal", "Warning", "Critical"
    impact: str # "Positive" or "Negative" risk contribution
    importance_weight: float
    description: str

class FailureModeDiagnostic(BaseModel):
    mode: str
    name: str
    risk_level: str # Low, Medium, High
    explanation: str

class PredictionResult(BaseModel):
    prediction_id: str
    timestamp: str
    machine_type: str
    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float
    prediction: int # 0 or 1
    failure_probability: float
    risk_level: str # "Low Risk", "Medium Risk", "High Risk", "Critical Risk"
    model_used: str
    contributing_factors: List[ContributingFactor]
    failure_modes: List[FailureModeDiagnostic]
    recommended_action: str
    disclaimer: str

class TaskCreate(BaseModel):
    machine_id: str
    title: str
    failure_mode: Optional[str] = "General"
    priority: str = "Medium" # Low, Medium, High, Critical
    status: Optional[str] = "Pending"
    assigned_to: Optional[str] = "Maintenance Technician"
    notes: Optional[str] = ""
    due_date: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    failure_mode: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[str] = None

class ModelSwitchRequest(BaseModel):
    model_name: str
