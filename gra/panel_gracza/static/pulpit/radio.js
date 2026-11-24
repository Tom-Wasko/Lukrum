// Radio „Fala Koziołka” (seria radio, decyzje 19.11 i 23.11.2026): ikona obok portfela wysuwa retro odbiornik, tylko dla nastroju (bez wpływu na grę).
// Stacje, nagrania i teksty prowadzącego są w dane/radio.yaml (adres /radio.json), pliki MP3 w static/radio/<stacja>/.
//  - stacje z muzyką grają nagrania w losowej kolejności, co kilka utworów odzywa się prowadzący (synteza mowy przeglądarki, pl-PL;
//    bez polskiego głosu tekst pojawia się tylko na skali); słuchowisko („Lalka”) idzie po kolei i pamięta miejsce;
//  - stacja „szum” nie ma plików: szum eteru robi Web Audio, ten sam szum słychać krótko przy przełączaniu stacji;
//  - nic nie gra samo: radio włącza dopiero kliknięcie (zasady przeglądarek), stan (stacja, głośność, głos) zostaje w localStorage;
//  - stacje zmienia się na samym odbiorniku: klik w skalę, gałka strojenia (klik albo strzałki), gałka głośności, włącznik;
//  - gdy radio gra, odgłosy miejsc cichną (lukrum.dzwiek.przycisz, dzwiek.js).
// Kolory tylko ze zmiennych (pulpit.css: .odb); stan nie samym kolorem (▶ ■ ♪ ▼).
import { esc } from "../zakladki/wspolne.js";

const KLUCZ = "lukrum-radio";
const el = (id) => document.getElementById(id);
let dane = null, ladowanie = null, audio = null, ctx = null, szumGlos = null;
let gra = false, kolejka = [], pozycja = -1, odUtworu = 0, mowa = null, mowaCzas = null, mowaPotem = null;
const st = wczytaj();
const przyciszTlo = (tak) => { try { window.lukrum?.dzwiek?.przycisz?.(tak); } catch { /* bez odgłosów miejsc */ } };
try { window.speechSynthesis?.getVoices(); } catch { /* głosy wczytują się w tle, pierwsza lista bywa pusta */ }

function wczytaj() {
  const dom = { stacja: null, glosnosc: 60, glos: true, sluchowisko: {} };
  try { return { ...dom, ...JSON.parse(localStorage.getItem(KLUCZ) || "{}") }; } catch { return dom; }
}
function zapisz() { try { localStorage.setItem(KLUCZ, JSON.stringify(st)); } catch { /* bez zapisu */ } }

async function pobierz() {
  if (dane) return dane;
  ladowanie ||= fetch("/radio.json").then((r) => { if (!r.ok) throw new Error("Radio nie odpowiada."); return r.json(); });
  dane = await ladowanie;
  if (!dane.stacje.some((s) => s.id === st.stacja)) st.stacja = dane.stacje[0].id;
  return dane;
}
const stacja = () => dane?.stacje.find((s) => s.id === st.stacja);
const losuj = (lista) => lista[Math.floor(Math.random() * lista.length)];
const wstaw = (wzor, n) => wzor.replace(/\{(\w+)\}/g, (_, k) => (n && n[k] != null ? String(n[k]) : ""));

// --- szum eteru (Web Audio): biały szum przez filtr pasmowy, z delikatnym trzaskiem; gałka głośności steruje wszystkim -----
function kontekst() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const bufor = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = bufor.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.0004 ? 3 : 0.5);
  const zrodlo = ctx.createBufferSource();
  zrodlo.buffer = bufor;
  zrodlo.loop = true;
  const filtr = ctx.createBiquadFilter();
  filtr.type = "bandpass";
  filtr.frequency.value = 1400;
  filtr.Q.value = 0.6;
  szumGlos = ctx.createGain();
  szumGlos.gain.value = 0;
  zrodlo.connect(filtr).connect(szumGlos).connect(ctx.destination);
  zrodlo.start();
  return ctx;
}
function szum(poziom, czas = 0.15) {   // poziom 0–1 względem gałki
  const c = kontekst();
  if (!c || !szumGlos) return;
  if (c.state === "suspended") c.resume();
  const g = poziom * (st.glosnosc / 100) * 0.35;
  szumGlos.gain.cancelScheduledValues(c.currentTime);
  szumGlos.gain.setTargetAtTime(g, c.currentTime, czas);
}
function trzask() {   // krótki szum przy przełączaniu stacji
  szum(1, 0.02);
  setTimeout(() => { if (stacja()?.rodzaj !== "szum") szum(0, 0.12); }, 650);
}

