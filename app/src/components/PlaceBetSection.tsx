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
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { Input } from "./ui/input";
import { cn, parseLamportsToSol, parseSolToLamports } from "@/lib/utils";
import { WalletMinimal } from "lucide-react";
import { BigRoundedButton } from "./BigRoundedButton";
import { InfoDiv } from "./InfoDiv";
import { useRound } from "@/providers/RoundProvider";
import { BN } from "@coral-xyz/anchor";
import { useTable } from "@/providers/TableProvider";

const increments = [1, 0.1, 0.01];

export function PlaceBetSection() {
  const { balance } = useBalance();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useUnifiedWallet();
  const { priorityFee } = useSettings();
  const { magicRouletteClient } = useProgram();
  const { tableData } = useTable();
  const { roundData, roundMutate, isRoundOver } = useRound();
  const { betsData, betsMutate, selectedBet, formattedBet } = useBets();
  const {
    isSendingTransaction,
    setIsSendingTransaction,
    showTransactionToast,
  } = useTransaction();
  const [betAmount, setBetAmount] = useState<number>(NaN);

  const isInsufficientBalance =
    balance === null || balance < betAmount * LAMPORTS_PER_SOL;
  const isBelowMinimumBet =
    isNaN(betAmount) ||
    betAmount <= 0 ||
    Number(tableData?.minimumBetAmount) > betAmount * LAMPORTS_PER_SOL;
  const placedBet = Boolean(
    betsData?.find((bet) => {
      return (
        bet.round === roundData?.publicKey &&
        bet.player === publicKey?.toBase58()
      );
    })
  );

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

          setIsSendingTransaction(true);

          let tx = await buildTx(
            connection,
            [
              await magicRouletteClient.placeBetIx({
                player: publicKey,
                betAmount: parseSolToLamports(betAmount),
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
            publicKey,
            selectedBet,
          };
        },
        {
          loading: "Waiting for signature...",
          success: async ({ signature, publicKey, selectedBet }) => {
            const amountInLamports = parseSolToLamports(betAmount).toString();

            await betsMutate((prev) => {
              if (!prev) {
                throw new Error("Bets should not be null.");
              }

              if (!roundData) {
                throw new Error("Round data should not be null.");
              }

              prev.push({
                publicKey: magicRouletteClient
                  .getBetPda(new PublicKey(roundData.publicKey), publicKey)
                  .toBase58(),
                amount: amountInLamports,
                betType: selectedBet,
                isClaimed: false,
                player: publicKey.toBase58(),
                round: roundData.publicKey,
              });

              return prev;
            });

            await roundMutate((prev) => {
              if (!prev) {
                throw new Error("Round should not be null.");
              }

              return {
                ...prev,
                poolAmount: new BN(prev.poolAmount)
                  .add(new BN(amountInLamports))
                  .toString(),
              };
            });

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
      roundData,
      signTransaction,
      setIsSendingTransaction,
      showTransactionToast,
      betsMutate,
      roundMutate,
    ]
  );

  return (
    <section className="flex flex-col gap-2">
      <InfoDiv>
        <div
          className={cn(
            "flex items-center gap-4 w-full",
            publicKey ? "justify-between" : "justify-end"
          )}
        >
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
            publicKey && <Skeleton className="h-5 max-w-40 w-full" />
          )}
          <div className="flex items-center gap-2 px-1">
            {increments.map((inc) => (
              <Button
                key={inc}
                variant="secondary"
                className="cursor-pointer rounded-xs h-6 w-12 py-2 px-4 text-xs font-semibold"
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
        <div className="flex items-center gap-4 w-full">
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
            inputMode="decimal"
            step={
              tableData
                ? Number(parseLamportsToSol(tableData?.minimumBetAmount))
                : 0.000001
            }
            min={
              tableData
                ? Number(parseLamportsToSol(tableData?.minimumBetAmount))
                : 0
            }
            className="no-slider text-end font-semibold text-2xl! placeholder:text-secondary/75 selection:bg-primary/20 selection:text-primary text-primary placeholder:font-semibold placeholder:text-2xl border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent!"
            value={isNaN(betAmount) ? "" : betAmount}
            onChange={(e) => {
              setBetAmount(parseFloat(e.target.value));
            }}
          />
        </div>
      </InfoDiv>
      <div className="flex justify-between">
        <p className="font-semibold text-secondary">Selected Bet</p>
        <p
          className={cn(
            "font-semibold",
            formattedBet === "" ? "text-primary" : "text-yellow-500"
          )}
        >
          {formattedBet === "" ? "-" : formattedBet}
        </p>
      </div>
      <BigRoundedButton
        onClick={() => placeBet(betAmount.toString())}
        disabled={
          isRoundOver ||
          placedBet ||
          selectedBet === null ||
          isBelowMinimumBet ||
          isInsufficientBalance ||
          isSendingTransaction
        }
      >
        {isRoundOver
          ? "Round Over"
          : placedBet
          ? "Bet Already Placed"
          : selectedBet === null
          ? "Bet Not Selected"
          : isBelowMinimumBet
          ? tableData
            ? `Minimum Bet: ${parseLamportsToSol(
                tableData?.minimumBetAmount
              )} SOL`
            : "Amount Too Low"
          : isInsufficientBalance
          ? "Insufficient Balance"
          : "Place Bet"}
      </BigRoundedButton>
    </section>
  );
}
