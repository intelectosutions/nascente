"use server";

import { revalidatePath } from "next/cache";
import { parseSpreadsheet } from "@/lib/parser";
import { applySync, previewSync } from "@/lib/sync";
import { getNascenteProperty } from "@/lib/property";

export type UploadResult = {
  ok: boolean;
  message: string;
  preview?: { toInsert: number; toUpdate: number; toExit: number; unchanged: number };
  warnings?: string[];
};

export async function uploadPlanilha(formData: FormData): Promise<UploadResult> {
  const file = formData.get("planilha");
  if (!(file instanceof File)) return { ok: false, message: "Nenhum arquivo enviado." };
  const buf = Buffer.from(await file.arrayBuffer());
  const parsed = parseSpreadsheet(buf);
  if (parsed.rows.length === 0) {
    return { ok: false, message: "Não consegui ler nenhum animal da planilha.", warnings: parsed.warnings };
  }
  const property = await getNascenteProperty();
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
  revalidatePath("/animais");
  revalidatePath("/painel");
  return {
    ok: true,
    message: `Pronto! ${res.newCount} novos, ${res.updatedCount} atualizados, ${res.exitedCount} saídos.`,
    warnings: parsed.warnings,
  };
}
