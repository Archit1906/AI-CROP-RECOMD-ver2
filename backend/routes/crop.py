# backend/routes/crop.py — update to use saved label encoder

import joblib, numpy as np, json, os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

BASE = os.path.dirname(__file__)

model   = joblib.load(os.path.join(BASE, "../models/crop_model.pkl"))
scaler  = joblib.load(os.path.join(BASE, "../models/crop_scaler.pkl"))
encoder = joblib.load(os.path.join(BASE, "../models/crop_label_encoder.pkl"))

with open(os.path.join(BASE, "../models/crop_classes.json")) as f:
    CLASS_NAMES = json.load(f)

CROP_DATA = {
    "rice":        {"emoji":"🌾","profit":"₹28,000/acre","water":"High","season":"Kharif","days":"90-120"},
    "maize":       {"emoji":"🌽","profit":"₹18,000/acre","water":"Medium","season":"Kharif","days":"80-110"},
    "chickpea":    {"emoji":"🫘","profit":"₹22,000/acre","water":"Low","season":"Rabi","days":"90-100"},
    "kidneybeans": {"emoji":"🫘","profit":"₹20,000/acre","water":"Medium","season":"Kharif","days":"90-120"},
    "pigeonpeas":  {"emoji":"🌿","profit":"₹19,000/acre","water":"Low","season":"Kharif","days":"150-180"},
    "mothbeans":   {"emoji":"🌱","profit":"₹15,000/acre","water":"Low","season":"Kharif","days":"75-85"},
    "mungbean":    {"emoji":"🌿","profit":"₹16,000/acre","water":"Low","season":"Kharif","days":"60-75"},
    "blackgram":   {"emoji":"🫘","profit":"₹17,000/acre","water":"Low","season":"Kharif","days":"70-90"},
    "lentil":      {"emoji":"🌾","profit":"₹21,000/acre","water":"Low","season":"Rabi","days":"100-120"},
    "pomegranate": {"emoji":"🍎","profit":"₹80,000/acre","water":"Low","season":"Annual","days":"150-180"},
    "banana":      {"emoji":"🍌","profit":"₹60,000/acre","water":"High","season":"Annual","days":"270-365"},
    "mango":       {"emoji":"🥭","profit":"₹70,000/acre","water":"Medium","season":"Annual","days":"90-120"},
    "grapes":      {"emoji":"🍇","profit":"₹90,000/acre","water":"Medium","season":"Annual","days":"150-180"},
    "watermelon":  {"emoji":"🍉","profit":"₹30,000/acre","water":"Medium","season":"Summer","days":"70-90"},
    "muskmelon":   {"emoji":"🍈","profit":"₹25,000/acre","water":"Medium","season":"Summer","days":"70-90"},
    "apple":       {"emoji":"🍎","profit":"₹1,20,000/acre","water":"Medium","season":"Rabi","days":"150-180"},
    "orange":      {"emoji":"🍊","profit":"₹65,000/acre","water":"Medium","season":"Annual","days":"270-365"},
    "papaya":      {"emoji":"🍈","profit":"₹50,000/acre","water":"High","season":"Annual","days":"240-270"},
    "coconut":     {"emoji":"🥥","profit":"₹40,000/acre","water":"High","season":"Annual","days":"365"},
    "cotton":      {"emoji":"🌿","profit":"₹35,000/acre","water":"Medium","season":"Kharif","days":"150-180"},
    "jute":        {"emoji":"🌿","profit":"₹20,000/acre","water":"High","season":"Kharif","days":"100-120"},
    "coffee":      {"emoji":"☕","profit":"₹75,000/acre","water":"High","season":"Annual","days":"365"},
}

class CropInput(BaseModel):
    nitrogen:    float
    phosphorus:  float
    potassium:   float
    temperature: float
    humidity:    float
    ph:          float
    rainfall:    float

@router.post("/predict-crop")
def predict_crop(data: CropInput):
    features = np.array([[
        data.nitrogen, data.phosphorus, data.potassium,
        data.temperature, data.humidity, data.ph, data.rainfall
    ]])
    features_scaled = scaler.transform(features)

    # Get calibrated probabilities — much more accurate than raw RF
    probabilities   = model.predict_proba(features_scaled)[0]
    top5_indices    = np.argsort(probabilities)[::-1][:5]

    top3 = []
    for idx in top5_indices:
        crop_name  = CLASS_NAMES[idx]
        confidence = round(float(probabilities[idx]) * 100, 1)
        info       = CROP_DATA.get(crop_name.lower().replace(" ",""), {
            "emoji":"🌱","profit":"N/A",
            "water":"Medium","season":"Kharif","days":"90-120"
        })
        top3.append({
            "crop":       crop_name.capitalize(),
            "emoji":      info["emoji"],
            "confidence": confidence,
            "profit":     info["profit"],
            "water":      info["water"],
            "season":     info["season"],
            "days":       info["days"]
        })
        if len(top3) == 3:
            break

    best = top3[0]
    return {
        "recommended_crop": best["crop"],
        "confidence":       f"{best['confidence']}%",
        "top3":             top3,
        "details": {
            "avg_profit": best["profit"],
            "water_req":  best["water"],
            "season":     best["season"],
            "duration":   best["days"]
        }
    }
