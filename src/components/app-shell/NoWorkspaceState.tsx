import { SignOutIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "./SignOutButton";

type NoWorkspaceStateProps = {
  error?: string;
};

export function NoWorkspaceState({ error }: NoWorkspaceStateProps) {
  return (
    <main className="min-h-screen bg-[var(--ops-main-bg)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center justify-center">
        <Card className="w-full p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
            <SignOutIcon aria-hidden="true" size={24} weight="duotone" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-[var(--ops-text)]">
            No workspace found
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--ops-text-soft)]">
            Ask an admin to invite you or create a workspace in the next setup
            step.
          </p>
          {error ? (
            <p className="mx-auto mt-4 max-w-lg rounded-lg bg-[var(--ops-danger-soft)] p-3 text-sm leading-6 text-[var(--ops-danger)]">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center">
            <SignOutButton variant="secondary" />
          </div>
        </Card>
      </div>
    </main>
  );
}
