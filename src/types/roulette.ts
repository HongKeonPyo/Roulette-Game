export interface RouletteItem {
  id: string;
  text: string;
  weight: number; // Raw weight or percentage
  color: string;
  textColor?: string;
  disabled?: boolean;
}

export type VisualMode = 'proportional' | 'equal';
export type ProbabilityMode = 'percentage' | 'weight';

export interface SpinResult {
  id: string;
  timestamp: number;
  item: RouletteItem;
  probability: number; // Expected probability (0 to 1)
  spinDuration: number;
}

export interface RoulettePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  visualMode: VisualMode;
  items: Omit<RouletteItem, 'id'>[];
}
