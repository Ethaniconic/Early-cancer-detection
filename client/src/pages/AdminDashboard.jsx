import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, Stethoscope, ShieldCheck, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css';

// Demo stats — replace with real API once admin endpoints are ready
const DEMO_USERS = [
    { id: 1, name: 'Riya Desai', role: 'user', joined: '2h ago' },
    { id: 2, name: 'Dr. Arjun M.', role: 'doctor', joined: '1d ago' },
    { id: 3, name: 'Sunita Rao', role: 'user', joined: '2d ago' },
    { id: 4, name: 'Dr. Priya K.', role: 'doctor', joined: '3d ago' },
    { id: 5, name: 'Test Admin', role: 'admin', joined: '5d ago' },
];

const ROLE_ICON = {
    user: <Users size={14} />,
    doctor: <Stethoscope size={14} />,
    admin: <ShieldCheck size={14} />,
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [users] = useState(DEMO_USERS);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const counts = {
        total: users.length,
        patients: users.filter(u => u.role === 'user').length,
        doctors: users.filter(u => u.role === 'doctor').length,
    };

    const roleLabel = (role) => {
        const map = { user: 'Patient', doctor: 'Doctor', admin: 'Admin' };
        const color = { user: 'var(--primary)', doctor: '#6366f1', admin: 'var(--warning)' };
        return (
            <span style={{ fontSize: 11, fontWeight: 600, color: color[role], display: 'flex', alignItems: 'center', gap: 4 }}>
                {ROLE_ICON[role]} {map[role]}
            </span>
        );
    };

    return (
        <div className="dashboard-page">
            <nav className="dash-nav">
                <div className="dash-nav-brand"><span>🩺</span> CarePortal</div>
                <div className="dash-nav-right">
                    <span className="dash-role-badge">Admin</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={14} style={{ display: 'inline', marginRight: 4 }} /> Logout
                    </button>
                </div>
            </nav>

            <main className="dash-main">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="dash-welcome">
                        <h2>Admin Panel 🛡️</h2>
                        <p>Welcome, {user.name || 'Admin'}. Manage users and platform activity.</p>
                    </div>

                    {/* Stats */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <div className="stat-number">{counts.total}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number" style={{ color: '#6366f1' }}>{counts.doctors}</div>
                            <div className="stat-label">Doctors</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{counts.patients}</div>
                            <div className="stat-label">Patients</div>
                        </div>
                    </div>

                    {/* User List */}
                    <p className="dash-section-title">Registered Users</p>
                    <div className="dash-card">
                        {users.map(u => (
                            <div key={u.id} className="list-item">
                                <div className="list-avatar">{u.name.charAt(0)}</div>
                                <div className="list-info">
                                    <div className="list-name">{u.name}</div>
                                    <div className="list-meta">Joined {u.joined}</div>
                                </div>
                                {roleLabel(u.role)}
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <p className="dash-section-title">Management</p>
                    <div className="quick-actions">
                        <button className="action-btn">
                            <div className="action-icon"><Users size={18} /></div>
                            Manage Users
                        </button>
                        <button className="action-btn">
                            <div className="action-icon"><BarChart2 size={18} /></div>
                            View Reports
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AdminDashboard;
