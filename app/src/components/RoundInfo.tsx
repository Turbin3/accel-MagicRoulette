"use client";

import { useTable } from "@/providers/TableProvider";
import { Skeleton } from "./ui/skeleton";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { formatCountdown, milliToTimestamp } from "@/lib/utils";
import { useRound } from "@/providers/RoundProvider";
import { Button } from "./ui/button";
import { useProgram } from "@/providers/ProgramProvider";
import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { BN } from "@coral-xyz/anchor";
import { buildTx } from "@/lib/client/solana";
import { useSettings } from "@/providers/SettingsProvider";
import { sendTx } from "@/lib/api";
import { toast } from "sonner";
import { TransactionToast } from "./TransactionToast";
import { InfoText } from "./InfoText";

export function RoundInfo() {
  const { magicRouletteClient } = useProgram();
  const { priorityFee, getTransactionLink } = useSettings();
  const { publicKey, signTransaction } = useUnifiedWallet();
  const { connection } = useConnection();
  const { tableData, tableLoading } = useTable();
  const { lastRoundOutcome, hasRoundEnded, roundEndsInSecs } = useRound();
  const { roundData, roundLoading } = useRound();
  const [isSendingTransaction, setIsSendingTransaction] = useState<boolean>(false);

  if (!tableLoading && !tableData) {
    throw new Error("Table is not initialized.");
  }

  const spinRoulette = useCallback(async () => {
    toast.promise(
      async () => {
        if (!publicKey || !signTransaction) {
          throw new Error("Wallet not connected.");
        }

        if (!tableData) {
          throw new Error("Table is not initialized.");
        }

        setIsSendingTransaction(true);

        const currentRoundPda = magicRouletteClient.getRoundPda(new BN(tableData.currentRoundNumber));
        const newRoundPda = magicRouletteClient.getRoundPda(new BN(tableData.currentRoundNumber).addn(1));

        let tx = await buildTx(
          connection,
          [await magicRouletteClient.spinRouletteIx({
            payer: publicKey,
            currentRound: currentRoundPda,
            newRound: newRoundPda,
          })],
          publicKey,
          [],
          priorityFee,
        );

        tx = await signTransaction(tx);
        const signature = await sendTx(tx);

        return {
          signature
        }
      },
      {
        loading: "Waiting for signature...",
        success: async ({ signature }) => {
          setIsSendingTransaction(false);

          return (
            <TransactionToast
              title="Roulette spun!"
              link={getTransactionLink(signature)}
            />
          )
        },
        error: (err) => {
          console.error(err);
          setIsSendingTransaction(false);
          return err.message || 'Something went wrong.';
        },
      }
    )
  }, [publicKey, tableData, connection, magicRouletteClient, priorityFee, signTransaction, getTransactionLink]);

  return (
    <section className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md">
      <h2 className="text-xl">Round Info</h2>
      <div className="flex flex-col">
        <InfoText>
          <p className="text-start">Current Round:</p>
          {tableLoading ? (
            <Skeleton className="w-8 h-4" />
          ) : tableData && (
            <span className="text-end">{tableData.currentRoundNumber}</span>
          )}
        </InfoText>
        <InfoText>
          <p className="text-start">Pool Amount:</p>
          {roundLoading ? (
            <Skeleton className="w-24 h-4" />
          ) : roundData && (
            <span className="text-end">{Number(roundData.poolAmount) / LAMPORTS_PER_SOL} SOL</span>
          )}
        </InfoText>
        <InfoText>
          <p className="text-start">Last Round Outcome:</p>
          <span className="text-end">{lastRoundOutcome !== null ? lastRoundOutcome : "-"}</span>
        </InfoText>
      </div>
      <Button className="cursor-pointer" onClick={spinRoulette} disabled={!tableData || isSendingTransaction || !hasRoundEnded}>
        {hasRoundEnded
            ? 'Spin Roulette'
            : `Round ends in ${formatCountdown(milliToTimestamp(roundEndsInSecs))}`}
      </Button>
    </section>
  )
}