import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flag, Edit } from 'lucide-react';
import RiskScoreDisplay from './RiskScoreDisplay';

const PatientDetailView = ({ patient, onBack }) => {
    const [flagged, setFlagged] = useState(patient.riskLevel === 'High');
    const [notes, setNotes] = useState('');

    // Mock results for RiskScoreDisplay matching the patient
    const mockResults = {
        risk_score: patient.riskScore,
        risk_level: patient.riskLevel,
        top_factors: [
            { feature: "NLR Ratio", impact: patient.riskLevel === 'High' ? "increases risk" : "decreases risk", value: patient.riskLevel === 'High' ? 4.2 : 2.1, shap_value: patient.riskLevel === 'High' ? 0.8 : -0.2 },
            { feature: "Age", impact: "increases risk", value: patient.age, shap_value: 0.15 },
        ],
        nlr: patient.riskLevel === 'High' ? 4.2 : 2.1,
        plr: patient.riskLevel === 'High' ? 180 : 120
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto space-y-8 pb-12">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition bg-white px-4 py-2 border rounded-lg shadow-sm">
                <ArrowLeft size={18} /> Back to Doctor Dashboard
            </button>

            <div className="flex justify-between items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">{patient.name}</h2>
                    <p className="text-slate-500 mt-2 font-medium">Age: {patient.age} | Sex: {patient.sex} | Last Assessment: {new Date(patient.lastCheckup).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={() => setFlagged(!flagged)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition shadow-sm border ${flagged ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent'}`}
                >
                    <Flag size={20} fill={flagged ? 'currentColor' : 'none'} />
                    {flagged ? 'Flagged for Clinical Review' : 'Flag Patient'}
                </button>
            </div>

            {/* Risk Score Display Overlay */}
            <RiskScoreDisplay results={mockResults} />

            {/* Clinical Notes Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Edit className="text-blue-500" /> Clinical Notes
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter diagnostic logic, next action items, or biopsy referrals..."
                    className="w-full h-32 p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"
                />
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition">
                    Save Notes
                </button>
            </div>
        </motion.div>
    );
};

export default PatientDetailView;
