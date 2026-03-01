import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Stethoscope, ShieldCheck, Phone, IdCard, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_NODE_API_URL;

// Config for each role
const ROLE_CONFIG = {
    user: {
        label: 'Patient',
        icon: <User size={16} />,
        identifierKey: 'mobile',
        identifierLabel: 'Mobile Number',
        identifierType: 'tel',
        identifierIcon: Phone,
    },
    doctor: {
        label: 'Doctor',
        icon: <Stethoscope size={16} />,
        identifierKey: 'licenseNumber',
        identifierLabel: 'Medical License No.',
        identifierType: 'text',
        identifierIcon: IdCard,
    },
    admin: {
        label: 'Admin',
        icon: <ShieldCheck size={16} />,
        identifierKey: 'adminId',
        identifierLabel: 'Admin / Employee ID',
        identifierType: 'text',
        identifierIcon: IdCard,
    },
};

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('user');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setIdentifier('');
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const config = ROLE_CONFIG[role];

        // Build payload — always send 'role' and 'password'
        // The identifier key matches what the server uses to look up the user
        const payload = {
            role,
            password,
            [config.identifierKey]: identifier,
        };

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed. Please check your credentials.');
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to role-specific dashboard
                const dashMap = { user: '/dashboard/patient', doctor: '/dashboard/doctor', admin: '/dashboard/admin' };
                navigate(dashMap[data.user.role] || '/login', { replace: true });
            }
        } catch (err) {
            setError('Could not connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const config = ROLE_CONFIG[role];
    const IdentifierIcon = config.identifierIcon;

    return (
        <div className="login-container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <span>🩺</span>
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Select your role and sign in below.</p>
                </div>

                {/* Role Selector */}
                <div className="role-selector">
                    {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            type="button"
                            className={`role-btn ${role === key ? 'active' : ''}`}
                            onClick={() => handleRoleChange(key)}
                        >
                            {cfg.icon} {cfg.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Alert Box */}
                    <AnimatePresence mode="wait">
                        {(error || success) && (
                            <motion.div
                                key={error ? 'error' : 'success'}
                                className={`alert-box ${error ? 'alert-error' : 'alert-success'}`}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                <span>{error || success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dynamic Identifier Field — animates when role changes */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            style={{ width: '100%' }}
                        >
                            <div className="input-with-icon">
                                <IdentifierIcon className="field-icon" size={18} />
                                <input
                                    type={config.identifierType}
                                    placeholder={config.identifierLabel}
                                    className="form-input"
                                    value={identifier}
                                    onChange={(e) => { setError(''); setIdentifier(e.target.value); }}
                                    required
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Password — always shown */}
                    <div className="input-with-icon">
                        <Lock className="field-icon" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-input"
                            value={password}
                            onChange={(e) => { setError(''); setPassword(e.target.value); }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                            <span className="btn-spinner" />
                        ) : (
                            <>Sign In as {config.label} <ArrowRight size={18} /></>
                        )}
                    </button>

                    <p className="auth-link">
                        Don't have an account? <Link to="/signup">Create Account</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
