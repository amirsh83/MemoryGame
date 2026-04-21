"""
Parses PDF and CSV bank/credit card statements into structured expense rows.
Supports common statement formats heuristically.
"""
import re
import io
from datetime import datetime
from typing import Optional
import pandas as pd

try:
    import pdfplumber
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

DATE_PATTERNS = [
    r"\d{1,2}/\d{1,2}/\d{2,4}",
    r"\d{4}-\d{2}-\d{2}",
    r"\d{1,2}-[A-Za-z]{3}-\d{2,4}",
    r"[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}",
]
AMOUNT_PATTERN = re.compile(r"-?\$?\s*[\d,]+\.\d{2}")

CATEGORY_KEYWORDS = {
    "food": ["restaurant", "cafe", "coffee", "pizza", "burger", "sushi", "doordash", "ubereats", "grubhub", "mcdonald", "starbucks", "chipotle"],
    "transport": ["uber", "lyft", "taxi", "gas", "fuel", "parking", "transit", "metro", "airline", "flight", "delta", "united", "southwest"],
    "shopping": ["amazon", "walmart", "target", "costco", "ebay", "shop", "store", "mall"],
    "utilities": ["electric", "water", "gas", "internet", "phone", "att", "verizon", "comcast", "xfinity", "pg&e"],
    "entertainment": ["netflix", "spotify", "hulu", "disney", "youtube", "cinema", "theater", "concert", "game"],
    "health": ["pharmacy", "cvs", "walgreens", "doctor", "hospital", "medical", "dental", "gym", "fitness"],
    "travel": ["hotel", "airbnb", "marriott", "hilton", "booking", "expedia"],
    "education": ["tuition", "course", "udemy", "coursera", "school", "university"],
    "subscriptions": ["subscription", "monthly", "annual", "membership"],
}


def guess_category(description: str) -> str:
    desc_lower = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "other"


def _parse_amount(text: str) -> Optional[float]:
    cleaned = text.replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_pdf(file_bytes: bytes) -> list[dict]:
    if not HAS_PDF:
        return []

    rows = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table:
                    continue
                for row in table:
                    if not row or len(row) < 2:
                        continue
                    row_text = " ".join(str(c) for c in row if c)
                    amounts = AMOUNT_PATTERN.findall(row_text)
                    if not amounts:
                        continue

                    date_val = None
                    for pattern in DATE_PATTERNS:
                        m = re.search(pattern, row_text)
                        if m:
                            try:
                                raw = m.group()
                                for fmt in ["%m/%d/%Y", "%m/%d/%y", "%Y-%m-%d", "%d-%b-%Y", "%d-%b-%y", "%b %d, %Y", "%b %d %Y"]:
                                    try:
                                        date_val = datetime.strptime(raw, fmt)
                                        break
                                    except ValueError:
                                        continue
                            except Exception:
                                pass
                            if date_val:
                                break

                    amount = _parse_amount(amounts[-1])
                    if amount is None:
                        continue

                    description = re.sub(r"\s+", " ", re.sub(AMOUNT_PATTERN, "", row_text)).strip()
                    description = re.sub(r"\d{1,2}/\d{1,2}/\d{2,4}", "", description).strip()

                    rows.append({
                        "date": date_val or datetime.utcnow(),
                        "description": description[:512] if description else "Unknown",
                        "amount": abs(amount),
                        "category": guess_category(description),
                        "merchant": "",
                    })

    return rows


def parse_csv(file_bytes: bytes) -> list[dict]:
    rows = []
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception:
        return []

    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    date_col = next((c for c in df.columns if "date" in c), None)
    desc_col = next((c for c in df.columns if any(k in c for k in ["description", "desc", "memo", "merchant", "name"])), None)
    amount_col = next((c for c in df.columns if "amount" in c or "debit" in c or "credit" in c), None)

    if not (date_col and desc_col and amount_col):
        return []

    for _, row in df.iterrows():
        date_val = None
        try:
            date_val = pd.to_datetime(row[date_col]).to_pydatetime()
        except Exception:
            date_val = datetime.utcnow()

        description = str(row.get(desc_col, "Unknown")).strip()
        raw_amount = str(row.get(amount_col, "0")).replace("$", "").replace(",", "").strip()
        try:
            amount = abs(float(raw_amount))
        except ValueError:
            continue

        rows.append({
            "date": date_val,
            "description": description[:512],
            "amount": amount,
            "category": guess_category(description),
            "merchant": description[:128],
        })

    return rows


def parse_statement(filename: str, file_bytes: bytes) -> list[dict]:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        return parse_pdf(file_bytes)
    elif ext in ("csv", "xls", "xlsx"):
        if ext in ("xls", "xlsx"):
            try:
                df = pd.read_excel(io.BytesIO(file_bytes))
                buf = io.BytesIO()
                df.to_csv(buf, index=False)
                file_bytes = buf.getvalue()
            except Exception:
                return []
        return parse_csv(file_bytes)
    return []
