"""
FastAPI Backend for ESG Intelligence Platform
"""
from datetime import timedelta
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq

from auth import (
    create_access_token,
    decode_token,
    get_password_hash,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from utils import (
    load_and_clean_data,
    fetch_google_news,
    analyse_text_sentiment,
    generate_esg_pdf,
    answer_esg_query_rule_based,
    ascii_safe,
    hybrid_esg_engine,
)

# Initialize FastAPI app
app = FastAPI(title="ESG Intelligence Platform API", version="1.0.0")

# CORS middleware - Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user storage (in production, use a database)
users_db = {
    "demo": {
        "username": "demo",
        "hashed_password": get_password_hash("demo123"),
        "role": "investor"
    },
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("admin123"),
        "role": "admin"
    }
}

# Load ESG data on startup
esg_data = load_and_clean_data("data/structured_output.csv")
print(f"[STARTUP] ESG data loaded: {len(esg_data)} companies")
if not esg_data.empty:
    print(f"[STARTUP] Sample companies: {esg_data['Company'].head(3).tolist()}")
else:
    print("[STARTUP] WARNING: ESG data is empty!")

# Session storage for custom ESG data (in production, use Redis or database)
custom_esg_storage = {}


# -----------------------------------------------------------
# PYDANTIC MODELS
# -----------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "investor"  # Default role is investor


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str  # Add role to token response


class ChatRequest(BaseModel):
    question: str
    groq_api_key: Optional[str] = None


class NewsRequest(BaseModel):
    query: str
    max_articles: int = 5


class PDFRequest(BaseModel):
    company: str
    include_core: bool = True
    include_pillars: bool = True
    include_risk: bool = True
    include_notes: bool = True


class AddCompanyRequest(BaseModel):
    company: str
    sector: str
    esg_score: float
    environment_score: float
    social_score: float
    governance_score: float
    category: str



# -----------------------------------------------------------
# AUTHENTICATION DEPENDENCY
# -----------------------------------------------------------
async def get_current_user(authorization: str = Header(None)):
    """Verify JWT token from Authorization header and return username"""
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    token = parts[1]
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    username = payload.get("sub")
    if username is None or username not in users_db:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    return username


# -----------------------------------------------------------
# API ENDPOINTS
# -----------------------------------------------------------
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "ESG Intelligence Platform API", "status": "running"}


@app.post("/api/register", response_model=Token)
async def register(request: RegisterRequest):
    """Register a new user"""
    if request.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    users_db[request.username] = {
        "username": request.username,
        "hashed_password": get_password_hash(request.password),
        "role": request.role,  # Store user role
    }
    
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": request.username,
        "role": request.role,  # Return role in response
    }


@app.post("/api/login", response_model=Token)
async def login(request: LoginRequest):
    """Login and get JWT token"""
    user = users_db.get(request.username)
    
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": request.username,
        "role": user["role"],  # Return role in response
    }


@app.get("/api/companies")
async def get_companies():
    """Get list of all companies with ESG data"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    # Convert DataFrame to list of dicts, handling NaN values
    companies = esg_data.fillna("N/A").to_dict(orient="records")
    
    return {
        "companies": companies,
        "total": len(companies),
    }


@app.get("/api/company/{company_name}")
async def get_company(company_name: str):
    """Get detailed ESG data for a specific company"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    company_data = esg_data[esg_data["Company"] == company_name]
    
    if company_data.empty:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Convert to dict and handle NaN values
    company_dict = company_data.fillna("N/A").iloc[0].to_dict()
    
    return company_dict


@app.get("/api/sectors")
async def get_sectors():
    """Get list of all sectors"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    sectors = esg_data["Sector"].dropna().unique().tolist()
    
    return {"sectors": sectors}


@app.get("/api/sector/{sector_name}")
async def get_sector_companies(sector_name: str):
    """Get all companies in a specific sector"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    sector_data = esg_data[esg_data["Sector"] == sector_name]
    
    if sector_data.empty:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    companies = sector_data.fillna("N/A").to_dict(orient="records")
    
    return {
        "sector": sector_name,
        "companies": companies,
        "total": len(companies),
    }


