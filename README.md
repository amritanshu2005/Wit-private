# 🛡️ iCivic Guardian

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal.svg)](https://fastapi.tiangolo.com/)

**AI-Powered Digital Watchdog for Smart & Safe Cities**

> "From reporting civic issues to predicting them — iCivic Guardian transforms citizens into guardians of their city."

![iCivic Guardian](https://img.shields.io/badge/Hackathon-Ready-orange?style=for-the-badge)

---

## 🚀 About

iCivic Guardian is a next-generation **AI + MERN** based civic-tech platform that empowers citizens to report, track, and resolve civic issues while helping governments predict, prioritize, and prevent problems before they escalate.

### Key Differentiators

- 🤖 **AI-Powered Analysis** - Automatic issue categorization and priority scoring
- 🗺️ **Interactive Maps** - Geo-tagged complaints with real-time visualization
- 👥 **Community Verification** - Crowdsourced validation of reports
- 📊 **Predictive Analytics** - Hotspot detection and future issue forecasting
- 🏆 **Gamification** - Civic points and badges for active participation

---

## 🎯 Features

### 👥 Citizen Portal
- 📸 AI-based Issue Reporting (Image/Text)
- 🧠 Auto Categorization (Road, Water, Electricity, Safety, Waste)
- 📍 Geo-tagged Complaints with Address Detection
- 📊 Live Status Tracking
- 🗳️ Community Upvote & Verification System
- 🏆 Gamified Civic Points & Badges

### 🏛️ Authority Dashboard
- 📈 Real-time Complaint Analytics
- 🚨 AI Priority Scoring System
- 🔮 Predictive Issue Heatmaps
- 🧾 Performance & SLA Monitoring
- 🤖 Auto Routing to Departments

### 🧠 AI/ML Capabilities
- 🖼️ Image Classification (CNN)
- 📝 NLP for Complaint Understanding (Gemini API)
- 📊 ML-based Priority Prediction
- 🔍 Fake/Duplicate Complaint Detection
- 🌆 KMeans Hotspot Clustering

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Leaflet Maps, Recharts |
| **Backend** | Node.js, Express.js, MongoDB (GeoSpatial), JWT Auth |
| **AI/ML** | Python, FastAPI, Scikit-learn, Gemini API |
| **DevOps** | Docker, Docker Compose |

---

## 📦 Project Structure

```
iCivic-Guardian/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context
│   │   └── services/          # API services
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   └── package.json
│
├── ai-engine/                 # Python FastAPI
│   ├── services/              # ML services
│   ├── main.py                # FastAPI app
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- Gemini API Key (optional, for NLP features)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/iCivic-Guardian.git
cd iCivic-Guardian

# Set environment variables
export GEMINI_API_KEY=your-api-key

# Start all services
docker-compose up --build
```

### Option 2: Manual Setup

#### 1. Backend Server

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed demo data
npm run seed

# Start server
npm run dev
```

#### 2. AI Engine

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your GEMINI_API_KEY

# Start AI server
uvicorn main:app --reload --port 8000
```

#### 3. Frontend

```bash
cd client
npm install
npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| AI Engine | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## 🔐 Demo Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.com | demo123 |
| Authority | authority@demo.com | demo123 |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `POST /api/issues/:id/upvote` - Upvote issue
- `POST /api/issues/:id/verify` - Verify issue

### Analytics (Authority)
- `GET /api/analytics/stats` - Dashboard statistics
- `GET /api/analytics/heatmap` - Heatmap data
- `GET /api/analytics/priority-queue` - Priority queue

### AI Engine
- `POST /analyze-image` - Analyze issue image
- `POST /analyze-text` - Analyze complaint text
- `POST /predict-priority` - Predict issue priority
- `POST /detect-duplicate` - Check for duplicates
- `POST /get-hotspots` - Get clustered hotspots

---

## 🏆 Why This Wins Hackathons

✅ **Real-world Impact** - Solves actual civic problems  
✅ **AI + Full Stack Depth** - Demonstrates technical expertise  
✅ **Scalable Architecture** - Production-ready design  
✅ **Strong Problem-Solution Fit** - Clear value proposition  
✅ **Live Demo Ready** - Working end-to-end flow  
✅ **Beautiful UI/UX** - Premium, polished interface  

---

## 🚧 Future Roadmap

- 🔗 Blockchain-based complaint immutability
- 🧠 Reinforcement Learning for auto-decision making
- 📱 Mobile App (React Native)
- 🗣️ Multilingual AI Assistant
- 🛰️ IoT Sensor Integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📜 License

MIT License © 2025 iCivic Guardian

---

<p align="center">
  Built with ❤️ for smarter, safer cities
</p>
