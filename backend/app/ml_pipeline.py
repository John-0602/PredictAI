import os
import math
import json
import uuid
from datetime import datetime
import joblib
import pandas as pd
import numpy as np
from app.config import MODELS_DIR, DATASET_PATH
from app.database import get_db

class MLPipelineService:
    def __init__(self):
        self.models = {}
        self.metrics = {}
        self.load_models()
        self.load_metrics()

    def load_models(self):
        model_names = ['logistic_regression', 'decision_tree', 'random_forest', 'gradient_boosting']
        for name in model_names:
            path = os.path.join(MODELS_DIR, f"{name}_pipeline.joblib")
            if os.path.exists(path):
                try:
                    self.models[name] = joblib.load(path)
                    print(f"Loaded ML model pipeline: {name}")
                except Exception as e:
                    print(f"Error loading {name}: {e}")
            else:
                print(f"Model file not found: {path}")

    def load_metrics(self):
        metrics_file = os.path.join(MODELS_DIR, "evaluation_metrics.json")
        if os.path.exists(metrics_file):
            try:
                with open(metrics_file, "r") as f:
                    self.metrics = json.load(f)
            except Exception as e:
                print(f"Error loading evaluation metrics: {e}")
                self.metrics = {}

    def get_active_model_name(self) -> str:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'active_model'")
        row = cursor.fetchone()
        conn.close()
        if row and row['value'] in self.models:
            return row['value']
        return self.metrics.get('best_model', 'gradient_boosting')

    def set_active_model_name(self, model_name: str) -> bool:
        if model_name not in self.models:
            return False
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('active_model', ?)", (model_name,))
        conn.commit()
        conn.close()
        return True

    def calculate_engineered_features(self, machine_type: str, air_temp: float, process_temp: float,
                                      rot_speed: float, torque: float, tool_wear: float):
        temp_diff = process_temp - air_temp
        power_w = rot_speed * (2 * math.pi / 60.0) * torque
        overstrain = tool_wear * torque
        return {
            'Type': machine_type,
            'Air temperature [K]': air_temp,
            'Process temperature [K]': process_temp,
            'Rotational speed [rpm]': rot_speed,
            'Torque [Nm]': torque,
            'Tool wear [min]': tool_wear,
            'Temp_difference': temp_diff,
            'Power_W': power_w,
            'Tool_overstrain': overstrain
        }

    def evaluate_failure_modes(self, machine_type: str, air_temp: float, process_temp: float,
                               rot_speed: float, torque: float, tool_wear: float):
        """
        Evaluate physics-based failure mechanisms (Matzka 2020):
        1. Tool Wear Failure (TWF): Tool wear reaches critical fatigue zone (>= 200 min).
        2. Heat Dissipation Failure (HDF): Difference between air and process temp < 8.6 K AND rotational speed < 1380 rpm.
        3. Power Failure (PWF): Mechanical power < 3500 W or > 9000 W.
        4. Overstrain Failure (OSF): Overstrain product exceeds capacity for machine type:
           L: > 11,000 min*Nm, M: > 12,000 min*Nm, H: > 13,000 min*Nm.
        5. Random Failure (RNF): Uncorrelated stochastic component.
        """
        temp_diff = process_temp - air_temp
        power_w = rot_speed * (2 * math.pi / 60.0) * torque
        overstrain = tool_wear * torque
        
        diagnostics = []
        
        # 1. TWF
        if tool_wear >= 220:
            twf_risk = "High"
            twf_desc = f"Critical tool wear reached ({tool_wear:.1f} min >= 220 min threshold). High risk of micro-fracture and surface chatter."
        elif tool_wear >= 180:
            twf_risk = "Medium"
            twf_desc = f"Elevated tool wear ({tool_wear:.1f} min). Tool is approaching end-of-life operating envelope."
        else:
            twf_risk = "Low"
            twf_desc = f"Tool wear ({tool_wear:.1f} min) is within safe operational limits."
        diagnostics.append({"mode": "TWF", "name": "Tool Wear Failure", "risk_level": twf_risk, "explanation": twf_desc})

        # 2. HDF
        if temp_diff < 8.6 and rot_speed < 1380:
            hdf_risk = "High"
            hdf_desc = f"Critical heat dissipation conditions: temperature gradient {temp_diff:.2f} K (< 8.6 K) at low airflow speed {rot_speed:.0f} RPM (< 1380 RPM)."
        elif temp_diff < 9.0 or rot_speed < 1400:
            hdf_risk = "Medium"
            hdf_desc = f"Reduced thermal dissipation margin: temperature gradient is {temp_diff:.2f} K."
        else:
            hdf_risk = "Low"
            hdf_desc = f"Thermal gradient ({temp_diff:.2f} K) and convective cooling velocity are adequate."
        diagnostics.append({"mode": "HDF", "name": "Heat Dissipation Failure", "risk_level": hdf_risk, "explanation": hdf_desc})

        # 3. PWF
        if power_w < 3500:
            pwf_risk = "High"
            pwf_desc = f"Under-power stall condition: mechanical power {power_w:.0f} W is below minimum drive envelope (< 3500 W)."
        elif power_w > 9000:
            pwf_risk = "High"
            pwf_desc = f"Over-power surge condition: mechanical power {power_w:.0f} W exceeds continuous rating (> 9000 W)."
        elif power_w < 4000 or power_w > 8200:
            pwf_risk = "Medium"
            pwf_desc = f"Borderline spindle power ({power_w:.0f} W) operating near extreme drive boundaries."
        else:
            pwf_risk = "Low"
            pwf_desc = f"Power output ({power_w:.0f} W) is within balanced operational range (3500W - 9000W)."
        diagnostics.append({"mode": "PWF", "name": "Power Failure", "risk_level": pwf_risk, "explanation": pwf_desc})

        # 4. OSF
        osf_limit = 11000 if machine_type == 'L' else (12000 if machine_type == 'M' else 13000)
        if overstrain > osf_limit:
            osf_risk = "High"
            osf_desc = f"Structural overstrain exceeded: {overstrain:.0f} min*Nm exceeds type {machine_type} tolerance ({osf_limit} min*Nm)."
        elif overstrain > osf_limit * 0.85:
            osf_risk = "Medium"
            osf_desc = f"High mechanical stress: overstrain is {overstrain:.0f} min*Nm ({round(overstrain/osf_limit*100)}% of max)."
        else:
            osf_risk = "Low"
            osf_desc = f"Overstrain load ({overstrain:.0f} min*Nm) is safely below maximum limit ({osf_limit} min*Nm)."
        diagnostics.append({"mode": "OSF", "name": "Overstrain Failure", "risk_level": osf_risk, "explanation": osf_desc})

        # 5. RNF
        diagnostics.append({
            "mode": "RNF",
            "name": "Random Failure",
            "risk_level": "Low",
            "explanation": "Random failure probability is nominal (~0.1%). No anomaly correlates with random component defects."
        })

        return diagnostics

    def compute_contributing_factors(self, data_dict: dict, global_importance: dict) -> list:
        """
        Evaluate individual sensor deviations from typical nominal safe baselines.
        Nominal baselines:
        - Air temp: 300 K (nominal range 295 - 303 K)
        - Process temp: 310 K (nominal range 305 - 313 K)
        - Rotational speed: 1538 RPM (nominal range 1400 - 1700 RPM)
        - Torque: 40 Nm (nominal range 20 - 55 Nm)
        - Tool wear: 50 min (nominal safe range < 150 min)
        - Temp diff: 10 K (healthy >= 9 K)
        - Power: 6000 W (safe 4000 - 8000 W)
        - Tool overstrain: 2000 min*Nm (safe < 9000 min*Nm)
        """
        factors = []
        
        # Tool wear
        tw = data_dict['Tool wear [min]']
        tw_status = "Critical" if tw >= 210 else ("Warning" if tw >= 160 else "Normal")
        tw_impact = "High Risk" if tw >= 160 else "Safe"
        factors.append({
            "feature": "Tool wear [min]",
            "label": "Tool Wear Duration",
            "observed_value": round(tw, 1),
            "unit": "min",
            "status": tw_status,
            "impact": tw_impact,
            "importance_weight": global_importance.get("Tool wear [min]", 0.20),
            "description": f"Tool has accumulated {tw:.0f} minutes of cut time (Service warning at 160 min, limit at 220 min)."
        })

        # Torque
        trq = data_dict['Torque [Nm]']
        trq_status = "Critical" if trq > 65 or trq < 15 else ("Warning" if trq > 55 or trq < 20 else "Normal")
        trq_impact = "High Risk" if trq_status != "Normal" else "Safe"
        factors.append({
            "feature": "Torque [Nm]",
            "label": "Spindle Torque",
            "observed_value": round(trq, 1),
            "unit": "Nm",
            "status": trq_status,
            "impact": trq_impact,
            "importance_weight": global_importance.get("Torque [Nm]", 0.22),
            "description": f"Applied cutting torque is {trq:.1f} Nm (Nominal range: 25 - 55 Nm)."
        })

        # Rotational speed
        rpm = data_dict['Rotational speed [rpm]']
        rpm_status = "Critical" if rpm < 1350 or rpm > 2600 else ("Warning" if rpm < 1400 or rpm > 2200 else "Normal")
        rpm_impact = "High Risk" if rpm_status != "Normal" else "Safe"
        factors.append({
            "feature": "Rotational speed [rpm]",
            "label": "Rotational Speed",
            "observed_value": round(rpm, 1),
            "unit": "RPM",
            "status": rpm_status,
            "impact": rpm_impact,
            "importance_weight": global_importance.get("Rotational speed [rpm]", 0.18),
            "description": f"Spindle rotational velocity is {rpm:.0f} RPM (Standard operational zone: 1400 - 1800 RPM)."
        })

        # Temp difference
        tdiff = data_dict['Temp_difference']
        tdiff_status = "Critical" if tdiff < 8.6 else ("Warning" if tdiff < 9.2 else "Normal")
        tdiff_impact = "High Risk" if tdiff_status != "Normal" else "Safe"
        factors.append({
            "feature": "Temp_difference",
            "label": "Temperature Gradient (\u0394T)",
            "observed_value": round(tdiff, 2),
            "unit": "K",
            "status": tdiff_status,
            "impact": tdiff_impact,
            "importance_weight": global_importance.get("Temp_difference", 0.15),
            "description": f"Cooling temperature delta is {tdiff:.2f} K (Heat dissipation failure hazard below 8.6 K)."
        })

        # Tool Overstrain
        os = data_dict['Tool_overstrain']
        os_status = "Critical" if os > 11000 else ("Warning" if os > 9000 else "Normal")
        os_impact = "High Risk" if os_status != "Normal" else "Safe"
        factors.append({
            "feature": "Tool_overstrain",
            "label": "Overstrain Factor (Wear \u00d7 Torque)",
            "observed_value": round(os, 0),
            "unit": "min\u00b7Nm",
            "status": os_status,
            "impact": os_impact,
            "importance_weight": global_importance.get("Tool_overstrain", 0.16),
            "description": f"Combined mechanical load factor is {os:.0f} min\u00b7Nm."
        })

        # Power
        pwr = data_dict['Power_W']
        pwr_status = "Critical" if pwr < 3500 or pwr > 9000 else ("Warning" if pwr < 4000 or pwr > 8500 else "Normal")
        pwr_impact = "High Risk" if pwr_status != "Normal" else "Safe"
        factors.append({
            "feature": "Power_W",
            "label": "Spindle Power",
            "observed_value": round(pwr, 0),
            "unit": "W",
            "status": pwr_status,
            "impact": pwr_impact,
            "importance_weight": global_importance.get("Power_W", 0.12),
            "description": f"Effective motor output power is {pwr:.0f} Watts (Allowed envelope: 3500 W - 9000 W)."
        })

        return sorted(factors, key=lambda x: (x['status'] == 'Critical', x['status'] == 'Warning', x['importance_weight']), reverse=True)

    def determine_recommendation(self, risk_level: str, failure_modes: list, factors: list) -> str:
        high_modes = [m['mode'] for m in failure_modes if m['risk_level'] == 'High']
        
        if "TWF" in high_modes:
            return "IMMEDIATE TOOL REPLACEMENT: Tool wear has exceeded critical endurance. Halt machining cycle and swap cutting insert to prevent workpiece damage or tool breakage."
        if "HDF" in high_modes:
            return "URGENT THERMAL MAINTENANCE: Thermal dissipation is inadequate. Check coolant flow rate, inspect heat exchanger radiators for debris, and verify spindle cooling fan operation."
        if "PWF" in high_modes:
            return "ELECTRICAL/DRIVE INSPECTION: Machine is operating outside safe motor power boundaries. Inspect VFD controller, verify electrical supply voltage, and check spindle bearings for mechanical binding."
        if "OSF" in high_modes:
            return "OVERSTRAIN MITIGATION: Mechanical stress exceeds maximum rating. Reduce feed rate or depth of cut, replace worn tool, and verify workpiece material hardness."
        if risk_level in ["High Risk", "Critical Risk"]:
            return "PREVENTATIVE INSPECTION: Overall anomaly probability is high. Schedule a comprehensive diagnostic inspection before starting the next production batch."
        if risk_level == "Medium Risk":
            return "CONDITION MONITORING: Elevated parameter detected. Increase sampling frequency and inspect machine during the next planned shift change."
        return "NORMAL OPERATION: All operational parameters are within safe nominal envelopes. Continue standard preventative maintenance schedule."

    def predict(self, machine_type: str, air_temp: float, process_temp: float,
                rot_speed: float, torque: float, tool_wear: float,
                model_name: str = None, notes: str = "") -> dict:
        if not model_name:
            model_name = self.get_active_model_name()
            
        if model_name not in self.models:
            model_name = self.metrics.get('best_model', 'gradient_boosting')
            
        pipeline = self.models[model_name]
        
        # Prepare input with engineered features
        engineered = self.calculate_engineered_features(
            machine_type, air_temp, process_temp, rot_speed, torque, tool_wear
        )
        
        df_input = pd.DataFrame([engineered])
        
        # Predict probability
        if hasattr(pipeline.named_steps['classifier'], 'predict_proba'):
            proba = float(pipeline.predict_proba(df_input)[0][1])
        else:
            proba = float(pipeline.predict(df_input)[0])
            
        # Get threshold from settings
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = 'risk_threshold'")
        row = cursor.fetchone()
        conn.close()
        threshold = float(row['value']) if row else 0.35
        
        # Evaluate physics-based modes
        failure_modes = self.evaluate_failure_modes(
            machine_type, air_temp, process_temp, rot_speed, torque, tool_wear
        )
        has_physical_high = any(m['risk_level'] == 'High' for m in failure_modes if m['mode'] != 'RNF')
        
        # Binary prediction (combination of ML threshold and physical checks)
        raw_pred = int(pipeline.predict(df_input)[0])
        final_prediction = 1 if (proba >= threshold or raw_pred == 1 or has_physical_high) else 0
        
        # Determine risk level
        effective_score = max(proba, 0.85 if has_physical_high else proba)
        if effective_score >= 0.70:
            risk_level = "Critical Risk"
        elif effective_score >= 0.40:
            risk_level = "High Risk"
        elif effective_score >= 0.15:
            risk_level = "Medium Risk"
        else:
            risk_level = "Low Risk"
            
        # Model feature importance
        model_metrics = self.metrics.get("models", {}).get(model_name, {})
        global_importance = model_metrics.get("feature_importance", {})
        
        contributing_factors = self.compute_contributing_factors(engineered, global_importance)
        recommended_action = self.determine_recommendation(risk_level, failure_modes, contributing_factors)
        
        pred_id = f"PRED-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Save to database
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO predictions (
                prediction_id, timestamp, machine_type, air_temperature, process_temperature,
                rotational_speed, torque, tool_wear, prediction, failure_probability,
                risk_level, model_used, contributing_factors, recommended_action, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pred_id, timestamp, machine_type, air_temp, process_temp,
                rot_speed, torque, tool_wear, final_prediction, round(proba, 4),
                risk_level, model_name, json.dumps(contributing_factors), recommended_action, notes
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving prediction to database: {e}")
            
        return {
            "prediction_id": pred_id,
            "timestamp": timestamp,
            "machine_type": machine_type,
            "air_temperature": air_temp,
            "process_temperature": process_temp,
            "rotational_speed": rot_speed,
            "torque": torque,
            "tool_wear": tool_wear,
            "prediction": final_prediction,
            "failure_probability": round(proba, 4),
            "risk_level": risk_level,
            "model_used": model_metrics.get("name", model_name.replace('_', ' ').title()),
            "contributing_factors": contributing_factors,
            "failure_modes": failure_modes,
            "recommended_action": recommended_action,
            "disclaimer": "Predicted probability and risk assessment are decision-support insights derived from statistical learning and physical heuristics. They do not constitute an absolute operational guarantee."
        }

ml_service = MLPipelineService()
