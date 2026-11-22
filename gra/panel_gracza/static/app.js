// Interfejs gry: menu, nawigacja po rundach, DECYZJE / WYNIKI, zapisywanie roboczych decyzji.
import { esc, godzina, nazwaRundy, niezatwierdzone, OKRES, okno, przelaczSortowanie, skrotRundy, teczka, toast, twardeSpacje, ustawKalendarz, ustawNazwyDan, wyczyscWykresy, zamknijOkno, zamknijTeczke, zapamietajZwiniecie, zl }
  from "./zakladki/wspolne.js";
import ZAKLADKI, { ALIAS, ELEMENT, IKONY, MENU, OD_RUNDY } from "./zakladki/index.js";
import { ikona } from "./zakladki/ikony.js";
import { przebiteOferty } from "./zakladki/lokale.js";
import { kolko, zwinPodpowiedzi } from "./zakladki/dymki.js";
import { AKCJE_ZADAN, podepnijZadania, rysujZadania } from "./zakladki/zadania.js";
import { HASLO, HASLO_SZPERACZ, jestSzperaczem, zapamietajHaslo, zapamietajSzperacza } from "./zakladki/kasyno.js";
import { funkcjaZakladki, funkcjeZakladek, oknoFunkcji, oknoUstawienFunkcji, oknoZakryciaFunkcji, saZakryte, ukryta as ukrytaF, wylaczona as wylaczonaF,
  zakryta as zakrytaF, zakrytaFunkcja, znaczekFunkcji } from "./zakladki/funkcje.js";
import { aktualneMiejsce, aktualneQ, idzDoMiejsca, MIEJSCA, okruszek, otworzBudynek, ustawMiejsce } from "./swiat/swiat.js";
import { stylEkranu, ukladEkranu } from "./pulpit/karty-style.js";
import { ustawWybrany } from "./zakladki/lokal_wybor.js";
import { zlozona } from "./zakladki/lokal.js";
import { zdejmijFiltrAgencji } from "./zakladki/marketing.js";
import { AKCJE_PULPITU, odswiezPulpit, PULPIT } from "./pulpit/pulpit.js";

const start = () => (PULPIT ? "mapa" : "dashboard");   // ekran startowy: pulpit – mapa na cały ekran; stary układ (?uklad=stary) – plan rundy
const S = { teczka: null, v: null, kat: null, zakladka: null, tryb: "decyzje", runda: null, d: {}, zapis: Promise.resolve(),
  nrZapytania: 0, oczekujace: 0, poleZmiany: null, odliczanie: null, zadania: 0 };

const postep = document.createElement("div");
postep.className = "postep";
document.body.appendChild(postep);
let aktywne = 0;
function trwa(tak) { aktywne += tak ? 1 : -1; postep.classList.toggle("trwa", aktywne > 0); }

// Token CSRF Django (ciasteczko ustawia strona gry).
const csrf = () => document.cookie.match(/(?:^|; )csrftoken=([^;]*)/)?.[1] ?? "";

async function api(sciezka, opcje = {}) {
  trwa(true);
  try {
    const r = await fetch(sciezka, { headers: { "Content-Type": "application/json", "X-CSRFToken": csrf() }, ...opcje });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.blad || `Błąd ${r.status}`);
    return j;
  } finally { trwa(false); }
}

const kopia = (x) => JSON.parse(JSON.stringify(x ?? {}));

// Wczytanie widoku rundy. Szybkie klikanie strzałek: liczy się tylko ostatnie zapytanie.
async function wczytaj(runda = S.runda) {
  const nr = ++S.nrZapytania;
  const q = runda ? `?runda=${runda}` : "";
  const v = await api(`/api/gry/${GRA}/widok/${encodeURIComponent(FIRMA)}${q}`);
  if (nr === S.nrZapytania) ustaw(v);
}

function ustaw(v, { poZapisie = false, lokalnie = null } = {}) {
  S.v = v;
  ustawKalendarz(v.gra.kalendarz);
  ustawNazwyDan(v.nazwy_dan);
  S.runda = v.runda;
  S.d = kopia(v.decyzje);
  S.zakladka = docelowa(S.zakladka);
  const z = ZAKLADKI[S.zakladka];
  if (!z || !dostepna(z) || ukrytaF(v, S.zakladka)) S.zakladka = start();   // funkcje gry: zakryta – tylko po odsłonięciu
  if (S.tryb === "wyniki" && !maWyniki(ZAKLADKI[S.zakladka])) S.tryb = "decyzje";
  if (S.tryb === "decyzje" && !ZAKLADKI[S.zakladka].decyzje && maWyniki(ZAKLADKI[S.zakladka])) S.tryb = "wyniki";
  if (poZapisie && lokalnie) {   // zmiana tylko we fragmencie zakładki: bez przerysowania całej strony (skoku, utraty przewijania)
    S.zadania = rysujZadania(ctx());
    rysujMenu();
    odswiezPulpit(ctx());
    lokalnie();
  } else if (poZapisie) rysujPoWyjsciuZPola(); else rysuj();
}

// Po zapisie gracz bywa już w kolejnym polu (otwarta lista stawek VAT, wpisywana kwota) – przerysowanie zamknęłoby
// listę i skasowało wpisywane znaki, więc karta odświeża się dopiero po wyjściu z pola (pole właśnie zatwierdzone –
// od razu).
function rysujPoWyjsciuZPola() {
  const el = document.activeElement;
  if (el?.matches?.("#karta select, #karta input, .teczka select, .teczka input") && el !== S.poleZmiany) {
    el.addEventListener("blur", () => setTimeout(rysujPoWyjsciuZPola), { once: true });
    return;
  }
  rysuj();
}

// --- zmiana decyzji: fn modyfikuje roboczy szkic, potem zapis i odświeżenie widoku --------------
// mistrz gry ogląda drużynę uczniów albo gra jest wstrzymana – decyzji nie można zmieniać (api/widoki.py: _moze_zmieniac)
const blokada = (v) => v.tylko_odczyt ? "Podgląd mistrza gry – decyzje drużyny są tylko do odczytu."
  : v.prowadzenie?.pauza && !v.gra.zakonczona ? "Gra jest wstrzymana przez mistrza gry – decyzje poczekają na wznowienie." : "";

