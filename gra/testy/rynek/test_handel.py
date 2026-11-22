"""Giełda handlu (sprawa 19 autora): ogłoszenia towaru i sprzętu dla wszystkich, jawna licytacja w następnej
rundzie z krokiem przebicia (kontrola przy zapisie), rozstrzygnięcie na początku przeliczenia, faktury w KPiR obu
stron, partie z terminem u kupującego, odrzucenia (widełki, limit, brak towaru, przed odblokowaniem), boty
wystawiające nadwyżki i licytujące z limitem."""

import copy

import pytest
import yaml
from pomocnicze import _gra, _lokal, _runda
from pydantic import ValidationError

from silnik import na_zywo as nz
from silnik.dane import KATALOG_DANYCH, dane_domyslne
from silnik.ksiegowosc import biuro
from silnik.ksiegowosc import rozliczenie as rz
from silnik.ksiegowosc.finanse import Ksiega, Rachunek, ksieguj
from silnik.kuchnia import swiezosc as sw
from silnik.limity import naruszenia
from silnik.model import Firma, Ogloszenie, Partia
from silnik.rynek import handel as hd
from silnik.schematy import PlikHandlu

DOSTAWCA = "Makro"
HUMMUS = {"dostawca": DOSTAWCA, "zasob": "Hummus", "jakosc": 2, "ilosc": 80, "dzien": 3}
TOWAR = "2-A-1"   # id pierwszego ogłoszenia A wystawionego po rundzie 2


def _towar(cena, ilosc=20):
    return {"typ": "towar", "zasob": "Hummus", "jakosc": 2, "ilosc": ilosc, "cena_min": cena}


def _rozen(cena, nr=2):
    return {"typ": "sprzet", "stanowisko": "kuchnia", "nr": nr, "nazwa": "Rożen", "cena_min": cena}


def _gra_handlu(*firmy):
    return _gra(*(firmy or (("A", None), ("B", None), ("C", None))), odblokowanie={"handel": 2})


def _przygotuj(g, ogloszenia):
    """Runda 1: lokale (A – druga kuchnia); runda 2: A kupuje hummus i rożen, wystawia ogłoszenia."""
    _runda(g, A={**_lokal("centrum_3"), "stanowiska": {"kuchnia": 1}}, B=_lokal("centrum_2"),
           **({"C": _lokal("centrum_1")} if "C" in g.stan().firmy else {}))
    return _runda(g, A={"stanowiska": {}, "zamowienia": [HUMMUS],
                        "sprzet_kup": [{"typ": "kuchnia", "nr": 2, "nazwa": "Rożen", "jakosc": 2}],
                        "handel_wystaw": ogloszenia}, B={"stanowiska": {"kuchnia": 1}})


def _zapis(g, firma, nowe):
    """Kontrola zapisu jak w API (silnik/na_zywo.py) – lista błędów."""
    return nz.sprawdz_zapis(g.dane, g.decyzje.get(g.runda, {}), firma, nowe, g.szkic(firma), g.runda,
                            g.konfiguracja, stan=g.stan())


def test_dane_handlu():
    u = hd.ustawienia(dane_domyslne())
    assert u["handel"]["od_rundy"] == 5 and u["handel"]["cena_min"] < 1 < u["handel"]["cena_maks"]
    assert 0 < u["handel"]["krok_przebicia"] < 1 and u["boty"]["cena_min"] >= u["handel"]["cena_min"]
    assert all("{" not in t.format(sprzedawca="X", kupujacy="Y", co="Z") for t in u["teksty"])
    w = yaml.safe_load((KATALOG_DANYCH / "zdarzenia" / "handel.yaml").read_text(encoding="utf-8"))
    with pytest.raises(ValidationError):
        PlikHandlu.model_validate({**w, "handel": {**w["handel"], "cena_min": w["handel"]["cena_maks"] + 1}})
    with pytest.raises(ValidationError):   # cena wywoławcza botów poza widełkami
        PlikHandlu.model_validate({**w, "boty": {**w["boty"], "cena_min": w["handel"]["cena_maks"] + 1}})
    assert not hd.otwarty(dane_domyslne(), 4) and hd.otwarty(dane_domyslne(), 5)


