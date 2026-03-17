import type { AstroCookies } from "astro";
import { translations, type Lang, type T } from "./translations";

export type { Lang, T };

export function getLang(cookies: AstroCookies): Lang {
  const val = cookies.get("lang")?.value;
  return val === "en" ? "en" : "ru";
}

export function getT(lang: Lang): T {
  return translations[lang] as unknown as T;
}