const terminKrotko = (iso) => new Date(iso).toLocaleString("pl-PL", { weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

// `lokalnie` (opcjonalnie): funkcja, która po zapisie odświeża tylko zmieniony fragment zamiast całej zakładki
async function zmien(fn, lokalnie = null) {
  if (!S.v.edycja) return toast("Podgląd poprzedniej rundy – decyzji nie można zmieniać.");
  if (blokada(S.v)) return toast(blokada(S.v));
  if (S.v.wyslane) return toast("Decyzje są wysłane. Wróć do podejmowania decyzji przez „List z decyzjami” na poczcie.");
  fn(S.d);
  S.oczekujace++;
  S.zapis = S.zapis.then(async () => {
    const nr = ++S.nrZapytania;
    try {
      // wersja: ktoś z drużyny zapisał w międzyczasie → 409 i wczytanie jego decyzji (bez nadpisania)
      const wersja = S.v.druzyna?.autorzy?.wersja ?? "";
      const zakladka = encodeURIComponent(ZAKLADKI[S.teczka?.k || S.zakladka]?.tytul || S.zakladka || "");   // dziennik zapisów (MG)
      const v = await api(`/api/gry/${GRA}/decyzje/${encodeURIComponent(FIRMA)}?wersja=${wersja}&zakladka=${zakladka}`,
        { method: "PUT", body: JSON.stringify(S.d) });
      // w kolejce czeka nowsza zmiana: szkic S.d już ją ma (ustaw by ją skasował) – tylko nowa wersja do zapisu
      if (S.oczekujace > 1) S.v = v;
      else if (nr === S.nrZapytania) ustaw(v, { poZapisie: true, lokalnie: S.oczekujace > 1 ? null : lokalnie });
    } catch (e) { toast(e.message); await wczytaj(); }
    finally { S.oczekujace--; }
  });
  return S.zapis;
}

const odbl = (k) => S.v.odblokowane.includes(k);
const odRundy1 = (k) => S.v.harmonogram?.[ELEMENT[k]] ?? OD_RUNDY[k];   // gra z lokalami: harmonogram gry (MG)
// zakładka złożona (Mój lokal, Kuchnia, …) – najwcześniejsza runda jej części
const najwczesniej = (lista) => lista.reduce((m, r) => (r && (!m || r < m) ? r : m), null);
const odRundy = (k) => odRundy1(k) ?? (ZAKLADKI[k]?.czesci ? najwczesniej(ZAKLADKI[k].czesci.map(odRundy1)) : null);
function dostepna(z) { return !z.odblokowanie || (typeof z.odblokowanie === "function" ? z.odblokowanie(S.v) : odbl(z.odblokowanie)); }
const maWyniki = (z) => !!(z && z.wyniki && S.v.wyniki && (!z.wynikiOd || S.v.runda >= z.wynikiOd) && (!z.wynikiGdy || z.wynikiGdy(S.v)));
// dawne zakładki (oferta, dostawcy, …) są częściami zakładek złożonych – link prowadzi do zakładki i jej części
const docelowa = (k) => (PULPIT && k === "dashboard" ? "mapa" : ALIAS[k] && ZAKLADKI[ALIAS[k]] ? ALIAS[k] : k);   // pulpit: plan rundy jest w zeszycie wujka
function pokazCzesc(k) {
  if (!ALIAS[k]) return;
  const el = document.getElementById(`czesc-${k}`);
  if (el) el.scrollIntoView({ block: "start" });
}
const kluczZakladki = (z) => Object.keys(ZAKLADKI).find((k) => ZAKLADKI[k] === z);

// --- funkcje gry : zakryta – okno „Odsłoń” zamiast zakładki, wyłączona – Pulpit -------------
function pokazOknoFunkcji(klucze, cel) {
  const [tytul, html, przyciski] = oknoFunkcji(S.v, klucze, cel, { mg: !!S.v.tylko_odczyt });
  okno(tytul, html, { male: klucze.length === 1, srednie: klucze.length > 1, przyciski, styl: stylEkranu("ustawienia"), okruszek: "Lublin › Funkcje gry" });
}
// przejście do zakładki `k` (także dawny klucz) obsłużone tu – true: zakładka się nie otwiera
function przechwycFunkcje(k) {
  if (wylaczonaF(S.v, k)) {
    toast("Ta funkcja jest wyłączona w tej grze – zostaje Pulpit.");
    S.zakladka = start(); S.tryb = "decyzje"; rysuj();
    return true;
  }
  const f = funkcjaZakladki(S.v, k);
  if (!zakrytaFunkcja(f)) return false;
  pokazOknoFunkcji([f.klucz], docelowa(k));
  return true;
}
// Odsłoń / znów zakryj (to nie decyzja – działa też po wysłaniu i w pauzie); `cel` – zakładka po odsłonięciu
async function przelaczFunkcje(funkcja, odslonieta, cel = "") {
  await S.zapis;   // najpierw zapis roboczych decyzji – widok z odpowiedzi zastąpi szkic
  const v = await api(`/api/gry/${GRA}/funkcje/${encodeURIComponent(FIRMA)}`,
    { method: "POST", body: JSON.stringify({ funkcja, odslonieta }) });
  // zakładka funkcji jest dostępna dopiero od późniejszej rundy – wtedy gracz zostaje tam, gdzie był (bez cofania na Pulpit)
  S.v = v;
  const wejdz = !!(cel && ZAKLADKI[cel] && dostepna(ZAKLADKI[cel]) && !ukrytaF(v, cel));
  if (wejdz) { S.zakladka = cel; S.tryb = ZAKLADKI[cel].decyzje ? "decyzje" : "wyniki"; }
  zamknijOkno();
  ustaw(v);
  const f = v.funkcje?.[funkcja] || {};
  if (odslonieta) toast(`${f.nazwa || funkcja}: odsłonięte – od teraz decyzje podejmujecie sami.`
    + (cel && !wejdz && f.od_rundy && f.od_rundy > v.runda ? ` Ta część gry od rundy ${f.od_rundy}.` : ""));
  else toast(`${f.nazwa || funkcja}: znów zakryte – od tej rundy gra robi to za Was.`);
}
const oknoUstawien = () => okno("Funkcje gry", oknoUstawienFunkcji(S.v, { mg: !!S.v.tylko_odczyt }), { male: true, styl: stylEkranu("ustawienia"), okruszek: "Lublin › Ustawienia" });
// ⚙ → „Funkcje gry” – tylko gdy mistrz gry coś zakrył (menu ⚙ buduje motyw.js; tu dopisujemy pozycję)
function menuUstawien() {
  const lista = document.getElementById("ustawienia-lista");
  if (!lista) return;
  let el = document.getElementById("ustawienia-funkcje");
  const sekcja = document.getElementById("pp-sek-gra");   // pulpit: „Funkcje gry” w sekcji Gra panelu ustawień
  if (!saZakryte(S.v)) { if (sekcja) sekcja.hidden = true; return el?.remove(); }
  if (el) return;
  el = document.createElement("a");
  Object.assign(el, { id: "ustawienia-funkcje", href: "#", textContent: "Funkcje gry" });
  el.dataset.akcja = "funkcje-gry";
  if (sekcja) { sekcja.hidden = false; sekcja.appendChild(el); } else lista.insertBefore(el, lista.querySelector(".wybor-motywu"));
}
function zamknijUstawienia() {
  const lista = document.getElementById("ustawienia-lista");
  if (lista) lista.hidden = true;
  document.querySelector(".ustawienia-przycisk")?.setAttribute("aria-expanded", "false");
}

// v, d i edycja zawsze bieżące – akcja po `await c.zmien(…)` (np. ponowne otwarcie okna) widzi zapisane decyzje
const ctx = () => ({ get v() { return S.v; }, kat: S.kat, get d() { return S.d; }, get zakladka() { return S.zakladka; },
  get edycja() { return S.v.edycja && !S.v.wyslane && !blokada(S.v); }, zmien, api, wczytaj, ustaw, rysuj,
  dostepna: (k) => !!ZAKLADKI[k] && dostepna(ZAKLADKI[k]) && !wylaczonaF(S.v, k), tytulZakladki: (k) => ZAKLADKI[k]?.tytul ?? k,
  zakryta: (k) => zakrytaF(S.v, k), wylaczona: (k) => wylaczonaF(S.v, k),
  // świat gry (swiat/swiat.js): stan ekranu, do którego prowadzi klikalne miejsce sceny
  jestZakladka: (k) => !!ZAKLADKI[docelowa(k)], ukryta: (k) => !!ZAKLADKI[docelowa(k)]?.ukryta?.(S.v) || ukrytaF(S.v, k), docelowa,
  odRundy: (k) => odRundy(docelowa(k)), wybierzLokal: ustawWybrany,
  // teczka: ekran decyzji w oknie nad wnętrzem (zamiast przejścia na osobną kartę); bez zmiany S.zakladka
  teczka: (k, tryb) => otworzTeczke(k, tryb),
  idz: (k, tryb) => {
    if (przechwycFunkcje(k)) return;
    const cel = docelowa(k);
    if (S.teczka && S.zakladka === "miejsce" && !["mapa", "miejsce"].includes(cel) && ZAKLADKI[cel]) return otworzTeczke(k, tryb);   // z teczki do kolejnego ekranu – nadal w teczce
    S.zakladka = cel; S.tryb = tryb || (ZAKLADKI[cel].decyzje ? "decyzje" : "wyniki"); rysuj(); pokazCzesc(k);
  } });

// --- teczka: ekran decyzji w oknie nad wnętrzem (punkt sceny nie przenosi na osobną kartę) ---------------------------
// S.teczka = { k: klucz zakładki, tryb, miejsce: wnętrze, nad którym leży }. Zamyka się razem z opuszczeniem wnętrza.
// Punkt sceny wskazuje jedną sprawę (np. „wyposazenie” albo „dekor”), a dawny klucz przez ALIAS prowadzi do zakładki złożonej z kilku
// części. Okno nad wnętrzem pokazuje wtedy tylko wskazaną część (z kafelkami wyboru lokalu), nie całą złożoną zakładkę (podróż 02/sklepy).
const SAME_CZESCI = {};
function zakladkaOkna(k, cel) {
  const zl_ = ZAKLADKI[cel], czesc = ZAKLADKI[k];
  if (!zl_?.czesci || zl_.czesci.length < 2 || k === cel || !zl_.czesci.includes(k) || !czesc) return zl_;
  return SAME_CZESCI[k] || (SAME_CZESCI[k] = zlozona({ tytul: czesc.tytul, tytulPelny: czesc.tytulPelny, info: czesc.info, czesci: { [k]: czesc }, bezLokali: !!zl_.bezLokali,
    odRundy: (v, kk) => v.harmonogram?.[ELEMENT[kk]] ?? OD_RUNDY[kk] }));
}
function otworzTeczke(k, tryb) {
  if (przechwycFunkcje(k)) return;
  const cel = docelowa(k);
  if (!ZAKLADKI[cel] || !dostepna(ZAKLADKI[cel])) return;
  const zak = zakladkaOkna(k, cel);
  S.teczka = { k: cel, zak, tryb: tryb || (zak.decyzje ? (S.v.edycja ? "decyzje" : maWyniki(zak) ? "wyniki" : "decyzje") : "wyniki"), czesc: k,
    miejsce: `${aktualneMiejsce()}?${aktualneQ() || ""}` };
  rysujTeczke();
  pokazCzesc(k);
}
function rysujTeczke() {
  const t = S.teczka, v = S.v;
  const z = t && (t.zak || ZAKLADKI[t.k]);
  if (!t || !z || S.zakladka !== "miejsce" || t.miejsce !== `${aktualneMiejsce()}?${aktualneQ() || ""}` || !dostepna(z) || ukrytaF(v, t.k)) {
    S.teczka = null; zamknijTeczke(); return;
  }
  const c = ctx(), wyniki = maWyniki(z), decyzje = !!z.decyzje && !(v.koniec && wyniki);
  const tryb = (t.tryb === "wyniki" || v.koniec) && wyniki ? "wyniki" : decyzje ? "decyzje" : "wyniki";
  // przełącznik Decyzje | Wyniki w nagłówku teczki (obok ✕): bieżąca runda albo ostatni wynik tej funkcji; niedostępny – wyszarzony z podpowiedzią
  const bezWynikow = !z.wyniki ? "Ta funkcja nie ma ekranu wyników" : !v.wyniki ? "Wyniki pojawią się po pierwszym przeliczonym tygodniu" : "Na razie brak wyników tej funkcji";
  const bezDecyzji = !z.decyzje ? "Ta funkcja nie ma ekranu decyzji" : "Gra zakończona – decyzji już nie podejmuje się";
  const przycisk = (t, napis, aktywny, mozna, opis) => `<button type="button" data-akcja="teczka-tryb" data-t="${t}" aria-pressed="${aktywny}"${mozna ? "" : ` aria-disabled="true" title="${opis}"`}
      class="${aktywny ? "aktywny" : ""}${mozna ? "" : " szare"}">${napis}</button>`;
  const przelacznik = z.decyzje || wyniki ? `<div class="teczka-tryb" role="group" aria-label="Widok ekranu">${przycisk("decyzje", "Decyzje", tryb === "decyzje", decyzje, bezDecyzji)}${przycisk("wyniki", "Wyniki", tryb === "wyniki", wyniki, bezWynikow)}</div>` : "";
  const tresc = tryb === "wyniki" ? z.wyniki(c) : z.decyzje(c);
  const podglad = v.koniec ? `<div class="komunikat">Gra zakończona. Tu są wyniki ostatniej rundy (${v.gra.liczba_rund}).</div>`
    : !v.edycja && v.runda < v.gra.runda ? `<div class="komunikat">Podgląd rundy ${v.runda} (${v.miesiac}) – decyzje z tej rundy są tylko do odczytu.</div>` : "";
  const zablokowane = v.edycja && blokada(v) && tryb === "decyzje" ? `<div class="komunikat">${esc(blokada(v))}</div>` : "";
  const wyslane = !zablokowane && v.edycja && v.wyslane && tryb === "decyzje" && t.k !== "wyslij"
    ? `<div class="komunikat ok">Decyzje tej rundy są wysłane. Aby je zmienić, wróć do podejmowania decyzji przyciskiem „List z decyzjami” na pasku.</div>` : "";
  const opis = typeof z.info === "function" ? z.info(c, tryb) : z.info;
  const html = `${opis ? `<div class="teczka-opis">${kolko(opis)}</div>` : ""}${podglad}${zablokowane}${wyslane}${tresc}`;
  const okno_ = teczka(`${ikona(IKONY[t.k])} ${z.tytulOkna?.(v) || z.tytulPelny || z.tytul}`, html, {
    naglowek: przelacznik, poZamknieciu: () => { if (S.teczka === t) S.teczka = null; },
    styl: stylEkranu(t.czesc, t.k), okruszek: `Lublin › ${esc(MIEJSCA[aktualneMiejsce()]?.tytul || "Miejsce")}${tryb === "wyniki" ? " › Wyniki" : ""}`,
    klucz: t.czesc || t.k, uklad: tryb === "decyzje" ? ukladEkranu(t.czesc, t.k) : null });
  for (const a of okno_.querySelectorAll("[data-zakladka-k]")) if (wylaczonaF(v, a.dataset.zakladkaK)) a.remove();
  zwinPodpowiedzi(okno_);
  if (z.po) z.po(c, tryb);
}

// --- rysowanie ---------------------------------------------------------------------------------
const widocznePod = (pod) => pod.filter((k) => !ZAKLADKI[k]?.ukryta?.(S.v) && !wylaczonaF(S.v, k));
const tytulBlokady = (k) => (odRundy(k) ? `Dostępne od rundy ${odRundy(k)}` : "Jeszcze niedostępne");
const TYTUL_ZAKRYTEJ = "Funkcja zakryta – gra robi ją za Was. Kliknij, żeby zobaczyć opis i odsłonić";
const otwarta = (k) => dostepna(ZAKLADKI[k]) && !zakrytaF(S.v, k);

// podzakładka (rozwijane menu, pasek nad treścią): zakryta funkcja (oko, znaczek), zablokowana (kłódka, „od rundy N”)
function pozycjaPod(k, rozmiar, dodatek = "") {
  const f = funkcjaZakladki(S.v, k), zk = zakrytaFunkcja(f), zb = !zk && !dostepna(ZAKLADKI[k]);
  const od = (zk || zb) && !dostepna(ZAKLADKI[k]) ? odRundy(k) : null;   // zakryta, a jeszcze nieodblokowana – też „od rundy N”
  const kl = [k === S.zakladka ? "aktywna" : "", zb ? "zablokowana" : "", zk ? "zakryta" : ""].filter(Boolean).join(" ");
  const tytul = zk ? ` title="${TYTUL_ZAKRYTEJ}" data-funkcje="${f.klucz}"` : zb ? ` title="${tytulBlokady(k)}"` : "";
  return `<a data-zakladka="${k}"${dodatek} class="${kl}"${tytul}>
    ${ikona(zk ? "oko" : zb ? "klodka" : IKONY[k], rozmiar)}${ZAKLADKI[k].tytul}${zk ? znaczekFunkcji(S.v, [f.klucz]) : ""}${od ? `<span class="od">od rundy ${od}</span>` : ""}</a>`;
}

function rysujMenu() {
  const czerwone = S.v.lista_bledow.filter((b) => b.poziom === "czerwony").length;
  // podgląd mistrza gry: to samo menu co drużyna, z notką (decyzja autora 10.11)
  const notka = S.v.tylko_odczyt && Object.values(S.v.funkcje || {}).some(zakrytaFunkcja)
    ? `<div class="menu-notka">${ikona("oko", 14)}<span>Tak widzi menu drużyna – zakryte funkcje są wyszarzone</span></div>` : "";
  document.getElementById("menu").innerHTML = notka + MENU.filter((poz) => poz.sekcja !== undefined
    || (!ZAKLADKI[poz.klucz]?.ukryta?.(S.v) && !wylaczonaF(S.v, poz.klucz)))
    .map((poz) => poz.pod ? { ...poz, pod: widocznePod(poz.pod) } : poz).filter((poz) => !poz.pod || poz.pod.length).map((poz) => {
    if (poz.sekcja !== undefined) return `<div class="sekcja ${poz.sekcja ? "" : "linia"}" data-nazwa="${esc(poz.sekcja)}"></div>`;
    const z = ZAKLADKI[poz.klucz] || {};
    const pod = poz.pod ? `<div class="pod">${poz.pod.map((k) => pozycjaPod(k, 18)).join("")}</div>` : "";
    const aktywna = poz.klucz === S.zakladka || (poz.pod || []).includes(S.zakladka) || (S.zakladka === "miejsce" && (poz.miejsca || [poz.miejsce]).includes(aktualneMiejsce()));
    // funkcje gry: grupa szara z okiem dopiero, gdy wszystkie jej podzakładki są zakryte (okno – wszystkie jej funkcje)
    const wszystkie = poz.pod || [poz.klucz], zakryta = wszystkie.every((k) => zakrytaF(S.v, k));
    const funkcje = funkcjeZakladek(S.v, wszystkie.filter((k) => zakrytaF(S.v, k)));
    const zablokowana = !zakryta && (poz.pod ? !poz.pod.some(otwarta) : !dostepna(z));
    const cel = poz.pod ? poz.pod.find(otwarta) || poz.pod.find((k) => !zakrytaF(S.v, k)) || poz.pod[0] : poz.klucz;
    const znaczek = poz.klucz === "lista_bledow" && czerwone && S.v.edycja ? `<span class="znaczek">${czerwone}</span>`
      : znaczekFunkcji(S.v, funkcje);
    // obok Listy błędów – przycisk panelu zadań (z liczbą otwartych zadań)
    const zadania = poz.klucz === "lista_bledow" ? `<div class="poz"><a data-akcja="zadania-przelacz" title="Lista zadań – panel po prawej">
      ${ikona("ok")}Zadania${S.zadania ? `<span class="znaczek zad">${S.zadania}</span>` : ""}</a></div>` : "";
    // „od rundy N” także przy zakrytej, a jeszcze nieodblokowanej funkcji (oko zamiast kłódki)
    const nieodbl = poz.pod ? !poz.pod.some((k) => dostepna(ZAKLADKI[k])) : !dostepna(z);
    const od = zablokowana || (zakryta && nieodbl) ? (poz.pod ? najwczesniej(poz.pod.map(odRundy)) : odRundy(poz.klucz)) : null;
    const tytulOd = zakryta ? ` title="${TYTUL_ZAKRYTEJ}" data-funkcje="${funkcje.join(",")}"`
      : zablokowana ? ` title="${od ? `Dostępne od rundy ${od}` : "Jeszcze niedostępne"}"` : "";
    const dokad = poz.miejsce && !zakryta ? `data-miejsce="${poz.miejsce}"` : `data-zakladka="${cel}"`;
    return `<div class="poz ${poz.klasa || ""}" data-dzial="${poz.klucz}"><a ${dokad} class="${aktywna ? "aktywna" : ""} ${zablokowana ? "zablokowana" : ""} ${zakryta ? "zakryta" : ""}"${tytulOd}>
      ${ikona(zakryta ? "oko" : zablokowana ? "klodka" : poz.ikona)}${poz.tytul}${znaczek}${od ? `<span class="od-gora">od rundy ${od}</span>` : ""}</a>${pod}</div>${zadania}`;
  }).join("");
}

function podzakladki() {
  const grupa = MENU.find((p) => (p.pod || []).includes(S.zakladka));
  if (!grupa) return "";
  return `<div class="podzakladki">${grupa.miejsce ? okruszek(S.zakladka) : ""}${widocznePod(grupa.pod).map((k) => pozycjaPod(k, 16, ' data-pod="1"')).join("")}</div>`;
}

// drużyna kilku osób: kto ostatnio zapisał decyzje
function ostatniZapis(v) {
  const z = v.druzyna?.autorzy?.zapisal;
  if (!z || (v.druzyna.sklad || []).length < 2) return "";
  return `<span class="chip" title="Ostatni zapis decyzji drużyny">Zapisał(a): ${esc(z.nazwa.split(" ")[0])}, ${godzina(z.kiedy)}</span>`;
}

function chipDruzyny(v) {
  const sklad = v.druzyna?.sklad || [];
  if (!sklad.length) return "";
  const imiona = sklad.map((o) => o.nazwa.split(" ")[0]);
  return `<span class="chip" title="Drużyna: ${esc(sklad.map((o) => o.nazwa).join(", "))}">${ikona("osoba", 14)}${esc(imiona.join(", "))}</span>`;
}

// Po końcu gry ostatni element osi to podsumowanie: wyniki ostatniej rundy i końcowe miejsce.
const koniecGry = (v, r) => v.gra.zakonczona && r > v.gra.liczba_rund;
const napisRundy = (v, r) => koniecGry(v, r) ? `Koniec gry (<b>podsumowanie</b>)`
  : `<b>${esc(nazwaRundy(r))}</b>${r === v.gra.runda && !v.gra.zakonczona ? "" : " · podgląd"}`;

// Oś rund: każda runda to jeden element (w motywach: talerz na sztandze, kolumna grafiku, pole tablicy wyników).
function osRund(v, runda) {
  const lmin = v.gra.runda_startowa || 1, lmax = v.gra.runda;
  const dochod = Object.fromEntries((v.historia || []).map((h) => [h.runda, h.dochod_netto]));
  let html = "";
  for (let r = lmin; r <= Math.max(lmax, v.gra.liczba_rund); r++) {
    if (koniecGry(v, r)) {
      html += `<span class="runda-os ${r === runda ? "ogladana" : ""}" data-r="${r}" data-akcja="runda-idz" title="Koniec gry: wyniki ostatniej rundy i końcowe miejsce"><b>🏁</b></span>`;
      continue;
    }
    const rozegrana = r < v.gra.runda, strata = dochod[r] != null && dochod[r] < 0;
    const n = nazwaRundy(r);
    const opis = dochod[r] != null ? `${n}: dochód netto ${zl(dochod[r])}`
      : rozegrana ? `${n}: rozegrana` : r === v.gra.runda ? `${n}: bieżąca runda` : `${n}: przed Tobą`;
    const kl = [rozegrana ? "rozegrana" : "", strata ? "strata" : "", r === v.gra.runda && !v.gra.zakonczona ? "biezaca" : "",
      r === runda ? "ogladana" : "", r > lmax ? "przyszla" : ""].filter(Boolean).join(" ");
    html += `<span class="runda-os ${kl}" data-r="${r}" ${r <= lmax ? `data-akcja="runda-idz"` : ""} title="${esc(opis)}"><b>${esc(skrotRundy(r))}</b></span>`;
  }
  return `<div class="os-rund" aria-label="Rundy gry">${html}</div>`;
}

function glowa(v, z, tryb, decyzje, wyniki, runda, opis = "") {
  const lmin = v.gra.runda_startowa || 1, lmax = v.gra.runda;
  return `<div class="karta-glowa">
      <div class="tytul">${ikona(IKONY[S.zakladka])}${z.tytulPelny || z.tytul}${kolko(opis)}</div>
      <div class="nawigator">
        <span class="strzalka ${runda <= lmin ? "wylaczona" : ""}" data-akcja="runda" data-d="-1" title="Poprzednia runda">${ikona("lewo", 18)}</span>
        <span class="miesiac" id="nawigator-miesiac">${napisRundy(v, runda)}</span>
        <span class="strzalka ${runda >= lmax ? "wylaczona" : ""}" data-akcja="runda" data-d="1" title="Następna runda">${ikona("prawo", 18)}</span>
        ${osRund(v, runda)}
      </div>
      <div class="przelacznik">
        ${decyzje ? `<a class="${tryb === "decyzje" ? "aktywny" : ""}" data-akcja="tryb" data-t="decyzje">Decyzje</a>` : ""}
        ${z.wyniki && (!z.wynikiGdy || z.wynikiGdy(v)) ? `<a class="${tryb === "wyniki" ? "aktywny" : ""} ${wyniki ? "" : "wylaczony"}" data-akcja="tryb" data-t="wyniki">Wyniki</a>` : ""}
      </div>
    </div>`;
}

// zapamiętanie pola z kursorem, żeby po odświeżeniu widoku wrócić do niego (wpisywanie kilku wartości z rzędu)
function kluczPola(el) {
  if (!el || !el.dataset || !el.matches("input, select")) return null;
  return JSON.stringify({ ...el.dataset, id: el.id || "" });
}
function znajdzPole(klucz) {
  if (!klucz) return null;
  return [...document.querySelectorAll("#karta input, #karta select")].find((el) => kluczPola(el) === klucz);
}

function rysuj() {
  if (!S.teczka) zdejmijFiltrAgencji();   // filtr piętra biurowca działa tylko w oknie, które go ustawiło
  const fokus = kluczPola(document.activeElement);
  const przewiniecie = window.scrollY;
  wyczyscWykresy();
  S.zadania = rysujZadania(ctx());   // przeliczane po każdej zmianie decyzji, jak lista błędów
  rysujMenu();
  const v = S.v, z = ZAKLADKI[S.zakladka];
  const grupa = S.zakladka === "miejsce" ? MENU.find((p) => p.miejsce === aktualneMiejsce())
    : MENU.find((p) => p.pod ? p.pod.includes(S.zakladka) : p.klucz === S.zakladka);
  document.body.dataset.dzial = grupa ? grupa.klucz : "dashboard";
  document.body.classList.toggle("we-wnetrzu", S.zakladka === "miejsce");
  document.getElementById("nazwa-firmy").textContent = v.dashboard.nazwa;
  odznakaSzperacza();
  const st = document.getElementById("status-gry");
  st.innerHTML = `<span class="chip">${esc(v.gra.nazwa)}</span>${chipDruzyny(v)}${ostatniZapis(v)}<span class="chip pom">${ikona("portfel", 14)}${zl(v.dashboard.saldo)}</span>`
    + (v.gra.zakonczona ? `<span class="chip">Gra zakończona</span>` : v.wyslane && v.edycja
      ? `<span class="chip ok">Czekamy na: ${esc(v.gra.brakujace.join(", ") || "–")}</span>` : "")
    + (!v.gra.zakonczona && v.prowadzenie?.pauza ? `<span class="chip pom">Gra wstrzymana</span>`
      : !v.gra.zakonczona && v.prowadzenie?.lekcje?.etap === "na_zywo" ? `<span class="chip" title="Rundę zamyka nauczyciel, gdy drużyny skończą">Na żywo, na lekcji</span>`
      : !v.gra.zakonczona && v.prowadzenie?.termin ? (v.prowadzenie.lekcje && v.prowadzenie.termin_minal
        ? `<span class="chip pom" title="Nauczyciel zamknie rundę">Termin minął</span>`
        : `<span class="chip" title="${v.prowadzenie.lekcje ? "Termin rundy" : "Runda zamknie się sama o tej porze"}">${v.prowadzenie.lekcje ? "Do" : "Zamknięcie"}: ${esc(terminKrotko(v.prowadzenie.termin))}</span>`) : "");
  const c = ctx();
  const wyniki = maWyniki(z), decyzje = !!z.decyzje && !(v.koniec && wyniki);   // po końcu gry – same wyniki
  const tryb = (S.tryb === "wyniki" || v.koniec) && wyniki ? "wyniki" : decyzje ? "decyzje" : "wyniki";
  const tresc = tryb === "wyniki" ? z.wyniki(c) : z.decyzje(c);
  const podglad = v.koniec
    ? `<div class="komunikat">Gra zakończona. Tu są wyniki ostatniej rundy (${v.gra.liczba_rund}) i końcowe miejsce w rankingu; wcześniejsze rundy obejrzysz strzałkami.</div>`
    : !v.edycja && v.runda < v.gra.runda
    ? `<div class="komunikat">Podgląd rundy ${v.runda} (${v.miesiac}) – decyzje z tej rundy są tylko do odczytu. Wyniki pokazują skutki poprzedniego ${OKRES.dopelniacz}.</div>` : "";
  const zablokowane = v.edycja && blokada(v) && tryb === "decyzje" ? `<div class="komunikat">${esc(blokada(v))}</div>` : "";
  const wyslane = !zablokowane && v.edycja && v.wyslane && tryb === "decyzje" && S.zakladka !== "wyslij"
    ? `<div class="komunikat ok">Decyzje tej rundy są wysłane. Aby je zmienić, wróć do podejmowania decyzji przez „List z decyzjami” na poczcie.</div>` : "";
  const opis = typeof z.info === "function" ? z.info(c, tryb) : z.info;
  const karta = document.getElementById("karta");
  // wnętrze budynku (swiat/swiat.js) ma własny nagłówek – bez tytułu zakładki i przełącznika Decyzje / Wyniki
  karta.innerHTML = z.bezGlowy ? `<div class="tresc bez-glowy">${podglad}${tresc}</div>`
    : glowa(v, z, tryb, decyzje, wyniki, v.runda, opis) + podzakladki() + `<div class="tresc">${podglad}${zablokowane}${wyslane}${tresc}</div>`;
  // linki do wyłączonych funkcji znikają (plan rundy, „Przejdź: …”); zakryte zostają – otwierają okno „Odsłoń”
  for (const a of karta.querySelectorAll("[data-zakladka-k]")) if (wylaczonaF(v, a.dataset.zakladkaK)) a.remove();
  menuUstawien();
  odswiezPulpit(c);
  rysujTeczke();
  twardeSpacje(karta);
  zwinPodpowiedzi(karta);
  history.replaceState(null, "", `#${z.hash ? z.hash() : S.zakladka}${tryb === "wyniki" ? "/wyniki" : ""}`);
  if (z.po) z.po(c, tryb);
  const pole = znajdzPole(fokus);
  if (pole) pole.focus({ preventScroll: true });
  window.scrollTo({ top: przewiniecie, behavior: "instant" });   // bez płynnego przewijania (html: scroll-behavior: smooth)
}

// strzałki rund: natychmiastowa zmiana napisu, wczytanie po krótkiej pauzie (można klikać szybko)
function przesunRunde(o) { idzDoRundy((S.celRundy ?? S.v.runda) + o); }

function idzDoRundy(r) {
  const v = S.v;
  const lmin = v.gra.runda_startowa || 1, lmax = v.gra.runda;
  const cel = Math.min(lmax, Math.max(lmin, r));
  S.celRundy = cel;
  document.querySelectorAll(".os-rund .runda-os").forEach((s) => s.classList.toggle("ogladana", +s.dataset.r === cel));
  const napis = document.getElementById("nawigator-miesiac");
  if (napis) napis.innerHTML = napisRundy(v, cel);
  document.querySelectorAll(".nawigator .strzalka").forEach((s) => {
    s.classList.toggle("wylaczona", (+s.dataset.d < 0 && cel <= lmin) || (+s.dataset.d > 0 && cel >= lmax));
  });
  clearTimeout(S.odliczanie);
  S.odliczanie = setTimeout(async () => {
    try { await wczytaj(cel); } catch (e) { toast(e.message); }
    S.celRundy = null;
  }, 220);
}

// --- zdarzenia (delegacja) -----------------------------------------------------------------------
document.addEventListener("click", async (e) => {
  const doMiejsca = e.target.closest("#menu [data-miejsce]");
  if (doMiejsca) { zamknijOkno(); return idzDoMiejsca(ctx(), doMiejsca.dataset.miejsce); }
  const zak = e.target.closest("[data-zakladka], [data-zakladka-k]");
  if (zak && (zak.closest("#menu") || zak.dataset.pod || zak.dataset.zakladkaK)) {
    const stary = zak.dataset.zakladka || zak.dataset.zakladkaK, k = docelowa(stary);
    if (zak.dataset.funkcje) return pokazOknoFunkcji(zak.dataset.funkcje.split(","), k);   // szara pozycja z okiem
    if (przechwycFunkcje(stary)) return;
    if (!ZAKLADKI[k] || !dostepna(ZAKLADKI[k])) return;
    if ((zak.closest(".teczka") || (S.zakladka === "miejsce" && !zak.closest("#menu"))) && !["mapa", "miejsce"].includes(k)) {
      zamknijOkno();   // link we wnętrzu albo w teczce: kolejny ekran też otwiera się w teczce
      return otworzTeczke(stary);
    }   // link w teczce: kolejny ekran też w teczce
    S.zakladka = k;
    S.tryb = ZAKLADKI[k].decyzje ? (S.v.edycja ? "decyzje" : maWyniki(ZAKLADKI[k]) ? "wyniki" : "decyzje") : "wyniki";
    zamknijOkno();   // link z okna (np. obsada) przenosi do zakładki – okno nie zostaje na wierzchu
    rysuj();
    if (zak.closest("#menu")) window.scrollTo({ top: 0 });
    pokazCzesc(stary);
    return;
  }
  if (e.target.closest(".logo")) { S.zakladka = "dashboard"; rysuj(); return; }
  const th = e.target.closest("th[data-sort]");
  if (th && !e.target.closest("input, select, button, a")) return przelaczSortowanie(th);
  const el = e.target.closest("[data-akcja]");
  if (!el) return;
  const a = el.dataset.akcja;
  try {
    if (a === "zamknij-okno") return el.closest(".teczka") ? zamknijTeczke() : zamknijOkno();
    if (a === "zamknij-teczke") return zamknijTeczke();
    if (a === "teczka-tryb") { if (S.teczka && el.getAttribute("aria-disabled") !== "true") { S.teczka.tryb = el.dataset.t; rysujTeczke(); } return; }
    if (a === "runda") return przesunRunde(+el.dataset.d);
    if (a === "runda-idz") return idzDoRundy(+el.dataset.r);
    if (a === "tryb") { S.tryb = el.dataset.t; return rysuj(); }
    if (a === "funkcje-gry") { e.preventDefault(); zamknijUstawienia(); return oknoUstawien(); }
    if (a === "funkcja-odslon") return await przelaczFunkcje(el.dataset.f, true, el.dataset.cel);
    if (a === "funkcja-przelacz") {   // ponowne zakrycie – najpierw ostrzeżenie, co przepada
      if (el.dataset.o !== "1" && S.v.funkcje?.[el.dataset.f]?.odslonieta) {
        const [t, h, p] = oknoZakryciaFunkcji(S.v, el.dataset.f);
        return okno(t, h, { male: true, przyciski: p, styl: stylEkranu("potwierdzenie"), okruszek: "Lublin › Potwierdzenie" });
      }
      await przelaczFunkcje(el.dataset.f, el.dataset.o === "1"); return oknoUstawien();
    }
    if (a === "funkcja-zakryj") { await przelaczFunkcje(el.dataset.f, false); return oknoUstawien(); }
    if (AKCJE_PULPITU[a]) return await AKCJE_PULPITU[a](el, ctx(), e);
    if (AKCJE_ZADAN[a]) return await AKCJE_ZADAN[a](el, ctx(), e);
    for (const z of Object.values(ZAKLADKI)) {
      if (z.akcje && z.akcje[a]) return await z.akcje[a](el, ctx(), e);
    }
  } catch (err) { toast(err.message); console.error(err); }
});

document.addEventListener("change", async (e) => {
  const el = e.target.closest("[data-zmiana]");
  if (!el) return;
  S.poleZmiany = el;
  try {
    for (const z of Object.values(ZAKLADKI)) {
      if (z.zmiany && z.zmiany[el.dataset.zmiana]) return await z.zmiany[el.dataset.zmiana](el, ctx(), e);
    }
  } catch (err) { toast(err.message); console.error(err); }
});

// Enter w polu = zatwierdzenie bez wychodzenia z pola (kursor i przewinięcie zostają). Przeglądarka sama zgłasza
// change po Enter – tu tylko zapas, gdy tego nie zrobiła (wcześniej zapis szedł dwa razy); także w oknach (Baza składników)
document.addEventListener("keydown", (e) => {
  const el = e.target;
  if (e.key !== "Enter" || !el.matches?.("#karta input[data-zmiana], .zaslona input[data-zmiana]")) return;
  setTimeout(() => { if (el.isConnected && niezatwierdzone(el)) el.dispatchEvent(new Event("change", { bubbles: true })); });
});

// mała ikonka obok nazwy drużyny w nagłówku – tylko u tego, kto wpisał „saragossa”
function odznakaSzperacza() {
  const el = document.getElementById("nazwa-firmy");
  el?.querySelector(".odznaka-szperacz")?.remove();
  if (!el || !jestSzperaczem()) return;
  el.insertAdjacentHTML("beforeend", `<span class="odznaka-szperacz" title="Szperacz" style="margin-left:6px;vertical-align:middle;opacity:.85">${ikona("analiza", 14)}</span>`);
}

// hasło do klubu „Pod Złotym Koziołkiem” wpisane z klawiatury na dowolnej zakładce (poza polami formularzy)
let wpisane = "";
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1 || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
  wpisane = (wpisane + e.key.toLowerCase()).slice(-Math.max(HASLO.length, HASLO_SZPERACZ.length));
  if (S.v && wpisane.endsWith(HASLO_SZPERACZ)) {
    wpisane = "";
    zapamietajSzperacza();
    odznakaSzperacza();
    return toast("Szperacz! Znalazłeś rękopis w danych gry. Koziołek kłania się nisko.");
  }
  if (!wpisane.endsWith(HASLO) || !S.v) return;
  wpisane = "";
  zapamietajHaslo();
  if (!S.v.kasyno?.otwarte) return toast("Pod Złotym Koziołkiem nikt teraz nie otwiera. Spróbuj w innym tygodniu.");
  S.zakladka = "kasyno"; S.tryb = "decyzje";
  rysuj();
});