@pytest.mark.dane_gry
def test_limity_poziomow_botow():
    """Słabszy bot licytuje niżej: limit_handlu rośnie z poziomem, w granicach 70–90% wartości."""
    p = dane_domyslne().boty["poziomy"]
    limity = [p[x]["limit_handlu"] for x in ("latwy", "sredni", "trudny", "niemozliwy")]
    assert limity == sorted(limity) and limity[0] >= 0.7 and limity[-1] <= 0.9


def test_wystawienie_ogloszen():
    g = _gra_handlu()
    s = _przygotuj(g, [_towar(900), _rozen(4000), _towar(1), _towar(900, ilosc=500),
                       {"typ": "lokal", "cena_min": 100}])
    h = s.wyniki[2]["A"]["handel"]
    assert [o["co"] for o in h["wystawione"]] == ["Hummus 2★ × 20 opak.", "Rożen 2★ (kuchnia 2)"]
    assert h["wystawione"][0]["id"] == TOWAR and h["wystawione"][0]["termin"] and h["wystawione"][0]["stawka"] == 0.05
    powody = [o["powod"] for o in h["odrzucone"]]
    assert powody[0].startswith("cena wywoławcza musi być od")
    assert "w magazynie było tylko" in powody[1]
    assert powody[2] == "można sprzedać towar albo sprzęt"
    assert any(b["zakladka"] == hd.ZAKLADKA and b["poziom"] == "czerwony" for b in s.wyniki[2]["A"]["lista_bledow"])
    o = s.firmy["A"].ogloszenia[0]
    assert o.runda == 2 and o.wartosc == pytest.approx(hd._wartosc_towaru(s.firmy["A"], "Hummus", 2) * 20, abs=0.01)
    # limit ogłoszeń: przy zapisie (silnik/limity.py) i w przeliczeniu
    maks = hd.ustawienia(g.dane)["handel"]["maks_ogloszen"]
    assert naruszenia(g.dane, s.firmy["A"], {"handel_wystaw": [_towar(100)] * (maks + 1)}, 3)
    assert not naruszenia(g.dane, s.firmy["A"], {"handel_wystaw": [_towar(100)] * maks}, 3)


def test_przed_odblokowaniem():
    g = _gra()
    s = _przygotuj(g, [_towar(900)])
    h = s.wyniki[2]["A"]["handel"]
    assert not h["wystawione"] and "od rundy 5" in h["odrzucone"][0]["powod"] and not s.firmy["A"].ogloszenia


def test_licytacja_przebicie_i_kontrola_zapisu():
    g = _gra_handlu()
    _przygotuj(g, [_towar(900), _rozen(4000)])
    assert _zapis(g, "A", {"handel_licytuj": {TOWAR: 1000}}) == ["Nie można licytować własnego ogłoszenia."]
    assert "co najmniej 900,00 zł" in _zapis(g, "B", {"handel_licytuj": {TOWAR: 800}})[0]
    assert _zapis(g, "B", {"handel_licytuj": {"9-X-1": 800}}) == ["To ogłoszenie nie jest już licytowane."]
    assert _zapis(g, "B", {"handel_licytuj": {TOWAR: 950}}) == []
    g.ustaw_decyzje("B", {"handel_licytuj": {TOWAR: 950}})
    # przebicie o krok: 950 × 1,03 = 978,50
    blad = _zapis(g, "C", {"handel_licytuj": {TOWAR: 970}})
    assert "co najmniej 978,50 zł" in blad[0] and "B prowadzi: 950,00 zł" in blad[0]
    assert _zapis(g, "C", {"handel_licytuj": {TOWAR: 978.5}}) == []
    g.ustaw_decyzje("C", {"handel_licytuj": {TOWAR: 978.5}})
    # złożonej oferty nie można obniżyć ani wycofać
    assert "nie można obniżyć" in _zapis(g, "B", {"handel_licytuj": {TOWAR: 940}})[0]
    assert "nie można wycofać" in _zapis(g, "B", {"handel_licytuj": {}})[0]
    assert _zapis(g, "B", {"handel_licytuj": {TOWAR: 950}, "cena": 1}) == []   # inne pola – bez kontroli
    # widok: prowadzący i minimalna oferta dla każdej drużyny
    from api.prezentacja import widok
    vb = {o["id"]: o for o in widok(g, "B")["handel"]["ogloszenia"]}
    assert vb[TOWAR]["prowadzi_nazwa"] == "C" and vb[TOWAR]["cena"] == 978.5 and not vb[TOWAR]["ja_prowadze"]
    assert vb[TOWAR]["moja_oferta"] == 950 and vb[TOWAR]["minimum"] == 1007.86 and vb[TOWAR]["licytujacych"] == 2
    va = {o["id"]: o for o in widok(g, "A")["handel"]["ogloszenia"]}
    assert va[TOWAR]["moje"] and va["2-A-2"]["prowadzi"] is None and va["2-A-2"]["minimum"] == 4000


