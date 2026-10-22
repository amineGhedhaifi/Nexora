import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
}

export function StatCard({ label, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
        </div>
        <span className="flex-shrink-0 grid size-10 sm:size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5 sm:size-6" aria-hidden="true" />
        </span>
      </div>
      {change && changeType && (
        <div className="mt-3 sm:mt-4 flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium whitespace-nowrap flex items-center gap-1",
              changeType === "increase" && "text-success",
              changeType === "decrease" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground",
            )}
          >
            {changeType === "increase" && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
            {changeType === "decrease" && <ArrowDownRight className="size-3.5" aria-hidden="true" />}
            {change}
          </span>
          <span className="text-sm text-muted-foreground whitespace-nowrap">vs last month</span>
        </div>
      )}
    </div>
  );
}

import { ArrowUpRight, ArrowDownRight } from "lucide-react";