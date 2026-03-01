import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Beaker, Zap, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ModelReport = () => {
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Fetch from Flask ML API
                const res = await fetch(`${import.meta.env.VITE_FLASK_ML_URL}/model_metrics`);
                if (!res.ok) throw new Error("Failed to load metrics from ML API");
                const data = await res.json();
                if (data.success) {
                    setMetrics(data.metrics);
                } else {
                    throw new Error(data.message || "Failed to parse metrics");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading live ML metrics...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

    const gaugeData = [
        { name: 'AUC', value: metrics.auc_roc * 100 },
        { name: 'Remaining', value: 100 - (metrics.auc_roc * 100) }
    ];
    const COLORS = ['#3b82f6', '#e2e8f0'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-12">

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <Activity className="text-blue-500" size={32} /> Clinical Validation & Model Report
                </h1>

                <div className="bg-slate-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm text-slate-700 leading-relaxed text-lg italic mb-8">
                    "This model utilizes a Deep Neural Network (Multi-Layer Perceptron) architecture trained dynamically across harmonized Multi-modal clinical datasets mirroring the validated PLCO Trial schema. By employing SMOTE and Optuna-optimized non-linear activations, the network targets hidden correlations in pre-tumor biomarkers (NLR, PLR ratios). Classification thresholds are intentionally shifted to prioritize robust &gt;91% RECALL and &gt;92% F1-Scores to prevent missing high-risk individuals before metastasis."
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700">
                        <div className="text-slate-400 text-sm font-bold tracking-widest mb-2 flex items-center gap-2"><Zap size={16} /> SENSITIVITY (RECALL)</div>
                        <div className="text-4xl font-black text-emerald-400">{(metrics.recall * 100).toFixed(1)}%</div>
                        <div className="text-xs text-slate-500 font-mono mt-2">Threshold: &gt;= 0.35</div>
                    </div>
                    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700">
                        <div className="text-slate-400 text-sm font-bold tracking-widest mb-2 flex items-center gap-2"><Beaker size={16} /> F1 SCORE</div>
                        <div className="text-4xl font-black text-blue-400">{(metrics.f1_score * 100).toFixed(1)}%</div>
                        <div className="text-xs text-slate-500 font-mono mt-2">Harmonic Mean</div>
                    </div>
                    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700">
                        <div className="text-slate-400 text-sm font-bold tracking-widest mb-2 flex items-center gap-2"><FileSpreadsheet size={16} /> PRECISION</div>
                        <div className="text-4xl font-black text-purple-400">{(metrics.precision * 100).toFixed(1)}%</div>
                        <div className="text-xs text-slate-500 font-mono mt-2">PPV</div>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center">
                        <div className="text-slate-500 text-sm font-bold tracking-widest mb-1">AUC-ROC</div>
                        <div className="w-full h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
                                        {gaugeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-3xl font-black text-slate-800 -mt-8">{(metrics.auc_roc).toFixed(3)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Visual Images (served from Flask or static depending on infra) */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-inner overflow-hidden">
                        <h3 className="font-bold text-slate-700 mb-3 text-center">SHAP Value Summary Plot</h3>
                        {/* Assuming Flask serves images on /static/reports/.... modify as needed */}
                        <div className="w-full h-auto min-h-64 flex items-center justify-center bg-white border border-dashed border-slate-300 rounded">
                            <span className="text-slate-400 text-sm italic p-4 text-center">
                                Once trained, the SHAP logic automatically saves reports/shap_summary.png. <br />
                                Ensure your static directory proxies to the ML reports folder to render this properly.
                            </span>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-inner overflow-hidden">
                        <h3 className="font-bold text-slate-700 mb-3 text-center">Neural Network Confusion Matrix</h3>
                        <div className="w-full h-auto min-h-64 flex items-center justify-center bg-white border border-dashed border-slate-300 rounded">
                            <span className="text-slate-400 text-sm italic">
                                Render confusion_matrix.png here
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default ModelReport;