@app.post("/api/news")
async def get_news(request: NewsRequest):
    """Fetch news articles from Google News"""
    try:
        articles = fetch_google_news(request.query, request.max_articles)
        
        # Add sentiment analysis to each article
        for article in articles:
            text = f"{article.get('title', '')} {article.get('description', '')}"
            label, score, controversy = analyse_text_sentiment(text)
            article["sentiment"] = {
                "label": label,
                "score": score,
                "controversy": controversy,
            }
        
        return {
            "articles": articles,
            "total": len(articles),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """ESG GPT chat endpoint"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    # If no API key provided, use rule-based fallback
    if not request.groq_api_key:
        answer = answer_esg_query_rule_based(request.question, esg_data)
        return {"answer": answer, "source": "rule-based"}
    
    # Use Groq API for advanced queries
    try:
        top_df = esg_data.sort_values("ESG_Score", ascending=False).head(10)
        summary_lines = []
        for _, r in top_df.iterrows():
            summary_lines.append(
                f"{r['Company']} | Sector: {r['Sector']} | "
                f"ESG: {r['ESG_Score']} | E:{r['Environment_Score']} "
                f"S:{r['Social_Score']} G:{r['Governance_Score']} | "
                f"Risk: {r['Risk_Level']} | Action: {r['Investor_Action']}"
            )
        context = "\n".join(summary_lines)

        system_msg = (
            "You are an ESG assistant for Indian equity investors. "
            "You answer questions about ESG investing, ESG scores, risk levels, and basic concepts. "
            "You are NOT giving financial advice and must always remind the user that "
            "this is for educational ESG insight only, not a buy/sell recommendation."
        )
        user_msg = (
            "Here is a short summary of some companies and their ESG data from the user's dashboard:\n\n"
            f"{context}\n\n"
            "Now answer the investor's question:\n"
            f"{request.question}"
        )

        system_msg = ascii_safe(system_msg)
        user_msg = ascii_safe(user_msg)

        print(f"[DEBUG] Calling Groq API with question: {request.question}")
        client = Groq(api_key=request.groq_api_key)
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
        )
        answer = resp.choices[0].message.content
        answer += (
            "\n\n**Note:** This is an ESG-focused explanation and does not replace "
            "full financial or investment advice."
        )
        print(f"[DEBUG] Groq API success, answer length: {len(answer)}")
        return {"answer": answer, "source": "groq-api"}
    
    except Exception as e:
        # Fallback to rule-based on error
        print(f"[ERROR] Groq API failed: {type(e).__name__}: {str(e)}")
        fallback = answer_esg_query_rule_based(request.question, esg_data)
        error_msg = (
            "⚠ I attempted to use the live GPT API but encountered an error, "
            "so I'm falling back to the offline ESG assistant.\n\n"
            f"Error: {str(e)}\n\n"
            f"{fallback}"
        )
        return {
            "answer": error_msg,
            "source": "rule-based-fallback",
            "error": str(e),
        }



@app.post("/api/report")
async def generate_report(request: PDFRequest):
    """Generate PDF report for a company"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    company_data = esg_data[esg_data["Company"] == request.company]
    
    if company_data.empty:
        raise HTTPException(status_code=404, detail="Company not found")
    
    row = company_data.iloc[0]
    
    pdf_buffer = generate_esg_pdf(
        row,
        include_core=request.include_core,
        include_pillars=request.include_pillars,
        include_risk=request.include_risk,
        include_notes=request.include_notes,
    )
    
    if pdf_buffer is None:
        raise HTTPException(status_code=500, detail="PDF generation failed (ReportLab not available)")
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ESG_Report_{request.company}.pdf"}
    )


