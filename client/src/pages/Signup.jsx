import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Stethoscope, Lock, Phone, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './auth.css';


const API_URL = 'http://localhost:3000/api';

const Signup = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({ name: '', age: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, age: Number(formData.age), role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
      } else {
        setSuccess(`Account created! Welcome, ${data.user.name}.`);
        setFormData({ name: '', age: '', mobile: '', password: '' });
      }
    } catch (err) {
      setError('Could not connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'user', label: 'Patient', icon: <User size={16} /> },
    { key: 'doctor', label: 'Doctor', icon: <Stethoscope size={16} /> },
    { key: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> },
  ];

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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Select your role and register below.</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          {roles.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`role-btn ${role === key ? 'active' : ''}`}
              onClick={() => handleRoleChange(key)}
            >
              {icon} {label}
            </button>
          ))}
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

          {/* Full Name */}
          <div className="input-with-icon">
            <User className="field-icon" size={18} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Age + Mobile Row */}
          <div className="input-row">
            <div className="input-with-icon flex-1">
              <Calendar className="field-icon" size={18} />
              <input
                type="number"
                name="age"
                placeholder="Age"
                className="form-input"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="120"
                required
              />
            </div>
            <div className="input-with-icon flex-2">
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
          </div>

          {/* Password */}
          <div className="input-with-icon">
            <Lock className="field-icon" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
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
              <>Register as {roles.find(r => r.key === role)?.label} <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;