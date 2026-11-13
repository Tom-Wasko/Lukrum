// Adres z wizytówki (silnik/pieniadze/kasyno.py): zakładka widoczna tylko w rundzie z zaproszeniem albo z wynikami gier.
// Decyzja `kasyno`: lista {gra, zaklad, stawka} – stawki z portfela właściciela, wynik dopiero po zamknięciu rundy.
// P12: przelew z firmy do portfela wprost z klubu – to zwykła decyzja `wyplata_wlasna` (silnik/pieniadze/wlasciciel.py), więc
// na koncie firmy widać tylko „wypłatę własną właściciela”; wypłata idzie przed zakładami, można ją od razu postawić.
import { esc, kafelkiLiczb, podsumowanie, tabela, toast, zl2, zwinTabela, zl } from "./wspolne.js";

const ZASADA_MILCZENIA = `<div class="karta"><h3>Zasada milczenia</h3><p>Nad barem wisi oprawiona w złotą ramkę
  tabliczka: „Pierwsza zasada Nocnej 13: księgowa nie musi wiedzieć wszystkiego. Druga zasada: mistrz gry tym bardziej”.
  Pan Waldemar poleruje kieliszek i dodaje półgłosem, że ostatni gość, który opowiadał o klubie na mieście, prowadzi
  teraz stoisko z watą cukrową na dworcu PKS – „bardzo uczciwa praca, tylko trochę klejąca”.</p>
  <p class="podpowiedz">Klub to tajemnica drużyny. Kto mówi o nim mistrzowi gry, ten sam rozumie, że kebab
  i hazard to dwa różne fartuchy.</p></div>`;

function przelewHtml(W, d, edycja) {
  if (!W) return "";
  const juz = d.wyplata_wlasna;
  return `<div class="karta"><h3>Bankomat w kącie</h3><p>Bankomat ma naklejkę „Prowizja: 0 zł. Wstyd: gratis”. Możesz
    przelać pieniądze z konta firmy do prywatnego portfela – w księgach firmy będzie to zwykła wypłata własna
    właściciela, bez słowa o tym, dokąd poszły.</p>
    ${juz ? `<p>W tej rundzie przelewasz z firmy do portfela <span class="kwota">${zl(juz)}</span>.</p>` : ""}
    ${edycja ? `<div class="przyciski"><label class="pole">Kwota<input type="number" id="ks-przelew" min="1" step="100"
      value="${juz || 500}"></label><button class="btn" data-akcja="ks-przelew">${juz ? "Zmień przelew" : "Przelej z firmy do portfela"}</button>
      ${juz ? `<button class="btn jasny" data-akcja="ks-przelew-usun">Anuluj przelew</button>` : ""}</div>
      <p class="podpowiedz">Na koncie firmy: ${zl2(W.gotowka_firmy)}. Wypłata przychodzi przed zakładami, więc można ją
      postawić jeszcze dziś. Ten sam przelew widać w zakładce Portfel właściciela.</p>` : ""}</div>`;
}

function zakladyHtml(Z, edycja, zwijane = false) {
  if (!Z?.zaklady?.length) return "";
  const wiersze = Z.zaklady.map((z, i) => [esc(z.nazwa), z.zaklad_nazwa ? esc(z.zaklad_nazwa) : "–", zl2(z.stawka),
    Z.ukryte ? `<span class="podpowiedz">wynik po zamknięciu rundy</span>`
      : `<span class="${z.wyplata ? "plus" : "minus"}">${zl2(z.wyplata)}</span>`,
    edycja ? `<button class="btn jasny" data-akcja="ks-usun" data-i="${i}">Wycofaj</button>` : ""]);
  return (zwijane ? zwinTabela : tabela)(Z.ukryte ? "Postawione zakłady" : "Zakłady", ["Gra", "Zakład", "Stawka", "Wypłata", ""], wiersze,
    { klasy: ["l", "l"], sortuj: false, stopka: ["Razem", "", zl2(Z.stawki), Z.ukryte ? "" : zl2(Z.wyplaty), ""], ...(zwijane ? { otwarte: true } : {}) });
}

function odrzuconeHtml(Z) {
  return (Z?.odrzucone || []).map((o) => `<p class="minus">${esc(o.co)}: ${esc(o.powod)}.</p>`).join("");
}

