import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="AI Eligibility Agent API",
    description="Microservice for predicting fraud or dropout risk using Neo4j and Random Forest.",
    version="1.0.0"
)

# Load model on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'rf_model.pkl')
rf_model = None

@app.on_event("startup")
def load_model():
    global rf_model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            rf_model = pickle.load(f)
    else:
        print(f"Warning: Model not found at {MODEL_PATH}")

class PredictRequest(BaseModel):
    age: int
    income: float
    gpa: float
    previous_dropouts: int
    network_risk: float

class PredictResponse(BaseModel):
    risk_score: int
    risk_label: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-eligibility-agent", "model_loaded": rf_model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict_risk(request: PredictRequest):
    if rf_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Extract features
    features = np.array([[
        request.age,
        request.income,
        request.gpa,
        request.previous_dropouts,
        request.network_risk
    ]])
    
    # Predict
    prediction = rf_model.predict(features)[0]
    
    return PredictResponse(
        risk_score=int(prediction),
        risk_label="Risk" if prediction == 1 else "No Risk"
    )
