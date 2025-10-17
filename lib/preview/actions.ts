import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandLinkedin,
    IconBrandYoutube,
    IconBrandTiktok,
    IconBrandGithub,
    IconBrandDiscord,
    IconMail,
    IconWorld,
    IconMapPin,
  } from "@tabler/icons-react"

export const getSocialIcon = (platform: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      facebook: IconBrandFacebook,
      instagram: IconBrandInstagram,
      twitter: IconBrandTwitter,
      linkedin: IconBrandLinkedin,
      youtube: IconBrandYoutube,
      tiktok: IconBrandTiktok,
      github: IconBrandGithub,
      discord: IconBrandDiscord,
      gmail: IconMail,
      portfolio: IconWorld,
      other: IconWorld,
    }
    return iconMap[platform.toLowerCase()] || IconWorld
  }
  
  export const getThemeClasses = (theme?: string) => {
    const themes: Record<string, string> = {
      minimal_white: "bg-white text-gray-900",
      minimal_black: "bg-gray-900 text-white",
      gradient_blue: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
      gradient_purple: "bg-gradient-to-br from-purple-400 to-pink-600 text-white",
      gradient_green: "bg-gradient-to-br from-green-400 to-emerald-600 text-white",
      gradient_orange: "bg-gradient-to-br from-orange-400 to-red-600 text-white",
    }
    return themes[theme || "minimal_white"] || themes.minimal_white
  }
  
  export const getBlockShape = (shape?: string) => {
    const shapes: Record<string, string> = {
      square: "rounded-none",
      rounded: "rounded-lg",
      pill: "rounded-full",
    }
    return shapes[shape || "rounded"] || shapes.rounded
  }

export const isLightColor = (color: string): boolean => {
    const hex = color.replace("#", "")
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  }