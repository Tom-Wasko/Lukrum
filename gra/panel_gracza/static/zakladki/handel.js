// Giełda handlu (gra z lokalami, sprawa 19 autora; silnik/rynek/handel.py): wspólny rynek drużyn i botów.
// Ogłoszenia (decyzja `handel_wystaw`) wpisane w rundzie r są licytowane w rundzie r+1 (decyzja `handel_licytuj`:
// {id ogłoszenia: kwota}); licytacja jawna i na żywo – prowadzący i cena odświeżają się same (silnik/na_zywo.py),
// za niską ofertę serwer odrzuca przy zapisie (kontrola_licytacji → 409 i komunikat).
import { brakWynikow, esc, kafelkiLiczb, licz, okno, podsumowanie, tabela, toast, zamknijOkno, zl2, zwinTabela, zl } from "./wspolne.js";

const proc = (x) => `${Math.round(x * 100)}%`;
const grosze = (x) => Math.round(x * 100) / 100;

function stanLicytacji(o) {
  if (o.ja_prowadze) return `<span class="plus">Prowadzisz: ${zl2(o.cena)}</span>`;
  if (o.prowadzi) return `${esc(o.prowadzi_nazwa)} prowadzi: ${zl2(o.cena)}`;
  return `<span class="podpowiedz">brak ofert</span>`;
}

function nieudaneHtml(D) {
  return [...(D?.odrzucone || []), ...(D?.nieudane || [])]
    .map((o) => `<p class="minus">${esc(o.co)}: ${esc(o.powod)}.</p>`).join("");
}

function transakcjeHtml(D, tytul, zw = false) {
  const tab = zw ? (t, n, w, o) => zwinTabela(t, n, w, { ...o, otwarte: true }) : tabela;
  const T = D?.transakcje || [];
  if (!T.length) return "";
  return tab(tytul, ["Strona", "Z kim", "Co", "Netto", "VAT", "Brutto"],
    T.map((t) => [t.strona === "sprzedaz" ? "Sprzedaż (faktura sprzedaży)" : "Zakup (faktura zakupu)", esc(t.z_kim),
      esc(t.co) + (t.nr ? ` → stanowisko ${t.nr}` : ""), zl2(t.netto), zl2(t.vat),
      `<span class="${t.strona === "sprzedaz" ? "plus" : "minus"}">${zl2(t.strona === "sprzedaz" ? t.cena : -t.cena)}</span>`]),
    { klasy: ["l", "l", "l"] })
    + T.map((t) => `<div class="karta"><p>${esc(t.tekst)}</p></div>`).join("");
}

function przegraneHtml(D, zw = false) {
  const P = D?.przegrane || [];
  if (!P.length) return "";
  return (zw ? zwinTabela : tabela)("Przegrane licytacje", ["Co", "Twoja oferta", "Wygrała drużyna", "Cena"],
    P.map((p) => [esc(p.co), zl2(p.oferta), esc(p.zwyciezca), zl2(p.cena)]), { klasy: ["l", "", "l"] });
}

function wygasleHtml(D) {
  const W = D?.wygasle || [];
  return W.length ? `<p class="podpowiedz">Bez ofert – ogłoszenia wygasły: ${W.map((o) => `${esc(o.co)} (od ${zl2(o.cena_min)})`).join(", ")}.</p>` : "";
}

function wystawioneHtml(lista, tytul, zw = false) {
  if (!lista?.length) return "";
  return (zw ? zwinTabela : tabela)(tytul, ["Co", "Termin", "Cena wywoławcza", "Wartość"],
    lista.map((o) => [esc(o.co), o.termin ? esc(o.termin) : "–", zl2(o.cena_min), zl2(o.wartosc)]), { klasy: ["l", "l"] });
}

function opisSzkicu(o) {
  return o.typ === "towar" ? `${o.zasob} ${o.jakosc}★ × ${o.ilosc} opak.` : `${o.nazwa} (${o.stanowisko} ${o.nr})`;
}

