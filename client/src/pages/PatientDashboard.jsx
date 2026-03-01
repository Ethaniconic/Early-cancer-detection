import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LogOut, ChevronRight, ChevronLeft, Droplets, HeartPulse, User, CheckCircle, ShieldAlert, FlaskConical, CalendarClock, Beaker, Trash2, History, Stethoscope, Calendar, X, Upload, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_NODE_API_URL;

const QUESTIONNAIRE_STEPS = [
    {
        id: 'personal',
        title: 'Personal Info',
        icon: User,
        fields: [
            { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 45' },
            { key: 'sex', label: 'Biological Sex', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] },
            { key: 'bmi', label: 'BMI', type: 'number', placeholder: 'e.g. 24.5', step: '0.1' },
            { key: 'smoking_status', label: 'Smoking Status', type: 'select', options: [{ value: 'Non-Smoker', label: 'Non-Smoker' }, { value: 'Former Smoker', label: 'Former Smoker' }, { value: 'Smoker', label: 'Smoker' }] },
            { key: 'pack_years', label: 'Pack Years (if smoker)', type: 'number', placeholder: 'e.g. 10', step: '0.1' },
        ]
    },
    {
        id: 'lifestyle',
        title: 'History & Lifestyle',
        icon: HeartPulse,
        fields: [
            { key: 'alcohol_use', label: 'Alcohol Usage (Days/Wk)', type: 'number', placeholder: 'e.g. 2', step: '1' },
            { key: 'family_history_cancer', label: 'Family History of Cancer', type: 'select', options: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }] },
            { key: 'occupational_exposure', label: 'Occupational Hazardous Exposure', type: 'select', options: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }] },
            { key: 'prior_cancer_diagnosis', label: 'Prior Cancer Diagnosis', type: 'select', options: [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }] },
        ]
    },
    {
        id: 'cbc',
        title: 'Complete Blood Count',
        icon: Droplets,
        fields: [
            { key: 'wbc_count', label: 'WBC (x10^9/L)', type: 'number', placeholder: 'e.g. 6.5', step: '0.1' },
            { key: 'rbc_count', label: 'RBC (x10^12/L)', type: 'number', placeholder: 'e.g. 4.8', step: '0.1' },
            { key: 'hemoglobin', label: 'Hemoglobin (g/dL)', type: 'number', placeholder: 'e.g. 14.2', step: '0.1' },
            { key: 'hematocrit', label: 'Hematocrit (%)', type: 'number', placeholder: 'e.g. 42', step: '0.1' },
            { key: 'platelet_count', label: 'Platelets (x10^9/L)', type: 'number', placeholder: 'e.g. 250', step: '1' },
            { key: 'neutrophil_pct', label: 'Neutrophils (%)', type: 'number', placeholder: 'e.g. 55', step: '0.1' },
            { key: 'lymphocyte_pct', label: 'Lymphocytes (%)', type: 'number', placeholder: 'e.g. 30', step: '0.1' },
            { key: 'mcv', label: 'MCV (fL)', type: 'number', placeholder: 'e.g. 90', step: '0.1' },
            { key: 'mch', label: 'MCH (pg)', type: 'number', placeholder: 'e.g. 30', step: '0.1' },
        ]
    },
    {
        id: 'markers',
        title: 'Tumor Markers',
        icon: Beaker,
        fields: [
            { key: 'cea_level', label: 'CEA (ng/mL)', type: 'number', placeholder: 'e.g. 2.5', step: '0.01' },
            { key: 'ca125_level', label: 'CA-125 (U/mL)', type: 'number', placeholder: 'e.g. 21', step: '0.1' },
            { key: 'crp_level', label: 'CRP (mg/L)', type: 'number', placeholder: 'e.g. 1.5', step: '0.1' },
        ]
    }
];

const PatientDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // State management
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'questionnaire'
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        sex: 'Male',
        smoking_status: 'Non-Smoker',
        family_history_cancer: '0',
        occupational_exposure: '0',
        prior_cancer_diagnosis: '0',
        age: '', bmi: '', pack_years: '0', alcohol_use: '0',
        wbc_count: '', rbc_count: '', hemoglobin: '', hematocrit: '', platelet_count: '',
        neutrophil_pct: '', lymphocyte_pct: '', mcv: '', mch: '',
        cea_level: '', ca125_level: '', crp_level: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    // Appointment Modal State
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentDetails, setAppointmentDetails] = useState({ date: '', time: '' });
    const [appointmentSuccess, setAppointmentSuccess] = useState(false);
    const [recommendedDoctors, setRecommendedDoctors] = useState([]);
    const [isFindingDoctors, setIsFindingDoctors] = useState(false);

    // Auto-fill state
    const [extracting, setExtracting] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/assessments/patient/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setHistory(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };
        if (user._id) fetchHistory();
    }, [user._id]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleInputChange = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const nextStep = () => {
        if (currentStep < QUESTIONNAIRE_STEPS.length - 1) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const submitQuestionnaire = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData, patientId: user._id };
            const res = await fetch(`${API_URL}/predict/biomarkers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setResult({ risk_level: 'Low', risk_score: 1.2, error: true, top_factors: [] });
            }
        } catch {
            setResult({ risk_level: 'Low', risk_score: 1.2, error: true, top_factors: [] });
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setActiveSection('dashboard');
        setCurrentStep(0);
        setResult(null);
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!appointmentDetails.date || !appointmentDetails.time) return;

        setIsFindingDoctors(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/predict/recommend-doctors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    risk_level: result?.risk_level,
                    risk_score: result?.risk_score,
                    top_factors: result?.top_factors
                })
            });
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                setRecommendedDoctors(data.data);
            } else {
                // fallback if no doctors or error
                setAppointmentSuccess(true);
            }
        } catch (err) {
            console.error("Error finding doctors:", err);
            setAppointmentSuccess(true);
        } finally {
            setIsFindingDoctors(false);
        }
    };

    const finalizeAppointment = async (doctorId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/appointments/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    doctorId,
                    date: appointmentDetails.date,
                    time: appointmentDetails.time,
                    risk_level: result?.risk_level,
                    risk_score: result?.risk_score,
                    top_factors: result?.top_factors
                })
            });
        } catch (err) {
            console.error('Error saving appointment:', err);
        }
        setAppointmentSuccess(true);
        setTimeout(() => {
            setShowAppointmentModal(false);
            setAppointmentSuccess(false);
            setAppointmentDetails({ date: '', time: '' });
            setRecommendedDoctors([]);
        }, 3000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setExtracting(true);
        const formDataPayload = new FormData();
        formDataPayload.append('report', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/predict/extract`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataPayload
            });
            const result = await res.json();

            if (result.success && result.data) {
                setFormData(prev => ({
                    ...prev,
                    ...result.data
                }));
                alert("Report successfully scanned and your data has been auto-filled!");
            } else {
                alert("Could not extract data from the file. Please check if the file is clear.");
            }
        } catch (err) {
            console.error("Extraction error:", err);
            alert("An error occurred while scanning the document.");
        } finally {
            setExtracting(false);
            e.target.value = null; // reset input
        }
    };

    const handleDeleteHistory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this checkup?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/assessments/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(prev => prev.filter(h => h._id !== id));
            }
        } catch (err) {
            console.error("Failed to delete assessment:", err);
        }
    };

    // Card Animations
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const lastCheckupDate = history.length > 0
        ? new Date(history[0].createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' })
        : 'None';
    const latestRisk = history.length > 0 ? history[0].riskLevel : 'Pending';
    const isHighRisk = latestRisk === 'High';

    return (
        <div className="dashboard-page">
            {/* Top Navigation */}
            <nav className="dash-nav">
                <div className="dash-nav-brand">
                    <div className="dash-nav-brand-icon">
                        <Activity size={22} strokeWidth={2.5} />
                    </div>
                    CarePortal
                </div>
                <div className="dash-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="flex items-center gap-3">
                        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D8ABC&color=fff&rounded=true`}
                                alt="Profile"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--slate-200)', position: 'absolute', top: 0, left: 0, zIndex: 2 }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--teal-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                {user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                        </div>
                        <span className="dash-role-badge">Patient</span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <main className="dash-main">
                <AnimatePresence mode="wait">
                    {/* ──── DASHBOARD VIEW ──── */}
                    {activeSection === 'dashboard' && (
                        <motion.div key="dashboard" variants={cardVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-800)', letterSpacing: '-0.5px' }}>
                                    Welcome back, {user.name?.split(' ')[0] || 'Patient'} 👋
                                </h1>
                                <p style={{ fontSize: '16px', color: 'var(--slate-500)', marginTop: '6px' }}>
                                    Let's take a look at your health profile overview.
                                </p>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-icon-wrapper"><CheckCircle size={28} /></div>
                                    <div className="metric-content">
                                        <div className="metric-value">100%</div>
                                        <div className="metric-label">Profile Completion</div>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon-wrapper"><CalendarClock size={28} /></div>
                                    <div className="metric-content">
                                        <div className="metric-value">{lastCheckupDate}</div>
                                        <div className="metric-label">Last Checkup</div>
                                    </div>
                                </div>
                                <div className={`metric-card ${isHighRisk ? 'alert' : ''}`}>
                                    <div className="metric-icon-wrapper"><ShieldAlert size={28} /></div>
                                    <div className="metric-content">
                                        <div className="metric-value">{latestRisk}</div>
                                        <div className="metric-label">Risk Assessment</div>
                                    </div>
                                </div>
                            </div>

                            <div className="dash-card">
                                <div className="dash-card-header">
                                    <h2 className="dash-card-title"><FlaskConical fill="var(--teal-100)" stroke="var(--teal-600)" /> AI Risk Assessment</h2>
                                    <p className="dash-card-subtitle">Complete our comprehensive medical questionnaire and input your latest blood panel results for an AI-powered cancer risk assessment.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <button className="btn btn-primary" onClick={() => setActiveSection('questionnaire')} style={{ padding: '16px 32px', fontSize: '16px' }}>
                                        Start Evaluation <ChevronRight size={20} />
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setActiveSection('history')} style={{ padding: '16px 32px', fontSize: '16px', background: 'white', border: '1px solid var(--slate-200)' }}>
                                        <History size={20} /> View History
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ──── HISTORY VIEW ──── */}
                    {activeSection === 'history' && (
                        <motion.div key="history" variants={cardVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }}>
                            <button className="btn btn-secondary" onClick={resetFlow} style={{ marginBottom: '24px', padding: '10px 16px', fontSize: '14px', borderRadius: '10px', background: 'white', border: '1px solid var(--slate-200)' }}>
                                <ChevronLeft size={16} /> Back to Dashboard
                            </button>

                            <div className="dash-card">
                                <div className="dash-card-header mb-6">
                                    <h2 className="dash-card-title"><History size={24} color="var(--blue-600)" style={{ marginRight: '10px' }} /> Assessment History</h2>
                                    <p className="dash-card-subtitle">Review your past checkups and AI confidence metrics.</p>
                                </div>

                                {history.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
                                        No assessments found. Complete your first evaluation to see history!
                                    </div>
                                ) : (
                                    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {history.map((record) => (
                                            <div key={record._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--slate-800)', marginBottom: '4px' }}>
                                                        {new Date(record.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--slate-600)' }}>
                                                        <span style={{ color: record.riskLevel === 'High' ? 'var(--red-600)' : record.riskLevel === 'Medium' ? 'var(--orange-600)' : 'var(--emerald-600)', fontWeight: 'bold' }}>
                                                            {record.riskLevel} Risk
                                                        </span>
                                                        <span>•</span>
                                                        <span>Score: {record.riskScore?.toFixed(1) || '--'}%</span>
                                                    </div>
                                                    {record.aiInsight && (
                                                        <div style={{ marginTop: '12px', fontSize: '13.5px', color: 'var(--slate-600)', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--blue-100)', borderLeft: '3px solid var(--blue-500)', lineHeight: '1.5' }}>
                                                            <strong>AI Doctor's Note:</strong> {record.aiInsight}
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => handleDeleteHistory(record._id)} style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} title="Delete Record">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ──── QUESTIONNAIRE & RESULT VIEW ──── */}
                    {activeSection === 'questionnaire' && (
                        <motion.div key="questionnaire" variants={cardVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }}>
                            <button className="btn btn-secondary" onClick={resetFlow} style={{ marginBottom: '24px', padding: '10px 16px', fontSize: '14px', borderRadius: '10px' }}>
                                <ChevronLeft size={16} /> Back to Dashboard
                            </button>

                            <div className="dash-card">
                                {!result && (
                                    <>
                                        {/* Stepper Progress */}
                                        <div className="stepper-container">
                                            {QUESTIONNAIRE_STEPS.map((step, idx) => {
                                                const Icon = step.icon;
                                                const isActive = idx === currentStep;
                                                const isCompleted = idx < currentStep;
                                                return (
                                                    <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                                        <div className="step-icon-wrapper">
                                                            {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
                                                        </div>
                                                        <span className="step-label">{step.title}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Step Content */}
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="dash-card-header">
                                                <h2 className="dash-card-title">{QUESTIONNAIRE_STEPS[currentStep].title}</h2>
                                                <p className="dash-card-subtitle">Please ensure all values are accurate and match your medical records.</p>

                                                {currentStep === 0 && (
                                                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'linear-gradient(145deg, #f0f9ff 0%, #ffffff 100%)', padding: '32px 24px', borderRadius: '16px', border: '2px dashed #93c5fd', textAlign: 'center', boxShadow: '0 4px 20px -5px rgba(13, 138, 188, 0.15)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', marginBottom: '8px' }}>
                                                            <FileText size={32} />
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px' }}>
                                                                Auto-Fill with AI
                                                            </h4>
                                                            <p style={{ fontSize: '15px', color: '#475569', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                                                                Skip the manual typing! Upload a clear photo or PDF of your lab results and our advanced AI will instantly extract and fill in your biomarkers.
                                                            </p>
                                                        </div>
                                                        <label className={`btn btn-primary ${extracting ? 'disabled' : ''}`} style={{ marginTop: '12px', cursor: extracting ? 'not-allowed' : 'pointer', background: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 36px', fontSize: '17px', borderRadius: '50px', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.25)' }}>
                                                            {extracting ? <span className="btn-spinner" /> : <Upload size={22} />}
                                                            {extracting ? 'Scanning Document...' : 'Upload Medical Report'}
                                                            <input
                                                                type="file"
                                                                accept="application/pdf,image/png,image/jpeg,image/jpg"
                                                                style={{ display: 'none' }}
                                                                onChange={handleFileUpload}
                                                                disabled={extracting}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="form-grid">
                                                {QUESTIONNAIRE_STEPS[currentStep].fields.map(f => (
                                                    <div className="form-group" key={f.key}>
                                                        <label>{f.label}</label>
                                                        {f.type === 'select' ? (
                                                            <select
                                                                className="form-select"
                                                                value={formData[f.key]}
                                                                onChange={e => handleInputChange(f.key, e.target.value)}
                                                            >
                                                                {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                step={f.step || "any"}
                                                                className="form-input"
                                                                placeholder={f.placeholder}
                                                                value={formData[f.key]}
                                                                onChange={e => handleInputChange(f.key, e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={prevStep}
                                                    disabled={currentStep === 0}
                                                    style={{ opacity: currentStep === 0 ? 0 : 1 }}
                                                >
                                                    <ChevronLeft size={20} /> Previous
                                                </button>

                                                {currentStep < QUESTIONNAIRE_STEPS.length - 1 ? (
                                                    <button className="btn btn-primary" onClick={nextStep}>
                                                        Next Step <ChevronRight size={20} />
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-primary" onClick={submitQuestionnaire} disabled={loading}>
                                                        {loading ? <span className="btn-spinner" style={{ marginRight: '8px' }} /> : <Activity size={20} />}
                                                        Analyze Results
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}

                                {/* Results View */}
                                {result && (
                                    <motion.div className="result-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                                        {/* Print Only Header */}
                                        <div className="print-header" style={{ display: 'none' }}>
                                            <div>
                                                <h1>CarePortal AI Diagnosis</h1>
                                                <div style={{ color: 'var(--slate-500)', marginTop: '4px' }}>Automated Oncological Risk Assessment</div>
                                            </div>
                                            <div className="meta">
                                                <div>Patient ID: {user._id?.substring(0, 8).toUpperCase()}</div>
                                                <div>Name: {user.name || 'N/A'}</div>
                                                <div>Date: {new Date().toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className={`risk-circle ${result.risk_level}-risk`}>
                                            <div className="risk-score">{result.risk_score?.toFixed(1) || '0.0'}%</div>
                                            <div className="risk-label">{result.risk_level} RISK</div>
                                        </div>

                                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '8px' }} className="d-print-none">
                                            Assessment Complete
                                        </h2>
                                        <p style={{ fontSize: '15px', color: 'var(--slate-500)', maxWidth: '500px', margin: '0 auto' }} className="d-print-none">
                                            {result.risk_level === 'High'
                                                ? "Our AI detected significant patterns indicating high risk. Please consult an oncologist immediately."
                                                : result.risk_level === 'Medium'
                                                    ? "Moderate risk patterns identified. We recommend scheduling a follow-up with your primary physician."
                                                    : "No significant high-risk markers were detected in your current profile."}
                                        </p>

                                        {result.ai_insight && (
                                            <div style={{ marginTop: '24px', textAlign: 'left', background: 'var(--blue-50)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--blue-100)' }} className="d-print-none">
                                                <h3 style={{ fontSize: '15px', color: 'var(--blue-800)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FlaskConical size={16} /> AI Personalized Note
                                                </h3>
                                                <p style={{ fontSize: '14px', color: 'var(--blue-900)', lineHeight: '1.6', margin: 0 }}>
                                                    {result.ai_insight}
                                                </p>
                                            </div>
                                        )}

                                        {/* Clinical Notes Section (Visible in Print) */}
                                        <div className="print-only" style={{ display: 'none', textAlign: 'left', marginTop: '20px', marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>Clinical Interpretation</h3>
                                            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                                {result.risk_level === 'High'
                                                    ? "URGENT ONCOLOGY REVIEW RECOMMENDED. Model indicates a high probability of malignant patterns based on the current biomarker panel and patient history."
                                                    : result.risk_level === 'Medium'
                                                        ? "ROUTINE FOLLOW-UP RECOMMENDED. Model flags moderate deviations from a healthy baseline. Consider repeating the blood panel in 3-6 months."
                                                        : "ROUTINE SCREENING. Assessed biomarker panel falls within standard healthy parameters."}
                                            </p>
                                        </div>

                                        {result.top_factors && result.top_factors.length > 0 && (
                                            <div className="factors-list">
                                                <h4>Key Contributing Factors</h4>
                                                {result.top_factors.map((factor, idx) => (
                                                    <div className="factor-item" key={idx}>
                                                        <div>
                                                            <div className="factor-name">{factor.label}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Score: {factor.score > 0 ? '+' : ''}{factor.score}</div>
                                                            <div className={`factor-impact ${factor.type === 'positive' ? 'increases-risk' : 'decreases-risk'}`}>
                                                                {factor.type === 'positive' ? '↑ Elevated Risk' : '↓ Lowers Risk'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="action-buttons d-print-none" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                                            <button onClick={() => setShowAppointmentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md">
                                                <Stethoscope size={18} /> <span className="text-white">Consult a Doctor</span>
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => window.print()} style={{ background: 'white', color: 'var(--slate-700)', border: '1px solid var(--slate-200)' }}>
                                                <Activity size={18} /> Download Medical Report
                                            </button>
                                            <button className="btn btn-outline" onClick={resetFlow}>Retake Assessment</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ──── APPOINTMENT MODAL ──── */}
                <AnimatePresence>
                    {showAppointmentModal && (
                        <motion.div
                            className="modal-backdrop d-print-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <motion.div
                                className="dash-card"
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                style={{ width: '90%', maxWidth: '440px', margin: '0 20px', position: 'relative', background: 'white', borderRadius: '16px', padding: '32px' }}
                            >
                                <button onClick={() => setShowAppointmentModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <X size={20} color="var(--slate-400)" />
                                </button>

                                {appointmentSuccess ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ width: '64px', height: '64px', background: 'var(--emerald-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                            <CheckCircle size={32} color="var(--emerald-500)" />
                                        </div>
                                        <h3 style={{ color: 'var(--emerald-600)', marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' }}>Appointment Requested!</h3>
                                        <p style={{ fontSize: '15px', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                                            We've securely forwarded your risk assessment report and preferred time to our network of oncologists. They will contact you shortly to confirm.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                            <div style={{ width: '56px', height: '56px', background: 'var(--blue-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                                <Stethoscope size={28} color="var(--blue-600)" />
                                            </div>
                                            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--slate-800)', marginBottom: '8px' }}>Consult a Specialist</h2>
                                            <p style={{ fontSize: '14px', color: 'var(--slate-500)', lineHeight: '1.5' }}>Schedule a follow-up appointment to review your assessment report with a certified oncologist.</p>
                                        </div>

                                        <form onSubmit={handleBookAppointment}>
                                            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--slate-700)', marginBottom: '6px' }}>Preferred Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={appointmentDetails.date}
                                                    onChange={(e) => setAppointmentDetails(prev => ({ ...prev, date: e.target.value }))}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--slate-200)', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--slate-700)', marginBottom: '6px' }}>Preferred Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={appointmentDetails.time}
                                                    onChange={(e) => setAppointmentDetails(prev => ({ ...prev, time: e.target.value }))}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid var(--slate-200)', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <button type="submit" disabled={isFindingDoctors} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                                {isFindingDoctors ? <span className="btn-spinner" /> : <Calendar size={20} />}
                                                <span className="text-white">{isFindingDoctors ? "Finding Best Matches..." : "Find Doctors"}</span>
                                            </button>
                                        </form>
                                    </>
                                )}

                                {recommendedDoctors.length > 0 && !appointmentSuccess && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px', borderTop: '1px solid var(--slate-200)', paddingTop: '24px', textAlign: 'left' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--slate-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={18} color="var(--blue-500)" /> AI Recommended Specialists
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {recommendedDoctors.map((doc, idx) => (
                                                <div key={idx} style={{ padding: '16px', border: '1px solid var(--slate-200)', borderRadius: '12px', background: 'var(--slate-50)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', color: 'var(--slate-800)', fontSize: '15px' }}>Dr. {doc.name}</div>
                                                            <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>{doc.specialization} • {doc.hospital}</div>
                                                        </div>
                                                        <div style={{ background: 'var(--blue-100)', color: 'var(--blue-700)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                            {doc.matchPercentage}% Match
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: 'var(--slate-600)', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-100)', lineHeight: '1.4' }}>
                                                        <strong>AI Insight:</strong> {doc.reason}
                                                    </div>
                                                    <button onClick={() => finalizeAppointment(doc.doctorId)} className="btn btn-primary" style={{ marginTop: '4px', padding: '8px', fontSize: '13px', background: 'white', color: 'var(--blue-600)', border: '1px solid var(--blue-200)' }}>
                                                        Book with Dr. {doc.name}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main >
        </div >
    );
};

export default PatientDashboard;