def test_rozstrzygniecie_kpir_i_partie():
    """Najwyższa oferta kupuje po swojej cenie; obie strony mają fakturę w KPiR, kupujący – partie z terminem."""
    g = _gra_handlu()
    s = _przygotuj(g, [_towar(900), _rozen(4000)])
    termin = min(p.termin for p in s.firmy["A"].partie if p.zasob == "Hummus")
    hummus_a = s.firmy["A"].magazyn["Hummus|2"]
    # partie u kupującego (na kopii – w przeliczeniu C bez chłodni by je stracił w tygodniu)
    f = copy.deepcopy(s.firmy)
    hd.rozstrzygnij(g.dane, f, {"C": {"handel_licytuj": {TOWAR: 978.5}}}, 3, {}, {}, 1)
    partie = [p for p in f["C"].partie if p.zasob == "Hummus"]
    assert {p.termin for p in partie} == {termin} and partie[0].dostawa == g.dane.data_rundy(3).isoformat()
    assert sum(p.wartosc_gr for p in partie) == 97850 and partie[0].dostawca == "Giełda: A"
    assert f["C"].magazyn["Hummus|2"] == 20 and f["A"].magazyn["Hummus|2"] == hummus_a - 20
    s = _runda(g, B={"handel_licytuj": {TOWAR: 950, "2-A-2": 4000}}, C={"handel_licytuj": {TOWAR: 978.5}})
    ha, hb, hc = (s.wyniki[3][n]["handel"] for n in "ABC")
    assert [(t["strona"], t["cena"], t["z_kim"]) for t in ha["transakcje"]] == [("sprzedaz", 978.5, "C"),
                                                                                 ("sprzedaz", 4000, "B")]
    assert hc["transakcje"][0]["strona"] == "zakup" and hb["transakcje"][0]["typ"] == "sprzet"
    assert hb["przegrane"] == [{"id": TOWAR, "co": "Hummus 2★ × 20 opak.", "oferta": 950, "cena": 978.5,
                                "zwyciezca": "C"}]
    kpir = {n: [p["opis"] for p in s.wyniki[3][n]["kpir"]["pozycje"]] for n in "ABC"}
    assert f"{hd.SPRZEDAZ_TOWAROW} – C: Hummus" in kpir["A"]
    assert "Zakup towarów na giełdzie od A: Hummus" in kpir["C"]
    assert any(o.startswith("Sprzedaż sprzętu na giełdzie: Rożen") for o in kpir["A"])
    assert all(s.wyniki[3][n]["uzgodnienie"]["roznica"] == 0 for n in "ABC")
    assert "Rożen" not in s.firmy["A"].stanowisko("kuchnia", 2).sprzet
    assert s.firmy["B"].stanowisko("kuchnia", 1).sprzet.get("Rożen") == 2
    # ogłoszenia rozstrzygnięte – znikają; nowych nie ma
    assert not s.firmy["A"].ogloszenia
    # dokument w biurze rachunkowym: sprzedaż towaru na giełdzie to faktura sprzedaży, sprzedaż dań – raport kasy
    f, ks, rach = Firma(nazwa="X"), Ksiega(vat=rz.reguly_vat(g.dane)), Rachunek()
    ksieguj(f, ks, rach, f"{hd.SPRZEDAZ_TOWAROW} – B: Hummus", 900, "przychod", stawka=0.05)
    ksieguj(f, ks, rach, "Sprzedaż: Kebab", 900, "przychod", stawka=0.08)
    assert [d["typ"] for d in biuro.dokumenty(ks, rach)] == ["Faktura sprzedaży", "Raport kasy fiskalnej"]


