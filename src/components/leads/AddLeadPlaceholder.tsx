import { PlusIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";

type AddLeadPlaceholderProps = {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function AddLeadPlaceholder({
  className = "",
  variant = "primary",
}: AddLeadPlaceholderProps) {
  return (
    <Button
      aria-label="Add lead placeholder"
      className={`gap-2 ${className}`}
      type="button"
      variant={variant}
    >
      <PlusIcon aria-hidden="true" size={20} weight="regular" />
      Add Lead
    </Button>
  );
}
