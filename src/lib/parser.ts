import * as XLSX from "xlsx";
import { parseBRDate } from "./dates";

export type ParsedAnimal = {
  nSisbov: string;
  nManejo: string | null;
  sexo: string | null;
  raca: string | null;
  dataNasc: Date | null;
  dataBrincagem: Date | null;
  dataEnvioSisbov: Date | null;
  dataLibAbate: Date | null;
};

export type ParseResult = {
  rows: ParsedAnimal[];
  warnings: string[];
  totalRowsInSheet: number;
  sheetName: string;
};

const HEADER_ALIASES: Record<keyof ParsedAnimal, string[]> = {
  nSisbov: ["n. sisbov", "n sisbov", "nº sisbov", "sisbov", "numero sisbov"],
  nManejo: ["n. manejo", "n manejo", "nº manejo", "manejo"],
  sexo: ["sexo"],
  raca: ["raça", "raca"],
  dataNasc: ["data nasc.", "data nascimento", "data de nascimento", "nascimento"],
  dataBrincagem: ["data brincagem", "data de brincagem", "brincagem"],
  dataEnvioSisbov: ["data envio sisbov", "envio sisbov", "data envio"],
  dataLibAbate: ["data lib. abate", "data liberacao abate", "lib. abate", "data lib abate"],
};

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function mapHeaders(headerRow: unknown[]): Partial<Record<keyof ParsedAnimal, number>> {
  const map: Partial<Record<keyof ParsedAnimal, number>> = {};
  headerRow.forEach((h, idx) => {
    if (typeof h !== "string") return;
    const n = norm(h);
    for (const [key, aliases] of Object.entries(HEADER_ALIASES) as [keyof ParsedAnimal, string[]][]) {
      if (aliases.some((a) => norm(a) === n)) {
        map[key] = idx;
      }
    }
  });
  return map;
}

export function parseSpreadsheet(buffer: ArrayBuffer | Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  if (raw.length < 2) {
    return { rows: [], warnings: ["Planilha vazia ou sem cabeçalho."], totalRowsInSheet: 0, sheetName };
  }
  const headerMap = mapHeaders(raw[0]);
  const required: (keyof ParsedAnimal)[] = ["nSisbov", "dataBrincagem", "dataEnvioSisbov"];
  const missing = required.filter((r) => headerMap[r] === undefined);
  if (missing.length > 0) {
    return {
      rows: [],
      warnings: [`Colunas obrigatórias ausentes no cabeçalho: ${missing.join(", ")}`],
      totalRowsInSheet: raw.length - 1,
      sheetName,
    };
  }

  const rows: ParsedAnimal[] = [];
  const warnings: string[] = [];

  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r || r.every((c) => c === null || c === undefined || c === "")) continue;
    const get = (k: keyof ParsedAnimal) => {
      const idx = headerMap[k];
      return idx === undefined ? null : r[idx];
    };
    const sisbov = get("nSisbov");
    if (!sisbov) {
      warnings.push(`Linha ${i + 1}: sem N. Sisbov, ignorada.`);
      continue;
    }
    const animal: ParsedAnimal = {
      nSisbov: String(sisbov).trim(),
      nManejo: get("nManejo") ? String(get("nManejo")).trim() : null,
      sexo: get("sexo") ? String(get("sexo")).trim().toUpperCase() : null,
      raca: get("raca") ? String(get("raca")).trim() : null,
      dataNasc: parseBRDate(get("dataNasc") as string | Date | null),
      dataBrincagem: parseBRDate(get("dataBrincagem") as string | Date | null),
      dataEnvioSisbov: parseBRDate(get("dataEnvioSisbov") as string | Date | null),
      dataLibAbate: parseBRDate(get("dataLibAbate") as string | Date | null),
    };
    if (!animal.dataBrincagem || !animal.dataEnvioSisbov) {
      warnings.push(`SISBOV ${animal.nSisbov}: data brincagem ou envio sisbov inválida.`);
    }
    rows.push(animal);
  }

  return { rows, warnings, totalRowsInSheet: raw.length - 1, sheetName };
}
