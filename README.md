# IntelliView AI 🚀

> An AI-powered Resume Analysis & Recruiter-Grade Interview Coaching Platform designed to elevate candidates, students, and job seekers.

IntelliView AI transforms preparation into progress. By extracting and parsing technical resumes using advanced ATS scoring pipelines, candidates receive deep visual feedback, skill gap analysis, custom week-by-week learning roadmaps, and recruiter-optimized LinkedIn profiles. Furthermore, the platform conducts interactive voice/text mock interview practice sessions powered by highly expert HR recruiter personas, delivering sentence-by-sentence feedback, score ratings, and automated response transcription.

---

## 🌟 Key Features

### 1. **ATS Resume Analysis Diagnostics**
* **Recursive Skill Parsing**: Automatically scans resume uploads to extract core technologies, tools, and languages.
* **Granular Diagnostics**: Calculates an aggregate ATS scorecard, highlighting core structural strengths versus critical areas of weakness.
* **Upload Support**: Accepts standard `.docx` and `.pdf` formats up to 5MB, running validation checks client-side.

### 2. **Recruiter-Grade Mock Interview Simulator**
* **Expert Recruiter Persona**: Interactive voice/text interviews guided by a Llama 3.3 70B AI mimicking a 10+ year senior technical HR recruiter.
* **Dynamic Gating**: Evaluator analyzes responses in real-time, rewarding detailed, quantitative, metric-backed response patterns and penalizing evasive answers.
* **Audio Transcription**: Leverages ultra-fast transcription to capture and process voice responses directly from the candidate's microphone.
* **PDF Performance Report**: Standardized ReportLab compiler creates a printable performance review card detailing response grades and study tips.

### 3. **Career Optimizer Workspace**
* **Internship Recommendations**: Recommends technical job roles suited for the parsed resume credentials, indicating key tool/skill gaps.
* **Weekly Roadmaps**: Creates a customized, week-by-week visual learning roadmap listing suggested projects, tasks, and study guides.
* **LinkedIn Copywriter Generator**: Instantly generates SEO-optimized LinkedIn headlines, professional "About" summaries, and CV profile bios with built-in "Copy to Clipboard" utility tools.

### 4. **Modern UI/UX Design System**
* Elegant dark mode with harmony HSL color tokens, glassmorphism containers, smooth animations, loading skeletons, and interactive Recharts data visualization interfaces.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (React 18), Lucide Icons, Recharts (Data Visualizations), Tailwind CSS.
* **Backend**: FastAPI (Python 3.10+), Uvicorn.
* **Database**: Dual-Mode Architecture — Cloud Firestore (Production) & local thread-safe JSON DB fallback (Offline development).
* **AI & Language Processing**: Llama 3.3 70B via Groq API.

---

## 📦 Directory Structure

```text
IntelliView AI/
├── backend/
│   ├── main.py                 # FastAPI Application Server Entrypoint
│   ├── config.py               # Environment configuration loader
│   ├── routes/
│   │   ├── auth.py             # Candidate profile management
│   │   ├── resume.py           # Drag-drop resume extraction
│   │   ├── interview.py        # Interview session setups & STT audio transcribes
│   │   ├── career.py           # Internship recommendations & roadmaps
│   │   └── admin.py            # Global stats & skill growth counters
│   ├── models/
│   │   ├── schemas.py          # Pydantic data models
│   │   └── database.py         # Dual database interface (Firestore / local)
│   ├── services/
│   │   └── rag_service.py      # Recursive splitter & Chroma vector searches
│   ├── agents/
│   │   └── interview_agent.py  # Expert HR recruiter prompt templates
│   └── requirements.txt        # Python backend package dependencies
├── frontend/
│   ├── components/
│   │   ├── Navbar.js           # Header navigation
│   │   └── Layout.js           # Reusable page wrapper
│   ├── services/
│   │   └── api.js              # Unified client API services
│   ├── pages/
│   │   ├── index.js            # Premium landing page
│   │   ├── auth.js             # Sign-in/Register portal
│   │   ├── dashboard.js        # ATS analytics & history
│   │   ├── career.js           # Career roadmaps & LinkedIn copywriters
│   │   ├── analysis.js         # Resume parser dropzone
│   │   └── admin.js            # Secure Platform command center
│   └── package.json            # Node.js frontend package dependencies
├── .gitignore                  # Git production exclusion list
└── .env.example                # Blank environment variables template
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of your project directory (or write directly to system environments) based on [.env.example](file:///.env.example):

```env
# Port the backend runs on
PORT=8000

# Database Engine Mode ('auto' | 'firebase' | 'local')
DATABASE_MODE=local

# Groq Cloud API Key (Get at console.groq.com)
GROQ_API_KEY=your_groq_api_key

# Firebase Client SDK Configuration (Required for online mode)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Running Locally

Follow these instructions to start the development servers:

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (Command Prompt/PowerShell):
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node.js package dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the platform at **[https://intelliview-ai-seven.vercel.app/](https://intelliview-ai-seven.vercel.app/)** (or the outputted local port).

---

## 📸 Screenshots

*Include premium screenshots of your application dashboard, landing page, and mock session pages here to capture recruiter interest.*

![IntelliView Dashboard Mockup](https://raw.githubusercontent.com/anirudhabhutada/intelliview-ai/main/frontend/public/dashboard-mock.png)

---

## 🌐 Deployment Instructions

### Frontend Deployment (Vercel)
The easiest way to deploy the Next.js app is with the Vercel Platform:
1. Push your code to your GitHub repository.
2. Link your repository in Vercel.
3. Configure the environment variables (`NEXT_PUBLIC_API_URL` matching your backend, plus Firebase client keys).
4. Click **Deploy**.

### Backend Deployment (Render / Heroku)
To deploy the FastAPI backend:
1. Set up a Web Service on Render or Heroku linking your GitHub repository.
2. Set the build command to `pip install -r requirements.txt`.
3. Set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Configure all environment variables (e.g. `GROQ_API_KEY`, `DATABASE_MODE=local` or `firebase`).
