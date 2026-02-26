import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Users, Stethoscope, ShieldCheck,
    BarChart2, Search, Filter, Ban, Trash2, X, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ROLE_ICON = {
    user: <Users size={16} />,
    doctor: <Stethoscope size={16} />,
    admin: <ShieldCheck size={16} />,
};

const ROLE_LABEL = {
    user: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin'
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [users, setUsers] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Add state for profile menu to show logout button
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // In a real app, you'd fetch all users for the admin table
                const response = await fetch('http://localhost:3000/api/users/recent');
                const data = await response.json();

                // Add mock status and lastLogin for the table if missing
                const enhancedData = data.map(u => ({
                    ...u,
                    status: u.status || 'Active',
                    lastLogin: u.lastLogin || new Date(Date.now() - Math.random() * 10000000000).toISOString()
                }));

                setUsers(enhancedData);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }
        };
        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Stats calculations
    const stats = {
        patients: users.filter(u => u.role === 'user'),
        doctors: users.filter(u => u.role === 'doctor'),
        admins: users.filter(u => u.role === 'admin'),
    };

    // Filtering logic for the table
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const openUserModal = (user) => {
        setSelectedUser(user);
    };

    // Action Handlers (Mock logic)
    const handleBlockUser = (e, userId) => {
        e.stopPropagation();
        setUsers(users.map(u => u._id === userId ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
    };

    const handleRemoveUser = (e, userId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to permanently delete this user?")) {
            setUsers(users.filter(u => u._id !== userId));
        }
    };

    return (
        <div className="dashboard-page flex-row" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

            {/* --- Modals --- */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', borderRadius: 24, padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>
                                    {selectedUser.role === 'user' ? 'Patient Details' : selectedUser.role === 'doctor' ? 'Doctor Details' : 'Admin Details'}
                                </h2>
                                <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>{selectedUser.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        {ROLE_ICON[selectedUser.role]} {ROLE_LABEL[selectedUser.role]}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Role Specific Details (Mocked for demonstration) */}
                            {selectedUser.role === 'user' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Cancer Screening</div>
                                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-dark)', marginTop: 4 }}>{selectedUser.targetCancer || 'Breast Cancer (Mock Demo)'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consulting Doctor</div>
                                        <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 500, marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Dr. Arjun Mehta (Link) <ChevronRight size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</div>
                                        <div style={{ fontSize: 15, color: 'var(--text-body)', marginTop: 4 }}>{selectedUser.mobile || '+91 9876543210'}</div>
                                    </div>
                                </div>
                            )}

                            {selectedUser.role === 'doctor' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Specialization</div>
                                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-dark)', marginTop: 4 }}>{selectedUser.specialization || 'Oncologist'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medical License Number</div>
                                        <div style={{ fontSize: 15, color: 'var(--text-body)', marginTop: 4, fontFamily: 'monospace' }}>{selectedUser.licenseNumber || 'MED-2023-XYZ'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Degree</div>
                                        <div style={{ fontSize: 14, color: 'var(--success)', fontWeight: 500, marginTop: 4, background: '#f0fdf4', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            <ShieldCheck size={14} /> Document Verified
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Top Navigation Bar --- */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, height: '72px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>
                    <span>🩺</span> CarePortal Admin
                </div>

                {/* Center Navigation Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', background: activeTab === 'overview' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <BarChart2 size={18} /> Dashboard Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', background: activeTab === 'users' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <Users size={18} /> Manage Users
                    </button>
                </div>

                {/* Right Profile & Logout Dropdown */}
                <div style={{ position: 'relative' }}>
                    <div
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>{currentUser.name || 'System Admin'}</div>
                            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>Super Administrator</div>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {(currentUser.name || 'A').charAt(0).toUpperCase()}
                        </div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '180px', zIndex: 110 }}
                                >
                                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', background: 'none', border: 'none', color: 'var(--error)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-slate">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* --- Main Content Area --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                        {activeTab === 'overview' && (
                            <>
                                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 24 }}>System Overview</h2>

                                {/* 3 Summary Blocks */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>

                                    {/* Patient Block */}
                                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                                            <div>
                                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{stats.patients.length}</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>Total Patients</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Recent Active</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {stats.patients.slice(0, 3).map(p => (
                                                <div key={p._id} onClick={() => openUserModal(p)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg-slate">
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{p.name.charAt(0)}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>{p.name}</div>
                                                </div>
                                            ))}
                                            {stats.patients.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No patients registered yet.</div>}
                                        </div>
                                    </div>

                                    {/* Doctor Block */}
                                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Stethoscope size={20} /></div>
                                            <div>
                                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{stats.doctors.length}</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>Total Doctors</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Recent Active</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {stats.doctors.slice(0, 3).map(d => (
                                                <div key={d._id} onClick={() => openUserModal(d)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg-slate">
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{d.name.charAt(0)}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>{d.name}</div>
                                                </div>
                                            ))}
                                            {stats.doctors.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No doctors registered yet.</div>}
                                        </div>
                                    </div>

                                    {/* Admin Block */}
                                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={20} /></div>
                                            <div>
                                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{stats.admins.length}</div>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>Total Admins</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Recent Active</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {stats.admins.slice(0, 3).map(a => (
                                                <div key={a._id} onClick={() => openUserModal(a)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg-slate">
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{a.name.charAt(0)}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>{a.name}</div>
                                                </div>
                                            ))}
                                            {stats.admins.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No admins found.</div>}
                                        </div>
                                    </div>

                                </div>
                            </>
                        )}

                        {activeTab === 'users' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)' }}>User Management</h2>
                                </div>

                                <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                                    {/* Table Toolbar */}
                                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc' }}>
                                        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                                            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="text"
                                                placeholder="Search by name..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Filter size={16} color="var(--text-muted)" />
                                            <select
                                                value={roleFilter}
                                                onChange={e => setRoleFilter(e.target.value)}
                                                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'white', cursor: 'pointer' }}
                                            >
                                                <option value="all">All Roles</option>
                                                <option value="user">Patients</option>
                                                <option value="doctor">Doctors</option>
                                                <option value="admin">Admins</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Data Table */}
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ background: 'white', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>User Name</th>
                                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Role</th>
                                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Last Login</th>
                                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                                                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                                    <tr key={u._id} onClick={() => openUserModal(u)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s', background: u.status === 'Blocked' ? '#fef2f2' : 'white' }} className="table-row-hover">
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                                                                    {u.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: 14 }}>{u.name}</div>
                                                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.mobile || u.adminId || u.licenseNumber || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                                                                {ROLE_ICON[u.role]} {ROLE_LABEL[u.role]}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-body)' }}>
                                                            {new Date(u.lastLogin).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            {u.status === 'Active' ? (
                                                                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: '#f0fdf4', color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>Active</span>
                                                            ) : (
                                                                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: '#fef2f2', color: 'var(--error)', fontSize: 12, fontWeight: 600 }}>Blocked</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                                <button
                                                                    onClick={(e) => handleBlockUser(e, u._id)}
                                                                    title={u.status === 'Active' ? "Block User" : "Unblock User"}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.status === 'Active' ? 'var(--warning)' : 'var(--success)', padding: 6, borderRadius: 6, transition: 'all 0.2s' }}
                                                                    className="action-icon-btn"
                                                                >
                                                                    <Ban size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleRemoveUser(e, u._id)}
                                                                    title="Remove User"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 6, borderRadius: 6, transition: 'all 0.2s' }}
                                                                    className="action-icon-btn"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                            No users found matching your search.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </main>
            </div>

            <style>{`
                .hover-bg-slate:hover { background: #f8fafc; }
                .table-row-hover:hover { background: #f8fafc !important; }
                .action-icon-btn:hover { background: #f1f5f9; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
