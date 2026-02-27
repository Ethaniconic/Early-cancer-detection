const Assessment = require('../models/Assessment');
const User = require('../models/userModel');
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
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

const extractBiomarkers = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "Gemini API key missing on server." });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No document uploaded." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using pro model for multimodal document extraction (or flash if that's all that's available, flash is fine)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a medical data extraction assistant. The user has uploaded an image or PDF of their blood test / lab report.
            Please extract the following specific biomarkers. Do not make up numbers.
            Return ONLY a raw JSON object string with these exact keys. NO MARKDOWN. NO CODE BLOCKS.
            CRITICAL: For the values, ONLY return the pure numeric number (e.g., 12.5 or 88). Do NOT include any units or symbols (like mg/dl, %, or x10^3/uL).
            If a value is not found in the document, return an empty string "" for that key.

            Required Keys:
            "wbc_count" (White Blood Cell Count)
            "rbc_count" (Red Blood Cell Count)
            "hemoglobin"
            "hematocrit"
            "platelet_count"
            "neutrophil_pct" (Neutrophil Percentage)
            "lymphocyte_pct" (Lymphocyte Percentage)
            "mcv"
            "mch"
            "cea_level" (CEA - Carcinoembryonic Antigen)
            "ca125_level" (CA-125)
            "crp_level" (C-Reactive Protein)
        `;

        const filePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const aiResult = await model.generateContent([prompt, filePart]);
        let text = aiResult.response.text().trim();

        // Strip backticks if gemini insists on formatting
        if (text.startsWith("\`\`\`json")) {
            text = text.replace(/^\`\`\`json/i, "");
        }
        if (text.startsWith("\`\`\`")) {
            text = text.replace(/^\`\`\`/i, "");
        }
        if (text.endsWith("\`\`\`")) {
            text = text.replace(/\`\`\`$/i, "");
        }
        text = text.trim();

        const extractedData = JSON.parse(text);

        return res.json({ success: true, data: extractedData });

    } catch (error) {
        console.error("Biomarker Extraction Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to read document.",
            error: error.message
        });
    }
};

const recommendDoctors = async (req, res) => {
    try {
        const { risk_level, risk_score, top_factors } = req.body;

        // Find all doctors in the database
        const doctors = await User.find({ role: 'doctor' }).select('name specialization hospital');

        if (!doctors || doctors.length === 0) {
            return res.status(404).json({ success: false, message: "No doctors currently registered in the network." });
        }

        if (!process.env.GEMINI_API_KEY) {
            // Fallback ranking if no API key
            const fallback = doctors.slice(0, 3).map(doc => ({
                doctorId: doc._id,
                name: doc.name,
                specialization: doc.specialization || "General Oncology",
                hospital: doc.hospital || "CarePortal Hospital",
                matchPercentage: 85,
                reason: "Recommended based on network availability."
            }));
            return res.json({ success: true, data: fallback });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a medical AI matching patients to the best doctors.
            Patient Assessment: Risk Level is ${risk_level} (${risk_score}%).
            Top Contributing Factors: ${JSON.stringify(top_factors || [])}

            Available Doctors:
            ${JSON.stringify(doctors)}

            Analyze the patient's condition and the doctor's specializations.
            Return a pure JSON array containing the top 3 best matched doctors.
            Each object in the array must EXACTLY follow this structure:
            {
                "doctorId": "the exact _id from the available doctors array",
                "name": "Doctor name",
                "specialization": "Doctor specialization",
                "hospital": "Doctor hospital",
                "matchPercentage": integer between 75 and 99 representing how good of a match they are,
                "reason": "1 short sentence explaining why they are a good fit for this specific patient."
            }
            OUTPUT ONLY THE JSON ARRAY. NO MARKDOWN, NO CODEBLOCKS.
        `;

        const aiResult = await model.generateContent(prompt);
        let text = aiResult.response.text().trim();

        if (text.startsWith("\`\`\`json")) text = text.replace(/^\`\`\`json/i, "");
        if (text.startsWith("\`\`\`")) text = text.replace(/^\`\`\`/i, "");
        if (text.endsWith("\`\`\`")) text = text.replace(/\`\`\`$/i, "");
        text = text.trim();

        const recommendations = JSON.parse(text);

        return res.json({ success: true, data: recommendations });

    } catch (error) {
        console.error("Doctor Recommendation Error:", error.message);
        return res.status(500).json({ success: false, message: "Error generating recommendations" });
    }
}

module.exports = { predictBiomarkers, extractBiomarkers, recommendDoctors };