def test_brak_towaru_u_sprzedawcy_i_pieniedzy_u_kupujacego():
    g = _gra_handlu()
    s = _przygotuj(g, [_towar(900)])
    oferty = {"B": {"handel_licytuj": {TOWAR: 1000}}, "C": {"handel_licytuj": {TOWAR: 950}}}
    # sprzedawca nie ma już towaru – ogłoszenie przepada, nikt nie kupuje
    f = copy.deepcopy(s.firmy)
    f["A"].magazyn["Hummus|2"] = 5
    w = hd.rozstrzygnij(g.dane, f, oferty, 3, {}, {}, 1)
    assert not any(w[n]["transakcje"] for n in "ABC") and w["A"]["wygasle"]
    assert w["B"]["nieudane"][0]["powod"] == "A: nie ma już tyle towaru" and not w["C"]["nieudane"]
    # kupujący bez pieniędzy – kupuje następny w kolejce po swojej cenie
    f = copy.deepcopy(s.firmy)
    f["B"].gotowka_gr = 0
    w = hd.rozstrzygnij(g.dane, f, oferty, 3, {}, {}, 1)
    assert w["B"]["nieudane"][0]["powod"] == "B: na koncie zabrakło 1 000,00 zł"
    assert w["C"]["transakcje"][0]["cena"] == 950 and f["C"].magazyn["Hummus|2"] == 20
    assert any(b["poziom"] == "czerwony" for b in hd.bledy(w["B"]))
    # bez ofert – ogłoszenie wygasa
    w = hd.rozstrzygnij(g.dane, copy.deepcopy(s.firmy), {}, 3, {}, {}, 1)
    assert w["A"]["wygasle"] == [{"id": TOWAR, "co": "Hummus 2★ × 20 opak.", "cena_min": 900}]


def test_licytacja_z_limitem_bota():
    """Bot stoi na najniższej cenie, która przebija resztę (najwyżej limit); przy remisie wygrywa drużyna."""
    o = Ogloszenie(id="1-A-1", typ="towar", cena_min_gr=50000, wartosc_gr=100000, runda=1, limity={"Bot": 80000})
    k = 0.03
    assert hd.licytacja(o, {}, k) == {"kto": "Bot", "bot": True, "cena_gr": 50000}
    assert hd.licytacja(o, {"B": 60000}, k) == {"kto": "Bot", "bot": True, "cena_gr": 61800}
    assert hd.licytacja(o, {"B": 79000}, k)["cena_gr"] == 80000   # przebicie ponad limit – najwyżej limit
    assert hd.licytacja(o, {"B": 80000}, k)["kto"] == "B"          # remis – drużyna przed botem
    assert hd.licytacja(o, {"B": 90000}, k) == {"kto": "B", "bot": False, "cena_gr": 90000}
    assert hd.minimum(o, {"B": 60000}, k, "B") == 51500             # B przebija bota stojącego na 500 zł
    assert hd.licytacja(o, {"B": 40000}, k, {"Bot"}) is None         # poniżej ceny wywoławczej


def _bot(nazwa="Bot", **pola):
    return Firma(nazwa=nazwa, bot="zrownowazony", gotowka_gr=10_000_000, **pola)


def test_boty_wystawiaja_nadwyzki():
    dane = dane_domyslne()
    b = hd.ustawienia(dane)["boty"]
    bot = _bot(oferta={"falafel": 20}, magazyn={"Hummus|2": 10.0, "Mięso kebab|2": 30.0, "Sos|2": 0.5},
               wartosc_magazynu_gr={"Hummus|2": 44000, "Mięso kebab|2": 900000, "Sos|2": 3000})
    info = hd.wystaw(dane, {"Bot": bot}, "Bot", {}, 5, {"Hummus|2": 2.0})
    # mięsa nie używa w falafelu – całe; hummusu zostawia zapas_tygodni × zużycie; sos – poniżej min_wartosc
    assert [(o.zasob, o.ilosc) for o in bot.ogloszenia] == [("Mięso kebab", 30), ("Hummus", 10 - 3)]
    assert bot.ogloszenia[0].cena_min == round(b["cena_min"] * 9000, 2) and not info["odrzucone"]
    assert hd.wystaw(dane, {"Bot": bot}, "Bot", {}, 4, {"Hummus|2": 2.0})["wystawione"] == []   # przed od_rundy


