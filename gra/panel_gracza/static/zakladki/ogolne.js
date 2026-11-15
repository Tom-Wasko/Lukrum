// Pulpit, karta wyników, lista błędów, wysyłanie decyzji.
import { esc, godzina, nazwaRundy, kafelkiLiczb, podsumowanie, strzalka, zwinTabela, inicjaly, inwestorHtml, RANKING_DLACZEGO, termin as terminSlownie, naOkres, naRunde, OKRES, gw, KOLORY_FIRM, kropkaFirmy, licz, marka, seriaFirmy, nazwaFirmy, nazwaUslugi, proc, tabela, toast, wsk, wykres, zl, zl2 } from "./wspolne.js";
import { ikona } from "./ikony.js";
import { ikonaMarki } from "./ikony_marek.js";
import { ukryta, wylaczona } from "./funkcje.js";

const DZIALY = ["finanse", "goscie", "zespol", "rozwoj", "bezpieczenstwo"];
const NAZWY_DZIALOW = { finanse: "Finanse", goscie: "Goście", zespol: "Zespół", rozwoj: "Rozwój", bezpieczenstwo: "Bezpieczeństwo finansowe" };

let skumulowana = false;

const pkt = (x) => x == null ? "–" : licz(Math.round(x));
// punkty działu z karty tygodnia (publiczna: liczba, własna: obiekt) albo ze skumulowanej (liczba)
const dzial = (k, d) => (typeof k.dzialy?.[d] === "object" ? k.dzialy[d].punkty : k.dzialy?.[d]);
function ocena(v, x) {
  const [sredni, dobry] = v.tabela_punktow?.oceny || [0.45, 0.7];
  return x == null ? null : x >= dobry * 200 ? ["dobry", "dobry"] : x >= sredni * 200 ? ["sredni", "średni"] : ["niski", "niski"];
}
function kartyDzialow(v, karta) {
  if (!karta?.dzialy || !v.tabela_punktow) return "";
  return `<div class="skala-karty">${DZIALY.map((d) => {
    const o = ocena(v, dzial(karta, d)), opis = v.tabela_punktow.dzialy[d];
    return `<div class="wsk ${o?.[0] || ""}" title="${esc(opis.opis)}"><span class="maly-tekst">${esc(opis.nazwa)}</span><b>${pkt(dzial(karta, d))}</b>
      <span class="ocena ${o?.[0] || ""}">${o?.[1] || ""}</span><div class="maly-tekst">${esc(opis.opis)}</div></div>`;
  }).join("")}</div>`;
}

// jawna tabela punktów: z czego składa się każdy dział i ile punktów daje każdy próg
function tabelaPunktow(v) {
  const T = v.tabela_punktow;
  if (!T) return "";
  const wiersze = DZIALY.flatMap((d) => Object.values(T.dzialy[d].skladniki).map((s) => [esc(T.dzialy[d].nazwa), esc(s.nazwa),
    s.progi.map(([x, p]) => `${licz(x)} → ${licz(p)}`).join(" · ") + (s.ponad ? ` · potem +${s.ponad.pkt} za każde ${licz(s.ponad.za)} (najwyżej +${s.ponad.maks})` : ""),
    esc(s.podpowiedz)]));
  return zwinTabela("Tabela punktów: ile daje każdy próg", ["Dział", "Składnik", "Miara → punkty", "Jak podnieść"], wiersze, { klasy: ["l", "l", "l", "l"], sortuj: false })
    + `<p class="podpowiedz">Każdy dział to do 200 punktów, razem do 1000 – ale wyjątkowa gra (np. bardzo hojny socjal) może dać więcej.
      Tydzień 1, „Wielkie otwarcie”, nagradza przygotowanie. Ranking to suma punktów z tygodni, a ostatnie tygodnie ważą więcej
      (waga rośnie od ${licz(T.ranking.waga_pierwszego_pelnego)} do ${licz(T.ranking.waga_ostatniego)}).</p>`;
}

// szczegóły własnej karty tygodnia: miara i punkty każdego składnika
function szczegolyKarty(v) {
  const K = v.wyniki?.karta;
  if (!K || skumulowana) return "";
  if (K.otwarcie) {
    return zwinTabela("Wielkie otwarcie – punkty za przygotowanie", ["Składnik", "Miara", "Punkty"],
      Object.values(K.przygotowanie).map((s) => [esc(s.nazwa), licz(s.miara), pkt(s.punkty)]), { klasy: ["l"], otwarte: true, sortuj: false });
  }
  const wiersze = DZIALY.flatMap((d) => Object.values(K.dzialy[d].skladniki).map((s) => [esc(K.dzialy[d].nazwa), esc(s.nazwa), licz(s.miara, 2), pkt(s.punkty)]));
  return zwinTabela("Skąd Twoje punkty w minionym tygodniu", ["Dział", "Składnik", "Miara", "Punkty"], wiersze, { klasy: ["l", "l"], otwarte: true, sortuj: false });
}

// U16: „Dlaczego mój wynik się zmienił?” – zdania z silnik/wyniki/wnioski.py: dlaczego (karta ostatniej i poprzedniej rundy)
function dlaczegoHtml(v) {
  if (!v.dlaczego?.length) return "";
  return `<div class="komunikat"><b>Dlaczego wynik się zmienił? (${esc(nazwaRundy(v.runda - 1))})</b> ${v.dlaczego.map(esc).join(" ")}
    <a href="#" data-zakladka-k="karta_wynikow">Karta wyników</a></div>`;
}

