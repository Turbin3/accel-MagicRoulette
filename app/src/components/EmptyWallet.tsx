import { WalletMinimal } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";

export function EmptyWallet() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WalletMinimal />
        </EmptyMedia>
        <EmptyTitle>Connect Your Wallet</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
