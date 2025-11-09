"use client";

import { ParsedBet } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import { createContext, ReactNode, useContext } from "react";
import useSWR, { KeyedMutator } from "swr";

interface BetContextType {
  betData: ParsedBet | undefined;
  betLoading: boolean;
  betMutate: KeyedMutator<ParsedBet>;
}

const BetContext = createContext<BetContextType>({} as BetContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/bets`;

export function useBet() {
  return useContext(BetContext);
}

export function BetProvider({
  children,
  pda,
}: {
  children: ReactNode;
  pda: string;
}) {
  const {
    data: betData,
    isLoading: betLoading,
    mutate: betMutate,
  } = useSWR({ apiEndpoint, pda }, async ({ apiEndpoint, pda }) => {
    return (await wrappedFetch(`${apiEndpoint}?pda=${pda}`)).bet as ParsedBet;
  });

  return (
    <BetContext.Provider
      value={{
        betData,
        betLoading,
        betMutate,
      }}
    >
      {children}
    </BetContext.Provider>
  );
}
