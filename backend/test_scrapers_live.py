import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

# 1. Check DXY Sources
print("1. Testing US Dollar Index (DXY) Sources:")
try:
    r = requests.get("https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?range=1d&interval=1d", headers=HEADERS, timeout=5)
    if r.status_code == 200:
        price = r.json()["chart"]["result"][0]["meta"].get("regularMarketPrice")
        print("  Yahoo Finance DXY Quote:", price)
    else:
        print("  Yahoo Finance DXY HTTP Status:", r.status_code)
except Exception as e:
    print("  Yahoo Finance DXY err:", e)

try:
    r = requests.get("https://tradingeconomics.com/united-states/currency", headers=HEADERS, timeout=5)
    soup = BeautifulSoup(r.text, "html.parser")
    val_tag = soup.find("span", {"id": "market_last"}) or soup.find("div", class_="market-price")
    print("  TradingEconomics USD DXY:", val_tag.text.strip() if val_tag else "Not found")
except Exception as e:
    print("  TradingEconomics DXY err:", e)

try:
    r = requests.get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS", headers=HEADERS, timeout=3)
    print("  FRED status:", r.status_code)
    lines = [l.strip() for l in r.text.strip().split("\n") if l.strip()]
    print("  FRED last 2 rows:", lines[-2:])
except Exception as e:
    print("  FRED err:", e)

# 2. Check Handybulk
print("\n2. Testing Handybulk HTML structure:")
try:
    r = requests.get("https://www.handybulk.com/baltic-dry-index/", headers=HEADERS, timeout=10)
    print("Handybulk status:", r.status_code)
    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup.find_all(["h1", "h2", "h3", "p", "td", "li"]):
        txt = tag.get_text().strip()
        if any(k in txt.lower() for k in ["baltic dry index", "bdi", "capesize", "bci", "panamax", "bpi", "supramax", "bsi"]):
            if len(txt) < 150:
                print("  ", txt)
except Exception as e:
    print("Handybulk err:", e)

# 3. Check TradingEconomics Baltic
print("\n3. Testing TradingEconomics Baltic:")
try:
    r = requests.get("https://tradingeconomics.com/commodity/baltic", headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    val_tag = soup.find("span", {"id": "market_last"}) or soup.find("div", class_="market-price")
    print("  Baltic Last:", val_tag.text.strip() if val_tag else "Not found")
except Exception as e:
    print("TradingEconomics Baltic err:", e)

# 4. Check Ship & Bunker (Singapore)
print("\n4. Testing Ship & Bunker Singapore VLSFO:")
try:
    r = requests.get("https://shipandbunker.com/prices/apac/sea/sg-sin-singapore", headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    vlsfo_tbl = soup.find("table", class_=re.compile(r"price-table\s+VLSFO", re.I))
    if vlsfo_tbl:
        price_td = vlsfo_tbl.find("td", headers=re.compile(r"price-VLSFO", re.I))
        print("  Singapore VLSFO Table price:", price_td.text.strip() if price_td else "Not found")
    for tr in soup.find_all("tr"):
        t = tr.get_text()
        if "VLSFO" in t or "IFO380" in t:
            print("  Singapore row:", " ".join(t.split())[:100])
            break
except Exception as e:
    print("Ship & Bunker err:", e)

# 5. Check Coal TradingEconomics
print("\n5. Testing TradingEconomics Coal:")
try:
    r = requests.get("https://tradingeconomics.com/commodity/coal", headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    val_tag = soup.find("span", {"id": "market_last"})
    print("  Coal Last:", val_tag.text.strip() if val_tag else "Not found")
except Exception as e:
    print("Coal err:", e)

