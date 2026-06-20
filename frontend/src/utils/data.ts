/**
 * Converts the backend's columnar array format (list of value arrays)
 * into an array of row objects keyed by column name.
 * A synthetic `id` field (row index) is added for use as DataTable row key.
 */
export function toRowObjects(
  columns: string[],
  data: unknown[][],
): Record<string, unknown>[] {
  return data.map((cells, index) => {
    const row: Record<string, unknown> = { id: index };
    columns.forEach((col, i) => {
      row[col] = cells[i] ?? null;
    });
    return row;
  });
}
