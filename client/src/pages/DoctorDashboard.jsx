import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, FlaskConical, Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css';

const API_URL = 'http://localhost:3000/api';

// Demo patients — replace with real API call once endpoint is ready
const DEMO_PATIENTS = [
    { id: 1, name: 'Riya Desai', age: 42, risk: 'high', tested: '2h ago' },
    { id: 2, name: 'Arjun Mehta', age: 58, risk: 'moderate', tested: '5h ago' },
    { id: 3, name: 'Sunita Rao', age: 36, risk: 'low', tested: '1d ago' },
];

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [patients, setPatients] = useState(DEMO_PATIENTS);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const riskBadge = (risk) => {
        const map = { high: 'badge-high', moderate: 'badge-moderate', low: 'badge-low' };
        const labels = { high: '⚠ High', moderate: '🔶 Moderate', low: '✅ Low' };
        return <span className={`list-badge ${map[risk]}`}>{labels[risk]}</span>;
    };

    const stats = {
        total: patients.length,
        high: patients.filter(p => p.risk === 'high').length,
        low: patients.filter(p => p.risk === 'low').length,
    };

    return (
        <div className="dashboard-page">
            <nav className="dash-nav">
                <div className="dash-nav-brand"><span>🩺</span> CarePortal</div>
                <div className="dash-nav-right">
                    <span className="dash-role-badge">Doctor</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={14} style={{ display: 'inline', marginRight: 4 }} /> Logout
                    </button>
                </div>
            </nav>

            <main className="dash-main">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="dash-welcome">
                        <h2>Dr. {user.name || 'Doctor'} 👨‍⚕️</h2>
                        <p>Review your patients' cancer screening results below.</p>
                    </div>

                    {/* Stats */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Patients</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: 'var(--error)' }}>{stats.high}</div>
                            <div className="stat-label">High Risk</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.low}</div>
                            <div className="stat-label">Low Risk</div>
                        </div>
                    </div>

                    {/* Patient List */}
                    <p className="dash-section-title">Patient Results</p>
                    <div className="dash-card">
                        {patients.length === 0 ? (
                            <div className="empty-state">No patient results yet.</div>
                        ) : (
                            patients.map(p => (
                                <div key={p.id} className="list-item">
                                    <div className="list-avatar">{p.name.charAt(0)}</div>
                                    <div className="list-info">
                                        <div className="list-name">{p.name}</div>
                                        <div className="list-meta">Age {p.age} · Tested {p.tested}</div>
                                    </div>
                                    {riskBadge(p.risk)}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Tools */}
                    <p className="dash-section-title">Tools</p>
                    <div className="quick-actions">
                        <button className="action-btn">
                            <div className="action-icon"><FlaskConical size={18} /></div>
                            Biomarker Review
                        </button>
                        <button className="action-btn" style={{ opacity: 0.5, cursor: 'default' }}>
                            <div className="action-icon"><Activity size={18} /></div>
                            Imaging (Soon)
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
