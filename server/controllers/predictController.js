const Assessment = require('../models/Assessment');
const { spawn } = require('child_process');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const runPythonPrediction = (biomarkers) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, '../../project/predict_cli.py')
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdin.write(JSON.stringify(biomarkers));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script failed with code ${code}. Error: ${errorString}`));
            } else {
                try {
                    const prediction = JSON.parse(dataString);
                    resolve(prediction);
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${e.message}. Raw output: ${dataString}`));
                }
            }
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
};

const predictBiomarkers = async (req, res) => {
    try {
        const biomarkers = req.body;
        const patientId = biomarkers.patientId;

        // Run prediction
        const prediction = await runPythonPrediction(biomarkers);

        // Optional: Generate AI Insight via Gemini
        let ai_insight = null;
        if (prediction.success && process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
                    You are a compassionate and professional medical AI assistant.
                    A patient just completed a cancer risk assessment based on their biomarkers and lifestyle inputs.
                    
                    Patient Profile:
                    Age: ${biomarkers.age}, Sex: ${biomarkers.sex}
                    Smoking Status: ${biomarkers.smoking_status}
                    
                    The ML model calculated their cancer risk score to be ${prediction.risk_score.toFixed(1)}% (${prediction.risk_level} Risk).
                    
                    Please write a short, simple, and empathetic 2-3 sentence explanation directly to the patient.
                    Explain what this risk level means for them, mention any heavy contributing lifestyle factors gently if applicable (like smoking), and advise them on what their next step should be (e.g., consult a doctor, maintain healthy habits). Do NOT diagnose them. Use simple words.
                `;

                const aiResult = await model.generateContent(prompt);
                ai_insight = aiResult.response.text().trim();
                prediction.ai_insight = ai_insight;
            } catch (aiError) {
                console.error("Gemini AI Generation Error:", aiError.message);
                prediction.ai_insight = "We were unable to generate a personalized AI insight at this time, but please consult your physician regarding your risk score.";
            }
        }

        // Save Assessment to DB (if it succeeded)
        if (patientId && prediction.success) {
            try {
                await Assessment.create({
                    patientId: patientId,
                    biomarkers: biomarkers,
                    status: 'completed',
                    riskScore: prediction.risk_score,
                    riskLevel: prediction.risk_level,
                    aiInsight: ai_insight,
                    biomarkerContributions: prediction.top_factors || []
                });
            } catch (dbError) {
                console.error("Failed to save assessment to database:", dbError);
                // We still return the prediction to the user even if DB save fails
            }
        }

        return res.json(prediction);

    } catch (error) {
        console.error("Prediction Controller Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Error processing prediction",
            error: error.message
        });
    }
};

module.exports = { predictBiomarkers };
