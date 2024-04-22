const localeKeys = [
  "WIP",
  "Home.Title",
  "Home.Subtitle",
  "Articles.Title",
  "Articles.Subtitle",
  "Error.Unauthorized",
  "Auth.Title",
  "Auth.Tips",
  "Auth.Input",
  "Auth.Confirm",
  "Auth.Later",
  "ChatItem.ChatItemCount",
] as const

export type TLocaleKeys = (typeof localeKeys)[number]
