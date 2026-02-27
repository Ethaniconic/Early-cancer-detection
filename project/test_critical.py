import json
import subprocess
import os

test_input = {
    "age": 67,
    "sex": "Male",
    "smoking_status": "Smoker",
    "wbc_count": 15.8,
    "rbc_count": 3.2,
    "hemoglobin": 9.4,
    "hematocrit": 28.2,
    "platelet_count": 580,
    "neutrophil_pct": 86.2,
    "lymphocyte_pct": 7.4,
    "crp_level": 42.5,
    "cea_level": 24.8,
    "ca125_level": 92.5,
    "mcv": 76.5,
    "mch": 24.2
}

def test_prediction():
    cli_path = os.path.join("project", "predict_cli.py")
    process = subprocess.Popen(
        ["python", cli_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate(input=json.dumps(test_input))
    print("OUTPUT:", stdout)
    if stderr:
        print("ERROR:", stderr)

if __name__ == "__main__":
    test_prediction()
