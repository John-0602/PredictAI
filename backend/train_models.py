import os
import json
import math
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve
)

def add_engineered_features(df):
    """
    Compute physics-informed engineering features inspired by Matzka (2020):
    1. Temp_difference = Process temperature [K] - Air temperature [K]
    2. Power_W = Rotational speed [rpm] * (2 * pi / 60) * Torque [Nm]
    3. Tool_overstrain = Tool wear [min] * Torque [Nm]
    """
    df = df.copy()
    temp_diff = df['Process temperature [K]'] - df['Air temperature [K]']
    # Power in Watts = omega (rad/s) * torque = (rpm * 2 * pi / 60) * torque
    power = df['Rotational speed [rpm]'] * (2 * math.pi / 60.0) * df['Torque [Nm]']
    overstrain = df['Tool wear [min]'] * df['Torque [Nm]']
    
    df['Temp_difference'] = temp_diff
    df['Power_W'] = power
    df['Tool_overstrain'] = overstrain
    return df

def train_and_evaluate():
    print("Loading dataset...")
    data_path = os.path.join(os.path.dirname(__file__), "..", "ai4i2020.csv")
    if not os.path.exists(data_path):
        data_path = "ai4i2020.csv"
        
    df_raw = pd.read_csv(data_path)
    print(f"Dataset shape: {df_raw.shape}")
    
    # Feature engineering
    df_feat = add_engineered_features(df_raw)
    
    feature_cols = [
        'Type',
        'Air temperature [K]',
        'Process temperature [K]',
        'Rotational speed [rpm]',
        'Torque [Nm]',
        'Tool wear [min]',
        'Temp_difference',
        'Power_W',
        'Tool_overstrain'
    ]
    target_col = 'Machine failure'
    
    X = df_feat[feature_cols]
    y = df_feat[target_col]
    
    # Train-test split (80-20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)} (Failures: {y_train.sum()})")
    print(f"Test samples: {len(X_test)} (Failures: {y_test.sum()})")
    
    cat_features = ['Type']
    num_features = [c for c in feature_cols if c != 'Type']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(categories=[['L', 'M', 'H']], handle_unknown='ignore'), cat_features),
            ('num', StandardScaler(), num_features)
        ],
        remainder='drop'
    )
    
    # Prepare transformed feature names
    # Cat produces Type_L, Type_M, Type_H
    encoded_feature_names = ['Type_L', 'Type_M', 'Type_H'] + num_features
    
    models = {
        'logistic_regression': LogisticRegression(
            class_weight='balanced', max_iter=1000, random_state=42
        ),
        'decision_tree': DecisionTreeClassifier(
            max_depth=6, class_weight='balanced', random_state=42
        ),
        'random_forest': RandomForestClassifier(
            n_estimators=150, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1
        ),
        'gradient_boosting': GradientBoostingClassifier(
            n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42
        )
    }
    
    results = {}
    saved_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(saved_dir, exist_ok=True)
    
    for name, clf in models.items():
        print(f"--- Training {name} ---")
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        
        pipeline.fit(X_train, y_train)
        
        # Predictions & Probabilities
        y_pred = pipeline.predict(X_test)
        if hasattr(pipeline.named_steps['classifier'], 'predict_proba'):
            y_proba = pipeline.predict_proba(X_test)[:, 1]
        else:
            y_proba = pipeline.decision_function(X_test)
            
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_proba)
        
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        # ROC curve sampling
        fpr_raw, tpr_raw, thresholds_roc = roc_curve(y_test, y_proba)
        # Downsample for JSON chart display
        sample_indices = np.linspace(0, len(fpr_raw) - 1, min(40, len(fpr_raw)), dtype=int)
        roc_points = [
            {"fpr": round(float(fpr_raw[i]), 4), "tpr": round(float(tpr_raw[i]), 4)}
            for i in sample_indices
        ]
        
        # PR curve sampling
        prec_raw, rec_raw, _ = precision_recall_curve(y_test, y_proba)
        sample_pr_indices = np.linspace(0, len(prec_raw) - 1, min(40, len(prec_raw)), dtype=int)
        pr_points = [
            {"precision": round(float(prec_raw[i]), 4), "recall": round(float(rec_raw[i]), 4)}
            for i in sample_pr_indices
        ]
        
        # Feature importances / coefficients
        feature_importance = {}
        fitted_clf = pipeline.named_steps['classifier']
        if hasattr(fitted_clf, 'feature_importances_'):
            importances = fitted_clf.feature_importances_
            for fname, imp in zip(encoded_feature_names, importances):
                feature_importance[fname] = round(float(imp), 4)
        elif hasattr(fitted_clf, 'coef_'):
            coefs = np.abs(fitted_clf.coef_[0])
            for fname, coef in zip(encoded_feature_names, coefs):
                feature_importance[fname] = round(float(coef), 4)
                
        results[name] = {
            "name": name.replace('_', ' ').title(),
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": {
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn),
                "true_positive": int(tp)
            },
            "roc_curve": roc_points,
            "pr_curve": pr_points,
            "feature_importance": feature_importance
        }
        
        # Save model pipeline
        model_filepath = os.path.join(saved_dir, f"{name}_pipeline.joblib")
        joblib.dump(pipeline, model_filepath)
        print(f"Saved {name} to {model_filepath}")
        print(f"Metrics: Acc={acc:.4f}, Prec={prec:.4f}, Recall={rec:.4f}, F1={f1:.4f}, ROC-AUC={roc_auc:.4f}")
        
    # Determine best model based on F1-Score & Recall (Cost of False Negatives in industrial machinery)
    best_model_name = max(results.keys(), key=lambda k: results[k]['f1_score'])
    
    summary_data = {
        "best_model": best_model_name,
        "models": results,
        "feature_names": encoded_feature_names,
        "dataset_stats": {
            "total_records": len(df_raw),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "failure_count": int(df_raw['Machine failure'].sum()),
            "failure_rate": round(float(df_raw['Machine failure'].mean() * 100), 2)
        }
    }
    
    metrics_path = os.path.join(saved_dir, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(summary_data, f, indent=2)
    print(f"\nAll models saved. Best model: {best_model_name}")
    print(f"Evaluation metrics written to {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()
