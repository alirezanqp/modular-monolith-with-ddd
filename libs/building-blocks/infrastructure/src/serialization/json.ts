export function serialize(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val instanceof Date) {
      return { __type: 'Date', value: val.toISOString() };
    }
    return val;
  });
}

export function deserialize<T>(json: string): T {
  return JSON.parse(json, (_key, val) => {
    if (val && typeof val === 'object' && val.__type === 'Date') {
      return new Date(val.value);
    }
    return val;
  }) as T;
}