// UF23: „Tydzień w liczbach” (silnik/wyniki/wnioski.py: tydzien) – kafelki z porównaniem z poprzednią rundą,
// zdania-historie tygodnia i 3 najważniejsze sprawy z wniosków (z odsyłaczem do zakładki)
function tydzienHtml(v, tytulZakladki, { sprawy = true } = {}) {
  const T = v.tydzien;
  if (!T) return "";
  const fmt = (f) => (f === "zl" ? zl : licz);
  const kafle = T.liczby.map((x) => ({ etykieta: esc(x.etykieta), wartosc: fmt(x.format)(x.wartosc),
    delta: strzalka(x.wartosc, x.poprzednia, { lepiej: x.lepiej, format: fmt(x.format), prog: x.format === "zl" ? 1 : 0.5 }),
    ton: x.klucz === "dochod_netto" ? (x.wartosc >= 0 ? "plus" : "minus") : "" }));
  // funkcje gry: bez spraw z zakrytych (gra robi je za drużynę) i wyłączonych funkcji
  const top = sprawy ? (v.wnioski?.do_poprawy || []).filter((r) => !ukryta(v, r.zakladka)).slice(0, 3) : [];
  return `<section class="tydzien"><div class="tydzien-glowa"><span>Tydzień w liczbach</span><span>${esc(nazwaRundy(v.runda - 1))} (poprzedni tydzień)${
    T.liczby.some((x) => x.poprzednia != null) ? " · strzałki: zmiana od poprzedniej rundy" : ""}</span></div>
    ${kafelkiLiczb(kafle)}
    ${T.zdania.length ? `<ul class="historia-tygodnia">${T.zdania.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>` : ""}
    ${top.length ? `<div class="sprawy"><b>3 najważniejsze sprawy na tę rundę</b><ol>${top.map((r) => `<li><b>${esc(r.tytul)}</b> – ${esc(r.co)}
      <a href="#" data-zakladka-k="${esc(r.zakladka)}">${esc(tytulZakladki ? tytulZakladki(r.zakladka) : r.zakladka)} →</a></li>`).join("")}</ol></div>` : ""}
  </section>`;
}

const MAKS_LOGO_KB = 300;   // konta/druzyny.py: MAKS_LOGO_KB

// marka firmy z roboczymi decyzjami (nazwa, slogan i kolor wchodzą po przeliczeniu rundy 1)
function mojaMarka(v, d) {
  const m = marka(v, v.firma);
  return { ...m, nazwa: d.nazwa || m.nazwa, slogan: d.misja ?? m.slogan, kolor: d.kolor || m.kolor };
}

const znakFirmy = (m) => m.logo
  ? `<img class="logo-firmy" src="${esc(m.logo)}" alt="Logo firmy ${esc(m.nazwa)}">`
  : `<div class="awatar awatar-marki" style="border-color:${esc(m.kolor)};color:${esc(m.kolor)}">${ikonaMarki("kebab")}</div>`;   // poprawki 3: rożen zamiast liter

// runda 1: nazwa, slogan, kolor na mapie i logo firmy (logo – osobny zapis, api/widoki.py: api_logo)
function formularzMarki(v, d) {
  const m = mojaMarka(v, d);
  const zajete = Object.fromEntries(v.gra.firmy.filter((f) => f.nazwa !== v.firma).map((f) => [marka(v, f.nazwa).kolor, marka(v, f.nazwa).nazwa]));
  const kolory = KOLORY_FIRM.map((k) => `<button class="kolor-firmy ${k === m.kolor ? "wybrany" : ""}" style="background:${k}" data-akcja="marka-kolor"
    data-kolor="${k}" title="${zajete[k] ? `ten kolor ma ${esc(zajete[k])}` : "wybierz ten kolor"}" ${zajete[k] ? "disabled" : ""}></button>`).join("");
  return `<div class="sekcja-tytul">Runda 1: Twoja marka</div><div class="marka">
    <div class="marka-znak">${znakFirmy(m)}</div>
    <div class="marka-pola">
      <label class="pole">Nazwa firmy<input type="text" maxlength="40" value="${esc(d.nazwa || m.nazwa)}" data-zmiana="marka-nazwa"></label>
      <label class="pole">Slogan<input type="text" maxlength="80" value="${esc(m.slogan)}" placeholder="np. Kebab, do którego się wraca" data-zmiana="marka-slogan"></label>
      <div class="pole">Kolor firmy na mapie<div class="kolory-firmy">${kolory}</div></div>
      <label class="pole">Logo (PNG albo JPG, najwyżej ${MAKS_LOGO_KB} KB)<input type="file" accept="image/png,image/jpeg" data-zmiana="marka-logo"></label>
      ${m.logo ? `<button class="btn jasny maly" data-akcja="marka-bez-logo">Usuń logo</button>` : ""}
      <p class="podpowiedz">Nazwę, slogan, kolor i logo wybieracie w pierwszej rundzie – od drugiej rundy zobaczą je inne firmy,
        a Wasze lokale na mapie będą miały ten kolor.</p>
    </div></div>`;
}

const wyslijLogo = async (c, logo) => {
  c.ustaw(await c.api(`/api/gry/${GRA}/logo/${encodeURIComponent(FIRMA)}`, { method: "PUT", body: JSON.stringify({ logo }) }));
  toast(logo ? "Logo zapisane." : "Logo usunięte.");
};

function planRundy(v, kat) {
  // lista kontrolna decyzji bieżącej rundy (na podstawie stanu po roboczych decyzjach)
  const r = v.runda, st = v.stan, braki = Object.values(st.gotowe_uslugi || {}).flat();
  const ile = (typ) => st.stanowiska.filter((s) => s.typ === typ).length;
  const zaw = (tekst) => braki.some((b) => b.includes(tekst));
  const punkty = [
    ["oferta", "Oferta", Object.keys(st.oferta).length > 0, `${Object.keys(st.oferta).length} dań w menu`],
    ["stanowiska", "Stanowiska", ile("kuchnia") > 0 && ile("kasa") > 0, `${ile("kuchnia")} kuchnia · ${ile("kasa")} kasa`],
    ["bank", "Bank i biuro", !!st.bank && !!st.biuro, st.bank && st.biuro ? `${st.bank} · ${st.biuro}` : "wybierz bank i biuro"],
  ];
  if (r >= 2) punkty.push(
    ["sprzet", "Sprzęt i kuchnia", Object.keys(st.oferta).length > 0 && !zaw("stanowiska z pracownikiem"), zaw("stanowiska z pracownikiem") ? "brakuje sprzętu lub kucharza" : "wszystkie dania mają stanowisko"],
    ["zatrudnienie", "Kasa", !zaw("obsadzonego stanowiska"), zaw("obsadzonego stanowiska") ? "brak kasjera z kompletem sprzętu" : "kasa obsadzona"],
    ["dostawcy", "Składniki", !zaw("brak składnika"), zaw("brak składnika") ? "brak składników w magazynie" : "w magazynie"],
    ["sprzedaz", "Ceny", !zaw("włączone do sprzedaży"), zaw("włączone do sprzedaży") ? "nie wszystkie dania mają cenę" : "ustawione"]);
  const html = punkty.filter(([k]) => !ukryta(v, k)).map(([k, n, ok, opis]) => `<a data-zakladka-k="${k}"><span class="st ${ok ? "ok" : "nie"}">${ok ? "✓" : "!"}</span>
    <span>${n}<small>${esc(opis)}</small></span></a>`).join("");
  return `<div class="sekcja-tytul">Plan rundy ${r} (${esc(String(v.miesiac).replace(/^[^(]*\((.*)\)$/, "$1"))})</div><div class="plan">${html}
    <a data-zakladka-k="wyslij"><span class="st ${v.wyslane ? "ok" : "inf"}">${v.wyslane ? "✓" : "→"}</span><span>Wyślij decyzje<small>${v.wyslane ? "wysłane" : "gdy wszystko gotowe"}</small></span></a></div>`;
}

// U19: tryb podpowiedzi (włącza mistrz gry) – 3 rzeczy do sprawdzenia w pierwszych rundach
function podpowiedziHtml(v) {
  const lista = (v.podpowiedzi || []).filter((p) => !ukryta(v, p.zakladka));   // funkcje gry: bez zakrytych i wyłączonych
  if (!lista.length) return "";
  const html = lista.map((p, i) => `<a data-zakladka-k="${esc(p.zakladka)}"><span class="st inf">${i + 1}</span>
    <span>${esc(p.tytul)}<small>${esc(p.tekst)}</small></span></a>`).join("");
  return `<div class="sekcja-tytul">${lista.length} rzeczy do sprawdzenia w tej rundzie</div><div class="plan podpowiedzi">${html}</div>`;
}

// U9: rozruch nowego lokalu (dane/mapa/popyt.yaml: model.rozruch) – strata w pierwszych tygodniach sprzedaży jest normalna
function rozruchHtml(v) {
  const R = v.dashboard?.rozruch;
  if (!R || !(R.lokale.length || v.runda === v.gra.runda_startowa)) return "";
  const pr = (m) => `ok. ${Math.round(m * 100)}%`;
  const lokale = R.lokale.map((l) => `<li><b>${esc(l.nazwa)}</b>: ${l.poprzednia != null
    ? `w poprzednim tygodniu przyszło ${pr(l.poprzednia)} pełnej liczby klientów, a w tym tygodniu ${l.teraz < 1 ? `przyjdzie ${pr(l.teraz)}` : "popyt jest już pełny"}`
    : `pierwszy tydzień sprzedaży – przyjdzie ${pr(l.teraz)} pełnej liczby klientów`}.</li>`).join("");
  return `<div class="komunikat"><b>Rozruch nowego lokalu.</b> Nowy lokal dopiero zdobywa klientów: w pierwszym tygodniu
    sprzedaży przychodzi ${pr(R.start)} pełnej liczby klientów, potem co tydzień o ${Math.round(R.przyrost * 100)} punktów procentowych więcej,
    aż do pełnego popytu. Czynsz i pensje są od razu pełne, więc strata na starcie jest normalna – pilnuj, żeby była mała:
    zamówienia i grafik dopasuj do mniejszego ruchu.${lokale ? `<ul>${lokale}</ul>` : ""}</div>`;
}

export const dashboard = {
  tytul: "Dashboard", ikona: "▦",
  decyzje({ v, kat, d: szkic }) {
    const d = v.dashboard, p = kat.parametry, m = mojaMarka(v, szkic);
    const rundaMarki = v.edycja && v.runda === v.gra.runda_startowa && !v.tylko_odczyt;
    const kafel = (t, ik, tresc) => `<div class="kafel"><div class="kg"><span>${t}</span>${ikona(ik, 18)}</div><div class="kt">${tresc}</div></div>`;
    const ludzie = v.gra.firmy.filter((f) => !f.bot).map((f) => f.nazwa);
    const status = ludzie.length > 1 ? `<div class="komunikat">Gracze w tej grze: ${ludzie.map((n) =>
      `${esc(n)} ${v.gra.wyslane.includes(n) ? '<span class="pigulka ok">wysłał</span>' : '<span class="pigulka nie">decyduje</span>'}`).join(" · ")}
      · <a href="/gra/${GRA}">zmień firmę</a></div>` : "";
    const boty = v.gra.firmy.filter((f) => f.bot).map((f) => esc(f.nazwa));
    const stali = (v.gra.konkurenci_stali || []).map((k) => esc(k.nazwa));
    const rynek = [boty.length ? `boty: ${boty.join(", ")}` : "", stali.length ? `stałe ceny: ${stali.join(", ")}` : ""].filter(Boolean).join(" · ");
    const klub = v.kasyno?.zaproszenie ? `<div class="komunikat">${esc(v.kasyno.zaproszenie)}
      · <a data-zakladka-k="kasyno">${esc(v.kasyno.adres)}</a></div>` : "";
    const alarm = (v.lista_bledow || []).find((b) => b.alarm);   // U2: debet ponad limit – blokada w tej rundzie
    const pasek = alarm ? `<div class="komunikat zly">${esc(alarm.tekst)}
      <button class="btn jasny maly" data-akcja="popraw" data-z="bank">Przejdź do banku</button></div>` : "";
    const inwestor = v.inwestor && v.runda <= v.inwestor.do_rundy + 1 ? inwestorHtml(v) : "";   // U11: potem tylko w Banku
    return `${pasek}${inwestor}${status}${klub}${rundaMarki ? formularzMarki(v, szkic) : ""}${v.edycja ? planRundy(v, kat) : ""}${podpowiedziHtml(v)}${rozruchHtml(v)}${dlaczegoHtml(v)}<div class="sekcja-tytul">Twoja firma</div><div class="dash">
      ${kafel("Nazwa i logo firmy", "osoba", `<div class="srodek">${znakFirmy(m)}<b>${esc(m.nazwa)}</b>${m.slogan ? `<div class="maly-tekst">„${esc(m.slogan)}”</div>` : ""}</div>`)}
      ${kafel("Miejsce", "karta", d.miejsce ? `${d.miejsce} / ${d.liczba_firm}` : `<span class="maly-tekst">Ranking dostępny od rundy 3</span>`)}
      ${kafel(`Liczba rund w grze`, "zegar", `<div>${Math.min(v.gra.runda, v.gra.liczba_rund)} / ${v.gra.liczba_rund}
        <div class="maly-tekst">${v.gra.zakonczona ? "Gra zakończona" : `Bieżąca runda: ${v.gra.runda}`} · ${v.gra.firmy.length + stali.length} firm na rynku</div>
        ${rynek ? `<div class="podpowiedz">${rynek}</div>` : ""}</div>`)}
      ${kafel("Dochód netto", "wykres", d.dochod_netto == null && v.ksiegowosc?.ukryte   // U7: ukryty do złożenia deklaracji
        ? `<div class="maly-tekst">Księgujesz samodzielnie – dochód tej rundy poznasz po złożeniu deklaracji albo wybierz biuro.</div>
           <button class="btn jasny maly" data-akcja="popraw" data-z="biuro">Biurowiec przy Zana ▸ Biuro rachunkowe</button>`
        : `<span class="${d.dochod_netto < 0 ? "minus" : ""}">${zl(d.dochod_netto)}</span>`)}
      ${kafel("Saldo konta", "portfel", zl(d.saldo))}
      ${kafel("Minimalne wynagrodzenie brutto", "zatrudnienie", `${zl(kat.placa_minimalna)} / miesiąc`
        + (OKRES.rund_w_roku === 12 ? "" : `<div class="maly-tekst">≈ ${zl(naRunde(kat.placa_minimalna))}${naOkres()}</div>`))}
      ${kafel("Czas pracy pracownika i sprzętów", "zegar", `<div>${p.godziny}H / ${OKRES.mianownik.toUpperCase()}<div class="maly-tekst">Otwarte: 9:00–17:00</div></div>`)}
      ${kafel("Stawki amortyzacji", "procent", v.amortyzacja
        ? `<div class="maly-tekst">Lokal i budynek: ${proc(v.amortyzacja.stawki.budynek)} rocznie<br>Od ${zl(p.amortyzacja_prog)}: ${proc(v.amortyzacja.stawki.sprzet)} rocznie<br>Do ${zl(p.amortyzacja_prog)}: 100%</div>`
        : `<div class="maly-tekst">Sprzęt powyżej ${zl(p.amortyzacja_prog)}: 10%<br>Sprzęt do ${zl(p.amortyzacja_prog)}: 100%</div>`)}
      ${kafel("Pozostałe informacje", "finanse", `<div class="maly-tekst">PIT liniowy ${proc(v.podatki?.parametry?.pit ?? 0, 0)}<br>Składki ZUS pracodawcy ${proc(p.zus, 0)}
        <br>Rozliczanie debetu: ${v.gra.tryb_debetu === "na_biezaco" ? "na bieżąco" : "jak w grze (jednocześnie)"}
        ${d.lokaty ? `<br>Lokaty: ${zl(d.lokaty)}` : ""}${d.zadluzenie ? `<br>Zadłużenie: ${zl(d.zadluzenie)}` : ""}</div>`)}
    </div>${(v.historia || []).length > 1 ? `<div class="wykres"><canvas id="w-dash"></canvas></div>` : ""}`;
  },
  zmiany: {
    "marka-nazwa": (el, c) => c.zmien((d) => { d.nazwa = el.value.trim().slice(0, 40); }),
    "marka-slogan": (el, c) => c.zmien((d) => { d.misja = el.value.trim().slice(0, 80); }),
    "marka-logo": async (el, c) => {
      const plik = el.files?.[0];
      if (!plik) return;
      if (!["image/png", "image/jpeg"].includes(plik.type)) return toast("Logo musi być obrazkiem PNG albo JPG.");
      if (plik.size > MAKS_LOGO_KB * 1024) return toast(`Logo jest za duże (${Math.ceil(plik.size / 1024)} KB) – najwyżej ${MAKS_LOGO_KB} KB.`);
      const dane = await new Promise((ok, zle) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = zle; r.readAsDataURL(plik); });
      await wyslijLogo(c, dane);
    },
  },
  akcje: {
    "marka-kolor": (el, c) => c.zmien((d) => { d.kolor = el.dataset.kolor; }),
    "marka-bez-logo": (el, c) => wyslijLogo(c, ""),
    popraw: (el, c) => c.idz(el.dataset.z, "decyzje"),
  },
  po({ v }) {
    const h = v.historia || [];
    if (h.length > 1) wykres("w-dash", "bar", h.map((x) => x.skrot || x.miesiac), [{ label: "Dochód netto", data: h.map((x) => x.dochod_netto) },
      { label: "Saldo konta", data: h.map((x) => x.gotowka), type: "line", kolor: "--wykres-linia" }]);
  },
};

