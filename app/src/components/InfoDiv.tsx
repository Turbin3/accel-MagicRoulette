import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function InfoDiv({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "border border-primary rounded-sm px-1 py-2 flex flex-col gap-2 bg-primary/10 items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}
