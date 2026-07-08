"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ViewToggle({
  value,
  onChange,
}: {
  value: "list" | "grid";
  onChange: (value: "list" | "grid") => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant={value === "list" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onChange("list")}
        aria-label="Ver em lista"
      >
        <List />
      </Button>
      <Button
        type="button"
        variant={value === "grid" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onChange("grid")}
        aria-label="Ver em blocos"
      >
        <LayoutGrid />
      </Button>
    </div>
  );
}
