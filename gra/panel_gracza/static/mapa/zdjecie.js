// Zdjęcie mapy w ruchu (podróż 02/drogi). Rysunek mapy (SVG: tereny, drogi, granice z kreskowaniem, kolej, napisy ulic, poświata lamp)
// jest drogi do rysowania w każdej klatce przesuwania i przybliżania. Dlatego w czasie ruchu pokazujemy jego zdjęcie (canvas
// przesuwany i skalowany transformem, czyli na GPU), a ostre wektory wracają po zatrzymaniu. Wygląd zdjęcia = wygląd wektorów:
// kolory, grubości, kreski i napisy czytamy z obliczonych stylów tych samych elementów (więc palety i tryby działają bez zmian).
// Zdjęcie obejmuje obszar większy od ramki o ZAPAS z każdej strony (zapas na przesuwanie) i ma rozdzielczość ekranu.

const ZAPAS = 0.3;             // o ile ramki zdjęcie wystaje z każdej strony
const MAKS_PIKSELI = 16e6;     // górna granica pikseli jednego zdjęcia (pamięć); powyżej zmniejszamy rozdzielczość
const NAJCZESCIEJ = 350;       // ms: tyle najmniej mija między zdjęciami robionymi w trakcie ruchu
const MAKS_POWIEKSZENIE = 2.4; // powyżej tego powiększenia zdjęcie robi się zbyt rozmyte i robimy nowe

const liczba = (v) => parseFloat(v) || 0;

