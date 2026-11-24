import * as React from "react";
import { cn } from "@/lib/utils/format";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
}

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  const styles = {
    default: "border-border bg-muted/50 text-foreground",
    destructive: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
