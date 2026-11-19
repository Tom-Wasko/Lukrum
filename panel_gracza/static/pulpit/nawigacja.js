// Nawigacja pulpitu (seria pulpit, krok 3): jedno miejsce, które mówi, DOKĄD prowadzi klik z zeszytu, wydarzeń i kategorii.
// Zasada: klik prowadzi od razu do celu (wnętrze konkretnego budynku, konkretny ekran), a nie do pośredniego wyboru.
//  - pokazNaMapie: przelot mapy do budynku/dzielnicy i pulsowanie znaku (to samo robi filtr kategorii),
//  - wejdzDoKroku: krok z listy wujka → wnętrze właściwego budynku (z teczką ekranu, gdy krok nie ma budynku na mapie),
//  - historia i „← Wróć”: powrót do poprzedniego widoku albo mapy (przycisk w stałym miejscu i Esc).
import { aktualneMiejsce, aktualneQ, idzDoMiejsca, otworzBudynek } from "../swiat/swiat.js";
import { BUDYNEK_KROKU } from "../zakladki/wujek.js";
import { nowaMapa } from "../mapa/lublin.js";

let puls = null, pulsCzas = 0;
const bezRuchu = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function oznacz(zn) {
  puls?.classList.remove("pp-puls");
  puls = zn;
  zn.classList.add("pp-puls");
  clearTimeout(pulsCzas);
  pulsCzas = setTimeout(() => { zn.classList.remove("pp-puls"); if (puls === zn) puls = null; }, bezRuchu() ? 9000 : 7000);
}

/** Przeleć mapą do budynku (id albo lista id, np. wszystkie żetony sceny) i oznacz go. Przechodzi na mapę, jeśli trzeba. */
export function pokazNaMapie(c, id, { dzielnica = null } = {}) {
  const kandydaci = [].concat(id || []).flatMap((x) => [x, c.kat?.mapa?.budynki?.find((b) => b.id === x)?.zespol]).filter(Boolean);
  const szukaj = (proby) => {
    if (dzielnica) { if (nowaMapa.pokazDzielnice(dzielnica)) return; } else {
      for (const k of kandydaci) { const zn = nowaMapa.pokazZnak(k); if (zn) return oznacz(zn); }
    }
    if (proby > 0) setTimeout(() => szukaj(proby - 1), 90);
  };
  if (c.zakladka !== "mapa") c.idz("mapa");
  setTimeout(() => szukaj(12), 60);
}

// kroki z listy wujka bez własnego budynku na mapie: wnętrze, w którym się je robi, i od razu teczka z ekranem
// (decyzja 16.11: menu i sprzedaż w kebabie, stanowiska w stolarni Parku handlowego, zatrudnianie w Miasteczku)
const BANKI = [["kmicic", "kmicic"], ["wokulski", "wokulski"], ["ziemia", "ziemia"], ["rzecki", "rzecki"], ["soplicowo", "soplicowo"], ["solaris", "solaris"]];
const WNETRZE_KROKU = { oferta: "kebab", sprzedaz: "kebab", stanowiska: "stolarnia", zatrudnienie: "agencja_pracy" };

/** Krok z listy wujka: od razu wnętrze budynku (dostawcy → konkretna hurtownia) albo wnętrze z teczką ekranu. Zwraca true, gdy obsłużony. */
export function wejdzDoKroku(c, klucz) {
  if (klucz === "wyslij") return false;   // okno wysyłki obsługuje pulpit.js
  if (WNETRZE_KROKU[klucz]) {
    if (idzDoMiejsca(c, WNETRZE_KROKU[klucz])) c.teczka(klucz); else c.idz(klucz);
    return true;
  }
  if (klucz === "bank") {   // drużyna ma już bank: od razu jego sala operacyjna, bez wyboru banku w pierzei
    const nazwa = String(c.v.stan?.bank || "").toLowerCase(), id = BANKI.find(([k]) => nazwa.includes(k))?.[1];
    if (id && idzDoMiejsca(c, "bank", `b=${id}`)) return true;
  }
  const b = BUDYNEK_KROKU[klucz];
  if (b && otworzBudynek(c, b)) return true;
  c.idz(klucz);
  return true;
}

// --- historia widoków i „← Wróć” ------------------------------------------------------------------------------------------
const H = { stos: [], teraz: null, cofanie: false };
const widok = (c) => (c.zakladka === "miejsce" ? { z: "miejsce", id: aktualneMiejsce(), q: aktualneQ() } : { z: c.zakladka });
const klucz = (w) => (w.z === "miejsce" ? `miejsce/${w.id}?${w.q || ""}` : w.z);

/** Wołane po każdym przerysowaniu: zapamiętuje, skąd gracz przyszedł (mapa czyści historię). */
export function zapamietajWidok(c) {
  const w = widok(c);
  if (H.teraz && klucz(H.teraz) !== klucz(w) && !H.cofanie) H.stos.push(H.teraz);
  H.cofanie = false;
  H.teraz = w;
  if (w.z === "mapa") H.stos = [];
  if (H.stos.length > 20) H.stos.shift();
}

export const mozeWrocic = (c) => c.zakladka !== "mapa";
export const dokadWroc = () => {
  const p = H.stos[H.stos.length - 1];
  return p && p.z !== "mapa" ? (p.z === "miejsce" ? "poprzednie miejsce" : "poprzedni ekran") : "mapa";
};

/** „← Wróć”: do poprzedniego widoku, a gdy go nie ma – na mapę. */
export function wroc(c) {
  const p = H.stos.pop();
  H.cofanie = true;
  if (!p || p.z === "mapa") { c.idz("mapa"); return; }
  if (p.z === "miejsce") idzDoMiejsca(c, p.id, p.q); else c.idz(p.z);
}
