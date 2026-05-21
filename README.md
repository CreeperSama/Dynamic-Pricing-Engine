# 📈 PriceOptix: Dynamic Pricing Engine AI

[![Frontend](https://img.shields.io/badge/Frontend-React-blue?logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Vercel_%7C_Render-black?logo=vercel)](https://vercel.com/)

An AI-powered pricing optimization dashboard that helps businesses maximize revenue by dynamically analyzing competitor pricing, product quality scores, and seasonal (holiday) trends. 

This project consists of a **React** frontend for visualizing market elasticity and a **FastAPI/Python** backend powering a machine-learning prediction model.

---

## ✨ Features

* **🤖 AI Price Optimization:** Suggests the optimal price point to maximize expected revenue based on a trained ML model (`dynamic_prediction_model.pkl`).
* **📊 Revenue Elasticity Curve:** Visualizes the predicted revenue across different price points using interactive area charts.
* **🥇 Market Positioning:** Compares the AI's suggested price against current pricing and top 3 competitors.
* **💡 Strategic Insights:** Automatically generates textual business insights explaining *why* the AI chose the specific price (e.g., undercutting competitors vs. commanding a premium).
* **⚡ Real-time Processing:** Fast, responsive UI with immediate feedback and market boundary safety checks.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js
* **Charts:** Recharts (AreaChart, BarChart)
* **Icons:** Lucide-React
* **HTTP Client:** Axios
* **Deployment:** Vercel

### Backend
* **Framework:** FastAPI (Python)
* **Data Processing:** Pandas, NumPy
* **Machine Learning:** Scikit-Learn, Joblib
* **Server:** Uvicorn
* **Deployment:** Render

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/CreeperSama/Dynamic-Pricing-Engine.git](https://github.com/CreeperSama/Dynamic-Pricing-Engine.git)
cd Dynamic-Pricing-Engine
```
### 2. Backend Setup (FastAPI)
Navigate to the backend directory, install dependencies, and run the server.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --port 8000
```
### 3. Frontend Setup (React)
Open a new terminal window, navigate to the frontend directory, install dependencies, and run the app.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
# OR if using Vite: npm run dev
```
## 📡 API Reference

### `POST /predict`
Calculates the optimal price and generates the revenue elasticity curve.

**Request Body:**
```json
{
  "comp_1": 100.0,
  "comp_2": 105.0,
  "comp_3": 95.0,
  "product_score": 4.5,
  "holiday": 0.0
}

Response:
JSON

{
  "recommended_price": 98.50,
  "expected_revenue": 15420.75,
  "chart_data": [
    {"price": 50.0, "revenue": 8000.0},
    {"price": 51.5, "revenue": 8200.5}
  ]
}
```
## 🌍 Deployment

* **Backend:** Hosted on **Render**. Configured with `uvicorn main:app --host 0.0.0.0 --port 10000`.
* **Frontend:** Hosted on **Vercel**. Environment variables are configured to point to the live Render backend URL to bypass local CORS/connection issues.

---

## 📄 License
This project is licensed under the **MIT License**.
