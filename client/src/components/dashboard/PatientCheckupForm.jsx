import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Activity, AlertTriangle, UploadCloud, User, Users, TrendingUp,
    Droplet, Thermometer, FlaskConical, Clipboard, ArrowRight,
    CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

const PatientCheckupForm = () => {
    const [formData, setFormData] = useState({
        name: '', age: '', sex: 'Male', height: '', weight: '', bmi: '',
        smokingStatus: 'Non-Smoker', packYears: '', alcoholUse: 'None', unitsPerWeek: '',
        occupationalExposure: [], familyHistory: false, relative: [], cancerType: '', priorCancer: false,
        chronicConditions: [], weightLoss: false, fatigue: 1, persistentCough: false,
        bleeding: false, bowelChanges: false,
        wbc: '', rbc: '', hemoglobin: '', hematocrit: '', platelets: '', neutPct: '',
        lymphPct: '', cea: '', ca125: '', crp: '', mcv: '', mch: ''
    });

    const [uploadMode, setUploadMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // Auto-calculate BMI
    useEffect(() => {
        if (formData.height && formData.weight) {
            const h = parseFloat(formData.height) / 100;
            const w = parseFloat(formData.weight);
            if (h > 0) {
                setFormData(prev => ({ ...prev, bmi: (w / (h * h)).toFixed(1) }));
            }
        }
    }, [formData.height, formData.weight]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiCheckbox = (field, value) => {
        setFormData(prev => {
            const current = [...prev[field]];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                if (value === 'None') return { ...prev, [field]: ['None'] };
                const filtered = current.filter(item => item !== 'None');
                return { ...prev, [field]: [...filtered, value] };
            }
        });
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data[0];
                    if (data) {
                        setFormData(prev => ({
                            ...prev,
                            wbc: data.wbc_count || '',
                            rbc: data.rbc_count || '',
                            hemoglobin: data.hemoglobin || '',
                            hematocrit: data.hematocrit || '',
                            platelets: data.platelet_count || '',
                            neutPct: data.neutrophil_pct || '',
                            lymphPct: data.lymphocyte_pct || '',
                            cea: data.cea_level || '',
                            ca125: data.ca125_level || '',
                            crp: data.crp_level || '',
                            mcv: data.mcv || '',
                            mch: data.mch || ''
                        }));
                    }
                }
            });
        }
    };

    const calculateRatios = () => {
        const wbc = parseFloat(formData.wbc) || 0;
        const neut = parseFloat(formData.neutPct) || 0;
        const lymph = parseFloat(formData.lymphPct) || 0;
        const plat = parseFloat(formData.platelets) || 0;

        let nlr = 0;
        let plr = 0;

        if (wbc > 0 && lymph > 0) {
            const neutCount = (neut / 100) * wbc;
            const lymphCount = (lymph / 100) * wbc;
            nlr = neutCount / lymphCount;
            plr = plat / lymphCount;
        }
        return { nlr: nlr.toFixed(2), plr: plr.toFixed(2) };
    };

    const { nlr, plr } = calculateRatios();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            age: parseInt(formData.age),
            sex: formData.sex,
            bmi: parseFloat(formData.bmi) || 0,
            smoking_status: formData.smokingStatus === 'Non-Smoker' ? 0 : (formData.smokingStatus === 'Former Smoker' ? 1 : 2),
            pack_years: parseFloat(formData.packYears) || 0,
            alcohol_use: formData.alcoholUse === 'None' ? 0 : 1,
            family_history_cancer: formData.familyHistory ? 1 : 0,
            occupational_exposure: formData.occupationalExposure.includes('None') ? 0 : 1,
            wbc_count: parseFloat(formData.wbc) || 0,
            rbc_count: parseFloat(formData.rbc) || 0,
            hemoglobin: parseFloat(formData.hemoglobin) || 0,
            platelet_count: parseFloat(formData.platelets) || 0,
            neutrophil_pct: parseFloat(formData.neutPct) || 0,
            lymphocyte_pct: parseFloat(formData.lymphPct) || 0,
            cea_level: parseFloat(formData.cea) || 0,
            ca125_level: parseFloat(formData.ca125) || 0,
            crp_level: parseFloat(formData.crp) || 0,
            mcv: parseFloat(formData.mcv) || 0,
            mch: parseFloat(formData.mch) || 0,
            prior_cancer_diagnosis: formData.priorCancer ? 1 : 0,
            unexplained_weight_loss: formData.weightLoss ? 1 : 0,
            fatigue_score: parseInt(formData.fatigue) || 1,
            hematocrit: parseFloat(formData.hematocrit) || 0
        };

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            payload.patientId = user._id;

            const response = await fetch(`${import.meta.env.VITE_NODE_API_URL}/predict/biomarkers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate prediction.');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Design Tokens
    const inputClasses = "w-full bg-[#1e2438] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2";
    const cardClasses = "bg-[#111420] border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-md";

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-10 text-slate-200">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Advanced Patient Assessment</h2>
                    <p className="text-slate-400 mt-1">AI-Powered Risk Stratification Engine v2.0</p>
                </div>
                {results && (
                    <button onClick={() => setResults(null)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-sm">
                        <Trash2 size={16} /> New Assessment
                    </button>
                )}
            </header>

            {!results ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: PERSONAL BIOMETRICS */}
                    <section className={cardClasses}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><User size={20} /></div>
                            <h3 className="text-lg font-bold text-white">1. Patient Profile & Biometrics</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className={labelClasses}>Full Patient Name</label>
                                <input name="name" placeholder="Ankita Sharma" required className={inputClasses} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className={labelClasses}>Age (Years)</label>
                                <input name="age" type="number" placeholder="32" required className={inputClasses} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className={labelClasses}>Sex At Birth</label>
                                <select name="sex" className={inputClasses} onChange={handleInputChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}><Activity size={12} /> Height (cm)</label>
                                <input name="height" type="number" placeholder="165" required className={inputClasses} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className={labelClasses}><Activity size={12} /> Weight (kg)</label>
                                <input name="weight" type="number" placeholder="68" required className={inputClasses} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className={labelClasses}>Body Mass Index (BMI)</label>
                                <input name="bmi" readOnly value={formData.bmi} className={`${inputClasses} bg-slate-800/50 text-blue-400 font-bold`} />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: RISK FACTORS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className={cardClasses}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><FlaskConical size={20} /></div>
                                <h3 className="text-lg font-bold text-white">2. Lifestyle & Exposure</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>Smoking</label>
                                        <select name="smokingStatus" className={inputClasses} onChange={handleInputChange}>
                                            <option>Non-Smoker</option>
                                            <option>Former Smoker</option>
                                            <option>Smoker</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Alcohol</label>
                                        <select name="alcoholUse" className={inputClasses} onChange={handleInputChange}>
                                            <option>None</option>
                                            <option>Occasional</option>
                                            <option>Moderate</option>
                                            <option>Heavy</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.smokingStatus !== 'Non-Smoker' && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                        <label className={labelClasses}>Pack Years <span className="lowercase font-normal tracking-normal">(packs/day × years)</span></label>
                                        <input name="packYears" type="number" placeholder="2.5" className={inputClasses} onChange={handleInputChange} />
                                    </motion.div>
                                )}

                                <div>
                                    <label className={labelClasses}>Occupational Environmental Exposure</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['Asbestos', 'Benzene', 'Radiation', 'Pesticides', 'Other Chem', 'None'].map(exp => (
                                            <button
                                                key={exp} type="button"
                                                onClick={() => handleMultiCheckbox('occupationalExposure', exp)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.occupationalExposure.includes(exp) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                            >
                                                {exp}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={cardClasses}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><Clipboard size={20} /></div>
                                <h3 className="text-lg font-bold text-white">3. Medical History & Symptoms</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { name: 'familyHistory', label: 'Genetic Predisposition / Family History', icon: <Users size={14} /> },
                                        { name: 'priorCancer', label: 'Personal History of Malignancy', icon: <ShieldAlert size={14} /> },
                                        { name: 'weightLoss', label: 'Unexplained Weight Loss (>5kg / 3m)', icon: <TrendingUp size={14} /> },
                                        { name: 'persistentCough', label: 'Chronic Persistent Cough (>3 weeks)', icon: <AlertTriangle size={14} /> },
                                    ].map(item => (
                                        <label key={item.name} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${formData[item.name] ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                            <span className="text-sm font-medium flex items-center gap-3">{item.icon} {item.label}</span>
                                            <input name={item.name} type="checkbox" className="w-5 h-5 rounded accent-blue-500" onChange={handleInputChange} />
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <label className={labelClasses}>Fatigue Intensity Index (1-10)</label>
                                    <div className="flex items-center gap-4">
                                        <input name="fatigue" type="range" min="1" max="10" className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" value={formData.fatigue} onChange={handleInputChange} />
                                        <span className="text-xl font-black text-blue-400 w-8 text-center">{formData.fatigue}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* SECTION 4: LABORATORY BIOMARKERS */}
                    <section className={cardClasses}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Thermometer size={20} /></div>
                                <h3 className="text-lg font-bold text-white">4. Clinical Laboratory Biomarkers</h3>
                            </div>
                            <div className="flex bg-[#1e2438] p-1 rounded-xl border border-white/5">
                                <button type="button" onClick={() => setUploadMode(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!uploadMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Manual Input</button>
                                <button type="button" onClick={() => setUploadMode(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${uploadMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'} ml-1`}>CSV / Lab Import</button>
                            </div>
                        </div>

                        {uploadMode ? (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-12 border-2 border-dashed border-white/10 rounded-2xl text-center bg-white/2 cursor-pointer hover:bg-white/5 transition-all">
                                <UploadCloud size={48} className="mx-auto text-blue-400 mb-4 opacity-50" />
                                <h4 className="text-white font-bold mb-1">Import Laboratory Data</h4>
                                <p className="text-slate-400 text-sm mb-6">Drag and drop your clinical report in .csv format</p>
                                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xl">
                                    <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                                    Browse Files
                                </label>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                                {[
                                    { name: 'wbc', label: 'WBC Count', unit: 'k/µL', range: '4.5-11.0' },
                                    { name: 'platelets', label: 'Platelets', unit: 'k/µL', range: '150-400' },
                                    { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', range: '12-17.5' },
                                    { name: 'hematocrit', label: 'Hematocrit', unit: '%', range: '41-53' },
                                    { name: 'neutPct', label: 'Neutrophil', unit: '%', range: '50-70' },
                                    { name: 'lymphPct', label: 'Lymphocyte', unit: '%', range: '20-40' },
                                    { name: 'crp', label: 'CRP Level', unit: 'mg/L', range: '<10' },
                                    { name: 'cea', label: 'CEA (Onco)', unit: 'ng/mL', range: '<3.0' },
                                ].map(cell => (
                                    <div key={cell.name}>
                                        <label className={labelClasses}>
                                            {cell.label}
                                            <span className="normal-case font-normal text-[10px] text-slate-500 ml-auto">REF: {cell.range}</span>
                                        </label>
                                        <div className="relative">
                                            <input name={cell.name} type="number" step="0.01" value={formData[cell.name]} placeholder="0.00" className={`${inputClasses} pr-12`} onChange={handleInputChange} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">{cell.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${parseFloat(nlr) > 3.0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Neutrophil-Lymphocyte Ratio (NLR)</div>
                                    <div className={`text-2xl font-black ${parseFloat(nlr) > 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>{nlr}</div>
                                </div>
                                {parseFloat(nlr) > 3.0 ? <AlertTriangle className="text-red-500" /> : <ShieldAlert className="text-emerald-500" />}
                            </div>
                            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${parseFloat(plr) > 150 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Platelet-Lymphocyte Ratio (PLR)</div>
                                    <div className={`text-2xl font-black ${parseFloat(plr) > 150 ? 'text-red-400' : 'text-emerald-400'}`}>{plr}</div>
                                </div>
                                {parseFloat(plr) > 150 ? <AlertTriangle className="text-red-500" /> : <ShieldAlert className="text-emerald-500" />}
                            </div>
                        </div>
                    </section>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-medium">
                            <AlertCircle size={20} /> {error}
                        </motion.div>
                    )}

                    <div className="flex justify-center pt-10">
                        <button type="submit" disabled={loading} className="group relative overflow-hidden px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 flex items-center gap-3 min-w-[320px] justify-center text-lg uppercase tracking-widest">
                            {loading ? (
                                <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Activity className="group-hover:animate-pulse" /> Execute Neural Analysis
                                </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </div>
                </form>
            ) : (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    {/* RESULTS VIEW */}
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-br from-blue-600/20 to-violet-600/20 p-8 md:p-12 border-b border-white/5">
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative flex-shrink-0">
                                    <div className="w-48 h-48 rounded-full border-[10px] border-white/5 flex items-center justify-center relative">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                                            <circle
                                                cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="12"
                                                strokeDasharray={2 * Math.PI * 86}
                                                strokeDashoffset={2 * Math.PI * 86 * (1 - results.risk_score / 100)}
                                                className={`${results.risk_level === 'High' ? 'text-red-500' : results.risk_level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="text-center">
                                            <span className="text-5xl font-black block">{results.risk_score}%</span>
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Confidence</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-800 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                        Active Profile
                                    </div>
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${results.risk_level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        <ShieldAlert size={14} /> Global {results.risk_level} Risk Tier
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">Diagnostic Triage Results</h3>
                                    <p className="text-slate-400 max-w-xl text-lg leading-relaxed font-medium">
                                        Our Deep Neural Network has evaluated the input biomarkers and clinical history.
                                        {results.risk_level === 'High'
                                            ? " Immediate specialized consultation and secondary screening protocols are highly recommended."
                                            : " Baseline health metrics appear stable, but regular surveillance should be maintained."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                                        <TrendingUp size={16} /> Explainable AI Factors (SHAP)
                                    </h4>
                                    <div className="space-y-3">
                                        {results.top_factors && results.top_factors.map((factor, idx) => (
                                            <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                                                <div>
                                                    <div className="font-bold text-slate-200">{factor.feature}</div>
                                                    <div className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">Recorded Val: <span className="text-blue-400">{factor.value}</span></div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${factor.shap_value > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {factor.impact}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                                        <CheckCircle2 size={16} /> Clinical Recommendations
                                    </h4>
                                    <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold">1</div>
                                            <p className="text-slate-300 text-sm leading-relaxed font-medium">Schedule a follow-up consultation with an oncologist within the next 48 hours for definitive diagnostic validation.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold">2</div>
                                            <p className="text-slate-300 text-sm leading-relaxed font-medium">Comprehensive metabolic panel and whole-body PET-CT imaging is recommended to rule out advanced hyperplasia.</p>
                                        </div>
                                        <button className="w-full mt-4 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                                            Consult a Network Specialist <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PatientCheckupForm;
