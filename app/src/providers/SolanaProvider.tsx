"use client";

import {
  UnifiedWalletProvider,
  ConnectionProvider,
} from "@jup-ag/wallet-adapter";
import { ReactNode } from "react";
import { CLUSTER } from "@/lib/client/solana";
import { toast } from "sonner";
import { RpcType, useSettings } from "./SettingsProvider";
import { clusterApiUrl } from "@solana/web3.js";

const metadata = {
  name: "Magic Roulette",
  description: "Perpetual roulette game on Solana",
  url: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL as string,
  iconUrls: [`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/favicon.ico`],
};

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { rpcType, customRpcUrl } = useSettings();

  const defaultEndpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(CLUSTER);

  return (
    <ConnectionProvider
      endpoint={
        rpcType === RpcType.Default
          ? defaultEndpoint
          : customRpcUrl !== ""
          ? customRpcUrl
          : defaultEndpoint
      }
    >
      <UnifiedWalletProvider
        // no need to pass wallets, modern browser wallets will be auto-detected
        wallets={[]}
        config={{
          autoConnect: true,
          env: CLUSTER,
          metadata,
          notificationCallback: {
            onConnect: (props) => {
              toast.success(`Connected to wallet ${props.shortAddress}`);
            },
            onConnecting: (props) => {
              toast.message(`Connecting to ${props.walletName}`);
            },
            onDisconnect: (props) => {
              toast.message(`Disconnected from wallet ${props.shortAddress}`);
            },
            onNotInstalled: (props) => {
              toast.error(
                `${props.walletName} Wallet is not installed. Please go to the provider website to download.`
              );
            },
          },
          walletlistExplanation: {
            href: "https://station.jup.ag/docs/old/additional-topics/wallet-list",
          },
          theme: "jupiter",
        }}
      >
        {children}
      </UnifiedWalletProvider>
    </ConnectionProvider>
  );
}
