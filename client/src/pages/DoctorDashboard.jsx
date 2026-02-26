import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Users, FlaskConical, Activity, AlertCircle, FileText, UploadCloud, ChevronRight, X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './Dashboard.css';

const API_URL = 'http://localhost:3000/api';

// Demo assigned patients specific to this doctor
const DEMO_ASSIGNED_PATIENTS = [
    { id: 1, name: 'Ankita Sharma', age: 34, targetCancer: 'Breast Cancer', risk: 'high', tested: '2h ago', mobile: '+91 9876543210', bloodGroup: 'O+', history: 'Mother (Breast Cancer)' },
    { id: 2, name: 'Rohan Gupta', age: 45, targetCancer: 'Oral Cancer', risk: 'moderate', tested: '1d ago', mobile: '+91 9876543211', bloodGroup: 'B+', history: 'None' },
];

const DocumentUploadDropzone = ({ label, dropzone, file }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>{label}</div>
        <div
            {...dropzone.getRootProps()}
            style={{ border: `1.5px dashed ${dropzone.isDragActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: '16px', textAlign: 'center', background: dropzone.isDragActive ? 'var(--primary-light)' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <input {...dropzone.getInputProps()} />
            {!file ? (
                <>
                    <UploadCloud size={24} color={dropzone.isDragActive ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: 8 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click or drag file</span>
                </>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 500, fontSize: 13 }}>
                    <FileText size={16} /> {file.name}
                </div>
            )}
        </div>
    </div>
);

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [patients] = useState(DEMO_ASSIGNED_PATIENTS);

    // Profile Completion State
    const [profileComplete, setProfileComplete] = useState(user.profileComplete || false);
    const [profileData, setProfileData] = useState({ specialization: '' });
    const [uploadedDocs, setUploadedDocs] = useState({ degree: null, certificate: null, id: null });

    // UI State
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // --- File Upload Logic ---
    const onDropDegree = useCallback(acceptedFiles => setUploadedDocs(prev => ({ ...prev, degree: acceptedFiles[0] })), []);
    const onDropCert = useCallback(acceptedFiles => setUploadedDocs(prev => ({ ...prev, certificate: acceptedFiles[0] })), []);
    const onDropId = useCallback(acceptedFiles => setUploadedDocs(prev => ({ ...prev, id: acceptedFiles[0] })), []);

    const dropzoneDegree = useDropzone({ onDrop: onDropDegree, maxFiles: 1 });
    const dropzoneCert = useDropzone({ onDrop: onDropCert, maxFiles: 1 });
    const dropzoneId = useDropzone({ onDrop: onDropId, maxFiles: 1 });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const updatedUser = { ...user, profileComplete: true, specialization: profileData.specialization };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setProfileComplete(true);
    };

    // --- Render Helpers ---
    const riskBadge = (risk) => {
        const map = { high: 'badge-high', moderate: 'badge-moderate', low: 'badge-low' };
        const labels = { high: '⚠ High Risk', moderate: '🔶 Moderate Risk', low: '✅ Low Risk' };
        return <span className={`list-badge ${map[risk]}`}>{labels[risk]}</span>;
    };

    return (
        <div className="dashboard-page relative" style={{ background: '#f8fafc' }}>

            {/* --- Doctor Verification Modal --- */}
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
                            style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <ShieldCheck size={28} color="var(--primary)" />
                                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>Verify Professional Profile</h2>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Upload your credentials to activate your oncologist dashboard.</p>

                            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

                                <div className="form-field" style={{ marginBottom: 20 }}>
                                    <label>Specialization *</label>
                                    <select required value={profileData.specialization} onChange={(e) => setProfileData({ specialization: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 14 }}>
                                        <option value="">Select Primary Specialization</option>
                                        <option value="Breast Cancer Specialist">Breast Cancer Specialist</option>
                                        <option value="Oral Cancer Specialist">Oral Cancer Specialist</option>
                                        <option value="Cervical Cancer Specialist">Cervical Cancer Specialist</option>
                                        <option value="Skin Cancer Specialist">Skin Cancer Specialist</option>
                                    </select>
                                </div>

                                <DocumentUploadDropzone label="1. Medical Degree (MBBS/MD)" dropzone={dropzoneDegree} file={uploadedDocs.degree} />
                                <DocumentUploadDropzone label="2. Specialty Certificate (Oncology)" dropzone={dropzoneCert} file={uploadedDocs.certificate} />
                                <DocumentUploadDropzone label="3. Government/Medical License ID" dropzone={dropzoneId} file={uploadedDocs.id} />

                                <button type="submit" className="btn-primary" style={{ marginTop: 12, padding: '16px' }} disabled={!uploadedDocs.degree || !uploadedDocs.certificate || !uploadedDocs.id || !profileData.specialization}>
                                    Submit for Verification <ChevronRight size={18} />
                                </button>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>Verification usually takes 1-2 business days.</p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Patient Detail Modal --- */}
            <AnimatePresence>
                {selectedPatient && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedPatient(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 24, padding: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {selectedPatient.name}
                                            {riskBadge(selectedPatient.risk)}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Age: {selectedPatient.age} | Blood: {selectedPatient.bloodGroup} | Ph: {selectedPatient.mobile}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Target Screening</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>{selectedPatient.targetCancer}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Family History</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)' }}>{selectedPatient.history}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>Uploaded Medical Documents</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-body)' }}>
                                            <FileText size={18} color="var(--primary)" /> latest_blood_report.pdf
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploaded yesterday</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-body)' }}>
                                            <FileText size={18} color="var(--primary)" /> past_prescription.jpg
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploaded 2 days ago</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, border: '1px solid var(--primary)', background: 'white', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14 }} className="hover-bg-primary-light">
                                    <Send size={16} /> Send Update / Notification to Patient
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="dash-nav" style={{ filter: !profileComplete ? 'blur(4px)' : 'none', pointerEvents: !profileComplete ? 'none' : 'auto' }}>
                <div className="dash-nav-brand"><span>🩺</span> CarePortal</div>
                <div className="dash-nav-right">
                    <span className="dash-role-badge">Doctor</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={14} style={{ display: 'inline', marginRight: 4 }} /> Logout
                    </button>
                </div>
            </nav>

            <main className="dash-main" style={{ maxWidth: '800px', filter: !profileComplete ? 'blur(4px)' : 'none', pointerEvents: !profileComplete ? 'none' : 'auto' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>Dr. {user.name || 'Doctor'}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user.specialization || 'Oncologist'} · License: {user.licenseNumber || 'Verified'}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 13, border: '1px solid var(--border)', fontWeight: 600, color: 'var(--success)' }}>
                            <ShieldCheck size={16} /> Verified Profile
                        </div>
                    </div>

                    <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 12, border: '1px solid var(--primary-border)', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <AlertCircle size={20} color="var(--primary)" style={{ flexShrink: 0, mt: 2 }} />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>Patient-Wise View</div>
                            <div style={{ fontSize: 13, color: 'var(--text-dark)' }}>This list strictly shows patients who have explicitly chosen you as their consulting specialist.</div>
                        </div>
                    </div>

                    <p className="dash-section-title">My Assigned Patients ({patients.length})</p>

                    {/* Patient Grid View */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {patients.map(p => (
                            <motion.div
                                key={p.id}
                                whileHover={{ y: -2 }}
                                onClick={() => setSelectedPatient(p)}
                                style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}
                            >
                                {/* Top Color Bar based on risk */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: p.risk === 'high' ? 'var(--error)' : p.risk === 'moderate' ? 'var(--warning)' : 'var(--success)' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 2 }}>{p.name}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Age {p.age} · {p.targetCancer}</div>
                                    </div>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f8fafc', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, border: '1px solid var(--border)' }}>
                                        {p.name.charAt(0)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                    {riskBadge(p.risk)}
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FlaskConical size={12} /> Tested {p.tested}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {patients.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            No patients assigned to you yet.
                        </div>
                    )}

                </motion.div>
            </main>

            <style>{`
                .hover-bg-primary-light:hover { background: var(--primary-light) !important; }
            `}</style>
        </div>
    );
};

export default DoctorDashboard;
