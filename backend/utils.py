"""
Utility functions migrated from the original Streamlit app
"""
import os
from io import BytesIO
from urllib.parse import quote_plus

import numpy as np
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Optional libraries
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except Exception:
    canvas = None


# -----------------------------------------------------------
# ESG HELPERS
# -----------------------------------------------------------
def esg_risk_bucket(x: float) -> str:
    """Classify ESG score into risk buckets"""
    if pd.isna(x):
        return "Unknown"
    if x >= 70:
        return "Low"
    if x >= 50:
        return "Medium"
    return "High"


def ascii_safe(text: str) -> str:
    """Convert text to ASCII-safe format"""
    if not isinstance(text, str):
        return text
    return text.encode("ascii", "ignore").decode("ascii")


# -----------------------------------------------------------
# SENTIMENT ANALYSIS
# -----------------------------------------------------------
NEGATIVE_WORDS = [
    "fraud", "scam", "pollution", "leak", "accident", "fine", "penalty",
    "probe", "investigation", "corruption", "violation", "ban", "strike",
    "protest", "layoff", "explosion", "fire", "complaint", "case",
    "lawsuit", "illegal", "toxic", "hazardous", "dumping",
]

POSITIVE_WORDS = [
    "award", "recognised", "recognition", "clean energy", "solar", "wind",
    "renewable", "sustainability", "sustainable", "green", "partnership",
    "expansion", "profit", "growth", "record", "milestone", "csr",
    "donation", "scholarship", "education", "healthcare",
]

CONTROVERSY_WORDS = [
    "ngt", "sebi", "cpcb", "pollution control board", "tribunal",
    "penalty", "fine", "closure", "shutdown", "violation", "illegal", "ban",
]


def analyse_text_sentiment(text: str):
    """Analyze sentiment of text based on keyword matching"""
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


# -----------------------------------------------------------
# NEWS FETCHING
# -----------------------------------------------------------
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
        print(f"Could not fetch news from Google News RSS: {e}")
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

        articles.append({
            "title": title,
            "description": desc_text,
            "url": link,
            "source": {"name": source_name},
            "publishedAt": pub_date,
        })
    
    return articles


# -----------------------------------------------------------
# DATA LOADING
# -----------------------------------------------------------
def load_and_clean_data(path="data/structured_output.csv") -> pd.DataFrame:
    """Load and clean the ESG dataset"""
    if not os.path.exists(path):
        print(f"Dataset not found at {path}")
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
# PDF GENERATION
# -----------------------------------------------------------
def generate_esg_pdf(
    row: pd.Series,
    include_core=True,
    include_pillars=True,
    include_risk=True,
    include_notes=True,
) -> BytesIO | None:
    """Generate PDF report for a company"""
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
# CUSTOM ESG ENGINE
# -----------------------------------------------------------
def hybrid_esg_engine(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Hybrid ESG scoring engine combining MSCI-style and Sustainalytics-style approaches
    """
    df = raw_df.copy()

    required_cols = [
        "Company", "Sector",
        "Carbon_Intensity", "Renewable_Energy_Percent", "Water_Use_Intensity", "Waste_Recycled_Percent",
        "Employee_Turnover", "Employee_Injury_Rate", "Diversity_Index", "Training_Hours",
        "Board_Independence", "Female_Directors", "Promoter_Ownership", "Audit_Qualification_Flag",
        "Env_Exposure", "Soc_Exposure", "Gov_Exposure",
        "Mgmt_Env", "Mgmt_Soc", "Mgmt_Gov",
    ]

    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError("Dataset is missing required columns: " + ", ".join(missing))

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


# -----------------------------------------------------------
# ESG GPT QUERY
# -----------------------------------------------------------
def answer_esg_query_rule_based(question: str, df: pd.DataFrame) -> str:
    """Rule-based ESG query answering (fallback when no API key)"""
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
