"use server";

import { revalidatePath } from "next/cache";
import { parseSpreadsheet } from "@/lib/parser";
import { applySync, previewSync } from "@/lib/sync";
import { ensurePropertyForSlug } from "@/lib/property";
import { getFarm } from "@/lib/farms";
import { saveBalance } from "@/lib/balance";

export type UploadResult = {
  ok: boolean;
  message: string;
  preview?: { toInsert: number; toUpdate: number; toExit: number; unchanged: number };
  warnings?: string[];
};

export async function uploadPlanilha(formData: FormData): Promise<UploadResult> {
  const slug = String(formData.get("slug") || "");
  if (!getFarm(slug)) return { ok: false, message: "Fazenda inválida." };

  const file = formData.get("planilha");
  if (!(file instanceof File)) return { ok: false, message: "Nenhum arquivo enviado." };
  const buf = Buffer.from(await file.arrayBuffer());
  const parsed = parseSpreadsheet(buf);
  if (parsed.rows.length === 0) {
    return { ok: false, message: "Não consegui ler nenhum animal da planilha.", warnings: parsed.warnings };
  }

  const property = await ensurePropertyForSlug(slug);
  const diff = await previewSync(property.id, parsed.rows);
  const apply = String(formData.get("apply") || "") === "1";
  if (!apply) {
    return {
      ok: true,
      message: `Pré-visualização: ${parsed.rows.length} animais na planilha.`,
      preview: {
        toInsert: diff.toInsert.length,
        toUpdate: diff.toUpdate.length,
        toExit: diff.toExit.length,
        unchanged: diff.unchanged,
      },
      warnings: parsed.warnings,
    };
  }
  const res = await applySync(property.id, parsed.rows, file.name);
  revalidatePath("/");
  revalidatePath(`/f/${slug}`);
  revalidatePath(`/painel/${slug}`);
  return {
    ok: true,
    message: `Pronto! ${res.newCount} novos, ${res.updatedCount} atualizados, ${res.exitedCount} saídos.`,
    warnings: parsed.warnings,
  };
}

export type SaveBalanceResult = { ok: boolean; message: string; total?: number };

export async function saveBalanceAction(formData: FormData): Promise<SaveBalanceResult> {
  const slug = String(formData.get("slug") || "");
  if (!getFarm(slug)) return { ok: false, message: "Fazenda inválida." };

  const num = (k: string) => {
    const n = Number(String(formData.get(k) || "0").replace(/\D/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const values = {
    age0_2: num("age0_2"),
    age3_8: num("age3_8"),
    age9_12: num("age9_12"),
    age13_24: num("age13_24"),
    age25_36: num("age25_36"),
    age37plus: num("age37plus"),
  };
  const total = Object.values(values).reduce((a, b) => a + b, 0);

  const property = await ensurePropertyForSlug(slug);
  await saveBalance(property.id, values);
  revalidatePath("/");
  revalidatePath(`/f/${slug}`);
  revalidatePath(`/painel/${slug}`);
  return { ok: true, message: `Saldo salvo! Total de ${total} animais.`, total };
}
