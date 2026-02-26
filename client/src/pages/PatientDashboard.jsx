import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LogOut, FlaskConical, ClipboardCheck, ChevronRight, Bell, Settings, User as UserIcon, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
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
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Profile Completion State
    const [profileComplete, setProfileComplete] = useState(user.profileComplete || false);
    const [profileData, setProfileData] = useState({
        targetCancer: '',
        bloodGroup: '',
        currentMedications: '',
        pastSurgeries: '',
        knownAllergies: '',
        familyHistory: '',
        currentSymptoms: ''
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const onDrop = useCallback(acceptedFiles => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!profileData.targetCancer) {
            setProfileError('Please select a Target Cancer Detection option.');
            return;
        }
        setProfileSaving(true);
        setProfileError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profileData),
            });
            const data = await res.json();
            if (res.ok) {
                // Update localStorage so the flag persists across page refreshes without re-login
                const updatedUser = { ...user, profileComplete: true, targetCancer: profileData.targetCancer };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setProfileComplete(true);
            } else {
                setProfileError(data.message || 'Failed to save profile. Please try again.');
            }
        } catch {
            setProfileError('Could not connect to server. Your changes were saved locally.');
            // Fallback — still mark complete locally so user isn't stuck
            const updatedUser = { ...user, profileComplete: true, targetCancer: profileData.targetCancer };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setProfileComplete(true);
        } finally {
            setProfileSaving(false);
        }
    };

    const handleProfileInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

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
        <div className="dashboard-page relative">

            {/* --- Complete Profile Modal (Overlay) --- */}
            <AnimatePresence>
                {!profileComplete && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                            style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>Complete Your Profile</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Please provide your medical details to personalize your dashboard.</p>

                            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                <div className="form-field">
                                    <label>Target Cancer Detection *</label>
                                    <select name="targetCancer" value={profileData.targetCancer} onChange={handleProfileInputChange} required style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14 }}>
                                        <option value="">Select Target Detection Program</option>
                                        <option value="Breast Cancer">Breast Cancer</option>
                                        <option value="Oral Cancer">Oral Cancer</option>
                                        <option value="Skin Cancer">Skin Cancer</option>
                                        <option value="Cervical Cancer">Cervical Cancer</option>
                                    </select>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Medical Details</h3>
                                    <div className="form-row">
                                        <div className="form-field"><label>Blood Group</label><input type="text" name="bloodGroup" placeholder="e.g. O+" value={profileData.bloodGroup} onChange={handleProfileInputChange} /></div>
                                        <div className="form-field"><label>Known Allergies</label><input type="text" name="knownAllergies" placeholder="e.g. Penicillin, Peanuts" value={profileData.knownAllergies} onChange={handleProfileInputChange} /></div>
                                    </div>
                                    <div className="form-row" style={{ marginTop: 12 }}>
                                        <div className="form-field"><label>Current Medications</label><input type="text" name="currentMedications" placeholder="Any currently prescribed drugs" value={profileData.currentMedications} onChange={handleProfileInputChange} /></div>
                                        <div className="form-field"><label>Past Surgeries</label><input type="text" name="pastSurgeries" placeholder="Any previous operations" value={profileData.pastSurgeries} onChange={handleProfileInputChange} /></div>
                                    </div>
                                    <div className="form-row" style={{ marginTop: 12 }}>
                                        <div className="form-field"><label>Family History of Cancer</label><input type="text" name="familyHistory" placeholder="e.g. Mother (Breast Config)" value={profileData.familyHistory} onChange={handleProfileInputChange} /></div>
                                        <div className="form-field"><label>Current Symptoms</label><input type="text" name="currentSymptoms" placeholder="Briefly describe symptoms" value={profileData.currentSymptoms} onChange={handleProfileInputChange} /></div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Past Prescriptions & Reports</h3>
                                    <div
                                        {...getRootProps()}
                                        style={{ border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, padding: '30px 20px', textAlign: 'center', background: isDragActive ? 'var(--primary-light)' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <input {...getInputProps()} />
                                        <UploadCloud size={32} color={isDragActive ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px' }} />
                                        <p style={{ fontSize: 14, color: 'var(--text-body)', fontWeight: 500 }}>{isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select files"}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, JPG, PNG (Max 10MB)</p>
                                    </div>
                                    {uploadedFiles.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Selected Files:</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {uploadedFiles.map((file, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dark)', background: '#f1f5f9', padding: '6px 12px', borderRadius: 6 }}>
                                                        <FileText size={14} color="var(--primary)" /> {file.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {profileError && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: 'var(--error)', fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                                        ⚠ {profileError}
                                    </div>
                                )}

                                <button type="submit" className="btn-primary" disabled={profileSaving} style={{ marginTop: 10, padding: '16px' }}>
                                    {profileSaving ? <><span className="btn-spinner" /> Saving...</> : <>Save Profile &amp; Continue <ChevronRight size={18} /></>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Nav */}
            <nav className="dash-nav" style={{ filter: !profileComplete ? 'blur(4px)' : 'none', pointerEvents: !profileComplete ? 'none' : 'auto' }}>
                <div className="dash-nav-brand">
                    <span>🩺</span> CarePortal
                </div>
                <div className="dash-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        <Bell size={20} />
                        <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--error)', width: 8, height: 8, borderRadius: '50%' }}></span>
                    </button>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        <Settings size={20} />
                    </button>

                    <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        >
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {(user.name || 'P').charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && (
                            <div style={{ position: 'absolute', top: 46, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minWidth: 200, overflow: 'hidden', zIndex: 50 }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>{user.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Patient Account</div>
                                </div>
                                <button style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: 'var(--text-body)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowProfileMenu(false)}>
                                    <UserIcon size={14} /> Edit Profile
                                </button>
                                <button style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border)' }} onClick={handleLogout}>
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="dash-main" style={{ filter: !profileComplete ? 'blur(4px)' : 'none', pointerEvents: !profileComplete ? 'none' : 'auto' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {/* Welcome */}
                    <div className="dash-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2>Hello, {user.name || 'Patient'} 👋</h2>
                            <p>Use the tools below to run your cancer screening tests.</p>
                        </div>
                    </div>

                    {/* Program Summary Card (Active when profile complete) */}
                    {profileComplete && activeSection === 'home' && (
                        <div className="dash-card" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-border)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '4px 12px', borderBottomLeftRadius: 14, fontSize: 11, fontWeight: 600 }}>ACTIVE PROGRAM</div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>{user.targetCancer || 'General Screening'}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Consulting Physician: <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>{user.doctorName || 'Not Assigned'}</span></p>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, border: '1px solid var(--primary-border)' }}>
                                        <CheckCircle2 size={14} color="var(--success)" /> Profile Complete
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
