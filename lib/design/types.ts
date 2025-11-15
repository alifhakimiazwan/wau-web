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
  shape: BlockShape  // Predetermined by theme, not user-customizable
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
    blockShape?: BlockShape  // Default shape for buttons and products (user can customize)
    cardBackgroundColor?: string  // Background color for individual product cards (predetermined by theme)
    cardShadow?: boolean  // Whether product cards should have shadow (predetermined by theme)
    showBanner?: boolean  // Whether to show banner behind profile picture (predetermined by theme)
    layout?: 'default' | 'hero' | 'bento'  // Layout style: default, hero with background image, or bento with horizontal card
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

  export const DEFAULT_DESIGN: DesignCustomization = {
    themeId: "original",
    fontFamily: "DM Sans",
    colors: {
      primary: "#FFFFFF",
      accent: "#1e2ed4",
    },
    blockShape: "square",  // Matches Original theme
    buttonConfig: DEFAULT_BUTTON_CONFIG,
  };

  export const AVAILABLE_THEMES: DesignTheme[] = [
    {
      id: 'original',
      name: 'Original',
      description: 'Simple and authentic profile showcase',
      preview: 'bg-white text-gray-900',
      colors: {
        background: '#FFFFFF',
        accent: '#1e2ed4',
      },
      thumbnail: '/themes/wau2.webp',
      fontFamily: 'DM Sans',
      buttonStyle: 'filled',
      blockShape: 'square',  // Square buttons and products
      avatar: {
        effect: 'none',
        shape: 'pill',  // Fully rounded avatar
      },
      layout: 'default',
    },
    {
      id: 'eclipse',
      name: 'Eclipse',
      description: 'Dark theme with gradient overlay',
      preview: 'bg-gradient-to-b from-transparent to-black text-white',
      colors: {
        background: '#000000',
        accent: '#FFFFFF',
      },
      thumbnail: '/themes/wau1.webp',
      fontFamily: 'Poppins',
      buttonStyle: 'filled',
      blockShape: 'rounded',
      cardBackgroundColor: '#EDEDED',  // Gray-800 for product cards
      avatar: {
        effect: 'none',
        shape: 'pill',
      },
      layout: 'hero',
    },
    {
      id: 'lavendar_dream',
      name: 'Lavendar Dream',
      description: 'Purple theme perfect for dreamers',
      preview: 'bg-gray-800 text-white',
      colors: {
        background: '#FFFFFF',
        accent: '#B427FF',
      },
      thumbnail: '/themes/wau5.webp',
      fontFamily: 'DM Sans',
      buttonStyle: 'outlined',
      blockShape: 'rounded',
      cardShadow: true, 
      avatar: {
        effect: 'none',
        shape: 'pill',
      },
      layout: 'hero',
    },
    {
      id: 'wellness',
      name: 'Wellness',
      description: 'Soft, professional theme for wellness and lifestyle',
      preview: 'bg-stone-100 text-gray-900',
      colors: {
        background: '#FFF6EB',
        accent: '#114a09',
      },
      thumbnail: '/themes/wau3.webp',
      fontFamily: 'Playfair Display',
      buttonStyle: 'filled',
      blockShape: 'pill',
      showBanner: true,  // Show banner behind profile picture
      avatar: {
        effect: 'none',
        shape: 'pill',
      },
      layout: 'default',
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
      thumbnail: '/themes/wau4.webp',
      blockShape: 'pill',
      avatar: {
        effect: 'none',
        shape: 'rounded',
      },
      layout: 'bento',
    },
  ]
  
  export const AVAILABLE_FONTS = [
    { value: 'DM Sans', label: 'DM Sans', preview: 'font-sans' },
    { value: 'Geist Sans', label: 'Geist Sans', preview: 'font-sans' },
    { value: 'Poppins', label: 'Poppins', preview: 'font-sans' },
    { value: 'Space Grotesk', label: 'Space Grotesk', preview: 'font-mono' },
    { value: 'Playfair Display', label: 'Playfair Display', preview: 'font-serif' },
    { value: 'Stratford Serial', label: 'Stratford Serial', preview: 'font-serif' },
    { value: 'Montserrat', label: 'Montserrat', preview: 'font-sans' },
    { value: 'Roboto', label: 'Roboto', preview: 'font-sans' },
  ]
  
 