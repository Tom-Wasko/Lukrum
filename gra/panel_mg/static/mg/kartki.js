// Kartki z hasłami do druku (kreator i panel gry): dla każdej drużyny nagłówek z nazwą, pod nim kartki do wycięcia
// (uczeń, login, hasło, adres logowania). Moduł bez zależności, żeby dało się go sprawdzić pod Node'em.
const ZNAKI = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ZNAKI[c]);

// grupy: [{ tytul, osoby: [{ nazwa, login, haslo|null }] }]; `haslo: null` – konto istniało już wcześniej
export function kartkiHtml(grupy, adres) {
  const kartka = (o) => `<div class="kartka"><div class="kartka-uczen">${esc(o.nazwa)}</div>
    <div class="kartka-wiersz"><span>Login</span><b>${esc(o.login)}</b></div>
    <div class="kartka-wiersz"><span>Hasło</span>${o.haslo ? `<code class="haslo">${esc(o.haslo)}</code>` : "<i>dotychczasowe</i>"}</div>
    <div class="kartka-adres">${esc(adres)}</div></div>`;
  return `<div class="kartki">${grupy.filter((g) => g.osoby.length).map((g) =>
    `<section class="kartki-grupa"><h3>${esc(g.tytul)}</h3><div class="kartki-siatka">${g.osoby.map(kartka).join("")}</div></section>`).join("")}</div>`;
}
