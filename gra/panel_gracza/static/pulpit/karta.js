// Karta miejsca na mapie (seria pulpit, krok 2): zamiast surowego okna – czytelna karta w kolorach palety:
// rodzaj, tytuł, adres, krótki opis i przyciski („Wejdź”, gdy miejsce ma wnętrze). Esc, ✕ albo klik poza kartą zamyka.
// Wygląd: pulpit.css (klasy pk-*), kolory tylko ze zmiennych palet.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
import { stylEkranu } from "./karty-style.js";
let poprzedni = null;

export function zamknijKarte() {
  const t = document.getElementById("pk");
  if (!t) return;
  t.remove();
  document.removeEventListener("keydown", naKlawisz, true);
  if (poprzedni?.isConnected) poprzedni.focus({ preventScroll: true });
  poprzedni = null;
}
function naKlawisz(e) {
  if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); zamknijKarte(); }
}

/** opcje: { rodzaj, tytul, adres, opis, uwaga, wejdz: { napis, akcja() } } – teksty zwykłe (są zabezpieczane przed HTML). */
export function pokazKarte({ rodzaj = "", tytul, adres = "", opis = "", uwaga = "", wejdz = null }) {
  zamknijKarte();
  poprzedni = document.activeElement;
  const t = document.createElement("div");
  t.id = "pk";
  t.className = "pk-tlo";
  // wspólna budowa kart (karty.css): nagłówek `.og` (okruszek, tytuł, ✕), treść `.ot`, stopka akcji `.ost`
  t.innerHTML = `<div class="pk szk karta--s${stylEkranu("karta_miejsca")}" data-styl="${stylEkranu("karta_miejsca")}" data-nr="LUK/MAPA" role="dialog" aria-modal="true" aria-labelledby="pk-tytul">
    <div class="og"><span class="og-t"><small class="k-ok">Lublin${rodzaj ? ` › ${esc(rodzaj)}` : ""}</small><strong class="k-tyt" id="pk-tytul">${esc(tytul)}</strong></span>
      <span class="og-prawa"><button type="button" class="x pk-x" aria-label="Zamknij kartę">✕</button></span></div>
    <div class="ot">${adres ? `<p class="pk-adres">${esc(adres)}</p>` : ""}${opis ? `<p class="pk-opis">${esc(opis)}</p>` : ""}${uwaga ? `<p class="pk-uwaga">${esc(uwaga)}</p>` : ""}</div>
    <div class="ost pk-przyciski">${wejdz ? `<button type="button" class="pk-wejdz">${esc(wejdz.napis || "Wejdź")} →</button>` : ""}<button type="button" class="pk-zamknij">Zamknij</button></div></div>`;
  t.addEventListener("click", (e) => { if (e.target === t || e.target.closest(".pk-x, .pk-zamknij")) zamknijKarte(); });
  t.querySelector(".pk-wejdz")?.addEventListener("click", () => { zamknijKarte(); wejdz.akcja(); });
  document.body.appendChild(t);
  document.addEventListener("keydown", naKlawisz, true);
  (t.querySelector(".pk-wejdz") || t.querySelector(".pk-zamknij")).focus({ preventScroll: true });
}
