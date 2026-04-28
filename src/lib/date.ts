import { siteConfig } from "@config/site";
import { format, formatDistance } from "date-fns";
import * as locales from "date-fns/locale";

type Locales = typeof locales;

const LOCALE_MAP: Record<string, string> = {
  "en": "enUS",
  "es": "es",
  "ja": "ja",
  "zh-CN": "zhCN",
};

const formatDate = (date: Date) => {
  return format(date, siteConfig.openGraph.dateFormat);
}

const formatDuration = (start: Date, end: Date, lang: string) => {
  const localeKey = (LOCALE_MAP[lang] ?? lang) as keyof Locales;
  return formatDistance(start, end, { 
    locale: locales[localeKey]
  });
}

export { formatDate, formatDuration }