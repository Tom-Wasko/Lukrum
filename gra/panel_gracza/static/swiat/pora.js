// Pora dnia we wnętrzach: ta sama godzina i te same progi co na mapie (mapa/slonce.js, ustawienia w dane/mapa/miasto.yaml → pora).
// Pora to światło w scenie (niebo za oknem, lampy, przyciemnienie), nie tryb jasny/ciemny: tryb zmienia kolory interfejsu.
import { czasReczny, nakladkaPory, stopienLamp, terazMinuty, ustawUstawieniaPory, wysokoscSlonca } from "../mapa/slonce.js";

const NAZWY = { swit: "świt", dzien: "dzień", zmierzch: "zmierzch", noc: "noc" };
const ZNAKI = { swit: "◐", dzien: "☀", zmierzch: "◑", noc: "☾" };
const DOMYSLNE = { progi: { noc: -8, dzien: 6, pelna_noc: -18 }, wnetrze: { przyciemnienie: 0.85, poswiata_lamp: 0.55 } };
const miedzy = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/**
 * Pora dnia dla wysokości Słońca `h` (stopnie) i godziny `minuty` (rozróżnia świt od zmierzchu). Czysta funkcja.
 * Zwraca { pora: swit|dzien|zmierzch|noc, ciemnosc 0–1 (0 pełny dzień, 1 pełna noc), lampy 0–1, nakladka {kolor, krycie}, poswiata }.
 */
export function porzeDnia(h, minuty, ust = {}) {
  const pr = { ...DOMYSLNE.progi, ...(ust.progi || {}) }, wn = { ...DOMYSLNE.wnetrze, ...(ust.wnetrze || {}) };
  const pora = h <= pr.noc ? "noc" : h >= pr.dzien ? "dzien" : minuty < 720 ? "swit" : "zmierzch";
  const ciemnosc = miedzy((pr.dzien - h) / (pr.dzien - pr.pelna_noc));
  const nak = nakladkaPory(h), lampy = stopienLamp(h);
  return { pora, nazwa: NAZWY[pora], znak: ZNAKI[pora], ciemnosc, lampy, wysokosc: h,
    nakladka: { kolor: nak.kolor, krycie: nak.krycie * wn.przyciemnienie }, poswiata: wn.poswiata_lamp * lampy };
}

/** Pora teraz (albo według suwaka na mapie): `ust` = kat.mapa.miasto.pora. */
export function poraTeraz(ust) {
  ustawUstawieniaPory(ust);
  const r = czasReczny(), m = r ?? terazMinuty();
  return { ...porzeDnia(wysokoscSlonca(r), m, ust), minuty: m };
}

/** Klasa i zmienne CSS pory dla kontenera sceny. */
export const stylPory = (p) => ({
  klasa: `pora-${p.pora}`,
  zmienne: `--pora-ciemnosc:${p.ciemnosc.toFixed(3)};--pora-krycie:${p.nakladka.krycie.toFixed(3)};--pora-kolor:${p.nakladka.kolor};--pora-lampy:${p.poswiata.toFixed(3)}`,
});

/** Warstwa przyciemnienia i poświaty lamp (nad rysunkiem, pod klikalnymi punktami). */
export const warstwaPory = () => `<div class="sw-pora-warstwa" aria-hidden="true"></div><div class="sw-pora-lampy" aria-hidden="true"></div>`;
/** Napis z porą: stan nie tylko kolorem. */
export const etykietaPory = (p) => `<span class="sw-pora-znak" title="Pora dnia za oknem jak na mapie"><span aria-hidden="true">${p.znak}</span> ${p.nazwa}</span>`;
