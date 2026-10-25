export const DEFAULT_PALETTE = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#A855F7', // Violet
];

export const VIBRANT_CASINO_PALETTE = [
  '#DC2626', // Crimson Red
  '#2563EB', // Royal Blue
  '#D97706', // Gold Amber
  '#059669', // Emerald
  '#7C3AED', // Royal Purple
  '#DB2777', // Fuchsia
  '#0284C7', // Sky Blue
  '#EA580C', // Tangerine
];

export const PASTEL_PALETTE = [
  '#60A5FA', // Soft Blue
  '#F87171', // Soft Red
  '#34D399', // Soft Mint
  '#FBBF24', // Soft Yellow
  '#A78BFA', // Soft Purple
  '#F472B6', // Soft Rose
  '#38BDF8', // Soft Sky
  '#FB923C', // Soft Coral
];

export function getContrastingTextColor(hexColor: string): '#FFFFFF' | '#0F172A' {
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#FFFFFF';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Relative luminance calculation according to WCAG 2.0
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#0F172A' : '#FFFFFF';
}

export function getColorForIndex(index: number, palette: string[] = DEFAULT_PALETTE): string {
  return palette[index % palette.length];
}
