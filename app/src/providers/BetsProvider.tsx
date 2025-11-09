"use client";

import { ParsedBet } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import { createContext, ReactNode, useContext } from "react";
import useSWR, { KeyedMutator } from "swr";

interface BetsContextType {
  betsData: ParsedBet[] | undefined;
  betsLoading: boolean;
  betsMutate: KeyedMutator<ParsedBet[]>;
}

const BetsContext = createContext<BetsContextType>({} as BetsContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/bets`;

export function useBets() {
  return useContext(BetsContext);
}

export function BetsProvider({
  children,
  roundPda,
  player,
}: {
  children: ReactNode;
  roundPda?: string;
  player?: string;
}) {
  const {
    data: betsData,
    isLoading: betsLoading,
    mutate: betsMutate,
  } = useSWR(
    { apiEndpoint, roundPda, player },
    async ({ apiEndpoint, roundPda, player }) => {
      const newUrl = new URL(apiEndpoint);

      if (roundPda) {
        newUrl.searchParams.append("round", roundPda);
      }

      if (player) {
        newUrl.searchParams.append("player", player);
      }

      return (await wrappedFetch(newUrl.href)).bets as ParsedBet[];
    }
  );

  return (
    <BetsContext.Provider
      value={{
        betsData,
        betsLoading,
        betsMutate,
      }}
    >
      {children}
    </BetsContext.Provider>
  );
}
