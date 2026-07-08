"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DownloadAllButton({
  action,
  courseName,
  count,
}: {
  action: () => Promise<void>;
  courseName: string;
  count: number;
}) {
  return (
    <form action={action}>
      <Button
        type="submit"
        size="sm"
        disabled={count === 0}
        onClick={() => toast.success(`Baixando ${count} arquivo(s) para Materiais/${courseName}/`)}
      >
        Baixar {count} arquivo(s)
      </Button>
    </form>
  );
}
