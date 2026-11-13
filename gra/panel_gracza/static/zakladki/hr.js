// Ludzie: zatrudnienie (obsada stanowisk w Mój lokal), zespół, udogodnienia, szkolenia.
// UF20 (gra z lokalami): nowych ludzi zatrudnia się w Rynku pracy (od razu z lokalem i stanowiskiem), a obsada w Moim
// lokalu przypisuje osoby już zatrudnione – z tego lokalu od razu, z innego za zgodą pracownika (decyzja `przenosiny`).
import { esc, naOkres, naRunde, OKRES, gw, inicjaly, licz, nazwaFirmy, okno, ponadLimitPracownikow, podsumowanie, kafelkiLiczb, proc, tabela, tekstLimituPracownikow, toast,
  wykres, zamknijOkno, zl, zwin, zwinTabela, kartaMarki, KOLORY, zl2 } from "./wspolne.js";
import { kafleUdogodnien, przelaczUdog } from "./inwestycje.js";
import { kolko } from "./dymki.js";
import { licznikCzasu } from "./czas.js";
import { klienciZKolejki, OPISY_LUDZI, tabelaDni, wykresObciazenia } from "./obciazenie.js";
import { idWybranego, nazwaLokalu, stanowiskaLokalu, wyborLokaluKrotki } from "./lokal_wybor.js";
import { forma, kosztMiesieczny, minimum, nazwaFormy, oczekiwana, opcjeForm, opisFormy, pigulkaStudenta, progOferty } from "./formy.js";

const TYPY = ["kuchnia", "kasa"];  // nazwy i zawody typów: kat.oferty.stanowiska.typy (katalog.yaml)
const NIEZADOWOLENIE = "niezadowolenie";   // silnik/ludzie/zadowolenie.py: powód wypowiedzenia (U20)

// UF18: „oferty: 2 drużyny” – ile innych drużyn złożyło już ofertę dla tej osoby (bez kwot; silnik: rynek_pracy.zainteresowanie)
const odmiana = (n, jedna, kilka, wiele) => n === 1 ? jedna : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? kilka : wiele;
const osob = (n) => `${licz(n)} ${odmiana(n, "osoba", "osoby", "osób")}`;
const druzyn = (n) => `${n} ${n === 1 ? "drużyna" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "drużyny" : "drużyn"}`;
export function pigulkaOfert(v, rodzaj, id) {
  const n = v.agencja?.zainteresowanie?.[rodzaj]?.[id];
  const tytul = rodzaj === "pracownicy" ? "Tyle innych drużyn chce już zatrudnić tę osobę w tej rundzie – wygra wyższa pensja"
    : "Tyle innych drużyn chce już zatrudnić tę osobę w tej rundzie";
  return n ? ` <span class="pigulka nie" title="${tytul}">oferty: ${druzyn(n)}</span>` : "";
}
// Poprawki 2 (sprawa 6): „kto pierwszy, ten lepszy” – kandydat w zapisanym szkicu innej drużyny ludzi jest zajęty
// (api: v.agencja.zajeci; silnik/ludzie/rynek_pracy.kontrola_zatrudnien odrzuca taki zapis). Mój własny wybór się nie liczy.
export function zajety(v, id) {
  if ((v.decyzje?.zatrudnij || []).some((z) => z.kandydat === id)) return null;
  return v.agencja?.zajeci?.[id] ?? null;
}
const pigulkaZajety = (kto) => ` <span class="pigulka nie" title="Ta drużyna pierwsza zapisała zatrudnienie tej osoby">zajęty: ${esc(kto)}</span>`;
function przyciskZatrudnij(v, k, edycja, dane = "") {
  const kto = zajety(v, k.id);
  return `<button class="btn pom maly" data-akcja="zatrudnij" data-k="${esc(k.id)}"${dane} ${edycja && !kto ? "" : "disabled"}${kto
    ? ` title="Kandydata zatrudnia już drużyna ${esc(kto)} – wybierz kogoś innego"` : ""}>Zatrudnij +</button>`;
}
// UF18: próba podkupienia mojego pracownika (oferty innych drużyn zapisane w tej rundzie)
function pigulkaPodkupienia(v, p) {
  const o = (v.agencja?.oferty_dla_mnie || []).filter((x) => x.pracownik === p.id && x.pensja > x.obecna_pensja);
  if (!o.length) return "";
  const kto = [...new Set(o.map((x) => nazwaFirmy(v, x.od)))].map(esc).join(", ");
  return ` <a class="pigulka nie" data-zakladka-k="rynek_pracy" title="Złóż kontrofertę w zakładce Rynek pracy">chce go podkupić: ${kto}</a>`;
}

// U20: charakter osoby podany jawnie (decyzja autora 7.11.2026) – pigułka z nazwą i dymek ze skutkami (dane: cechy)
const zdanieCharakteru = (o) => `Charakter: ${o.charakter.nazwa}. Wpływ: ${o.charakter.skutek}.`;
const opisOsoby = (o) => o.charakter ? ` <span class="pigulka">${esc(o.charakter.nazwa)}</span>${kolko(esc(zdanieCharakteru(o)))}` : "";
const zadowolenieOsoby = (p) => p.zadowolenie == null ? "–"
  : `<span class="${p.niezadowolony ? "minus" : ""}">${licz(p.zadowolenie, 2)}</span>`;

// koszt za rundę: pensje miesięczne z ZUS pracodawcy (wg formy zatrudnienia, UF21) przeliczone na rundę + premie (bez ZUS)
function kosztWynagrodzen(v, kat) {
  return v.stan.pracownicy.reduce((s, p) => s + naRunde(kosztMiesieczny(kat, p)) + (p.premia || 0), 0);
}

// UF21: pensja w oknie zatrudnienia/profilu musi spełnić minimum formy (pół etatu – połowa, B2B i staż – bez)
function zlaPensja(kat, pensja, umowa, osoba) {
  const min = minimum(kat, umowa, osoba?.student);
  return pensja < min ? `Pensja w tej formie nie może być niższa niż ${zl(min)}.` : null;
}

// kalibracja B9: kandydat odrzuca ofertę poniżej progu (ok. 95% oczekiwanej) – silnik/ludzie/formy.py: odrzuca
function zaNiskaOferta(kat, pensja, umowa, k) {
  const prog = k ? progOferty(kat, k, umowa) : 0;
  return prog && pensja < prog ? `${k.imie_nazwisko} odrzuci ofertę ${zl(pensja)} – to mniej niż ${proc(kat.parametry.oferta_pracy.prog_odrzucenia, 0)} pensji oczekiwanej. Zaproponuj co najmniej ${zl(prog)}.` : null;
}

