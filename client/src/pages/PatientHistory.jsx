import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import RiskScoreDisplay from './RiskScoreDisplay';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PatientHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Mock historical data since Patient ID auth context isn't fully wired to assessments yet
                const mockHistory = [
                    { _id: '1', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), result: { risk_score: 45, risk_level: 'Medium', nlr: 3.1, top_factors: [{ feature: 'WBC', impact: 'increases risk', value: 12 }] } },
                    { _id: '2', createdAt: new Date(), result: { risk_score: 30, risk_level: 'Low', nlr: 2.5, top_factors: [{ feature: 'PLR', impact: 'decreases risk', value: 120 }] } }
                ];
                setHistory(mockHistory);
            } catch (err) {
                console.error("Error fetching history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const chartData = history.map(h => ({
        date: new Date(h.createdAt).toLocaleDateString(),
        score: h.result.risk_score
    })).reverse();

    if (loading) return <div className="p-8 text-center text-slate-500">Loading history...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 pb-12">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Clock className="text-blue-500" /> Patient History
            </h2>

            {history.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-6">Risk Trend Analysis</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm tracking-wider uppercase border-b">
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Risk Score</th>
                            <th className="p-4 font-semibold">Risk Level</th>
                            <th className="p-4 font-semibold">Top Factor</th>
                            <th className="p-4 font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.map(item => (
                            <React.Fragment key={item._id}>
                                <tr onClick={() => setSelectedAssessment(selectedAssessment === item._id ? null : item._id)} className="hover:bg-slate-50 cursor-pointer transition">
                                    <td className="p-4 font-medium text-slate-700">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold">{item.result.risk_score}%</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.result.risk_level === 'High' ? 'bg-red-100 text-red-600' : item.result.risk_level === 'Moderate' || item.result.risk_level === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {item.result.risk_level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">{item.result.top_factors[0]?.feature || 'N/A'}</td>
                                    <td className="p-4 text-right"><ChevronRight size={18} className={`inline transition-transform ${selectedAssessment === item._id ? 'rotate-90' : ''}`} /></td>
                                </tr>
                                {selectedAssessment === item._id && (
                                    <tr>
                                        <td colSpan="5" className="bg-slate-50 p-6 border-b-4 border-blue-100">
                                            <RiskScoreDisplay results={item.result} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {history.length === 0 && <div className="p-8 text-center text-slate-500">No assessments found in history.</div>}
            </div>
        </div>
    );
};

export default PatientHistory;
