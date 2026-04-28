import "server-only"

import { getLang } from "./actions/get-lang"
import { siteConfig } from "@config/site"
import { Dictionary } from "./types"

const dictionaries: Record<string, Dictionary> = {}

let initPromise: Promise<void> | null = null

const ensureInitialized = () => {
  if (!initPromise) {
    initPromise = Promise.all(
      siteConfig.languages.available.map(async (lang) => {
        const dictionary = await import(`../../../language/${lang}.js`)
        dictionaries[lang] = dictionary.default
      })
    ).then(() => undefined)
  }
  return initPromise
}

const getDictionary = (lang: string) => dictionaries[lang]

const getDictionaries = () => dictionaries

const language = async () => {
  await ensureInitialized()
  const lang = await getLang()
  const dictionary = getDictionary(lang)

  return {
    lang,
    dictionary
  }
}

export { getDictionary, getDictionaries, language }