// --- start ---------------------------------------------------------------------------------------
(async () => {
  try {
    S.kat = await api("/api/katalogi");
    const [h, tryb] = location.hash.slice(1).split("/");
    if (ZAKLADKI[h]) S.zakladka = docelowa(h);
    if (h === "miejsce") ustawMiejsce(tryb);   // adres #miejsce/<id> – wnętrze budynku
    if (tryb === "wyniki") S.tryb = "wyniki";
    podepnijZadania(ctx);
    await wczytaj();
    if (ZAKLADKI[h] && zakrytaF(S.v, h)) przechwycFunkcje(h);   // adres #zakladka zakrytej funkcji – okno „Odsłoń”
  } catch (e) {
    document.getElementById("karta").innerHTML = `<div class="ladowanie">Nie udało się wczytać gry: ${esc(e.message)}</div>`;
  }
})();

// zmiana motywu: wykresy biorą kolory z motywu, więc widok rysujemy od nowa
document.addEventListener("motyw", () => { if (S.v) rysuj(); });
// zwijane szczegóły wyników (wspolne.js: zwin) – pamiętaj, co gracz rozwinął albo zwinął (toggle nie bąbelkuje)
document.addEventListener("toggle", (e) => zapamietajZwiniecie(e.target), true);

window.addEventListener("hashchange", () => {
  const [h, tryb] = location.hash.slice(1).split("/");
  if (h === "miejsce") { if (S.v && (S.zakladka !== "miejsce" || tryb !== aktualneMiejsce())) idzDoMiejsca(ctx(), tryb); return; }
  if (ZAKLADKI[h] && docelowa(h) !== S.zakladka && S.v && przechwycFunkcje(h)) return history.replaceState(null, "", `#${S.zakladka}`);
  if (ZAKLADKI[h] && docelowa(h) !== S.zakladka) { S.zakladka = docelowa(h); S.tryb = tryb === "wyniki" ? "wyniki" : "decyzje"; rysuj(); pokazCzesc(h); }
});
export { S, okno, kluczZakladki };

