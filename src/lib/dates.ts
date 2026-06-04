import { parse, isValid } from "date-fns";

export function parseBRDate(input: string | Date | number | undefined | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  if (typeof input === "number") {
    const epoch = new Date(Math.round((input - 25569) * 86400 * 1000));
    return isValid(epoch) ? epoch : null;
  }
  const s = String(input).trim();
  if (!s) return null;
  const formats = ["dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd"];
  for (const f of formats) {
    const d = parse(s, f, new Date());
    if (isValid(d)) return d;
  }
  return null;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function monthsBetween(birth: Date, now: Date): number {
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}
