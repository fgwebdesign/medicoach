import type { MessageDictionary } from "./dictionary";
import { getDictionary } from "./dictionary";
import type { Locale } from "./types";

export type I18nPath =
  | `nav.${keyof MessageDictionary["nav"]}`
  | `header.${keyof MessageDictionary["header"]}`
  | `common.${keyof MessageDictionary["common"]}`
  | `chat.${keyof MessageDictionary["chat"]}`
  | `terms.${keyof MessageDictionary["terms"]}`
  | `sidebar.${keyof MessageDictionary["sidebar"]}`;

function getValue(d: MessageDictionary, path: string): string {
  const parts = path.split(".");
  let cur: unknown = d;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") {
      return path;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

export function createTranslator(
  dict: MessageDictionary,
): (path: I18nPath) => string {
  return (path: I18nPath) => getValue(dict, path);
}

export function t(
  locale: Locale,
  path: I18nPath,
  dict: MessageDictionary = getDictionary(locale),
): string {
  return getValue(dict, path);
}
