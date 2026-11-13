// Pulpit mistrza gry (seria „funkcje”, 9.11.2026): menu z boku, karty gier i kreator nowej gry w 4 krokach
// (Podstawy → Drużyny i boty → Funkcje gry → Sprawdź i utwórz) oraz wczytanie gry z pliku.
import { esc } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";

const U = JSON.parse(document.getElementById("ustawienia").textContent);
const csrf = () => document.cookie.match(/(?:^|; )csrftoken=([^;]*)/)?.[1] ?? "";
const $ = (id) => document.getElementById(id);
const PALETA = ["#1e9e5a", "#2d73d6", "#e45f26", "#9b51e0", "#f2b705", "#e5333f", "#17a2b8", "#795548"];

// Funkcje gry (decyzje autora 9–10.11, raporty/funkcje/plan.md): lista i gotowe zestawy przychodzą z dane/funkcje.yaml
// (panel_mg/widoki.py → ustawienia), a stany idą do POST /api/gry w polu `funkcje`.
const PODSTAWA = "Pulpit, mapa, wyniki, wybór lokalu, mój lokal, kuchnia, rynek pracy i zespół, stanowiska i sprzęt, "
  + "wyniki finansowe i bank, biuro rachunkowe, lista błędów, wysyłanie decyzji";
const FUNKCJE = U.funkcje || [];
const ZESTAWY = U.zestawy || [];
const STANY = [["odkryta", "Odkryta"], ["zakryta", "Zakryta"], ["wylaczona", "Wyłączona"]];

document.querySelectorAll("[data-ikona]").forEach((el) => { el.outerHTML = ikona(el.dataset.ikona, 18); });

// --- widoki z menu (adres #pulpit / #nowa / #wczytaj) -------------------------------------------------------------
function pokaz() {
  const w = (location.hash || "#pulpit").slice(1);
  const widok = document.querySelector(`section[data-widok="${w}"]`) ? w : "pulpit";
  document.querySelectorAll("section[data-widok]").forEach((s) => { s.hidden = s.dataset.widok !== widok; });
  document.querySelectorAll("#bok a[data-widok]").forEach((a) => a.classList.toggle("aktywna", a.dataset.widok === widok));
  if (widok === "pulpit") odswiez();
}
addEventListener("hashchange", pokaz);

