# 🗳️ CivicLogic — Election Simulator

> **Prompt Wars Virtual · Chapter 2: The Election Process**

An interactive, AI-powered civic education simulator that puts you through the full journey of a voter in India's 2026 State Assembly Elections — from the ECI announcement right through to poll day. Experience how misinformation can derail democratic participation, and how an informed voter makes all the difference.

🌐 **Live Demo:** [civic-logic-simulator-1028340760722.asia-south1.run.app](https://civic-logic-simulator-1028340760722.asia-south1.run.app)

---

## 🎮 What It Simulates

The simulator walks you through **5 progressive stages**, each with state-specific data and dynamic AI-generated content:

| Stage | Description |
|---|---|
| **1. Announcement** | ECI announces elections. Pick your state & constituency. Choose your simulation start date from a news timeline. |
| **2. Civic Roadmap (Prep)** | Interactive voter preparation — check electoral roll, download e-EPIC, locate polling booth. |
| **3. Information War (Campaign)** | 3 rounds of real vs. fake news. Choose wrong and you get "scammed" — which directly affects your poll eligibility. |
| **4. Poll Day** | Cast your vote (or get turned away if ineligible — with the exact fake news reason cited). |
| **5. Counting** | View the final simulation outcome based on your choices. |

---

## ✨ Key Features

### 🗞️ Dynamic News Timeline
The **Announcement phase** presents election milestone dates as distinct media formats:
- 📰 **Newspaper card** — ECI announcement / Phase 1
- 📱 **Mobile app notification** — Enrollment deadline / Phase 2
- 🌐 **Website news** — Campaign sprint / Phase 3

Clicking any card sets your simulation date, which recalculates the entire dashboard (days remaining, stage status, eligibility).

### 🧠 Information War
Three rounds of headline challenges using **Gemini AI**-generated fake news tailored to your selected state. If you believe misinformation:
- You are marked as "scammed"
- The specific fake headline you believed is stored
- On Poll Day, your ineligibility reason **directly quotes** that headline

### 📍 State-Specific Election Data
Real 2026 Assembly Election poll dates for:
- **Assam** — 9 Apr 2026
- **Kerala** — 9 Apr 2026
- **Puducherry** — 9 Apr 2026
- **Tamil Nadu** — 23 Apr 2026
- **West Bengal** — 29 Apr 2026

All timelines (enrollment deadline, campaign phase, poll day) are computed dynamically from the official poll date.

### 🗺️ Polling Booth Locator
Powered by **Google Maps Static API** — displays a map of the user's polling booth based on their constituency and PIN code.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18 |
| **Framework** | Express.js |
| **Templating** | EJS |
| **Styling** | Tailwind CSS (via CDN) |
| **AI** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **Maps** | Google Maps Static API |
| **Sessions** | `express-session` (in-memory) |
| **Deployment** | Google Cloud Run (asia-south1) |
| **Container** | Docker |

---

## 📁 Project Structure

```
pwv2-ch2-election-process/
├── server.js                  # Express app entry point
├── Dockerfile                 # Cloud Run container config
├── .env.example               # Environment variable template
├── logic/
│   ├── stateMachine.js        # Core simulation state management
│   └── electionData.json      # State-specific poll dates & config
├── middleware/
│   └── budget.js              # Gemini API usage tracker
├── routes/
│   ├── auth.js                # Login / role selection
│   ├── simulate.js            # Main simulation flow & timeline logic
│   └── results.js             # Final outcome display
└── views/
    ├── login.ejs
    ├── simulate.ejs           # All 5 simulation stage UIs
    ├── results.ejs
    └── partials/
        ├── header.ejs         # Tailwind config + news card styles
        └── footer.ejs
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [Google Maps Static API key](https://developers.google.com/maps/documentation/maps-static/get-api-key)

### Setup

```bash
# Clone the repo
git clone https://github.com/vikas-bandaru/pwv2-ch2-election-process.git
cd pwv2-ch2-election-process

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your actual API keys
```

### Environment Variables

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_static_api_key_here
SESSION_SECRET=your_session_secret_here
```

### Start

```bash
npm start
# → http://localhost:3000
```

---

## ☁️ Deploying to Cloud Run

```bash
gcloud run deploy civic-logic-simulator \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=...,GOOGLE_MAPS_API_KEY=...,SESSION_SECRET=..."
```

> **Note:** Do not include `PORT` in `--set-env-vars` — Cloud Run sets this automatically.

---

## 🧩 State Machine

The simulation is driven by `logic/stateMachine.js`, which manages transitions between:

```
ANNOUNCEMENT → PREP → CAMPAIGN → POLL → COUNTING
```

Key data tracked per session:

| Field | Description |
|---|---|
| `state` | Current simulation stage |
| `location` | Selected state, constituency, PIN code |
| `simulationDate` | Chosen start date (drives timeline calculations) |
| `isRegistered` | Whether voter completed Form 6 |
| `isScammed` | Whether user believed fake news |
| `scamHeadline` | The exact fake headline believed (shown on poll day) |
| `campaignIndex` | Current round in the Information War (0–2) |

---

## ⚠️ Known Limitations

- **Sessions are in-memory** — reset on Cloud Run cold starts. For persistent sessions, add a Redis store.
- **Booth location** is approximate (based on constituency + PIN) — not real-time geocoded.
- **Gemini responses** are subject to variability; fallback headlines are used if the API call fails.

---

## 📜 License

MIT — built for the Prompt Wars Virtual educational series.