export const zatrudnienie = {
  tytul: "Zatrudnienie", tytulPelny: "HR - zatrudnienie", ikona: "☺", odblokowanie: "hr_zatrudnienie",
  info: "Zatrudnij pracowników potrzebnych do przygotowania i sprzedaży wybranych dań. Pracownik potrzebuje stanowiska (Wnętrze ▸ Stanowiska i sprzęt).",
  decyzje({ v, kat, edycja }) {
    let html = `<div class="pasek ciemny"><span>Koszty wynagrodzeń: <span class="kwota">${zl(kosztWynagrodzen(v, kat))}</span>${naOkres()} brutto (z ZUS pracodawcy; pensje w umowach – miesięczne)</span></div>`;
    if (v.nieudane_zatrudnienia?.length) html += `<div class="komunikat zly">Część kandydatów zatrudniła już inna firma – wybierz innych.</div>`;
    for (const typ of TYPY) {
      const st = stanowiskaLokalu(v, v.stan.stanowiska).filter((s) => s.typ === typ);
      html += `<div class="pasek">${esc(kat.oferty.stanowiska.typy[typ].nazwa)}${idWybranego(v) ? ` – ${esc(nazwaLokalu(v, idWybranego(v)))}` : ""}</div>`;
      if (!st.length) { html += `<p class="podpowiedz">Brak stanowisk – uruchom je w zakładce Wnętrze ▸ Stanowiska i sprzęt.</p>`; continue; }
      html += `<div class="siatka waska">${st.map((s) => {
        const p = v.stan.pracownicy.find((x) => x.id === s.pracownik);
        const wl = v.wlasciciel_stanowisko;   // właściciel staje sam na pustym stanowisku (silnik/ludzie/czas_wlasciciela.py)
        if (!p && wl && wl.typ === typ && wl.nr === s.nr) return kafelWlasciciela(v, s);
        if (!p && v.lokale) return `<div class="kafel"><div class="kg">Stanowisko nr ${s.nr}</div><div class="kt srodek"><div class="awatar pusty">+</div>
          <button class="btn jasny" data-akcja="przypisz" data-t="${typ}" data-n="${s.nr}" ${edycja ? "" : "disabled"}>Przypisz osobę →</button>
          <span class="podpowiedz" style="margin-top:6px">Nowa osoba: <a data-zakladka-k="rynek_pracy">Rynek pracy</a></span></div></div>`;
        if (!p) return `<div class="kafel"><div class="kg">Stanowisko nr ${s.nr}</div><div class="kt srodek"><div class="awatar pusty">+</div>
          <button class="btn jasny" data-akcja="kandydaci" data-t="${typ}" data-n="${s.nr}" ${edycja ? "" : "disabled"}>Zatrudnij pracownika →</button></div></div>`;
        const nowy = p.od_rundy === v.runda, prz = (v.decyzje.przenosiny || []).find((x) => x.pracownik === p.id);
        const ruch = prz ? `<span class="pigulka inf">${przenosinyMiedzyLokalami(v, prz) ? "czeka na zgodę" : "przeniesiony"}</span>` : "";
        const wyp = p.odchodzi ? `<span class="pigulka${p.odchodzi.powod === NIEZADOWOLENIE ? " nie" : ""}">wypowiedzenie do r. ${p.odchodzi.runda}</span>`
          : p.niezadowolony ? '<span class="pigulka nie">niezadowolony</span>' : "";
        return `<div class="kafel"><div class="kg">Stanowisko nr ${s.nr}${nowy ? '<span class="pigulka inf">nowy</span>' : ""}${ruch}${wyp}${opisOsoby(p)}</div>
          <div class="kt srodek" data-akcja="profil" data-id="${esc(p.id)}" style="cursor:pointer"><div class="awatar">${inicjaly(p.imie_nazwisko)}</div>
          <b>${esc(p.imie_nazwisko)}</b>${pigulkaStudenta(p, kat)}<br><span class="podpowiedz">${esc(p.zawod)} · ${nazwaFormy(kat, p.umowa)}</span><br>${gw(p.gwiazdki)}<br>
          <b class="akcent">${zl(p.pensja)}</b>${p.premia ? `<br><span class="podpowiedz">premia ${zl(p.premia)}</span>` : ""}</div>
          ${prz ? `<button class="btn jasny maly" data-akcja="cofnij-przenosiny" data-id="${esc(p.id)}" ${edycja ? "" : "disabled"}>Cofnij przeniesienie</button>` : ""}</div>`;
      }).join("")}</div>`;
    }
    if (v.lokale) html += `<p class="podpowiedz">Na wolne stanowisko przypiszesz osobę z tego lokalu (od razu) albo z innego Twojego lokalu –
      wtedy pracownik musi się zgodzić (zależy to od jego zadowolenia, odległości i dodatku za przejście; odpowiedź po przeliczeniu rundy).
      Nowych ludzi zatrudniasz w zakładce <a data-zakladka-k="rynek_pracy">Rynek pracy</a>.</p>
      <p class="podpowiedz">Puste stanowisko nie stoi bezczynnie: właściciel sam na nim staje (jak pracownik 1★, bez pensji) – ale tylko
      w godzinach, które zostają mu po sprawach poza lokalem (<a data-zakladka-k="czas_wlasciciela">Czas właściciela</a>).</p>`;
    return html;
  },
  wyniki({ v, kat }) {
    const r = v.rynek, ZAWODY = kat.zawody;
    const firmy = Object.keys(r.pracownicy || {});
    const liczba = firmy.map((f) => [esc(nazwaFirmy(v, f)), ...ZAWODY.map((z) => {
      const g = r.pracownicy[f][z]; const n = g[1] + g[2] + g[3];
      return n ? `${n} <span class="podpowiedz">(${g[1]}★ ${g[2]}★★ ${g[3]}★★★)</span>` : "0";
    })]);
    const wyk = firmy.map((f) => [esc(nazwaFirmy(v, f)), ...ZAWODY.map((z) => proc(r.wykorzystanie[f][z]))]);
    const pensje = firmy.map((f) => [esc(nazwaFirmy(v, f)), ...ZAWODY.map((z) => r.wynagrodzenia[f][z] ? zl2(r.wynagrodzenia[f][z]) : "–")]);
    const moi = (v.wyniki?.pracownicy || []).map((p) => [esc(p.imie_nazwisko), esc(p.zawod), gw(p.gwiazdki), `nr ${p.stanowisko}`, proc(p.wykorzystanie),
      zl2(p.pensja), zadowolenieOsoby(p) + (p.powody?.length ? `<br><span class="podpowiedz">${p.powody.map(esc).join(", ")}</span>` : "")]);
    const wl = v.wyniki?.wlasciciel_stanowisko;
    if (wl?.przyjete) moi.push([`<b>Właściciel</b> <span class="podpowiedz">(${licz(wl.godziny, 1)} h)</span>`, esc(kat.oferty.stanowiska.typy[wl.typ]?.kto || wl.typ),
      gw(1), `nr ${wl.nr}`, proc(wl.wykorzystanie || 0), "bez pensji", "–"]);
    const odejscia = (v.wyniki?.odejscia_pracownikow || []).map((o) => [esc(o.imie_nazwisko), licz(o.zadowolenie, 2), o.powody.map(esc).join(", "),
      `runda ${o.runda_odejscia}`]);
    const L = v.wyniki?.pracownicy || [], nzad = L.filter((p) => p.niezadowolony).length, sr = L.length ? L.reduce((a, p) => a + (p.wykorzystanie || 0), 0) / L.length : 0;
    const lead = !L.length ? podsumowanie("Nie masz jeszcze zatrudnionych pracowników.") : podsumowanie([
      `W zespole pracuje <b>${licz(L.length)}</b> ${L.length === 1 ? "osoba" : "osób"}, średnie wykorzystanie czasu to <b>${proc(sr, 0)}</b>.`,
      nzad ? `Niezadowolonych jest ${licz(nzad)} – bez zmian mogą złożyć wypowiedzenie.` : "Nikt nie jest niezadowolony.",
      odejscia.length ? `Z niezadowolenia odchodzi ${licz(odejscia.length)} ${odejscia.length === 1 ? "osoba" : "osób"}.` : ""], nzad || odejscia.length ? "uwaga" : "ok");
    const kafle = L.length ? kafelkiLiczb([{ etykieta: "Pracownicy", wartosc: licz(L.length) }, { etykieta: "Średnie wykorzystanie czasu", wartosc: proc(sr, 0) },
      { etykieta: "Niezadowoleni", wartosc: licz(nzad), ton: nzad ? "minus" : "plus" }, { etykieta: "Wypowiedzenia", wartosc: licz(odejscia.length), ton: odejscia.length ? "minus" : "" }]) : "";
    return lead + kafle + zwinTabela("Twoi pracownicy", ["Pracownik", "Zawód", "Doświadczenie", "Stanowisko", "Wykorzystanie czasu", "Wynagrodzenie", "Zadowolenie"], moi, { klasy: ["l"], otwarte: true })
      + (odejscia.length ? zwinTabela("Wypowiedzenia z niezadowolenia", ["Pracownik", "Zadowolenie", "Powody", "Odchodzi"], odejscia, { klasy: ["l"], otwarte: true }) : "")
      + zwinTabela("Liczba pracowników", ["Zespół", ...ZAWODY], liczba, { klasy: ["l"] })
      + zwinTabela("Wykorzystanie czasu pracowników", ["Zespół", ...ZAWODY], wyk, { klasy: ["l"] })
      + zwinTabela("Średnie wynagrodzenie pracowników", ["Zespół", ...ZAWODY], pensje, { klasy: ["l"] })
      + `<p class="podpowiedz">Wykorzystanie 100% oznacza, że pracownik nie miał czasu na kolejnych klientów (możliwa utracona sprzedaż).</p>`;
  },
  akcje: {
    kandydaci: (el, c) => oknoKandydatow(c, el.dataset.t, +el.dataset.n),
    zatrudnij: (el, c) => {
      const { k, t, n } = el.dataset;   // bez t/n (Rynek pracy) – lokal i stanowisko wybiera się w oknie
      const kto = zajety(c.v, k);
      if (kto) return toast(`Kandydata zatrudnia już drużyna ${kto} – kto pierwszy zapisze, ten go dostaje.`);
      const inne = (c.d.zatrudnij || []).filter((z) => !(z.typ === t && z.nr === +n) && z.kandydat !== k);   // zastąpienie się nie liczy
      if (ponadLimitPracownikow(c.v, inne, c.d.podkup || [])) return toast(tekstLimituPracownikow(c.v));
      return oknoZatrudnienia(c, k, t, t ? +n : null);
    },
    "potwierdz-zatrudnienie": async (el, c) => {
      const umowa = document.getElementById("z-umowa").value;
      const pensja = forma(c.kat, umowa).staz ? 0 : +document.getElementById("z-pensja").value;
      const kand = c.v.kandydaci.find((x) => x.id === el.dataset.k);
      const blad = zlaPensja(c.kat, pensja, umowa, kand) || zaNiskaOferta(c.kat, pensja, umowa, kand);
      if (blad) return toast(blad);
      const miejsce = document.getElementById("z-miejsce");
      if (miejsce && !miejsce.value) return toast("Wybierz lokal i stanowisko dla nowej osoby.");
      const [t, n] = miejsce ? miejsce.value.split(":") : [el.dataset.t, el.dataset.n];
      const { k } = el.dataset, kanal = document.getElementById("z-kanal")?.value;
      const imie = c.v.kandydaci.find((x) => x.id === k)?.imie_nazwisko;   // do komunikatu „zajęty” u innych drużyn
      zamknijOkno();
      await c.zmien((d) => {
        d.zatrudnij = [...(d.zatrudnij || []).filter((z) => !(z.typ === t && z.nr === +n) && z.kandydat !== k),
          { kandydat: k, typ: t, nr: +n, pensja, umowa, ...(kanal ? { kanal } : {}), ...(imie ? { imie_nazwisko: imie } : {}) }];
      });
    },
    przypisz: (el, c) => oknoPrzypisania(c, el.dataset.t, +el.dataset.n),
    "wybierz-osobe": (el, c) => {
      const { id, t, n } = el.dataset;
      if (el.dataset.inny !== "1") return zapiszPrzenosiny(c, { pracownik: id, typ: t, nr: +n });
      return oknoPrzenosin(c, id, t, +n);
    },
    "potwierdz-przenosiny": (el, c) => {
      const dodatek = Math.max(0, +(document.getElementById("pz-dodatek")?.value || 0));
      return zapiszPrzenosiny(c, { pracownik: el.dataset.id, typ: el.dataset.t, nr: +el.dataset.n, ...(dodatek ? { dodatek } : {}) });
    },
    "cofnij-przenosiny": (el, c) => c.zmien((d) => { d.przenosiny = (d.przenosiny || []).filter((x) => x.pracownik !== el.dataset.id); }),
    profil: (el, c) => oknoProfilu(c, el.dataset.id),
    "zapisz-profil": async (el, c) => {
      const id = el.dataset.id, nowy = el.dataset.nowy === "1";
      const umowa = document.getElementById("p-umowa").value;
      const pensja = forma(c.kat, umowa).staz ? 0 : +document.getElementById("p-pensja").value;
      const premia = +(document.getElementById("p-premia")?.value || 0);
      const blad = zlaPensja(c.kat, pensja, umowa, c.v.stan.pracownicy.find((x) => x.id === id));
      if (blad) return toast(blad);
      zamknijOkno();
      await c.zmien((d) => {
        if (nowy) d.zatrudnij = (d.zatrudnij || []).map((z) => z.kandydat === id ? { ...z, pensja, umowa } : z);
        else d.zmiany = { ...(d.zmiany || {}), [id]: { pensja, umowa, premia } };
      });
    },
    zwolnij: async (el, c) => {
      const id = el.dataset.id, nowy = el.dataset.nowy === "1";
      if (!nowy && !confirm("Zwolnić pracownika? Trzeba zapłacić odprawę, a na umowie o pracę przez 2 rundy wypowiedzenia nadal pracuje i dostaje pensję.")) return;
      zamknijOkno();
      await c.zmien((d) => {
        if (nowy) d.zatrudnij = (d.zatrudnij || []).filter((z) => z.kandydat !== id);
        else d.zwolnij = [...new Set([...(d.zwolnij || []), id])];
      });
    },
    "cofnij-zwolnienie": async (el, c) => {
      zamknijOkno();
      await c.zmien((d) => { d.zwolnij = (d.zwolnij || []).filter((x) => x !== el.dataset.id); });
    },
  },
  zmiany: {
    // UF21: zmiana formy w oknie zatrudnienia/profilu – pensja oczekiwana w tej formie, minimum i opis
    "forma-zatrudnienia": (el, c) => {
      const osoba = c.v.kandydaci.find((x) => x.id === el.dataset.k) || c.v.stan.pracownicy.find((x) => x.id === el.dataset.k);
      if (!osoba) return;
      const pole = document.getElementById(el.dataset.pensja), u = el.value, staz = !!forma(c.kat, u).staz;
      if (pole) {
        pole.disabled = staz;
        pole.min = minimum(c.kat, u, osoba.student);
        if (staz) pole.value = 0;   // kandydat – pensja oczekiwana w nowej formie; pracownik – tylko po stażu (0)
        else if (c.v.kandydaci.includes(osoba) || !+pole.value) pole.value = oczekiwana(c.kat, osoba, u);
      }
      const opis = document.getElementById(el.dataset.opis);
      if (opis) opis.innerHTML = opisFormy(c.kat, u, osoba, { kandydat: c.v.kandydaci.includes(osoba) });
      if (c.v.kandydaci.includes(osoba)) ostrzezenieOferty(c, osoba);
    },
    // kalibracja B9: ostrzeżenie pod pensją w oknie zatrudnienia, gdy kandydat odrzuci ofertę
    "pensja-oferty": (el, c) => {
      const osoba = c.v.kandydaci.find((x) => x.id === el.dataset.k);
      if (osoba) ostrzezenieOferty(c, osoba);
    },
  },
};

