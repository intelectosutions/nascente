import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  if (await isAuthenticated()) redirect("/painel");

  async function doLogin(formData: FormData) {
    "use server";
    const pwd = String(formData.get("password") || "");
    const ok = await signIn(pwd);
    if (!ok) redirect("/painel/login?error=1");
    redirect("/painel");
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold">Painel do produtor</h1>
      <p className="text-lg sm:text-xl text-muted">Digite a senha para acessar.</p>
      <form action={doLogin} className="flex flex-col gap-4">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="px-5 py-4 rounded-xl bg-surface ring-1 ring-white/20 text-xl outline-none focus:ring-accent"
          placeholder="Senha"
        />
        {sp.error && <div className="text-danger text-lg">Senha incorreta.</div>}
        <button className="px-6 py-4 rounded-xl bg-accent text-black font-bold text-xl">Entrar</button>
      </form>
    </div>
  );
}
