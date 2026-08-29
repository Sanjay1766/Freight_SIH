import requests
from bs4 import BeautifulSoup
import re
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

print("=== 1. Testing Baltic Dry Index Sources ===")

# A. Handybulk
try:
    url = "https://www.handybulk.com/baltic-dry-index/"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("Handybulk status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text()
    matches = re.findall(r"(?:BDI|Baltic Dry Index|Capesize|BCI|Panamax|BPI|Supramax|BSI)[^\n\r]{0,40}?[:\s]+([\d,]+)", text, re.IGNORECASE)
    print("Handybulk matches:", matches[:10])
except Exception as e:
    print("Handybulk error:", e)

# B. TradingEconomics Baltic
try:
    url = "https://tradingeconomics.com/commodity/baltic"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("TradingEconomics Baltic status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    val_tag = soup.find("span", {"id": "market_last"}) or soup.find("div", class_="market-price")
    if val_tag:
        print("TradingEconomics Baltic last:", val_tag.text.strip())
except Exception as e:
    print("TradingEconomics Baltic error:", e)

print("\n=== 2. Testing Ship & Bunker Fuel Prices ===")
try:
    url = "https://shipandbunker.com/prices"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("Ship & Bunker status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    rows = soup.find_all("tr")
    for row in rows:
        t = row.get_text()
        if "Singapore" in t or "Global" in t or "Rotterdam" in t:
            print("Row:", " ".join(t.split()))
except Exception as e:
    print("Ship & Bunker error:", e)

print("\n=== 3. Testing Coal Price Sources ===")
# A. TradingEconomics Coal
try:
    url = "https://tradingeconomics.com/commodity/coal"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("TradingEconomics Coal status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    val_tag = soup.find("span", {"id": "market_last"})
    if val_tag:
        print("TradingEconomics Coal last:", val_tag.text.strip())
except Exception as e:
    print("TradingEconomics Coal error:", e)

print("\n=== 4. Testing FRED Trade-Weighted Dollar ===")
try:
    url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("FRED status:", r.status_code)
    lines = [l.strip() for l in r.text.strip().split("\n") if l.strip()]
    print("FRED last 5 rows:", lines[-5:])
except Exception as e:
    print("FRED error:", e)

