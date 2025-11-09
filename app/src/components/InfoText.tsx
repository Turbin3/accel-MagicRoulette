import { ReactNode } from "react";

export function InfoText({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-4 items-center text-nowrap justify-between">
      {children}
    </div>
  );
}
