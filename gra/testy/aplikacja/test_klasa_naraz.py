"""Ustawienia pod całą klasę naraz (próba obciążenia 23.11.2026): jedno IP szkoły, wiele zapisów do SQLite."""

from django.conf import settings


def test_logowanie_klasy_z_jednego_ip_nie_jest_blokowane():
    limit = settings.ACCOUNT_RATE_LIMITS
    assert int(limit["login"].split("/")[0]) >= 100      # 30 uczniów + MG w minutę
    assert int(limit["login_failed"].split(",")[0].split("/")[0]) >= 60   # literówki w hasłach
    assert "/key" in limit["login_failed"]                # limit na konto zostaje


def test_baza_czeka_na_zapis_zamiast_wpadac_w_blokade():
    opcje = settings.DATABASES["default"]["OPTIONS"]
    assert opcje["timeout"] >= 20 and "WAL" in opcje["init_command"]
