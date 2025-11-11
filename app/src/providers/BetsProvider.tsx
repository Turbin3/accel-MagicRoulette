"use client";

import { BetType, ParsedBet } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import useSWR, { KeyedMutator } from "swr";

interface BetsContextType {
  betsData: ParsedBet[] | undefined;
  betsLoading: boolean;
  betsMutate: KeyedMutator<ParsedBet[]>;
  selectedBet: BetType | null;
  setSelectedBet: Dispatch<SetStateAction<BetType | null>>;
  formattedBet: string;
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
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);

  const formattedBet = useMemo(() => {
    if (!selectedBet) return "";

    if ("straightUp" in selectedBet) {
      const number = selectedBet.straightUp?.number;
      return `Straight: ${number === 37 ? "00" : number}`;
    } else if ("split" in selectedBet) {
      return `Split: ${selectedBet.split?.numbers.join("-")}`;
    } else if ("street" in selectedBet) {
      return `Street: ${selectedBet.street?.numbers.join("-")}`;
    } else if ("corner" in selectedBet) {
      return `Corner: ${selectedBet.corner?.numbers.join("-")}`;
    } else if ("fiveNumber" in selectedBet) {
      return "Five Number";
    } else if ("line" in selectedBet) {
      return `Line: ${selectedBet.line?.numbers.join("-")}`;
    } else if ("column" in selectedBet) {
      return `Column: ${selectedBet.column?.column}`;
    } else if ("dozen" in selectedBet) {
      return `Dozen: ${selectedBet.dozen?.dozen}`;
    } else if ("red" in selectedBet) {
      return "Red";
    } else if ("black" in selectedBet) {
      return "Black";
    } else if ("even" in selectedBet) {
      return "Even";
    } else if ("odd" in selectedBet) {
      return "Odd";
    } else if ("high" in selectedBet) {
      return "High";
    } else if ("low" in selectedBet) {
      return "Low";
    } else {
      throw new Error("Invalid bet type.");
    }
  }, [selectedBet]);

  return (
    <BetsContext.Provider
      value={{
        betsData,
        betsLoading,
        betsMutate,
        selectedBet,
        setSelectedBet,
        formattedBet,
      }}
    >
      {children}
    </BetsContext.Provider>
  );
}
