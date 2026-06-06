import * as React from "react";
import { cn } from "@/lib/utils";

export function TicketStub({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "relative bg-[hsl(var(--card))] ink-border shadow-stamp",
        className,
      )}
    >
      {children}
    </div>
  );
}