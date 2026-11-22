// lista zadań po prawej stronie ekranu (wysuwana, zwijana do paska z licznikiem).
// Zadania z sytuacji liczy przeglądarka z widoku i bieżących decyzji (odświeżane po każdym zapisie, razem z listą
// błędów) – odhaczają się same, gdy warunek jest spełniony. Własne zadania drużyny są w decyzjach rundy
// (`zadania_wlasne`: [{id, tekst, zrobione}]) – nieodhaczone przechodzą na kolejną rundę (api/prezentacja.py).
import { esc, toast, zl } from "./wspolne.js";
import { ikona } from "./ikony.js";
import { oknoParku } from "./zdarzenia.js";

// zakładki z listy błędów (klucze silnika) → jedno zadanie; pozostałe „Do zrobienia” – zadanie „Popraw: <zakładka>”
const GRUPY = [
  { id: "lokal", tekst: "Wybierz lokal", z: ["lokale", "licytacje", "przejecia"] },
  { id: "menu", tekst: "Ustaw menu i ceny", z: ["oferta", "lokal_menu", "sprzedaz", "promocje"] },
  { id: "dostawy", tekst: "Zamów składniki na dni sprzedaży", z: ["dostawcy", "swiezosc", "zaop_dostawy", "zaop_magazyn", "przewozy"] },
  { id: "obsada", tekst: "Obsadź stanowiska", z: ["stanowiska", "zatrudnienie", "hr_zatrudnienie", "obsada", "rynek_pracy", "zespol"] },
  { id: "sprzet", tekst: "Uzupełnij sprzęt", z: ["sprzet", "inwestycje_sprzet", "wnetrze_sprzet", "wnetrze_wyposazenie"] },
  { id: "finanse", tekst: "Popraw finanse (bank, biuro rachunkowe)", z: ["finanse_bank", "finanse_biuro", "bank", "biuro"] },
];
// sprawy, które mają własne zadania niżej (parki, sprawy w lokalu, Harpagon, wysłanie)
const OSOBNE = ["mapa", "sprawy", "zdarzenia", "harpagon", "wyslij"];
const DOKAD = { finanse_bank: "bank", finanse_biuro: "biuro", hr_zatrudnienie: "zatrudnienie", inwestycje_sprzet: "sprzet" };

