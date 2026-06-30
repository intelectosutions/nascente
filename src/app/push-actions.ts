"use server";

import { savePushSubscription, type PushSubJSON } from "@/lib/push";

export async function subscribeToPush(sub: PushSubJSON): Promise<{ ok: boolean }> {
  try {
    await savePushSubscription(sub);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
