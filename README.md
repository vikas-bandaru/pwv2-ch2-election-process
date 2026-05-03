# CivicLogic: Indian Election Process Simulator 🗳️

A pedagogical, high-fidelity web simulation of the Indian electoral process. Built for students and citizens to understand the mechanics of democracy - from candidate research to the final EVM beep.

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-success)](https://pwv2-election-process-1028340760722.us-central1.run.app)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-blue)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🚀 Live Preview
The application is deployed to Google Cloud Run: [pwv2-election-process-live](https://pwv2-election-process-1028340760722.us-central1.run.app)

---

## ✨ Key Features

### 🎭 Multi-Role Simulation
- **Voter (Active)**: Experience the full journey from registration to voting.
- **Candidate (Beta)**: Understand the nomination and campaign heat (Phase 2).
- **Presiding Officer (Beta)**: Manage polling booths and ensure procedural integrity (Phase 2).

### 🔍 Pedagogical Candidate Research
- **"Village-Simple" English**: Legal and financial terms from Form 26 are translated into localized analogies (e.g., *Liabilities* → *Bank Loans*, *Assets* → *Property & Gold*).
- **LogicAnalogy™ Tooltips**: Interactive hover-states that explain complex electoral concepts in plain language.

### 🗳️ Realistic Voting Day Workflow
- **3-Phase Poll Process**:
    1. **ID Verification**: Real-world officer check simulation.
    2. **Inking**: Visualizing the mark of participation.
    3. **EVM & VVPAT**: Interactive EVM mockup with symbol-based voting and a mandatory 7-second VVPAT verification window.

### 🕵️ Information War Dashboard
- **"Spot the Lie"**: AI-powered campaign headlines where users must distinguish between real news and subtle misinformation.
- **Butterfly Effect**: The simulation calculates results based on user actions, demonstrating how a single vote or a single scam can flip a constituency.

---

## 🛠️ Technology Stack
- **Backend**: Node.js 18 (Express Framework)
- **Frontend**: EJS Templating, Vanilla CSS (Premium Glassmorphism Design)
- **AI Engine**: Google Gemini 1.5 Flash (Dynamic news and challenge generation)
- **Maps**: Google Maps Static API (Polling booth visualization)
- **Infrastructure**: Docker, Google Cloud Run, Cloud Build

---

## 📊 Project Audit Report (May 2026)

| Component | Status | Details |
|-----------|--------|---------|
| **Core Engine** | ✅ Stable | `CivicStateMachine` handles state transitions with 100% reliability. |
| **UI/UX** | ✅ Verified | Fully responsive across Desktop, Tablet, and Mobile. Premium CSS aesthetics. |
| **API Integration** | ✅ Active | Gemini 1.5 Flash integration successfully generating localized news. |
| **Security** | ✅ Secure | Environment variables strictly separated; session-based state management. |
| **Deployment** | ✅ Live | Successfully containerized and serving traffic on Cloud Run. |
| **Pedagogical Integrity** | ✅ High | All legal terms mapped to simplified analogies for student accessibility. |

### 🛡️ API Usage & Budgeting
- **Budget Tracker**: Built-in middleware monitors API credit consumption to stay within the TryGCP $5 trial limit.
- **Fallbacks**: Graceful fallback to static data if Gemini/Maps limits are reached.

---

## 📖 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Google Cloud Project with Gemini and Maps Static API enabled

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/vikas-bandaru/pwv2-ch2-election-process.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_key
   GOOGLE_MAPS_API_KEY=your_key
   SESSION_SECRET=your_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment
To deploy to Cloud Run:
```bash
gcloud run deploy pwv2-election-process --source . --project [YOUR_PROJECT_ID]
```

---

*Disclaimer: This is an educational simulation. Names, parties, and events are fictionalized for educational purposes. We do not pick sides; we pick the process.*