// Wnioski z poprzedniej rundy (silnik/wyniki/wnioski.py): co się udało i co poprawić – z zakładką, w której to zrobić
export const wnioski = {
  tytul: "Wnioski z rundy", ikona: "ok",
  info: "Co wyszło w poprzedniej rundzie i co zrobić, żeby kolejna poszła lepiej.",
  decyzje({ v, tytulZakladki }) {
    const W = v.wnioski;
    if (!W) return `<div class="komunikat">Wnioski pojawią się po przeliczeniu pierwszej rundy – wtedy zobaczycie, co się udało
      i co warto poprawić.</div>`;
    const dobre = W.dobre.map((t) => `<li>${esc(t)}</li>`).join("");
    const rady = W.do_poprawy.filter((r) => !wylaczona(v, r.zakladka)).map((r) => `<div class="kafel"><div class="kg">${esc(r.tytul)}</div><div class="kt">
      <p>${esc(r.co)}</p><p><b>Co zrobić:</b> ${esc(r.rada)}</p></div>
      <div class="kd"><a class="btn jasny maly" data-zakladka-k="${esc(r.zakladka)}">Przejdź: ${esc(tytulZakladki(r.zakladka))}</a></div></div>`).join("");
    const rozruch = W.rozruch ? `<div class="komunikat">${esc(W.rozruch)}</div>` : "";   // UF5: pierwsze tygodnie
    return `${rozruch}${tydzienHtml(v, tytulZakladki, { sprawy: false })}${dlaczegoHtml(v)}<div class="sekcja-tytul">Runda ${v.runda - 1}: co się udało</div><ul class="wnioski-dobre">${dobre}</ul>
      <div class="sekcja-tytul">Co poprawić w rundzie ${v.runda}</div>
      ${rady ? `<div class="siatka">${rady}</div><p class="podpowiedz">Nie wszystko naraz – zacznijcie od pierwszej rady.
        Każda poprawka od razu działa w tej rundzie.</p>` : `<div class="komunikat">Nic nie wymaga poprawy – tak trzymać!</div>`}`;
  },
};

