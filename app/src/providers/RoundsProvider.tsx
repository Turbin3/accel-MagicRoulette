"use client";

import { ParsedRound } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import { createContext, ReactNode, useContext } from "react";
import useSWR, { KeyedMutator } from "swr";

interface RoundsContextType {
  roundsData: ParsedRound[] | undefined;
  roundsLoading: boolean;
  roundsMutate: KeyedMutator<ParsedRound[]>;
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

  return (
    <RoundsContext.Provider
      value={{
        roundsData,
        roundsLoading,
        roundsMutate,
      }}
    >
      {children}
    </RoundsContext.Provider>
  );
}
