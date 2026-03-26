export const WRESTLING_DIVISIONS = ['Raw', 'SmackDown', 'NXT', 'Evolve'] as const;

export type WrestlingDivision = (typeof WRESTLING_DIVISIONS)[number];

export function normalizeDivision(showName: string | null): WrestlingDivision {
  if (!showName) return 'Evolve';
  const normalized = showName.toLowerCase().trim();
  if (normalized.includes('raw')) return 'Raw';
  if (normalized.includes('smackdown') || normalized.includes('smack down')) return 'SmackDown';
  if (normalized.includes('nxt')) return 'NXT';
  return 'Evolve';
}
