import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const icons = {
                        success: <CheckCircle className="text-emerald-500" size={20} />,
                        error: <AlertCircle className="text-red-500" size={20} />,
                        warning: <AlertTriangle className="text-amber-500" size={20} />,
                        info: <Info className="text-blue-500" size={20} />,
                    };

                    const bgs = {
                        success: "bg-white border-emerald-500",
                        error: "bg-white border-red-500",
                        warning: "bg-white border-amber-500",
                        info: "bg-white border-blue-500",
                    };

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className={`flex items-center gap-3 p-4 min-w-[300px] shadow-xl rounded-xl border-l-[6px] ${bgs[toast.type]} relative`}
                        >
                            {icons[toast.type]}
                            <p className="font-semibold text-slate-700 text-sm flex-1">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
