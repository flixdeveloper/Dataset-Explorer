export function isMonoColumn(col: string): boolean {
  const c = col.toLowerCase();
  return c.includes('id') || c.includes('date') || c.includes('time') || c.includes('code');
}

export function formatCell(value: unknown): string {
  if (value == null) return '—';
  return String(value);
}
