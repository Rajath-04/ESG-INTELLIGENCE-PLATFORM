# ESG Intelligence Platform

A modern, interactive web application for ESG (Environmental, Social, Governance) analytics and sustainability insights for Indian investors. Built with React frontend and FastAPI backend.

## 🌱 Features

- **Beautiful Sustainability Dashboard** - Modern React UI with smooth animations and interactive charts
- **Real-time ESG Analytics** - Company ESG scores, sector comparisons, and risk assessments
- **Live News Feed** - Google News integration with sentiment analysis and controversy detection
- **AI-Powered Chat** - ESG GPT assistant for investor questions (supports Groq API)
- **Interactive Charts** - Recharts visualizations for trends, breakdowns, and comparisons
- **PDF Reports** - Downloadable ESG investor reports
- **Custom ESG Lab** - Upload and process custom datasets with hybrid MSCI + Sustainalytics scoring

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with custom green eco-theme
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Beautiful, responsive charts
- **Axios** - API communication
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library

### Backend
- **FastAPI** - High-performance Python API framework
- **Uvicorn** - ASGI server
- **JWT Authentication** - Secure token-based auth
- **Pandas** - Data processing and analysis
- **Groq API** - LLM integration for ESG chat
- **ReportLab** - PDF generation
- **BeautifulSoup** - News scraping from Google News RSS

## 📦 Installation

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+**
- pip

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

**API Documentation:** Visit `http://localhost:8000/docs` for interactive Swagger documentation

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎨 Design Features

The UI features a modern sustainability-focused design with:
- **Green gradient theme** - Eco-friendly color palette (primary green + accent gold)
- **Glassmorphism effects** - Modern, premium auth forms
- **Animated KPI cards** - Engaging data presentation with hover effects
- **Responsive charts** - Area, bar, and pie charts with smooth transitions
- **Framer Motion animations** - Page transitions and component animations
- **Clean typography** - Inter font family throughout
- **Custom scrollbar** - Green-themed for consistency

## 📊 Dashboard Components

### Overview
- Top-level KPI cards (ESG, Environment, Social, Governance scores)
- ESG score trend chart (area chart)
- Pillar breakdown (bar chart)
- Score distribution (pie chart)
- Top ESG performers list

### Sector Insights
- Sector comparison charts
- Company rankings within sectors
- Highlighted current company

### Investor View
- Investment recommendations (Buy/Hold/Avoid)
- Risk level analysis
- PDF report download
- Important investor notes

### News & ESG
- Google News integration
- Sentiment analysis (Positive/Negative/Neutral)
- Controversy detection
- Animated news cards

### ESG GPT
- AI-powered chat assistant
- Rule-based fallback (works without API key)
- Groq API integration (optional)
- Company and sector queries
- ESG education

### Custom Lab
- File upload (CSV/Excel)
- Hybrid ESG engine (MSCI + Sustainalytics style)
- Results visualization
- Risk distribution charts

## 🔐 Authentication

Default credentials for demo:
- **Username:** `demo`
- **Password:** `demo123`

You can also register new accounts through the registration form.

## 📝 API Endpoints

### Authentication
- `POST /api/login` - User authentication
- `POST /api/register` - User registration

### Companies
- `GET /api/companies` - List all companies
- `GET /api/company/{name}` - Get company details
- `GET /api/sectors` - List all sectors
- `GET /api/sector/{name}` - Get companies in sector
- `GET /api/stats` - Get overall statistics

### Features
- `POST /api/news` - Fetch ESG news with sentiment analysis
- `POST /api/chat` - ESG GPT chat
- `POST /api/report` - Generate PDF report
- `POST /api/custom-esg/upload` - Upload custom dataset
- `POST /api/custom-esg/process` - Process with ESG engine

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
uvicorn main:app --reload
```

### Build for Production
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

## 🚀 Deployment

### Backend
Deploy the FastAPI backend to any Python hosting service (Heroku, Railway, Render, etc.)

### Frontend
Build the React app and deploy to static hosting (Vercel, Netlify, GitHub Pages, etc.)

Make sure to update the `API_BASE_URL` in `frontend/src/api.js` to point to your production backend.

## 📄 Project Structure

```
project3/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── auth.py              # JWT authentication
│   ├── utils.py             # ESG utilities
│   ├── requirements.txt     # Python dependencies
│   └── data/
│       └── structured_output.csv
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── api.js           # API service
│   │   ├── pages/
│   │   │   ├── Landing.jsx  # Landing page
│   │   │   └── Dashboard.jsx # Dashboard page
│   │   └── components/
│   │       ├── Overview.jsx
│   │       ├── SectorInsights.jsx
│   │       ├── InvestorView.jsx
│   │       ├── NewsTab.jsx
│   │       ├── ESGChat.jsx
│   │       └── CustomLab.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── data/                    # Original data (copied to backend/data)
└── app.py                   # Original Streamlit app (kept for reference)
```

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License

---

Built with ❤️ for sustainable investing in India 🌱

