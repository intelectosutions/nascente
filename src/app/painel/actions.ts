"use server";

import { revalidatePath } from "next/cache";
import { parseSpreadsheet } from "@/lib/parser";
import { applySync, previewSync } from "@/lib/sync";
import { ensurePropertyForSlug } from "@/lib/property";
import { getFarm } from "@/lib/farms";
import { saveBalance } from "@/lib/balance";
import { sendPushToAll } from "@/lib/push";

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
  const farm = getFarm(slug)!;
  await sendPushToAll(
    `${farm.nome} — rebanho atualizado`,
    `${res.newCount} novos · ${res.updatedCount} atualizados · ${res.exitedCount} saídos`,
    `/f/${slug}`
  );
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
    m0_2: num("m0_2"), f0_2: num("f0_2"),
    m3_8: num("m3_8"), f3_8: num("f3_8"),
    m9_12: num("m9_12"), f9_12: num("f9_12"),
    m13_24: num("m13_24"), f13_24: num("f13_24"),
    m25_36: num("m25_36"), f25_36: num("f25_36"),
    m37plus: num("m37plus"), f37plus: num("f37plus"),
  };
  const total = Object.values(values).reduce((a, b) => a + b, 0);

  const property = await ensurePropertyForSlug(slug);
  await saveBalance(property.id, values);
  const farm = getFarm(slug)!;
  await sendPushToAll(`${farm.nome} — saldo atualizado`, `Total de ${total} animais`, `/f/${slug}`);
  revalidatePath("/");
  revalidatePath(`/f/${slug}`);
  revalidatePath(`/painel/${slug}`);
  return { ok: true, message: `Saldo salvo! Total de ${total} animais.`, total };
}
