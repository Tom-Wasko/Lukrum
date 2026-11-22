// Warunki odhaczenia zadań zeszytu wujka (dane/zeszyt.yaml: warunki). Nazwa warunku z danych → funkcja (v, parametr) → bool.
// Jedno miejsce z implementacją; test (testy/aplikacja/test_zeszyt.py) pilnuje, że każda nazwa z danych jest tutaj.
// Warunki „stan” czytają v.stan po roboczych decyzjach, „decyzja” – v.decyzje, „wizyta” – v.zeszyt.wizyty (zapisuje serwer).
const dlugosc = (x) => (Array.isArray(x) ? x.length : x && typeof x === "object" ? Object.keys(x).length : 0);
const uwagi = (v) => Object.values(v.stan.gotowe_uslugi || {}).flat();
const maUwage = (v, tekst) => uwagi(v).some((b) => b.includes(tekst));
const typ = (v, t) => (v.stan.stanowiska || []).some((s) => s.typ === t);

// --- warunki „zmiana”: decyzja tego tygodnia różni się od poprzedniej (v.stan po decyzjach roboczych kontra v.stan_przed) ---
const przed = (v) => v.stan_przed || {};
const jakoZbior = (x) => Object.keys(x || {}).sort().join("|");
const cenyZmienione = (v) => Object.entries(v.stan.ceny || {}).some(([d, c]) => przed(v).ceny?.[d] && JSON.stringify(przed(v).ceny[d]) !== JSON.stringify(c));
const menuZmienione = (v) => jakoZbior(v.stan.oferta) !== jakoZbior(przed(v).oferta);
const osoba = (p) => `${p.pensja ?? p.pensja_gr}|${p.umowa}`;
const mapaOsob = (l) => Object.fromEntries((l || []).map((p) => [p.id, p]));
const zespolZmieniony = (v) => {
  const a = mapaOsob(przed(v).pracownicy), b = mapaOsob(v.stan.pracownicy);
  return jakoZbior(a) !== jakoZbior(b) || Object.keys(b).some((id) => osoba(a[id]) !== osoba(b[id]));
};
const sumaZamowien = (z) => (z || []).reduce((s, x) => s + (Number(x.ilosc) || 0), 0);
const dlugPrzed = (v) => (przed(v).kredyty || []).length > 0 || przed(v).debet > 0 || !!przed(v).harpagon;
const reszta = (k) => k.pozostalo ?? k.pozostalo_gr ?? 0;
const dlugSplacony = (v) => (v.decyzje?.kredyty_splac || []).length > 0 || v.decyzje?.harpagon_splac > 0 || v.stan.debet < (przed(v).debet || 0)
  || (v.stan.kredyty || []).reduce((s, k) => s + reszta(k), 0) < (przed(v).kredyty || []).reduce((s, k) => s + reszta(k), 0);
const RANGA_PAKIETU = { S: 1, M: 2, L: 3 };
const nizszaPensja = (v) => { const a = mapaOsob(przed(v).pracownicy); return (v.stan.pracownicy || []).some((p) => a[p.id] && (p.pensja ?? p.pensja_gr) < (a[p.id].pensja ?? a[p.id].pensja_gr)); };

