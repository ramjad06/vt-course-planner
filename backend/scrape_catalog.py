"""
Scrape the VT undergraduate catalog into backend/courses.json.
Run locally (needs internet):  pip install requests beautifulsoup4 && python scrape_catalog.py
"""
import json, re, sys, time
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

BASE = "https://catalog.vt.edu"
INDEX = BASE + "/undergraduate/course-descriptions/"

CODE = r"[A-Z]{2,5}\s\d{4}[A-Z]?"
HEADER = re.compile(rf"^({CODE})\s+-\s+(.+?)\s+\((\d+(?:\.\d+)?(?:-\d+)?)\s+credits?\)", re.M)


def parse_credits(s):
    # "1-19" (variable) -> use the low end so planning totals stay sane
    return int(float(s.split("-")[0]))


def parse_prereqs(text):
    """
    Turn 'Pre: CS 2114 and (MATH 1226 or 1225); Co: ...' into
    (groups, note). groups = AND of OR-groups, e.g. [["CS 2114"], ["MATH 1226", "MATH 1225"]].
    Anything that isn't a course (consent, standing, min grade) goes in note.
    """
    m = re.search(r"\bPre:\s*(.+?)(?=\s*\bCo:|\s*Pathway Concept|\Z)", text, re.S)
    if not m:
        return [], ""
    raw = " ".join(m.group(1).split())
    groups = []
    for part in re.split(r";|\band\b", raw):
        subject = None
        options = []
        # "MATH 1226 or 1225" -> inherit subject for bare numbers
        for tok in re.finditer(rf"({CODE})|\b(\d{{4}}[A-Z]?)\b", part):
            if tok.group(1):
                options.append(tok.group(1))
                subject = tok.group(1).split()[0]
            elif subject:
                options.append(f"{subject} {tok.group(2)}")
        if options:
            groups.append(sorted(set(options), key=options.index))
    note = ""
    if re.search(r"consent|standing|major|minor|grade|admission|junior|senior|sophomore", raw, re.I):
        note = raw
    return groups, note


def parse_page(text):
    courses = []
    matches = list(HEADER.finditer(text))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end():end]
        groups, note = parse_prereqs(body)
        courses.append({
            "code": m.group(1).replace("\xa0", " "),
            "name": m.group(2).strip(),
            "credits": parse_credits(m.group(3)),
            "prerequisites": groups,
            "prereq_note": note,
        })
    return courses


def main():
    s = requests.Session()
    s.headers["User-Agent"] = "vt-course-planner (student project)"
    soup = BeautifulSoup(s.get(INDEX, timeout=30).text, "html.parser")
    links = sorted({urljoin(INDEX, a["href"]) for a in soup.find_all("a", href=True)
                    if "/course-descriptions/" in a["href"] and a["href"].rstrip("/") != "/undergraduate/course-descriptions"})
    print(f"Found {len(links)} subject pages", file=sys.stderr)
    all_courses = {}
    for url in links:
        try:
            page = BeautifulSoup(s.get(url, timeout=30).text, "html.parser")
            for c in parse_page(page.get_text("\n")):
                all_courses[c["code"]] = c
        except Exception as e:
            print("skip", url, e, file=sys.stderr)
        time.sleep(0.3)  # be polite
    out = sorted(all_courses.values(), key=lambda c: c["code"])
    with open("courses.json", "w") as f:
        json.dump(out, f, indent=1)
    print(f"Wrote {len(out)} courses to courses.json", file=sys.stderr)


if __name__ == "__main__":
    main()
