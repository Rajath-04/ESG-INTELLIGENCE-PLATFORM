import os
from io import BytesIO
from urllib.parse import quote_plus

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
import streamlit as st
from bs4 import BeautifulSoup
from groq import Groq

# Optional libraries
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except Exception:
    canvas = None

# -----------------------------------------------------------
# APP CONFIG
# -----------------------------------------------------------
st.set_page_config(
    page_title="ESG Intelligence Platform",
    page_icon="🌱",
    layout="wide",
)


# -----------------------------------------------------------
# THEME / CSS
# -----------------------------------------------------------
def inject_css(is_landing: bool):
    """Inject CSS. If is_landing=True we show scenic background, else light UI."""
    bg_css = (
        """
        .stApp {
            /* ESG Mixed Theme: Eco-Architecture / Modern City */
            background-image:
              linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)),
              url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80");
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
        }
        
        /* FORCE ALL TEXT WHITE ON LANDING */
        .stApp p, .stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp h5, .stApp h6,
        .stApp span, .stApp label, .stApp div, .stApp li {
            color: #FFFFFF !important;
            text-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }
        
        /* Reset Input/Tab Text */
        .stTextInput input {
            color: #0F172A !important;
            text-shadow: none !important;
        }
        .stTabs [data-baseweb="tab"] {
            color: #CBD5E1 !important;
            text-shadow: none !important;
        }
        .stTabs [aria-selected="true"] {
            color: #10B981 !important;
            text-shadow: none !important;
        }
        
        /* LANDING: Remove top padding */
        .block-container {
            padding-top: 2rem !important;
            padding-bottom: 3rem !important;
        }
        """
        if is_landing
        else """
        .stApp {
            background: #F3F4F6;
            font-family: "Inter", "Segoe UI", system-ui, sans-serif;
        }
        
        /* DASHBOARD: Main Content Card */
        .block-container {
            background-color: #FFFFFF;
            padding: 3rem !important;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            max-width: 1280px;
            margin-top: 2rem;
            margin-bottom: 2rem;
            border: 1px solid #E5E7EB;
            color: #0F172A !important;
        }
        /* Force dark text for specific elements in Dashboard */
        .block-container h1, .block-container h2, .block-container h3, 
        .block-container h4, .block-container h5, .block-container h6,
        .block-container p, .block-container span, .block-container label, 
        .block-container li, .block-container div {
            color: #0F172A !important;
            text-shadow: none !important;
        }
        """
    )

    st.markdown(
        f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    {bg_css}

    /* REMOVE STREAMLIT TOP PADDING ("White Box" removal) */
    .block-container {{
        padding-top: 2rem !important;
        padding-bottom: 3rem !important;
    }}
    header {{
        background: transparent !important;
    }}

    /* TYPOGRAPHY */
    h1, h2, h3, h4, h5, h6, p, span, label {{
        font-family: 'Inter', sans-serif;
    }}
    
    /* DASHBOARD CARD */
    .main-panel {{
        max-width: 1280px;
        margin: 0 auto;
        padding: 2.5rem;
        background: #FFFFFF;
        border-radius: 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 1px solid #E2E8F0;
    }}
    
    /* Force Dark Text ONLY in Main Panel */
    .main-panel h1, .main-panel h2, .main-panel h3, .main-panel h4, 
    .main-panel p, .main-panel span, .main-panel label, .main-panel div {{
        color: #0F172A !important;
        text-shadow: none !important;
    }}

    /* LANDING HERO */
    .hero-title {{
        font-size: 3.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #FACC15, #4ADE80); /* Gold to Green */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent !important; /* Override global white */
        text-shadow: none !important; /* Remove shadow to keep gradient clean, or subtle glow */
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); /* Use drop-shadow for gradient text */
        line-height: 1.1;
        margin-bottom: 1.2rem;
    }}
    .hero-subtitle {{
        font-size: 1.25rem;
        color: #E2E8F0 !important;
        max-width: 600px;
        margin-bottom: 2rem;
        line-height: 1.6;
        text-shadow: 0 3px 6px rgba(0,0,0,0.8);
    }}
    
    /* INPUTS & SELECTS */
    .stTextInput > div > div > input {{
        background-color: #FFFFFF !important;
        color: #0F172A !important;
        border: 1px solid #CBD5E1 !important;
        border-radius: 0.5rem !important;
        padding: 0.6rem 0.8rem !important;
    }}
    .stTextInput > div > div > input:focus {{
        border-color: #10B981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
    }}
    
    /* BUTTONS */
    .stButton > button {{
        background: #10B981 !important;
        color: white !important;
        border: none !important;
        border-radius: 9999px !important; /* Rounded pills */
        font-weight: 600 !important;
        padding: 0.6rem 2rem !important;
        transition: all 0.2s;
        text-shadow: none !important;
    }}
    .stButton > button:hover {{
        background: #059669 !important;
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
    }}

    /* SIDEBAR */
    section[data-testid="stSidebar"] {{
        background-color: #0F172A !important;
        border-right: 1px solid #1E293B;
    }}
    section[data-testid="stSidebar"] h1, section[data-testid="stSidebar"] h2, section[data-testid="stSidebar"] label {{
       color: #F8FAFC !important;
       text-shadow: none !important;
    }}
    section[data-testid="stSidebar"] p {{
       color: #94A3B8 !important;
       text-shadow: none !important;
    }}
    
    /* Auth Card (Landing) - Target the Streamlit Bordered Container */
    [data-testid="stVerticalBlockBorderWrapper"] {{
        background: rgba(15, 23, 42, 0.6); 
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        padding: 2.5rem !important;
        border-radius: 1.5rem !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }}
    /* Hide the default border of the container internal element if needed */
    [data-testid="stVerticalBlockBorderWrapper"] > div {{
        border: none !important;
    }}
    </style>
    """,
        unsafe_allow_html=True,
    )


# -----------------------------------------------------------
# UTILS: ESG helpers, news, etc.
# -----------------------------------------------------------
def esg_risk_bucket(x: float) -> str:
    if pd.isna(x):
        return "Unknown"
    if x >= 70:
        return "Low"
    if x >= 50:
        return "Medium"
    return "High"


def ascii_safe(text: str) -> str:
    if not isinstance(text, str):
        return text
    return text.encode("ascii", "ignore").decode("ascii")


NEGATIVE_WORDS = [
    "fraud",
    "scam",
    "pollution",
    "leak",
    "accident",
    "fine",
    "penalty",
    "probe",
    "investigation",
    "corruption",
    "violation",
    "ban",
    "strike",
    "protest",
    "layoff",
    "explosion",
    "fire",
    "complaint",
    "case",
    "lawsuit",
    "illegal",
    "toxic",
    "hazardous",
    "dumping",
]
POSITIVE_WORDS = [
    "award",
    "recognised",
    "recognition",
    "clean energy",
    "solar",
    "wind",
    "renewable",
    "sustainability",
    "sustainable",
    "green",
    "partnership",
    "expansion",
    "profit",
    "growth",
    "record",
    "milestone",
    "csr",
    "donation",
    "scholarship",
    "education",
    "healthcare",
]
CONTROVERSY_WORDS = [
    "ngt",
    "sebi",
    "cpcb",
    "pollution control board",
    "tribunal",
    "penalty",
    "fine",
    "closure",
    "shutdown",
    "violation",
    "illegal",
    "ban",
]


def analyse_text_sentiment(text: str):
    text_low = text.lower()
    score = 0
    for w in POSITIVE_WORDS:
        if w in text_low:
            score += 1
    for w in NEGATIVE_WORDS:
        if w in text_low:
            score -= 1
    if score > 0:
        label = "Positive"
    elif score < 0:
        label = "Negative"
    else:
        label = "Neutral"
    controversy = any(w in text_low for w in CONTROVERSY_WORDS)
    return label, score, controversy


# --------- FIXED GOOGLE NEWS FETCHER (NO MORE HTML JUNK) ----------
def fetch_google_news(query: str, max_articles: int = 5):
    """
    Fetch news from Google News RSS, return clean list of dicts:
    {title, description, url, source:{name}, publishedAt}
    """
    encoded_q = quote_plus(query)
    url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-IN&gl=IN&ceid=IN:en"

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        st.warning(f"Could not fetch news from Google News RSS: {e}")
        return []

    soup = BeautifulSoup(resp.content, "xml")
    items = soup.find_all("item")[:max_articles]
    articles = []
    for item in items:
        title = item.title.text if item.title else ""
        link = item.link.text if item.link else ""
        desc_html = item.description.text if item.description else ""
        desc_text = BeautifulSoup(desc_html, "html.parser").get_text(" ", strip=True)
        source_tag = item.find("source")
        source_name = source_tag.text if source_tag else "Google News"
        pub_date = item.pubDate.text if item.pubDate else ""

        articles.append(
            {
                "title": title,
                "description": desc_text,
                "url": link,
                "source": {"name": source_name},
                "publishedAt": pub_date,
            }
        )
    return articles


# -----------------------------------------------------------
# DATA LOADING
# -----------------------------------------------------------
@st.cache_data
def load_and_clean_data(path="data/structured_output.csv") -> pd.DataFrame:
    if not os.path.exists(path):
        st.error("❗ Dataset not found. Place it inside a /data folder next to app.py.")
        return pd.DataFrame()

    df = pd.read_csv(path)

    rename_map = {
        "Unnamed: 0": "Company",
        "Sector Classification": "Sector",
        "ESG\nScore": "ESG_Score",
        "ESG Score": "ESG_Score",
        "Environment Score": "Environment_Score",
        "Social": "Social_Score",
        "Social Score": "Social_Score",
        "Governance Score": "Governance_Score",
        "Category": "ESG_Category",
        "Last Updated On": "Last_Updated",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
    df = df[[c for c in df.columns if not c.startswith("Unnamed")]]

    for col in ["Company", "Sector", "ESG_Category", "Last_Updated"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
        else:
            if col in ["Company", "Sector"]:
                df[col] = "Unknown"

    numeric_cols = ["ESG_Score", "Environment_Score", "Social_Score", "Governance_Score"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        else:
            df[col] = np.nan

    df["Risk_Level"] = df["ESG_Score"].apply(esg_risk_bucket)

    def investor_action(x):
        if pd.isna(x):
            return "Review"
        if x >= 70:
            return "Buy"
        if x >= 50:
            return "Hold"
        return "Avoid"

    df["Investor_Action"] = df["ESG_Score"].apply(investor_action)
    return df


# -----------------------------------------------------------
# PDF REPORT
# -----------------------------------------------------------
def generate_esg_pdf(
    row: pd.Series,
    include_core=True,
    include_pillars=True,
    include_risk=True,
    include_notes=True,
) -> BytesIO | None:
    if canvas is None:
        return None

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    company = row.get("Company", "Unknown")
    sector = row.get("Sector", "Unknown")
    esg = row.get("ESG_Score", np.nan)
    e = row.get("Environment_Score", np.nan)
    s = row.get("Social_Score", np.nan)
    g = row.get("Governance_Score", np.nan)
    risk = row.get("Risk_Level", "Unknown")
    act = row.get("Investor_Action", "Review")

    y = height - 60
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, f"ESG Investor Report: {company}")
    y -= 30

    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Sector: {sector}")
    y -= 25

    if include_core:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(50, y, "1. Core ESG Score")
        y -= 18
        c.setFont("Helvetica", 12)
        if not pd.isna(esg):
            c.drawString(60, y, f"Overall ESG Score: {esg:.1f} (0–100)")
        else:
            c.drawString(60, y, "Overall ESG Score: N/A")
        y -= 25

    if include_pillars:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(50, y, "2. Pillar Breakdown")
        y -= 18
        c.setFont("Helvetica", 12)
        c.drawString(60, y, f"Environment: {e:.1f}" if not pd.isna(e) else "Environment: N/A")
        y -= 16
        c.drawString(60, y, f"Social: {s:.1f}" if not pd.isna(s) else "Social: N/A")
        y -= 16
        c.drawString(60, y, f"Governance: {g:.1f}" if not pd.isna(g) else "Governance: N/A")
        y -= 25

    if include_risk:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(50, y, "3. Risk & Suggested Action")
        y -= 18
        c.setFont("Helvetica", 12)
        c.drawString(60, y, f"Risk Level: {risk}")
        y -= 16
        c.drawString(60, y, f"Suggested Investor Action: {act}")
        y -= 25

    if include_notes:
        c.setFont("Helvetica-Bold", 13)
        c.drawString(50, y, "4. Notes for the Investor")
        y -= 18
        c.setFont("Helvetica", 11)
        notes = [
            "• This report summarises ESG performance for indicative decision support.",
            "• Combine ESG insights with financial analysis and valuation.",
            "• Check official annual reports, BRSR filings and independent research.",
            "• ESG scores may evolve with new controversies or policy changes.",
        ]
        for line in notes:
            c.drawString(60, y, line)
            y -= 14

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer


# -----------------------------------------------------------
# ESG GPT
# -----------------------------------------------------------
def answer_esg_query_rule_based(question: str, df: pd.DataFrame) -> str:
    q = question.lower()

    if "top" in q or "highest" in q or "best" in q:
        sector_name = None
        for sec in df["Sector"].dropna().unique():
            if str(sec).lower() in q:
                sector_name = sec
                break
        if sector_name:
            subset = df[df["Sector"].str.lower() == str(sector_name).lower()].copy()
            if subset.empty:
                return f"I couldn't find any companies in the sector '{sector_name}' in this dataset."
            top_n = subset.sort_values("ESG_Score", ascending=False).head(5)
            lines = [f"Top ESG companies in **{sector_name}** sector:"]
            for _, r in top_n.iterrows():
                lines.append(f"- {r['Company']} — ESG {r['ESG_Score']:.1f}, Risk: {r['Risk_Level']}")
            return "\n".join(lines)
        else:
            top_n = df.sort_values("ESG_Score", ascending=False).head(5)
            lines = ["Top ESG companies overall:"]
            for _, r in top_n.iterrows():
                lines.append(
                    f"- {r['Company']} — ESG {r['ESG_Score']:.1f}, "
                    f"Sector: {r['Sector']}, Risk: {r['Risk_Level']}"
                )
            return "\n".join(lines)

    if "low risk" in q or "safe" in q:
        subset = df[df["Risk_Level"] == "Low"].sort_values("ESG_Score", ascending=False).head(10)
        if subset.empty:
            return "There are no companies labelled as low risk in this dataset."
        lines = ["Low-risk companies (based on ESG score):"]
        for _, r in subset.iterrows():
            lines.append(f"- {r['Company']} — ESG {r['ESG_Score']:.1f}, Sector: {r['Sector']}")
        return "\n".join(lines)

    if "high risk" in q:
        subset = df[df["Risk_Level"] == "High"].sort_values("ESG_Score", ascending=True).head(10)
        if subset.empty:
            return "There are no companies labelled as high risk in this dataset."
        lines = ["High-risk companies (based on ESG score):"]
        for _, r in subset.iterrows():
            lines.append(f"- {r['Company']} — ESG {r['ESG_Score']:.1f}, Sector: {r['Sector']}")
        return "\n".join(lines)

    for name in df["Company"].dropna().unique():
        if str(name).lower() in q:
            row = df[df["Company"] == name].iloc[0]
            lines = [
                f"ESG profile for **{row['Company']}**:",
                f"- Sector: {row.get('Sector','N/A')}",
                f"- ESG Score: {row.get('ESG_Score', 'N/A')}",
                f"- Environment: {row.get('Environment_Score', 'N/A')}",
                f"- Social: {row.get('Social_Score', 'N/A')}",
                f"- Governance: {row.get('Governance_Score', 'N/A')}",
                f"- Risk Level: {row.get('Risk_Level', 'N/A')}",
                f"- Suggested Action: {row.get('Investor_Action', 'N/A')}",
                "",
                "This suggestion is based only on ESG data in this project, "
                "not on full financial/valuation analysis.",
            ]
            return "\n".join(lines)

    if "what is esg" in q or ("esg" in q and "stand for" in q):
        return (
            "ESG stands for **Environmental, Social, and Governance**.\n"
            "- **E (Environmental):** emissions, energy, pollution control, waste, water, climate impact\n"
            "- **S (Social):** employees, communities, customers, safety, diversity\n"
            "- **G (Governance):** board independence, transparency, ethics, audit quality\n\n"
            "Higher ESG generally implies lower long-term non-financial risk."
        )

    if "environment" in q or "e score" in q:
        return (
            "The **Environment** pillar looks at how the company impacts the planet: "
            "carbon emissions, energy use, pollution control, waste management, water usage, etc."
        )

    if "social" in q or "s score" in q:
        return (
            "The **Social** pillar covers employees, communities, and customers: "
            "safety, labour practices, diversity & inclusion, community impact, and product responsibility."
        )

    if "governance" in q or "g score" in q:
        return (
            "The **Governance** pillar focuses on leadership & control: "
            "board independence, audit quality, shareholder rights, anti-corruption policies, etc."
        )

    return (
        "I couldn't map your question directly to the dataset.\n\n"
        "You can ask things like:\n"
        "- 'Top ESG companies overall'\n"
        "- 'Top ESG in IT sector'\n"
        "- 'Low risk companies'\n"
        "- 'Tell me about <company name>'\n"
        "- 'What does ESG mean?'\n"
    )


def answer_esg_query(question: str, df: pd.DataFrame) -> str:
    api_key = st.session_state.get("groq_api_key", "")

    if not api_key:
        return answer_esg_query_rule_based(question, df)

    top_df = df.sort_values("ESG_Score", ascending=False).head(10)
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
        f"{question}"
    )

    system_msg = ascii_safe(system_msg)
    user_msg = ascii_safe(user_msg)

    try:
        client = Groq(api_key=api_key)
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
        return answer
    except Exception as e:
        fallback = answer_esg_query_rule_based(question, df)
        try:
            err_msg = str(e)
        except Exception:
            err_msg = "Unknown error"
        return (
            "⚠ I attempted to use the live GPT API but encountered an error, "
            "so I'm falling back to the offline ESG assistant.\n\n"
            f"Error: {err_msg}\n\n"
            f"{fallback}"
        )


def esg_gpt_tab(df: pd.DataFrame):
    st.subheader("🤖 ESG GPT – Investor Assistant")

    col_clear, _ = st.columns([1, 4])
    with col_clear:
        if st.button("🧹 Clear conversation"):
            st.session_state["esg_chat"] = [
                {
                    "role": "assistant",
                    "content": (
                        "Hi! I’m your ESG assistant for this platform. "
                        "Ask me about companies, sectors, ESG risk levels, or what ESG means."
                    ),
                }
            ]

    if "esg_chat" not in st.session_state:
        st.session_state["esg_chat"] = [
            {
                "role": "assistant",
                "content": (
                    "Hi! I’m your ESG assistant for this platform. "
                    "Ask me about companies, sectors, ESG risk levels, or what ESG means."
                ),
            }
        ]

    for msg in st.session_state["esg_chat"]:
        with st.chat_message("assistant" if msg["role"] == "assistant" else "user"):
            st.write(msg["content"])

    user_input = st.chat_input("Type your ESG question here...")
    if user_input:
        st.session_state["esg_chat"].append({"role": "user", "content": user_input})
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                answer = answer_esg_query(user_input, df)
                st.write(answer)
        st.session_state["esg_chat"].append({"role": "assistant", "content": answer})


# -----------------------------------------------------------
# SESSION STATE
# -----------------------------------------------------------
if "users" not in st.session_state:
    st.session_state["users"] = {"demo": "demo123"}
if "logged_in" not in st.session_state:
    st.session_state["logged_in"] = False
if "username" not in st.session_state:
    st.session_state["username"] = "Guest"
if "groq_api_key" not in st.session_state:
    st.session_state["groq_api_key"] = ""
if "custom_esg_df" not in st.session_state:
    st.session_state["custom_esg_df"] = None
if "custom_esg_scored_df" not in st.session_state:
    st.session_state["custom_esg_scored_df"] = None


# -----------------------------------------------------------
# LANDING PAGE
# -----------------------------------------------------------
def landing_page():
    col_left, col_right = st.columns([3, 2], vertical_alignment="center")

    with col_left:
        st.markdown(
            """
            <div style="margin-top:2.0rem;">
              <div class="hero-title">
                ESG Intelligence Platform for Indian Investors
              </div>
              <div class="hero-subtitle">
                Discover how companies perform on <strong>Environmental, Social, and Governance</strong> factors,
                track controversies, and see how ESG links to market performance.
              </div>
              <span class="hero-pill">
                Made for long-term, responsible investing in India
              </span>
              <ul class="hero-list">
                <li>📊 Company-wise ESG scores &amp; sector comparison</li>
                <li>📰 India-focused ESG news &amp; controversies</li>
                <li>🔬 Custom ESG Lab with hybrid scoring (MSCI + risk)</li>
                <li>📄 One-click ESG investor report (PDF)</li>
                <li>🤖 ESG GPT assistant for investor questions</li>
              </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_right:
        
        # Container for the auth box (styled via CSS targeting stVerticalBlockBorderWrapper)
        with st.container(border=True):
            st.markdown("### Welcome, Investor 👤")
            st.caption("Access your ESG intelligence dashboard")
            
            tab_login, tab_reg = st.tabs(["Login", "Register"])
            
            with tab_login:
                st.write("")
                u = st.text_input("Username", key="login_username")
                p = st.text_input("Password", type="password", key="login_password")
                st.write("")
                if st.button("Login", use_container_width=True):
                    if u in st.session_state["users"] and st.session_state["users"][u] == p:
                        st.session_state["logged_in"] = True
                        st.session_state["username"] = u
                        st.success("Logged in successfully!")
                        st.rerun()
                    else:
                        st.error("Invalid credentials")
                        
            with tab_reg:
                st.write("")
                nu = st.text_input("New Username", key="reg_username")
                npw = st.text_input("New Password", type="password", key="reg_password")
                st.write("")
                if st.button("Register", use_container_width=True):
                    if nu.strip() == "":
                        st.error("Username cannot be empty")
                    elif nu in st.session_state["users"]:
                        st.error("Username already exists")
                    else:
                        st.session_state["users"][nu] = npw
                        st.success("Registration successful! You can now login.")


