import io
import csv
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas import PredictionInput, PredictionResult
from app.ml_pipeline import ml_service

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResult)
def predict_machine_failure(payload: PredictionInput):
    try:
        result = ml_service.predict(
            machine_type=payload.machine_type.upper(),
            air_temp=payload.air_temperature,
            process_temp=payload.process_temperature,
            rot_speed=payload.rotational_speed,
            torque=payload.torque,
            tool_wear=payload.tool_wear,
            model_name=payload.model_name,
            notes=payload.notes or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch")
async def batch_predict(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for batch prediction.")

    try:
        contents = await file.read()
        text = contents.decode('utf-8', errors='ignore')
        reader = csv.DictReader(io.StringIO(text))
        
        # Check required columns
        req_keys = ['Type', 'Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]']
        
        # Check fieldnames case-insensitively or with variations
        headers = {h.strip(): h for h in reader.fieldnames or []}
        
        # Mapping flexibility
        def find_header(candidates):
            for c in candidates:
                for h in headers:
                    if c.lower() in h.lower():
                        return headers[h]
            return None

        col_type = find_header(['Type'])
        col_air = find_header(['Air temperature', 'Air temp'])
        col_proc = find_header(['Process temperature', 'Process temp'])
        col_speed = find_header(['Rotational speed', 'speed', 'rpm'])
        col_torque = find_header(['Torque'])
        col_tool = find_header(['Tool wear', 'toolwear'])

        if not all([col_type, col_air, col_proc, col_speed, col_torque, col_tool]):
            raise HTTPException(
                status_code=400,
                detail=f"CSV missing essential columns. Required columns: Type, Air temperature [K], Process temperature [K], Rotational speed [rpm], Torque [Nm], Tool wear [min]"
            )

        results = []
        normal_count = 0
        failure_count = 0
        critical_count = 0

        for idx, row in enumerate(reader):
            if idx >= 1000: # Limit batch size for responsiveness
                break
            try:
                m_type = str(row[col_type]).strip().upper()
                if m_type not in ['L', 'M', 'H']:
                    m_type = 'L'
                air_t = float(row[col_air])
                proc_t = float(row[col_proc])
                rpm = float(row[col_speed])
                trq = float(row[col_torque])
                tw = float(row[col_tool])

                pred_res = ml_service.predict(
                    machine_type=m_type,
                    air_temp=air_t,
                    process_temp=proc_t,
                    rot_speed=rpm,
                    torque=trq,
                    tool_wear=tw,
                    notes=f"Batch file: {file.filename} row {idx+1}"
                )

                if pred_res['prediction'] == 1:
                    failure_count += 1
                else:
                    normal_count += 1

                if pred_res['risk_level'] == "Critical Risk":
                    critical_count += 1

                results.append({
                    "row_index": idx + 1,
                    "machine_type": m_type,
                    "air_temperature": air_t,
                    "process_temperature": proc_t,
                    "rotational_speed": rpm,
                    "torque": trq,
                    "tool_wear": tw,
                    "prediction": pred_res['prediction'],
                    "failure_probability": pred_res['failure_probability'],
                    "risk_level": pred_res['risk_level'],
                    "recommended_action": pred_res['recommended_action']
                })
            except (ValueError, KeyError):
                continue

        return {
            "filename": file.filename,
            "total_processed": len(results),
            "normal_count": normal_count,
            "failure_count": failure_count,
            "critical_risk_count": critical_count,
            "failure_rate": round(failure_count / (len(results) or 1) * 100, 2),
            "predictions": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")
