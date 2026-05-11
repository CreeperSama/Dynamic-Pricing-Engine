from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# 1. Initialize FastAPI
app = FastAPI(title="Dynamic Pricing API")

# 2. Enable CORS (Cross-Origin Resource Sharing)
# This allows your React frontend (port 3000) to talk to this backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your React URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load the trained "Brain"
model = joblib.load("dynamic_prediction_model.pkl")

# 4. Define the Data Schema (Request Body)
class PricingInput(BaseModel):
    comp_1: float
    comp_2: float
    comp_3: float
    product_score: float
    holiday: int

# 5. The Optimization Endpoint
@app.post("/predict")
def get_optimal_price(data: PricingInput):
    # Potential price range to test
    potential_prices = np.linspace(50, 200, 50)
    results = []

    for price in potential_prices:
        # Match the exact feature order used during training
        features = pd.DataFrame([[
            price, 
            data.comp_1, 
            data.comp_2, 
            data.comp_3, 
            data.product_score, 
            data.holiday
        ]], columns=['unit_price', 'comp_1', 'comp_2', 'comp_3', 'product_score', 'holiday'])
        
        predicted_qty = model.predict(features)[0]
        revenue = price * predicted_qty
        results.append({"price": price, "revenue": revenue})

    # Find the best price
    best_option = max(results, key=lambda x: x['revenue'])
    
    return {
        "recommended_price": round(best_option['price'], 2),
        "expected_revenue": round(best_option['revenue'], 2)
    }