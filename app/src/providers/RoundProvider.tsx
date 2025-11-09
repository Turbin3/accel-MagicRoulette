'use client';

import { ParsedRound, parseRound, Round } from '@/types/accounts';
import { wrappedFetch } from '@/lib/api';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useProgram } from './ProgramProvider';
import { useTable } from './TableProvider';
import { useConnection } from "@jup-ag/wallet-adapter";
import { BN } from '@coral-xyz/anchor';
import { timestampToMilli } from '@/lib/utils';
import { useTime } from '@/hooks/useTime';

interface RoundContextType {
  roundData: ParsedRound | undefined;
  roundLoading: boolean;
  roundMutate: KeyedMutator<ParsedRound>;
  lastRoundOutcome: number | null;
  hasRoundEnded: boolean;
  roundEndsInSecs: number;
}

const RoundContext = createContext<RoundContextType>({} as RoundContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/rounds`;

export function useRound() {
  return useContext(RoundContext);
}

export function RoundProvider({
  children,
  pda,
}: {
  children: ReactNode;
  pda: string;
}) {
  const {
    data: roundData,
    isLoading: roundLoading,
    mutate: roundMutate,
  } = useSWR({ apiEndpoint, pda }, async ({ apiEndpoint, pda }) => {
    return (await wrappedFetch(`${apiEndpoint}?pda=${pda}`)).round as ParsedRound;
  });
  const { tableData, tableMutate } = useTable();
  const { magicRouletteClient } = useProgram();
  const { connection } = useConnection();
  const [lastRoundOutcome, setLastRoundOutcome] = useState<number | null>(null);
  const time = useTime();

  const roundEndsInSecs = useMemo(() => {
    return tableData
      ? timestampToMilli(Number(tableData.nextRoundTs)) - time.getTime()
      : Infinity
  }, [tableData, time]);

  const hasRoundEnded = roundEndsInSecs <= 0;

  const handleRoundOutcome = useCallback(async (acc: AccountInfo<Buffer<ArrayBufferLike>>, id: number) => {
    const round = magicRouletteClient.program.coder.accounts.decode<Round>('round', acc.data);

    if (round.outcome) {
      setLastRoundOutcome(round.outcome);

      await tableMutate(
        (prev) => {
          if (!prev) {
            throw new Error("Table should not be null");
          }

          return {
            ...prev,
            currentRoundNumber: (Number(prev.currentRoundNumber) + 1).toString(),
            nextRoundTs: (Number(prev.nextRoundTs) + Number(prev.roundPeriodTs)).toString(),
          }
        }
      );

      connection.removeAccountChangeListener(id);
    }
  }, [connection, magicRouletteClient, tableMutate]);

  // initial fetch of last round outcome
  useEffect(() => {
    (async () => {
      if (tableData && lastRoundOutcome === null) {
        const lastRoundNumber = new BN(tableData.currentRoundNumber).subn(1);
        const lastRoundPda = magicRouletteClient.getRoundPda(lastRoundNumber);
        const lastRoundAcc = await magicRouletteClient.fetchProgramAccount(lastRoundPda, "round", parseRound);

        if (!lastRoundAcc) {
          throw new Error("Last round account not found");
        }

        setLastRoundOutcome(lastRoundAcc.outcome);
      }
    })();
  }, [tableData, magicRouletteClient, lastRoundOutcome])

  useEffect(() => {
    let id: number;

    if (roundData && hasRoundEnded) {
      id = connection.onAccountChange(new PublicKey(roundData.publicKey), (acc) => handleRoundOutcome(acc, id));
    }

    return () => {
      connection.removeAccountChangeListener(id);
    }
  }, [connection, roundData, handleRoundOutcome, hasRoundEnded]);


  return (
    <RoundContext.Provider
      value={{
        roundData,
        roundLoading,
        roundMutate,
        lastRoundOutcome,
        hasRoundEnded,
        roundEndsInSecs,
      }}
    >
      {children}
    </RoundContext.Provider>
  );
}