// --- odtwarzanie -------------------------------------------------------------------------------------------------------
function odtwarzacz() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.addEventListener("ended", () => nastepny(true));
  audio.addEventListener("error", () => { if (gra) { pokazNapis("Trzaski na linii – przełączam na następne nagranie."); setTimeout(() => nastepny(false), 1500); } });
  audio.addEventListener("timeupdate", () => {
    const s = stacja();
    if (s?.rodzaj === "sluchowisko" && gra && Math.floor(audio.currentTime) % 5 === 0) {
      st.sluchowisko[s.id] = { nr: pozycja, t: Math.floor(audio.currentTime) };
      zapisz();
    }
  });
  return audio;
}
function ulozKolejke(s) {
  const n = s.nagrania.map((_, i) => i);
  if (s.rodzaj === "muzyka") for (let i = n.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [n[i], n[j]] = [n[j], n[i]]; }
  kolejka = n;
  pozycja = -1;
}
function graj(nr, od = 0) {
  const s = stacja(), a = odtwarzacz(), n = s.nagrania[nr];
  a.src = n.url;
  a.volume = st.glosnosc / 100;
  if (od) a.addEventListener("loadedmetadata", () => { try { a.currentTime = od; } catch { /* bez przewijania */ } }, { once: true });
  a.play().catch((blad) => {   // przeglądarka nie pozwoliła zagrać (albo brak pliku): radio się wyłącza i mówi o tym na ekranie
    if (blad?.name === "AbortError") return;   // przerwane przez zmianę stacji albo wyłączenie, nie błąd
    gra = false;
    przyciszTlo(false);
    odswiez();
    pokazNapis("Nie udało się zagrać. Kliknij „Włącz” jeszcze raz.");
  });
  odswiez();
}
function nastepny(poKoncu) {
  const s = stacja();
  if (!gra || !s || s.rodzaj === "szum") return;
  if (s.rodzaj === "sluchowisko") {
    const nr = pozycja < 0 ? 0 : (pozycja + 1) % s.nagrania.length;
    pozycja = nr;
    st.sluchowisko[s.id] = { nr, t: 0 };
    zapisz();
    return graj(nr);
  }
  if (pozycja + 1 >= kolejka.length) ulozKolejke(s);
  pozycja += 1;
  const nr = kolejka[pozycja], n = s.nagrania[nr], p = dane.prowadzacy;
  odUtworu += 1;
  if (poKoncu && odUtworu >= (p.co_ile || 2)) {
    odUtworu = 0;
    const tekst = `${wstaw(losuj(p.wtracenia), {})} ${wstaw(losuj(p.zapowiedzi), n)}`;
    return powiedz(tekst, () => graj(nr));
  }
  graj(nr);
}

// --- prowadzący: synteza mowy (pl-PL), a bez polskiego głosu – sam napis na skali ------------------------------------
function glosPolski() {
  const g = window.speechSynthesis?.getVoices?.() || [];
  return g.find((x) => /^pl(-|_|$)/i.test(x.lang)) || null;
}
function powiedz(tekst, potem) {
  pokazNapis(tekst);
  const glos = st.glos && glosPolski();
  clearTimeout(mowaCzas);
  mowaPotem = potem;
  if (!glos) { mowaCzas = setTimeout(() => { mowaPotem = null; if (gra) potem(); }, 2500); return; }
  szum(0.15);
  const u = new SpeechSynthesisUtterance(tekst);
  u.voice = glos;
  u.lang = glos.lang;
  u.rate = 1.02;
  u.pitch = 0.9;
  u.volume = Math.min(1, st.glosnosc / 100 + 0.15);
  const koniec = () => { if (mowa !== u) return; mowa = null; mowaPotem = null; clearTimeout(mowaCzas); szum(0); if (gra) potem(); };
  u.onend = koniec;
  u.onerror = koniec;
  mowa = u;
  mowaCzas = setTimeout(koniec, 30000);   // gdyby przeglądarka nie zgłosiła końca mowy
  window.speechSynthesis.speak(u);
}
function ucisz() {
  mowa = null;
  mowaPotem = null;
  clearTimeout(mowaCzas);
  try { window.speechSynthesis?.cancel(); } catch { /* brak syntezy */ }
}
function pokazNapis(t) { const n = el("pp-radio-napis"); if (n) { n.textContent = t; n.hidden = !t; } }

