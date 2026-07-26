function getValue(obj: any, path: string) {
  return path.split(".").reduce((o, p) => o?.[p], obj);
}

function deepDiff(
  current: any,
  original: any,
  path: string = "",
  opaquePaths: Set<string> = new Set(),
): any {
  if (opaquePaths.has(path)) {
    return JSON.stringify(current) == JSON.stringify(original) ? undefined : current;
  }

  if (
    current === null ||
    original === null ||
    typeof current !== "object" ||
    typeof original !== "object"
  ) {
    return current == original ? undefined : current;
  }

  if (Array.isArray(current)) {
    return JSON.stringify(current) == JSON.stringify(original)
      ? undefined
      : current;
  }

  const result: Record<string, any> = {};

  for (const key of Object.keys(current)) {
    const childPath = path ? `${path}.${key}` : key;
    const d = deepDiff(current[key], original[key], childPath, opaquePaths);
    if (d !== undefined) {
      result[key] = d;
    }
  }

  return Object.keys(result).length ? result : undefined;
}

function flattenChanges(
  obj: any,
  prefix = "",
  opaquePaths: Set<string> = new Set(),
): Array<{ key: string; val: any }> {
  const changes: Array<{ key: string; val: any }> = [];

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (opaquePaths.has(path)) {
      const finalKey = path.startsWith("options.") ? path : `ruleset.${path}`;
      changes.push({ key: finalKey, val: value });
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      changes.push(...flattenChanges(value, path, opaquePaths));
    } else {
      const finalKey = path.startsWith("options.") ? path : `ruleset.${path}`;
      changes.push({ key: finalKey, val: value });
    }
  }

  return changes;
}

function shallowEqual<T extends Record<string, unknown>>(
  a: T,
  b: T,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

export class TrackedDoc<T extends Record<string, any>> {
  #original: T;
  #opaquePaths: Set<string>;

  constructor(private working: T, opaquePaths: string[] = []) {
    this.#original = JSON.parse(JSON.stringify(working));
    this.#opaquePaths = new Set(opaquePaths);
  }

  get baseline(): T {
    return this.#original;
  }

  reset(data: T): void {
    this.#original = structuredClone(data);
    for (const key of Object.keys(this.working)) {
      if (!(key in data)) {
        delete (this.working as any)[key];
      }
    }
    Object.assign(this.working, data);
  }

  commit(): void {
    this.#original = JSON.parse(JSON.stringify(this.working));
  }

  getChanges(): Array<{ key: string; val: any }> {
    const diff = deepDiff(this.working, this.#original, "", this.#opaquePaths) ?? {};
    return flattenChanges(diff, "", this.#opaquePaths);
  }

  isFieldDirty(path: string): boolean {
    return getValue(this.working, path) !== getValue(this.#original, path);
  }

  shallowSavedEquals(other: Record<string, unknown>): boolean {
    return shallowEqual(this.#original, other as Record<string, unknown>);
  }
}
