export function cleanObject<T extends Record<string, any>>(obj: T): { [p: string]: any } {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => {
        if (v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
        return true;
      })
  );
}
