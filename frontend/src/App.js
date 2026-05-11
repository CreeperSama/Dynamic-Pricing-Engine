import React, { useState } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

function App() {
  // 1. State for Inputs
  const [formData, setFormData] = useState({
    comp_1: 100,
    comp_2: 105,
    comp_3: 95,
    product_score: 4.5,
    holiday: 0
  });

  // 2. State for Results
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Calling our FastAPI backend
      const response = await axios.post('http://127.0.0.1:8000/predict', formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      alert("Make sure your FastAPI server is running on port 8000!");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50' }}>🚀 Dynamic Pricing Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* --- Input Section --- */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>Market Variables</h3>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>
                {key.replace('_', ' ')}:
              </label>
              <input
                type="number"
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          ))}
          <button 
            onClick={handleCalculate}
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? "Analyzing Market..." : "Calculate Optimal Price"}
          </button>
        </div>

        {/* --- Result Section --- */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>Strategy Recommendation</h3>
          {result ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#27ae60' }}>
                <DollarSign size={40} />
                <div style={{ marginLeft: '10px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>Recommended Price</p>
                  <h2 style={{ margin: 0 }}>${result.recommended_price}</h2>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#2980b9' }}>
                <TrendingUp size={40} />
                <div style={{ marginLeft: '10px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>Projected Revenue</p>
                  <h2 style={{ margin: 0 }}>${result.expected_revenue}</h2>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#bdc3c7', marginTop: '50px' }}>
              <AlertCircle size={48} style={{ marginBottom: '10px' }} />
              <p>Enter market data and click calculate to see the AI recommendation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;