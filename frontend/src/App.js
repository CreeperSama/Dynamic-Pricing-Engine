import React, { useState } from 'react';
import axios from 'axios';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Calendar, Activity, TrendingUp } from 'lucide-react';

const App = () => {
  // ADDED: current_price for baseline calculations
  const [formData, setFormData] = useState({
    current_price: 110, comp_1: 100, comp_2: 105, comp_3: 95, product_score: 4.5, holiday: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const payload = {
        comp_1: formData.comp_1,
        comp_2: formData.comp_2,
        comp_3: formData.comp_3,
        product_score: formData.product_score,
        holiday: formData.holiday
      };
      const response = await axios.post('http://127.0.0.1:8000/predict', payload);
      setResult(response.data);
    } catch (error) {
      // 🛑 THIS IS THE CRITICAL PART WE NEED TO UPDATE
      if (error.response && error.response.data && error.response.data.detail) {
        // This catches our custom 400 error from FastAPI
        alert(`AI Engine Warning: ${error.response.data.detail}`);
      } else {
        // This catches actual server crashes
        alert("Server Connection Error. Check your python terminal!");
      }
    }
    setLoading(false);
  };

  // --- NEW CALCULATIONS ---
  let lift = null;
  let barData = [];
  
  if (result && result.chart_data) {
    // 1. Calculate Lift vs Current Price
    const closest = result.chart_data.reduce((prev, curr) => 
      Math.abs(curr.price - formData.current_price) < Math.abs(prev.price - formData.current_price) ? curr : prev
    );
    const baselineRevenue = closest.revenue;
    lift = baselineRevenue > 0 ? (((result.expected_revenue - baselineRevenue) / baselineRevenue) * 100).toFixed(1) : 0;

    // 2. Prepare Data for Benchmarking Bar Chart
    barData = [
      { name: 'Optimal AI', price: result.recommended_price, color: '#10b981' },
      { name: 'Current', price: formData.current_price, color: '#94a3b8' },
      { name: 'Comp 1', price: formData.comp_1, color: '#f43f5e' },
      { name: 'Comp 2', price: formData.comp_2, color: '#f59e0b' },
      { name: 'Comp 3', price: formData.comp_3, color: '#3b82f6' }
    ];
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      <div style={styles.dashboard}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>PriceOptix <span style={styles.badge}>AI Engine</span></h1>
            <p style={styles.subtitle}>Dynamic Revenue Optimization Dashboard</p>
          </div>
          <div style={styles.status}>
            <Activity size={16} color="#00ff88" /> 
            <span style={{marginLeft: '8px'}}>System Live</span>
          </div>
        </header>

        <div style={styles.mainGrid}>
          {/* --- Input Sidebar --- */}
          <section style={styles.glassCard}>
            <h3 style={styles.cardTitle}>Market Variables</h3>
            <div style={styles.inputGroup}>
              {Object.keys(formData).map((key) => (
                <div key={key} style={styles.inputWrapper}>
                  <label style={{...styles.label, color: key === 'current_price' ? '#6366f1' : '#64748b'}}>
                    {key === 'holiday' ? <Calendar size={14}/> : <DollarSign size={14}/>} 
                    {key.replace('_', ' ')}
                  </label>
                  <input
                    type="number"
                    max = "350"
                    step="0.1"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                    style={styles.input}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={handleCalculate} 
              style={loading ? styles.buttonLoading : styles.button}
              disabled={loading}
            >
              {loading ? "Processing AI Logic..." : "Optimize Pricing"}
            </button>
          </section>

          {/* --- Results & Analytics --- */}
          <section style={styles.analyticsSection}>
            {/* UPDATED: 3-Column Metrics Grid */}
            <div style={{ ...styles.metricsGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Optimal Price</p>
                <h2 style={styles.metricValue}>${result ? result.recommended_price : '--'}</h2>
              </div>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>Projected Revenue</p>
                <h2 style={styles.metricValue}>${result ? result.expected_revenue : '--'}</h2>
              </div>
              <div style={{...styles.metricCard, borderBottom: lift > 0 ? '4px solid #10b981' : '1px solid #e2e8f0'}}>
                <p style={styles.metricLabel}>Revenue Lift</p>
                <h2 style={{...styles.metricValue, color: lift > 0 ? '#10b981' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                  {lift ? `${lift > 0 ? '+' : ''}${lift}%` : '--'}
                  {lift > 0 && <TrendingUp size={24} />}
                </h2>
              </div>
            </div>

            {/* AI Insight Generation */}
            {result && (
              <div style={{ ...styles.glassCard, marginBottom: '24px', borderLeft: '4px solid #00ff88' }}>
                <h3 style={{ ...styles.cardTitle, marginBottom: '8px' }}>🤖 AI Strategic Insight</h3>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  Shifting from your current price (${formData.current_price}) to the optimal price of <strong>${result.recommended_price}</strong> is projected to increase revenue by <strong>{lift}%</strong>. 
                  {result.recommended_price < formData.comp_1 ? (
                    <span> This strategy undercuts Competitor 1 to capture maximum volume.</span>
                  ) : (
                    <span> Because your product score is strong ({formData.product_score}/5), you command a premium above Competitor 1.</span>
                  )}
                </p>
              </div>
            )}

            {/* Charts Area: Stacked Vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Elasticity Curve */}
              <div style={{ ...styles.chartCard, height: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={styles.cardTitle}>Revenue Elasticity Curve</h3>
                {result && result.chart_data ? (
                  <div style={{ flexGrow: 1, width: '100%', minHeight: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="price" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                        <Tooltip contentStyle={styles.tooltip} formatter={(value) => `$${value.toFixed(2)}`} labelFormatter={(label) => `Price: $${label}`} />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={styles.emptyChart}>Run optimization to visualize demand curve</div>
                )}
              </div>

              {/* NEW: Competitor Benchmarking Bar Chart */}
              <div style={{ ...styles.chartCard, height: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={styles.cardTitle}>Market Positioning (Price Benchmarking)</h3>
                {result ? (
                  <div style={{ flexGrow: 1, width: '100%', minHeight: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                        <Tooltip contentStyle={styles.tooltip} formatter={(value) => `$${value}`} />
                        <Bar dataKey="price" radius={[0, 4, 4, 0]} barSize={24}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={styles.emptyChart}>Run optimization to benchmark competitors</div>
                )}
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- Modern Styled Objects ---
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden'
  },
  bgCircle1: {
    position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%', zIndex: 0
  },
  bgCircle2: {
    position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%', zIndex: 0
  },
  dashboard: {
    width: '1100px', maxWidth: '100%', background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '40px', zIndex: 1
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'
  },
  title: { margin: 0, fontSize: '28px', color: '#1e293b', fontWeight: 800 },
  badge: { fontSize: '12px', background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '20px', verticalAlign: 'middle', marginLeft: '10px' },
  subtitle: { margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' },
  status: { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', fontWeight: 600, background: '#fff', padding: '6px 12px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  mainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' },
  glassCard: { background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardTitle: { marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#334155' },
  inputWrapper: { marginBottom: '16px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' },
  button: {
    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white',
    fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
  },
  buttonLoading: { background: '#94a3b8', cursor: 'not-allowed', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', color: 'white' },
  metricsGrid: { display: 'grid', gap: '20px', marginBottom: '24px' },
  metricCard: { background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  metricLabel: { margin: 0, fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' },
  metricValue: { margin: '8px 0 0 0', fontSize: '28px', color: '#1e293b', fontWeight: 800 },
  chartCard: { background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  emptyChart: { height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' },
  tooltip: { borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
};

export default App;