// zadania z sytuacji, które w tej rundzie już się pojawiły – po spełnieniu warunku zostają na liście jako odhaczone
const widziane = new Map();
const kluczRundy = (v) => `lukrum-zadania/${globalThis.GRA ?? ""}/${v.firma}/${v.runda}`;
function pamiec(v) {
  const k = kluczRundy(v);
  if (!widziane.has(k)) {
    let zapis = {};
    try { zapis = JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { /* prywatne okno – bez pamięci */ }
    widziane.set(k, zapis);
  }
  return widziane.get(k);
}
function zapamietaj(v, m) {
  try { localStorage.setItem(kluczRundy(v), JSON.stringify(m)); } catch (e) { /* bez zapisu */ }
}

const nazwaBudynku = (kat, id) => kat.mapa?.budynki?.find((b) => b.id === id)?.nazwa || id;

// zadania z sytuacji: [{id, tekst, gotowe, cel | park, opis}]
export function zadaniaAutomatyczne(v, d, kat, tytul = (k) => k) {
  const lista = [];
  const czerwone = (v.lista_bledow || []).filter((b) => b.poziom === "czerwony");
  const wolne = new Set(czerwone.filter((b) => !OSOBNE.includes(b.zakladka)));
  for (const g of GRUPY) {
    const bledy = czerwone.filter((b) => g.z.includes(b.zakladka));
    bledy.forEach((b) => wolne.delete(b));
    lista.push({ id: g.id, tekst: g.tekst, gotowe: !bledy.length, cel: bledy[0] ? DOKAD[bledy[0].zakladka] || bledy[0].zakladka : null,
      opis: bledy.map((b) => b.tekst).join(" "), zBledow: true });
  }
  const inne = {};
  for (const b of wolne) { const k = b.zakladka || "lista_bledow"; (inne[k] = inne[k] || []).push(b.tekst); }
  for (const [z, teksty] of Object.entries(inne)) {
    const cel = DOKAD[z] || z;
    lista.push({ id: `bl-${z}`, tekst: `Popraw: ${tytul(cel)}`, gotowe: false, cel, opis: teksty.join(" "), zBledow: true });
  }
  // sprawy w parkach i w lokalu: zadanie – wybrać reakcję (inaczej liczy się reakcja domyślna)
  const Z = v.zdarzenia, wybory = d.zdarzenia || {};
  if (Z && v.runda >= Z.od_rundy) {
    const parki = {};   // sprawy pogrupowane po parkach
    for (const s of Z.aktywne || []) {
      if (!s.park) continue;   // sprawy w lokalu (np. pani Halina) nie są zadaniem w zeszycie: czeka je reakcja domyślna
      (parki[s.park] = parki[s.park] || []).push(s);
    }
    const wszystkie = Object.values(parki).flat();
    if (wszystkie.length) {   // jedno zbiorcze zadanie na wszystkie parki: otwiera pierwszy park z nieobsłużoną sprawą
      const otwarty = Object.entries(parki).find(([, sprawy]) => sprawy.some((s) => wybory[s.historia] == null)) || Object.entries(parki)[0];
      lista.push({ id: "zd-parki", park: otwarty[0], gotowe: wszystkie.every((s) => wybory[s.historia] != null),
        tekst: `Sprawy w parkach (${wszystkie.length})`,
        opis: Object.entries(parki).map(([park, sprawy]) => `${nazwaBudynku(kat, park)}: ${sprawy.map((s) => s.tytul).join(", ")}`).join(" · ") });
    }
  }
  // Harpagon: dług z terminem w tej albo następnej rundzie (albo po terminie)
  const H = v.harpagon?.przed;
  if (H && H.po_terminie >= -1) {
    lista.push({ id: "harpagon", tekst: H.po_terminie > 0 ? "Spłać Harpagona – termin minął!" : "Spłać Harpagona przed terminem",
      gotowe: (d.harpagon_splac || 0) >= H.dlug, cel: "harpagon", opis: `Dług ${zl(H.dlug)}, termin: runda ${H.termin}.` });
  }
  lista.push({ id: "wyslij", tekst: "List z decyzjami", gotowe: !!v.wyslane, cel: "wyslij", opis: "" });
  return lista;
}

// zadania pokazane w panelu: z listy błędów tylko te, które w tej rundzie się pojawiły (potem – odhaczone)
function doPokazania(v, d, kat, tytul) {
  const m = pamiec(v);
  let zmiana = false;
  const wynik = zadaniaAutomatyczne(v, d, kat, tytul).filter((z) => {
    if (!z.zBledow) return true;
    if (!z.gotowe && !m[z.id]) { m[z.id] = { tekst: z.tekst, cel: z.cel }; zmiana = true; }
    return !!m[z.id];
  });
  // zadanie z listy błędów, którego już nie ma (np. „Popraw: …”) – zostaje odhaczone
  for (const [id, z] of Object.entries(m)) {
    if (!wynik.some((x) => x.id === id)) wynik.unshift({ id, tekst: z.tekst, cel: z.cel, gotowe: true, opis: "" });
  }
  if (zmiana) zapamietaj(v, m);
  return wynik;
}

const wlasne = (d) => (Array.isArray(d.zadania_wlasne) ? d.zadania_wlasne : []);

export function panelZadan(v, d, kat, { edycja = false, tytul } = {}) {
  const auto = v.edycja ? doPokazania(v, d, kat, tytul) : [];
  const moje = wlasne(d);
  const otwarte = auto.filter((z) => !z.gotowe).length + moje.filter((z) => !z.zrobione).length;
  const pole = (z) => `<span class="zad-pole ${z.gotowe ? "ok" : ""}">${z.gotowe ? ikona("ok", 14) : ""}</span>`;
  const autoHtml = auto.map((z) => `<li class="${z.gotowe ? "gotowe" : ""}">${pole(z)}
    <a data-akcja="zadanie-idz" ${z.park ? `data-park="${esc(z.park)}"` : `data-cel="${esc(z.cel || "")}"`} title="${esc(z.opis)}">${esc(z.tekst)}</a></li>`).join("");
  const mojeHtml = moje.map((z) => `<li class="${z.zrobione ? "gotowe" : ""}">
    <a class="zad-pole ${z.zrobione ? "ok" : ""}" data-akcja="zadanie-odhacz" data-id="${esc(z.id)}" title="${z.zrobione ? "odznacz" : "zrobione"}">${z.zrobione ? ikona("ok", 14) : ""}</a>
    <span class="zad-tekst">${esc(z.tekst)}</span>${edycja ? `<a class="zad-usun" data-akcja="zadanie-usun" data-id="${esc(z.id)}" title="usuń">×</a>` : ""}</li>`).join("");
  const html = `<div class="zad-glowa"><b>Zadania</b>${otwarte ? `<span class="zad-licznik">${otwarte}</span>` : ""}
      <a class="zad-zwin" data-akcja="zadania-przelacz" title="zwiń">›</a></div>
    ${v.edycja ? `<div class="zad-sekcja">Z sytuacji w grze</div><ul class="zad-lista">${autoHtml}</ul>` : ""}
    <div class="zad-sekcja">Wasze zadania</div>
    ${moje.length ? `<ul class="zad-lista">${mojeHtml}</ul>` : `<p class="zad-pusto">${edycja ? "Dopiszcie, co jeszcze chcecie zrobić." : "Brak."}</p>`}
    ${edycja ? `<div class="zad-nowe"><input id="zad-nowe" maxlength="120" placeholder="Nowe zadanie…"><button class="btn maly" data-akcja="zadanie-dodaj">Dodaj</button></div>
      <p class="zad-pusto">Nieodhaczone zadania przejdą na następną rundę.</p>` : ""}`;
  return { html, otwarte };
}

// --- panel w dokumencie --------------------------------------------------------------------------
// lista domyślnie zwinięta (na każdym wejściu), wysuwa się i chowa z animacją (styl.css: .zad-panel);
// klik poza nią albo Esc – zwija. Przerysowanie nie zmienia klasy, więc animuje się tylko przełączenie.
let wysuniete = false;
function przelacz(tak) {
  wysuniete = tak;
  const el = document.getElementById("zadania");
  if (!el) return;
  el.classList.toggle("otwarte", tak);
  el.querySelector(".zad-panel")?.setAttribute("aria-hidden", tak ? "false" : "true");
  if (tak) setTimeout(() => document.getElementById("zad-nowe")?.focus({ preventScroll: true }), 50);
}

export function rysujZadania(c) {
  let el = document.getElementById("zadania");
  if (!el) {
    el = document.createElement("aside");
    el.id = "zadania";
    document.body.appendChild(el);
  }
  const { html, otwarte } = panelZadan(c.v, c.d, c.kat, { edycja: c.edycja, tytul: c.tytulZakladki });
  const wpisywane = document.getElementById("zad-nowe")?.value || "";
  el.className = `zadania${wysuniete ? " otwarte" : ""}`;
  el.innerHTML = `<a class="zad-pasek" data-akcja="zadania-przelacz" title="Pokaż listę zadań">${ikona("bledy", 16)}<span>Zadania</span>${otwarte ? `<span class="zad-licznik">${otwarte}</span>` : ""}</a>
    <div class="zad-panel" aria-hidden="${wysuniete ? "false" : "true"}">${html}</div>`;
  const pole = document.getElementById("zad-nowe");
  if (pole && wpisywane) pole.value = wpisywane;
  return otwarte;
}

async function dodaj(c) {
  const pole = document.getElementById("zad-nowe"), tekst = (pole?.value || "").trim();
  if (!tekst) return toast("Wpisz treść zadania.");
  pole.value = "";
  const id = `z${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  await c.zmien((d) => { d.zadania_wlasne = [...wlasne(d), { id, tekst: tekst.slice(0, 120), zrobione: false }]; });
}

export const AKCJE_ZADAN = {
  "zadania-przelacz": () => przelacz(!wysuniete),
  "zadanie-idz": (el, c) => {
    if (el.dataset.park) { c.idz("mapa"); return oknoParku(c, el.dataset.park); }
    if (el.dataset.cel && c.dostepna(el.dataset.cel)) return c.idz(el.dataset.cel, "decyzje");
    return c.idz("lista_bledow", "decyzje");
  },
  "zadanie-dodaj": (el, c) => dodaj(c),
  "zadanie-odhacz": (el, c) => {
    if (!c.edycja) return toast("Zadania tej rundy są tylko do odczytu.");
    return c.zmien((d) => { d.zadania_wlasne = wlasne(d).map((z) => (z.id === el.dataset.id ? { ...z, zrobione: !z.zrobione } : z)); });
  },
  "zadanie-usun": (el, c) => c.zmien((d) => { d.zadania_wlasne = wlasne(d).filter((z) => z.id !== el.dataset.id); }),
};

// Enter w polu nowego zadania = Dodaj (wywoływane raz z app.js)
export function podepnijZadania(c) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "zad-nowe") { e.preventDefault(); dodaj(c()); }
    if (e.key === "Escape" && wysuniete) przelacz(false);
  });
  // klik obok listy ją zwija (faza przechwytywania – zanim klik przerysuje panel i odepnie cel od dokumentu)
  document.addEventListener("click", (e) => {
    if (wysuniete && e.target.isConnected && !e.target.closest("#zadania, .dymek, .zaslona")) przelacz(false);
  }, true);
}
