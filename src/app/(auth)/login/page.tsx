import { Card } from "@/components/ui/Card";
import { getSupabaseEnvError, hasSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const envError =
    params.error === "supabase-env" || !hasSupabaseEnv()
      ? getSupabaseEnvError()
      : undefined;

  return (
    <main className="min-h-screen bg-[var(--ops-main-bg)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ops-primary)] text-sm font-bold text-white shadow-[0_12px_28px_var(--ops-primary-glow)]">
              OP
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--ops-text)]">
                OpsPilot
              </p>
              <p className="text-xs text-[var(--ops-text-soft)]">
                ServiceOps Command Center
              </p>
            </div>
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-[var(--ops-text)]">
            Manage leads, jobs, and follow-ups from one calm command center.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--ops-text-soft)]">
            Sign in to continue building the workspace foundation. Workspace
            loading and operational data arrive in later patches.
          </p>
        </section>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--ops-text)]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[var(--ops-text-soft)]">
            Sign in to manage your business operations.
          </p>
          <LoginForm envError={envError} />
        </Card>
      </div>
    </main>
  );
}