def test_boty_licytuja_z_limitem():
    dane = dane_domyslne()
    b = hd.ustawienia(dane)["boty"]
    a = Firma(nazwa="A", partie=[Partia(zasob="Hummus", jakosc=q, ilosc=20, wartosc_gr=gr, dostawa="2025-09-01")
                                 for q, gr in ((2, 88000), (1, 70000))])
    sw.uzgodnij(a)
    bot, inny = _bot(oferta={"falafel": 20}), _bot("Kebab", oferta={"kebab_w_bulce": 20})
    firmy = {"A": a, "Bot": bot, "Kebab": inny}
    hd.wystaw(dane, firmy, "A", {"handel_wystaw": [_towar(500), {**_towar(400), "jakosc": 1}]}, 5)
    konf = {"firmy": [{"nazwa": "Bot", "bot": "zrownowazony", "poziom": "latwy"}]}
    hd._limity_botow(dane, firmy, 5, konf, {"Bot": {"Hummus|2": 20.0}, "Kebab": {}})
    poziom = dane.boty["poziomy"]["latwy"].get("limit_handlu") or b["limit_handlu"]
    # tylko swoja jakość, tylko bot, który używa hummusu
    assert a.ogloszenia[0].limity == {"Bot": round(poziom * 88000)} and a.ogloszenia[1].limity == {}
    # zapas: z pełnym magazynem nie licytuje; bez pieniędzy ponad rezerwę – też nie
    a.ogloszenia[0].limity = {}
    bot.magazyn["Hummus|2"] = 25.0
    hd._limity_botow(dane, firmy, 5, konf, {"Bot": {"Hummus|2": 20.0}})
    assert a.ogloszenia[0].limity == {}
    bot.magazyn["Hummus|2"], bot.gotowka_gr = 0.0, round(b["rezerwa_gotowki"] * 100)
    hd._limity_botow(dane, firmy, 5, konf, {"Bot": {"Hummus|2": 20.0}})
    assert a.ogloszenia[0].limity == {}
    # bot wygrywa licytację bez ofert drużyn po cenie wywoławczej
    bot.gotowka_gr = 10_000_000
    hd._limity_botow(dane, firmy, 5, konf, {"Bot": {"Hummus|2": 20.0}})
    w = hd.rozstrzygnij(dane, firmy, {}, 6, {}, {}, 1)
    assert w["Bot"]["transakcje"][0]["cena"] == 500 and bot.magazyn["Hummus|2"] == 20
    assert w["A"]["transakcje"][0]["z_kim"] == "Bot"


def test_gra_z_botami_bez_bledow():
    g = _gra_handlu(("A", None), ("Bot1", "zrownowazony"), ("Bot2", "tani"))
    for _ in range(4):
        s = g.przelicz(wymus=True)
    assert all(s.wyniki[4][n]["uzgodnienie"]["roznica"] == 0 for n in s.firmy)


def test_widok_i_podglad():
    from api.prezentacja import stan_po_szkicu, widok
    g = _gra_handlu()
    _przygotuj(g, [_towar(900), _rozen(4000)])
    v = widok(g, "B")["handel"]
    assert v["otwarty"] and [o["co"] for o in v["ogloszenia"]] == ["Hummus 2★ × 20 opak.", "Rożen 2★ (kuchnia 2)"]
    assert v["limity"]["krok_przebicia"] == hd.ustawienia(g.dane)["handel"]["krok_przebicia"]
    va = widok(g, "A")["handel"]
    assert va["towary"][0]["zasob"] == "Hummus" and va["towary"][0]["wartosc"] > 0
    assert any(x["nazwa"] == "Rożen" and x["nr"] == 2 for x in va["sprzet"])
    # zapowiedzi: szkic ogłoszenia A widać u B od razu (licytacja – w następnej rundzie)
    g.ustaw_decyzje("A", {"handel_wystaw": [_towar(800)]})
    assert widok(g, "B")["handel"]["zapowiedzi"][0]["od_nazwa"] == "A"
    # podgląd: licytacja wg obecnych ofert – na kopii stanu
    g.ustaw_decyzje("B", {"handel_licytuj": {TOWAR: 950}})
    _, f, _, info, _ = stan_po_szkicu(g, "B")
    assert f.magazyn["Hummus|2"] == 20 and info["handel"]["transakcje"][0]["strona"] == "zakup"
    assert g.stan(2).firmy["B"].magazyn.get("Hummus|2", 0) == 0
    assert widok(g, "B")["handel"]["decyzja"]["transakcje"]
    _runda(g)
    v = widok(g, "B")["handel"]
    assert v["historia"][0]["co"] == "Hummus 2★ × 20 opak." and v["historia"][0]["runda"] == 3
