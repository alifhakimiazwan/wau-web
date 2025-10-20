// ========================================
// Button & Block Shape Types
// ========================================

export type BlockShape = 'square' | 'rounded' | 'pill'

export interface ButtonStyle {
  style: 'filled' | 'outlined' | 'ghost'
}

export const DEFAULT_BUTTON_CONFIG: ButtonStyle = {
  style: 'filled',
}

// Block shape options for UI
export const BLOCK_SHAPES = [
  {
    value: 'square' as const,
    label: 'Square',
    preview: 'rounded-none',
  },
  {
    value: 'rounded' as const,
    label: 'Rounded',
    preview: 'rounded-lg',
  },
  {
    value: 'pill' as const,
    label: 'Pill',
    preview: 'rounded-full',
  },
]

// Button style options
export const BUTTON_STYLES = [
  {
    value: 'filled' as const,
    label: 'Filled',
    description: 'Solid background',
  },
  {
    value: 'outlined' as const,
    label: 'Outlined',
    description: 'Border only',
  },
  {
    value: 'ghost' as const,
    label: 'Ghost',
    description: 'Minimal style',
  },
]

// Hover effects
export const BUTTON_EFFECTS = [
  { value: 'none' as const, label: 'None' },
  { value: 'beam' as const, label: 'Beam' },
]

// ========================================
// Theme & Design Types
// ========================================

export interface AvatarConfig {
  effect: 'none' | 'border-beam'
}

export interface DesignTheme {
    id: string
    name: string
    description: string
    preview: string
    colors: {
      background: string  // Primary background color
      accent: string      // Button/accent color
    }
    thumbnail: string  // Can be CSS gradient or path to SVG image
    fontFamily?: string
    buttonStyle?: 'filled' | 'outlined' | 'ghost'
    avatar?: AvatarConfig
    buttonEffect?: 'none' | 'scale' | 'lift' | 'glow' | 'beam'
    layout?: 'default' | 'hero'  // Layout style: default or hero with background image
  }
  
  export interface DesignCustomization {
    themeId: string
    fontFamily: string
    colors: {
      primary: string    // Background color
      accent: string     // Button color
    }
    blockShape: 'square' | 'rounded' | 'pill'  // Affects both avatar and buttons
    buttonConfig: ButtonStyle
  }
  
  export const AVAILABLE_THEMES: DesignTheme[] = [
    {
      id: 'minimal_white',
      name: 'Professional',
      description: 'Clean and professional',
      preview: 'bg-white text-gray-900',
      colors: {
        background: '#FFFFFF',
        accent: '#000000',
      },
      thumbnail: '/themes/wau1.svg',
      avatar: {
        effect: 'none',
      },
    },
    {
      id: 'gaming_dark',
      name: 'Gaming Dark',
      description: 'Dark theme perfect for gamers',
      preview: 'bg-gray-800 text-white',
      colors: {
        background: '#000000',
        accent: '#8B5CF6',
      },
      thumbnail: '/themes/wau2.svg',
      fontFamily: 'Space Grotesk',
      buttonStyle: 'outlined',
      avatar: {
        effect: 'border-beam',
      },
      buttonEffect: 'beam'
    },
    {
      id: 'wellness_light',
      name: 'Wellness Light',
      description: 'Soft, professional theme for wellness and lifestyle',
      preview: 'bg-stone-100 text-gray-900',
      colors: {
        background: '#F5F5F0',
        accent: '#6B7B5B',
      },
      thumbnail: '/themes/wau3.svg',
      fontFamily: 'Playfair Display',
      buttonStyle: 'filled',
      avatar: {
        effect: 'none',
      },
    },
    {
      id: 'gradient_purple',
      name: 'Sunset Gradient',
      description: 'Eye-catching purple to pink gradient',
      preview: 'bg-gradient-to-br from-purple-400 to-pink-600 text-white',
      colors: {
        background: '#A855F7',
        accent: '#FFFFFF',
      },
      thumbnail: '/themes/wau4.svg',
    },
    {
      id: 'gradient_green',
      name: 'Forest Gradient',
      description: 'Fresh green gradient theme',
      preview: 'bg-gradient-to-br from-green-400 to-emerald-600 text-white',
      colors: {
        background: '#10B981',
        accent: '#FFFFFF',
      },
      thumbnail: '/themes/wau5.svg',
    },
    {
      id: 'gradient_orange',
      name: 'Sunrise Gradient',
      description: 'Warm orange gradient theme',
      preview: 'bg-gradient-to-br from-orange-400 to-red-600 text-white',
      colors: {
        background: '#F97316',
        accent: '#FFFFFF',
      },
      thumbnail: '/themes/wau1.svg',
    },
    {
      id: 'hero_overlay',
      name: 'Hero Overlay',
      description: 'Profile picture as hero background with gradient overlay',
      preview: 'bg-gradient-to-b from-transparent to-black text-white',
      colors: {
        background: '#000000',
        accent: '#FFFFFF',
      },
      thumbnail: '/themes/wau2.svg',
      fontFamily: 'Poppins',
      buttonStyle: 'filled',
      layout: 'hero',
    },
  ]
  
  export const AVAILABLE_FONTS = [
    { value: 'Inter', label: 'Inter', preview: 'font-sans' },
    { value: 'Poppins', label: 'Poppins', preview: 'font-sans' },
    { value: 'Space Grotesk', label: 'Space Grotesk', preview: 'font-mono' },
    { value: 'Playfair Display', label: 'Playfair Display', preview: 'font-serif' },
    { value: 'Montserrat', label: 'Montserrat', preview: 'font-sans' },
    { value: 'Roboto', label: 'Roboto', preview: 'font-sans' },
  ]
  
 