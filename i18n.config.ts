import en from "./src/locales/en"
import zhCN from "./src/locales/zh_CN"

export default defineI18nConfig(() => ({
  messages: {
    en,
    zh_CN: zhCN,
  },
}))