function inneHtml(H, edycja) {
  const inne = H.ogloszenia.filter((o) => !o.moje);
  if (!inne.length) return `<p class="podpowiedz">W tej rundzie nikt nie licytuje żadnego ogłoszenia – nowe ogłoszenia
    z tej rundy pojawią się na giełdzie w następnej.</p>`;
  return tabela("Ogłoszenia na giełdzie – licytacja trwa w tej rundzie",
    ["Od", "Co", "Termin", "Cena wywoławcza", "Stan licytacji", "Twoja oferta", ""],
    inne.map((o) => [esc(o.od_nazwa) + (o.od_bota ? ` <span class="podpowiedz">(bot)</span>` : ""), esc(o.co),
      o.termin ? esc(o.termin) : "–", zl2(o.cena_min), stanLicytacji(o), o.moja_oferta ? zl2(o.moja_oferta) : "–",
      edycja && !o.ja_prowadze ? `<button class="btn zielony" data-akcja="hd-licytuj" data-id="${esc(o.id)}">${o.prowadzi ? "Przebij" : "Licytuj"}</button>` : ""]),
    { klasy: ["l", "l", "l", "", "l"], sortuj: false });
}

function mojeHtml(H) {
  const moje = H.ogloszenia.filter((o) => o.moje);
  if (!moje.length) return "";
  return tabela("Moje ogłoszenia – licytacja trwa w tej rundzie", ["Co", "Cena wywoławcza", "Stan licytacji", "Licytujących"],
    moje.map((o) => [esc(o.co), zl2(o.cena_min), stanLicytacji(o), licz(o.licytujacych)]), { klasy: ["l", "", "l"], sortuj: false });
}

function zapowiedziHtml(H) {
  if (!H.zapowiedzi?.length) return "";
  return zwinTabela("Zapowiedzi innych drużyn – licytacja w następnej rundzie", ["Od", "Co", "Cena wywoławcza"],
    H.zapowiedzi.map((z) => [esc(z.od_nazwa), esc(z.co), z.cena_min ? zl2(z.cena_min) : "–"]), { klasy: ["l", "l"] });
}

function historiaHtml(H) {
  if (!H.historia?.length) return "";
  return zwinTabela("Historia transakcji", ["Runda", "Strona", "Z kim", "Co", "Brutto"],
    H.historia.map((t) => [licz(t.runda), t.strona === "sprzedaz" ? "Sprzedaż" : "Zakup", esc(t.z_kim), esc(t.co),
      `<span class="${t.strona === "sprzedaz" ? "plus" : "minus"}">${zl2(t.strona === "sprzedaz" ? t.cena : -t.cena)}</span>`]),
    { klasy: ["", "l", "l", "l"] });
}

function widelki(L, wartosc) {
  return [grosze(wartosc * L.cena_min), grosze(wartosc * L.cena_maks)];
}

function sprawdzCene(L, wartosc, cena) {
  const [od, doo] = widelki(L, wartosc);
  if (!(cena > 0)) return "Podaj cenę wywoławczą.";
  // wartość z widoku jest zaokrąglona do groszy – margines 1 gr, ostatecznie sprawdza silnik po rundzie
  return cena < od - 0.01 || cena > doo + 0.01 ? `Cena wywoławcza musi mieścić się w widełkach: ${zl2(od)}–${zl2(doo)}.` : "";
}

function miejsceNaOgloszenie(c) {
  const L = c.v.handel.limity, n = (c.d.handel_wystaw || []).length;
  if (n >= L.maks_ogloszen) { toast(`Najwyżej ${L.maks_ogloszen} ogłoszeń w rundzie.`); return false; }
  return true;
}

