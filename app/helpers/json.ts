/**
 * Log data cleaning, custom formatting and type assertion
 */

// Clean then custom format incoming log payload data (array of generated log sample attributes, one attribute per cell)

export function toJSONformat(arr: Array<string>): string {
  if (!Array.isArray(arr) || !arr.length) {
    return `{}`;
  }
  const b = arr.join('",\n\t"').replaceAll('=', '": "').replaceAll('sample#', '');
  return `{\n\t"${b}"\n}`;
}

// Build and typecast JSON object

export function parseJSON<T>(jsonFormatted: string): T {
  return JSON.parse(jsonFormatted) as T;
}
