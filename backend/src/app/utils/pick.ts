export function pickFields<T, K extends keyof T>(source: Partial<T>, fields: K[]): Partial<T> {
  const result: Partial<T> = {};
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  });
  return result;
}
