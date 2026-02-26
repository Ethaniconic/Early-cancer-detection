import React from 'react';
import { ShieldAlert, Download, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskScoreDisplay = ({ results }) => {
    if (!results) return null;

    const { risk_score, risk_level, top_factors, nlr, plr, mlr } = results;

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl mt-8">
            <div className="flex justify-between items-start mb-8 border-b pb-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <ShieldAlert className={risk_level === 'High' ? 'text-red-500' : risk_level === 'Moderate' || risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'} size={32} />
                        Clinical Risk Assessment
                    </h3>
                    <p className="text-slate-500 mt-2">AI-driven pre-tumor triage evaluation</p>
                </div>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition print:hidden">
                    <Download size={18} /> Download PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                    <div className="text-sm font-bold tracking-widest text-slate-400 mb-6">OVERALL CONFIDENCE RISK</div>

                    {/* Gauge Circle */}
                    <div className="relative w-48 h-48 rounded-full flex items-center justify-center" style={{
                        background: `conic-gradient(${risk_level === 'High' ? '#ef4444' : risk_level === 'Moderate' || risk_level === 'Medium' ? '#f59e0b' : '#10b981'} ${risk_score}%, #e2e8f0 ${risk_score}%)`
                    }}>
                        <div className="absolute w-40 h-40 bg-slate-50 rounded-full flex flex-col items-center justify-center shadow-inner">
                            <span className="text-5xl font-black text-slate-800">{risk_score}%</span>
                        </div>
                    </div>

                    <div className={`mt-8 px-6 py-2 rounded-full text-sm font-black tracking-widest ${risk_level === 'High' ? 'bg-red-100 text-red-600 border border-red-200' : risk_level === 'Moderate' || risk_level === 'Medium' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                        {risk_level.toUpperCase()} RISK
                    </div>
                </div>

                {/* SHAP Explanations */}
                <div>
                    <div className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Info size={16} /> EXPLAINABLE AI FACTORS (SHAP)
                    </div>
                    <div className="space-y-4">
                        {top_factors && top_factors.length > 0 ? top_factors.map((factor, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-xl border shadow-sm flex items-start justify-between" style={{ borderLeftWidth: '4px', borderLeftColor: factor.impact === 'increases risk' || factor.shap_value > 0 ? '#ef4444' : '#10b981' }}>
                                <div>
                                    <h4 className="font-bold text-slate-800">{factor.feature}</h4>
                                    <p className="text-sm text-slate-500 mt-1">Recorded Value: <span className="font-mono bg-slate-100 px-1 rounded">{factor.value}</span></p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        This value <span className="font-semibold">{factor.impact}</span> based on Deep Learning pattern matching.
                                    </p>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded-full ${factor.impact === 'increases risk' || factor.shap_value > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {factor.impact.toUpperCase()}
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 italic">No significant SHAP factors identified.</p>
                        )}
                    </div>

                    {/* Ratios (if provided) */}
                    {(nlr || plr || mlr) && (
                        <div className="mt-6 pt-6 border-t">
                            <h4 className="text-sm font-bold tracking-widest text-slate-400 mb-4">INFLAMMATORY RATIOS</h4>
                            <div className="flex gap-4">
                                {nlr && <div className={`px-3 py-1 rounded text-sm font-semibold ${nlr > 3.0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>NLR: {nlr}</div>}
                                {plr && <div className={`px-3 py-1 rounded text-sm font-semibold ${plr > 150 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>PLR: {plr}</div>}
                                {mlr && <div className={`px-3 py-1 rounded text-sm font-semibold ${mlr > 0.3 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>MLR: {mlr}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium print:block">
                DISCLAIMER: This is a predictive risk screening tool utilizing Deep Neural Networks trained on Kaggle/PLCO historical data. It is NOT a clinical diagnosis. Consult a licensed oncologist or healthcare professional for formal evaluation.
            </div>
        </motion.div>
    );
};

export default RiskScoreDisplay;
