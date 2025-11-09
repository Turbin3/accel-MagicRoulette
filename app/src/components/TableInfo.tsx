"use client";

import { useTable } from "@/providers/TableProvider";
import { InfoText } from "./InfoText";
import { Skeleton } from "./ui/skeleton";
import { formatDuration } from "@/lib/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function TableInfo() {
  const { tableData, tableLoading } = useTable();

  return (
    <section className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md">
      <h2 className="text-xl">Table Info</h2>
      <div className="flex flex-col">
        <InfoText>
          <p className="text-start">Minimum Bet Amount:</p>
          {tableLoading ? (
            <Skeleton className="w-24 h-4" />
          ) : (
            tableData && (
              <span className="text-end">
                {Number(tableData.minimumBetAmount) / LAMPORTS_PER_SOL} SOL
              </span>
            )
          )}
        </InfoText>
        <InfoText>
          <p className="text-start">Round Period:</p>
          {tableLoading ? (
            <Skeleton className="w-24 h-4" />
          ) : (
            tableData && (
              <span className="text-end">
                {formatDuration(Number(tableData.roundPeriodTs))}
              </span>
            )
          )}
        </InfoText>
      </div>
    </section>
  );
}