function ostrzezenieOferty(c, k) {
  const el = document.getElementById("z-ostrzezenie-oferty"), umowa = document.getElementById("z-umowa")?.value || "prace";
  if (!el) return;
  const pensja = forma(c.kat, umowa).staz ? 0 : +document.getElementById("z-pensja").value;
  const t = zaNiskaOferta(c.kat, pensja, umowa, k);
  el.textContent = t || "";
  el.hidden = !t;
}

// właściciel sam na pustym stanowisku (godziny z puli czasu właściciela, które zostały po sprawach poza lokalem)
function kafelWlasciciela(v, s) {
  const wl = v.wlasciciel_stanowisko;
  return `<div class="kafel"><div class="kg">Stanowisko nr ${s.nr}<span class="pigulka inf">właściciel</span></div>
    <div class="kt srodek"><div class="awatar">Ty</div><b>Właściciel</b><br>${gw(1)}<br>
    <span class="podpowiedz">${licz(wl.godziny, 1)} h w tym tygodniu · bez pensji</span>
    ${v.czas_wlasciciela ? `<div class="podpowiedz" style="margin-top:6px">${licznikCzasu(v.czas_wlasciciela, true)}</div>` : ""}</div></div>`;
}

function oknoKandydatow({ v, kat }, typ, nr) {
  const typy = kat.oferty.stanowiska.typy, zawody = typy[typ].zawody;
  const lista = v.kandydaci.filter((k) => zawody.includes(k.zawod)).sort((a, b) => b.zadowolenie_klientow - a.zadowolenie_klientow);
  const w = lista.map((k) => [esc(k.imie_nazwisko) + pigulkaStudenta(k, kat) + (zajety(v, k.id) ? pigulkaZajety(zajety(v, k.id)) : "") + opisOsoby(k),
    gw(k.gwiazdki), esc(k.zawod), licz(k.pensja_preferowana), licz(k.koszt_rekrutacji),
    licz(k.koszt_odprawy), proc(k.zadowolenie_klientow, 0), proc(k.ryzyko_reklamacji, 0),
    przyciskZatrudnij(v, k, true, ` data-t="${typ}" data-n="${nr}"`)]);
  okno(`Zatrudnienie na „Stanowisko nr ${nr}”`, tabela(null, ["Imię i nazwisko", "Doświadczenie", "Zawód", "Preferowane wynagrodzenie",
    "Koszty rekrutacji", "Koszt odprawy", "Zadowolenie klientów", "Ryzyko reklamacji", "Akcje"], w, { klasy: ["l"] })
    + `<p class="podpowiedz">${TYPY.map((t) => `${esc(typy[t].kto)}: ${typy[t].zawody.map(esc).join(", ")}`).join(" · ")}</p>`);
}

// gra z lokalami: kandydata szuka się przez kanał rekrutacji (zakładka Rynek pracy) – koszt i czas właściciela zależą od kanału
function kanalyRekrutacji(v, k) {
  const A = v.agencja;
  if (!A) return "";
  const opcje = (A.kanaly_kandydatow[k.id] || []).map((n) => {
    const kn = A.kanaly[n], koszt = kn.oplata + kn.mnoznik_rekrutacji * k.koszt_rekrutacji;
    return `<option value="${esc(n)}">${esc(kn.nazwa)} – ${zl(koszt)}${kn.czas_wlasciciela ? `, ${licz(kn.czas_wlasciciela, 1)} h czasu właściciela` : ""}</option>`;
  }).join("");
  return `<label class="pole">Kanał rekrutacji (<a data-zakladka-k="rynek_pracy">Rynek pracy</a>)<select id="z-kanal">${opcje}</select></label>
    <p class="podpowiedz">Kto pierwszy, ten lepszy: kandydata dostaje drużyna, która pierwsza zapisze jego zatrudnienie –
      inne drużyny widzą go wtedy jako „zajęty”.</p>`;
}

// UF20: wolne stanowiska dla zawodu (właściciel staje na tych, które zostaną puste) – w podglądzie decyzji, więc już po przenosinach
const typyZawodu = (kat, zawod) => TYPY.filter((t) => kat.oferty.stanowiska.typy[t].zawody.includes(zawod));
function wolneStanowiska(v, kat, zawod) {
  const typy = typyZawodu(kat, zawod);
  return v.stan.stanowiska.filter((s) => typy.includes(s.typ) && !s.pracownik);
}
function wyborMiejsca(v, kat, zawod) {
  const wolne = wolneStanowiska(v, kat, zawod), T = kat.oferty.stanowiska.typy;
  if (!wolne.length) return `<div class="komunikat zly">Nie masz wolnego stanowiska dla zawodu „${esc(zawod)}”. Uruchom nowe w zakładce
    Wnętrze ▸ Stanowiska i sprzęt albo zwolnij miejsce.</div><input type="hidden" id="z-miejsce" value="">`;
  const opcja = (s) => `<option value="${s.typ}:${s.nr}">${esc(T[s.typ].nazwa)} nr ${s.nr}</option>`;
  const lokale = [...new Set(wolne.map((s) => s.lokal))];
  const opcje = v.lokale && lokale.length > 1
    ? lokale.map((l) => `<optgroup label="${esc(nazwaLokalu(v, l))}">${wolne.filter((s) => s.lokal === l).map(opcja).join("")}</optgroup>`).join("")
    : wolne.map(opcja).join("");
  return `<label class="pole">Lokal i stanowisko${v.lokale && lokale.length === 1 ? ` (${esc(nazwaLokalu(v, lokale[0]))})` : ""}
    <select id="z-miejsce">${opcje}</select></label>`;
}