function grafHtml(id, g, L) {
  const stawka = `<label class="pole">Stawka<input type="number" id="ks-stawka-${esc(id)}" min="${L.min_stawka}" max="${L.maks_stawka}" step="10" value="${L.min_stawka * 5}"></label>`;
  const wybor = g.typ === "ruletka" ? `<label class="pole">Zakład<select id="ks-zaklad-${esc(id)}">${Object.entries(g.zaklady)
    .map(([k, z]) => `<option value="${esc(k)}">${esc(z.nazwa)} (×${String(z.mnoznik).replace(".", ",")})</option>`).join("")}</select></label>` : "";
  return `<div class="kafel"><div class="kg">${esc(g.nazwa)}</div><div class="kt"><p>${esc(g.opis)}</p>
    <div class="przyciski">${wybor}${stawka}<button class="btn" data-akcja="ks-postaw" data-g="${esc(id)}">${g.typ === "ruletka" ? "Postaw" : "Pociągnij za wajchę"}</button></div></div></div>`;
}

// UF2: hasło „koziol” wpisane z klawiatury (app.js) – zakładka widoczna w tej przeglądarce także bez zaproszenia
export const HASLO = "koziol";
const KLUCZ_HASLA = "lukrum-nocna13";
export const znaHaslo = () => { try { return localStorage.getItem(KLUCZ_HASLA) === "1"; } catch { return false; } };
export const zapamietajHaslo = () => { try { localStorage.setItem(KLUCZ_HASLA, "1"); } catch { /* bez pamięci */ } };
// nagroda za zajrzenie w surowe dane gry (pole rekopis_znaleziony_w_jsonie w widoku): hasło „saragossa” daje odznakę Szperacz
export const HASLO_SZPERACZ = "saragossa";
const KLUCZ_SZPERACZA = "lukrum-szperacz";
export const jestSzperaczem = () => { try { return localStorage.getItem(KLUCZ_SZPERACZA) === "1"; } catch { return false; } };
export const zapamietajSzperacza = () => { try { localStorage.setItem(KLUCZ_SZPERACZA, "1"); } catch { /* bez pamięci */ } };
const widoczna = (v) => !!v.kasyno && (!!v.kasyno.zaproszenie || znaHaslo() || !!v.wyniki?.kasyno?.gry || !!v.kasyno.decyzja);

