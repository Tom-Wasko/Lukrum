// Warunki odhaczenia zadań zeszytu wujka (dane/zeszyt.yaml: warunki). Nazwa warunku z danych → funkcja (v, parametr) → bool.
// Jedno miejsce z implementacją; test (testy/aplikacja/test_zeszyt.py) pilnuje, że każda nazwa z danych jest tutaj.
// Warunki „stan” czytają v.stan po roboczych decyzjach, „decyzja” – v.decyzje, „wizyta” – v.zeszyt.wizyty (zapisuje serwer).
const dlugosc = (x) => (Array.isArray(x) ? x.length : x && typeof x === "object" ? Object.keys(x).length : 0);
const uwagi = (v) => Object.values(v.stan.gotowe_uslugi || {}).flat();
const maUwage = (v, tekst) => uwagi(v).some((b) => b.includes(tekst));
const typ = (v, t) => (v.stan.stanowiska || []).some((s) => s.typ === t);

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
};

// czy zadanie z v.zeszyt.zadania jest zrobione (warunek { nazwa, parametr })
export function spelniony(v, zadanie) {
  const f = WARUNKI[zadanie.warunek?.nazwa];
  return f ? !!f(v, zadanie.warunek.parametr) : false;
}