export const karta_wynikow = {
  tytul: "Karta wyników", ikona: "☷", wynikiOd: 3, odblokowanie: "karta_wynikow",
  info: () => "Karta wyników pokazuje punkty (0–1000) za decyzje z poprzedniego tygodnia: pięć działów po 0–200 punktów.",
  wyniki({ v, tytulZakladki }) {
    const karty = skumulowana ? v.karta_skumulowana : v.rynek.karta;
    const moja = karty?.[v.firma], hist = (v.historia || []).filter((x) => x.karta), pop = hist.length > 1 ? hist[hist.length - 2].karta : null;
    const miejsce = moja ? Object.values(karty).filter((k) => k.punkty > moja.punkty).length + 1 : null;
    const lead = moja ? podsumowanie([`Wynik <b>${pkt(moja.punkty)} pkt</b>${!skumulowana && pop
      ? ` ${strzalka(moja.punkty, pop.punkty, { format: pkt, prog: 0.5 })}` : ""} – ${miejsce === 1
      ? "najlepszy wśród wszystkich drużyn." : `${miejsce}. miejsce na ${Object.keys(karty).length} drużyn.`}`,
    ...(v.dlaczego || []).slice(1).map(esc)], miejsce === 1 ? "ok" : "") : "";
    const firmy = Object.keys(karty || {}).sort((a, b) => karty[b].punkty - karty[a].punkty);
    const wiersze = firmy.map((f) => [`${kropkaFirmy(v, f)}${f === v.firma ? "<b>" : ""}${esc(nazwaFirmy(v, f))}${f === v.firma ? "</b>" : ""}`,
      `<b>${pkt(karty[f].punkty)}</b>`,
      ...DZIALY.map((d) => `<span class="ocena-tekst ${ocena(v, dzial(karty[f], d))?.[0] || ""}">${pkt(dzial(karty[f], d))}</span>`),
      zl2(v.majatek_firm?.[f])]);
    return `${skumulowana ? "" : tydzienHtml(v, tytulZakladki)}${lead}<div style="display:flex;gap:10px;justify-content:center">
        <button class="btn ${skumulowana ? "jasny" : "pom"}" data-akcja="karta-skum" data-s="0">Karta wyników</button>
        <button class="btn ${skumulowana ? "pom" : "jasny"}" data-akcja="karta-skum" data-s="1" ${v.odblokowane.includes("karta_skumulowana") ? "" : "disabled"}>Wynik gry (ranking)</button></div>
      ${moja ? `<div class="sekcja-tytul">${skumulowana ? "Twój wynik gry – działy (średnia ważona)" : "Twoja karta"} – niski, średni czy dobry?</div>
        ${kartyDzialow(v, moja)}` : ""}
      ${zwinTabela("Karty wszystkich zespołów", ["Firma", "Wynik (pkt)", ...DZIALY.map((d) => NAZWY_DZIALOW[d]), "Majątek netto"], wiersze, { klasy: ["l"], otwarte: true })}
      <p class="podpowiedz">${RANKING_DLACZEGO} Majątek netto – stan na koniec ostatniej przeliczonej rundy.</p>
      ${szczegolyKarty(v)}
      ${tabelaPunktow(v)}
      <div class="wykres"><canvas id="w-karta"></canvas></div>
      <div class="wykres"><canvas id="w-historia"></canvas></div>
      <p class="podpowiedz">Ocena „niski / średni / dobry” to udział w 200 punktach działu (poniżej ${licz(Math.round((v.tabela_punktow?.oceny?.[0] || 0.45) * 200))} niski,
      od ${licz(Math.round((v.tabela_punktow?.oceny?.[1] || 0.7) * 200))} dobry). Dochód do działu Finanse to dochód netto tygodnia pomniejszony o odsetki Harpagona${v.zasady_karty?.mandaty ? " i mandaty (skarbowe, sanepidu)" : ""}.</p>`;
  },
  po({ v }) {
    const karty = skumulowana ? v.karta_skumulowana : v.rynek.karta;
    const firmy = Object.keys(karty || {});
    wykres("w-karta", "bar", DZIALY.map((d) => NAZWY_DZIALOW[d]), firmy.map((f) => seriaFirmy(v, f, DZIALY.map((d) => dzial(karty[f], d)), "bar")));
    const h = (v.historia || []).filter((x) => x.karta);
    wykres("w-historia", "line", h.map((x) => x.skrot || x.miesiac), [{ label: "Twoje punkty tygodnia", data: h.map((x) => x.karta.punkty) }]);
  },
  akcje: { "karta-skum": (el, c) => { skumulowana = el.dataset.s === "1"; c.idz("karta_wynikow", "wyniki"); } },
};

