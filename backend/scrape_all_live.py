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

print("\n=== 2. Testing Ship & Bunker Fuel Prices (Singapore) ===")
try:
    url = "https://shipandbunker.com/prices/apac/sea/sg-sin-singapore"
    r = requests.get(url, headers=HEADERS, timeout=10)
    print("Ship & Bunker Singapore status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    vlsfo_tbl = soup.find("table", class_=re.compile(r"price-table\s+VLSFO", re.I))
    if vlsfo_tbl:
        price_td = vlsfo_tbl.find("td", headers=re.compile(r"price-VLSFO", re.I))
        if price_td:
            print("Singapore VLSFO:", price_td.text.strip())
    rows = soup.find_all("tr")
    for row in rows:
        t = row.get_text()
        if "Singapore" in t or "VLSFO" in t or "IFO380" in t:
            print("Row:", " ".join(t.split())[:100])
            break
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