export function utworzZdjecie(ramka, op) {
  // op.przygotuj(s): ustawia skalę (--k) wektorów na widok s, zanim przeczytamy ich style
  const warstwy = [...ramka.querySelectorAll(":scope > .lmapa-svg")].map((svg) => {
    const plotno = Object.assign(document.createElement("canvas"), { className: "lmapa-snimek", hidden: true });
    plotno.setAttribute("aria-hidden", "true");
    svg.after(plotno);
    return { svg, plotno, lampy: svg.classList.contains("lm-svg-lampy") };
  });
  // miarka: zawsze narysowany, niewidoczny SVG z torami napisów ulic (wektory bywają schowane, a getPointAtLength wymaga narysowanego elementu)
  const miarka = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  miarka.setAttribute("aria-hidden", "true");
  miarka.style.cssText = "position:absolute;width:1px;height:1px;visibility:hidden;pointer-events:none;overflow:hidden";
  ramka.append(miarka);
  const tory = new Map(), sciezki = new WeakMap();
  let baza = null, wRuchu = false, ostatnie = -1e9, brudne = true, zegar = 0, kopia = null, zniszczone = false;

  const tor = (id, d) => {
    let p = tory.get(id);
    if (!p) { p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", d); miarka.append(p); tory.set(id, p); }
    return p;
  };

  // przezroczystość elementu razem z przodkami (aż do korzenia SVG); null, gdy element albo przodek jest ukryty
  function widocznosc(el, svg, pamiec) {
    let alfa = 1;
    for (let n = el; n && n !== svg; n = n.parentNode) {
      let w = pamiec.get(n);
      if (!w) { const cs = getComputedStyle(n); w = { ukryty: cs.display === "none", alfa: liczba(cs.opacity) }; pamiec.set(n, w); }
      if (w.ukryty) return null;
      alfa *= w.alfa;
    }
    return alfa;
  }

  function rysujSciezke(ctx, el, cs, alfa) {
    let p = sciezki.get(el);
    if (!p) { p = new Path2D(el.getAttribute("d") || ""); sciezki.set(el, p); }
    if (cs.fill !== "none") { ctx.globalAlpha = alfa * liczba(cs.fillOpacity); ctx.fillStyle = cs.fill; ctx.fill(p, cs.fillRule === "evenodd" ? "evenodd" : "nonzero"); }
    const grubosc = liczba(cs.strokeWidth);
    if (cs.stroke !== "none" && grubosc > 0) {
      ctx.globalAlpha = alfa * liczba(cs.strokeOpacity);
      ctx.strokeStyle = cs.stroke; ctx.lineWidth = grubosc; ctx.lineCap = cs.strokeLinecap === "butt" ? "butt" : cs.strokeLinecap;
      ctx.lineJoin = cs.strokeLinejoin; ctx.miterLimit = 4;
      ctx.setLineDash(cs.strokeDasharray === "none" ? [] : cs.strokeDasharray.split(/[ ,]+/).map(liczba));
      ctx.stroke(p);
      ctx.setLineDash([]);
    }
  }

  // napis wzdłuż toru (textPath, text-anchor: middle, startOffset 50%): znak po znaku, obrócony stycznie do toru
  function rysujNapis(ctx, el, cs, svg) {
    const tp = el.querySelector("textPath"), ref = tp?.getAttribute("href");
    if (!ref) return;
    const zrodlo = svg.querySelector(ref);
    if (!zrodlo) return;
    const p = tor(ref, zrodlo.getAttribute("d") || ""), dl = p.getTotalLength();
    const rozm = liczba(cs.fontSize), odstep = cs.letterSpacing === "normal" ? 0 : liczba(cs.letterSpacing), tekst = tp.textContent;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = cs.strokeLinejoin; ctx.lineWidth = liczba(cs.strokeWidth);
    const znaki = [...tekst], szer = znaki.map((z) => ctx.measureText(z).width + odstep), suma = szer.reduce((a, b) => a + b, 0);
    let poz = dl * 0.5 - suma / 2;
    const dy = rozm * 0.35, probka = Math.max(rozm * 0.25, 1);
    znaki.forEach((z, i) => {
      const sr = poz + (szer[i] - odstep) / 2;
      poz += szer[i];
      if (sr < 0 || sr > dl) return;
      const a = p.getPointAtLength(Math.max(0, sr - probka)), b = p.getPointAtLength(Math.min(dl, sr + probka)), c = p.getPointAtLength(sr);
      ctx.save();
      ctx.translate(c.x, c.y); ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x)); ctx.translate(0, dy);
      if (cs.stroke !== "none") { ctx.strokeStyle = cs.stroke; ctx.strokeText(z, 0, 0); }   // paint-order: stroke (obrys pod literą)
      ctx.fillStyle = cs.fill; ctx.fillText(z, 0, 0);
      ctx.restore();
    });
  }

  function rysujSvg(w, s, mw, mh, Wc, Hc, sc) {
    const { svg, plotno } = w, ctx = plotno.getContext("2d"), pamiec = new Map(), napisy = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, plotno.width, plotno.height);
    ctx.setTransform(sc * s.k, 0, 0, sc * s.k, sc * (s.x + mw), sc * (s.y + mh));
    for (const el of svg.querySelectorAll("path, text")) {
      if (el.tagName === "path" && !el.classList.length) continue;   // tory napisów (bez stylu) – tylko do miary
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const alfa = widocznosc(el, svg, pamiec);
      if (alfa === null || alfa <= 0) continue;
      if (el.tagName === "path") { rysujSciezke(ctx, el, cs, alfa); continue; }
      // napis poza zdjęciem pomijamy: środek (data-x, data-y) + zapas na długość nazwy
      const x = (+el.dataset.x * s.k + s.x + mw) * 1, y = (+el.dataset.y * s.k + s.y + mh) * 1, zapas = (+el.dataset.n || 12) * liczba(cs.fontSize) * s.k;
      if (x < -zapas || x > Wc + zapas || y < -zapas || y > Hc + zapas) continue;
      napisy.push([el, cs, alfa]);
    }
    if (!napisy.length) return;
    // napisy mają przezroczystość całego elementu (obrys i litera razem), więc rysujemy je na przezroczystej kopii i nakładamy z alfą
    const grupy = new Map();
    for (const n of napisy) { const k = n[2].toFixed(3); if (!grupy.has(k)) grupy.set(k, []); grupy.get(k).push(n); }
    kopia ||= document.createElement("canvas");
    if (kopia.width !== plotno.width || kopia.height !== plotno.height) { kopia.width = plotno.width; kopia.height = plotno.height; }
    const kc = kopia.getContext("2d");
    for (const [alfa, lista] of grupy) {
      kc.setTransform(1, 0, 0, 1, 0, 0); kc.clearRect(0, 0, kopia.width, kopia.height);
      kc.setTransform(sc * s.k, 0, 0, sc * s.k, sc * (s.x + mw), sc * (s.y + mh));
      for (const [el, cs] of lista) rysujNapis(kc, el, cs, svg);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = +alfa; ctx.drawImage(kopia, 0, 0);
    }
    ctx.globalAlpha = 1;
  }

  /** Robi zdjęcie wektorów dla widoku s (stan ramki: poziom, ulice, pora dnia, paleta – taki, jaki jest teraz). */
  function zrob(s) {
    const W = ramka.clientWidth, H = ramka.clientHeight;
    if (!W || !H || zniszczone) return false;
    op.przygotuj(s);
    const mw = Math.round(W * ZAPAS), mh = Math.round(H * ZAPAS), Wc = W + 2 * mw, Hc = H + 2 * mh;
    const sc = Math.min(window.devicePixelRatio || 1, Math.sqrt(MAKS_PIKSELI / (Wc * Hc)));
    try {
      for (const w of warstwy) {
        const aktywna = !w.lampy || ramka.classList.contains("lm-lampy");
        w.plotno.hidden = !aktywna;
        if (!aktywna) continue;
        const pw = Math.round(Wc * sc), ph = Math.round(Hc * sc);
        if (w.plotno.width !== pw || w.plotno.height !== ph) { w.plotno.width = pw; w.plotno.height = ph; }
        Object.assign(w.plotno.style, { left: `${-mw}px`, top: `${-mh}px`, width: `${Wc}px`, height: `${Hc}px` });
        rysujSvg(w, s, mw, mh, Wc, Hc, sc);
      }
    } catch (e) { baza = null; brudne = true; console.warn("zdjęcie mapy:", e); return false; }
    kopia = null;
    baza = { k: s.k, x: s.x, y: s.y, mw, mh, Wc, Hc, W, H, poziom: ramka.dataset.poziom, ul: ramka.dataset.ul, lampy: ramka.classList.contains("lm-lampy") };
    brudne = false; ostatnie = performance.now();
    return true;
  }

  // czy obecne zdjęcie nadaje się do pokazania dla widoku s (obejmuje ekran, ostre, z tymi samymi warstwami)
  function wazne(s) {
    const b = baza;
    if (!b || brudne || b.W !== ramka.clientWidth || b.H !== ramka.clientHeight) return false;
    if (b.poziom !== ramka.dataset.poziom || b.ul !== ramka.dataset.ul || b.lampy !== ramka.classList.contains("lm-lampy")) return false;
    const r = s.k / b.k;
    if (r > MAKS_POWIEKSZENIE) return false;
    const u0 = (0 - s.x) / r + b.x + b.mw, u1 = (b.W - s.x) / r + b.x + b.mw, v0 = (0 - s.y) / r + b.y + b.mh, v1 = (b.H - s.y) / r + b.y + b.mh;
    return u0 >= 0 && u1 <= b.Wc && v0 >= 0 && v1 <= b.Hc;
  }

  function ustaw(s) {
    const r = s.k / baza.k, tx = s.x + baza.mw - r * (baza.x + baza.mw), ty = s.y + baza.mh - r * (baza.y + baza.mh);
    const t = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${r.toFixed(5)})`;
    for (const w of warstwy) if (!w.plotno.hidden) w.plotno.style.transform = t;
  }

  return {
    /** Wołane przy każdej zmianie widoku. Zwraca true, gdy zdjęcie jest pokazywane (wektory wolno schować). */
    ruch(s) {
      clearTimeout(zegar);
      if (!wRuchu) wRuchu = true;
      if (!wazne(s) && (!baza || performance.now() - ostatnie > NAJCZESCIEJ)) zrob(s);
      if (!baza) return false;
      ustaw(s);
      return true;
    },
    /** Koniec ruchu: wektory wracają; zdjęcie na następny ruch robimy w czasie bezczynności, gdy stan się zmienił. */
    koniec(s) {
      wRuchu = false;
      if (!wazne(s) || Math.abs(s.k / baza.k - 1) > 0.02 || Math.abs(s.x - baza.x) > 1 || Math.abs(s.y - baza.y) > 1) this.odswiez();
    },
    /** Zdjęcie przestało być aktualne (paleta, pora dnia, nowe dane). W bezruchu odświeżamy je za chwilę. */
    uniewaznij() { brudne = true; if (!wRuchu) this.odswiez(); },
    odswiez() {
      clearTimeout(zegar);
      zegar = setTimeout(() => {
        const cb = () => { if (!wRuchu && !zniszczone && ramka.isConnected && op.widok()) zrob(op.widok()); };
        if (typeof requestIdleCallback === "function") requestIdleCallback(cb, { timeout: 600 }); else cb();
      }, 260);
    },
    zniszcz() { zniszczone = true; clearTimeout(zegar); for (const w of warstwy) w.plotno.remove(); miarka.remove(); },
    /** do pomiarów i testów */
    zrobTeraz: zrob,
    czyGotowe: () => !!baza && !brudne,
  };
}
