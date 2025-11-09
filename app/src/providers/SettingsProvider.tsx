"use client";

import { CLUSTER } from "@/lib/client/solana";
import { getExplorerLink } from "@/lib/utils";
import { CuPriceRange } from "@/types/transactions";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

enum Explorer {
  SolanaExplorer = "solana-explorer",
  Solscan = "solscan",
  SolanaFM = "solanaFM",
  Orb = "orb",
}

type PriorityFee = CuPriceRange;

export enum RpcType {
  Default = "default",
  Custom = "custom",
}

interface SettingsContextType {
  explorer: Explorer;
  setExplorer: (explorer: Explorer) => void;
  priorityFee: PriorityFee;
  setPriorityFee: (fee: PriorityFee) => void;
  rpcType: RpcType;
  setRpcType: (type: RpcType) => void;
  customRpcUrl: string;
  setCustomRpcUrl: (url: string) => void;
  getTransactionLink: (signature: string) => string;
  getAccountLink: (address: string) => string;
}

const SettingsContext = createContext<SettingsContextType>(
  {} as SettingsContextType
);

export function useSettings() {
  return useContext(SettingsContext);
}

const defaultSettings = {
  explorer: "solana-explorer" as Explorer,
  priorityFee: "low" as PriorityFee,
  rpcType: "default" as RpcType,
  customRpcUrl: "",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [explorer, setExplorer] = useState<Explorer>(() => {
    if (typeof window === "undefined") return defaultSettings.explorer;
    const saved = localStorage.getItem("explorer") as Explorer;
    return saved || defaultSettings.explorer;
  });

  const [priorityFee, setPriorityFee] = useState<PriorityFee>(() => {
    if (typeof window === "undefined") return defaultSettings.priorityFee;
    const saved = localStorage.getItem("priority-fee") as PriorityFee;
    return saved || defaultSettings.priorityFee;
  });

  const [rpcType, setRpcType] = useState<RpcType>(() => {
    if (typeof window === "undefined") return defaultSettings.rpcType;
    const saved = localStorage.getItem("rpc-type") as RpcType;
    return saved || defaultSettings.rpcType;
  });

  const [customRpcUrl, setCustomRpcUrl] = useState<string>(() => {
    if (typeof window === "undefined") return defaultSettings.customRpcUrl;
    const saved = localStorage.getItem("custom-rpc-url");
    return saved || defaultSettings.customRpcUrl;
  });

  useEffect(() => {
    localStorage.setItem("explorer", explorer);
  }, [explorer]);

  useEffect(() => {
    localStorage.setItem("priority-fee", priorityFee);
  }, [priorityFee]);

  useEffect(() => {
    localStorage.setItem("rpc-type", rpcType);
  }, [rpcType]);

  useEffect(() => {
    localStorage.setItem("custom-rpc-url", customRpcUrl);
  }, [customRpcUrl]);

  function getTransactionLink(signature: string): string {
    switch (explorer) {
      case "solana-explorer":
        return getExplorerLink("tx", signature, CLUSTER);
      case "solscan":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://solscan.io/tx/${signature}`;
          case "devnet":
            return `https://solscan.io/tx/${signature}?cluster=devnet`;
          case "testnet":
            return `https://solscan.io/tx/${signature}?cluster=testnet`;
        }
      case "solanaFM":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://solana.fm/tx/${signature}?cluster=mainnet-alpha`;
          case "devnet":
            return `https://solana.fm/tx/${signature}?cluster=devnet-alpha`;
          case "testnet":
            return `https://solana.fm/tx/${signature}?cluster=testnet-solana`;
        }
      case "orb":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://orb.helius.dev/tx/${signature}?cluster=mainnet-beta`;
          case "devnet":
            return `https://orb.helius.dev/tx/${signature}?cluster=devnet`;
          case "testnet":
            return `https://orb.helius.dev/tx/${signature}?cluster=testnet`;
        }
      default:
        throw new Error("Unsupported explorer.");
    }
  }

  function getAccountLink(address: string): string {
    switch (explorer) {
      case "solana-explorer":
        return getExplorerLink("address", address, CLUSTER);
      case "solscan":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://solscan.io/account/${address}`;
          case "devnet":
            return `https://solscan.io/account/${address}?cluster=devnet`;
          case "testnet":
            return `https://solscan.io/account/${address}?cluster=testnet`;
        }
      case "solanaFM":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://solana.fm/address/${address}?cluster=mainnet-alpha`;
          case "devnet":
            return `https://solana.fm/address/${address}?cluster=devnet-alpha`;
          case "testnet":
            return `https://solana.fm/address/${address}?cluster=testnet-solana`;
        }
      case "orb":
        switch (CLUSTER) {
          case "mainnet-beta":
            return `https://orb.helius.dev/address/${address}?cluster=mainnet-beta`;
          case "devnet":
            return `https://orb.helius.dev/address/${address}?cluster=devnet`;
          case "testnet":
            return `https://orb.helius.dev/address/${address}?cluster=testnet`;
        }
      default:
        throw new Error("Unsupported explorer.");
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        explorer,
        setExplorer,
        priorityFee,
        setPriorityFee,
        rpcType,
        setRpcType,
        customRpcUrl,
        setCustomRpcUrl,
        getTransactionLink,
        getAccountLink,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
