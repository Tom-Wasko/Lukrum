// Pulpit ucznia przed wejściem do gry (seria „funkcje”, 9.11.2026): karta gry ze stanem rundy, moja drużyna,
// co jest nowe w tej rundzie (runda 1 – pierwsze kroki) i funkcje tej gry.
import { esc } from "./zakladki/wspolne.js";
import { ikona } from "./zakladki/ikony.js";

const MG = JSON.parse(document.getElementById("mg").textContent);
const PALETA = ["#1e9e5a", "#2d73d6", "#e45f26", "#9b51e0", "#f2b705", "#e5333f", "#17a2b8", "#795548"];
const STATUS = {
  wyslane: ["ok", "Decyzje wysłane"],
  zapisane: ["zegar", "Decyzje zapisane – jeszcze niewysłane"],
  brak: ["uwaga", "Jeszcze bez decyzji w tej rundzie"],
  koniec: ["ok", "Gra zakończona"],
};
const KROTKO = { wyslane: "wysłane", zapisane: "zapisane", brak: "brak decyzji", koniec: "koniec" };

const banerIkona = document.querySelector("#baner-mg .ikona-mg");
if (banerIkona) banerIkona.outerHTML = ikona("klucz", 20);

const status = (s, krotko = false) =>
  `<span class="status ${s}">${ikona(STATUS[s][0], 16)}${krotko ? KROTKO[s] : STATUS[s][1]}</span>`;
const kolor = (d) => d.kolor || PALETA[d.indeks % PALETA.length];
const adresGry = (g, firma) => `/gra/${encodeURIComponent(g.id)}${firma ? `/${encodeURIComponent(firma)}` : ""}`;

