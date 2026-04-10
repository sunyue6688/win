import { useState, useEffect } from 'react'
import { BREAKPOINTS } from '../styles/theme'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Hook to detect current screen size breakpoint.
 * Uses BREAKPOINTS from theme.ts as the single source of truth.
 *
 * isMobile: < 768px (aligned with index.css mobile breakpoint)
 * isTablet: 768px ~ 1023px
 * isDesktop: >= 1024px
 */
export function useMediaQuery(): {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
} {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  let breakpoint: Breakpoint = 'xl'
  if (width < BREAKPOINTS.md) breakpoint = 'sm'
  else if (width < BREAKPOINTS.lg) breakpoint = 'md'
  else if (width < BREAKPOINTS.xl) breakpoint = 'lg'

  return {
    breakpoint,
    isMobile: width < BREAKPOINTS.md,   // < 768px
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,  // 768 ~ 1023
    isDesktop: width >= BREAKPOINTS.lg, // >= 1024px
  }
}

/**
 * Returns responsive gridTemplateColumns based on screen size.
 * @param desktop - grid columns for desktop (>= 1024px)
 * @param tablet  - grid columns for tablet (768 ~ 1023px), defaults to '1fr 1fr'
 * @param mobile  - grid columns for mobile (< 768px), defaults to '1fr'
 */
export function useResponsiveGrid(
  desktop: string,
  tablet?: string,
  mobile?: string,
): string {
  const { isMobile, isTablet } = useMediaQuery()
  if (isMobile) return mobile ?? '1fr'
  if (isTablet) return tablet ?? '1fr 1fr'
  return desktop
}
