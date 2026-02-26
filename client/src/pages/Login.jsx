import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './auth.css';


const API_URL = 'http://localhost:3000/api';

const Login = () => {
    const [formData, setFormData] = useState({ mobile: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed. Please try again.');
            } else {
                // Store JWT token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess(`Welcome back, ${data.user.name}!`);
            }
        } catch (err) {
            setError('Could not connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">🩺</span>
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in using your mobile number and password.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
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

                    {/* Mobile */}
                    <div className="input-with-icon">
                        <Phone className="field-icon" size={18} />
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile Number"
                            className="form-input"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="input-with-icon">
                        <Lock className="field-icon" size={18} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                            <span className="btn-spinner" />
                        ) : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
