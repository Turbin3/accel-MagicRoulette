"use client";

import { BetsProvider } from "@/providers/BetsProvider";
import { useProgram } from "@/providers/ProgramProvider";
import { RoundProvider } from "@/providers/RoundProvider";
import { useTable } from "@/providers/TableProvider";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { BN } from "@coral-xyz/anchor";
import { Spinner } from "@/components/ui/spinner";
import { TableInfo } from "@/components/TableInfo";
import { RoundInfo } from "@/components/RoundInfo";

function Main() {
  return (
    <section className="flex flex-col gap-8 py-8">
      <TableInfo />
      <RoundInfo />
    </section>
  );
}

export default function Page() {
  const { magicRouletteClient } = useProgram();
  const { publicKey } = useUnifiedWallet();
  const { tableData, tableLoading } = useTable();

  if (tableLoading) {
    return (
      <section className="flex flex-col justify-center items-center flex-1">
        <Spinner className="size-10" />
      </section>
    );
  }

  return (
    tableData && (
      <RoundProvider
        pda={magicRouletteClient
          .getRoundPda(new BN(Number(tableData.currentRoundNumber)))
          .toBase58()}
      >
        <BetsProvider player={publicKey ? publicKey.toBase58() : undefined}>
          <Main />
        </BetsProvider>
      </RoundProvider>
    )
  );
}
