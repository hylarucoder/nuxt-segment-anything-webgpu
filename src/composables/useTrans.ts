import { TLocale } from "~/locales/en"
import { TLocaleKeys } from "~/locales/schema"

export const useTrans = () => {
  const { t, n, locale, setLocale } = useI18n<{ message: TLocale }>({
    useScope: "global",
  })
  const trans = (key: TLocaleKeys, context?: any) => t(String(key), context)

  return {
    t: trans,
    n,
    locale,
    setLocale,
  }
}

export default useTrans
