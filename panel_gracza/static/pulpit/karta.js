// Karta miejsca na mapie (seria pulpit, krok 2): zamiast surowego okna – czytelna karta w kolorach palety:
// rodzaj, tytuł, adres, krótki opis i przyciski („Wejdź”, gdy miejsce ma wnętrze). Esc, ✕ albo klik poza kartą zamyka.
// Wygląd: pulpit.css (klasy pk-*), kolory tylko ze zmiennych palet.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
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
  t.innerHTML = `<div class="pk" role="dialog" aria-modal="true" aria-labelledby="pk-tytul">
    <button type="button" class="pk-x" aria-label="Zamknij kartę">✕</button>
    ${rodzaj ? `<p class="pk-rodzaj">${esc(rodzaj)}</p>` : ""}<h2 id="pk-tytul">${esc(tytul)}</h2>
    ${adres ? `<p class="pk-adres">${esc(adres)}</p>` : ""}${opis ? `<p class="pk-opis">${esc(opis)}</p>` : ""}${uwaga ? `<p class="pk-uwaga">${esc(uwaga)}</p>` : ""}
    <div class="pk-przyciski">${wejdz ? `<button type="button" class="pk-wejdz">${esc(wejdz.napis || "Wejdź")} →</button>` : ""}<button type="button" class="pk-zamknij">Zamknij</button></div></div>`;
  t.addEventListener("click", (e) => { if (e.target === t || e.target.closest(".pk-x, .pk-zamknij")) zamknijKarte(); });
  t.querySelector(".pk-wejdz")?.addEventListener("click", () => { zamknijKarte(); wejdz.akcja(); });
  document.body.appendChild(t);
  document.addEventListener("keydown", naKlawisz, true);
  (t.querySelector(".pk-wejdz") || t.querySelector(".pk-zamknij")).focus({ preventScroll: true });
}