// UF11: ranking drużyn – miejsca jak u mistrza gry (wynik gry w punktach z tygodni 1…), zmiana miejsca i wykres miejsc
export const ranking = {
  tytul: "Ranking", tytulPelny: "Ranking drużyn", ikona: "karta", wynikiOd: 3, odblokowanie: "karta_wynikow",
  info: () => "Kto prowadzi? Miejsce liczy się z punktów z kolejnych tygodni (ostatnie ważą więcej) – tak samo jak w panelu mistrza gry i na Dashboardzie.",
  wyniki({ v }) {
    const R = v.ranking, skum = v.karta_skumulowana || {}, teraz = v.rynek?.karta || {};
    if (!R?.rundy?.length) return `<p class="podpowiedz">Ranking pojawi się, gdy przeliczy się runda 2.</p>`;
    const ost = R.miejsca[R.rundy[R.rundy.length - 1]], przed = R.rundy.length > 1 ? R.miejsca[R.rundy[R.rundy.length - 2]] : null;
    const firmy = Object.keys(ost).sort((a, b) => ost[a] - ost[b]);
    const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
    const zmiana = (f) => {
      if (!przed?.[f]) return "–";
      const d = przed[f] - ost[f];
      return d > 0 ? `<span class="plus">▲ ${d}</span>` : d < 0 ? `<span class="minus">▼ ${-d}</span>` : `<span class="szary">=</span>`;
    };
    const wiersze = firmy.map((f) => {
      const ja = f === v.firma, m = marka(v, f);
      return [`<b>${MEDAL[ost[f]] || ""} ${ost[f]}.</b>`,
        `<span class="kropka" style="background:${esc(m.kolor)}"></span> ${ja ? "<b>" : ""}${esc(m.nazwa)}${ja ? " (Ty)</b>" : ""}`,
        zmiana(f), pkt(skum[f]?.punkty), pkt(teraz[f]?.punkty), zl2(v.majatek_firm?.[f])];
    });
    const moje = ost[v.firma], lider = firmy[0];
    const naglowek = moje === 1 ? `Prowadzisz! ${przed?.[v.firma] === 1 ? "Utrzymaj tempo." : "Awans na pierwsze miejsce."}`
      : moje ? `Jesteś na ${moje}. miejscu z ${firmy.length}. Prowadzi ${esc(nazwaFirmy(v, lider))}.` : "";
    return `${naglowek ? `<div class="komunikat ok">${naglowek}</div>` : ""}
      ${tabela(`Ranking po: ${esc(R.ostatnia || `runda ${R.rundy[R.rundy.length - 1]}`)}`, ["Miejsce", "Drużyna", "Zmiana", "Wynik gry (pkt)", "Ostatni tydzień (pkt)", "Majątek netto"], wiersze, { klasy: ["", "l"] })}
      <p class="podpowiedz">${RANKING_DLACZEGO} „Zmiana” – o ile miejsc w górę albo w dół od poprzedniej rundy.
        Majątek netto – stan na koniec ostatniej przeliczonej rundy.</p>
      ${R.rundy.length > 1 ? `<div class="sekcja-tytul" style="margin-top:20px">Miejsca w kolejnych rundach</div><div class="wykres"><canvas id="w-ranking"></canvas></div>` : ""}`;
  },
  po({ v }) {
    const R = v.ranking;
    if (!R?.rundy?.length || R.rundy.length < 2) return;
    const firmy = Object.keys(R.miejsca[R.rundy[R.rundy.length - 1]]);
    wykres("w-ranking", "line", R.etykiety, firmy.map((f) => ({ ...seriaFirmy(v, f, R.rundy.map((r) => R.miejsca[r][f] ?? null)), tension: 0 })),
    // Poprawki 3: linie proste (wygładzanie przestrzeliwało miejsca), pół miejsca marginesu nad 1. i pod ostatnim
    { scales: { y: { reverse: true, min: 0.5, max: firmy.length + 0.5, title: { display: true, text: "miejsce" },
      afterBuildTicks: (os) => { os.ticks = firmy.map((_, i) => ({ value: i + 1 })); } } } });
  },
};