// --- pulpit: karty gier -------------------------------------------------------------------------------------------
const KROTKO = { wyslane: "wysłane", zapisane: "zapisane", brak: "brak" };
const odmiana = (n, a, b, c) => (n === 1 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

function termin(g) {
  const p = g.prowadzenie || {};
  if (g.zakonczona) return "Gra zakończona – wyniki i plik CSV w panelu gry.";
  if (p.pauza) return "<b>Pauza</b> – drużyny nie mogą wysyłać decyzji.";
  if (p.termin) {
    const t = new Date(p.termin).toLocaleString("pl-PL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    return `Runda zamknie się: <b>${esc(t)}</b>${p.harmonogram_opis ? ` (${esc(p.harmonogram_opis)})` : ""}`;
  }
  return "Runda zamknie się, gdy wszystkie drużyny wyślą (albo gdy zamkniesz ją w panelu gry).";
}

function funkcjeGry(g) {   // J8: krótkie podsumowanie stanów funkcji (gra bez funkcji – nic)
  if (!g.funkcje) return "";
  const { liczby, lista } = g.funkcje;
  const wylaczone = lista.filter((f) => f.stan === "wylaczona").map((f) => f.nazwa);
  return `<div class="opis-dec" title="${esc(wylaczone.length ? `Wyłączone: ${wylaczone.join(", ")}` : "Funkcje gry")}">Funkcje: odkryte ${liczby.odkryta}, zakryte <b>${liczby.zakryta}</b>, wyłączone ${liczby.wylaczona}</div>`;
}

function kartaGry(g) {
  const id = encodeURIComponent(g.id);
  const zrobione = g.zakonczona ? g.liczba_rund : g.runda - 1;
  const stan = g.zakonczona ? `<span class="chip-stan koniec">zakończona</span>`
    : g.prowadzenie?.pauza ? `<span class="chip-stan pauza">pauza</span>` : `<span class="chip-stan">runda ${g.runda} z ${g.liczba_rund}</span>`;
  const kropki = g.druzyny.map((d) => `<span class="${d.status}" title="${esc(d.firma)}: ${KROTKO[d.status] || ""}${d.sklad.length
    ? ` – ${esc(d.sklad.map((o) => o.nazwa).join(", "))}` : " – bez uczniów"}">${esc(d.firma)}</span>`).join("");
  const boty = g.boty ? ` + ${g.boty} ${odmiana(g.boty, "bot", "boty", "botów")}` : "";
  return `<article class="gra-mg">
    <div class="gora"><div><b>${esc(g.nazwa)}</b><small>${g.zakonczona ? "" : esc(g.tydzien)} · ${g.ludzie} ${odmiana(g.ludzie, "drużyna", "drużyny", "drużyn")}${boty}</small></div>${stan}</div>
    <div><div class="pasek-rund"><span style="width:${Math.round((100 * zrobione) / g.liczba_rund)}%"></span></div></div>
    ${g.zakonczona ? "" : `<div class="opis-dec">Decyzje wysłały: <b>${g.wyslane} z ${g.ludzie}</b></div><div class="kropki">${kropki}</div>`}
    ${funkcjeGry(g)}
    <div class="opis-dec">${termin(g)}</div>
    <div class="akcje"><a class="btn pom maly" href="/mg/gra/${id}">Prowadź</a>
      <a class="btn jasny maly" href="/gra/${id}">Strona drużyn</a>
      <a class="btn jasny maly" href="/api/gry/${id}/eksport">Pobierz plik</a>
      <button class="btn jasny maly" type="button" data-usun="${esc(g.id)}" data-nazwa="${esc(g.nazwa)}">Usuń</button></div>
  </article>`;
}

function liczniki(gry) {
  const wToku = gry.filter((g) => !g.zakonczona);
  const czekaja = wToku.reduce((s, g) => s + (g.ludzie - g.wyslane), 0);
  const uczniow = gry.reduce((s, g) => s + g.druzyny.reduce((t, d) => t + d.sklad.length, 0), 0);
  const kafel = (n, t) => `<div class="licznik"><b>${n}</b><span>${t}</span></div>`;
  $("liczniki").innerHTML = kafel(wToku.length, "gry w toku") + kafel(czekaja, "drużyny bez wysłanych decyzji")
    + kafel(uczniow, "uczniów w drużynach") + kafel(gry.length - wToku.length, "gry zakończone");
}

let pobieranie = false;
async function odswiez() {
  if (pobieranie) return;
  pobieranie = true;
  try {
    const odp = await fetch("/api/pulpit", { cache: "no-store", headers: { Accept: "application/json" } });
    if (odp.status === 401) return location.reload();
    if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
    const { gry } = await odp.json();
    const kolejne = [...gry].sort((a, b) => a.zakonczona - b.zakonczona);
    liczniki(gry);
    $("gry").innerHTML = kolejne.map(kartaGry).join("")
      + `<a class="gra-mg dodaj" href="#nowa">${ikona("plus", 30)}<span>Nowa gra</span></a>`;
  } catch (e) {
    if (!$("gry").querySelector(".gra-mg")) $("gry").innerHTML = `<p class="podpowiedz">Nie udało się wczytać gier. Próbuję ponownie…</p>`;
    setTimeout(odswiez, 3000);
  } finally { pobieranie = false; }
}

$("gry").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-usun]");
  if (!b) return;
  if (b.dataset.potwierdz !== "1") {   // drugi klik potwierdza (bez okna przeglądarki)
    b.dataset.potwierdz = "1";
    b.textContent = "Na pewno usunąć?";
    b.classList.add("pom");
    setTimeout(() => { if (b.isConnected) { b.dataset.potwierdz = ""; b.textContent = "Usuń"; b.classList.remove("pom"); } }, 4000);
    return;
  }
  await fetch(`/api/gry/${encodeURIComponent(b.dataset.usun)}`, { method: "DELETE", headers: { "X-CSRFToken": csrf() } });
  odswiez();
});
document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("w-pulpit").hidden) odswiez(); });
setInterval(() => { if (!document.hidden && !$("w-pulpit").hidden) odswiez(); }, 20000);

// --- kreator: krok 2 (drużyny i boty) -----------------------------------------------------------------------------
const lista = $("druzyny");
function druzyna(nazwa) {
  const w = document.createElement("div");
  w.className = "wiersz-d";
  w.innerHTML = `<span class="nr"></span><input type="text" value="${esc(nazwa)}" maxlength="60" aria-label="Nazwa drużyny">
    <button class="btn jasny maly" type="button">Usuń</button>`;
  w.querySelector("button").onclick = () => { w.remove(); numery(); };
  lista.appendChild(w);
  numery();
}
const numery = () => [...lista.children].forEach((w, i) => { w.querySelector(".nr").textContent = `${i + 1}.`; });
["Drużyna 1", "Drużyna 2", "Drużyna 3", "Drużyna 4"].forEach(druzyna);
$("dodaj").onclick = () => druzyna(`Drużyna ${lista.children.length + 1}`);

