// UF21: formy zatrudnienia z katalogu (kat.parametry.formy, silnik/ludzie/formy.py: widok) – nazwy, składki ZUS
// pracodawcy, koszt osoby, płaca minimalna, które formy może dostać kandydat i podpowiedź pod wyborem.
// Bez danych UF21 (stary katalog) – dwie dawne formy: umowa o pracę i zlecenie.
import { esc, licz, proc, zl } from "./wspolne.js";

export function formy(kat) {
  const P = kat.parametry || {};
  return P.formy || {
    prace: { nazwa: "Umowa o pracę", opis: "", etat: 1, zus: "etat", zus_stawka: P.zus || 0, wypowiedzenie: true, oczekiwana: 1, placa_minimalna: true },
    zlecenie: { nazwa: "Umowa zlecenie", opis: "", etat: 1, zus: "zlecenie", zus_stawka: P.zus_zlecenie || 0, wypowiedzenie: false, oczekiwana: 1, placa_minimalna: true },
  };
}

export const forma = (kat, u) => formy(kat)[u] || formy(kat).prace;
export const nazwaFormy = (kat, u) => formy(kat)[u]?.nazwa ?? esc(u);
const studenci = (kat, student) => (student && kat.parametry?.studenci) || null;

// składki ZUS pracodawcy od pensji (student na zleceniu – bez składek)
export function stawkaZus(kat, u, student) {
  const f = forma(kat, u);
  return f.zus === "brak" || (f.zus === "zlecenie" && student) ? 0 : f.zus_stawka || 0;
}

// miesięczny koszt osoby dla firmy: pensja z ZUS pracodawcy; B2B – faktura netto (VAT wraca w rozliczeniu)
export const kosztMiesieczny = (kat, p) => p.pensja * (1 + stawkaZus(kat, p.umowa, p.student));

export function minimum(kat, u, student) {
  const f = forma(kat, u), s = studenci(kat, student);
  return f.placa_minimalna ? kat.placa_minimalna * f.etat * (s ? s.godziny : 1) : 0;
}

// pensja, przy której osoba jest zadowolona z płacy (staż – null: stypendium z urzędu)
export function oczekiwana(kat, k, u) {
  const f = forma(kat, u), s = studenci(kat, k.student);
  return f.oczekiwana ? Math.round(k.pensja_preferowana * f.oczekiwana * (s ? s.pensja : 1) / 10) * 10 : null;
}

// kalibracja B9: najniższa pensja, którą kandydat przyjmie (kat.parametry.oferta_pracy; bez danych albo staż – 0)
export function progOferty(kat, k, u) {
  const of = kat.parametry?.oferta_pracy, f = forma(kat, u), s = studenci(kat, k.student);
  return of && f.oczekiwana ? Math.ceil(of.prog_odrzucenia * k.pensja_preferowana * f.oczekiwana * (s ? s.pensja : 1) - 1e-6) : 0;
}

// formy dostępne dla kandydata/pracownika: włączone w grze (opcja MG), „tylko dla studentów”, staż – bez doświadczenia
export function dlaOsoby(v, kat, k, { nowy = true } = {}) {
  const wlaczone = v.gra?.formy_zatrudnienia;
  return Object.entries(formy(kat)).filter(([u, f]) => (!wlaczone || wlaczone.includes(u))
    && (!f.tylko_studenci || k.student) && (!f.staz || (nowy && k.gwiazdki <= f.staz.max_gwiazdek)));
}

export function opcjeForm(v, kat, k, wybrana, opcje) {
  const lista = dlaOsoby(v, kat, k, opcje);
  if (wybrana && !lista.some(([u]) => u === wybrana)) lista.unshift([wybrana, forma(kat, wybrana)]);   // obecna forma osoby
  return lista.map(([u, f]) => {
    const z = stawkaZus(kat, u, k.student);
    return `<option value="${u}" ${u === wybrana ? "selected" : ""}>${esc(f.nazwa)}${z ? ` (+${proc(z, 0)} ZUS)` : ""}</option>`;
  }).join("");
}

export function opisFormy(kat, u, k, { kandydat = false } = {}) {
  const f = forma(kat, u), s = studenci(kat, k.student), o = oczekiwana(kat, k, u), prog = kandydat ? progOferty(kat, k, u) : 0;
  const zdanie = (t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/\.?$/, ".");
  const czesci = [f.opis ? esc(zdanie(f.opis)) : ""];
  if (f.staz) czesci.push(`Stypendium ${zl(f.staz.stypendium)} płaci urząd pracy przez ${f.staz.rund} tyg., potem umowa o pracę.`);
  else if (o != null) czesci.push(`Zadowolona z płacy od ok. ${zl(o)}${minimum(kat, u, k.student) ? `, minimum ${zl(minimum(kat, u, k.student))}` : ", bez płacy minimalnej"}.`);
  if (prog) czesci.push(`Ofertę niższą niż ${zl(prog)} (${proc(kat.parametry.oferta_pracy.prog_odrzucenia, 0)} oczekiwanej) odrzuci, a każda pensja poniżej oczekiwanej obniża zadowolenie.`);
  if (s) czesci.push(opisStudenta(kat, k));
  return czesci.filter(Boolean).join(" ");
}

// skutki zatrudnienia studenta – wszystkie liczby z danych (zalozenia.yaml: pracownicy.studenci)
export function opisStudenta(kat, k) {
  const s = studenci(kat, true);
  if (!s) return "";
  const zlecenie = formy(kat).zlecenie;
  return `Student (do ${s.wiek_do} lat): nie płaci PIT, więc wystarcza mu niższa pensja (${proc(s.pensja, 0)} preferowanej)`
    + `${zlecenie ? "; na zleceniu bez składek ZUS" : ""}; pracuje ${proc(s.godziny, 0)} zwykłych godzin; `
    + `częściej odchodzi (szansa odejścia ×${licz(s.odejscia, 1)}).`;
}

export const pigulkaStudenta = (k, kat) => !k.student ? ""
  : kat && studenci(kat, true) ? ` <span class="pigulka inf ma-dymek" tabindex="0">student<span class="dymek-tresc">${esc(opisStudenta(kat, k))}</span></span>`
    : ' <span class="pigulka inf">student</span>';
