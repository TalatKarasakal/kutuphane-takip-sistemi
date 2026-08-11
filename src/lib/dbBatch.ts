export const DB_BATCH_SIZE = 500;

export async function runInChunks<T>(
  items: readonly T[],
  operation: (chunk: T[]) => Promise<unknown>,
  size = DB_BATCH_SIZE,
): Promise<void> {
  for (let offset = 0; offset < items.length; offset += size) {
    await operation(items.slice(offset, offset + size));
  }
}