// --- mapa ↔ wnętrza (umowa z [mapa]: static/lukrum.js, notatki WSPOLPRACA.md) ---------------------------------------
// mapa woła lukrum.otworzWnetrze(id); gdy budynek ma wnętrze albo ekran, zaznaczamy `obsluzone` i mapa nie otwiera
// swojego zastępczego okna. „Wróć na mapę” z wnętrza otwiera zakładkę mapy.
document.addEventListener("lukrum:wnetrze", (e) => {
  if (S.v && otworzBudynek(ctx(), e.detail?.id)) e.detail.obsluzone = true;
});
document.addEventListener("lukrum:mapa", () => { if (S.v && S.zakladka !== "mapa") ctx().idz("mapa"); });

// --- drużyna: zmiany innych osób i przeliczenie rundy pojawiają się same -------------------------
const ODSWIEZANIE_MS = 20000, ODSWIEZANIE_HANDLU_MS = 5000;   // zakładki ze sprawami na żywo – co 5 s
// poprawki 2: zakładki ze sprawami na żywo (licytacje lokali, rynek pracy, handel) – odpytywane co 5 s i przeładowane,
// gdy inna drużyna przebije ofertę (lokal, licytacja na giełdzie handlu), zatrudni kandydata albo zapowie ogłoszenie
// (silnik/na_zywo.py)
const ZAKLADKI_NA_ZYWO = new Set(["handel", "stare_miasto", "miasteczko"]);
// klucz zakładki (np. handel) albo grupy w menu (ludzie – S.zakladka to wtedy podzakładka, np. rynek_pracy)
const naZywo = () => ZAKLADKI_NA_ZYWO.has(S.zakladka) || ZAKLADKI_NA_ZYWO.has(document.body.dataset.dzial);
async function sprawdzZmiany() {
  const v = S.v;
  if (!v || document.hidden || document.querySelector(".zaslona") || v.gra.zakonczona) return;
  if (v.runda !== v.gra.runda) return;  // podgląd poprzedniej rundy
  const st = await api(`/api/gry/${GRA}/stan/${encodeURIComponent(FIRMA)}`);
  const pisze = document.activeElement?.matches?.("#karta input, #karta select, #karta textarea");
  if (st.runda !== v.gra.runda) {
    toast(`Runda ${v.gra.runda} przeliczona – teraz ${nazwaRundy(st.runda)}.`);
    return wczytaj(null);
  }
  if (st.pauza !== !!v.prowadzenie?.pauza || (st.termin ?? null) !== (v.prowadzenie?.termin ?? null)) {
    toast(st.pauza ? "Mistrz gry wstrzymał grę." : st.pauza !== !!v.prowadzenie?.pauza ? "Mistrz gry wznowił grę." : "Zmienił się termin zamknięcia rundy.");
    await S.zapis;
    return wczytaj();
  }
  if (st.na_zywo && v.na_zywo && st.na_zywo !== v.na_zywo.znacznik && !pisze && naZywo()) {
    await S.zapis;
    const przed = S.v;
    await wczytaj();
    for (const t of przebiteOferty(przed, S.v, S.kat)) toast(t);   // licytacja jawna: ktoś przebił ofertę tej drużyny
    return;
  }
  const wersja = v.druzyna?.autorzy?.wersja ?? 0;
  const wyslaneTeraz = st.wyslane.join("|"), wyslanePrzed = v.gra.wyslane.join("|");
  if ((st.wersja !== wersja || wyslaneTeraz !== wyslanePrzed) && !pisze) {
    if (st.wersja !== wersja && st.zapisal && st.zapisal.login !== KONTO) toast(`${st.zapisal.nazwa} zmienia decyzje drużyny – widok odświeżony.`);
    await S.zapis;
    // to był własny zapis, który właśnie wrócił z serwera – widok jest aktualny, bez przeładowania karty
    if ((S.v.druzyna?.autorzy?.wersja ?? 0) === st.wersja && S.v.gra.wyslane.join("|") === wyslaneTeraz) return;
    return wczytaj();
  }
}
let tik = 0;
setInterval(() => {
  tik += ODSWIEZANIE_HANDLU_MS;
  if (naZywo() || tik >= ODSWIEZANIE_MS) { tik = 0; sprawdzZmiany().catch(() => {}); }
}, ODSWIEZANIE_HANDLU_MS);

