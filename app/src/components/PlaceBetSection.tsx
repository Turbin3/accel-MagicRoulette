"use client";

import { useBalance } from "@/providers/BalanceProvider";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { useTransaction } from "@/providers/TransactionProvider";
import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { useSettings } from "@/providers/SettingsProvider";
import { useProgram } from "@/providers/ProgramProvider";
import { toast } from "sonner";
import { buildTx } from "@/lib/client/solana";
import { sendTx } from "@/lib/api";
import { useBets } from "@/providers/BetsProvider";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { Input } from "./ui/input";
import { cn, parseLamportsToSol } from "@/lib/utils";
import { WalletMinimal } from "lucide-react";

const increments = [1, 0.1, 0.01];

export function PlaceBetSection() {
  const { balance } = useBalance();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useUnifiedWallet();
  const { priorityFee } = useSettings();
  const { magicRouletteClient } = useProgram();
  const { selectedBet, formattedBet } = useBets();
  const {
    isSendingTransaction,
    setIsSendingTransaction,
    showTransactionToast,
  } = useTransaction();
  const [betAmount, setBetAmount] = useState<number>(NaN);

  const isInsufficientBalance =
    balance === null || balance < betAmount * LAMPORTS_PER_SOL;
  const isAmountTooSmall = isNaN(betAmount) || betAmount <= 0;

  const placeBet = useCallback(
    (betAmount: string) => {
      toast.promise(
        async () => {
          if (!publicKey || !signTransaction) {
            throw new Error("Wallet not connected.");
          }

          if (!selectedBet) {
            throw new Error("No bet selected.");
          }

          let tx = await buildTx(
            connection,
            [
              await magicRouletteClient.placeBetIx({
                player: publicKey,
                betAmount: parseLamportsToSol(betAmount),
                betType: selectedBet,
              }),
            ],
            publicKey,
            [],
            priorityFee
          );

          tx = await signTransaction(tx);
          const signature = await sendTx(tx);

          return {
            signature,
          };
        },
        {
          loading: "Waiting for signature...",
          success: ({ signature }) => {
            return showTransactionToast("Bet place!", signature);
          },
          error: (err) => {
            console.error(err);
            setIsSendingTransaction(false);
            return err.message || "Something went wrong.";
          },
        }
      );
    },
    [
      connection,
      magicRouletteClient,
      priorityFee,
      publicKey,
      selectedBet,
      signTransaction,
      setIsSendingTransaction,
      showTransactionToast,
    ]
  );

  return (
    <section className="flex flex-col gap-2">
      <div className="border border-primary rounded-sm px-1 py-2 flex flex-col gap-2 bg-primary/10">
        <div className="flex items-center justify-between gap-4">
          {balance ? (
            <Button
              asChild
              className={cn(
                "px-1! group bg-transparent hover:bg-transparent focus:bg-transparent hover:text-primary cursor-pointer group-hover:text-primary rounded-xs active:bg-transparent py-[0.5px] h-fit text-sm font-semibold transition-colors",
                isInsufficientBalance
                  ? "text-destructive hover:text-destructive"
                  : "text-accent"
              )}
              onClick={() => setBetAmount(balance / LAMPORTS_PER_SOL)}
            >
              <div>
                <WalletMinimal size={16} />
                <p>{balance / LAMPORTS_PER_SOL} SOL</p>
              </div>
            </Button>
          ) : (
            <Skeleton className="h-5 max-w-30 w-full" />
          )}
          <div className="flex items-center gap-2 px-1">
            {increments.map((inc) => (
              <Button
                key={inc}
                variant="secondary"
                className="cursor-pointer rounded-xs h-6 w-12 py-2 px-4 text-xs font-semibold bg-primary"
                onClick={() =>
                  setBetAmount((prev) => {
                    return Number(
                      (isNaN(prev) ? 0 + inc : prev + inc).toFixed(9)
                    );
                  })
                }
              >
                +{inc}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-1">
            <Image
              alt="Solana"
              src={"/solana.svg"}
              width={0}
              height={0}
              className="size-5"
            />
            <span className="font-semibold text-primary">SOL</span>
          </div>
          <Input
            placeholder="1"
            type="number"
            step={0.1}
            min={0}
            className="no-slider text-end font-semibold text-2xl! placeholder:text-secondary/75 text-primary placeholder:font-semibold placeholder:text-2xl border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
            value={betAmount}
            onChange={(e) => {
              // removes leading zeroes
              e.target.value = parseFloat(e.target.value).toString();
              setBetAmount(parseFloat(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <p className="font-semibold text-secondary">Selected Bet</p>
        <p className="font-semibold text-primary">
          {formattedBet === "" ? "-" : formattedBet}
        </p>
      </div>
      <Button
        className="cursor-pointer rounded-full"
        onClick={() => placeBet(betAmount.toString())}
        disabled={
          isInsufficientBalance ||
          isAmountTooSmall ||
          selectedBet === null ||
          isSendingTransaction
        }
      >
        {isInsufficientBalance
          ? "Insufficient Balance"
          : isAmountTooSmall
          ? "Amount Too Small"
          : selectedBet === null
          ? "Bet Not Selected"
          : "Place Bet"}
      </Button>
    </section>
  );
}
