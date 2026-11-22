// Wybór wyglądu gry. Ładowany w <head> (bez defer), żeby motyw był ustawiony przed pierwszym rysowaniem strony.
(function () {
  var MOTYWY = [
    ["bok", "Menu z boku"],
    ["klasyczny", "Menu u góry"],
  ];
  // domyślnie menu z boku; zapisany motyw spoza listy (np. dawny „stary”) wraca do domyślnego
  var DOMYSLNY = "bok";
  var KLUCZ = "lukrum-motyw";
  var znane = function (m) { return MOTYWY.some(function (x) { return x[0] === m; }); };
  var motyw = DOMYSLNY;
  try { motyw = localStorage.getItem(KLUCZ) || motyw; } catch (e) { /* prywatne okno – zostaje domyślny */ }
  var zAdresu = new URLSearchParams(location.search).get("motyw");   // np. /gra/x/Firma?motyw=bok
  if (znane(zAdresu)) {
    motyw = zAdresu;
    try { localStorage.setItem(KLUCZ, motyw); } catch (e) { /* bez zapisu */ }
  }
  if (!znane(motyw)) motyw = DOMYSLNY;
  document.documentElement.setAttribute("data-motyw", motyw);

  function ustaw(m) {
    if (!znane(m)) return;
    document.documentElement.setAttribute("data-motyw", m);
    try { localStorage.setItem(KLUCZ, m); } catch (e) { /* bez zapisu */ }
    document.dispatchEvent(new CustomEvent("motyw", { detail: m }));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var konto = document.querySelector(".konto");
    if (!konto) return;
    var pole = document.createElement("label");
    pole.className = "wybor-motywu";
    pole.innerHTML = "<span>Układ</span><select aria-label=\"Układ menu\">" + MOTYWY.map(function (x) {
      return "<option value=\"" + x[0] + "\"" + (x[0] === motyw ? " selected" : "") + ">" + x[1] + "</option>";
    }).join("") + "</select>";
    pole.querySelector("select").addEventListener("change", function (e) { ustaw(e.target.value); });
    konto.appendChild(pole);
    schowajUstawienia(konto, pole);
    wyborPalety(pole);   // to samo menu ⚙ na każdej stronie (gra, lista gier, panel MG, konto)
  });

  // w nagłówku zostają firma, saldo i „Jak grać”; reszta (lista gier, konto, panel MG, wygląd)
  // jest w rozwijanym menu pod ikoną ⚙ – dostępnym klawiaturą, zamykanym Esc i kliknięciem poza menu
  function schowajUstawienia(konto, pole) {
    var lista = document.createElement("div");
    lista.className = "ustawienia-lista";
    lista.id = "ustawienia-lista";
    lista.hidden = true;
    ["a[href=\"/\"]", ".uzytkownik", "a[href=\"/mg/\"]", "a[href=\"/admin/\"]"].forEach(function (sel) {
      var el = konto.querySelector(sel);
      if (el) lista.appendChild(el);
    });
    lista.appendChild(pole);
    var wyloguj = konto.querySelector(".wyloguj");
    if (wyloguj) lista.appendChild(wyloguj);
    var obudowa = document.createElement("div");
    obudowa.className = "ustawienia";
    var przycisk = document.createElement("button");
    przycisk.type = "button";
    przycisk.className = "ustawienia-przycisk";
    przycisk.title = "Ustawienia: lista gier, konto, wygląd";
    przycisk.setAttribute("aria-label", "Ustawienia");
    przycisk.setAttribute("aria-haspopup", "true");
    przycisk.setAttribute("aria-expanded", "false");
    przycisk.setAttribute("aria-controls", "ustawienia-lista");
    przycisk.textContent = "⚙";
    obudowa.appendChild(przycisk);
    obudowa.appendChild(lista);
    konto.appendChild(obudowa);
    function otworz(czy, fokus) {
      lista.hidden = !czy;
      przycisk.setAttribute("aria-expanded", czy ? "true" : "false");
      if (czy && fokus) { var pierwszy = lista.querySelector("a, select, button"); if (pierwszy) pierwszy.focus(); }
    }
    przycisk.addEventListener("click", function () { otworz(lista.hidden, true); });
    document.addEventListener("click", function (e) { if (!lista.hidden && !obudowa.contains(e.target)) otworz(false); });
    obudowa.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lista.hidden) { otworz(false); przycisk.focus(); }
    });
    obudowa.addEventListener("focusout", function (e) {
      if (!lista.hidden && e.relatedTarget && !obudowa.contains(e.relatedTarget)) otworz(false);
    });
  }

  // Paleta i tryb (lukrum.js → lukrum.wyglad): trzy palety × jasny / ciemny, zapamiętane w przeglądarce
  function wyborPalety(przed) {
    if (!window.lukrum) return;
    var PALETY = [["bar", "Bar mleczny"], ["pewex", "Pewex"], ["wysoka", "Wysoka widoczność"]];
    var TRYBY = [["jasny", "Jasny"], ["ciemny", "Ciemny"]];
    var teraz = window.lukrum.wyglad.odczytaj();
    function pole(etykieta, opis, lista, wybrany, zmiana) {
      var el = document.createElement("label");
      el.className = "wybor-motywu";
      el.innerHTML = "<span>" + etykieta + "</span><select aria-label=\"" + opis + "\">" + lista.map(function (x) {
        return "<option value=\"" + x[0] + "\"" + (x[0] === wybrany ? " selected" : "") + ">" + x[1] + "</option>";
      }).join("") + "</select>";
      el.querySelector("select").addEventListener("change", function (e) { zmiana(e.target.value); });
      przed.parentNode.insertBefore(el, przed);
    }
    pole("Kolory", "Paleta kolorów", PALETY, teraz.paleta, function (w) { window.lukrum.wyglad.ustaw({ paleta: w }); });
    pole("Tryb", "Tryb jasny albo ciemny", TRYBY, teraz.tryb, function (w) { window.lukrum.wyglad.ustaw({ tryb: w }); });
  }

  window.ustawMotyw = ustaw;
})();
