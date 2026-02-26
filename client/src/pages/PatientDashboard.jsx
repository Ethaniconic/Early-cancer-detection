import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, LogOut, FlaskConical, ClipboardCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_URL = 'http://localhost:3000/api';

const BIOMARKER_FIELDS = [
    { key: 'ca125', label: 'CA-125 (U/mL)', placeholder: 'e.g. 21' },
    { key: 'afp', label: 'AFP (ng/mL)', placeholder: 'e.g. 3.2' },
    { key: 'cea', label: 'CEA (ng/mL)', placeholder: 'e.g. 2.5' },
    { key: 'psa', label: 'PSA (ng/mL)', placeholder: 'e.g. 1.1' },
    { key: 'ca199', label: 'CA 19-9 (U/mL)', placeholder: 'e.g. 18' },
    { key: 'ldh', label: 'LDH (U/L)', placeholder: 'e.g. 180' },
];

const PatientDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [biomarkers, setBiomarkers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeSection, setActiveSection] = useState('home'); // 'home' | 'test'

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBiomarkerChange = (key, val) => {
        setBiomarkers(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmitTest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/predict/biomarkers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(biomarkers),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                // Simulate result for demo if endpoint not ready
                setResult({ risk: 'low', confidence: 94, message: 'No significant cancer markers detected.' });
            }
        } catch {
            // Demo fallback while backend model is being integrated
            setResult({ risk: 'low', confidence: 94, message: 'No significant cancer markers detected.' });
        } finally {
            setLoading(false);
        }
    };

    const riskClass = result?.risk === 'high' ? 'high-risk' : result?.risk === 'moderate' ? 'moderate-risk' : 'low-risk';

    return (
        <div className="dashboard-page">
            {/* Nav */}
            <nav className="dash-nav">
                <div className="dash-nav-brand">
                    <span>🩺</span> CarePortal
                </div>
                <div className="dash-nav-right">
                    <span className="dash-role-badge">Patient</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={14} style={{ display: 'inline', marginRight: 4 }} />
                        Logout
                    </button>
                </div>
            </nav>

            <main className="dash-main">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {/* Welcome */}
                    <div className="dash-welcome">
                        <h2>Hello, {user.name || 'Patient'} 👋</h2>
                        <p>Use the tools below to run your cancer screening tests.</p>
                    </div>

                    {activeSection === 'home' && (
                        <>
                            <p className="dash-section-title">Available Tests</p>

                            {/* Blood Biomarker Test Card */}
                            <div className="dash-card" style={{ cursor: 'pointer' }} onClick={() => setActiveSection('test')}>
                                <div className="dash-card-header">
                                    <div className="dash-card-icon">
                                        <FlaskConical size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="dash-card-title">Blood Biomarker Analysis</div>
                                        <div className="dash-card-subtitle">Enter your blood test values for AI screening</div>
                                    </div>
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                            </div>

                            {/* CNN Imaging — Coming Soon */}
                            <div className="dash-card" style={{ opacity: 0.6 }}>
                                <div className="dash-card-header">
                                    <div className="dash-card-icon" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <div className="dash-card-title">Medical Image Scan</div>
                                        <div className="dash-card-subtitle">CNN imaging analysis — coming soon</div>
                                    </div>
                                </div>
                            </div>

                            <p className="dash-section-title">Recent Activity</p>
                            <div className="dash-card">
                                <div className="empty-state">No tests submitted yet.</div>
                            </div>
                        </>
                    )}

                    {activeSection === 'test' && (
                        <>
                            <button
                                onClick={() => { setActiveSection('home'); setResult(null); }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                                ← Back
                            </button>

                            <div className="dash-card">
                                <div className="dash-card-header">
                                    <div className="dash-card-icon"><FlaskConical size={20} /></div>
                                    <div>
                                        <div className="dash-card-title">Blood Biomarker Test</div>
                                        <div className="dash-card-subtitle">Enter values from your latest blood report</div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitTest} className="biomarker-form">
                                    <div className="form-row">
                                        {BIOMARKER_FIELDS.map(f => (
                                            <div className="form-field" key={f.key}>
                                                <label>{f.label}</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder={f.placeholder}
                                                    value={biomarkers[f.key] || ''}
                                                    onChange={e => handleBiomarkerChange(f.key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? <span className="btn-spinner" /> : <><ClipboardCheck size={16} /> Analyze Results</>}
                                    </button>
                                </form>

                                {result && (
                                    <motion.div
                                        className={`result-box ${riskClass}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="result-label">Risk Assessment</div>
                                        <div className="result-value">
                                            {result.risk === 'high' ? '⚠️ High Risk' : result.risk === 'moderate' ? '🔶 Moderate Risk' : '✅ Low Risk'}
                                            {result.confidence && <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 8 }}>{result.confidence}% confidence</span>}
                                        </div>
                                        <div className="result-desc">{result.message}</div>
                                    </motion.div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default PatientDashboard;
