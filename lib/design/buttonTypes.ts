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