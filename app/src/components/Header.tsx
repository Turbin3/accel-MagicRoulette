"use client";

import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { SettingsDropdown } from "./SettingsDropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

function WrappedTabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:dark:bg-primary data-[state=active]:dark:text-primary-foreground"
    >
      {children}
    </TabsTrigger>
  );
}

function WrappedTabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <TabsContent
      value={value}
      className="flex flex-col gap-4 mt-4 flex-1 overflow-y-auto"
    >
      {children}
    </TabsContent>
  );
}

const betTypesPayout = [
  {
    betType: "Straight Up",
    multiplier: "35:1",
  },
  {
    betType: "Split",
    multiplier: "17:1",
  },
  {
    betType: "Street",
    multiplier: "11:1",
  },
  {
    betType: "Corner",
    multiplier: "8:1",
  },
  {
    betType: "Five Number",
    multiplier: "6:1",
  },
  {
    betType: "Line",
    multiplier: "5:1",
  },
  {
    betType: "Column",
    multiplier: "2:1",
  },
  {
    betType: "Dozen",
    multiplier: "2:1",
  },
  {
    betType: "Red or Black",
    multiplier: "1:1",
  },
  {
    betType: "Even or Odd",
    multiplier: "1:1",
  },
  {
    betType: "Low or High",
    multiplier: "1:1",
  },
];

export function Header() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <header className="flex w-full items-center justify-between p-4 bg-primary h-20">
      <div className="flex items-center gap-6">
        <Link className="flex gap-2 items-center" href={"/"}>
          <LifeBuoy />
          <h1 className="font- text-2xl">Magic Roulette</h1>
        </Link>
        <div className="flex gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              className={cn(
                "cursor-pointer font-semibold text-secondary hover:text-foreground transition-all",
                open ? "text-foreground" : ""
              )}
            >
              How It Works
            </DialogTrigger>
            <DialogContent className="border-2 border-foreground h-[600px] max-h-[70vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-xl">How It Works</DialogTitle>
              </DialogHeader>
              <Tabs
                defaultValue="about"
                className="flex-1 flex flex-col overflow-hidden"
              >
                <TabsList className="w-full shrink-0">
                  <WrappedTabsTrigger value="about">About</WrappedTabsTrigger>
                  <WrappedTabsTrigger value="bets">Bets</WrappedTabsTrigger>
                  <WrappedTabsTrigger value="payout">Payout</WrappedTabsTrigger>
                </TabsList>
                <WrappedTabsContent value="about">
                  <p>
                    Every round, players can place bets on various outcomes,
                    such as specific numbers, colors, or ranges.
                  </p>
                  <p>
                    Once the betting phase ends, the roulette is spun and the
                    winning outcome is decided using a verifiable randomness
                    function (VRF).
                  </p>
                  <p>
                    Players who placed bets on the winning outcome can claim
                    their winnings based on predefined odds.
                  </p>
                </WrappedTabsContent>
                <WrappedTabsContent value="bets">
                  <p>
                    During the betting phase of each round, players can place
                    bets on a variety of outcomes including:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Straight Up: 0-36, 00</li>
                    <li>Split: Two adjacent numbers</li>
                    <li>Street: Three numbers in a row</li>
                    <li>Corner: Four numbers in a square</li>
                    <li>Five Number: 0, 00, 1, 2, 3</li>
                    <li>Line: Six numbers in two rows</li>
                    <li>Column: All 12 numbers in a column</li>
                    <li>Dozen: First (1-12), Second (13-24), Third (25-36)</li>
                    <li>Red or Black</li>
                    <li>Even or Odd</li>
                    <li>Low or High</li>
                  </ul>
                </WrappedTabsContent>
                <WrappedTabsContent value="payout">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] font-semibold">
                          Bet Type
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Multiplier
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {betTypesPayout.map((bet) => (
                        <TableRow key={bet.betType}>
                          <TableCell className="font-medium">
                            {bet.betType}
                          </TableCell>
                          <TableCell className="text-right">
                            {bet.multiplier}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p>Initial bet is refunded on top of winning payouts.</p>
                </WrappedTabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SettingsDropdown />
        <UnifiedWalletButton />
      </div>
    </header>
  );
}
