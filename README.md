# CivicLogic: Election Simulator 🗳️

A pedagogical, high-fidelity web simulation of the Indian electoral process. Built for students and citizens to understand the mechanics of democracy—from candidate research to the final EVM beep.

## 🚀 Live Preview
The application is deployed to Google Cloud Run: [pwv2-election-process-live](https://pwv2-election-process-v2y7pqv7sa-uc.a.run.app)

## ✨ Key Features

### 🎭 Multi-Role Simulation
- **Voter (Active)**: Experience the full journey from registration to voting.
- **Candidate (Beta)**: Understand the nomination and campaign heat (Coming Soon).
- **Officer (Beta)**: Manage polling booths and ensure procedural integrity (Coming Soon).

### 🔍 Pedagogical Candidate Research
- **"Village-Simple" English**: Legal and financial terms from Form 26 are translated into localized analogies (e.g., *Liabilities* → *Bank Loans*, *Assets* → *Property & Gold*).
- **LogicAnalogy™ Tooltips**: Interactive hover-states that explain complex electoral concepts to 10-year-olds.

### 🗳️ Realistic Voting Day Workflow
- **3-Phase Poll**:
    1. **ID Verification**: Real-world officer check.
    2. **Inking**: Visualizing the mark of participation.
    3. **EVM & VVPAT**: Interactive EVM mockup with symbol-based voting and a 7-second VVPAT verification window.

### 🕵️ Information War Dashboard
- **"Spot the Lie"**: AI-powered campaign headlines where users must distinguish between real news and subtle misinformation.
- **Butterfly Effect**: The simulation calculates results based on user actions, demonstrating how a single vote or a single scam can flip a constituency.

### 🗺️ Localized Context
- **Curated Constituencies**: Real offline data for West Bengal, Tamil Nadu, Kerala, Assam, and Puducherry.
- **Dynamic Pincodes**: Auto-populated based on selected constituencies for realistic location pinning.

## 🛠️ Technology Stack
- **Backend**: Node.js, Express
- **Frontend**: EJS, Vanilla CSS (Premium Modern UI)
- **AI Engine**: Google Gemini 1.5 Flash (for news generation)
- **Maps**: Google Maps Static API
- **Infrastructure**: Google Cloud Run

## 🛡️ API Usage & Security
- **Gemini API**: Generates dynamic headlines and misinformation challenges.
- **Maps Static API**: Provides polling booth location visuals.
- **Budget Tracker**: Built-in middleware to monitor API credit consumption for the TryGCP trial.

## 📖 How to Run Locally

1. Clone the repo
2. Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_key
   GOOGLE_MAPS_API_KEY=your_key
   SESSION_SECRET=your_secret
   ```
3. Install dependencies: `npm install`
4. Start the server: `npm start`
5. Visit `http://localhost:3000`

---
*Disclaimer: This is a simulation. Names, parties, and events are fictionalized for educational purposes. We do not pick sides; we pick the process.*