import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

# 1. Check FRED DTWEXBGS
print("1. Testing FRED DTWEXBGS:")
try:
    r = requests.get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS", headers=HEADERS, timeout=10)
    print("FRED status:", r.status_code)
    lines = [l.strip() for l in r.text.strip().split("\n") if l.strip()]
    print("FRED last 5 observations:")
    for l in lines[-5:]:
        print("  ", l)
except Exception as e:
    print("FRED err:", e)

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

# 4. Check Ship & Bunker
print("\n4. Testing Ship & Bunker Singapore VLSFO:")
try:
    r = requests.get("https://shipandbunker.com/prices", headers=HEADERS, timeout=10)
    soup = BeautifulSoup(r.text, "html.parser")
    for tr in soup.find_all("tr"):
        t = tr.get_text()
        if "Singapore" in t and "629" in t or ("Singapore" in t and ("VLSFO" in t or "IFO" in t)):
            print("  Singapore row:", " ".join(t.split()))
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