export const kasyno = {
  tytul: "Nocna 13", tytulPelny: "ul. Nocna 13, wejście od podwórza", ikona: "klucz", odblokowanie: widoczna, ukryta: (v) => !widoczna(v),
  info: `Adres, który zna niewielu. Drzwi otwiera zaproszenie albo hasło. Gra się prywatnymi pieniędzmi
    z <a data-zakladka-k="wlasciciel">portfela właściciela</a> – firma nic o tym nie wie, chyba że wpłacisz do niej wygraną.`,
  decyzje({ v, d, edycja }) {
    const K = v.kasyno;
    if (!K) return `<p class="podpowiedz">Brak danych.</p>`;
    if (!K.otwarte) return `<div class="karta"><p>Pod adresem ${esc(K.adres)} drzwi są zamknięte. Na dzwonek nikt nie odpowiada,
      a kot z parteru patrzy na ciebie z wyższością. Wyniki ostatniej wizyty są w zakładce Wyniki.</p></div>`;
    const L = K.limity, D = K.decyzja, W = v.wlasciciel;
    const ile = (d.kasyno || []).length;
    return `<div class="karta"><p>${esc(K.zaproszenie || `Pukasz trzy razy. Wizjer się odsuwa, ktoś mierzy cię wzrokiem od butów po czubek głowy. Mówisz hasło. Wizjer się zasuwa, zgrzyta zamek i drzwi przy ${K.adres} się otwierają.`)}</p></div>
      <div class="karta"><h3>${esc(K.klub.nazwa)}</h3><p>${esc(K.klub.tekst)}</p></div>
      ${W ? `<div class="pasek ciemny"><span>W portfelu na początku rundy: <span class="kwota">${zl(W.portfel_przed)}</span></span>
        ${d.wyplata_wlasna ? `<span>Przelew z firmy: <span class="kwota">${zl(d.wyplata_wlasna)}</span></span>` : ""}
        ${D || d.wyplata_wlasna ? `<span>Po przelewie i stawkach: <span class="kwota">${zl(W.portfel_po)}</span></span>` : ""}</div>` : ""}`
      + ZASADA_MILCZENIA + przelewHtml(W, d, edycja)
      + zakladyHtml(D, edycja) + odrzuconeHtml(D)
      + (edycja && ile < L.maks ? Object.entries(K.gry).map(([id, g]) => grafHtml(id, g, L)).join("") : "")
      + `<p class="podpowiedz">Najwyżej ${L.maks} zakładów w rundzie, stawka od ${zl2(L.min_stawka)} do ${zl2(L.maks_stawka)}.
        Stawki schodzą z portfela właściciela, a pan Waldemar ogłasza wyniki dopiero po zamknięciu rundy. Wygraną możesz
        w następnej rundzie wpłacić do firmy – albo zostawić w portfelu na czarną godzinę.</p>`;
  },
  wyniki({ v }) {
    const Z = v.wyniki?.kasyno?.gry;
    if (!Z) return `<p class="podpowiedz">W poprzedniej rundzie nie było cię pod tym adresem.</p>`;
    const teksty = (Z.zaklady || []).map((z) => `<div class="kafel"><div class="kg">${esc(z.nazwa)}${z.zaklad_nazwa ? ` – ${esc(z.zaklad_nazwa)}` : ""}:
      ${zl2(z.stawka)}</div><div class="kt"><p>${esc(z.tekst)}</p></div></div>`).join("");
    const n = Z.zaklady?.length || 0;
    const lead = n && !Z.ukryte ? podsumowanie(`Postawiono ${n} ${n === 1 ? "zakład" : n < 5 ? "zakłady" : "zakładów"} na ${zl(Z.stawki)}, wypłacono ${zl(Z.wyplaty)}. ${Z.bilans < 0
      ? `Wieczór zamknął się stratą ${zl(-Z.bilans)}.` : Z.bilans > 0 ? `Wieczór zamknął się zyskiem ${zl(Z.bilans)}.` : "Wyszło na zero."}`, Z.bilans < 0 ? "uwaga" : "ok")
      : n ? podsumowanie(`Postawiono ${n} ${n === 1 ? "zakład" : n < 5 ? "zakłady" : "zakładów"} na ${zl(Z.stawki)}. Wyniki podamy po zamknięciu rundy.`)
        : podsumowanie("W tej rundzie nie postawiono żadnego zakładu.");
    const kafle = n && !Z.ukryte ? kafelkiLiczb([{ etykieta: "Stawki", wartosc: zl(Z.stawki) }, { etykieta: "Wypłaty", wartosc: zl(Z.wyplaty) },
      { etykieta: "Bilans", wartosc: zl(Z.bilans), ton: Z.bilans < 0 ? "minus" : Z.bilans > 0 ? "plus" : "" }]) : "";
    return lead + kafle + zakladyHtml(Z, false, true) + teksty + odrzuconeHtml(Z);
  },
  akcje: {
    "ks-postaw": async (el, c) => {
      const id = el.dataset.g, L = c.v.kasyno.limity;
      const stawka = +document.getElementById(`ks-stawka-${id}`).value;
      if (!(stawka >= L.min_stawka && stawka <= L.maks_stawka)) return toast(`Stawka od ${zl2(L.min_stawka)} do ${zl2(L.maks_stawka)}.`);
      const zaklad = document.getElementById(`ks-zaklad-${id}`)?.value ?? null;
      await c.zmien((d) => { d.kasyno = [...(d.kasyno || []), { gra: id, zaklad, stawka }]; });
    },
    "ks-przelew": async (el, c) => {
      const kwota = +document.getElementById("ks-przelew").value;
      if (!(kwota > 0)) return toast("Podaj kwotę przelewu.");
      await c.zmien((d) => { d.wyplata_wlasna = kwota; });
    },
    "ks-przelew-usun": (el, c) => c.zmien((d) => { delete d.wyplata_wlasna; }),
    "ks-usun": (el, c) => c.zmien((d) => {
      d.kasyno = (d.kasyno || []).filter((_, i) => i !== +el.dataset.i);
      if (!d.kasyno.length) delete d.kasyno;
    }),
  },
};
