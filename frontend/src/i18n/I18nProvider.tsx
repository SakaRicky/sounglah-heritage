import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { I18nContext, type I18nContextValue, type TranslationParams } from './I18nContext'
import {
  defaultLocale,
  supportedLocales,
  translations,
  type Locale,
} from './translations'

const STORAGE_KEY = 'sounglah-ui-locale'

function isLocale(value: string | null): value is Locale {
  return supportedLocales.includes(value as Locale)
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isLocale(stored)) return stored

  const browserLocale = window.navigator.language.slice(0, 2)
  if (isLocale(browserLocale)) return browserLocale

  return defaultLocale
}

function interpolate(message: string, params?: TranslationParams) {
  if (!params) return message

  return Object.entries(params).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(String(value)),
    message,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale: setLocaleState,
      t: (key, params) => interpolate(translations[locale][key], params),
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
