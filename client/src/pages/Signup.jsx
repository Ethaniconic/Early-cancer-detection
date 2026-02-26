import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShieldCheck, Stethoscope, Lock, Phone,
  Calendar, ArrowRight, IdCard, Building, BriefcaseMedical
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const API_URL = 'http://localhost:3000/api';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '', mobile: '', password: '', age: '',
    licenseNumber: '', specialization: '', hospital: '',
    adminId: '', department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
        navigate('/login', { replace: true, state: { registered: true, name: data.user.name } });
      }
    } catch {
      setError('Could not connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <motion.div
        className="signup-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="signup-header">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Select your role and enter your details below.</p>

          {/* Role Selection Toggle */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <User size={16} /> Patient
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => setRole('doctor')}
            >
              <Stethoscope size={16} /> Doctor
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Error Alert */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span> {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={role} // Re-animates smoothly when role changes
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="input-group"
            >
              {/* COMMON FIELD: Full Name */}
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

              {/* DYNAMIC FIELDS: Based on Role */}
              {role === 'user' && (
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
              )}

              {role === 'doctor' && (
                <>
                  <div className="input-row">
                    <div className="input-with-icon flex-1">
                      <IdCard className="field-icon" size={18} />
                      <input
                        type="text"
                        name="licenseNumber"
                        placeholder="Medical License No."
                        className="form-input"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-with-icon flex-1">
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
                  <div className="input-row">
                    <div className="input-with-icon flex-1">
                      <BriefcaseMedical className="field-icon" size={18} />
                      <select
                        name="specialization"
                        className="form-input form-select"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Specialization</option>
                        <option value="oncologist">Surgical Oncologist</option>
                        <option value="radiation">Radiation Oncologist</option>
                        <option value="medical">Medical Oncologist</option>
                        <option value="dentist">Maxillofacial Surgeon / Dentist</option>
                      </select>
                    </div>
                    <div className="input-with-icon flex-1">
                      <Building className="field-icon" size={18} />
                      <input
                        type="text"
                        name="hospital"
                        placeholder="Hospital/Clinic"
                        className="form-input"
                        value={formData.hospital}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="input-row">
                    <div className="input-with-icon flex-1">
                      <IdCard className="field-icon" size={18} />
                      <input
                        type="text"
                        name="adminId"
                        placeholder="Admin / Employee ID"
                        className="form-input"
                        value={formData.adminId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="input-with-icon flex-1">
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
                  <div className="input-with-icon">
                    <Building className="field-icon" size={18} />
                    <select
                      name="department"
                      className="form-input form-select"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Department</option>
                      <option value="it">IT Support</option>
                      <option value="records">Medical Records</option>
                      <option value="management">Hospital Management</option>
                    </select>
                  </div>
                </>
              )}

              {/* COMMON FIELD: Password */}
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

            </motion.div>
          </AnimatePresence>

          <div className="signup-footer">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <>{`Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`} <ArrowRight size={18} /></>}
            </button>
          </div>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;