@app.post("/api/custom-esg/upload")
async def upload_custom_esg(file: UploadFile = File(...)):
    """Upload custom ESG dataset"""
    try:
        # Read uploaded file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file.file)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel.")
        
        # Store in session (in production, use proper session management)
        session_id = "default"  # In production, use actual session ID
        custom_esg_storage[session_id] = {"raw": df, "scored": None}
        
        return {
            "message": "File uploaded successfully",
            "rows": len(df),
            "columns": list(df.columns),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@app.post("/api/custom-esg/process")
async def process_custom_esg():
    """Process custom ESG dataset with hybrid engine"""
    session_id = "default"
    
    if session_id not in custom_esg_storage or custom_esg_storage[session_id]["raw"] is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded")
    
    try:
        raw_df = custom_esg_storage[session_id]["raw"]
        scored_df = hybrid_esg_engine(raw_df)
        custom_esg_storage[session_id]["scored"] = scored_df
        
        # Return processed data
        result = scored_df.fillna("N/A").to_dict(orient="records")
        
        return {
            "message": "ESG engine completed successfully",
            "companies": result,
            "total": len(result),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ESG engine failed: {str(e)}")


@app.get("/api/stats")
async def get_stats():
    """Get overall ESG statistics"""
    if esg_data.empty:
        raise HTTPException(status_code=500, detail="ESG data not loaded")
    
    stats = {
        "total_companies": len(esg_data),
        "total_sectors": esg_data["Sector"].nunique(),
        "avg_esg_score": float(esg_data["ESG_Score"].mean()),
        "avg_environment_score": float(esg_data["Environment_Score"].mean()),
        "avg_social_score": float(esg_data["Social_Score"].mean()),
        "avg_governance_score": float(esg_data["Governance_Score"].mean()),
        "risk_distribution": esg_data["Risk_Level"].value_counts().to_dict(),
        "action_distribution": esg_data["Investor_Action"].value_counts().to_dict(),
    }
    
    return stats


# -----------------------------------------------------------
# ADMIN-ONLY ENDPOINTS
# -----------------------------------------------------------
async def require_admin(token: str):
    """Verify user is admin"""
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    username = payload.get("sub")
    if username is None or username not in users_db:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    if users_db[username].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return username


@app.get("/api/admin/users")
async def get_all_users(current_user: str = Depends(get_current_user)):
    """Get all users (admin only)"""
    if users_db[current_user].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Return user list without passwords
    user_list = []
    for username, data in users_db.items():
        user_list.append({
            "username": username,
            "role": data.get("role", "investor"),
        })
    
    return {"users": user_list, "total": len(user_list)}


@app.delete("/api/admin/users/{username}")
async def delete_user(username: str, current_user: str = Depends(get_current_user)):
    """Delete a user (admin only)"""
    if users_db[current_user].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if username not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    if username == current_user:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    del users_db[username]
    return {"message": f"User {username} deleted successfully"}


@app.get("/api/admin/stats")
async def get_admin_stats(current_user: str = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    if users_db[current_user].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "total_users": len(users_db),
        "total_companies": len(esg_data) if not esg_data.empty else 0,
        "total_sectors": esg_data["Sector"].nunique() if not esg_data.empty else 0,
        "admin_users": sum(1 for u in users_db.values() if u.get("role") == "admin"),
        "investor_users": sum(1 for u in users_db.values() if u.get("role") == "investor"),
        "custom_datasets": len(custom_esg_storage),
    }


@app.get("/api/admin/system-logs")
async def get_system_logs(current_user: str = Depends(get_current_user)):
    """Get system logs (admin only)"""
    if users_db[current_user].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Mock logs for now
    logs = [
        {"timestamp": "2025-12-21 14:30:00", "level": "INFO", "message": "User 'demo' logged in"},
        {"timestamp": "2025-12-21 14:25:00", "level": "INFO", "message": "ESG data loaded successfully"},
        {"timestamp": "2025-12-21 14:20:00", "level": "INFO", "message": "Server started"},
    ]
    
    return {"logs": logs, "total": len(logs)}


@app.post("/api/admin/add-company-debug")
async def add_company_debug(data: dict, current_user: str = Depends(get_current_user)):
    """Debug endpoint to see raw data"""
    print("=== RAW REQUEST DATA ===")
    print(f"Data: {data}")
    print(f"Keys: {list(data.keys())}")
    for key, value in data.items():
        print(f"  {key}: {value} (type: {type(value).__name__})")
    print("========================")
    return {"received": data}

@app.post("/api/admin/add-company")
async def add_company(
    request: AddCompanyRequest,
    current_user: str = Depends(get_current_user)
):
    """Add a new company to the dataset (admin only)"""
    print(f"=== ADD COMPANY REQUEST ===")
    print(f"Request data: {request}")
    print(f"Company: {request.company}")
    print(f"Sector: {request.sector}")
    print(f"ESG Score: {request.esg_score}")
    print(f"Environment Score: {request.environment_score}")
    print(f"Social Score: {request.social_score}")
    print(f"Governance Score: {request.governance_score}")
    print(f"Category: {request.category}")
    print(f"===========================")
    
    if users_db[current_user].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    global esg_data
    
    # Validate scores
    if not (0 <= request.esg_score <= 100):
        raise HTTPException(status_code=400, detail="ESG Score must be between 0-100")
    if not (0 <= request.environment_score <= 100):
        raise HTTPException(status_code=400, detail="Environment Score must be between 0-100")
    if not (0 <= request.social_score <= 100):
        raise HTTPException(status_code=400, detail="Social Score must be between 0-100")
    if not (0 <= request.governance_score <= 100):
        raise HTTPException(status_code=400, detail="Governance Score must be between 0-100")
    
    # Determine risk level based on ESG score
    if request.esg_score >= 70:
        risk_level = "Low"
    elif request.esg_score >= 50:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    # Determine investor action
    if request.esg_score >= 70:
        investor_action = "Buy"
    elif request.esg_score >= 50:
        investor_action = "Hold"
    else:
        investor_action = "Avoid"
    
    # Create new company entry
    new_company = pd.DataFrame([{
        "Company": request.company,
        "Sector": request.sector,
        "ESG_Score": request.esg_score,
        "Environment_Score": request.environment_score,
        "Social_Score": request.social_score,
        "Governance_Score": request.governance_score,
        "ESG_Category": request.category,
        "Risk_Level": risk_level,
        "Investor_Action": investor_action,
        "Last_Updated": pd.Timestamp.now().strftime("%m/%d/%Y")
    }])
    
    # Add to dataset
    esg_data = pd.concat([esg_data, new_company], ignore_index=True)
    
    return {
        "message": f"Successfully added {request.company} to the dataset",
        "company": request.company,
        "total_companies": len(esg_data)
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
