
export interface TradeEntry {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  amount: number; // Positive for profit, negative for loss
  notes?: string;
}

export interface DayWithTrade {
  date: string;
  amount: number;
  hasEntry: boolean;
}

export type ThemeType = 'light' | 'dark';
