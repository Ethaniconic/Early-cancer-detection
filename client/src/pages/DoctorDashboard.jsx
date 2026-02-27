import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Calendar, Users, Activity, AlertTriangle, CheckCircle, Clock,
    ChevronDown, ChevronUp, ShieldCheck, Stethoscope, Phone, Droplet, Pill,
    FileText, UploadCloud, Info, TrendingUp, FlaskConical, Search, PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import PatientCheckupForm from '../components/dashboard/PatientCheckupForm';
import './DoctorDashboard.css';

const API_URL = 'http://localhost:3000/api';

// ── Verification Modal ──
const VerificationModal = ({ onVerify }) => {
    const [specialization, setSpecialization] = useState('');
    const [degree, setDegree] = useState(null);
    const [cert, setCert] = useState(null);
    const [idDoc, setIdDoc] = useState(null);

    const dz1 = useDropzone({ onDrop: useCallback(f => setDegree(f[0]), []), maxFiles: 1 });
    const dz2 = useDropzone({ onDrop: useCallback(f => setCert(f[0]), []), maxFiles: 1 });
    const dz3 = useDropzone({ onDrop: useCallback(f => setIdDoc(f[0]), []), maxFiles: 1 });

    const canSubmit = specialization && degree && cert && idDoc;

    return (
        <div className="doc-verify-overlay">
            <motion.div
                className="doc-verify-modal"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <ShieldCheck size={28} color="#3b82f6" />
                    <h2>Medical Verification</h2>
                </div>
                <p className="doc-verify-desc">
                    To access the clinical dashboard, please provide your medical credentials for verification.
                    This is a one-time process for all oncology specialists.
                </p>

                <div className="doc-form-group">
                    <label className="doc-form-label">Specialization</label>
                    <input
                        className="doc-form-input"
                        placeholder="e.g. Surgical Oncologist"
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                    />
                </div>

                {[
                    { label: 'Medical Degree', dz: dz1, file: degree },
                    { label: 'Council Registration', dz: dz2, file: cert },
                    { label: 'Identity Proof', dz: dz3, file: idDoc },
                ].map(({ label, dz, file }) => (
                    <div key={label} className="doc-form-group">
                        <label className="doc-form-label">{label}</label>
                        <div {...dz.getRootProps()} className="doc-verify-dropzone">
                            <input {...dz.getInputProps()} />
                            {file ? (
                                <div style={{ color: '#10b981', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <CheckCircle size={14} /> {file.name}
                                </div>
                            ) : (
                                <div style={{ color: '#64748b' }}>
                                    <UploadCloud size={20} style={{ marginBottom: 4 }} />
                                    <p style={{ fontSize: 12, margin: 0 }}>Click or drag to upload</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    disabled={!canSubmit}
                    onClick={() => onVerify(specialization)}
                    className="doc-verify-btn"
                >
                    Complete Activation
                </button>
            </motion.div>
        </div>
    );
};

// ── Appointment Card ──
const AppointmentCard = ({ appt, index, updateStatus }) => {
    const [expanded, setExpanded] = useState(false);
    const patient = appt.patientId || {};
    const riskKey = (appt.risk_level || 'low').toLowerCase();
    const statusKey = appt.status || 'pending';
    const initial = (patient.name || '?')[0].toUpperCase();
    const top3 = (appt.top_factors || []).slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`doc-appointment-card ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="doc-appt-header">
                <div className="doc-patient-avatar">{initial}</div>
                <div className="doc-patient-info">
                    <div className="doc-patient-name">{patient.name || 'Patient Record'}</div>
                    <div className="doc-patient-meta">
                        <span>Age {patient.age || '—'}</span>
                        <span><Phone size={12} /> {patient.mobile || '—'}</span>
                        <span className={`doc-status-badge ${statusKey}`}>{statusKey}</span>
                    </div>
                </div>
                <div className="doc-appt-right">
                    <div className={`doc-risk-badge ${riskKey}`}>{riskKey} Risk</div>
                    <div className="doc-appt-time">
                        <Calendar size={12} /> {appt.date} • <Clock size={12} /> {appt.time}
                    </div>
                </div>
                <div style={{ color: '#64748b' }}>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="doc-appt-detail"
                    >
                        <div className="doc-detail-grid">
                            {[
                                { label: 'Blood Group', val: patient.bloodGroup },
                                { label: 'Medications', val: patient.currentMedications },
                                { label: 'Allergies', val: patient.knownAllergies },
                                { label: 'Past Surgeries', val: patient.pastSurgeries },
                                { label: 'Family History', val: patient.familyHistory },
                                { label: 'Symptoms', val: patient.currentSymptoms },
                            ].map((d, i) => (
                                <div key={i} className="doc-detail-item">
                                    <div className="doc-detail-label">{d.label}</div>
                                    <div className="doc-detail-value">{d.val || '—'}</div>
                                </div>
                            ))}
                        </div>

                        <div className="doc-risk-bar-wrapper">
                            <div className="doc-risk-bar-label">
                                <span><TrendingUp size={12} style={{ marginRight: 6 }} /> AI Risk Assessment</span>
                                <span style={{ color: riskKey === 'high' ? '#f87171' : riskKey === 'medium' ? '#fbbf24' : '#34d399' }}>
                                    {appt.risk_score ? `${appt.risk_score}%` : 'N/A'}
                                </span>
                            </div>
                            <div className="doc-risk-bar-track">
                                <motion.div
                                    className={`doc-risk-bar-fill ${riskKey}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${appt.risk_score || 0}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>

                        {top3.length > 0 && (
                            <div className="doc-factors-strip">
                                <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>Top Factors:</span>
                                {top3.map((f, i) => (
                                    <div key={i} className={`doc-factor-chip ${f.type === 'positive' ? 'up' : 'down'}`}>
                                        {f.type === 'positive' ? '↑' : '↓'} {f.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="doc-action-row">
                            <button className="doc-btn doc-btn-success" onClick={(e) => { e.stopPropagation(); updateStatus(appt._id, 'confirmed'); }}>
                                <CheckCircle size={14} /> Confirm
                            </button>
                            <button className="doc-btn doc-btn-primary" onClick={(e) => { e.stopPropagation(); updateStatus(appt._id, 'completed'); }}>
                                <Stethoscope size={14} /> Mark Completed
                            </button>
                            <button className="doc-btn doc-btn-danger" onClick={(e) => { e.stopPropagation(); updateStatus(appt._id, 'cancelled'); }}>
                                <AlertTriangle size={14} /> Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Main Dashboard ──
const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isVerified, setIsVerified] = useState(user.isVerified || false);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!user._id) { setLoading(false); return; }
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/appointments/doctor/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => { if (d.success) setAppointments(d.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user._id]);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleVerify = async (spec) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/verify-doctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ specialization: spec })
            });

            const data = await res.json();
            if (data.success) {
                const updatedUser = { ...user, isVerified: true, specialization: spec };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setIsVerified(true);
            }
        } catch (err) {
            console.error('Verification failed:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const total = appointments.length;
    const pending = appointments.filter(a => (a.status || 'pending') === 'pending').length;
    const highRisk = appointments.filter(a => (a.risk_level || '').toLowerCase() === 'high').length;

    const filtered = activeTab === 'all'
        ? appointments
        : activeTab === 'screening'
            ? []
            : appointments.filter(a => (a.status || 'pending') === activeTab);

    const initials = (user.name || 'DR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="doctor-dashboard">
            <AnimatePresence>
                {!isVerified && <VerificationModal onVerify={handleVerify} />}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className="doc-sidebar">
                <div className="doc-sidebar-header">
                    <div className="doc-sidebar-logo">
                        <div className="doc-sidebar-logo-icon">
                            <Activity size={20} color="white" />
                        </div>
                        <span className="doc-sidebar-logo-text">CarePortal</span>
                    </div>

                    <div className="doc-avatar-block">
                        <div className="doc-avatar-circle">{initials}</div>
                        <div>
                            <div className="doc-avatar-name">Dr. {user.name}</div>
                            <div className="doc-avatar-role">{user.specialization || 'Oncologist'}</div>
                        </div>
                    </div>
                </div>

                <nav className="doc-sidebar-nav">
                    {[
                        { id: 'all', icon: <Calendar size={18} />, label: 'Appointments' },
                        { id: 'pending', icon: <Clock size={18} />, label: 'Pending Cases', count: pending },
                        { id: 'screening', icon: <FlaskConical size={18} />, label: 'Screening Lab' },
                    ].map(item => (
                        <div
                            key={item.id}
                            className={`doc-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.count > 0 && (
                                <span style={{ background: '#ef4444', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>
                                    {item.count}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="doc-sidebar-footer">
                    <button className="doc-logout-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="doc-main">
                <header className="doc-topbar">
                    <div>
                        <h1 className="doc-topbar-title">
                            {activeTab === 'all' ? 'Dashboard Overview' :
                                activeTab === 'pending' ? 'Critical Pending Review' :
                                    activeTab === 'screening' ? 'Screening Lab' : 'Patient Queue'}
                        </h1>
                        <p className="doc-topbar-subtitle">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="doc-topbar-badge">On Duty</div>
                </header>

                {activeTab !== 'screening' && (
                    <>
                        <div className="doc-stats-grid">
                            <div className="doc-stat-card blue">
                                <div className="doc-stat-icon blue"><Users size={22} /></div>
                                <div className="doc-stat-value">{total}</div>
                                <div className="doc-stat-label">Total Patients</div>
                            </div>
                            <div className="doc-stat-card teal">
                                <div className="doc-stat-icon teal"><Clock size={22} /></div>
                                <div className="doc-stat-value">{pending}</div>
                                <div className="doc-stat-label">Awaiting Review</div>
                            </div>
                            <div className="doc-stat-card amber">
                                <div className="doc-stat-icon amber"><AlertTriangle size={22} /></div>
                                <div className="doc-stat-value">{highRisk}</div>
                                <div className="doc-stat-label">High Risk Cases</div>
                            </div>
                        </div>

                        <div className="doc-section-title">
                            <div className="doc-section-title-icon"><Activity size={18} /></div>
                            Patient Queue
                        </div>

                        {loading ? (
                            <div className="doc-spinner" />
                        ) : filtered.length === 0 ? (
                            <div className="doc-empty-state">
                                <div className="doc-empty-icon"><Calendar size={32} color="#64748b" /></div>
                                <div className="doc-empty-title">No Appointments Found</div>
                                <div className="doc-empty-sub">There are no patient records matching the selected filter.</div>
                            </div>
                        ) : (
                            <div className="doc-appointment-list">
                                {filtered.map((appt, idx) => (
                                    <AppointmentCard
                                        key={appt._id}
                                        appt={appt}
                                        index={idx}
                                        updateStatus={updateStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'screening' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <PatientCheckupForm />
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;