export const WARUNKI = {
  ma_lokal: (v) => dlugosc(v.stan.lokale) > 0,
  ma_bank: (v) => !!v.stan.bank,
  ma_biuro: (v) => !!v.stan.biuro,
  ma_menu: (v) => dlugosc(v.stan.oferta) > 0,
  ma_stanowiska: (v) => typ(v, "kuchnia") && typ(v, "kasa"),
  ma_sprzet: (v) => dlugosc(v.stan.oferta) > 0 && !maUwage(v, "stanowiska z pracownikiem"),
  ma_ludzi: (v) => dlugosc(v.stan.pracownicy) > 0,
  obsada_pelna: (v) => dlugosc(v.stan.oferta) > 0 && !maUwage(v, "obsadzonego stanowiska"),
  towar_jest: (v) => dlugosc(v.stan.oferta) > 0 && !maUwage(v, "brak składnika"),
  ceny_ustawione: (v) => dlugosc(v.stan.oferta) > 0 && !maUwage(v, "włączone do sprzedaży"),
  promocja_wlaczona: (v) => dlugosc(v.stan.promocje) > 0,
  ma_polise: (v) => dlugosc(v.stan.polisy) > 0,
  ma_wyposazenie: (v) => dlugosc(v.stan.wyposazenie) > 0
    || (v.stan.lokale || []).some((l) => dlugosc(l.wyposazenie) > 0 || Object.values(l.dekor_kupiony || {}).some((x) => dlugosc(x) > 0)),
  ma_udogodnienie: (v) => dlugosc(v.stan.udogodnienia) > 0,
  kampania_trwa: (v, agencja) => {
    const k = v.stan.kampanie || [];
    if (!agencja) return k.length > 0;
    if (agencja === "internet") return dlugosc(v.stan.internet) > 0 || k.some((x) => (v.zeszyt?.agencje_internetowe || []).includes(x.agencja));
    return k.some((x) => x.agencja === agencja);
  },
  ma_lokate: (v) => dlugosc(v.stan.lokaty) > 0,
  szkolenie_trwa: (v) => dlugosc(v.stan.szkolenia) > 0,
  danie_specjalne: (v) => Object.keys(v.stan.oferta || {}).some((d) => (v.zeszyt?.specjalne || []).includes(d)),
  bez_drogiego_dlugu: (v) => !v.stan.harpagon && !(v.stan.debet > 0),
  zamowienie_u: (v, dostawca) => (v.decyzje?.zamowienia || []).some((z) => z.dostawca === dostawca),
  higiena_wybrana: (v) => !!(v.stan.higiena || v.decyzje?.higiena),
  wizyta: (v, miejsce) => (v.zeszyt?.wizyty || []).includes(miejsce),
  wyslane: (v) => !!v.wyslane,
  zmiana_po_tabeli: (v) => cenyZmienione(v) || menuZmienione(v) || zespolZmieniony(v),
  zmiana_ceny: (v) => cenyZmienione(v),
  zmiana_dania: (v) => cenyZmienione(v) || menuZmienione(v),
  wiecej_towaru: (v) => { const t = sumaZamowien(v.decyzje?.zamowienia); return t > 0 && t > (v.zeszyt?.poprzednie_zamowienia || 0); },
  mniej_towaru: (v) => { const p = v.zeszyt?.poprzednie_zamowienia || 0, t = sumaZamowien(v.decyzje?.zamowienia); return p > 0 && t > 0 && t < p; },
  splata_dlugu: (v) => !dlugPrzed(v) || dlugSplacony(v),
  zmiana_umowy: (v) => Object.keys(v.decyzje?.zmiany || {}).length > 0 || (v.decyzje?.przenosiny || []).length > 0,
  detektyw_i_cena: (v) => !!v.decyzje?.detektyw && cenyZmienione(v),
  nizszy_koszt_staly: (v) => (RANGA_PAKIETU[v.decyzje?.pakiet || v.stan.pakiet_biura] || 0) < (RANGA_PAKIETU[przed(v).pakiet_nastepny?.pakiet || przed(v).pakiet_biura] || 0) || nizszaPensja(v)
    || (v.stan.pracownicy || []).length < (przed(v).pracownicy || []).length || (przed(v).kredyty || []).length > (v.stan.kredyty || []).length,
};

// czy zadanie z v.zeszyt.zadania jest zrobione (warunek { nazwa, parametr })
export function spelniony(v, zadanie) {
  const f = WARUNKI[zadanie.warunek?.nazwa];
  return f ? !!f(v, zadanie.warunek.parametr) : false;
}
