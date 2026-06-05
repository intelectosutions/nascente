// Gera SQL de importação a partir de uma planilha .xlsx, reutilizando o parser oficial.
// Uso: npx tsx scripts/gen-import-sql.ts <arquivo.xlsx> <slug> [nome] [codigo]
// Emite o SQL no stdout. NÃO aplica nada — revise antes de rodar no banco.

import { readFileSync } from "node:fs";
import { parseSpreadsheet } from "../src/lib/parser";

function isoDate(d: Date | null): string {
  if (!d) return "NULL";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `'${y}-${m}-${day}'`;
}

function sq(v: string | null): string {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const [, , file, slug, nomeArg, codigoArg] = process.argv;
if (!file || !slug) {
  console.error("Uso: tsx scripts/gen-import-sql.ts <arquivo.xlsx> <slug> [nome] [codigo]");
  process.exit(1);
}

const buf = readFileSync(file);
const parsed = parseSpreadsheet(buf);

if (parsed.rows.length === 0) {
  console.error("Nenhuma linha lida. Avisos:\n" + parsed.warnings.join("\n"));
  process.exit(1);
}

const nome = nomeArg || slug;
const codigo = codigoArg || null;

const lines: string[] = [];
lines.push("BEGIN;");
lines.push(
  `INSERT INTO properties (slug, nome, codigo) VALUES (${sq(slug)}, ${sq(nome)}, ${sq(codigo)}) ON CONFLICT (slug) DO NOTHING;`
);

const values = parsed.rows.map((r) => {
  return `((SELECT id FROM properties WHERE slug=${sq(slug)}), ${sq(r.nSisbov)}, ${sq(r.nManejo)}, ${sq(r.sexo)}, ${sq(r.raca)}, ${isoDate(r.dataNasc)}, ${isoDate(r.dataBrincagem)}, ${isoDate(r.dataEnvioSisbov)}, ${isoDate(r.dataLibAbate)}, 'ATIVO')`;
});

lines.push(
  "INSERT INTO animals (property_id, n_sisbov, n_manejo, sexo, raca, data_nasc, data_brincagem, data_envio_sisbov, data_lib_abate, status) VALUES"
);
lines.push(values.join(",\n") + "\nON CONFLICT (property_id, n_sisbov) DO NOTHING;");

lines.push(
  `INSERT INTO upload_batches (property_id, filename, row_count, new_count, updated_count, exited_count) VALUES ((SELECT id FROM properties WHERE slug=${sq(slug)}), ${sq(file.split("/").pop() || "import")}, ${parsed.rows.length}, ${parsed.rows.length}, 0, 0);`
);
lines.push("COMMIT;");

console.error(`-- ${parsed.rows.length} animais lidos de ${file}`);
if (parsed.warnings.length) console.error(`-- ${parsed.warnings.length} avisos`);
console.log(lines.join("\n"));
