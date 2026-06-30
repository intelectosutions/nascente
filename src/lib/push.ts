import webpush from "web-push";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contato@intelecto.solutions", pub, priv);
  configured = true;
  return true;
}

export type PushSubJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(sub: PushSubJSON) {
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return;
  const db = getDb();
  await db
    .insert(schema.pushSubscriptions)
    .values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoNothing();
}

export async function sendPushToAll(title: string, body: string, url = "/") {
  if (!ensureConfigured()) return;
  const db = getDb();
  const subs = await db.select().from(schema.pushSubscriptions);
  const payload = JSON.stringify({ title, body, url });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await db.delete(schema.pushSubscriptions).where(eq(schema.pushSubscriptions.endpoint, s.endpoint));
        }
      }
    })
  );
}
