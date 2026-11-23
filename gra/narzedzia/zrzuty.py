"""Zrzuty ekranu gry bez przeglądarki z okienkiem (Chrome bez okna, sterowany przez DevTools).

Dla każdego, kto nie ma rozszerzenia przeglądarki (wyko, Archi w nocy). Tylko biblioteka standardowa + Django.
Loguje się bez hasła, przez sesję Django zrobioną dla podanego konta (tylko serwer lokalny).

    python -X utf8 -m narzedzia.zrzuty --port 8783 --konto mg --kroki kroki.json --wyjscie _robocze/zrzuty

kroki.json: lista {"url": "/gra/<id>/<firma>"} | {"js": "kod"} | {"czekaj": sekundy} | {"zrzut": "nazwa"}
| {"wyglad": ["bar", "jasny"]}. `js` wykonuje się na stronie (await działa), wynik idzie na ekran.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

CHROME = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
          r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", "google-chrome", "chromium"]


class Ws:
    """Najprostszy klient WebSocket (tekst, bez rozszerzeń) – wystarczy do DevTools."""

    def __init__(self, url: str):
        host, _, sciezka = url.removeprefix("ws://").partition("/")
        h, _, p = host.partition(":")
        self.s = socket.create_connection((h, int(p)))
        klucz = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{sciezka} HTTP/1.1\r\nHost: {host}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {klucz}\r\n"
                        "Sec-WebSocket-Version: 13\r\n\r\n").encode())
        odp = b""
        while b"\r\n\r\n" not in odp:
            odp += self.s.recv(1024)
        if b" 101 " not in odp.split(b"\r\n")[0]:
            raise RuntimeError(odp.decode(errors="replace"))
        self.reszta = odp.split(b"\r\n\r\n", 1)[1]
        self.nr = 0

    def _czytaj(self, n: int) -> bytes:
        while len(self.reszta) < n:
            self.reszta += self.s.recv(1 << 20)
        b, self.reszta = self.reszta[:n], self.reszta[n:]
        return b

    def wyslij(self, tekst: str):
        dane = tekst.encode()
        maska = os.urandom(4)
        n = len(dane)
        nagl = bytes([0x81]) + (bytes([0x80 | n]) if n < 126 else
                                bytes([0x80 | 126]) + struct.pack(">H", n) if n < 65536 else
                                bytes([0x80 | 127]) + struct.pack(">Q", n))
        self.s.sendall(nagl + maska + bytes(b ^ maska[i % 4] for i, b in enumerate(dane)))

    def odbierz(self) -> str:
        wynik = b""
        while True:
            b1, b2 = self._czytaj(2)
            n = b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._czytaj(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._czytaj(8))[0]
            wynik += self._czytaj(n)
            if b1 & 0x80:
                return wynik.decode()

    def cdp(self, metoda: str, **parametry) -> dict:
        self.nr += 1
        self.wyslij(json.dumps({"id": self.nr, "method": metoda, "params": parametry}))
        while True:
            m = json.loads(self.odbierz())
            if m.get("id") == self.nr:
                if "error" in m:
                    raise RuntimeError(f"{metoda}: {m['error']}")
                return m.get("result", {})


def sesja(konto: str) -> tuple[str, str]:
    """(nazwa ciasteczka, klucz sesji) zalogowanego `konto` – bez hasła, tylko lokalnie."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lukrum.settings")
    import django
    django.setup()
    from django.conf import settings
    from django.contrib.auth import (
        BACKEND_SESSION_KEY,
        HASH_SESSION_KEY,
        SESSION_KEY,
        get_user_model,
    )
    from django.contrib.sessions.backends.db import SessionStore
    u = get_user_model().objects.get(username=konto)
    s = SessionStore()
    s[SESSION_KEY], s[BACKEND_SESSION_KEY] = str(u.pk), settings.AUTHENTICATION_BACKENDS[0]
    s[HASH_SESSION_KEY] = u.get_session_auth_hash()
    s.create()
    return settings.SESSION_COOKIE_NAME, s.session_key


def main():
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    a.add_argument("--port", type=int, default=8783)
    a.add_argument("--konto", default="mg")
    a.add_argument("--kroki", required=True)
    a.add_argument("--wyjscie", default="_robocze/zrzuty")
    a.add_argument("--szer", type=int, default=1366)
    a.add_argument("--wys", type=int, default=820)
    o = a.parse_args()
    kroki = json.loads(Path(o.kroki).read_text(encoding="utf-8"))
    cel = Path(o.wyjscie)
    cel.mkdir(parents=True, exist_ok=True)
    chrome = next((c for c in CHROME if Path(c).exists() or shutil.which(c)), None)
    if not chrome:
        raise SystemExit("Nie ma Chrome.")
    profil = tempfile.mkdtemp(prefix="lukrum-zrzuty-")
    dbg = 9300 + o.port % 100
    proc = subprocess.Popen([chrome, "--headless=new", f"--remote-debugging-port={dbg}", f"--user-data-dir={profil}",
                             f"--window-size={o.szer},{o.wys}", "--hide-scrollbars", "about:blank"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                strony = json.load(urllib.request.urlopen(f"http://127.0.0.1:{dbg}/json"))
                break
            except OSError:
                time.sleep(0.2)
        ws = Ws(next(s for s in strony if s["type"] == "page")["webSocketDebuggerUrl"])
        ws.cdp("Page.enable")
        ws.cdp("Emulation.setDeviceMetricsOverride", width=o.szer, height=o.wys, deviceScaleFactor=1, mobile=False)
        nazwa, klucz = sesja(o.konto)
        ws.cdp("Network.setCookie", name=nazwa, value=klucz, domain="localhost", path="/")
        baza = f"http://localhost:{o.port}"
        for k in kroki:
            if "url" in k:
                ws.cdp("Page.navigate", url=baza + k["url"])
                time.sleep(k.get("czekaj", 4))
            elif "wyglad" in k:
                p, t = k["wyglad"]
                ws.cdp("Runtime.evaluate", expression=f"document.documentElement.setAttribute('data-paleta','{p}');"
                       f"document.documentElement.setAttribute('data-tryb','{t}')")
                time.sleep(0.5)
            elif "js" in k:
                r = ws.cdp("Runtime.evaluate", expression=k["js"], awaitPromise=True, returnByValue=True)
                wynik = r.get("exceptionDetails") or r.get("result", {}).get("value")
                if wynik is not None:
                    print("js:", json.dumps(wynik, ensure_ascii=False)[:500])
                time.sleep(k.get("czekaj", 1.5))
            elif "czekaj" in k:
                time.sleep(k["czekaj"])
            if "zrzut" in k:
                png = ws.cdp("Page.captureScreenshot", format="png")["data"]
                (cel / f"{k['zrzut']}.png").write_bytes(base64.b64decode(png))
                print("zrzut:", cel / f"{k['zrzut']}.png")
    finally:
        proc.terminate()
        shutil.rmtree(profil, ignore_errors=True)


if __name__ == "__main__":
    main()