function termin(g) {
  const p = g.prowadzenie || {};
  if (g.zakonczona) return "";
  if (p.pauza) return `<div class="termin pauza">${ikona("uwaga", 18)}Gra wstrzymana przez mistrza gry – decyzje poczekają.</div>`;
  if (p.termin) {
    const t = new Date(p.termin);
    const kiedy = t.toLocaleString("pl-PL", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    return `<div class="termin">${ikona("zegar", 18)}<span>Runda zamknie się: <b>${esc(kiedy)}</b></span></div>`;
  }
  return `<div class="termin">${ikona("zegar", 18)}<span>Runda zamknie się, gdy wszystkie drużyny wyślą decyzje.</span></div>`;
}

function postep(g) {
  const zrobione = g.zakonczona ? g.liczba_rund : g.runda - 1;
  const proc = Math.round((100 * zrobione) / g.liczba_rund);
  return `<div><div class="pasek-rund" role="progressbar" aria-valuemin="0" aria-valuemax="${g.liczba_rund}" aria-valuenow="${zrobione}"
    aria-label="Rozegrane rundy"><span style="width:${proc}%"></span></div>
    <p class="runda-opis"><span>${g.zakonczona ? `Rozegrane wszystkie rundy: <b>${g.liczba_rund}</b>` : `Runda <b>${g.runda}</b> z ${g.liczba_rund}`}</span>
    <span>${g.zakonczona ? "" : `wysłały <b>${g.wyslane}</b> z ${g.ludzie} ${g.ludzie === 1 ? "drużyny" : "drużyn"}`}</span></p></div>`;
}

function mojaDruzyna(g, d) {
  const osoby = (d.sklad || []).map((o) => `<span title="${esc(o.login)}">${esc(o.nazwa)}</span>`).join("");
  const miejsce = d.miejsce
    ? `<div class="miejsce"><b>${d.miejsce}. miejsce</b> z ${g.firm_w_rankingu} w rankingu (średni wynik działalności)</div>`
    : `<div class="miejsce">Ranking pojawi się po pierwszym tygodniu sprzedaży.</div>`;
  return `<div><div class="blok-tytul">${ikona("hr", 16)}Moja drużyna</div><div class="druzyna-p">
    <div class="firma-p"><span class="kropka" style="background:${esc(kolor(d))}"></span>${esc(d.firma)}</div>
    ${osoby ? `<div class="osoby">${osoby}</div>` : ""}${miejsce}</div></div>`;
}

function druzynyMg(g) {   // mistrz gry na pulpicie graczy: wszystkie drużyny z ich statusem
  if (!g.druzyny.length) return "";
  return `<div><div class="blok-tytul">${ikona("hr", 16)}Drużyny</div><div class="druzyny-mg">${g.druzyny.map((d) =>
    `<a href="${adresGry(g, d.firma)}"><span class="kropka" style="background:${PALETA[d.indeks % PALETA.length]}"></span>${esc(d.firma)}${status(d.status, true)}</a>`).join("")}</div></div>`;
}

function nowe(g) {
  if (g.zakonczona) return `<div><div class="blok-tytul">${ikona("wykres", 16)}Koniec gry</div>
    <p class="podpowiedz" style="font-size:13px">Wejdź do gry, żeby zobaczyć kartę wyników i ranking ze wszystkich rund.</p></div>`;
  const n = g.nowe;
  if (n.pierwsze_kroki) return `<div><div class="blok-tytul">${ikona("ok", 16)}Pierwsze kroki</div><ol class="lista-nowe">${n.pozycje.map((p, i) =>
    `<li><span class="nr">${i + 1}</span><span><b>${esc(p.nazwa)}</b><small>${esc(p.opis)}</small></span></li>`).join("")}</ol></div>`;
  const lista = n.pozycje.length ? `<ul class="lista-nowe">${n.pozycje.map((p) =>
    `<li><span class="nr nowe">+</span><span><b>${esc(p.nazwa)}</b> <span class="grupa">${esc(p.grupa)}</span></span></li>`).join("")}</ul>`
    : `<p class="podpowiedz" style="font-size:13px;margin:0">W tej rundzie nie ma nowych zakładek – ta sama gra, nowe decyzje.</p>`;
  return `<div><div class="blok-tytul">${ikona("zdarzenia", 16)}Nowe w tej rundzie</div>${lista}</div>`;
}

// Funkcje tej gry (J8): uczeń widzi odkryte, zakryte (z oznaczeniem odsłoniętych przez drużynę) i wyłączone;
// mistrz gry – krótkie podsumowanie liczb i wyłączone funkcje (pełna tabela jest w panelu prowadzenia gry).
const chip = (f, klasa = f.stan) => `<span class="fn-chip ${klasa}" title="${esc(f.krotko)}">${ikona(f.ikona || "oko", 14)}${esc(f.nazwa)}${f.odslonieta ? " – odsłonięta" : ""}</span>`;
const grupaFunkcji = (tytul, html) => (html ? `<div class="fn-grupa"><div class="fn-tytul">${tytul}</div><div class="fn-wiersze">${html}</div></div>` : "");

function funkcje(g) {
  const naglowek = `<div class="blok-tytul">${ikona("oko", 16)}Funkcje tej gry</div>`;
  if (!g.funkcje) return "";   // gra bez funkcji – sekcji nie ma
  if (MG) {
    const { liczby, lista } = g.funkcje;
    const wylaczone = lista.filter((f) => f.stan === "wylaczona").map((f) => esc(f.nazwa));
    return `<div>${naglowek}<p class="fn-nota">odkryte ${liczby.odkryta}, zakryte ${liczby.zakryta}, wyłączone ${liczby.wylaczona}${
      wylaczone.length ? ` (${wylaczone.join(", ")})` : ""}</p></div>`;
  }
  const wg = (stan) => g.funkcje.filter((f) => f.stan === stan);
  const zakryte = wg("zakryta");
  const odslonieteN = zakryte.filter((f) => f.odslonieta).length;
  return `<div>${naglowek}<div class="fn-lista">
    ${grupaFunkcji("Odkryte", wg("odkryta").map((f) => chip(f)).join(""))}
    ${grupaFunkcji("Zakryte", zakryte.map((f) => chip(f, f.odslonieta ? "zakryta odslonieta" : "zakryta")).join(""))}
    ${zakryte.length ? `<p class="fn-nota">${odslonieteN ? `Odsłonięte przez drużynę: ${odslonieteN} z ${zakryte.length}. ` : ""}Zakrytą funkcję można odsłonić w grze – w menu jest wyszarzona.</p>` : ""}
    ${grupaFunkcji("Wyłączone", wg("wylaczona").map((f) => chip(f)).join(""))}</div></div>`;
}

function karta(g) {
  const moja = MG ? null : g.druzyny[0];
  const st = moja ? moja.status : null;
  const wejdz = g.zakonczona ? "Zobacz wyniki" : "Wejdź do gry";
  const akcje = MG ? `<a class="btn pom duzy" href="${adresGry(g)}">${wejdz}</a><a class="btn jasny duzy" href="/mg/gra/${encodeURIComponent(g.id)}">Prowadź grę</a>`
    : g.druzyny.map((d) => `<a class="btn pom duzy" href="${adresGry(g, d.firma)}">${wejdz}${g.druzyny.length > 1 ? ` jako ${esc(d.firma)}` : ""}${ikona("prawo", 16)}</a>`).join("");
  return `<article class="karta-gry">
    <div class="kg-l">
      <div><div class="nazwa-gry">${esc(g.nazwa)}</div><div class="tydzien">${g.zakonczona ? "Gra zakończona" : esc(g.tydzien)}</div></div>
      ${postep(g)}
      <div class="wiersz-st">${st ? status(st) : ""}${g.prowadzenie?.pauza && !g.zakonczona ? `<span class="chip-stan pauza">pauza</span>` : ""}</div>
      ${termin(g)}
      <div class="akcje">${akcje}</div>
    </div>
    <div class="kg-p">${MG ? druzynyMg(g) : g.druzyny.map((d) => mojaDruzyna(g, d)).join("")}${nowe(g)}${funkcje(g)}</div>
  </article>`;
}

function rysuj(dane) {
  const el = document.getElementById("gry");
  if (!dane.gry.length) {
    el.innerHTML = MG ? `<div class="pusto"><b>Nie ma jeszcze żadnej gry</b>Załóż ją na pulpicie mistrza gry.
      <p><a class="btn pom" href="/mg/#nowa">${ikona("plus", 16)}Nowa gra</a></p></div>`
      : `<div class="pusto"><b>Nie jesteś jeszcze w żadnej drużynie</b>Mistrz gry dopisze Cię do drużyny – ta strona odświeży się sama.</div>`;
    return;
  }
  // gry w toku przed zakończonymi
  const gry = [...dane.gry].sort((a, b) => a.zakonczona - b.zakonczona);
  el.innerHTML = gry.map(karta).join("");
}

let pobieranie = false;
async function odswiez() {
  if (pobieranie) return;
  pobieranie = true;
  const el = document.getElementById("gry");
  try {
    const odp = await fetch("/api/pulpit", { cache: "no-store", headers: { Accept: "application/json" } });
    if (odp.status === 401) return location.reload();   // sesja wygasła – przekierowanie do logowania
    if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
    rysuj(await odp.json());
  } catch (e) {
    if (!el.querySelector(".karta-gry, .pusto"))
      el.innerHTML = `<p class="podpowiedz">Nie udało się wczytać gier. Próbuję ponownie…</p>`;
    setTimeout(odswiez, 3000);
  } finally { pobieranie = false; }
}
odswiez();
// powrót przyciskiem „wstecz” i odświeżanie w tle: status decyzji i termin zawsze aktualne
addEventListener("pageshow", (e) => { if (e.persisted) odswiez(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) odswiez(); });
setInterval(() => { if (!document.hidden) odswiez(); }, 20000);