const DOKAD = { lokale: "lokale", stanowiska: "stanowiska", oferta: "oferta", finanse_bank: "bank", finanse_biuro: "biuro", hr_zatrudnienie: "zatrudnienie",
  inwestycje_sprzet: "sprzet", dostawcy: "dostawcy", sprzedaz: "sprzedaz", wlasciciel: "wlasciciel", kasyno: "kasyno", handel: "handel" };

export const lista_bledow = {
  tytul: "Lista błędów", ikona: "☰",
  info: "Sprawdź, czy podjęto wszystkie najważniejsze decyzje. Do zrobienia – poważne braki, Uwaga – ostrzeżenia, Dla informacji – podpowiedzi (zwinięte).",
  decyzje(c) {
    const v = c.v;
    // starsze klucze (finanse_bank…) → zakładka; w grze z lokalami silnik podaje od razu klucz zakładki (swiezosc, zatrudnienie…)
    const dokad = (z) => { const k = DOKAD[z] || (c.dostepna(z) ? z : null); return k && !c.wylaczona(k) ? k : null; };
    if (!v.lista_bledow.length) return `<div class="komunikat ok">Brak uwag – wszystkie najważniejsze decyzje są podjęte.</div>`;
    const wiersz = (b) => `<div class="blad ${b.poziom}"><span class="tx">${esc(b.tekst)}</span>
       ${dokad(b.zakladka) ? `<button class="btn jasny maly" data-akcja="popraw" data-z="${dokad(b.zakladka)}">Popraw</button>` : ""}</div>`;
    // U5: trzy grupy – „Dla informacji” domyślnie zwinięte
    const grupy = [["czerwony", "Do zrobienia"], ["pomaranczowy", "Uwaga"], ["niebieski", "Dla informacji"]].map(([poziom, nazwa]) => {
      const g = v.lista_bledow.filter((b) => b.poziom === poziom);
      if (!g.length) return "";
      return poziom === "niebieski"
        ? `<details class="grupa-bledow"><summary>${nazwa} (${g.length})</summary>${g.map(wiersz).join("")}</details>`
        : `<div class="grupa-bledow ${poziom}">${nazwa} (${g.length})</div>${g.map(wiersz).join("")}`;
    });
    const brak = v.lista_bledow.some((b) => b.poziom === "czerwony") ? ""
      : `<div class="komunikat ok">Nic do poprawienia – poniżej tylko uwagi i podpowiedzi.</div>`;
    return brak + grupy.join("");
  },
  akcje: { popraw: (el, c) => c.idz(el.dataset.z, "decyzje") },
};