function oknoZatrudnienia({ v, kat }, id, typ, nr) {
  const k = v.kandydaci.find((x) => x.id === id);
  okno(`Zatrudnienie: ${esc(k.imie_nazwisko)}`, `<p>${esc(k.zawod)} ${gw(k.gwiazdki)} · preferowane wynagrodzenie <b>${zl(k.pensja_preferowana)}</b>
      · ${v.agencja ? "bazowy " : ""}koszt rekrutacji ${zl(k.koszt_rekrutacji)}</p>
    <div class="dwie"><label class="pole">Wynagrodzenie brutto (miesięcznie)
      <input type="number" id="z-pensja" min="${minimum(kat, "prace", k.student)}" step="10" value="${oczekiwana(kat, k, "prace")}"
        data-zmiana="pensja-oferty" data-k="${esc(id)}"></label>
    <label class="pole">Forma zatrudnienia<select id="z-umowa" data-zmiana="forma-zatrudnienia" data-k="${esc(id)}" data-pensja="z-pensja"
      data-opis="z-opis-formy">${opcjeForm(v, kat, k, "prace")}</select></label></div>
    <p class="podpowiedz" id="z-opis-formy">${opisFormy(kat, "prace", k, { kandydat: true })}</p>
    <p class="komunikat zly" id="z-ostrzezenie-oferty" hidden></p>${typ ? "" : wyborMiejsca(v, kat, k.zawod)}${kanalyRekrutacji(v, k)}
    <p class="podpowiedz">Pensja wyższa od oczekiwanej i umowa o pracę podnoszą zadowolenie pracowników.</p>`,
    { srednie: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Anuluj</button>
      <button class="btn pom" data-akcja="potwierdz-zatrudnienie" data-k="${esc(id)}"${typ ? ` data-t="${typ}" data-n="${nr}"` : ""}>Potwierdź</button>` });
}

// sprawa 21 (nowy wygląd): kandydaci w kolumnach według zawodu, zwarte wiersze; pierwsze N widać, reszta pod „Pokaż więcej”
const WIDOCZNYCH_KANDYDATOW = 15;
function kolumnyKandydatow(v, kat, lista, edycja) {
  if (!lista.length) return `<p class="podpowiedz">Na rynku nie ma teraz kandydatów.</p>`;
  const zawody = [...new Set(lista.map((k) => k.zawod))];
  const wiersz = (k) => `<div class="oferta-wiersz kandydat"><div><b>${esc(k.imie_nazwisko)}</b> ${gw(k.gwiazdki)}${pigulkaStudenta(k, kat)}
      ${zajety(v, k.id) ? pigulkaZajety(zajety(v, k.id)) : pigulkaOfert(v, "kandydaci", k.id)}${opisOsoby(k)}
      <span class="podpowiedz zostaw" title="Zadowolenie klientów · ryzyko reklamacji · bazowy koszt rekrutacji">zadowolenie ${proc(k.zadowolenie_klientow, 0)} · reklamacje ${proc(k.ryzyko_reklamacji, 0)}
        · rekrutacja ${zl(k.koszt_rekrutacji)}</span></div>
    <b class="cena" title="Preferowane wynagrodzenie (miesięcznie)">${zl(k.pensja_preferowana)}</b>${przyciskZatrudnij(v, k, edycja)}</div>`;
  return `<div class="banki-siatka">${zawody.map((z, i) => {
    const osoby = lista.filter((k) => k.zawod === z);
    const widac = osoby.slice(0, WIDOCZNYCH_KANDYDATOW), reszta = osoby.slice(WIDOCZNYCH_KANDYDATOW);
    return kartaMarki({ kolor: KOLORY[(i * 3 + 1) % KOLORY.length], nazwa: z, rodzaj: `${osoby.length} na rynku`,
      suma: `<span class="podpowiedz">kwota = preferowana pensja</span>`,
      tresc: `<div class="oferty-wiersze">${widac.map(wiersz).join("")}</div>${reszta.length
        ? `<details class="opis-marki"><summary>Pokaż więcej (${reszta.length})</summary><div class="oferty-wiersze">${reszta.map(wiersz).join("")}</div></details>` : ""}` });
  }).join("")}</div>`;
}

// UF20: kandydaci w Rynku pracy – zatrudnienie od razu z lokalem i stanowiskiem; niżej zatrudnienia czekające w tej rundzie
export function kandydaciRynku({ v, kat, edycja }) {
  const typy = kat.oferty.stanowiska.typy;
  const czekaja = v.stan.pracownicy.filter((p) => p.od_rundy === v.runda && (v.decyzje.zatrudnij || []).some((z) => z.kandydat === p.id));
  const gdzie = (p) => {
    const s = v.stan.stanowiska.find((x) => x.pracownik === p.id);
    return s ? `${v.lokale ? `${esc(nazwaLokalu(v, s.lokal))} · ` : ""}${esc(typy[s.typ]?.nazwa ?? s.typ)} nr ${s.nr}` : "–";
  };
  const lista = [...v.kandydaci].sort((a, b) => a.zawod.localeCompare(b.zawod) || b.zadowolenie_klientow - a.zadowolenie_klientow);
  const listaHtml = kolumnyKandydatow(v, kat, lista, edycja);
  return listaHtml
    + `<p class="podpowiedz">Przy zatrudnieniu wybierasz lokal i wolne stanowisko (${TYPY.map((t) => `${esc(typy[t].kto)}: ${typy[t].zawody.map(esc).join(", ")}`).join(" · ")}).
      Obsadę zmienisz potem w zakładce <a data-zakladka-k="lokal_przeglad">Mój lokal</a>.</p>`
    + (czekaja.length ? tabela("Zatrudnienia w tej rundzie", ["Osoba", "Zawód", "Lokal i stanowisko", "Pensja", "Umowa", ""],
      czekaja.map((p) => [esc(p.imie_nazwisko) + pigulkaStudenta(p, kat), `${esc(p.zawod)} ${gw(p.gwiazdki)}`, gdzie(p), zl2(p.pensja), nazwaFormy(kat, p.umowa),
        `<button class="btn jasny maly" data-akcja="profil" data-id="${esc(p.id)}" ${edycja ? "" : "disabled"}>Zmień</button>
         <button class="btn czarny maly" data-akcja="zwolnij" data-id="${esc(p.id)}" data-nowy="1" ${edycja ? "" : "disabled"}>Anuluj</button>`]),
      { klasy: ["l", "l", "l"] }) : "");
}

// UF20: szansa zgody na przejście – jak silnik/ludzie/przenosiny.py: szansa (parametry i odległości z v.agencja.przenosiny)
function szansaPrzejscia(v, p, z, doLokalu, dodatek) {
  const P = v.agencja?.przenosiny, u = P?.zasady;
  if (!u) return 1;
  const zad = p.zadowolenie ?? P.prog, odl = P.odleglosci?.[z]?.[doLokalu] ?? 0;
  const x = u.baza + u.za_zadowolenie * (zad - P.prog) - u.kara_za_pole * odl
    + u.za_dodatek * (p.pensja > 0 ? Math.min(1, Math.max(0, dodatek) / p.pensja) : 0);
  return Math.min(u.szansa_maks, Math.max(u.szansa_min, x));
}
// stanowisko osoby przed decyzjami (z niego liczy się przejście) i stanowisko docelowe
const stanowiskoPrzed = (v, id) => (v.stan_przed || v.stan).stanowiska.find((s) => s.pracownik === id);
const stanowiskoNr = (v, typ, nr) => v.stan.stanowiska.find((s) => s.typ === typ && s.nr === nr);
function przenosinyMiedzyLokalami(v, x) {
  const skad = stanowiskoPrzed(v, x.pracownik), cel = stanowiskoNr(v, x.typ, x.nr);
  return !!(skad && cel && skad.lokal !== cel.lokal);
}
function zapiszPrzenosiny(c, x) {
  zamknijOkno();
  return c.zmien((d) => {
    d.przenosiny = [...(d.przenosiny || []).filter((y) => y.pracownik !== x.pracownik && !(y.typ === x.typ && y.nr === x.nr)), x];
  });
}

function oknoPrzypisania({ v, kat }, typ, nr) {
  const cel = stanowiskoNr(v, typ, nr), T = kat.oferty.stanowiska.typy;
  const osoby = v.stan.pracownicy.filter((p) => p.od_rundy !== v.runda && typyZawodu(kat, p.zawod).includes(typ));
  const w = osoby.map((p) => {
    const teraz = v.stan.stanowiska.find((s) => s.pracownik === p.id), skad = stanowiskoPrzed(v, p.id) || teraz;
    const inny = !!(skad && cel && skad.lokal !== cel.lokal);
    const przycisk = inny && p.odchodzi ? `<span class="podpowiedz">w okresie wypowiedzenia</span>`
      : `<button class="btn pom maly" data-akcja="wybierz-osobe" data-id="${esc(p.id)}" data-t="${typ}" data-n="${nr}" data-inny="${inny ? 1 : 0}">Przypisz</button>`;
    return [esc(p.imie_nazwisko) + opisOsoby(p), `${esc(p.zawod)} ${gw(p.gwiazdki)}`,
      teraz ? `${v.lokale ? `${esc(nazwaLokalu(v, teraz.lokal))} · ` : ""}${esc(T[teraz.typ]?.nazwa ?? teraz.typ)} nr ${teraz.nr}` : `<span class="minus">bez stanowiska</span>`,
      zadowolenieOsoby(p), inny ? `ok. ${proc(szansaPrzejscia(v, p, skad?.lokal, cel?.lokal, 0), 0)} bez dodatku` : "od razu", przycisk];
  });
  okno(`Obsada: ${esc(T[typ]?.nazwa ?? typ)} nr ${nr}${cel?.lokal && v.lokale ? ` – ${esc(nazwaLokalu(v, cel.lokal))}` : ""}`,
    (w.length ? tabela(null, ["Osoba", "Zawód", "Pracuje teraz", "Zadowolenie", "Zgoda", ""], w, { klasy: ["l", "l", "l"] })
      : `<div class="komunikat">Nie masz jeszcze nikogo do tej pracy. Zatrudnij kogoś w
        <a data-zakladka-k="rynek_pracy">Ludzie ▸ Rynek pracy</a>.</div>`)
    + `<p class="podpowiedz">Osoba z tego lokalu zmieni stanowisko od razu. Osoba z innego lokalu musi się zgodzić: chętniej, gdy jest zadowolona,
      lokale są blisko na mapie i dostanie jednorazowy dodatek. Odpowiedź poznasz po przeliczeniu rundy (Rynek pracy ▸ wyniki).
      Nowa osoba: <a data-zakladka-k="rynek_pracy">Rynek pracy</a>.</p>`, { srednie: true });
}

function oknoPrzenosin({ v }, id, typ, nr) {
  const p = v.stan.pracownicy.find((x) => x.id === id), skad = stanowiskoPrzed(v, id), cel = stanowiskoNr(v, typ, nr);
  const odl = v.agencja?.przenosiny?.odleglosci?.[skad?.lokal]?.[cel?.lokal];
  const progi = [0, 0.25, 0.5, 1].map((u) => Math.round(p.pensja * u / 10) * 10);
  okno(`Przeniesienie: ${esc(p.imie_nazwisko)}`, `<p>Z lokalu <b>${esc(nazwaLokalu(v, skad?.lokal))}</b> do <b>${esc(nazwaLokalu(v, cel?.lokal))}</b>
      (stanowisko nr ${nr})${odl != null ? ` · odległość na mapie ok. ${licz(odl, 1)} pola` : ""} · zadowolenie ${zadowolenieOsoby(p)}</p>
    ${tabela("Szansa zgody", ["Dodatek", "Szansa"], progi.map((x) => [zl2(x), proc(szansaPrzejscia(v, p, skad?.lokal, cel?.lokal, x), 0)]), {})}
    <label class="pole">Jednorazowy dodatek za przejście (zł, płacisz tylko po zgodzie)
      <input type="number" id="pz-dodatek" min="0" step="50" value="0"></label>
    <p class="podpowiedz">Jeśli pracownik się nie zgodzi, zostaje na swoim stanowisku. Wolne miejsce po nim możesz od razu obsadzić kimś innym.</p>`,
  { srednie: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Anuluj</button>
      <button class="btn pom" data-akcja="potwierdz-przenosiny" data-id="${esc(id)}" data-t="${typ}" data-n="${nr}">Zaproponuj</button>` });
}

