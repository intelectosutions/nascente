import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "nascente_painel";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function hashPassword(p: string): string {
  return createHash("sha256").update(p).digest("hex");
}

export function getPainelPassword(): string {
  const p = process.env.PAINEL_PASSWORD;
  if (!p) throw new Error("PAINEL_PASSWORD não configurada");
  return p;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const expected = hashPassword(getPainelPassword());
    const c = (await cookies()).get(COOKIE_NAME)?.value;
    if (!c) return false;
    const a = Buffer.from(c, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function signIn(password: string): Promise<boolean> {
  if (password !== getPainelPassword()) return false;
  const c = await cookies();
  c.set(COOKIE_NAME, hashPassword(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return true;
}

export async function signOut() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
