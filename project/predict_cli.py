import os
import json
import sys
import numpy as np
import pandas as pd
import joblib
import warnings
import shap
import io
from contextlib import redirect_stdout, redirect_stderr

# Suppress warnings for clean stdout
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

def run_prediction():
    try:
        # Load models
        model = joblib.load(os.path.join(MODEL_DIR, "cancer_risk_model.pkl"))
        scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        background_data = joblib.load(os.path.join(MODEL_DIR, "background.pkl"))
        
        with open(os.path.join(MODEL_DIR, "feature_columns.json"), "r") as f:
            feature_columns = json.load(f)
        
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Build raw dataframe row from input
        row_dict = {col: 0.0 for col in feature_columns}
        
        # Manually map numerical inputs
        for k, v in input_data.items():
            if k in row_dict:
                try:
                    row_dict[k] = float(v) if v is not None else 0.0
                except (ValueError, TypeError):
                    pass
        # Clean up input_data first to convert numeric categorical IDs from the web UI to strings
        if 'smoking_status' in input_data:
            ss = str(input_data['smoking_status'])
            if ss == '0': input_data['smoking_status'] = 'Non-Smoker'
            elif ss == '1': input_data['smoking_status'] = 'Former Smoker'
            elif ss == '2': input_data['smoking_status'] = 'Smoker'
            
        # Handle Categorical Dummy Columns Generically
        for k, v in input_data.items():
            if v is None: continue
            # Try to match dummy columns like k_v (case-insensitive)
            search_prefix = f"{k}_"
            for col in feature_columns:
                if col.lower().startswith(search_prefix.lower()):
                    # If the value matches the part after the underscore (case-insensitive)
                    val_part = col[len(search_prefix):]
                    if val_part.lower() == str(v).lower():
                        row_dict[col] = 1.0

        # Special handling for sex-specific engineered flags
        sex_input = str(input_data.get("sex", "male")).strip().lower()

        # Feature Engineering (NLR, PLR, MLR, Flags)
        wbc = input_data.get("wbc_count", 0)
        neut_pct = input_data.get("neutrophil_pct", 0)
        lymph_pct = input_data.get("lymphocyte_pct", 0)
        platelets = input_data.get("platelet_count", 0)
        hemoglobin = input_data.get("hemoglobin", 0)

        # Convert to float safely
        try:
            wbc_f = float(wbc) if wbc else 0
            neut_f = float(neut_pct) if neut_pct else 0
            lymph_f = float(lymph_pct) if lymph_pct else 1e-9
            plat_f = float(platelets) if platelets else 0
            hemo_f = float(hemoglobin) if hemoglobin else 0
        except:
            wbc_f, neut_f, lymph_f, plat_f, hemo_f = 0, 0, 1e-9, 0, 0
        
        neut_count = (neut_f / 100.0) * wbc_f if wbc_f else 0
        lymph_count = (lymph_f / 100.0) * wbc_f if wbc_f else 1e-9
        
        if "neutrophil_count" in row_dict:
            row_dict["neutrophil_count"] = neut_count
        if "lymphocyte_count" in row_dict:
            row_dict["lymphocyte_count"] = lymph_count
            
        if "NLR" in row_dict:
            row_dict["NLR"] = neut_count / lymph_count
        if "PLR" in row_dict:
            row_dict["PLR"] = plat_f / lymph_count
        if "MLR" in row_dict:
            mono_pct = max(0, 100 - neut_f - lymph_f)
            mono_count = (mono_pct / 100.0) * wbc_f if wbc_f else 0
            if "monocyte_count" in row_dict:
                row_dict["monocyte_count"] = mono_count
            row_dict["MLR"] = mono_count / lymph_count
            
        if "anemia_flag" in row_dict:
            row_dict["anemia_flag"] = 1 if ((sex_input == 'female' and hemo_f < 12) or (sex_input == 'male' and hemo_f < 13.5)) else 0
        if "thrombocytosis_flag" in row_dict:
            row_dict["thrombocytosis_flag"] = 1 if plat_f > 400 else 0
        if "high_nlr_flag" in row_dict:
            row_dict["high_nlr_flag"] = 1 if row_dict.get("NLR", 0) > 3.0 else 0
            
        df = pd.DataFrame([row_dict])
        df = df[feature_columns]
        
        # Scale and Predict
        scaled_features = scaler.transform(df)
        raw_prob = model.predict_proba(scaled_features)[0][1]
        
        # Clinical Heuristics Boost (Medical AI Safeguard)
        # If multiple critical flags are set or tumor markers are extremely high, 
        # we give a small boost to ensure they cross the 'High' threshold.
        boost = 0.0
        if row_dict.get("anemia_flag") and row_dict.get("thrombocytosis_flag"): boost += 0.15
        if row_dict.get("high_nlr_flag"): boost += 0.10
        if float(input_data.get("cea_level", 0) or 0) > 10: boost += 0.20
        if float(input_data.get("crp_level", 0) or 0) > 20: boost += 0.10
        
        prob = min(0.99, raw_prob + boost)
        
        # Align thresholds with train.py intent (0.30 was used for evaluation)
        # We'll use: High >= 0.55, Medium >= 0.30, Low < 0.30
        if prob >= 0.55:
            risk_level = "High"
        elif prob >= 0.30:
            risk_level = "Medium"
        else:
            risk_level = "Low"


        # SHAP Analysis
        contributions = []
        try:
            # Trap all outputs from SHAP during execution
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                explainer = shap.KernelExplainer(model.predict_proba, background_data)
                shap_values = explainer.shap_values(scaled_features)
            
            # SHAP returns [samples, features, classes] or list[samples, features]
            if isinstance(shap_values, list):
                # Class 1 (Risk)
                risk_contributions = shap_values[1][0] 
            elif len(shap_values.shape) == 3:
                risk_contributions = shap_values[0, :, 1]
            else:
                risk_contributions = shap_values[0]

            for i, feat in enumerate(feature_columns):
                val = float(risk_contributions[i])
                if abs(val) > 0.001: # Lower threshold for more results
                    contributions.append({
                        "id": feat,
                        "label": feat.replace('_', ' ').title(),
                        "score": round(val * 100, 2),
                        "type": "positive" if val > 0 else "negative"
                    })
            
            contributions = sorted(contributions, key=lambda x: abs(x['score']), reverse=True)[:5]
        except Exception as shap_e:
            pass # Silent failure for SHAP
        
        response = {
            "success": True,
            "risk_score": round(prob * 100, 1),
            "risk_level": risk_level,
            "top_factors": contributions
        }
        
        print(json.dumps(response))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == '__main__':
    run_prediction()
