// Centralized API calls using native fetch

const Node_API_URL = import.meta.env.VITE_NODE_API_URL;
const Flask_ML_URL = import.meta.env.VITE_FLASK_ML_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const api = {
    // Flask ML calls
    checkHealth: async () => {
        const res = await fetch(`${Flask_ML_URL}/health`);
        return res.json();
    },
    getModelMetrics: async () => {
        const res = await fetch(`${Flask_ML_URL}/model_metrics`);
        return res.json();
    },
    predictCancerRisk: async (data) => {
        const res = await fetch(`${Flask_ML_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Node Backend calls
    getPatients: async () => {
        const res = await fetch(`${Node_API_URL}/patients`, { headers: getAuthHeaders() });
        return res.json();
    },
    createAssessment: async (data) => {
        const res = await fetch(`${Node_API_URL}/assessments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    getPatientAssessments: async (patientId) => {
        const res = await fetch(`${Node_API_URL}/assessments/patient/${patientId}`, { headers: getAuthHeaders() });
        return res.json();
    }
};