const kto = (a, przed) => a ? `${przed} ${esc(a.nazwa)} (${godzina(a.kiedy)})` : "";
function skladDruzyny(v) {
  const sklad = v.druzyna?.sklad || [];
  if (!sklad.length) return "";
  return `<div class="tabela-tytul">Twoja drużyna – ${esc(v.firma)}</div>
    <p class="sklad">${sklad.map((o) => `<span class="osoba-druzyny"><span class="inicjaly">${inicjaly(o.nazwa)}</span>${esc(o.nazwa)}</span>`).join("")}</p>`;
}

// U17: refleksja drużyny przy wysyłaniu decyzji – widzi ją mistrz gry (panel i eksport CSV).
// Szkic trzymany w pamięci strony, żeby odświeżenie zakładki (zapis kolegi z drużyny) go nie skasowało.
let szkicRefleksji = null;
document.addEventListener("input", (e) => { if (e.target.id === "refleksja") szkicRefleksji = e.target.value; });
function refleksjaHtml(v) {
  const tryb = v.gra.refleksja || "opcjonalna";
  if (tryb === "wylaczona") return "";
  if (v.wyslane || v.tylko_odczyt || v.prowadzenie?.pauza) {
    return v.refleksja ? `<p class="podpowiedz">Wasza refleksja do tej rundy: „${esc(v.refleksja)}”</p>` : "";
  }
  return `<label class="pole" style="margin:14px 0">Co zmieniamy w tej rundzie i dlaczego? (1–2 zdania${tryb === "wymagana" ? ", wymagane" : ", nieobowiązkowe"})
      <textarea id="refleksja" rows="3" maxlength="500" placeholder="Np. Obniżamy ceny, bo w zeszłym tygodniu sprzedaliśmy tylko połowę porcji.">${esc(szkicRefleksji ?? v.refleksja ?? "")}</textarea></label>
    <p class="podpowiedz">Przeczyta to mistrz gry – przyda się przy omawianiu rundy. Na wynik gry nie wpływa.</p>`;
}