function wlacz() {
  const s = stacja();
  gra = true;
  przyciszTlo(true);
  trzask();
  odUtworu = 0;
  if (s.rodzaj === "szum") { setTimeout(() => szum(0.55, 0.4), 700); pokazNapis(""); return odswiez(); }
  if (s.rodzaj === "sluchowisko") {
    const m = st.sluchowisko[s.id];
    pozycja = m && s.nagrania[m.nr] ? m.nr : 0;
    pokazNapis("");
    return graj(pozycja, m?.t || 0);
  }
  if (!kolejka.length || pozycja < 0) ulozKolejke(s);
  const powitanie = wstaw(losuj(dane.prowadzacy.powitania), { stacja: s.nazwa, fala: s.fala });
  pozycja += 1;
  const nr = kolejka[pozycja];
  powiedz(`${powitanie} ${wstaw(losuj(dane.prowadzacy.zapowiedzi), s.nagrania[nr])}`, () => graj(nr));
  odswiez();
}
function wylacz() {
  gra = false;
  przyciszTlo(false);
  ucisz();
  audio?.pause();
  szum(0);
  pokazNapis("");
  odswiez();
}

// --- odbiornik (wysuwa się spod dolnej krawędzi; rysunek w pulpit.css: .odb) -----------------------------------------------
const kat = (ulamek, zakres) => Math.round(-zakres / 2 + zakres * ulamek);
function htmlPanelu() {
  const d = dane;
  const skala = d.stacje.map((s) => `<button type="button" class="odb-st" data-akcja="radio-stacja" data-s="${esc(s.id)}" aria-pressed="false"
    title="${esc(s.opis)}"><b>${esc(s.fala)}</b><span>${esc(s.nazwa)}</span></button>`).join("");
  return `<div class="odb-antena" aria-hidden="true"><i></i><i></i></div>
    <div class="odb-szyld"><div><h2>${esc(d.nadawca.nazwa)}</h2><p>${esc(d.nadawca.opis)}</p></div>
      <button type="button" class="odb-schowaj" data-akcja="pp-radio" aria-label="Schowaj radio (muzyka gra dalej)">▾ Schowaj</button></div>
    <div class="odb-skala" id="pp-radio-skala" role="group" aria-label="Stacje (UKF, MHz)">${skala}<i class="odb-wskazowka" aria-hidden="true"></i></div>
    <div class="odb-pulpit">
      <div class="odb-g"><button type="button" class="odb-galka odb-strojenie" id="pp-radio-stroj" data-akcja="radio-strojenie" data-d="1"
        aria-label="Gałka strojenia: następna stacja (strzałki w lewo i w prawo zmieniają stację)"><i></i></button><span>Strojenie</span></div>
      <div class="odb-ekran" aria-live="polite"><p class="odb-teraz" id="pp-radio-teraz"></p><p class="odb-napis" id="pp-radio-napis" hidden></p></div>
      <div class="odb-g"><label class="odb-galka odb-glosnosc" id="pp-radio-galka"><input type="range" id="pp-radio-gl" min="0" max="100" step="5" value="${st.glosnosc}"
        aria-label="Głośność radia"><i></i></label><span>Głośność</span></div>
      <button type="button" class="odb-wl" id="pp-radio-wl" data-akcja="radio-wl" aria-pressed="false"></button></div>
    <div class="odb-dol"><button type="button" class="pp-lnk" id="pp-radio-dalej" data-akcja="radio-dalej">⏭ Następne nagranie</button>
      <button type="button" class="pp-lnk" id="pp-radio-glos" data-akcja="radio-glos" aria-pressed="${st.glos}"></button>
      <a class="pp-lnk" href="/nagrania-w-radiu" target="_blank" rel="noopener">Nagrania: autorzy i licencje (nowa karta)</a></div>`;
}
function odswiez() {
  const p = el("pp-radio-panel"), s = stacja();
  const b = el("pp-radio");
  if (b) {
    const z = b.querySelector(".pp-znak");
    if (z) { z.textContent = "♪"; z.hidden = !gra; }
    b.classList.toggle("gra", gra);
    b.title = gra && s ? `Radio: ${s.nazwa} (${s.fala} MHz) gra` : "Radio";
    b.setAttribute("aria-label", b.title);
  }
  if (!p || !dane || !p.dataset.zbudowany) return;
  const n = dane.stacje.length, idx = Math.max(0, dane.stacje.findIndex((x) => x.id === st.stacja));
  p.querySelectorAll(".odb-st").forEach((x) => { const t = x.dataset.s === st.stacja; x.setAttribute("aria-pressed", String(t)); x.classList.toggle("aktywny", t); });
  p.style.setProperty("--n", String(n));
  p.style.setProperty("--i", String(idx));
  el("pp-radio-stroj").style.setProperty("--kat", `${kat(n > 1 ? idx / (n - 1) : 0.5, 240)}deg`);
  el("pp-radio-galka").style.setProperty("--kat", `${kat(st.glosnosc / 100, 270)}deg`);
  p.classList.toggle("gra", gra);
  const wl = el("pp-radio-wl");
  wl.textContent = gra ? "■ Wyłącz" : "▶ Włącz";
  wl.setAttribute("aria-pressed", String(gra));
  wl.classList.toggle("aktywny", gra);
  const nagr = gra && s?.rodzaj !== "szum" && pozycja >= 0 ? s.nagrania[s.rodzaj === "muzyka" ? kolejka[pozycja] : pozycja] : null;
  el("pp-radio-teraz").innerHTML = !gra ? `<small>Wyłączone</small> ${esc(s.nazwa)} · ${esc(s.fala)} MHz`
    : nagr ? `<small>Na antenie ♪</small> <b>${esc(nagr.tytul)}</b> – ${esc(nagr.wykonawca)}${nagr.rok ? ` (${esc(String(nagr.rok))})` : ""}`
      : `<small>Na antenie ♪</small> ${esc(s.opis)}`;
  el("pp-radio-dalej").hidden = s.rodzaj === "szum";
  el("pp-radio-dalej").textContent = s.rodzaj === "sluchowisko" ? "⏭ Następny rozdział" : "⏭ Następne nagranie";
  const g = el("pp-radio-glos");
  g.textContent = `Głos prowadzącego: ${st.glos ? "✓ włączony" : "wyłączony"}`;
  g.setAttribute("aria-pressed", String(st.glos));
}
function zmienGlosnosc(v) {
  st.glosnosc = v;
  zapisz();
  if (audio) audio.volume = v / 100;
  if (gra && stacja()?.rodzaj === "szum") szum(0.55, 0.05);
  odswiez();
}