# -----------------------------------------------------------
# DASHBOARD TABS
# -----------------------------------------------------------
def overview_tab(row: pd.Series, df: pd.DataFrame):
    st.subheader(f"🏢 {row['Company']}")
    st.caption(f"Sector: **{row.get('Sector', 'N/A')}**")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("ESG Score", f"{row['ESG_Score']:.1f}" if not pd.isna(row["ESG_Score"]) else "N/A")
    c2.metric(
        "Environment",
        f"{row['Environment_Score']:.1f}" if not pd.isna(row["Environment_Score"]) else "N/A",
    )
    c3.metric("Social", f"{row['Social_Score']:.1f}" if not pd.isna(row["Social_Score"]) else "N/A")
    c4.metric(
        "Governance",
        f"{row['Governance_Score']:.1f}" if not pd.isna(row["Governance_Score"]) else "N/A",
    )

    st.markdown("#### E–S–G Breakdown")

    e_val = float(row.get("Environment_Score") or 0)
    s_val = float(row.get("Social_Score") or 0)
    g_val = float(row.get("Governance_Score") or 0)

    esg_df = pd.DataFrame(
        {"Pillar": ["Environment", "Social", "Governance"], "Score": [e_val, s_val, g_val]}
    )
    fig = px.bar(
        esg_df,
        x="Pillar",
        y="Score",
        color="Pillar",
        range_y=[0, 100],
        text="Score",
        color_discrete_map={
            "Environment": "#22C55E",
            "Social": "#0EA5E9",
            "Governance": "#A855F7",
        },
    )
    fig.update_traces(texttemplate="%{text:.1f}", textposition="outside")
    fig.update_layout(height=400, yaxis_title="Score (0–100)", xaxis_title="")
    st.plotly_chart(fig, use_container_width=True)

    st.markdown(
        f"- 🌱 **Environment**: {e_val:.1f} – climate, emissions, pollution controls.\n"
        f"- 🤝 **Social**: {s_val:.1f} – employees, communities & customers.\n"
        f"- 🏛 **Governance**: {g_val:.1f} – board quality, transparency & ethics."
    )

    st.markdown("---")
    st.markdown("### 📄 Build ESG PDF Report")

    if canvas is None:
        st.warning("Install `reportlab` (`pip install reportlab`) to enable PDF export.")
        return

    col_a, col_b, col_c, col_d = st.columns(4)
    with col_a:
        include_core = st.checkbox("Include core ESG score", True)
    with col_b:
        include_pillars = st.checkbox("Include E/S/G pillars", True)
    with col_c:
        include_risk = st.checkbox("Include risk & action", True)
    with col_d:
        include_notes = st.checkbox("Include investor notes", True)

    if st.button("Generate ESG PDF Report"):
        pdf_bytes = generate_esg_pdf(
            row,
            include_core=include_core,
            include_pillars=include_pillars,
            include_risk=include_risk,
            include_notes=include_notes,
        )
        if pdf_bytes is not None:
            st.download_button(
                "⬇ Download ESG Report PDF",
                data=pdf_bytes,
                file_name=f"{row['Company']}_ESG_Report.pdf",
                mime="application/pdf",
            )


