import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Locale } from "~~/shared/types/campaign";

const localeCache = new Map<string, Record<string, string>>();

function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, fullKey),
      );
    }
  }
  return result;
}

async function loadLocale(language: Locale): Promise<Record<string, string>> {
  const cached = localeCache.get(language);
  if (cached) return cached;

  const filePath = resolve(`i18n/locales/${language}.json`);
  const raw = JSON.parse(await readFile(filePath, "utf-8"));
  const flat = flattenObject(raw);
  localeCache.set(language, flat);
  return flat;
}

export async function createI18nResolver(
  language: Locale,
): Promise<(key: string) => string> {
  const translations = await loadLocale(language);
  return (key: string) => translations[key] ?? key;
}