export const handel = {
  tytul: "Giełda handlu", ikona: "handel", odblokowanie: (v) => !!v.handel?.otwarty, ukryta: (v) => !v.handel,
  info: `Giełda handlu to wspólny rynek wszystkich drużyn i botów. Można wystawić na niej towar z magazynu albo sprzęt
    ze stanowiska z ceną wywoławczą. Ogłoszenie wpisane w tej rundzie trafia na giełdę po przeliczeniu i jest
    licytowane przez całą następną rundę. Licytacja jest jawna: każdy widzi, kto prowadzi i za ile, a kolejna oferta
    musi przebić prowadzącą o ustalony krok. Boty też licytują – do swojej (ukrytej) granicy ceny. Na początku
    przeliczenia najwyższa oferta kupuje: sprzedawca księguje fakturę sprzedaży, kupujący – fakturę zakupu (KPiR).
    Ogłoszenie bez ofert wygasa.`,
  decyzje({ v, d, edycja }) {
    const H = v.handel;
    if (!H) return `<p class="podpowiedz">Brak danych.</p>`;
    if (!H.otwarty) return `<p class="podpowiedz">Giełda handlu od rundy ${H.od_rundy}.</p>`;
    const L = H.limity, D = H.decyzja;
    let h = `<p class="co-tu">Tu kupujesz i sprzedajesz towar z magazynu oraz sprzęt innym firmom: wystawiasz ogłoszenie albo przebijasz cudzą ofertę, a wygrywa najwyższa w chwili zamknięcia rundy.</p>
      <div class="pasek ciemny"><span>Cena wywoławcza: ${proc(L.cena_min)}–${proc(L.cena_maks)} wartości
        (towar – koszt zakupu, sprzęt – cena katalogowa)</span><span>Przebicie o co najmniej ${proc(L.krok_przebicia)}</span>
        <span>Najwyżej ${L.maks_ogloszen} ogłoszeń w rundzie</span><span>Na koncie: ${zl2(H.gotowka)}</span></div>`;
    h += inneHtml(H, edycja) + mojeHtml(H);
    h += transakcjeHtml(D, "Rozstrzygnięcie licytacji – po przeliczeniu (podgląd przy obecnych ofertach)");
    h += przegraneHtml(D) + wygasleHtml(D);
    // nowe ogłoszenia z tej rundy
    const nowe = d.handel_wystaw || [];
    if (nowe.length) {
      h += tabela("Nowe ogłoszenia – na giełdzie od następnej rundy", ["Co", "Cena wywoławcza", ""],
        nowe.map((o, i) => [esc(opisSzkicu(o)), zl2(o.cena_min),
          edycja ? `<button class="btn jasny" data-akcja="hd-usun" data-i="${i}">Usuń</button>` : ""]),
        { klasy: ["l"], sortuj: false });
    }
    h += wystawioneHtml(D?.wystawione, "Ogłoszenia przyjęte na giełdę (podgląd)");
    h += nieudaneHtml(D);
    if (edycja) {
      h += `<div class="przyciski">${H.towary.length ? `<button class="btn" data-akcja="hd-towar">Wystaw towar</button>` : ""}
        ${H.sprzet.length ? `<button class="btn" data-akcja="hd-sprzet">Wystaw sprzęt</button>` : ""}</div>`;
    }
    h += zapowiedziHtml(H) + historiaHtml(H);
    return h + `<p class="podpowiedz">Ogłoszenie jest sprawdzane po tygodniu sprzedaży: towaru musi wystarczyć w magazynie
      na koniec rundy, a sprzęt musi stać na stanowisku (sprzętu z najmu lokalu i w leasingu nie można sprzedać).
      Złożonej oferty nie można obniżyć ani wycofać. Kupujący płaci z konta firmy – bez pieniędzy wygrywa następna
      oferta. Towar przychodzi z terminem przydatności sprzedawcy, sprzęt trafia na pierwsze stanowisko tego typu bez
      takiego sprzętu.</p>`;
  },
  wyniki({ v }) {
    const W = v.wyniki?.handel;
    if (!W) return brakWynikow("Wyniki pojawią się po rundzie z giełdą handlu.");
    const T = W.transakcje || [], sprz = T.filter((t) => t.strona === "sprzedaz"), zak = T.filter((t) => t.strona !== "sprzedaz");
    const nied = (W.odrzucone || []).length + (W.nieudane || []).length;
    const puste = !T.length && !W.wystawione?.length && !nied && !W.przegrane?.length && !W.wygasle?.length;
    const lead = puste ? podsumowanie("W tej rundzie drużyna nie handlowała na giełdzie.") : podsumowanie([
      T.length ? `Zawarto <b>${licz(T.length)}</b> ${T.length === 1 ? "transakcję" : "transakcji"}: ${licz(sprz.length)} sprzedaży i ${licz(zak.length)} zakupów.` : "Żadna transakcja nie doszła do skutku.",
      W.wystawione?.length ? `Na giełdę trafiło ${licz(W.wystawione.length)} nowych ogłoszeń – licytacja w następnej rundzie.` : "",
      nied ? `Nie udało się: ${licz(nied)}.` : ""], nied ? "uwaga" : "ok");
    const kafle = puste ? "" : kafelkiLiczb([{ etykieta: "Transakcje", wartosc: licz(T.length) },
      { etykieta: "Sprzedaż", wartosc: zl(sprz.reduce((a, t) => a + t.cena, 0)), ton: sprz.length ? "plus" : "" },
      { etykieta: "Zakupy", wartosc: zl(zak.reduce((a, t) => a + t.cena, 0)), ton: zak.length ? "minus" : "" },
      W.przegrane?.length ? { etykieta: "Przegrane licytacje", wartosc: licz(W.przegrane.length) } : null,
      nied ? { etykieta: "Nieudane", wartosc: licz(nied), ton: "minus" } : null]);
    return lead + kafle + transakcjeHtml(W, "Transakcje w rundzie", true) + przegraneHtml(W, true) + wygasleHtml(W)
      + wystawioneHtml(W.wystawione, "Ogłoszenia wystawione (licytacja w następnej rundzie)", true) + nieudaneHtml(W);
  },
  akcje: {
    "hd-licytuj": (el, c) => {
      const o = c.v.handel.ogloszenia.find((x) => x.id === el.dataset.id);
      if (!o) return toast("To ogłoszenie nie jest już licytowane.");
      okno(`Licytacja: ${o.co}`, `<p>${o.prowadzi ? stanLicytacji(o) : `Nikt jeszcze nie licytuje. Cena wywoławcza ${zl2(o.cena_min)}.`}
        ${o.moja_oferta ? `Twoja dotychczasowa oferta: ${zl2(o.moja_oferta)}.` : ""}</p>
        <label class="pole">Oferta brutto za całość<input type="number" id="hd-kwota" min="${o.minimum}" step="0.01" value="${o.minimum}"></label>
        <p class="podpowiedz">Najmniej ${zl2(o.minimum)} (przebicie o ${proc(c.v.handel.limity.krok_przebicia)}). Wartość
        ${zl2(o.wartosc)}, w cenie VAT ${proc(o.stawka)}. Złożonej oferty nie można obniżyć ani wycofać – jeśli wygra,
        pieniądze zejdą z konta na początku następnego przeliczenia.</p>`,
      { male: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="hd-licytuj-ok" data-id="${esc(o.id)}">Złóż ofertę</button>` });
    },
    "hd-licytuj-ok": async (el, c) => {
      const o = c.v.handel.ogloszenia.find((x) => x.id === el.dataset.id);
      const kwota = grosze(+document.getElementById("hd-kwota").value);
      if (!o) { zamknijOkno(); return toast("To ogłoszenie nie jest już licytowane."); }
      if (!(kwota >= o.minimum)) return toast(`Oferta musi wynosić co najmniej ${zl2(o.minimum)}.`);
      zamknijOkno();
      await c.zmien((d) => { (d.handel_licytuj = d.handel_licytuj || {})[o.id] = kwota; });
    },
    "hd-usun": (el, c) => c.zmien((d) => { d.handel_wystaw.splice(+el.dataset.i, 1); }),
    "hd-towar": (el, c) => {
      if (!miejsceNaOgloszenie(c)) return;
      const H = c.v.handel;
      okno("Wystaw towar na giełdę", `<label class="pole">Towar<select id="hd-co">${H.towary.map((t, i) => `<option value="${i}">${esc(t.zasob)} ${t.jakosc}★ – ${t.ilosc} opak.
          (koszt ${zl2(t.wartosc)}/opak.${t.termin ? `, termin ${esc(t.termin)}` : ""})</option>`).join("")}</select></label>
        <label class="pole">Ilość opakowań<input type="number" id="hd-ilosc" min="0.1" step="1" value="${Math.min(10, H.towary[0].ilosc)}"></label>
        <label class="pole">Cena wywoławcza brutto za całość<input type="number" id="hd-cena" min="0.01" step="10"></label>
        <p class="podpowiedz">Cena wywoławcza: ${proc(H.limity.cena_min)}–${proc(H.limity.cena_maks)} kosztu zakupu
        wystawionej ilości. Stan magazynu z początku rundy – ogłoszenie przejdzie, jeśli towaru wystarczy na koniec rundy.</p>`,
      { male: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="hd-towar-ok">Wystaw</button>` });
    },
    "hd-towar-ok": async (el, c) => {
      const H = c.v.handel, t = H.towary[+document.getElementById("hd-co").value];
      const ilosc = +document.getElementById("hd-ilosc").value, cena = grosze(+document.getElementById("hd-cena").value);
      if (!(ilosc > 0)) return toast("Podaj ilość.");
      if (ilosc > t.ilosc) return toast(`W magazynie jest ${t.ilosc} opak.`);
      const blad = sprawdzCene(H.limity, t.wartosc * ilosc, cena);
      if (blad) return toast(blad);
      zamknijOkno();
      await c.zmien((d) => { (d.handel_wystaw = d.handel_wystaw || []).push({ typ: "towar", zasob: t.zasob, jakosc: t.jakosc, ilosc, cena_min: cena }); });
    },
    "hd-sprzet": (el, c) => {
      if (!miejsceNaOgloszenie(c)) return;
      const H = c.v.handel;
      okno("Wystaw sprzęt na giełdę", `<label class="pole">Sprzęt<select id="hd-co">${H.sprzet.map((s, i) => `<option value="${i}">${esc(s.nazwa)} ${s.jakosc}★
          (${esc(s.stanowisko)} ${s.nr}, katalog ${zl2(s.katalog)})</option>`).join("")}</select></label>
        <label class="pole">Cena wywoławcza brutto<input type="number" id="hd-cena" min="0.01" step="50"></label>
        <p class="podpowiedz">Cena wywoławcza: ${proc(H.limity.cena_min)}–${proc(H.limity.cena_maks)} ceny katalogowej.
        Do końca licytacji sprzęt zostaje na stanowisku i pracuje.</p>`,
      { male: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="hd-sprzet-ok">Wystaw</button>` });
    },
    "hd-sprzet-ok": async (el, c) => {
      const H = c.v.handel, s = H.sprzet[+document.getElementById("hd-co").value];
      const cena = grosze(+document.getElementById("hd-cena").value);
      const blad = sprawdzCene(H.limity, s.katalog, cena);
      if (blad) return toast(blad);
      if ((c.d.handel_wystaw || []).some((o) => o.typ === "sprzet" && o.stanowisko === s.stanowisko && o.nr === s.nr && o.nazwa === s.nazwa)) {
        return toast("Ten sprzęt jest już w nowych ogłoszeniach.");
      }
      zamknijOkno();
      await c.zmien((d) => { (d.handel_wystaw = d.handel_wystaw || []).push({ typ: "sprzet", stanowisko: s.stanowisko, nr: s.nr, nazwa: s.nazwa, cena_min: cena }); });
    },
  },
};