function oknoProfilu({ v, kat, edycja }, id) {
  const p = v.stan.pracownicy.find((x) => x.id === id);
  const nowy = p.od_rundy === v.runda;
  const pole = (etykieta, html) => `<label class="pole">${etykieta}${html}</label>`;
  okno("Profil pracownika", `<div class="dwie"><div class="srodek"><div class="awatar">${inicjaly(p.imie_nazwisko)}</div>${gw(p.gwiazdki)}
      <h3 style="margin:6px 0">${esc(p.imie_nazwisko)}</h3><div class="podpowiedz">${esc(p.zawod)}</div>
      ${p.charakter ? `<div class="podpowiedz" style="margin-top:6px"><b>Charakter: ${esc(p.charakter.nazwa)}</b><br>Wpływ: ${esc(p.charakter.skutek)}.</div>` : ""}
      <div style="margin-top:14px;text-align:left">
      <div class="wiersz"><span>Preferowane wynagrodzenie</span><span>${zl(p.pensja_preferowana)}</span></div>
      <div class="wiersz"><span>Koszty rekrutacji</span><span>${zl(p.koszt_rekrutacji)}</span></div>
      <div class="wiersz"><span>Koszt odprawy</span><span>${zl(p.koszt_odprawy)}</span></div>
      <div class="wiersz"><span>Zatrudniony od</span><span>runda ${p.od_rundy}</span></div>
      <div class="wiersz"><span>Ryzyko reklamacji</span><span>${proc(p.ryzyko_reklamacji, 0)}</span></div>
      <div class="wiersz"><span>Zadowolenie klientów</span><span>${proc(p.zadowolenie_klientow, 0)}</span></div>
      <div class="wiersz"><span>Zadowolenie z pracy (ostatni tydzień)</span><span>${zadowolenieOsoby(p)}</span></div></div>
      ${p.niezadowolony && !p.odchodzi ? `<p class="minus" style="text-align:left">Niezadowolony od ${p.niezadowolony} tyg. – szczegóły na liście błędów.
        Pomaga podwyżka, lepszy sprzęt albo odciążenie.</p>` : ""}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${pole("Aktualne wynagrodzenie brutto", `<input type="number" id="p-pensja" step="10" value="${p.pensja}" ${edycja && !forma(kat, p.umowa).staz ? "" : "disabled"}>`)}
      ${nowy ? "" : pole("Premia (jednorazowo w tej rundzie)", `<input type="number" id="p-premia" step="50" value="${p.premia || 0}" ${edycja ? "" : "disabled"}>`)}
      ${pole("Forma zatrudnienia", `<select id="p-umowa" data-zmiana="forma-zatrudnienia" data-k="${esc(id)}" data-pensja="p-pensja" data-opis="p-opis-formy"
        ${edycja ? "" : "disabled"}>${opcjeForm(v, kat, p, p.umowa, { nowy })}</select>`)}
      <span class="podpowiedz" id="p-opis-formy">${opisFormy(kat, p.umowa, p)}${forma(kat, p.umowa).staz ? ` Staż do rundy ${p.od_rundy + forma(kat, p.umowa).staz.rund}.` : ""}</span>
      ${(v.decyzje.zwolnij || []).includes(id)
    ? `<button class="btn jasny" data-akcja="cofnij-zwolnienie" data-id="${esc(id)}" ${edycja ? "" : "disabled"}>Cofnij zwolnienie</button>
       <span class="podpowiedz">${forma(kat, p.umowa).wypowiedzenie ? `${nazwaFormy(kat, p.umowa)}: przez okres wypowiedzenia jeszcze pracuje i dostaje pensję.` : `${nazwaFormy(kat, p.umowa)}: odchodzi od razu.`}</span>`
    : p.odchodzi ? `<span class="minus">${p.odchodzi.powod === NIEZADOWOLENIE ? "Złożył(a) wypowiedzenie z niezadowolenia" : "W okresie wypowiedzenia"} – odchodzi w rundzie ${p.odchodzi.runda}.</span>`
      : `<button class="btn czarny" data-akcja="zwolnij" data-id="${esc(id)}" data-nowy="${nowy ? 1 : 0}" ${edycja ? "" : "disabled"}>${nowy ? "Anuluj zatrudnienie" : "Zwolnij"}</button>`}
    </div></div>`, { przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Anuluj</button>
      <button class="btn pom" data-akcja="zapisz-profil" data-id="${esc(id)}" data-nowy="${nowy ? 1 : 0}" ${edycja ? "" : "disabled"}>Zapisz</button>` });
}

// Poprawki 2 (sprawa 18): pasek zadowolenia w kafelku osoby – skala 0–1, kreska na progu odejść
// (zalozenia.yaml: pracownicy.odejscia.prog_zadowolenia, z api: v.agencja.przenosiny.prog)
// Poprawki 3 (sprawa 6): zadowolenie bywa > 1 – pasek (i kreska progu) przycięte do skali 0–1, liczba obok prawdziwa
const wSkali = (x) => `${(Math.max(0, Math.min(1, +x || 0)) * 100).toFixed(1)}%`;
function paskZadowolenia(v, p) {
  if (p.zadowolenie == null) return `<div class="wiersz"><span>Zadowolenie</span><span>–</span></div>`;
  const prog = v.agencja?.przenosiny?.prog, ponad = p.zadowolenie > 1;
  const nisko = prog != null ? p.zadowolenie < prog : !!p.niezadowolony;
  return `<div class="wiersz"><span>Zadowolenie</span><span class="${nisko ? "minus" : ""}">${licz(p.zadowolenie, 2)}</span></div>
    <div class="pasek-zadowolenia${nisko ? " nisko" : ""}${ponad ? " ponad" : ""}" title="Zadowolenie z pracy w ostatnim tygodniu (skala paska 0–1${ponad
      ? `, a ${licz(p.zadowolenie, 2)} jest ponad skalą` : ""})${prog != null ? `; poniżej ${licz(prog, 2)} osoba może odejść` : ""}">
      <span style="width:${wSkali(p.zadowolenie)}"></span>${prog != null ? `<i style="left:${wSkali(prog)}"></i>` : ""}</div>`;
}

// gdzie pracuje osoba (lokal · stanowisko nr)
function miejsceOsoby(v, kat, s, bezLokalu = false) {
  return s ? `${v.lokale && !bezLokalu ? `${esc(nazwaLokalu(v, s.lokal))} · ` : ""}${esc(kat.oferty.stanowiska.typy[s.typ]?.kto ?? s.typ)} nr ${s.nr}` : "bez stanowiska";
}

// kafelek osoby w Zespole: imię, gwiazdki, zawód, charakter, pensja z formą, zadowolenie, stanowisko, Profil / Przenieś
// kalibracja B10: zadowolenie z poprzedniego tygodnia zmienia tempo pracy (kat.parametry.wydajnosc_z_zadowolenia)
function tempoOsoby(kat, p) {
  const u = kat.parametry?.wydajnosc_z_zadowolenia;
  if (!u || p.zadowolenie == null) return "";
  const t = p.zadowolenie > u.prog_gorny ? ["ok", `szybciej +${proc(u.premia, 0)}`, `zadowolenie powyżej ${licz(u.prog_gorny, 2)}`]
    : p.zadowolenie < u.prog_dolny ? ["nie", `wolniej −${proc(u.kara, 0)}`, `zadowolenie poniżej ${licz(u.prog_dolny, 2)}`] : null;
  return t ? `<div class="wiersz"><span>Tempo pracy</span><span class="pigulka ${t[0]}" title="${t[2]} – w tym tygodniu pracuje ${t[1].split(" ")[0]}">${t[1]}</span></div>` : "";
}

function kafelOsoby({ v, kat, edycja }, p, bezLokalu = false) {
  const s = v.stan.stanowiska.find((x) => x.pracownik === p.id), nowy = p.od_rundy === v.runda;
  const prz = (v.decyzje.przenosiny || []).find((x) => x.pracownik === p.id);
  const stanOsoby = p.odchodzi ? `<span class="pigulka${p.odchodzi.powod === NIEZADOWOLENIE ? " nie" : ""}">odchodzi w r. ${p.odchodzi.runda}</span>`
    : nowy ? `<span class="pigulka inf">nowy</span>` : p.niezadowolony ? `<span class="pigulka nie">niezadowolony</span>` : "";
  const ruch = prz ? `<span class="pigulka inf">${przenosinyMiedzyLokalami(v, prz) ? "czeka na zgodę" : "przeniesiony"}</span>` : "";
  const przenies = prz
    ? `<button class="btn jasny maly" data-akcja="cofnij-przenosiny" data-id="${esc(p.id)}" ${edycja ? "" : "disabled"}>Cofnij przeniesienie</button>`
    : `<button class="btn jasny maly" data-akcja="przenies" data-id="${esc(p.id)}" ${edycja && !nowy ? "" : "disabled"}${nowy
      ? ` title="Nowa osoba zaczyna na stanowisku wybranym przy zatrudnieniu – przeniesiesz ją od następnej rundy"` : ""}>Przenieś</button>`;
  return `<div class="kafel kafel-osoby"><div class="kg">${miejsceOsoby(v, kat, s, bezLokalu)} ${stanOsoby}${ruch}</div>
    <div class="kt">
      <div class="osoba-glowa"><div class="awatar">${inicjaly(p.imie_nazwisko)}</div>
        <div><b>${esc(p.imie_nazwisko)}</b>${pigulkaStudenta(p, kat)}<br>${gw(p.gwiazdki)}<br>
        <span class="podpowiedz">${esc(p.zawod)}</span>${opisOsoby(p)}</div></div>
      ${p.odchodzi ? "" : pigulkaPodkupienia(v, p)}
      <div class="wiersz"><span>Pensja (mies.)</span><span>${zl(p.pensja)}</span></div>
      <div class="wiersz"><span>Forma</span><span>${nazwaFormy(kat, p.umowa)}</span></div>
      ${p.premia ? `<div class="wiersz"><span>Premia</span><span>${zl(p.premia)}</span></div>` : ""}
      ${paskZadowolenia(v, p)}${tempoOsoby(kat, p)}
    </div>
    <div class="kd przyciski-osoby"><button class="btn pom maly" data-akcja="profil" data-id="${esc(p.id)}">Profil</button>${przenies}</div></div>`;
}

// Przenieś: wolne stanowiska typu osoby we wszystkich lokalach (w tym lokalu od razu, z innego – za zgodą; jak oknoPrzypisania)
function oknoPrzeniesienia({ v, kat }, id) {
  const p = v.stan.pracownicy.find((x) => x.id === id), T = kat.oferty.stanowiska.typy;
  const teraz = v.stan.stanowiska.find((s) => s.pracownik === id), skad = stanowiskoPrzed(v, id) || teraz;
  const typy = typyZawodu(kat, p.zawod);   // właściciel sam zwalnia stanowisko, gdy przyjdzie pracownik
  const wolne = v.stan.stanowiska.filter((s) => typy.includes(s.typ) && !s.pracownik);
  const w = wolne.map((s) => {
    const inny = !!(skad && skad.lokal !== s.lokal);
    const przycisk = inny && p.odchodzi ? `<span class="podpowiedz">w okresie wypowiedzenia</span>`
      : `<button class="btn pom maly" data-akcja="wybierz-osobe" data-id="${esc(id)}" data-t="${s.typ}" data-n="${s.nr}" data-inny="${inny ? 1 : 0}">Tutaj</button>`;
    return [miejsceOsoby(v, kat, s), inny ? `ok. ${proc(szansaPrzejscia(v, p, skad?.lokal, s.lokal, 0), 0)} bez dodatku` : "od razu", przycisk];
  });
  okno(`Przenieś: ${esc(p.imie_nazwisko)}`, `<p>Pracuje teraz: <b>${miejsceOsoby(v, kat, teraz)}</b> · zadowolenie ${zadowolenieOsoby(p)}</p>`
    + (w.length ? tabela(null, ["Wolne stanowisko", "Zgoda", ""], w, { klasy: ["l", "l"] })
      : `<div class="komunikat">Nie ma wolnego stanowiska typu ${typy.map((t) => esc(T[t]?.nazwa ?? t)).join(" / ")}. Uruchom nowe w zakładce
        <a data-zakladka-k="stanowiska">Wnętrze ▸ Stanowiska i sprzęt</a>.</div>`)
    + `<p class="podpowiedz">W tym samym lokalu osoba zmienia stanowisko od razu. Do innego lokalu musi się zgodzić – chętniej, gdy jest zadowolona,
      lokale są blisko i dostanie dodatek za przejście (odpowiedź po przeliczeniu rundy).</p>`, { srednie: true });
}

// Poprawki 2 (sprawa 18), Poprawki 3 (sprawa 10): czas pracy osób – przepracowane / dostępne godziny (silnik/runda._czas_pracy),
// wspólny wykres obciążenia (obciazenie.js) z progami z danych (v.progi_czasu_pracy)
function wskaznikiCzasu({ v, kat }) {
  const T = kat.oferty.stanowiska.typy, miejsce = (s) => s ? `${T[s.typ]?.kto || s.typ} nr ${s.nr}` : "bez stanowiska";
  const P = (v.wyniki?.pracownicy || []).filter((p) => p.godziny_dostepne != null).map((p) => {
    const s = v.stan.stanowiska.find((x) => x.pracownik === p.id);
    return { nazwa: p.imie_nazwisko, podpis: `${p.zawod} · ${miejsce(s)}`, lokal: s?.lokal, x: p.obciazenie || 0, h: p.godziny_pracy, hMax: p.godziny_dostepne,
      dni: p.obciazenie_dni };
  });
  const wl = v.wyniki?.wlasciciel_stanowisko;
  if (wl?.przyjete && wl.godziny_dostepne != null) {
    P.push({ nazwa: "Właściciel", podpis: miejsce(wl), lokal: v.stan.stanowiska.find((x) => x.typ === wl.typ && x.nr === wl.nr)?.lokal,
      x: wl.obciazenie || 0, h: wl.godziny_pracy, hMax: wl.godziny_dostepne, dni: wl.obciazenie_dni });
  }
  const lokale = [...new Set(P.map((p) => p.lokal).filter(Boolean))];   // kilka lokali – osoby pogrupowane po lokalu
  if (lokale.length > 1) {
    P.sort((a, b) => lokale.indexOf(a.lokal) - lokale.indexOf(b.lokal));
    P.forEach((p) => { p.grupa = p.lokal ? esc(nazwaLokalu(v, p.lokal)) : "Bez stanowiska"; });
  }
  const pr = v.progi_czasu_pracy || {}, kolejka = klienciZKolejki(v);
  const przypis = (kolejka ? `<p class="obc-kolejka">▲ Klienci, którzy nie doczekali się obsługi (kolejka): <b>${licz(kolejka)}</b> – w godzinach szczytu brakowało rąk albo sprzętu.</p>` : "")
    + `<p class="podpowiedz">Godziny obsługi klientów z godzin dostępnych (etat i forma zatrudnienia; kasa – ruch kas lokalu dzielony między kasjerów).
      Powyżej ${proc(pr.przepracowanie, 0)} spada zadowolenie pracownika.</p>`;
  const progi = { niski: pr.niski, wysoki: pr.przepracowanie };
  // Poprawki 4 (P6): ten sam zespół dzień po dniu – ponad 100% = tyle pracy zabrakło (stare zapisy bez danych – bez tabeli)
  const przypisDni = `<p class="podpowiedz zostaw">Procent = praca potrzebna na obsłużenie klientów danego dnia wobec godzin osoby.
    <b class="minus">Ponad 100%</b> – tyle pracy zabrakło: 130% to o 30% więcej klientów, niż osoba dała radę obsłużyć
    (reszta odeszła z kolejki). Kasa – ruch kas lokalu, u każdego kasjera tak samo.</p>`;
  return wykresObciazenia({ tytul: "Czas pracy w ostatniej rundzie", pozycje: P, progi, opisy: OPISY_LUDZI, przypis })
    + tabelaDni({ tytul: "Obciążenie w dni tygodnia", pozycje: P, dni: v.wyniki?.klienci?.dni, progi, przypis: przypisDni });
}

// Poprawki 3 (sprawa 3): Zespół – grupy (po lokalu kafel nie powtarza nazwy lokalu z nagłówka grupy) w zwijanych sekcjach (lokal / zawód / bez grup) i sortowanie w grupie.
// Wybór zapisany w localStorage (przetrwa przerysowanie i odświeżenie); zwinięcie grup pamięta wspolne.zwin.
const KLUCZ_ZESPOLU = "lukrum-zespol-widok";
const GRUPY_ZESPOLU = { lokal: "lokal", zawod: "zawód", brak: "bez grup" };
const SORT_ZESPOLU = { stanowisko: "stanowisko", nazwisko: "imię i nazwisko", gwiazdki: "doświadczenie (★ od najwyższego)",
  pensja: "pensja (od najwyższej)", zadowolenie: "zadowolenie (od najniższego)" };
function widokZespolu() {
  let w = {};
  try { w = JSON.parse(localStorage.getItem(KLUCZ_ZESPOLU) || "{}") || {}; } catch { /* prywatne okno – domyślny */ }
  return { grupy: GRUPY_ZESPOLU[w.grupy] ? w.grupy : "lokal", sort: SORT_ZESPOLU[w.sort] ? w.sort : "stanowisko" };
}
function zapiszWidokZespolu(w) {
  try { localStorage.setItem(KLUCZ_ZESPOLU, JSON.stringify(w)); } catch { /* bez zapisu */ }
}
// porządek stanowisk: lokale jak w grze, potem kuchnia, kasa i numer; bez stanowiska – na końcu
function kluczStanowiska(v, s) {
  if (!s) return [Infinity, 0, 0];
  const l = (v.stan.lokale || []).findIndex((x) => x.id === s.lokal);
  return [l < 0 ? 0 : l, TYPY.indexOf(s.typ), s.nr];
}
const porownajKlucze = (a, b) => a.reduce((r, x, i) => r || (x === b[i] ? 0 : x < b[i] ? -1 : 1), 0);
function sortujZespol(v, P, sort) {
  const st = new Map(P.map((p) => [p.id, kluczStanowiska(v, v.stan.stanowiska.find((s) => s.pracownik === p.id))]));
  const poStanowisku = (a, b) => porownajKlucze(st.get(a.id), st.get(b.id));
  const zad = (p) => p.zadowolenie ?? Infinity;   // bez pomiaru (nowa osoba) – na końcu
  const por = { stanowisko: () => 0, nazwisko: (a, b) => a.imie_nazwisko.localeCompare(b.imie_nazwisko, "pl"),
    gwiazdki: (a, b) => b.gwiazdki - a.gwiazdki, pensja: (a, b) => b.pensja - a.pensja, zadowolenie: (a, b) => zad(a) - zad(b) }[sort];
  return [...P].sort((a, b) => por(a, b) || poStanowisku(a, b));
}
function grupyZespolu(v, kat, P, grupy) {
  if (grupy === "zawod") return (kat.zawody || []).concat([...new Set(P.map((p) => p.zawod))].filter((z) => !(kat.zawody || []).includes(z)))
    .map((z) => ({ klucz: z, nazwa: z, osoby: P.filter((p) => p.zawod === z) })).filter((g) => g.osoby.length);
  const lokal = (p) => { const s = v.stan.stanowiska.find((x) => x.pracownik === p.id); return s ? s.lokal ?? "" : null; };   // null – bez stanowiska
  const lokale = (v.stan.lokale || []).map((l) => l.id);
  const klucze = [...lokale, ...new Set(P.map(lokal).filter((x) => x != null && !lokale.includes(x))), null];
  return klucze.map((k) => ({ klucz: k ?? "bez", nazwa: k == null ? "Bez stanowiska" : v.lokale && k ? nazwaLokalu(v, k) : "Twój lokal",
    osoby: P.filter((p) => lokal(p) === k) })).filter((g) => g.osoby.length);
}
function narzedziaZespolu(w) {
  const wybor = (k, opcje) => `<select data-zmiana="zespol-widok" data-k="${k}">${Object.entries(opcje).map(([x, n]) =>
    `<option value="${x}" ${w[k] === x ? "selected" : ""}>${n}</option>`).join("")}</select>`;
  return `<div class="zespol-narzedzia"><label>Grupuj: ${wybor("grupy", GRUPY_ZESPOLU)}</label><label>Sortuj: ${wybor("sort", SORT_ZESPOLU)}</label></div>`;
}

// UF15: Ludzie → Zespół – wszyscy pracownicy firmy; Poprawki 2 (sprawa 18): kafelki osób, w wynikach wskaźniki czasu pracy
export const zespol = {
  tytul: "Zespół", tytulPelny: "Ludzie – zespół", ikona: "zatrudnienie", odblokowanie: "hr_zatrudnienie",
  info: "Wszyscy Twoi pracownicy: gdzie pracują, na jakiej umowie, za ile i czy są zadowoleni. Profil – pensja, premia, forma albo zwolnienie; Przenieś – inne wolne stanowisko.",
  decyzje(c) {
    const { v, kat } = c, P = v.stan.pracownicy;
    if (!P.length) return `<div class="komunikat">Nie masz jeszcze pracowników – znajdź ich w zakładce <a data-zakladka-k="rynek_pracy">Rynek pracy</a>.</div>`;
    const w = widokZespolu(), siatka = (L) => `<div class="siatka zespol">${sortujZespol(v, L, w.sort).map((p) => kafelOsoby(c, p, w.grupy === "lokal")).join("")}</div>`;
    const tresc = w.grupy === "brak" ? siatka(P) : grupyZespolu(v, kat, P, w.grupy).map((g) => {
      const pensje = g.osoby.reduce((a, p) => a + p.pensja, 0), nzad = g.osoby.filter((p) => p.niezadowolony).length;
      const tytul = `${esc(g.nazwa)} <span class="kategoria-nazwy">pensje razem ${zl(pensje)} / mies.</span>${nzad
        ? ` <span class="pigulka nie">niezadowoleni: ${licz(nzad)}</span>` : ""} <span class="kategoria-suma">${osob(g.osoby.length)}</span>`;
      return zwin(tytul, siatka(g.osoby), { otwarte: true, klucz: `zespol:${w.grupy}:${g.klucz}` });
    }).join("");
    return `<div class="pasek ciemny"><span>Pracownicy: <span class="kwota">${licz(P.length)}</span></span>
      <span>Koszty wynagrodzeń: <span class="kwota">${zl(kosztWynagrodzen(v, kat))}</span>${naOkres()} (z ZUS pracodawcy)</span></div>
      ${narzedziaZespolu(w)}<div class="zespol-grupy">${tresc}</div>`;
  },
  wyniki: (c) => wskaznikiCzasu(c) + zatrudnienie.wyniki(c),
  akcje: {
    przenies: (el, c) => oknoPrzeniesienia(c, el.dataset.id),
  },
  zmiany: {
    "zespol-widok": (el, c) => { zapiszWidokZespolu({ ...widokZespolu(), [el.dataset.k]: el.value }); c.rysuj(); },
  },
};

export const udogodnienia = {
  tytul: "Udogodnienia", tytulPelny: "HR - udogodnienia", ikona: "♨", odblokowanie: "hr_udogodnienia",
  info: "Kup udogodnienia dla pracowników Twojej firmy. Podnoszą zadowolenie pracowników.",
  decyzje(c) { return wyborLokaluKrotki(c.v) + kafleUdogodnien(c, "udogodnienia", "pracowników"); },
  wyniki({ v }) {
    const w = Object.entries(v.rynek?.udogodnienia || {}).map(([f, n]) => [esc(nazwaFirmy(v, f)), licz(n)]);
    const moje = v.rynek?.udogodnienia?.[v.firma];
    return podsumowanie(moje ? `Twoja firma ma <b>${licz(moje)}</b> ${moje === 1 ? "udogodnienie" : "udogodnień"} dla pracowników.` : "Twoja firma nie ma jeszcze udogodnień dla pracowników.", moje ? "ok" : "")
      + zwinTabela("Posiadane udogodnienia", ["Firma", "Liczba udogodnień"], w, { klasy: ["l"], otwarte: true });
  },
  akcje: {},
};

// kalibracja B9: szkolenie kosztuje raz cenę z cennika i działa kat.parametry.szkolenia_rund rund (0 – dawniej: cena na rundę,
// działa w rundzie zakupu); trwającego szkolenia nie kupuje się drugi raz (silnik/ludzie/szkolenia.py)
const rundSzkolenia = (kat) => kat.parametry?.szkolenia_rund || 0;
const cenaSzkolenia = (kat, cena) => rundSzkolenia(kat) ? cena : naRunde(cena);
const rundy = (n) => `${licz(n)} ${n === 1 ? "rundę" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "rundy" : "rund"}`;
const trwajaceSzkolenia = (v) => (v.stan_przed?.szkolenia || []).filter((x) => x.do_rundy >= v.runda);

// poprawki 3 (sprawa 8): 8 szkoleń (podobne połączone); pozycja katalogu ma `dawne` – nazwy szkoleń, z których powstała
// (stare zapisy: decyzja albo trwające szkolenie pod dawną nazwą odnosi się do nowej pozycji – silnik/ludzie/szkolenia.py)
const toSamoSzkolenie = (p, nazwa) => nazwa === p.nazwa || (p.dawne || []).includes(nazwa);

// sprawa 8 (poprawki 3): wszystkie szkolenia w jednej karcie; w wierszu szkolenia trzy pigułki firm z ceną (wybrana podświetlona)
function kartaSzkolen(s, wyb, edycja, kat, trwa) {
  const wiersze = s.pozycje.map((p) => {
    const ceny = s.firmy.map((f, i) => cenaSzkolenia(kat, p.ceny[i])), min = Math.min(...ceny);
    const wybrana = wyb.find((x) => toSamoSzkolenie(p, x.szkolenie)), t = trwa.find((x) => toSamoSzkolenie(p, x.szkolenie));
    const pigulki = s.firmy.map((f, i) => {
      const jest = !t && wybrana?.firma === f.nazwa;
      const tytul = `${f.nazwa}: ${zl(ceny[i])}${ceny[i] === min ? " – najtaniej" : ""} (${f.zadowoleni_klienci}% zadowolonych klientów)`
        + (t ? ` – szkolenie jeszcze trwa, ponownie od rundy ${t.do_rundy + 1}` : jest ? " – kliknij, żeby zrezygnować" : "");
      return `<button class="firma-szkolenia${jest ? " wybrana" : ""}${ceny[i] === min ? " najtaniej" : ""}" data-akcja="szkolenie" data-s="${esc(p.nazwa)}"
        data-f="${esc(f.nazwa)}" title="${esc(tytul)}" ${edycja && !t ? "" : "disabled"}>${jest ? "✓ " : ""}${esc(f.nazwa)} <b>${zl(ceny[i])}</b></button>`;
    }).join("");
    return `<div class="szkolenie-wiersz${t ? " trwa" : wybrana ? " wybrany" : ""}"><div class="szkolenie-nazwa"><b>${esc(p.nazwa)}</b>
      <span class="pigulka">czeka ${p.procent}%</span>${t ? ` <span class="pigulka ok">działa do rundy ${t.do_rundy}</span>` : ""}</div>
      <div class="firmy-szkolen">${pigulki}</div></div>`;
  }).join("");
  const ile = s.pozycje.filter((p) => wyb.some((x) => toSamoSzkolenie(p, x.szkolenie)) && !trwa.some((x) => toSamoSzkolenie(p, x.szkolenie))).length;
  const opis = `Firmy: ${s.firmy.map((f) => `${esc(f.nazwa)} (${f.zadowoleni_klienci}% zadowolonych klientów)`).join(", ")}.
    Kliknięcie firmy przy szkoleniu wybiera je (najtańsza oferta ma zieloną cenę), drugie kliknięcie – rezygnacja.`;
  return kartaMarki({ kolor: KOLORY[2], nazwa: "Szkolenia dla zespołu", rodzaj: `${licz(s.pozycje.length)} szkoleń · ${licz(s.firmy.length)} firmy`,
    opis, suma: ile ? `wybrano: <b>${licz(ile)}</b>` : "", znak: "✎", tresc: `<div class="szkolenia-lista">${wiersze}</div>` });
}

export const szkolenia = {
  tytul: "Szkolenia", tytulPelny: "HR - szkolenia", ikona: "✎", odblokowanie: "hr_szkolenia",
  info: (c) => rundSzkolenia(c.kat)
    ? `Zapewnij swoim pracownikom możliwości rozwoju i zaoferuj im udział w szkoleniach (szkolenie obejmuje wszystkich pracowników). Płacisz raz cenę z cennika, a szkolenie działa przez ${rundy(rundSzkolenia(c.kat))} od rundy zakupu – trwającego szkolenia nie kupisz drugi raz.`
    : `Zapewnij swoim pracownikom możliwości rozwoju i zaoferuj im udział w szkoleniach (szkolenie obejmuje wszystkich pracowników, działa w tym ${OKRES.miejscownik}).`,
  decyzje({ v, kat, edycja }) {
    const s = kat.oferty.szkolenia, wyb = v.decyzje.szkolenia || [], n = rundSzkolenia(kat), trwa = trwajaceSzkolenia(v);
    const koszt = s.pozycje.reduce((a, p) => {   // sprawa 8: także decyzje pod dawną nazwą; jedno połączone szkolenie – raz
      const x = wyb.find((y) => toSamoSzkolenie(p, y.szkolenie)), i = x ? s.firmy.findIndex((f) => f.nazwa === x.firma) : -1;
      return a + (i >= 0 && !trwa.some((t) => toSamoSzkolenie(p, t.szkolenie)) ? cenaSzkolenia(kat, p.ceny[i]) : 0);
    }, 0);
    const doRundy = n ? ` Kupione teraz działa do rundy ${v.runda + n - 1}.` : "";
    const pasek = `<div class="pasek ciemny"><span>Koszt zakupu: <span class="kwota">${zl(koszt)}</span>${n ? " (jednorazowo)" : naOkres()}</span></div>`;
    const dopisek = n ? `<p class="podpowiedz">Cena z cennika płacona raz; szkolenie działa przez ${rundy(n)}.${doRundy}</p>` : "";
    return pasek + kartaSzkolen(s, wyb, edycja, kat, trwa) + dopisek;
  },
  wyniki({ v }) {
    const l = v.wyniki?.szkolenia || [], k = v.wyniki?.karta, akt = v.wyniki?.szkolenia_aktywne || [];
    const w = l.map((x) => [esc(x.szkolenie), esc(x.firma), `${x.procent}%`, zl2(x.koszt)]);
    const razem = l.reduce((a, x) => a + x.koszt, 0), pr = l.reduce((a, x) => a + x.procent, 0);
    const lead = podsumowanie(w.length ? `Szkolenia kupione w tej rundzie: <b>${licz(w.length)}</b>, koszt <b>${zl(razem)}</b>.`
      : akt.length ? `W tej rundzie działały szkolenia kupione wcześniej (${licz(akt.length)}).` : "W tej rundzie nie było szkoleń.");
    return lead + (w.length ? zwinTabela("Szkolenia kupione w tej rundzie", ["Szkolenie", "Firma szkoleniowa", "% pracowników oczekujących", "Koszt"],
      [...w, ["<b>Razem</b>", "", `<b>${pr}%</b>`, `<b>${zl2(razem)}</b>`]], { klasy: ["l", "l"], otwarte: true })
      : "")
      + (akt.length ? zwinTabela("Szkolenia działające w tej rundzie", ["Szkolenie", "Firma szkoleniowa", "% pracowników oczekujących", "Od rundy", "Działa do rundy"],
        akt.map((x) => [esc(x.szkolenie), esc(x.firma), `${x.procent}%`, licz(x.od_rundy), licz(x.do_rundy)]), { klasy: ["l", "l"], otwarte: true }) : "")
      + (k ? zwinTabela("Efekt", ["Zadowolenie pracowników (karta wyników)"], [[licz(k.zadowolenie_pracownikow, 3)]]) : "");
  },
  akcje: {
    szkolenie: (el, c) => c.zmien((d) => {
      const l = d.szkolenia || [], s = el.dataset.s, f = el.dataset.f;
      const p = c.kat.oferty.szkolenia.pozycje.find((q) => q.nazwa === s) || { nazwa: s };   // sprawa 8: z dawnymi nazwami
      const jest = l.some((x) => toSamoSzkolenie(p, x.szkolenie) && x.firma === f);
      const reszta = l.filter((x) => !toSamoSzkolenie(p, x.szkolenie));
      d.szkolenia = jest ? reszta : [...reszta, { firma: f, szkolenie: s }];
    }),
    "kup-udog": (el, c) => przelaczUdog(el, c), "sprzedaj-udog": (el, c) => przelaczUdog(el, c),
  },
};

export { wykres };
