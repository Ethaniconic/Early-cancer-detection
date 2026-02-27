import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogIn, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useAuth();
    const { showToast } = useToast();

    // Redirect already logged in user
    if (user) {
        if (user.role === 'patient') navigate('/patient/checkup');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
    }

    const [creds, setCreds] = useState({ username: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setCreds({ ...creds, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(creds.username, creds.password);
        setLoading(false);

        if (res.error) {
            showToast(res.error, 'error');
            return;
        }

        const role = res.user.role;
        showToast(`Welcome back, ${res.user.name}!`, 'success');

        const destination = location.state?.from?.pathname ||
            (role === 'patient' ? '/patient/checkup' : role === 'doctor' ? '/doctor/dashboard' : '/admin/dashboard');

        navigate(destination, { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-100 text-teal-600 mb-6 shadow-sm">
                        <ShieldAlert size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">CancerGuard</h1>
                    <p className="text-slate-500 font-medium mt-2">AI-Powered Early Cancer Risk Screening</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={creds.username}
                                onChange={handleChange}
                                placeholder="e.g. patient1"
                                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl outline-none focus:border-teal-500 font-medium transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    name="password"
                                    value={creds.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl outline-none focus:border-teal-500 font-medium transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-teal-700 transition shadow-lg ${loading ? 'bg-teal-400' : 'bg-teal-600'}`}
                        >
                            {loading ? <Activity size={20} className="animate-spin" /> : <LogIn size={20} />}
                            {loading ? 'Authenticating...' : 'Sign In securely'}
                        </button>
                    </form>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-sm">
                    <p className="font-bold text-blue-800 mb-3 tracking-wide text-xs uppercase">Hackathon Demo Credentials</p>
                    <div className="space-y-3 font-mono text-blue-900/80">
                        <div className="flex justify-between items-center bg-white/60 p-2 rounded"><span className="font-sans font-bold text-xs uppercase text-blue-400 tracking-wider">Patient</span> patient1 / patient123</div>
                        <div className="flex justify-between items-center bg-white/60 p-2 rounded"><span className="font-sans font-bold text-xs uppercase text-blue-400 tracking-wider">Doctor</span> doctor1 / doctor123</div>
                        <div className="flex justify-between items-center bg-white/60 p-2 rounded"><span className="font-sans font-bold text-xs uppercase text-blue-400 tracking-wider">Admin</span> admin1 / admin123</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
