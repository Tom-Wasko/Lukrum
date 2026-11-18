// „Układ bez powtórzeń” okien z listą opcji (seria pulpit, krok 6). Scena pokazuje opcje (okna budynku, półki, kasy),
// więc karta nie powtarza całej listy: pokazuje jedną pozycję (a: z miniaturami pozostałych, b: z nawigacją 1/4)
// albo tabelę porównawczą (c). Nie zmienia danych ani akcji: przerabia gotowy HTML okna (karty `.agencja` albo `.kafel.kanal`),
// a przyciski z tabeli to kopie przycisków z karty (te same `data-akcja`, obsługuje je zwykła obsługa kliknięć gry).
// Ponowne rysowanie okna (po każdej decyzji) wywołuje zastosujUklad od nowa; wybrana pozycja pamięta się w `STAN`.
// Wygląd: pulpit/karty.css (klasy uk-*).

const STAN = new Map();   // „<ekran>:<numer grupy>” → numer pokazywanej pozycji (-1: żadna, tylko tabela)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const tekst = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();

const nazwaPozycji = (el, i) => tekst(el.querySelector(".agencja-opis > b, .kg")?.firstChild) || tekst(el.querySelector(".agencja-opis > b, .kg")).replace(/\s*(Twoje|Twój|wybran).*$/i, "") || `Pozycja ${i + 1}`;
const wybrana = (el) => el.classList.contains("wybrany") || !!el.querySelector(".wybrany, button.zielony") || /(^|\s)(Twoje|Twój|Wybrano|W lokalu|✓)/i.test(tekst(el.querySelector(".pigulka")));
const stanPozycji = (el) => tekst(el.querySelector(".pigulka:not(:first-child), .kg .pigulka")) || (wybrana(el) ? "✓ wybrane" : "");

function wskazniki(el) {   // kolumny porównania: nazwa → wartość (duża liczba z podpisem albo wiersze „etykieta – wartość”)
  const w = new Map();
  const kafle = el.matches(".kafel") ? [el] : [...el.querySelectorAll(".kafel")];
  for (const k of kafle) {
    const tyt = tekst(k.querySelector(".kg")?.firstChild) || tekst(k.querySelector(".kg")) || "Cena";
    const b = tekst(k.querySelector(".kanal-cena b")), s = tekst(k.querySelector(".kanal-cena span"));
    if (b) w.set(el.matches(".kafel") ? "Składka" : tyt, s ? `${b} (${s})` : b);
    if (el.matches(".kafel")) for (const r of k.querySelectorAll(".wiersz")) { const [a, v] = r.children; if (a && v) w.set(tekst(a), tekst(v)); }
  }
  return w;
}

function czysc(korzen) {
  for (const e of korzen.querySelectorAll("[data-uk-dod]")) e.remove();
  for (const e of korzen.querySelectorAll("[data-uk-poz]")) { e.hidden = false; e.removeAttribute("data-uk-poz"); e.removeAttribute("data-uk-akt"); }
}

const przycisk = (grupa, i, tresc, opis = "", pressed = null) =>
  `<button type="button" data-uk="${grupa}:${i}"${pressed === null ? "" : ` aria-pressed="${pressed}"`}${opis ? ` aria-label="${esc(opis)}"` : ""}>${tresc}</button>`;

