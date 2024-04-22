export interface TProject {
  logo: string
  title: string
  description: string
  link: string
  source: string
}

export const projects: TProject[] = [
  {
    logo: "https://chatgpt-nuxt.hylarucoder.io/nuxt.svg",
    title: "ChatGPT Nuxt",
    description: "One-Click to get well-designed cross-platform ChatGPT web UI.",
    link: "https://chatgpt-nuxt.hylarucoder.io",
    source: "hylarucoder.io",
  },
  {
    logo: "https://chatgpt-nuxt.hylarucoder.io/nuxt.svg",
    title: "Open Source - tifa",
    description: "Yet another opinionated fastapi-start-kit with best practice",
    link: "https://github.com/hylarucoder/tifa",
    source: "github.com",
  },
  {
    logo: "https://chatgpt-nuxt.hylarucoder.io/nuxt.svg",
    title: "Open Source - danmu.fm",
    description: "A command-line tool used to retrieve bullet screen messages for specified anchors on Douyu TV",
    link: "https://github.com/hylarucoder/danmu.fm",
    source: "github.com",
  },
  {
    logo: "https://chatgpt-nuxt.hylarucoder.io/nuxt.svg",
    title: "Open Source - YaDjangoBlog",
    description: "Yet another django blog project with best practice",
    link: "https://github.com/hylarucoder/yadjangoblog",
    source: "github.com",
  },
]

const workExperience = [
  {
    companyName: "Indie Hacker && Freelancer",
    jobTitle: "FullStack Engineer - WFH",
    startDate: "2023-05",
    endDate: "Present",
    imageUrl: "/logos/freelancer.jpeg",
  },
  {
    companyName: "Kiwidrop.Inc",
    jobTitle: "FullStack Engineer - WFH",
    startDate: "2021-09",
    endDate: "2023-05",
    imageUrl: "/logos/kiwi.jpeg",
  },
  {
    companyName: "上海食亨科技有限公司",
    jobTitle: "Backend Engineer",
    startDate: "2020-01",
    endDate: "2021-08",
    imageUrl: "/logos/shiheng.jpeg",
  },
  {
    companyName: "荔枝微课 - 十方融海",
    jobTitle: "Tech Leader In 小爱项目组",
    startDate: "2019-10",
    endDate: "2020-08",
    imageUrl: "/logos/lizhi.png",
  },
  {
    companyName: "上海报时树科技有限公司",
    jobTitle: "FullStack Engineer",
    startDate: "2018-03",
    endDate: "2019-10",
    imageUrl: "/logos/baoshishu.jpg",
  },
  {
    companyName: "北京新中商数据科技有限公司",
    jobTitle: "FullStack Engineer",
    startDate: "2016-10",
    endDate: "2018-03",
    imageUrl: "/logos/zhongshang.jpeg",
  },
]

const socialLinks = [
  {
    platform: "Twitter",
    url: "https://twitter.com/hylarucoder",
    icon: "i-fa6-brands-twitter text-blue-500 w-6 h-6 dark:bg-zinc-500",
  },
  {
    platform: "GitHub",
    url: "https://github.com/hylarucoder",
    icon: "i-fa6-brands-github text-gray-600 w-6 h-6 dark:bg-zinc-500",
  },
  {
    platform: "Youtube",
    url: "https://www.youtube.com/@hylarucoder",
    icon: "i-fa6-brands-youtube text-red-500 w-6 h-6 dark:bg-zinc-500",
  },
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/hylarucoder",
    icon: "i-fa6-brands-linkedin w-6 h-6 text-[#0962E5] dark:bg-zinc-500",
  },
  {
    platform: "Bilibili",
    url: "https://space.bilibili.com/36269379",
    icon: "i-fa6-brands-bilibili text-[#0199d4] h-6 w-6 dark:bg-zinc-500",
  },
  {
    platform: "Zhihu",
    url: "https://www.zhihu.com/people/hylarucoder",
    icon: "i-fa6-brands-zhihu text-[#0962E5] h-6 w-6 dark:bg-zinc-500",
  },
  {
    platform: "Email",
    url: "mailto:twocucao@gmail.com",
    icon: "i-mdi-mail h-6 w-6 text-gray-600 dark:bg-zinc-500",
  },
]
export const siteConfig = {
  title: "HylaruCoder",
  description: "HylaruCoder's personal website",
  projects,
  workExperience,
  socialLinks,
}
