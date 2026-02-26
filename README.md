Initial commit

AarogyaMukh-App/
│
├── frontend/                 # React (Vite) + Tailwind + PWA capabilities
│   ├── public/               # (Make it a PWA so it feels like a native app on mobile)
│   ├── src/
│   │   ├── components/       # CameraCapture, PatientSurveyForm, RiskGauge
│   │   ├── pages/            # WorkerDashboard, NewScreening, PatientReport
│   │   ├── services/         # Axios API calls to Node
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  # Node.js + Express
│   ├── models/               # MongoDB Schemas: Patient (history, risk_score, image_url)
│   ├── routes/               # /api/screenings, /api/patients
│   ├── controllers/          # Logic to handle image uploads (e.g., Multer) and call FastAPI
│   └── server.js             
│
└── ml_engine/                # YOU (ETHAN): Python + FastAPI + PyTorch
    ├── datasets/             # Ignored in git!
    ├── models/               
    │   ├── mobilenet_v3.py   # Better than ResNet for smartphone images!
    │   └── risk_model.py     # Simple Feed-Forward NN for the survey data
    ├── checkpoints/          # Saved .pth weights
    ├── api.py                # FastAPI server handling the multimodal fusion
    ├── train_vision.py       # Script to train the image classifier
    └── requirements.txt