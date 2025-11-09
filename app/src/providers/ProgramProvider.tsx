import { MagicRouletteClient } from "@/lib/magic-roulette-client";
import { useConnection } from "@jup-ag/wallet-adapter";
import { createContext, ReactNode, useContext, useMemo } from "react";

interface ProgramContextType {
  magicRouletteClient: MagicRouletteClient;
}

const ProgramContext = createContext<ProgramContextType>(
  {} as ProgramContextType
);

export function useProgram() {
  return useContext(ProgramContext);
}

export function ProgramProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();

  const magicRouletteClient = useMemo(
    () => new MagicRouletteClient(connection),
    [connection]
  );

  return (
    <ProgramContext.Provider
      value={{
        magicRouletteClient,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}
