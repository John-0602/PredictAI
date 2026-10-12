from fastapi import APIRouter, HTTPException
from app.ml_pipeline import ml_service
from app.schemas import PredictionInput

router = APIRouter(prefix="/api/explainability", tags=["Explainability"])

@router.get("/global")
def get_global_feature_importance():
    try:
        metrics = ml_service.metrics.get("models", {})
        result = {}
        for m_key, m_val in metrics.items():
            result[m_key] = {
                "name": m_val.get("name", m_key),
                "importance": m_val.get("feature_importance", {})
            }
        return {
            "models_importance": result,
            "feature_descriptions": {
                "Tool_overstrain": "Composite mechanical stress product of Tool Wear and Cutting Torque (min·Nm)",
                "Torque [Nm]": "Resistance load opposing rotational cutter motion",
                "Rotational speed [rpm]": "Spindle rotational velocity governing cutting speed and heat generation",
                "Tool wear [min]": "Cumulative active cutting minutes of current milling insert",
                "Temp_difference": "Thermal gradient between workpiece process temperature and ambient air (K)",
                "Power_W": "Mechanical motor power output: Speed × Torque × (2π / 60)",
                "Air temperature [K]": "Ambient factory operating temperature",
                "Process temperature [K]": "Cutting zone contact temperature",
                "Type_L": "Low-quality variant (60% of dataset, highest overstrain failure rate)",
                "Type_M": "Medium-quality variant (30% of dataset)",
                "Type_H": "High-quality variant (10% of dataset, tightest tolerances)"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/local")
def explain_single_prediction(payload: PredictionInput):
    try:
        pred_res = ml_service.predict(
            machine_type=payload.machine_type.upper(),
            air_temp=payload.air_temperature,
            process_temp=payload.process_temperature,
            rot_speed=payload.rotational_speed,
            torque=payload.torque,
            tool_wear=payload.tool_wear,
            model_name=payload.model_name
        )
        return {
            "prediction_id": pred_res["prediction_id"],
            "prediction": pred_res["prediction"],
            "failure_probability": pred_res["failure_probability"],
            "risk_level": pred_res["risk_level"],
            "contributing_factors": pred_res["contributing_factors"],
            "failure_modes": pred_res["failure_modes"],
            "recommended_action": pred_res["recommended_action"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
def get_business_and_physical_insights():
    return {
        "summary": "Key empirical findings and physical relationships derived from AI4I 2020 dataset and trained classifiers.",
        "insights": [
            {
                "title": "Overstrain Failure (OSF) Mechanism",
                "category": "Mechanical Stress",
                "finding": "Tool overstrain (Torque × Tool Wear) is the single most dominant predictor of severe machine failure in both Random Forest and Gradient Boosting models.",
                "action": "Implement automatic feed rate throttling when tool wear exceeds 180 minutes to keep torque under 50 Nm."
            },
            {
                "title": "Thermal Dissipation Gradient (ΔT)",
                "category": "Thermodynamics",
                "finding": "Heat Dissipation Failure (HDF) occurs primarily when the difference between process and air temperature collapses below 8.6 K at rotational speeds below 1380 RPM.",
                "action": "Maintain forced air circulation and clean secondary cooling heat exchangers to maintain ΔT ≥ 10.0 K."
            },
            {
                "title": "Dual Boundary Power Failure (PWF)",
                "category": "Electrical Drive",
                "finding": "Power failure exhibits a bimodal risk envelope: motor stall risk occurs below 3,500 Watts while thermal over-torque overload occurs above 9,000 Watts.",
                "action": "Configure motor drive variable frequency controllers (VFD) with soft-stop alarms outside the 3,800–8,500 W safe corridor."
            },
            {
                "title": "Machine Quality Type Disparity",
                "category": "Material Quality",
                "finding": "Type L (Low quality) machines represent 60% of all deployed units and account for the largest proportion of tool wear and overstrain breakdowns.",
                "action": "Prioritize Type L assets for high-frequency sensor telemetry and schedule shorter maintenance intervals (every 160 tool minutes vs 200 min for Type H)."
            }
        ]
    }
