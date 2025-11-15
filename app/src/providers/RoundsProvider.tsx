"use client";

import { parseBN, ParsedRound, Round } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import useSWR, { KeyedMutator } from "swr";
import { useTable } from "./TableProvider";
import { BN } from "@coral-xyz/anchor";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useProgram } from "./ProgramProvider";
import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { parseLamportsToSol, timestampToMilli } from "@/lib/utils";
import { useTime } from "./TimeProvider";
import { useBets } from "./BetsProvider";
import { isWinner, payoutMultiplier } from "@/lib/betType";
import { toast } from "sonner";

interface RoundsContextType {
  roundsData: ParsedRound[] | undefined;
  roundsLoading: boolean;
  roundsMutate: KeyedMutator<ParsedRound[]>;
  roundEndsInSecs: number;
  isRoundOver: boolean;
  currentRound: ParsedRound | null;
  lastRoundOutcome: number | null;
}

const RoundsContext = createContext<RoundsContextType>({} as RoundsContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/rounds`;

export function useRounds() {
  return useContext(RoundsContext);
}

export function RoundsProvider({
  children,
  roundNumber,
  isSpun,
  isClaimed,
}: {
  children: ReactNode;
  roundNumber?: number;
  isSpun?: boolean;
  isClaimed?: boolean;
}) {
  const {
    data: roundsData,
    isLoading: roundsLoading,
    mutate: roundsMutate,
  } = useSWR(
    { apiEndpoint, roundNumber, isSpun, isClaimed },
    async ({ apiEndpoint, roundNumber, isSpun, isClaimed }) => {
      const newUrl = new URL(apiEndpoint);

      if (roundNumber) {
        newUrl.searchParams.append("roundNumber", roundNumber.toString());
      }

      if (isSpun) {
        newUrl.searchParams.append("isSpun", isSpun.toString());
      }

      if (isClaimed) {
        newUrl.searchParams.append("isClaimed", isClaimed.toString());
      }

      return (await wrappedFetch(newUrl.href)).rounds as ParsedRound[];
    }
  );
  const { tableData, tableMutate } = useTable();
  const { betsData } = useBets();
  const { magicRouletteClient } = useProgram();
  const { publicKey } = useUnifiedWallet();
  const { connection } = useConnection();
  const { time } = useTime();

  const roundEndsInSecs = useMemo(() => {
    return tableData
      ? timestampToMilli(Number(tableData.nextRoundTs)) - time.getTime()
      : Infinity;
  }, [tableData, time]);

  const isRoundOver = roundEndsInSecs <= 0;

  const isNotFirstRound =
    tableData && new BN(tableData.currentRoundNumber).gtn(1);

  const currentRound =
    roundsData && isNotFirstRound
      ? roundsData.find(
          (round) => round.roundNumber === tableData.currentRoundNumber
        ) || null
      : null;

  const lastRoundOutcome = useMemo(() => {
    if (roundsData && isNotFirstRound) {
      const lastRoundNumber = new BN(tableData.currentRoundNumber).subn(1);

      const lastRoundAcc = roundsData.find((round) => {
        return round.roundNumber === parseBN(lastRoundNumber);
      });

      // if this scope is reached, lastRoundAcc must exist
      return lastRoundAcc!.outcome;
    } else {
      return null;
    }
  }, [tableData, roundsData, isNotFirstRound]);

  const handleRoundChange = useCallback(
    async (acc: AccountInfo<Buffer<ArrayBufferLike>>) => {
      const round = magicRouletteClient.program.coder.accounts.decode<Round>(
        "round",
        acc.data
      );

      if (!round.isSpun) {
        // pool amount has changed
        await roundsMutate((prev) => {
          if (!prev) {
            throw new Error("Rounds should not be null.");
          }

          return prev.map((r) => {
            if (r.roundNumber === parseBN(round.roundNumber)) {
              return {
                ...r,
                poolAmount: parseBN(round.poolAmount),
              };
            }

            return r;
          });
        });
      } else if (round.outcome !== null) {
        if (publicKey && currentRound) {
          const roundPlayerBet = betsData?.find((bet) => {
            return bet.round === currentRound.publicKey;
          });

          if (roundPlayerBet) {
            const hasWon = isWinner(roundPlayerBet.betType, round.outcome);

            if (hasWon) {
              const amountWonInLamports = new BN(roundPlayerBet.amount).muln(
                payoutMultiplier(roundPlayerBet.betType)
              );
              const amountWonInSol = parseLamportsToSol(
                amountWonInLamports.toString()
              );

              toast.success(
                <p>
                  You won{" "}
                  <span className="text-yellow-500">{amountWonInSol} SOL</span>{" "}
                  from round #{parseBN(round.roundNumber)}!
                </p>
              );
            }
          }
        }

        const newRoundNumber = round.roundNumber.addn(1);

        await tableMutate((prev) => {
          if (!prev) {
            throw new Error("Table should not be null.`");
          }

          return {
            ...prev,
            currentRoundNumber: parseBN(newRoundNumber),
            nextRoundTs: parseBN(
              new BN(prev.nextRoundTs).add(new BN(prev.roundPeriodTs))
            ),
          };
        });

        const newRoundPda = magicRouletteClient.getRoundPda(newRoundNumber);

        await roundsMutate(
          (prev) => {
            if (!prev) return prev;

            const rounds = prev.map((r) => {
              if (r.roundNumber === parseBN(round.roundNumber)) {
                return {
                  ...r,
                  outcome: round.outcome,
                };
              }

              return r;
            });

            return [
              ...rounds,
              {
                publicKey: newRoundPda.toBase58(),
                roundNumber: parseBN(newRoundNumber),
                isSpun: false,
                outcome: null,
                poolAmount: "0",
              },
            ];
          },
          {
            revalidate: false,
          }
        );
      }
    },
    [
      magicRouletteClient,
      publicKey,
      betsData,
      currentRound,
      roundsMutate,
      tableMutate,
    ]
  );

  useEffect(() => {
    if (!currentRound) return;

    const id = connection.onAccountChange(
      new PublicKey(currentRound.publicKey),
      (acc) => handleRoundChange(acc)
    );

    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection, currentRound, handleRoundChange]);

  return (
    <RoundsContext.Provider
      value={{
        roundsData,
        roundsLoading,
        roundsMutate,
        roundEndsInSecs,
        isRoundOver,
        currentRound,
        lastRoundOutcome,
      }}
    >
      {children}
    </RoundsContext.Provider>
  );
}