def sector_insights_tab(row: pd.Series, df: pd.DataFrame):
    st.subheader("📊 Sector Insights")
    sector = row.get("Sector", "Unknown")
    st.write(f"Sector: **{sector}**")

    sector_df = df[df["Sector"] == sector].copy()
    if sector_df.empty:
        st.info("No other companies in this sector in the dataset.")
        return

    fig = px.bar(
        sector_df.sort_values("ESG_Score", ascending=False),
        x="Company",
        y="ESG_Score",
        color="ESG_Score",
        color_continuous_scale="Greens",
    )
    fig.update_layout(xaxis_tickangle=-45, height=450)
    st.markdown("#### ESG ranking within the sector")
    st.plotly_chart(fig, use_container_width=True)

    sector_df["Rank"] = sector_df["ESG_Score"].rank(ascending=False, method="min")
    rank = int(sector_df[sector_df["Company"] == row["Company"]]["Rank"].iloc[0])
    count = len(sector_df)
    st.write(f"📌 **{row['Company']}** is ranked **#{rank} of {count}** in this sector by ESG score.")


INDIA_CLIMATE_RISK = {
    "Maharashtra": {"Heat": 80, "Flood": 65, "Drought": 70, "Cyclone": 40},
    "Gujarat": {"Heat": 85, "Flood": 50, "Drought": 75, "Cyclone": 50},
    "Tamil Nadu": {"Heat": 78, "Flood": 72, "Drought": 55, "Cyclone": 80},
    "Karnataka": {"Heat": 75, "Flood": 60, "Drought": 65, "Cyclone": 35},
    "Delhi": {"Heat": 90, "Flood": 40, "Drought": 60, "Cyclone": 10},
    "West Bengal": {"Heat": 70, "Flood": 80, "Drought": 40, "Cyclone": 75},
    "Telangana": {"Heat": 82, "Flood": 55, "Drought": 68, "Cyclone": 30},
    "Rajasthan": {"Heat": 88, "Flood": 30, "Drought": 85, "Cyclone": 15},
}


