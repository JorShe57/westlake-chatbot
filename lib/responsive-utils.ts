// Responsive utilities for the Westlake Chatbot

// Breakpoints in pixels
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// Media query strings for use in styled-components or CSS-in-JS
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  
  // Max-width queries
  maxXs: `@media (max-width: ${breakpoints.xs - 1}px)`,
  maxSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
  max2xl: `@media (max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Device-specific queries
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
}

// Helper function to determine if the current viewport is mobile
export const isMobileViewport = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints.md
}

// Helper function to determine if the current device has touch capability
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Helper function to add responsive padding based on viewport size
export const getResponsivePadding = () => {
  if (typeof window === 'undefined') return 'px-4 sm:px-6 lg:px-8'
  
  const width = window.innerWidth
  
  if (width < breakpoints.sm) return 'px-4'
  if (width < breakpoints.lg) return 'px-6'
  return 'px-8'
}

// Helper function to get grid columns based on viewport size
export const getResponsiveGridCols = (mobile = 1, tablet = 2, desktop = 3) => {
  if (typeof window === 'undefined') return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
  
  const width = window.innerWidth
  
  if (width < breakpoints.md) return `grid-cols-${mobile}`
  if (width < breakpoints.lg) return `grid-cols-${tablet}`
  return `grid-cols-${desktop}`
}

// Helper function to add responsive margin based on viewport size
export const getResponsiveMargin = () => {
  if (typeof window === 'undefined') return 'mx-4 sm:mx-6 lg:mx-8'
  
  const width = window.innerWidth
  
  if (width < breakpoints.sm) return 'mx-4'
  if (width < breakpoints.lg) return 'mx-6'
  return 'mx-8'
}

// Helper function to get responsive font sizes
export const getResponsiveFontSize = (base: string, sm: string, lg: string) => {
  return `text-${base} sm:text-${sm} lg:text-${lg}`
}

// Common responsive class combinations
export const responsiveClasses = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-20',
  heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
  subheading: 'text-lg sm:text-xl lg:text-2xl',
  paragraph: 'text-base sm:text-lg',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8',
  flexCol: 'flex flex-col sm:flex-row',
  buttonGroup: 'flex flex-col sm:flex-row gap-4',
}