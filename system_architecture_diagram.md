# ESG Intelligence Platform - System Architecture Diagram

## Main System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        
        subgraph "React Frontend - Port 5173"
            Landing[Landing Page<br/>Login/Register]
            InvestorDash[Investor Dashboard]
            AdminDash[Admin Dashboard]
            
            subgraph "Investor Components"
                Overview[Overview Tab]
                Sector[Sector Insights]
                InvestorView[Investor View]
                News[News & ESG]
                Chat[ESG GPT Chat]
                Lab[Custom Lab]
            end
            
            subgraph "Admin Components"
                UserMgmt[User Management]
                DataMgmt[Data Management]
                CompanyMgmt[Company Management]
            end
        end
    end
    
    subgraph "Server Layer"
        subgraph "FastAPI Backend - Port 8000"
            API[FastAPI Application]
            
            subgraph "Core Modules"
                Auth[Authentication<br/>JWT Tokens]
                Utils[ESG Processing<br/>Utilities]
            end
            
            subgraph "API Endpoints"
                AuthAPI[/api/login<br/>/api/register]
                CompanyAPI[/api/companies<br/>/api/company]
                FeaturesAPI[/api/news<br/>/api/chat<br/>/api/report]
                CustomAPI[/api/custom-esg/*]
                AdminAPI[/api/admin/*]
            end
        end
    end
    
    subgraph "Data Layer"
        CSV[ESG Dataset<br/>structured_output.csv]
        Memory[In-Memory Storage<br/>Users & Custom Data]
    end
    
    subgraph "External Services"
        Groq[Groq API<br/>LLM Service]
        GoogleNews[Google News RSS]
    end
    
    Browser --> Landing
    Landing --> InvestorDash
    Landing --> AdminDash
    
    InvestorDash --> Overview
    InvestorDash --> Sector
    InvestorDash --> InvestorView
    InvestorDash --> News
    InvestorDash --> Chat
    InvestorDash --> Lab
    
    AdminDash --> UserMgmt
    AdminDash --> DataMgmt
    AdminDash --> CompanyMgmt
    
    Overview --> API
    Sector --> API
    InvestorView --> API
    News --> API
    Chat --> API
    Lab --> API
    UserMgmt --> API
    DataMgmt --> API
    CompanyMgmt --> API
    
    API --> AuthAPI
    API --> CompanyAPI
    API --> FeaturesAPI
    API --> CustomAPI
    API --> AdminAPI
    
    AuthAPI --> Auth
    CompanyAPI --> Utils
    FeaturesAPI --> Utils
    CustomAPI --> Utils
    AdminAPI --> Auth
    
    Auth --> Memory
    Utils --> CSV
    Utils --> Memory
    
    FeaturesAPI --> Groq
    FeaturesAPI --> GoogleNews
    
    style Browser fill:#e1f5ff
    style API fill:#d4edda
    style Groq fill:#fff3cd
    style GoogleNews fill:#fff3cd
    style CSV fill:#f8d7da
    style Memory fill:#f8d7da
```

## Technology Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data Visualization
- **Axios** - HTTP Client

### Backend
- **FastAPI** - Web Framework
- **Uvicorn** - ASGI Server
- **Pandas** - Data Processing
- **JWT** - Authentication
- **Groq SDK** - AI Integration
- **ReportLab** - PDF Generation

### Data
- **CSV Files** - ESG Dataset Storage
- **In-Memory** - User & Session Data
- **Future: PostgreSQL** - Persistent Database

## Key Features

1. **Dual Dashboard System**
   - Investor Dashboard (6 tabs)
   - Admin Dashboard (User/Data/Company Management)

2. **ESG Analytics**
   - Company ESG Scores
   - Sector Comparisons
   - Risk Analysis
   - Investor Recommendations

3. **AI-Powered Features**
   - ESG GPT Chat Assistant
   - News Sentiment Analysis
   - Custom ESG Lab

4. **Security**
   - JWT Authentication
   - Password Hashing (bcrypt)
   - CORS Protection
   - Role-based Access Control