def investor_view_tab(row: pd.Series, df: pd.DataFrame):
    st.subheader("💼 Investor View – Risk & Climate")

    c1, c2, c3 = st.columns(3)
    c1.metric("ESG Score", f"{row['ESG_Score']:.1f}" if not pd.isna(row["ESG_Score"]) else "N/A")
    c2.metric("Risk Level", row.get("Risk_Level", "Unknown"))
    c3.metric("Suggested Action", row.get("Investor_Action", "Review"))

    st.markdown("### 🧪 Greenwashing Risk Check (Simple View)")
    esg = row.get("ESG_Score", np.nan)
    numeric_cols = ["ESG_Score", "Environment_Score", "Social_Score", "Governance_Score"]
    missing_ratio = row[numeric_cols].isna().mean()
    confidence = (1 - missing_ratio) * 100

    if pd.isna(esg):
        level = "Unknown"
        css_class = "greenwash-medium"
        message = "Insufficient ESG data is reported – please read company reports carefully."
    else:
        if esg >= 70 and confidence < 60:
            level = "High"
            css_class = "greenwash-high"
            message = (
                "Score looks **high**, but data coverage is **weak**. There may be a risk that the "
                "company looks greener on paper than in reality. Check independent reports & news."
            )
        elif esg >= 60 and confidence < 75:
            level = "Medium"
            css_class = "greenwash-medium"
            message = (
                "ESG score is decent but data is only partially available. Treat the score as an "
                "approximate signal and combine with your own research."
            )
        else:
            level = "Low"
            css_class = "greenwash-low"
            message = (
                "ESG score and data coverage look consistent. Greenwashing risk appears lower, "
                "but you should still verify with annual reports and news."
            )

    st.markdown(
        f"""
        <div class="greenwash-card {css_class}">
          <strong>Greenwashing risk level: {level}</strong><br/>
          <span style="font-size:0.9rem;">{message}</span>
          <ul style="font-size:0.85rem; margin-top:0.4rem;">
            <li>Compare ESG scores with controversies in the News tab.</li>
            <li>Look at long-term trend, not just one year.</li>
            <li>Use this platform as a starting point, not the final answer.</li>
          </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("### 🌡 India Climate Physical Risk (Demo)")

    state = st.selectbox(
        "Select company’s primary state (for climate risk view)",
        options=list(INDIA_CLIMATE_RISK.keys()),
        index=0,
    )
    risk_dict = INDIA_CLIMATE_RISK[state]
    risk_df = pd.DataFrame(
        {
            "Hazard": list(risk_dict.keys()),
            "Risk Score": list(risk_dict.values()),
        }
    )
    fig = px.bar(
        risk_df,
        x="Hazard",
        y="Risk Score",
        color="Hazard",
        range_y=[0, 100],
        color_discrete_map={
            "Heat": "#EF5350",
            "Flood": "#0EA5E9",
            "Drought": "#FACC15",
            "Cyclone": "#8B5CF6",
        },
    )
    fig.update_layout(height=380, yaxis_title="Relative risk (0–100)", xaxis_title="")

    col_chart, col_desc = st.columns([2, 1])
    with col_chart:
        st.plotly_chart(fig, use_container_width=True)
    with col_desc:
        avg_risk = np.mean(list(risk_dict.values()))
        if avg_risk >= 75:
            label = "High"
            colour = "#FFCDD2"
            text = (
                "This location is exposed to **high physical climate risk** "
                "(frequent/extreme heat or floods). Projects may need strong adaptation plans."
            )
        elif avg_risk >= 55:
            label = "Moderate"
            colour = "#FFF9C4"
            text = (
                "This location has **moderate climate risk**. ESG-aware investors should monitor "
                "policy changes, insurance costs and supply-chain disruptions."
            )
        else:
            label = "Lower"
            colour = "#C8E6C9"
            text = (
                "This location has **relatively lower climate risk** in this simplified model. "
                "Climate issues still matter, but physical disruption risk is lower."
            )

        st.markdown(
            f"""
            <div style="background:{colour}; padding:0.9rem 1rem; border-radius:1rem;">
              <span class="climate-badge">
                Overall climate risk: <strong>{label}</strong>
              </span>
              <p style="margin-top:0.6rem; font-size:0.9rem;">{text}</p>
              <p style="font-size:0.8rem; color:#374151;">
                (Scores are a simplified demo, not official government data.)
              </p>
            </div>
            """,
            unsafe_allow_html=True,
        )


# -----------------------------------------------------------
# CUSTOM ESG LAB
# -----------------------------------------------------------
def hybrid_esg_engine(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()

    required_cols = [
        "Company",
        "Sector",
        "Carbon_Intensity",
        "Renewable_Energy_Percent",
        "Water_Use_Intensity",
        "Waste_Recycled_Percent",
        "Employee_Turnover",
        "Employee_Injury_Rate",
        "Diversity_Index",
        "Training_Hours",
        "Board_Independence",
        "Female_Directors",
        "Promoter_Ownership",
        "Audit_Qualification_Flag",
        "Env_Exposure",
        "Soc_Exposure",
        "Gov_Exposure",
        "Mgmt_Env",
        "Mgmt_Soc",
        "Mgmt_Gov",
    ]

    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(
            "Dataset is missing required columns: " + ", ".join(missing)
        )

    numeric_cols = [c for c in required_cols if c not in ["Company", "Sector"]]
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce")

    env_good = ["Renewable_Energy_Percent", "Waste_Recycled_Percent"]
    env_bad = ["Carbon_Intensity", "Water_Use_Intensity"]
    soc_good = ["Diversity_Index", "Training_Hours"]
    soc_bad = ["Employee_Turnover", "Employee_Injury_Rate"]
    gov_good = ["Board_Independence", "Female_Directors"]
    gov_bad = ["Promoter_Ownership", "Audit_Qualification_Flag"]
    all_metrics = env_good + env_bad + soc_good + soc_bad + gov_good + gov_bad

    grouped = df.groupby("Sector")
    for col in all_metrics:
        sec_min = grouped[col].transform("min")
        sec_max = grouped[col].transform("max")
        norm = (df[col] - sec_min) / (sec_max - sec_min + 1e-9) * 10.0
        if col in env_bad + soc_bad + gov_bad:
            norm = 10.0 - norm
        df[col + "_norm"] = norm

    def pillar_score(cols_norm):
        if not cols_norm:
            return pd.Series(np.nan, index=df.index)
        return df[[c + "_norm" for c in cols_norm]].mean(axis=1)

    df["E_Score_10"] = pillar_score(env_good + env_bad)
    df["S_Score_10"] = pillar_score(soc_good + soc_bad)
    df["G_Score_10"] = pillar_score(gov_good + gov_bad)

    df["ESG_Base_10"] = (
        0.35 * df["E_Score_10"] + 0.35 * df["S_Score_10"] + 0.30 * df["G_Score_10"]
    )

    coverage = 1 - df[all_metrics].isna().sum(axis=1) / len(all_metrics)
    df["Coverage_Pct"] = coverage * 100
    factor = np.where(coverage < 0.5, 0.8, np.where(coverage < 0.7, 0.9, 1.0))
    df["Coverage_Factor"] = factor
    df["ESG_Score"] = df["ESG_Base_10"] * 10 * df["Coverage_Factor"]

    def msci_rating(score):
        if pd.isna(score):
            return "NA"
        if score >= 80:
            return "AAA"
        if score >= 72:
            return "AA"
        if score >= 64:
            return "A"
        if score >= 56:
            return "BBB"
        if score >= 48:
            return "BB"
        if score >= 40:
            return "B"
        return "CCC"

    df["ESG_Rating"] = df["ESG_Score"].apply(msci_rating)

    df["Env_Exposure_n"] = df["Env_Exposure"].clip(0, 100) / 100
    df["Soc_Exposure_n"] = df["Soc_Exposure"].clip(0, 100) / 100
    df["Gov_Exposure_n"] = df["Gov_Exposure"].clip(0, 100) / 100

    df["Mgmt_Env_n"] = df["Mgmt_Env"].clip(0, 100) / 100
    df["Mgmt_Soc_n"] = df["Mgmt_Soc"].clip(0, 100) / 100
    df["Mgmt_Gov_n"] = df["Mgmt_Gov"].clip(0, 100) / 100

    df["Env_Unmanaged"] = df["Env_Exposure_n"] * (1 - df["Mgmt_Env_n"])
    df["Soc_Unmanaged"] = df["Soc_Exposure_n"] * (1 - df["Mgmt_Soc_n"])
    df["Gov_Unmanaged"] = df["Gov_Exposure_n"] * (1 - df["Mgmt_Gov_n"])

    df["ESG_Risk_Score"] = (
        0.4 * df["Env_Unmanaged"]
        + 0.3 * df["Soc_Unmanaged"]
        + 0.3 * df["Gov_Unmanaged"]
    ) * 100

    def risk_category(r):
        if pd.isna(r):
            return "NA"
        if r < 10:
            return "Negligible"
        if r < 20:
            return "Low"
        if r < 30:
            return "Medium"
        if r < 40:
            return "High"
        return "Severe"

    df["ESG_Risk_Category"] = df["ESG_Risk_Score"].apply(risk_category)
    df["ESG_Percentile_in_Sector"] = (
        df.groupby("Sector")["ESG_Score"].rank(pct=True) * 100
    )
    return df


def custom_esg_lab_tab():
    st.subheader("🔬 Custom ESG Lab – Hybrid ESG Engine")

    st.markdown(
        "This lab uses a richer ESG dataset and computes:\n"
        "- MSCI-style **ESG Score (0–100) + AAA–CCC rating**\n"
        "- Sustainalytics-style **Risk score (0–100) + Negligible→Severe**\n"
        "- Sector-percentile & data coverage\n"
        "- Real **Google News** sentiment integrated into final score"
    )

    col_btn1, _ = st.columns([1, 3])
    sample_path = "data/custom_esg_lab_dataset.csv"

    with col_btn1:
        use_sample = st.button("📥 Load Sample ESG Dataset (100 companies)")

    uploaded_file = st.file_uploader(
        "Or upload your own ESG dataset (CSV/Excel)", type=["csv", "xlsx", "xls"]
    )

    df = None
    if use_sample:
        if not os.path.exists(sample_path):
            st.error("Sample dataset not found. Place `custom_esg_lab_dataset.csv` in the /data folder.")
            return
        df = pd.read_csv(sample_path)
        st.success("Loaded sample ESG lab dataset successfully.")
    elif uploaded_file is not None:
        try:
            if uploaded_file.name.lower().endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
            st.success("Uploaded dataset loaded successfully.")
        except Exception as e:
            st.error(f"Could not read file: {e}")
            return

    if df is None:
        st.info(
            "Load the sample dataset or upload your own CSV/Excel with the required columns. "
            "For demo & viva, you can use the sample dataset button above."
        )
        return

    st.markdown("#### Preview of raw dataset")
    st.dataframe(df.head())

    st.markdown("#### Run Hybrid ESG Engine (MSCI-style + Risk-style)")
    if st.button("⚙ Run ESG Engine"):
        try:
            scored = hybrid_esg_engine(df)
        except Exception as e:
            st.error(str(e))
            return
        st.session_state["custom_esg_df"] = df
        st.session_state["custom_esg_scored_df"] = scored
        st.success("ESG Engine completed successfully.")

    scored_df = st.session_state.get("custom_esg_scored_df", None)
    if scored_df is None:
        return

    st.markdown("### 📊 ESG Results (Hybrid Model Output)")

    sector_filter = st.selectbox(
        "Filter by sector (optional)",
        options=["All"] + sorted(scored_df["Sector"].astype(str).unique().tolist()),
    )
    view_df = scored_df.copy()
    if sector_filter != "All":
        view_df = view_df[view_df["Sector"] == sector_filter]

    st.dataframe(
        view_df[
            [
                "Company",
                "Sector",
                "ESG_Score",
                "ESG_Rating",
                "ESG_Risk_Score",
                "ESG_Risk_Category",
                "Coverage_Pct",
                "ESG_Percentile_in_Sector",
            ]
        ].sort_values("ESG_Score", ascending=False)
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### ESG Score by Company")
        top_plot = view_df.sort_values("ESG_Score", ascending=False).head(20)
        fig = px.bar(
            top_plot,
            x="Company",
            y="ESG_Score",
            color="ESG_Rating",
            color_discrete_sequence=px.colors.qualitative.Set2,
        )
        fig.update_layout(xaxis_tickangle=-45, height=420, yaxis_title="ESG Score (0–100)")
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("#### ESG Risk Distribution")
        counts = view_df["ESG_Risk_Category"].value_counts()
        fig_risk = px.pie(
            names=counts.index,
            values=counts.values,
            title="ESG Risk Categories",
            color=counts.index,
            color_discrete_map={
                "Negligible": "#15803D",
                "Low": "#4ADE80",
                "Medium": "#FACC15",
                "High": "#FB923C",
                "Severe": "#DC2626",
            },
        )
        fig_risk.update_layout(height=420)
        st.plotly_chart(fig_risk, use_container_width=True)

    st.caption(
        "These scores are a **simplified academic model inspired by MSCI & Sustainalytics**, "
        "not official ESG ratings."
    )

    # ESG + LIVE NEWS ANALYSIS
    st.markdown("---")
    st.markdown("### 🧩 Combine ESG Score with Recent News & Sentiment (Google News RSS)")

    companies = scored_df["Company"].astype(str).unique().tolist()
    company_name = st.selectbox("Choose a company for detailed view", companies)

    row = scored_df[scored_df["Company"].astype(str) == company_name].iloc[0]

    base_esg = float(row.get("ESG_Score", np.nan))
    rating = row.get("ESG_Rating", "NA")
    risk_score = float(row.get("ESG_Risk_Score", np.nan))
    risk_cat = row.get("ESG_Risk_Category", "NA")
    coverage = float(row.get("Coverage_Pct", np.nan))
    perc = float(row.get("ESG_Percentile_in_Sector", np.nan))

    col_a, col_b, col_c = st.columns(3)
    col_a.metric("ESG Score (0–100)", f"{base_esg:.1f}")
    col_b.metric("ESG Rating (MSCI-style)", rating)
    col_c.metric("ESG Risk (0–100)", f"{risk_score:.1f}")

    col_d, col_e = st.columns(2)
    col_d.metric("Risk Category", risk_cat)
    col_e.metric("Data Coverage (%)", f"{coverage:.1f}")
    st.write(f"📌 Sector percentile (higher is better): **{perc:.1f}%**")

    query = st.text_input(
        "Google News search query",
        value=f"{company_name} India sustainability OR ESG OR pollution OR SEBI OR NGT",
    )
    n_articles = st.slider("Number of news articles to analyse", 3, 10, 5)
    weight_esg = st.slider(
        "Weight for ESG data vs news sentiment (ESG weight)",
        min_value=0.5,
        max_value=1.0,
        value=0.9,
        step=0.05,
    )

    if st.button("Run ESG + News Analysis"):
        try:
            articles = fetch_google_news(query, n_articles)
            if not articles:
                st.info("No recent Google News articles found for this query.")
                return
        except Exception as e:
            st.error(f"Failed to fetch news from Google News RSS: {e}")
            return

        pos = neg = controversies = 0
        for art in articles:
            title = art.get("title", "")
            desc = art.get("description", "")
            combined = f"{title}. {desc}"
            label, score, is_contro = analyse_text_sentiment(combined)
            if score > 0:
                pos += 1
            elif score < 0:
                neg += 1
            if is_contro:
                controversies += 1

        base_sentiment = 50 + 5 * (pos - neg) - 10 * controversies
        news_score = float(np.clip(base_sentiment, 0, 100))

        st.markdown("#### Analysed news sentiment")
        col1, col2, col3 = st.columns(3)
        col1.metric("Positive articles", pos)
        col2.metric("Negative articles", neg)
        col3.metric("Controversy flags", controversies)
        st.metric("News Sentiment Score (0–100)", f"{news_score:.1f}")

        if pd.isna(base_esg):
            final_esg = news_score
        else:
            alpha = weight_esg
            final_esg = alpha * base_esg + (1 - alpha) * news_score

        def msci_rating(score):
            if pd.isna(score):
                return "NA"
            if score >= 80:
                return "AAA"
            if score >= 72:
                return "AA"
            if score >= 64:
                return "A"
            if score >= 56:
                return "BBB"
            if score >= 48:
                return "BB"
            if score >= 40:
                return "B"
            return "CCC"

        final_rating = msci_rating(final_esg)

        st.markdown("#### Final Combined ESG Score (ESG Data + Google News)")
        fig_g = go.Figure(
            go.Indicator(
                mode="gauge+number",
                value=final_esg,
                title={"text": "ESG Score with News"},
                gauge={
                    "axis": {"range": [0, 100]},
                    "bar": {"color": "#22C55E"},
                    "steps": [
                        {"range": [0, 50], "color": "#FCA5A5"},
                        {"range": [50, 70], "color": "#FDE68A"},
                        {"range": [70, 100], "color": "#BBF7D0"},
                    ],
                },
            )
        )
        fig_g.update_layout(height=350)
        st.plotly_chart(fig_g, use_container_width=True)
        st.metric("Final Rating (with news impact)", final_rating)

        st.markdown("#### Articles used for this analysis")
        for art in articles:
            title = art.get("title", "")
            desc = art.get("description", "")
            url = art.get("url", "#")
            src = art.get("source", {}).get("name", "Google News")
            date = art.get("publishedAt", "")[:16]  # e.g., "Wed, 10 Dec ..."
            label, _, contro = analyse_text_sentiment(f"{title}. {desc}")
            css = (
                "sentiment-positive"
                if label == "Positive"
                else "sentiment-negative"
                if label == "Negative"
                else "sentiment-neutral"
            )
            st.markdown(
                f"- [{title}]({url}) — <span class='{css}'>{label}</span> • {src} • {date}",
                unsafe_allow_html=True,
            )
            if desc:
                st.caption(desc)
            if contro:
                st.caption("⚠ Possible controversy / regulatory risk detected.")

        st.caption(
            "This is a **demo analytical engine** – it is not an official ESG rating. "
            "Use it only for learning and experimentation."
        )


# -----------------------------------------------------------
# COMPLIANCE TAB – only CSR
# -----------------------------------------------------------
def compliance_tab(row: pd.Series):
    st.subheader("✅ CSR Compliance – 2% Rule (Simplified)")

    st.markdown(
        "This section lets an investor roughly check **CSR spending vs the 2% rule** "
        "using simple inputs (not an official calculation)."
    )

    with st.form("csr_only"):
        avg_profit = st.number_input(
            "Avg net profit of last 3 years (₹ crore)", min_value=0.0, value=100.0
        )
        csr_spent = st.number_input(
            "CSR spend this year (₹ crore)", min_value=0.0, value=2.0
        )
        submitted = st.form_submit_button("Calculate CSR View")

    if submitted:
        required_csr = 0.02 * avg_profit
        csr_ratio = 0 if required_csr == 0 else csr_spent / required_csr * 100

        c1, c2 = st.columns(2)
        c1.metric("CSR vs 2% requirement", f"{csr_ratio:.0f}%")
        c2.metric("Required CSR (₹ crore)", f"{required_csr:.2f}")

        if csr_ratio >= 100:
            csr_msg = "CSR spending meets or exceeds the 2% rule."
        elif csr_ratio >= 70:
            csr_msg = "CSR spending is close to requirement but slightly below 2%."
        else:
            csr_msg = "CSR spending appears significantly below 2% (demo calculation)."

        st.write(f"📌 {csr_msg}")

        fig = go.Figure()
        fig.add_trace(
            go.Bar(
                x=["CSR 2% compliance"],
                y=[csr_ratio],
                marker_color=["#F59E0B"],
            )
        )
        fig.update_layout(height=350, yaxis=dict(range=[0, 150]))
        st.plotly_chart(fig, use_container_width=True)

        st.caption(
            "This is a simplified investor lens, not a legal opinion. "
            "For serious decisions, refer to audited annual reports and BRSR filings."
        )


# -----------------------------------------------------------
# NEWS TAB – Google News
# -----------------------------------------------------------
def news_tab(row: pd.Series):
    st.subheader("📰 ESG News & Controversies – Google News RSS")

    company = row["Company"]
    st.write(f"Company: **{company}**")

    default_query = f"{company} India sustainability OR pollution OR ESG OR SEBI OR NGT"
    query = st.text_input("Search query", value=default_query)
    max_articles = st.slider("Number of articles", 3, 10, 5)

    if st.button("Fetch Latest News"):
        try:
            articles = fetch_google_news(query, max_articles)
        except Exception as e:
            st.error(f"Error fetching Google News RSS: {e}")
            return

        if not articles:
            st.info("No recent articles found.")
            return

        total_score = 0
        controversy_count = 0

        for art in articles:
            title = art.get("title", "")
            desc = art.get("description", "")
            combined = f"{title}. {desc}"
            label, score, controversy = analyse_text_sentiment(combined)
            total_score += score
            if controversy:
                controversy_count += 1

            css = (
                "sentiment-positive"
                if label == "Positive"
                else "sentiment-negative"
                if label == "Negative"
                else "sentiment-neutral"
            )

            st.markdown(
                f"### [{title}]({art.get('url','#')})  "
                f"<span class='{css}'>{label}</span>",
                unsafe_allow_html=True,
            )
            src = art.get("source", {}).get("name", "Google News")
            date = art.get("publishedAt", "")[:16]
            st.caption(f"{src} • {date}")
            if desc:
                st.write(desc)
            if controversy:
                st.markdown("❗ **Possible ESG controversy detected** (regulatory / pollution keywords).")
            st.markdown("---")

        overall = "Neutral / Mixed"
        if total_score > 0:
            overall = "Mostly Positive"
        elif total_score < 0:
            overall = "Mostly Negative"

        if controversy_count >= 3:
            risk = "High"
        elif controversy_count >= 1:
            risk = "Medium"
        else:
            risk = "Low"

        st.subheader("ESG News Summary (Last 7 Days)")
        st.write(f"🧾 Overall sentiment: **{overall}**")
        st.write(
            f"⚠️ Controversy risk (news-based): **{risk}** "
            f"({controversy_count} article(s) with controversy signals)"
        )


# -----------------------------------------------------------
# DASHBOARD PAGE
# -----------------------------------------------------------
def dashboard_page(df: pd.DataFrame):
    st.sidebar.title("ESG Investor Dashboard")
    st.sidebar.markdown(f"👤 **{st.session_state['username']}**")

    api_key_input = st.sidebar.text_input("Groq API Key (for ESG GPT, optional)", type="password")
    if api_key_input:
        st.session_state["groq_api_key"] = api_key_input

    if st.session_state.get("groq_api_key"):
        st.sidebar.success("Groq ESG GPT: ENABLED")
    else:
        st.sidebar.info("ESG GPT: using offline dataset rules (no key).")

    if st.sidebar.button("Logout"):
        st.session_state["logged_in"] = False
        st.rerun()

    # REMOVED main-panel div
    # st.markdown('<div class="main-panel">', unsafe_allow_html=True)
    if True: # preserving indent
        company = st.sidebar.selectbox("Select a company", df["Company"].tolist())
        row = df[df["Company"] == company].iloc[0]

    st.markdown(
        '<p style="font-size:2.0rem; font-weight:800; color:#065F46; margin-bottom:.1rem;">'
        "ESG Analytics Dashboard</p>",
        unsafe_allow_html=True,
    )
    st.caption("Investor-focused ESG intelligence for Indian markets.")

    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(
        [
            "🏢 Overview",
            "📊 Sector Insights",
            "💼 Investor View",
            "🔬 Custom ESG Lab",
            "✅ Compliance",
            "📰 News",
            "🤖 ESG GPT",
        ]
    )

    with tab1:
        overview_tab(row, df)
    with tab2:
        sector_insights_tab(row, df)
    with tab3:
        investor_view_tab(row, df)
    with tab4:
        custom_esg_lab_tab()
    with tab5:
        compliance_tab(row)
    with tab6:
        news_tab(row)
    with tab7:
        esg_gpt_tab(df)

    # REMOVED closing div for main-panel
    # st.markdown("</div>", unsafe_allow_html=True)


# -----------------------------------------------------------
# MAIN
# -----------------------------------------------------------
def main():
    df = load_and_clean_data()
    if df.empty:
        return

    if not st.session_state["logged_in"]:
        inject_css(is_landing=True)
        landing_page()
    else:
        inject_css(is_landing=False)
        dashboard_page(df)


if __name__ == "__main__":
    main()