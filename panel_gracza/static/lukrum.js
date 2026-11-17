// LUKRUM – wspólne wejście mapy ([mapa]) i wnętrz ([mechaniki]). Umowa: notatki WSPOLPRACA.md, „Umowy na granicy” (14.11).
// Ładowany w <head> bez defer (jak motyw.js), żeby paleta była ustawiona przed pierwszym rysowaniem strony.

//   lukrum.wyglad.ustaw({ paleta, tryb })  paleta: "bar" | "pewex" | "wysoka", tryb: "jasny" | "ciemny"
//   lukrum.wyglad.odczytaj()               → { paleta, tryb }
//   lukrum.otworzWnetrze(idMiejsca)        mapa woła po kliknięciu budynku (id z dane/mapa/budynki.yaml albo id lokalu)
//   lukrum.wrocNaMape()                    wnętrze woła przyciskiem „Wróć na mapę”

// Zdarzenia na document (CustomEvent, dane w detail):
//   "lukrum:wyglad"  { paleta, tryb }   – po zmianie wyglądu (mapa przerysowuje kolory z zmienne.css)
//   "lukrum:wnetrze" { id }             – prośba o wnętrze; rysuje je strona [mechaniki]
//   "lukrum:mapa"    {}                 – powrót na mapę; rysuje ją strona [mapa]
// Dopóki budynek nie ma wnętrza, [mechaniki] otwierają w odpowiedzi dotychczasową zakładkę (pole zakladka w budynki.yaml).
(function () {
  var PALETY = ["bar", "pewex", "wysoka"], TRYBY = ["jasny", "ciemny"];
  var KLUCZ = "lukrum-wyglad";
  var html = document.documentElement;
  var wyglad = { paleta: "bar", tryb: "jasny" };
  try {
    var z = JSON.parse(localStorage.getItem(KLUCZ) || "{}");
    if (PALETY.indexOf(z.paleta) >= 0) wyglad.paleta = z.paleta;
    if (TRYBY.indexOf(z.tryb) >= 0) wyglad.tryb = z.tryb;
  } catch (e) { /* prywatne okno albo zły zapis – zostaje domyślny */ }

  function zastosuj() {
    html.setAttribute("data-paleta", wyglad.paleta);
    html.setAttribute("data-tryb", wyglad.tryb);
  }
  zastosuj();

  function zdarzenie(nazwa, dane) {
    document.dispatchEvent(new CustomEvent(nazwa, { detail: dane || {} }));
  }

  window.lukrum = {
    wyglad: {
      PALETY: PALETY.slice(), TRYBY: TRYBY.slice(),
      odczytaj: function () { return { paleta: wyglad.paleta, tryb: wyglad.tryb }; },
      ustaw: function (nowy) {
        nowy = nowy || {};
        if (PALETY.indexOf(nowy.paleta) >= 0) wyglad.paleta = nowy.paleta;
        if (TRYBY.indexOf(nowy.tryb) >= 0) wyglad.tryb = nowy.tryb;
        zastosuj();
        try { localStorage.setItem(KLUCZ, JSON.stringify(wyglad)); } catch (e) { /* bez zapisu */ }
        zdarzenie("lukrum:wyglad", this.odczytaj());
      },
    },
    otworzWnetrze: function (idMiejsca) { zdarzenie("lukrum:wnetrze", { id: String(idMiejsca) }); },
    wrocNaMape: function () { zdarzenie("lukrum:mapa"); },
  };
})();