export const wyslij = {
  tytul: "Wyślij decyzje", ikona: "✉", odblokowanie: (v) => !v.gra.zakonczona,
  decyzje({ v }) {
    const czerwone = v.lista_bledow.filter((b) => b.poziom === "czerwony").length;
    const ludzie = v.gra.firmy.filter((f) => !f.bot);
    const stan = ludzie.map((f) => `<tr><td class="l">${esc(f.nazwa)}</td><td>${v.gra.wyslane.includes(f.nazwa) ? '<span class="pigulka ok">wysłane</span>' : '<span class="pigulka nie">w trakcie</span>'}</td></tr>`).join("");
    if (!v.edycja) return `<div class="komunikat">To podgląd poprzedniej rundy.</div>`;
    const P = v.prowadzenie || {};
    const termin = P.termin && !P.pauza ? `<p>Runda zamknie się sama: <b>${esc(terminSlownie(P.termin))}</b> – decyzje niewysłane do tej pory
      zagrają w takiej postaci, w jakiej są zapisane.</p>` : "";
    if (v.tylko_odczyt || P.pauza) {
      return `<div class="komunikat">${v.tylko_odczyt ? "Podgląd mistrza gry – decyzje tej drużyny wysyłają uczniowie."
        : "Gra jest wstrzymana przez mistrza gry – decyzji nie można teraz zmieniać ani wysyłać."}</div>
        ${v.wyslane ? `<div class="komunikat ok">Decyzje wysłane${kto(v.druzyna?.autorzy?.wyslal, " przez")}.</div>` : ""}
        ${refleksjaHtml(v)}${termin}${skladDruzyny(v)}
        ${ludzie.length > 1 ? `<div class="tabela-tytul">Drużyny</div><div class="tab-wrap"><table class="t">${stan}</table></div>` : ""}`;
    }
    return `${termin}${czerwone ? `<div class="komunikat zly">Na liście błędów jest ${czerwone} poważnych uwag. Możesz mimo to wysłać decyzje.</div>` : ""}
      ${v.wyslane
        ? `<div class="komunikat ok">Decyzje wysłane${kto(v.druzyna?.autorzy?.wyslal, " przez")}. Runda przeliczy się, gdy wszystkie drużyny wyślą decyzje.</div>
           ${refleksjaHtml(v)}
           <button class="btn czarny" data-akcja="cofnij-wyslanie">Wróć do podejmowania decyzji w bieżącej rundzie</button>`
        : `<p>Po wysłaniu decyzji gra czeka, aż wszystkie drużyny wyślą swoje. Wtedy runda przelicza się automatycznie
           (boty decydują same).${(v.druzyna?.sklad || []).length > 1 ? " Decyzje wysyła jedna osoba za całą drużynę." : ""}</p>
           ${v.druzyna?.autorzy?.zapisal ? `<p class="podpowiedz">Ostatni zapis decyzji${kto(v.druzyna.autorzy.zapisal, ":")}.</p>` : ""}
           ${refleksjaHtml(v)}
           <button class="btn zielony" data-akcja="wyslij">Wyślij decyzje</button>`}
      ${skladDruzyny(v)}
      ${ludzie.length > 1 ? `<div class="tabela-tytul">Drużyny</div><div class="tab-wrap"><table class="t">${stan}</table></div>` : ""}
      ${window.MG ? `${ludzie.length > 1 ? `<p><button class="btn jasny" data-akcja="wymus">Przelicz rundę bez czekania (brakujące drużyny: zapisane decyzje)</button></p>` : ""}
      <hr style="margin:28px 0;border:0;border-top:1px solid var(--linia)">
      <p class="podpowiedz">Mistrz gry: możesz cofnąć ostatnią przeliczoną rundę i zmienić decyzje (decyzje botów zostaną policzone od nowa).</p>
      <button class="btn jasny" data-akcja="cofnij-runde" ${v.gra.runda > (v.gra.runda_startowa || 1) ? "" : "disabled"}>Cofnij ostatnią rundę</button>`
      : `<p class="podpowiedz">Rundę może też zamknąć mistrz gry – drużyny bez wysłanych decyzji zagrają wtedy decyzjami zapisanymi do tej pory.</p>`}`;
  },
  akcje: {
    wyslij: async (el, c) => {
      const pole = document.getElementById("refleksja");
      if (pole && c.v.gra.refleksja === "wymagana" && !pole.value.trim()) { pole.focus(); return toast("Napiszcie najpierw 1–2 zdania: co zmieniacie w tej rundzie i dlaczego."); }
      const v = await c.api(`/api/gry/${GRA}/wyslij/${encodeURIComponent(FIRMA)}`, { method: "POST",
        body: JSON.stringify({ wyslane: true, ...(pole ? { refleksja: pole.value } : {}) }) });
      szkicRefleksji = null;
      if (v.przeliczono) { toast(`Runda przeliczona – teraz ${nazwaRundy(v.runda)}.`); c.ustaw(v); c.idz("dashboard"); }
      else c.ustaw(v);
    },
    "cofnij-wyslanie": async (el, c) => c.ustaw(await c.api(`/api/gry/${GRA}/wyslij/${encodeURIComponent(FIRMA)}`, { method: "POST", body: JSON.stringify({ wyslane: false }) })),
    wymus: async (el, c) => { await c.api(`/api/gry/${GRA}/przelicz`, { method: "POST" }); toast("Runda przeliczona."); await c.wczytaj(null); c.idz("dashboard"); },
    "cofnij-runde": async (el, c) => {
      if (!confirm("Cofnąć ostatnią przeliczoną rundę?")) return;
      await c.api(`/api/gry/${GRA}/cofnij`, { method: "POST" }); toast("Cofnięto rundę."); await c.wczytaj(null);
    },
  },
};

export { DZIALY, gw };
