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


def _te_extract_value(soup: BeautifulSoup, bounds: tuple) -> float | None:
    """
    Two-stage TradingEconomics value extractor.
    Stage 1: target the known #market_last / .market-price DOM selector.
    Stage 2: fall back to a full-page text regex scan for a plausible numeric value.
    Returns a float within `bounds` (lo, hi) or None on complete failure.
    """
    lo, hi = bounds

    # Stage 1 — specific selector
    val_tag = (
        soup.find("span", {"id": "market_last"})
        or soup.find("div", class_="market-price")
        or soup.find("td", {"id": "market_last"})
    )
    if val_tag:
        val_str = re.sub(r"[^\d.]", "", val_tag.text)
        if val_str:
            try:
                val = float(val_str)
                if lo <= val <= hi:
                    return val
            except ValueError:
                pass
        logger.warning(
            "[SCRAPER] TradingEconomics selector found but value '%s' outside bounds [%s, %s] — "
            "DOM structure may have changed.",
            val_tag.text.strip(), lo, hi,
        )

    # Stage 2 — regex scan over full page text
    all_nums = re.findall(r"\b(\d{2,6}(?:\.\d{1,4})?)\b", soup.get_text())
    for n in all_nums:
        try:
            val = float(n)
            if lo <= val <= hi:
                logger.info("[SCRAPER] Stage-2 text-scan recovered value %.2f from TradingEconomics page.", val)
                return val
        except ValueError:
            continue

    return None


