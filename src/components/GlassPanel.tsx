import type { ReactNode } from 'react';

/**
 * A frosted glass card: backdrop-blur over whatever is behind it (the page background,
 * the FlowRibbon, product photography), plus a soft diagonal sheen that drifts slowly
 * across the surface -- a moving highlight *inside* the glass rather than just a lit edge,
 * meant to read as light actually passing through/reflecting off the panel. Defined in
 * index.css (.glass-panel / .glass-panel::before) so the blur, border, shadow and sheen
 * colors can flip with the light/dark theme via CSS custom properties.
 */
export default function GlassPanel({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={`glass-panel rounded-2xl ${className}`}>{children}</Tag>;
}
