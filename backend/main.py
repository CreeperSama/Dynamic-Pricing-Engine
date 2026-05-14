from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

app = FastAPI()

# --- CORS Setup (Required for React to talk to FastAPI) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load the Model ---
# Ensure this path matches exactly where your .pkl file is saved
model = joblib.load("dynamic_prediction_model.pkl")

# --- Define the Input Schema ---
class PricingInput(BaseModel):
    comp_1: float
    comp_2: float
    comp_3: float
    product_score: float
    holiday: float 

@app.post("/predict")
def get_optimal_price(data: PricingInput):
    # ==========================================
    # 1. THE SAFETY CHECK
    # ==========================================
    max_competitor_price = max(data.comp_1, data.comp_2, data.comp_3)
    
    if max_competitor_price > 365:
        # This MUST be the FastAPI HTTPException!
        raise HTTPException(
            status_code=400, 
            detail=f"Market prices exceed model boundaries ($365 max). You inputted ${max_competitor_price}."
        )

    try:
        # ==========================================
        # 2. DYNAMIC SEARCH RANGE
        # ==========================================
        min_comp = min(data.comp_1, data.comp_2, data.comp_3)
        
        # Test prices from 50% of the cheapest competitor to 150% of the most expensive
        search_min = max(10, min_comp * 0.5) 
        search_max = max_competitor_price * 1.5
        
        potential_prices = np.linspace(search_min, search_max, 100)
        results = []

        # ==========================================
        # 3. PREDICTION ENGINE
        # ==========================================
        for price in potential_prices:
            features = pd.DataFrame([[
                price, 
                data.comp_1, 
                data.comp_2, 
                data.comp_3, 
                data.product_score, 
                data.holiday
            ]], columns=['unit_price', 'comp_1', 'comp_2', 'comp_3', 'product_score', 'holiday'])
            
            predicted_qty = model.predict(features)[0]
            
            # Prevent negative quantities (models sometimes guess below zero!)
            predicted_qty = max(0, predicted_qty) 
            
            revenue = price * predicted_qty
            results.append({"price": float(price), "revenue": float(revenue)})

        # Find the price that generated the highest revenue
        best_option = max(results, key=lambda x: x['revenue'])
        
        return {
            "recommended_price": round(best_option['price'], 2),
            "expected_revenue": round(best_option['revenue'], 2),
            "chart_data": results
        }

    except Exception as e:
        # If the math or pandas fails, this catches it safely
        print(f"Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))