function miniatury(grupa, poz, i0) {   // a
  return `<div class="uk uk-a" data-uk-dod role="group" aria-label="Pozostałe pozycje"><p>Inne pozycje (wybór także na scenie):</p><ul>${poz.map((el, i) =>
    `<li>${przycisk(grupa, i, `<b>${esc(nazwaPozycji(el, i))}</b>${stanPozycji(el) ? ` <small>${esc(stanPozycji(el))}</small>` : ""}`, `${nazwaPozycji(el, i)} – pokaż pozycję`, i === i0)}</li>`).join("")}</ul></div>`;
}
function nawigacja(grupa, poz, i0) {   // b
  const n = poz.length, p = (i0 + n - 1) % n, nx = (i0 + 1) % n;
  return `<div class="uk uk-b" data-uk-dod role="group" aria-label="Przeglądanie pozycji">
    ${przycisk(grupa, p, "‹", "Poprzednia pozycja")}
    <div class="uk-sr"><b>${esc(nazwaPozycji(poz[i0], i0))}</b><span role="status">${i0 + 1} / ${n}${wybrana(poz[i0]) ? " · ✓ wybrane" : ""}</span>
      <span class="uk-kropki" aria-hidden="true">${poz.map((_, i) => `<i${i === i0 ? ` class="on"` : ""}></i>`).join("")}</span></div>
    ${przycisk(grupa, nx, "›", "Następna pozycja")}</div>`;
}
function tabela(grupa, poz, i0) {   // c
  const kol = [];
  const dane = poz.map((el) => { const w = wskazniki(el); for (const k of w.keys()) if (!kol.includes(k)) kol.push(k); return w; });
  const wiersze = poz.map((el, i) => {
    const akcje = [...el.querySelectorAll("button.btn")].filter((b) => !b.closest("details")).map((b) => b.outerHTML).join(" ");
    return `<tr${i === i0 ? ` aria-current="true"` : ""}><th scope="row">${przycisk(grupa, i, esc(nazwaPozycji(el, i)), `${nazwaPozycji(el, i)} – pokaż szczegóły`, i === i0)}
      ${stanPozycji(el) ? `<small>${esc(stanPozycji(el))}</small>` : ""}</th>${kol.map((k) => `<td>${esc(dane[i].get(k) ?? "–")}</td>`).join("")}<td class="uk-akc">${akcje}</td></tr>`;
  }).join("");
  return `<div class="uk uk-c" data-uk-dod><div class="uk-przew" tabindex="0" role="region" aria-label="Porównanie pozycji"><table><caption class="uk-sr">Porównanie – wybierz pozycję, aby zobaczyć szczegóły</caption>
    <thead><tr><th scope="col">Pozycja</th>${kol.map((k) => `<th scope="col">${esc(k)}</th>`).join("")}<th scope="col">Wybór</th></tr></thead><tbody>${wiersze}</tbody></table></div>
    ${i0 < 0 ? `<p class="uk-podp">Kliknij nazwę w tabeli, aby zobaczyć szczegóły pozycji.</p>` : ""}</div>`;
}

/** Przerabia listy opcji w oknie. korzen: element okna; cfg: { uklad: "a"|"b"|"c", pozycje?: selektor }; klucz: ekran (pamięć wyboru). */
export function zastosujUklad(korzen, cfg, klucz) {
  if (!korzen || !cfg) return;
  czysc(korzen);
  const grupy = new Map();
  for (const el of korzen.querySelectorAll(cfg.pozycje || ".agencja")) {
    const r = el.parentElement;
    if (!grupy.has(r)) grupy.set(r, []);
    grupy.get(r).push(el);
  }
  let nr = 0;
  for (const [rodzic, poz] of grupy) {
    if (poz.length < 2) continue;
    const grupa = `${klucz}:${nr++}`;
    let i0 = STAN.has(grupa) ? STAN.get(grupa) : poz.findIndex(wybrana);
    if (i0 >= poz.length) i0 = -1;
    if (i0 < 0 && cfg.uklad !== "c") i0 = 0;
    const html = cfg.uklad === "a" ? miniatury(grupa, poz, i0) : cfg.uklad === "b" ? nawigacja(grupa, poz, i0) : tabela(grupa, poz, i0);
    poz.forEach((el, i) => { el.setAttribute("data-uk-poz", ""); el.hidden = i !== i0; if (i === i0) el.setAttribute("data-uk-akt", ""); });
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    const dod = tpl.content.firstElementChild;
    poz[0].before(dod);   // miniatury, nawigacja i tabela stoją nad pozycją
  }
  korzen._uklad = { cfg, klucz };
  if (korzen._ukladOk) return;
  korzen._ukladOk = true;
  korzen.addEventListener("click", (e) => {
    const b = e.target.closest("[data-uk]");
    if (!b || !korzen.contains(b)) return;
    const k = b.dataset.uk.lastIndexOf(":"), grupa = b.dataset.uk.slice(0, k), i = +b.dataset.uk.slice(k + 1);
    const { cfg: c, klucz: kl } = korzen._uklad;
    STAN.set(grupa, STAN.get(grupa) === i && c.uklad === "c" ? -1 : i);   // w tabeli drugi klik w ten sam wiersz zwija szczegóły
    zastosujUklad(korzen, c, kl);
    (korzen.querySelector(`[data-uk="${CSS.escape(b.dataset.uk)}"]`) || korzen.querySelector(`[data-uk^="${CSS.escape(grupa)}:"]`))?.focus({ preventScroll: true });
  });
  korzen.addEventListener("keydown", (e) => {
    const b = e.target.closest?.(".uk-b [data-uk]");
    if (!b || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    const nav = b.closest(".uk-b"), btn = [...nav.querySelectorAll("[data-uk]")];
    btn[e.key === "ArrowLeft" ? 0 : 1].click();
  });
}
