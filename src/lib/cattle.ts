import { daysBetween, monthsBetween } from "./dates";

export const AGE_BUCKETS = [
  { key: "0-12", label: "0 a 12 meses", min: 0, max: 12 },
  { key: "13-24", label: "13 a 24 meses", min: 13, max: 24 },
  { key: "25-36", label: "25 a 36 meses", min: 25, max: 36 },
  { key: "37+", label: "Mais de 36 meses", min: 37, max: Infinity },
] as const;

export type AgeBucketKey = (typeof AGE_BUCKETS)[number]["key"];

export const SALE_RELEASE_DAYS = 52;
export const FARM_TENURE_DAYS = 90;

export function ageInMonths(dataNasc: Date, ref: Date = new Date()): number {
  return monthsBetween(dataNasc, ref);
}

export function ageBucket(dataNasc: Date, ref: Date = new Date()): AgeBucketKey {
  const m = ageInMonths(dataNasc, ref);
  for (const b of AGE_BUCKETS) {
    if (m >= b.min && m <= b.max) return b.key;
  }
  return "37+";
}

export function daysSinceBrincagem(dataBrincagem: Date, ref: Date = new Date()): number {
  return daysBetween(dataBrincagem, ref);
}

export function daysSinceEnvioSisbov(dataEnvioSisbov: Date, ref: Date = new Date()): number {
  return daysBetween(dataEnvioSisbov, ref);
}

export function isReleasedForSale(dataBrincagem: Date, ref: Date = new Date()): boolean {
  return daysSinceBrincagem(dataBrincagem, ref) >= SALE_RELEASE_DAYS;
}

export function isOver90DaysOnFarm(dataEnvioSisbov: Date, ref: Date = new Date()): boolean {
  return daysSinceEnvioSisbov(dataEnvioSisbov, ref) >= FARM_TENURE_DAYS;
}

export type Animal = {
  nSisbov: string;
  nManejo: string;
  dataNasc: Date;
  dataBrincagem: Date;
  dataEnvioSisbov: Date;
  dataLibAbate: Date;
  sexo: string;
  raca: string;
};

export type DashboardStats = {
  total: number;
  releasedForSale: number;
  over90Days: number;
  byAge: Record<AgeBucketKey, number>;
  generatedAt: Date;
};

export function computeStats(animals: Animal[], ref: Date = new Date()): DashboardStats {
  const byAge: Record<AgeBucketKey, number> = {
    "0-12": 0,
    "13-24": 0,
    "25-36": 0,
    "37+": 0,
  };
  let releasedForSale = 0;
  let over90Days = 0;
  for (const a of animals) {
    byAge[ageBucket(a.dataNasc, ref)]++;
    if (isReleasedForSale(a.dataBrincagem, ref)) releasedForSale++;
    if (isOver90DaysOnFarm(a.dataEnvioSisbov, ref)) over90Days++;
  }
  return { total: animals.length, releasedForSale, over90Days, byAge, generatedAt: ref };
}
