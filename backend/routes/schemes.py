from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

SCHEMES_DB = [
    {
        "name": "PM-KISAN",
        "description": "₹6,000/year direct income support to farmer families",
        "eligibility": "All small & marginal farmers",
        "benefit": "₹6,000 annually in 3 installments",
        "apply_url": "https://pmkisan.gov.in",
        "category": "income_support",
        "states": ["all"]
    },
    {
        "name": "Fasal Bima Yojana (PMFBY)",
        "description": "Crop insurance scheme for crop failure",
        "eligibility": "All farmers growing notified crops",
        "benefit": "Insurance coverage for crop loss",
        "apply_url": "https://pmfby.gov.in",
        "category": "insurance",
        "states": ["all"]
    },
    {
        "name": "Tamil Nadu Chief Minister's Drought Relief",
        "description": "Relief for farmers affected by drought in TN",
        "eligibility": "TN farmers in drought-declared districts",
        "benefit": "₹5,000 per acre compensation",
        "apply_url": "https://www.tn.gov.in",
        "category": "drought_relief",
        "states": ["Tamil Nadu"]
    },
    # Add 15+ more schemes
]

class FarmerProfile(BaseModel):
    state: str
    crop: str
    land_acres: float
    category: str  # small / marginal / large

@router.post("/recommend")
def recommend_schemes(profile: FarmerProfile):
    relevant = [
        s for s in SCHEMES_DB
        if profile.state in s["states"] or "all" in s["states"]
    ]
    return {"schemes": relevant, "total": len(relevant)}
