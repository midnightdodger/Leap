import aiohttp
import asyncio
import re
import json
from urllib.parse import urlparse, urljoin
import os

to_crawl = ["http://google.com/","https://www.wikipedia.com"]
crawled = set()
found = set()
results_file = "results.json"

HEADERS = {"User-Agent": "Hoppy/0.2"}

ai_words = ["ai", "chatbot", "gpt", "llm", "neural", "machine learning"]
nsfw_keywords = ["porn", "sex", "xxx", "nsfw", "hentai", "adult"]
robots_cache = {}

if not os.path.exists(results_file):
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump([], f)

def extract_seo(html):
    seo = {}
    lower = html.lower()
    if "<title>" in lower:
        seo["title"] = html.split("<title>")[1].split("</title>")[0].strip()
    if 'name="description"' in lower:
        part = lower.split('name="description"')[1]
        if 'content="' in part:
            seo["description"] = part.split('content="')[1].split('"')[0].strip()
    if 'name="keywords"' in lower:
        part = lower.split('name="keywords"')[1]
        if 'content="' in part:
            seo["keywords"] = part.split('content="')[1].split('"')[0].strip()
    h1s, h2s = [], []
    for p in html.split("<"):
        if p.lower().startswith("h1>"):
            h1s.append(p[3:].split("</h1>")[0])
        if p.lower().startswith("h2>"):
            h2s.append(p[3:].split("</h2>")[0])
    seo["h1"] = h1s
    seo["h2"] = h2s
    return seo

def detect_ai(html, url):
    text_only = re.sub(r"<[^>]+>", " ", html).lower()
    triggers = sum(
        1 for w in ai_words if (w == "machine learning" and "machine learning" in text_only) or (w != "machine learning" and re.search(rf"\b{w}\b", text_only)) or (w in url.lower())
    )
    return triggers >= 3

def detect_nsfw(html, url):
    text_lower = html.lower()
    url_lower = url.lower()
    triggers = sum(1 for w in nsfw_keywords if w in text_lower or w in url_lower)
    return triggers >= 3

async def allowed_by_robots(session, url):
    parsed = urlparse(url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    if root in robots_cache:
        rules = robots_cache[root]
    else:
        robots_url = f"{root}/robots.txt"
        rules = []
        try:
            async with session.get(robots_url, headers=HEADERS, timeout=5) as resp:
                txt = (await resp.text()).lower().splitlines()
                ua_section = False
                for line in txt:
                    line = line.strip()
                    if line.startswith("user-agent: *"):
                        ua_section = True
                        continue
                    if line.startswith("user-agent:"):
                        ua_section = False
                        continue
                    if ua_section and line.startswith("disallow:"):
                        rules.append(line.replace("disallow:", "").strip())
        except:
            pass
        robots_cache[root] = rules
    path = parsed.path or "/"
    for rule in rules:
        if rule == "" or rule == "/":
            return False
        if path.startswith(rule):
            return False
    return True

async def append_json(entry):
    if not os.path.exists(results_file):
        data = []
    else:
        with open(results_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    data.append(entry)
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

async def fetch_page(session, url):
    if url in crawled:
        return
    if not await allowed_by_robots(session, url):
        print(f"Skipping {url} (robots.txt)")
        return
    try:
        async with session.get(url, headers=HEADERS, timeout=10) as resp:
            html = await resp.text()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return

    crawled.add(url)
    seo = extract_seo(html)
    flags = {"nsfw": detect_nsfw(html, url), "ai": detect_ai(html, url)}
    subpages = []

    for chunk in re.findall(r'href=["\'](.*?)["\']', html, re.IGNORECASE):
        link = urljoin(url, chunk)
        if link.startswith("http") and link not in found:
            found.add(link)
            subpages.append(link)
            to_crawl.append(link)

    entry = {"url": url, "seo": seo, "flags": flags, "subpages": subpages}
    await append_json(entry)
    print(f"\n== Crawled: {url} ==\nSEO: {seo}\nFlags: {flags}\nSubpages: {len(subpages)}")

async def main():
    async with aiohttp.ClientSession() as session:
        while to_crawl:
            tasks = [fetch_page(session, to_crawl.pop(0)) for _ in range(min(5, len(to_crawl)))]
            await asyncio.gather(*tasks)
            await asyncio.sleep(0.5)

asyncio.run(main())
