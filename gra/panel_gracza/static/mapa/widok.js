// Silnik widoku nowej mapy: płynne przybliżanie i przesuwanie (kółko, przeciąganie, dwa palce, dwuklik, klawisze).
// Świat jest w metrach; ekran = świat × k + (x, y). Moduł nie wie, co jest na mapie – woła `naZmiane(stan)`.

const bezRuchu = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ogranicz = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * @param {HTMLElement} ramka  element z mapą (łapie zdarzenia)
 * @param {{zasieg: number[], start?: number[], stan?: object, maks?: number, naZmiane: (s: {k: number, x: number, y: number}) => void}} op
 *   zasieg – [minX, minY, maxX, maxY] świata; start – prostokąt pokazany na początku (domyślnie cały zasięg);
 *   stan – poprzedni widok (zostaje między rysowaniami)
 */
export function utworzWidok(ramka, op) {
  const [x0, y0, x1, y1] = op.zasieg, MAKS = op.maks || 2.5;
  let teraz = null, cel = null, klatka = 0, zniszczony = false;
  const rozmiar = () => { const r = ramka.getBoundingClientRect(); return [Math.max(1, r.width), Math.max(1, r.height)]; };
  const kMin = () => { const [w, h] = rozmiar(); return Math.min(w / (x1 - x0), h / (y1 - y0)) * 0.85; };

  // środek ekranu nie może wyjechać poza miasto
  function przytnij(s) {
    const [w, h] = rozmiar();
    s.k = ogranicz(s.k, kMin(), MAKS);
    s.x = ogranicz(s.x, w / 2 - x1 * s.k, w / 2 - x0 * s.k);
    s.y = ogranicz(s.y, h / 2 - y1 * s.k, h / 2 - y0 * s.k);
    return s;
  }
  function calosc() {
    const [w, h] = rozmiar(), k = Math.min(w / (x1 - x0), h / (y1 - y0)) * 0.94;
    return { k, x: w / 2 - (x0 + x1) / 2 * k, y: h / 2 - (y0 + y1) / 2 * k };
  }
  function pokaz() { op.naZmiane(teraz); }
  function krok() {
    klatka = 0;
    if (zniszczony || !cel) return;
    const t = 0.22;   // ułamek drogi na klatkę – szybki start, miękkie dojście
    teraz.k = Math.exp(Math.log(teraz.k) + (Math.log(cel.k) - Math.log(teraz.k)) * t);
    teraz.x += (cel.x - teraz.x) * t;
    teraz.y += (cel.y - teraz.y) * t;
    if (Math.abs(cel.k / teraz.k - 1) < 0.002 && Math.abs(cel.x - teraz.x) < 0.5 && Math.abs(cel.y - teraz.y) < 0.5) { teraz = { ...cel }; cel = null; }
    pokaz();
    if (cel) klatka = requestAnimationFrame(krok);
  }
  /** Idź do stanu: płynnie albo od razu (przeciąganie, wyłączony ruch). */
  function idz(s, plynnie = true) {
    przytnij(s);
    if (!plynnie || bezRuchu()) { teraz = s; cel = null; pokaz(); return; }
    cel = s;
    if (!klatka) klatka = requestAnimationFrame(krok);
  }
  const baza = () => cel || teraz;
  /** Przybliż `razy` wokół punktu ekranu (sx, sy) – ten punkt mapy zostaje pod kursorem. */
  function przybliz(razy, sx, sy, plynnie = true) {
    const b = baza(), [w, h] = rozmiar();
    sx ??= w / 2; sy ??= h / 2;
    const k = ogranicz(b.k * razy, kMin(), MAKS), r = k / b.k;
    idz({ k, x: sx - (sx - b.x) * r, y: sy - (sy - b.y) * r }, plynnie);
  }
  /** Pokaż punkt świata w środku ekranu przy skali k. */
  function lecDo(wx, wy, k) {
    const [w, h] = rozmiar();
    k = ogranicz(k ?? baza().k, kMin(), MAKS);
    idz({ k, x: w / 2 - wx * k, y: h / 2 - wy * k });
  }
  /** Pokaż prostokąt świata [minX, minY, maxX, maxY] z marginesem (w pikselach). */
  function dopasuj(pr, margines = 80, kMaks = 0.6) {
    const [w, h] = rozmiar();
    const k = Math.min((w - 2 * margines) / Math.max(1, pr[2] - pr[0]), (h - 2 * margines) / Math.max(1, pr[3] - pr[1]), kMaks);
    lecDo((pr[0] + pr[2]) / 2, (pr[1] + pr[3]) / 2, k);
  }

  // --- mysz, dotyk, klawisze ---
  const miejsce = (e) => { const r = ramka.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const palce = new Map();
  let ciagnie = null, szczypie = null, przeciagnieto = false;

  function kolko(e) {
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;   // Firefox liczy w liniach
    przybliz(Math.exp(-ogranicz(d, -400, 400) * (e.ctrlKey ? 0.01 : 0.0022)), ...miejsce(e));
  }
  function wcisniecie(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest?.(".lm-slonce")) return;   // suwak pory dnia nie przesuwa mapy
    palce.set(e.pointerId, miejsce(e));
    if (palce.size === 1) { ciagnie = { od: miejsce(e), stan: { ...baza() }, id: e.pointerId }; przeciagnieto = false; }
    if (palce.size === 2) {
      const [a, b] = [...palce.values()];
      szczypie = { odl: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, stan: { ...baza() }, sr: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
      ciagnie = null; przeciagnieto = true;
    }
  }
  function ruch(e) {
    if (!palce.has(e.pointerId)) return;
    palce.set(e.pointerId, miejsce(e));
    if (szczypie && palce.size >= 2) {
      const [a, b] = [...palce.values()], odl = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, sr = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const s = szczypie.stan, k = ogranicz(s.k * odl / szczypie.odl, kMin(), MAKS), r = k / s.k;
      idz({ k, x: sr[0] - (szczypie.sr[0] - s.x) * r, y: sr[1] - (szczypie.sr[1] - s.y) * r }, false);
      return;
    }
    if (!ciagnie || ciagnie.id !== e.pointerId) return;
    const [mx, my] = miejsce(e), dx = mx - ciagnie.od[0], dy = my - ciagnie.od[1];
    if (!przeciagnieto && Math.hypot(dx, dy) < 6) return;
    if (!przeciagnieto) { przeciagnieto = true; ramka.classList.add("przesuwana"); try { ramka.setPointerCapture(e.pointerId); } catch { /* bez przechwycenia */ } }
    idz({ k: ciagnie.stan.k, x: ciagnie.stan.x + dx, y: ciagnie.stan.y + dy }, false);
  }
  function puszczenie(e) {
    palce.delete(e.pointerId);
    if (palce.size < 2) szczypie = null;
    if (!palce.size) { ciagnie = null; ramka.classList.remove("przesuwana"); }
    else if (palce.size === 1) { const [id, m] = [...palce.entries()][0]; ciagnie = { od: m, stan: { ...baza() }, id }; }
  }
  // kliknięcie po przeciągnięciu to nie kliknięcie budynku
  function klik(e) { if (przeciagnieto) { e.stopPropagation(); e.preventDefault(); przeciagnieto = false; } }
  function dwuklik(e) { if (!e.target.closest("button, a")) { e.preventDefault(); przybliz(1.8, ...miejsce(e)); } }
  function klawisz(e) {
    if (e.target.closest("input, select, textarea")) return;
    const b = baza(), krokPx = 90;
    const ruchy = { ArrowLeft: [krokPx, 0], ArrowRight: [-krokPx, 0], ArrowUp: [0, krokPx], ArrowDown: [0, -krokPx] };
    if (e.key === "+" || e.key === "=") przybliz(1.5);
    else if (e.key === "-" || e.key === "_") przybliz(1 / 1.5);
    else if (e.key === "0") idz(calosc());
    else if (ruchy[e.key]) idz({ k: b.k, x: b.x + ruchy[e.key][0], y: b.y + ruchy[e.key][1] });
    else return;
    e.preventDefault();
  }
  ramka.addEventListener("wheel", kolko, { passive: false });
  ramka.addEventListener("pointerdown", wcisniecie);
  ramka.addEventListener("pointermove", ruch);
  ramka.addEventListener("pointerup", puszczenie);
  ramka.addEventListener("pointercancel", puszczenie);
  ramka.addEventListener("click", klik, true);
  ramka.addEventListener("dblclick", dwuklik);
  ramka.addEventListener("keydown", klawisz);
  const obserwator = typeof ResizeObserver === "function" ? new ResizeObserver(() => { if (teraz) idz({ ...baza() }, false); }) : null;
  obserwator?.observe(ramka);

  teraz = przytnij(op.stan ? { ...op.stan } : calosc());
  if (!op.stan && op.start) { dopasuj(op.start, 40, 1); teraz = { ...cel || teraz }; cel = null; cancelAnimationFrame(klatka); klatka = 0; }
  pokaz();
  return {
    przybliz, lecDo, dopasuj, calosc: () => idz(calosc()),
    stan: () => ({ ...baza() }),
    zniszcz() { zniszczony = true; cancelAnimationFrame(klatka); obserwator?.disconnect(); },
  };
}