export const radioOtwarte = () => !!el("pp-radio-panel") && !el("pp-radio-panel").hidden;
export function zamknijRadio() {
  const p = el("pp-radio-panel");
  if (p) p.hidden = true;
  el("pp-radio")?.setAttribute("aria-expanded", "false");
}
export async function przelaczRadio() {
  const p = el("pp-radio-panel");
  if (!p.hidden) return zamknijRadio();
  await pobierz();
  if (!p.dataset.zbudowany) {
    p.innerHTML = htmlPanelu();
    p.dataset.zbudowany = "1";
    el("pp-radio-gl").addEventListener("input", (e) => zmienGlosnosc(+e.target.value));
    p.addEventListener("keydown", (e) => {   // strzałki na skali i gałce strojenia zmieniają stację (suwak głośności ma swoje strzałki)
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d || !e.target.closest?.(".odb-skala, .odb-strojenie")) return;
      e.preventDefault();
      const naSkali = !!e.target.closest(".odb-skala");
      AKCJE_RADIA["radio-strojenie"]({ dataset: { d: String(d) } }).then(() => { if (naSkali) p.querySelector(".odb-st.aktywny")?.focus?.({ preventScroll: true }); });
    });
  }
  p.hidden = false;
  el("pp-radio")?.setAttribute("aria-expanded", "true");
  odswiez();
  el("pp-radio-wl").focus({ preventScroll: true });
}

function zmienStacje(id) {
  ucisz();
  audio?.pause();
  st.stacja = id;
  zapisz();
  kolejka = [];
  pozycja = -1;
  wlacz();
}

export const AKCJE_RADIA = {
  "pp-radio": () => przelaczRadio(),
  "radio-wl": async () => { await pobierz(); if (gra) wylacz(); else wlacz(); },
  "radio-stacja": async (e) => {
    await pobierz();   // wybór stacji włącza radio (jak klawisz w starym odbiorniku)
    if (e.dataset.s === st.stacja && gra) return;
    zmienStacje(e.dataset.s);
  },
  "radio-strojenie": async (e) => {   // gałka strojenia: następna (d = 1) albo poprzednia (d = -1) stacja, z zawinięciem
    await pobierz();
    const n = dane.stacje.length, i = Math.max(0, dane.stacje.findIndex((x) => x.id === st.stacja));
    zmienStacje(dane.stacje[(i + (+e.dataset.d || 1) + n) % n].id);
  },
  "radio-dalej": () => { if (!gra) return; ucisz(); audio?.pause(); trzask(); setTimeout(() => nastepny(false), 400); },
  "radio-glos": () => {   // wyłączenie głosu w trakcie zapowiedzi: od razu następne nagranie
    st.glos = !st.glos;
    zapisz();
    const potem = mowaPotem;
    if (!st.glos && potem) { ucisz(); szum(0); if (gra) potem(); }
    odswiez();
  },
};