const lb = $("lista-botow");
const poziomy = Object.entries(U.poziomy || {});
const wyborPoziomu = () => (poziomy.length ? `<select class="poziom" title="Poziom bota">${poziomy.map(([k, n]) =>
  `<option value="${esc(k)}"${k === "sredni" ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>` : "");
lb.innerHTML = Object.entries(U.strategie).map(([k, n]) =>
  `<label><input type="checkbox" value="${esc(k)}" checked><span class="nazwa-bota">${esc(n)}</span>${wyborPoziomu()}</label>`).join("");
$("boty").onchange = () => lb.classList.toggle("wylaczone", !$("boty").checked);

// --- kreator: krok 3 (funkcje gry) – tabela z przełącznikiem trzech stanów i gotowe zestawy -----------------------
const stany = Object.fromEntries(FUNKCJE.map((f) => [f.klucz, "odkryta"]));
const ustawZestaw = (z) => FUNKCJE.forEach((f) => { stany[f.klucz] = z.stany[f.klucz] || "odkryta"; });
const pasujacyZestaw = () => ZESTAWY.find((z) => FUNKCJE.every((f) => (z.stany[f.klucz] || "odkryta") === stany[f.klucz]));
const domyslny = ZESTAWY.find((z) => z.klucz === U.domyslny_zestaw);
if (domyslny) ustawZestaw(domyslny);

function rysujFunkcje() {
  const przel = (k) => `<div class="trzy-stany" role="radiogroup" aria-label="Stan funkcji">${STANY.map(([s, n]) =>
    `<button type="button" role="radio" data-funkcja="${esc(k)}" data-stan="${s}" class="${s} ${stany[k] === s ? "wybrany" : ""}"
      aria-checked="${stany[k] === s}">${n}</button>`).join("")}</div>`;
  $("funkcje").innerHTML = `<tr class="podstawa"><td>${ikona("ok", 20)}</td><td><b>Podstawa gry</b><small>${PODSTAWA}</small></td>
    <td><span class="chip-stan">zawsze odkryta</span></td></tr>`
    + FUNKCJE.map((f) => `<tr><td>${ikona(f.ikona || "oko", 20)}</td><td><b>${esc(f.nazwa)}</b><small>${esc(f.krotko)}</small>
      <small class="gdy-zakryta">Gdy zakryta: ${esc(f.zakryta)}</small></td><td>${przel(f.klucz)}</td></tr>`).join("");
  const pasuje = pasujacyZestaw();
  $("zestawy").innerHTML = `<span class="podpowiedz" style="align-self:center;font-size:12.5px">Gotowe zestawy:</span>` + ZESTAWY.map((z) =>
    `<button class="btn ${pasuje === z ? "pom wybrany" : "jasny"} maly" type="button" data-zestaw="${esc(z.klucz)}" title="${esc(z.opis)}"
      aria-pressed="${pasuje === z}">${esc(z.nazwa)}${z.klucz === U.domyslny_zestaw ? " (domyślny)" : ""}</button>`).join("")
    + (pasuje ? `<span class="podpowiedz zostaw" style="align-self:center;font-size:12.5px">${esc(pasuje.opis)}</span>`
      : `<span class="chip-stan" style="align-self:center">własny zestaw</span>`);
}
$("funkcje").addEventListener("click", (e) => {
  const b = e.target.closest("[data-funkcja]");
  if (!b) return;
  stany[b.dataset.funkcja] = b.dataset.stan;
  rysujFunkcje();
});
$("zestawy").addEventListener("click", (e) => {
  const b = e.target.closest("[data-zestaw]");
  if (!b) return;
  ustawZestaw(ZESTAWY.find((z) => z.klucz === b.dataset.zestaw));
  rysujFunkcje();
});
rysujFunkcje();

// --- kreator: kroki i podsumowanie --------------------------------------------------------------------------------
let krok = 1;
function idzDo(n) {
  krok = Math.max(1, Math.min(4, n));
  document.querySelectorAll(".panel-kroku[data-krok]").forEach((p) => { p.hidden = +p.dataset.krok !== krok; });
  document.querySelectorAll("#kroki li").forEach((li) => {
    li.classList.toggle("aktywny", +li.dataset.krok === krok);
    li.classList.toggle("zrobiony", +li.dataset.krok < krok);
  });
  $("wstecz").style.visibility = krok === 1 ? "hidden" : "";
  $("dalej").hidden = krok === 4;
  $("utworz").hidden = krok !== 4;
  if (krok === 4) podsumowanie();
  pokazBlad("");
}
$("kroki").addEventListener("click", (e) => { const li = e.target.closest("li[data-krok]"); if (li) idzDo(+li.dataset.krok); });
$("wstecz").onclick = () => idzDo(krok - 1);
$("dalej").onclick = () => idzDo(krok + 1);
const pokazBlad = (t) => { $("blad").textContent = t; $("blad").hidden = !t; };

function firmy() {
  const f = [...lista.querySelectorAll("input")].map((i) => ({ nazwa: i.value.trim(), bot: null })).filter((x) => x.nazwa);
  if ($("boty").checked) for (const c of lb.querySelectorAll("input:checked"))
    f.push({ nazwa: U.strategie[c.value], bot: c.value, poziom: c.parentElement.querySelector("select.poziom")?.value });
  return f;
}

function podsumowanie() {
  const f = firmy();
  const ludzie = f.filter((x) => !x.bot), boty = f.filter((x) => x.bot);
  const opis = (sel) => sel.options[sel.selectedIndex].text;
  const pole = (t, w) => `<div><b>${t}</b><span>${w}</span></div>`;
  const liczba = (st) => FUNKCJE.filter((f) => stany[f.klucz] === st).length;
  const wylaczone = FUNKCJE.filter((f) => stany[f.klucz] === "wylaczona").map((f) => esc(f.nazwa));
  const zestaw = pasujacyZestaw();
  $("podsumowanie").innerHTML = [
    pole("Nazwa gry", esc($("nazwa").value || "Gra")),
    pole("Rundy", `${esc($("rundy").value)} ${esc(U.mnoga)}, od: ${esc(U.pierwsza)}`),
    pole("Kapitał startowy", `${esc(Number($("kapital").value || U.kapital).toLocaleString("pl-PL"))}&nbsp;zł`),
    pole(`Drużyny (${ludzie.length})`, ludzie.map((x, i) => `<span class="kropka" style="background:${PALETA[i % PALETA.length]};width:9px;height:9px"></span> ${esc(x.nazwa)}`).join("<br>") || "–"),
    pole(`Boty (${boty.length})`, boty.map((x) => `${esc(x.nazwa)}${x.poziom ? ` – ${esc(U.poziomy[x.poziom] || x.poziom)}` : ""}`).join("<br>") || "bez botów"),
    pole("Funkcje gry", FUNKCJE.length ? `${zestaw ? `zestaw „${esc(zestaw.nazwa)}”` : "własny zestaw"}<br>odkryte: ${liczba("odkryta")}, zakryte: ${liczba("zakryta")}, `
      + `wyłączone: ${wylaczone.length}${wylaczone.length ? ` (${wylaczone.join(", ")})` : ""}` : "bez funkcji"),
    pole("Pomoc dla drużyn", [`podpowiedzi: ${$("podpowiedzi").checked ? "tak" : "nie"}`,
      `„Zamów brakujące”: ${$("auto-zamowienia").checked ? "tak" : "nie"}`, `refleksja: ${esc(opis($("refleksja")))}`].join("<br>")),
    pole("Więcej ustawień", [`kredyt: ${esc(opis($("kredyt")).split(" – ")[0])}`,
      `ziarno: ${esc($("ziarno").value || "losowe")}`].join("<br>")),
  ].join("");
}

$("utworz").onclick = async () => {
  pokazBlad("");
  $("utworz").disabled = true;
  try {
    const r = await fetch("/api/gry", { method: "POST", headers: { "Content-Type": "application/json", "X-CSRFToken": csrf() }, body: JSON.stringify({
      nazwa: $("nazwa").value, liczba_rund: +$("rundy").value, kapital_startowy: $("kapital").value, ziarno: $("ziarno").value,
      ceny_dostawcow: "losowe", kredyt_odnawialny: $("kredyt").value, auto_zamowienia: $("auto-zamowienia").checked,
      refleksja: $("refleksja").value, podpowiedzi: $("podpowiedzi").checked, firmy: firmy(),
      funkcje: FUNKCJE.length ? stany : undefined,
    }) });
    const j = await r.json();
    if (!r.ok) return pokazBlad(j.blad);
    location.href = `/mg/gra/${encodeURIComponent(j.id)}`;
  } finally { $("utworz").disabled = false; }
};

// --- wczytanie gry z pliku ----------------------------------------------------------------------------------------
$("import").onchange = async (e) => {
  const b = $("blad-importu");
  b.hidden = true;
  if (!e.target.files[0]) return;
  const f = new FormData();
  f.append("plik", e.target.files[0]);
  const r = await fetch("/api/gry/import", { method: "POST", body: f, headers: { "X-CSRFToken": csrf() } });
  const j = await r.json();
  e.target.value = "";
  if (!r.ok) { b.textContent = j.blad; b.hidden = false; return; }
  location.href = `/mg/gra/${encodeURIComponent(j.id)}`;
};

idzDo(1);
pokaz();