class RealTimeDataFetcher:
    def __init__(self, timeout: int = 5):
        self.timeout = timeout

    def fetch_baltic_dry_index(self) -> dict:
        data = {"bdi": None, "bci": None, "bpi": None, "bsi": None, "source": None}

        # 1. Try TradingEconomics with two-stage extractor
        try:
            url = "https://tradingeconomics.com/commodity/baltic"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                val = _te_extract_value(soup, (500, 10000))
                if val is not None:
                    data["bdi"] = int(round(val))
                    data["source"] = "tradingeconomics.com/commodity/baltic"
                else:
                    logger.warning(
                        "[SCRAPER_DEGRADED] TradingEconomics BDI: no valid value extracted "
                        "(selector missing or markup changed). Falling through to Handybulk."
                    )
            else:
                logger.warning(
                    "[SCRAPER_DEGRADED] TradingEconomics BDI: HTTP %s. Falling through to Handybulk.",
                    resp.status_code,
                )
        except Exception as e:
            logger.warning("[SCRAPER_DEGRADED] TradingEconomics BDI fetch failed: %s", e)

        # 2. Handybulk regex scan (robust — plain-text page)
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
                    else:
                        logger.warning(
                            "[SCRAPER_DEGRADED] Handybulk BDI: page loaded but BDI pattern not found. "
                            "Will fall back to last known value."
                        )
                else:
                    logger.warning("[SCRAPER_DEGRADED] Handybulk BDI: HTTP %s.", resp.status_code)
            except Exception as e:
                logger.warning("[SCRAPER_DEGRADED] Handybulk BDI fetch failed: %s", e)

        if data["bdi"] is None:
            logger.error(
                "[SCRAPER_DEGRADED] ALL BDI sources failed — serving stale/fallback value. "
                "Check TradingEconomics and Handybulk markup."
            )

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
            else:
                logger.warning(
                    "[SCRAPER_DEGRADED] Ship&Bunker Singapore: HTTP %s.", resp.status_code
                )
        except Exception as e:
            logger.warning("[SCRAPER_DEGRADED] Ship&Bunker Singapore fetch failed: %s", e)

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
                        if "Singapore" in t and ("VLSFO" in t or "IFO" in t):
                            prices = re.findall(r"(\d{3}(?:\.\d+)?)", t)
                            for p in prices:
                                val = float(p)
                                if 450.0 <= val <= 950.0:
                                    data["singapore_vlsfo"] = val
                                    data["source"] = "shipandbunker.com/prices"
                                    break
                        if "Rotterdam" in t and ("VLSFO" in t or "IFO" in t):
                            prices = re.findall(r"(\d{3}(?:\.\d+)?)", t)
                            for p in prices:
                                val = float(p)
                                if 400.0 <= val <= 900.0:
                                    data["rotterdam_vlsfo"] = val
                                    break
                else:
                    logger.warning(
                        "[SCRAPER_DEGRADED] Ship&Bunker overview: HTTP %s.", resp.status_code
                    )
            except Exception as e:
                logger.warning("[SCRAPER_DEGRADED] Ship&Bunker overview fetch failed: %s", e)

        if data["singapore_vlsfo"] is None:
            logger.error(
                "[SCRAPER_DEGRADED] ALL Bunker sources failed — serving stale/fallback value. "
                "Check shipandbunker.com markup."
            )

        return data

    def fetch_coal_prices(self) -> dict:
        data = {"newcastle_coal": None, "indo_coal": None, "source": None}
        try:
            url = "https://tradingeconomics.com/commodity/coal"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                val = _te_extract_value(soup, (60.0, 500.0))
                if val is not None:
                    data["newcastle_coal"] = round(val, 2)
                    data["indo_coal"] = round(val * 0.42, 2)
                    data["source"] = "tradingeconomics.com/commodity/coal"
                else:
                    logger.warning(
                        "[SCRAPER_DEGRADED] TradingEconomics Coal: no valid value extracted "
                        "(selector missing or markup changed). Will serve stale/fallback value."
                    )
            else:
                logger.warning(
                    "[SCRAPER_DEGRADED] TradingEconomics Coal: HTTP %s.", resp.status_code
                )
        except Exception as e:
            logger.warning("[SCRAPER_DEGRADED] TradingEconomics Coal fetch failed: %s", e)

        if data["newcastle_coal"] is None:
            logger.error(
                "[SCRAPER_DEGRADED] ALL Coal sources failed — serving stale/fallback value. "
                "Check tradingeconomics.com/commodity/coal markup."
            )

        return data

    def fetch_usd_dxy(self) -> dict:
        data = {"dxy": None, "source": None}

        # 1. Yahoo Finance chart API (fast, lightweight JSON — most stable)
        try:
            url = "https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?range=1d&interval=1d"
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code == 200:
                res = resp.json()
                price = res["chart"]["result"][0]["meta"].get("regularMarketPrice")
                if price and 70.0 <= float(price) <= 150.0:
                    data["dxy"] = round(float(price), 2)
                    data["source"] = "query1.finance.yahoo.com:DX-Y.NYB"
            else:
                logger.warning("[SCRAPER_DEGRADED] Yahoo Finance DXY: HTTP %s.", resp.status_code)
        except Exception as e:
            logger.debug("[SCRAPER_DEGRADED] Yahoo Finance DXY: %s", e)

        # 2. TradingEconomics two-stage fallback
        if data["dxy"] is None:
            try:
                url = "https://tradingeconomics.com/united-states/currency"
                resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    val = _te_extract_value(soup, (70.0, 150.0))
                    if val is not None:
                        data["dxy"] = round(val, 2)
                        data["source"] = "tradingeconomics.com/united-states/currency"
                    else:
                        logger.warning(
                            "[SCRAPER_DEGRADED] TradingEconomics DXY: no valid value extracted. "
                            "Falling through to FRED."
                        )
                else:
                    logger.warning(
                        "[SCRAPER_DEGRADED] TradingEconomics DXY: HTTP %s.", resp.status_code
                    )
            except Exception as e:
                logger.debug("[SCRAPER_DEGRADED] TradingEconomics DXY: %s", e)

        # 3. FRED public CSV (most reliable structural source, may lag 1 day)
        if data["dxy"] is None:
            try:
                url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS"
                resp = requests.get(url, headers=HEADERS, timeout=3)
                if resp.status_code == 200:
                    lines = [line.strip() for line in resp.text.strip().split("\n") if line.strip()]
                    for line in reversed(lines):
                        parts = line.split(",")
                        if len(parts) == 2 and parts[1] not in [".", "DTWEXBGS"]:
                            try:
                                val = float(parts[1])
                                if 70.0 <= val <= 150.0:
                                    data["dxy"] = round(val, 2)
                                    data["source"] = "fred.stlouisfed.org:DTWEXBGS"
                                    break
                            except ValueError:
                                continue
                else:
                    logger.warning("[SCRAPER_DEGRADED] FRED DXY: HTTP %s.", resp.status_code)
            except Exception as e:
                logger.debug("[SCRAPER_DEGRADED] FRED DXY: %s", e)

        if data["dxy"] is None:
            logger.error(
                "[SCRAPER_DEGRADED] ALL DXY sources failed — serving stale/fallback value. "
                "Check Yahoo Finance, TradingEconomics, and FRED."
            )

        return data

    def fetch_all_latest(self, fallback_row: dict = None) -> dict:
        """
        Fetches all live market streams concurrently and merges with fallback values.
        Logs a SCRAPER_SOURCE_HEALTH summary for each invocation.
        """
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

        # Source health audit
        live_count = sum([
            bdi_info["bdi"] is not None,
            bunker_info["singapore_vlsfo"] is not None,
            coal_info["newcastle_coal"] is not None,
            dxy_info["dxy"] is not None,
        ])
        if live_count == 4:
            logger.info("[SCRAPER_SOURCE_HEALTH] All 4/4 sources live: BDI=%s, Bunker=%s, Coal=%s, DXY=%s",
                        bdi_info["source"], bunker_info["source"], coal_info["source"], dxy_info["source"])
        elif live_count >= 2:
            logger.warning(
                "[SCRAPER_SOURCE_HEALTH] Partial degradation — %d/4 sources live. "
                "BDI=%s, Bunker=%s, Coal=%s, DXY=%s. Stale fallbacks active for missing sources.",
                live_count,
                bdi_info["source"] or "FALLBACK",
                bunker_info["source"] or "FALLBACK",
                coal_info["source"] or "FALLBACK",
                dxy_info["source"] or "FALLBACK",
            )
        else:
            logger.error(
                "[SCRAPER_SOURCE_HEALTH] CRITICAL — only %d/4 sources live. "
                "Widespread scraper failure. All values are stale fallbacks. "
                "Possible causes: network isolation, IP block, or widespread markup changes.",
                live_count,
            )

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
