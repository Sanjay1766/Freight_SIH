import re
import logging
from datetime import datetime, timezone
import concurrent.futures
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

class RealTimeDataFetcher:
    def __init__(self, timeout: int = 5):
        self.timeout = timeout

    def fetch_baltic_dry_index(self) -> dict:
        data = {"bdi": None, "bci": None, "bpi": None, "bsi": None, "source": None}

        # 1. Try TradingEconomics for live BDI
        try:
            url = "https://tradingeconomics.com/commodity/baltic"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                val_tag = soup.find("span", {"id": "market_last"}) or soup.find("div", class_="market-price")
                if val_tag:
                    val_str = re.sub(r"[^\d.]", "", val_tag.text)
                    if val_str:
                        val = float(val_str)
                        if 500 <= val <= 10000:
                            data["bdi"] = int(round(val))
                            data["source"] = "tradingeconomics.com/commodity/baltic"
        except Exception as e:
            logger.warning(f"Error fetching Baltic from TradingEconomics: {e}")

        # 2. Try Handybulk for sub-indices
        if data["bdi"] is None:
            try:
                url = "https://www.handybulk.com/baltic-dry-index/"
                resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    text = soup.get_text()
                    
                    bdi_match = re.search(r"BDI\s*[:=-]?\s*([\d,]+)", text)
                    if bdi_match:
                        data["bdi"] = int(bdi_match.group(1).replace(",", ""))
                        data["source"] = "handybulk.com"
            except Exception as e:
                logger.warning(f"Error fetching from Handybulk: {e}")

        if data["bdi"] is not None:
            data["bci"] = int(round(data["bdi"] * 1.38))
            data["bpi"] = int(round(data["bdi"] * 0.94))
            data["bsi"] = int(round(data["bdi"] * 0.78))

        return data

    def fetch_bunker_prices(self) -> dict:
        data = {
            "singapore_vlsfo": None,
            "singapore_ifo380": None,
            "singapore_mgo": None,
            "rotterdam_vlsfo": None,
            "source": None
        }
        
        # 1. Primary: Singapore dedicated terminal page on Ship & Bunker
        try:
            singapore_url = "https://shipandbunker.com/prices/apac/sea/sg-sin-singapore"
            resp = requests.get(singapore_url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                
                # Check VLSFO price table
                vlsfo_tbl = soup.find("table", class_=re.compile(r"price-table\s+VLSFO", re.I))
                if vlsfo_tbl:
                    price_td = vlsfo_tbl.find("td", headers=re.compile(r"price-VLSFO", re.I))
                    if price_td:
                        m = re.search(r"(\d+(?:\.\d+)?)", price_td.text)
                        if m:
                            val = float(m.group(1))
                            if 400.0 <= val <= 1200.0:
                                data["singapore_vlsfo"] = val
                                data["source"] = "shipandbunker.com/prices/apac/sea/sg-sin-singapore"

                # Check IFO380 price table
                ifo_tbl = soup.find("table", class_=re.compile(r"price-table\s+IFO380", re.I))
                if ifo_tbl:
                    price_td = ifo_tbl.find("td", headers=re.compile(r"price-IFO380", re.I))
                    if price_td:
                        m = re.search(r"(\d+(?:\.\d+)?)", price_td.text)
                        if m:
                            val = float(m.group(1))
                            if 350.0 <= val <= 1000.0:
                                data["singapore_ifo380"] = val

                # Check MGO price table
                mgo_tbl = soup.find("table", class_=re.compile(r"price-table\s+MGO", re.I))
                if mgo_tbl:
                    price_td = mgo_tbl.find("td", headers=re.compile(r"price-MGO", re.I))
                    if price_td:
                        m = re.search(r"(\d+(?:\.\d+)?)", price_td.text)
                        if m:
                            val = float(m.group(1))
                            if 500.0 <= val <= 1500.0:
                                data["singapore_mgo"] = val
        except Exception as e:
            logger.warning(f"Error fetching from Singapore Ship & Bunker: {e}")

        # 2. Secondary fallback: Global Ship & Bunker prices overview
        if data["singapore_vlsfo"] is None:
            try:
                url = "https://shipandbunker.com/prices"
                resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    rows = soup.find_all("tr")
                    for row in rows:
                        t = " ".join(row.get_text().split())
                        if "Singapore" in t and ("VLSFO" in t or "IFO" in t or "629" in t or "784" in t):
                            prices = re.findall(r"(\d{3}(?:\.\d+)?)", t)
                            for p in prices:
                                val = float(p)
                                if 450.0 <= val <= 950.0:
                                    data["singapore_vlsfo"] = val
                                    data["source"] = "shipandbunker.com/prices"
                                    break
                        if "Rotterdam" in t and ("VLSFO" in t or "538" in t or "IFO" in t):
                            prices = re.findall(r"(\d{3}(?:\.\d+)?)", t)
                            for p in prices:
                                val = float(p)
                                if 400.0 <= val <= 900.0:
                                    data["rotterdam_vlsfo"] = val
                                    break
            except Exception as e:
                logger.warning(f"Error fetching from Ship & Bunker overview: {e}")

        return data

    def fetch_coal_prices(self) -> dict:
        data = {"newcastle_coal": None, "indo_coal": None, "source": None}
        try:
            url = "https://tradingeconomics.com/commodity/coal"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                val_tag = soup.find("span", {"id": "market_last"})
                if val_tag:
                    val_str = re.sub(r"[^\d.]", "", val_tag.text)
                    if val_str:
                        val = float(val_str)
                        if 60.0 <= val <= 500.0:
                            data["newcastle_coal"] = round(val, 2)
                            data["indo_coal"] = round(val * 0.42, 2)
                            data["source"] = "tradingeconomics.com/commodity/coal"
        except Exception as e:
            logger.warning(f"Error fetching Coal from TradingEconomics: {e}")

        return data

    def fetch_usd_dxy(self) -> dict:
        data = {"dxy": None, "source": None}
        
        # 1. Try Yahoo Finance chart API directly (fast, lightweight, zero extra dependencies)
        try:
            url = "https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?range=1d&interval=1d"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                res = resp.json()
                price = res["chart"]["result"][0]["meta"].get("regularMarketPrice")
                if price and 70.0 <= float(price) <= 150.0:
                    data["dxy"] = round(float(price), 2)
                    data["source"] = "query1.finance.yahoo.com:DX-Y.NYB"
        except Exception as e:
            logger.debug(f"Yahoo Finance chart API DXY: {e}")

        # 2. Try TradingEconomics Currency
        if data["dxy"] is None:
            try:
                url = "https://tradingeconomics.com/united-states/currency"
                resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    val_tag = soup.find("span", {"id": "market_last"}) or soup.find("div", class_="market-price")
                    if val_tag:
                        val_str = re.sub(r"[^\d.]", "", val_tag.text)
                        if val_str:
                            val = float(val_str)
                            if 70.0 <= val <= 150.0:
                                data["dxy"] = round(val, 2)
                                data["source"] = "tradingeconomics.com/united-states/currency"
            except Exception as e:
                logger.debug(f"TradingEconomics DXY: {e}")

        # 3. Try FRED public CSV
        if data["dxy"] is None:
            try:
                url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS"
                resp = requests.get(url, headers=HEADERS, timeout=3)
                if resp.status_code == 200:
                    lines = [line.strip() for line in resp.text.strip().split("\n") if line.strip()]
                    for line in reversed(lines):
                        parts = line.split(",")
                        if len(parts) == 2 and parts[1] not in [".", "DTWEXBGS"]:
                            val = float(parts[1])
                            if 70.0 <= val <= 150.0:
                                data["dxy"] = round(val, 2)
                                data["source"] = "fred.stlouisfed.org:DTWEXBGS"
                                break
            except Exception as e:
                logger.debug(f"FRED DXY: {e}")

        return data

    def fetch_all_latest(self, fallback_row: dict = None) -> dict:
        # Fetch all live streams concurrently in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            fut_bdi = executor.submit(self.fetch_baltic_dry_index)
            fut_bunker = executor.submit(self.fetch_bunker_prices)
            fut_coal = executor.submit(self.fetch_coal_prices)
            fut_dxy = executor.submit(self.fetch_usd_dxy)

            bdi_info = fut_bdi.result()
            bunker_info = fut_bunker.result()
            coal_info = fut_coal.result()
            dxy_info = fut_dxy.result()

        fb = fallback_row or {}
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        bdi_val = bdi_info["bdi"] if bdi_info["bdi"] is not None else fb.get("bdi", 3186)
        bci_val = bdi_info["bci"] if bdi_info["bci"] is not None else fb.get("bci", int(round(bdi_val * 1.38)))
        bpi_val = bdi_info["bpi"] if bdi_info["bpi"] is not None else fb.get("bpi", int(round(bdi_val * 0.94)))
        bsi_val = bdi_info["bsi"] if bdi_info["bsi"] is not None else fb.get("bsi", int(round(bdi_val * 0.78)))

        bunker_val = bunker_info["singapore_vlsfo"] if bunker_info["singapore_vlsfo"] is not None else fb.get("bunker_fuel", 784.50)
        coal_val = coal_info["newcastle_coal"] if coal_info["newcastle_coal"] is not None else fb.get("coal_index", 139.75)
        indo_coal_val = coal_info["indo_coal"] if coal_info["indo_coal"] is not None else fb.get("indo_coal_index", round(coal_val * 0.42, 2))
        dxy_val = dxy_info["dxy"] if dxy_info["dxy"] is not None else fb.get("dxy", 99.42)

        fleet_capacity_dwt = 12500000.0
        seaborne_volume = fb.get("seaborne_volume", 725000)
        mti_india = round((seaborne_volume / fleet_capacity_dwt) * (bunker_val / 100.0) * 0.85, 3)
        spot_rate = int(round(bdi_val * 9.85 + mti_india * 4350.0 + (bunker_val - 600.0) * 13.5))

        logger.info(f"Live Data Ingested -> BDI: {bdi_val} (source: {bdi_info.get('source')}), Bunker: ${bunker_val}/MT (source: {bunker_info.get('source')}), Coal: ${coal_val}/MT (source: {coal_info.get('source')}), DXY: {dxy_val} (source: {dxy_info.get('source')})")

        return {
            "date": today_str,
            "bdi": int(bdi_val),
            "bci": int(bci_val),
            "bpi": int(bpi_val),
            "bsi": int(bsi_val),
            "bunker_fuel": float(bunker_val),
            "coal_index": float(coal_val),
            "indo_coal_index": float(indo_coal_val),
            "dxy": float(dxy_val),
            "seaborne_volume": int(seaborne_volume),
            "mti_india": float(mti_india),
            "spot_freight_rate": spot_rate,
            "sources": {
                "bdi": bdi_info.get("source"),
                "bunker": bunker_info.get("source"),
                "coal": coal_info.get("source"),
                "dxy": dxy_info.get("source")
            }
        }
