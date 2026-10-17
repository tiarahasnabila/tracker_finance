import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100 or higher
  variant?: "auto" | "success" | "warning" | "danger" | "default";
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  variant = "auto",
  size = "md",
  className,
  ...props
}: ProgressProps) {
  // Clamp display width to 100%
  const widthPercent = Math.min(Math.max(value, 0), 100);

  let barColor = "bg-emerald-500";

  if (variant === "auto") {
    if (value > 100) {
      barColor = "bg-rose-500";
    } else if (value >= 80) {
      barColor = "bg-amber-500";
    } else {
      barColor = "bg-emerald-500";
    }
  } else {
    const map = {
      default: "bg-slate-700",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-rose-500",
    };
    barColor = map[variant];
  }

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100",
        sizes[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          barColor
        )}
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
}
