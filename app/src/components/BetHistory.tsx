"use client";

import { useBets } from "@/providers/BetsProvider";
import { useSettings } from "@/providers/SettingsProvider";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "./ui/button";
import { useTransaction } from "@/providers/TransactionProvider";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  Gem,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { useProgram } from "@/providers/ProgramProvider";
import { buildTx } from "@/lib/client/solana";
import { useRounds } from "@/providers/RoundsProvider";
import { sendTx } from "@/lib/api";
import { isWinner, payoutMultiplier } from "@/lib/betType";
import { cn, formatBetType, parseLamportsToSol } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { EmptyWallet } from "./EmptyWallet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Skeleton } from "./ui/skeleton";
import { parseBN } from "@/types/accounts";

type BetHistoryRecord = {
  publicKey: string;
  round: string;
  amount: string;
  betType: string;
  outcome: number;
  hasWon: boolean;
  claimable: boolean;
  payout: string;
};

enum FilterValue {
  All = "all",
  Won = "won",
  Lost = "lost",
  Claimable = "claimable",
}

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: FilterValue.All, label: "All" },
  { value: FilterValue.Won, label: "Won" },
  { value: FilterValue.Lost, label: "Lost" },
  { value: FilterValue.Claimable, label: "Claimable" },
];

function SrSpan({ text }: { text: string }) {
  return <span className="sr-only">{text}</span>;
}

function PaginationButton({
  className = "",
  onClick,
  disabled = false,
  children,
}: {
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("size-8 cursor-pointer", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

function SortButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="hover:text-primary hover:bg-transparent dark:hover:bg-transparent cursor-pointer flex items-center gap-2"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SortIcon({ column }: { column: Column<BetHistoryRecord, unknown> }) {
  return column.getIsSorted() === "asc" ? (
    <ArrowUp className="size-4" />
  ) : column.getIsSorted() === "desc" ? (
    <ArrowDown className="size-4" />
  ) : (
    <ArrowUpDown className="size-4" />
  );
}

export function BetHistory() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useUnifiedWallet();
  const { magicRouletteClient } = useProgram();
  const { roundsData, roundsLoading } = useRounds();
  const { betsData, betsLoading, betsMutate } = useBets();
  const { getAccountLink, priorityFee } = useSettings();
  const {
    isSendingTransaction,
    setIsSendingTransaction,
    showTransactionToast,
  } = useTransaction();
  const [filter, setFilter] = useState<FilterValue>(FilterValue.All);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "round", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const claimableBets = useMemo(() => {
    if (!betsData || !roundsData) return [];

    return betsData.filter((bet) => {
      const matchingRound = roundsData.find(
        (round) => round.publicKey === bet.round
      );

      if (!matchingRound) {
        return false;
      }

      return isWinner(bet.betType, matchingRound.outcome) && !bet.isClaimed;
    });
  }, [betsData, roundsData]);

  const claimableAmount = useMemo(() => {
    return claimableBets
      ? claimableBets.reduce((amount, bet) => {
          return amount.add(new BN(bet.amount));
        }, new BN(0))
      : new BN(0);
  }, [claimableBets]);

  const netPnL = useMemo(() => {
    if (!betsData || !roundsData) return new BN(0);

    return betsData.reduce((total, bet) => {
      const matchingRound = roundsData.find(
        (round) => round.publicKey === bet.round
      );

      if (!matchingRound) {
        return total;
      }

      // exclude bets pending outcome
      if (matchingRound.outcome === null) {
        return total;
      }

      if (isWinner(bet.betType, matchingRound.outcome)) {
        const payout = new BN(bet.amount).muln(payoutMultiplier(bet.betType));
        return total.add(payout);
      } else {
        return total.sub(new BN(bet.amount));
      }
    }, new BN(0));
  }, [roundsData, betsData]);

  const data = useMemo<BetHistoryRecord[]>(() => {
    if (!roundsData || !betsData) return [];

    return betsData
      .map((bet) => {
        const matchingRound = roundsData.find(
          (round) => round.publicKey === bet.round
        );

        const hasWon = isWinner(bet.betType, matchingRound!.outcome);

        return {
          publicKey: bet.publicKey,
          round: matchingRound!.roundNumber,
          amount: parseLamportsToSol(bet.amount),
          betType: formatBetType(bet.betType),
          outcome: matchingRound!.outcome!,
          hasWon,
          claimable: hasWon && !bet.isClaimed,
          payout: hasWon
            ? parseBN(new BN(bet.amount).muln(payoutMultiplier(bet.betType)))
            : "",
        };
      })
      .filter((bet) => {
        switch (filter) {
          case FilterValue.Claimable:
            return bet.claimable;
          case FilterValue.Won:
            return bet.hasWon;
          case FilterValue.Lost:
            return !bet.hasWon;
          default:
            return true;
        }
      });
  }, [roundsData, betsData, filter]);

  const columns = useMemo<ColumnDef<BetHistoryRecord>[]>(
    () => [
      {
        accessorKey: "round",
        header: ({ column }) => {
          return (
            <SortButton onClick={() => column.toggleSorting()}>
              <span>Round</span>
              <SortIcon column={column} />
            </SortButton>
          );
        },
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <SortButton onClick={() => column.toggleSorting()}>
              <span>Amount (SOL)</span>
              <SortIcon column={column} />
            </SortButton>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const amountA = parseFloat(rowA.original.amount);
          const amountB = parseFloat(rowB.original.amount);
          return amountA - amountB;
        },
      },
      {
        accessorKey: "betType",
        header: "Bet Type",
        cell: ({ row }) => {
          const hasWon = row.original.hasWon;

          return (
            <span className={cn(hasWon && "text-yellow-500 font-semibold")}>
              {row.original.betType}
            </span>
          );
        },
      },
      {
        accessorKey: "outcome",
        header: "Outcome",
        cell: ({ row }) => {
          const hasWon = row.original.hasWon;

          return (
            <span className={cn(hasWon && "text-yellow-500 font-semibold")}>
              {row.original.outcome ?? "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "payout",
        header: ({ column }) => {
          return (
            <SortButton onClick={() => column.toggleSorting()}>
              <span>Payout (SOL)</span>
              <SortIcon column={column} />
            </SortButton>
          );
        },
        cell: ({ row }) => {
          const hasWon = row.original.hasWon;
          const payout = row.original.payout;

          return (
            <span className={cn(hasWon && "text-yellow-500 font-semibold")}>
              {payout ? parseLamportsToSol(payout) : "-"}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const payoutA = rowA.original.payout
            ? parseFloat(parseLamportsToSol(rowA.original.payout))
            : 0;
          const payoutB = rowB.original.payout
            ? parseFloat(parseLamportsToSol(rowB.original.payout))
            : 0;
          return payoutA - payoutB;
        },
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const claimWinnings = useCallback(() => {
    toast.promise(
      async () => {
        if (!publicKey || !signTransaction) {
          throw new Error("Wallet not connected.");
        }

        if (!roundsData || roundsData.length === 0) {
          throw new Error("No rounds have been played.");
        }

        if (
          !betsData ||
          betsData.length === 0 ||
          !claimableBets ||
          claimableBets.length === 0
        ) {
          throw new Error("No bets to claim.");
        }

        const roundAndBets = claimableBets.map((bet) => ({
          round: bet.round,
          bet: bet.publicKey,
        }));

        setIsSendingTransaction(true);

        let tx = await buildTx(
          connection,
          [
            await magicRouletteClient.claimWinningsIx({
              player: publicKey,
              roundAndBets,
            }),
          ],
          publicKey,
          [],
          priorityFee
        );

        tx = await signTransaction(tx);
        const signature = await sendTx(tx);

        return {
          signature,
          roundAndBets,
        };
      },
      {
        loading: "Waiting for signature...",
        success: async ({ signature, roundAndBets }) => {
          await betsMutate((prev) => {
            if (!prev) {
              throw new Error("Bets should not be null.");
            }

            return prev.map((bet) => {
              const claimedBet = roundAndBets.some(
                ({ bet: betPubkey }) => betPubkey === bet.publicKey
              );

              if (claimedBet) {
                return { ...bet, isClaimed: true };
              }

              return bet;
            });
          });

          return showTransactionToast("Winnings claimed!", signature);
        },
        error: (err) => {
          console.error(err);
          setIsSendingTransaction(false);
          return err.message || "Something went wrong.";
        },
      }
    );
  }, [
    betsData,
    connection,
    magicRouletteClient,
    publicKey,
    roundsData,
    priorityFee,
    claimableBets,
    signTransaction,
    setIsSendingTransaction,
    showTransactionToast,
    betsMutate,
  ]);

  return (
    <section className="w-full flex flex-col gap-4 justify-start">
      <div className="flex items-center gap-6 justify-between">
        <h2 className="text-2xl font-semibold">Bet History</h2>
        <div className="flex gap-4 items-center">
          {publicKey && (
            <p className="text-sm flex items-center gap-2">
              Net PnL:{" "}
              <span
                className={cn(
                  "font-semibold",
                  netPnL.gt(new BN(0))
                    ? "text-green-500"
                    : netPnL.eq(new BN(0))
                    ? "text-foreground"
                    : "text-red-400"
                )}
              >
                {roundsLoading || betsLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <>
                    {netPnL.gt(new BN(0))
                      ? "+"
                      : netPnL.eq(new BN(0))
                      ? ""
                      : "-"}
                    {parseLamportsToSol(netPnL.toString())} SOL
                  </>
                )}
              </span>
            </p>
          )}
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as FilterValue)}
          >
            <SelectTrigger className="w-fit min-w-[100px] cursor-pointer">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="cursor-pointer"
                disabled={
                  !publicKey ||
                  isSendingTransaction ||
                  claimableBets?.length === 0
                }
                onClick={claimWinnings}
              >
                <Gem />
                Claim Winnings
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Claimable:{" "}
              <span className="text-accent font-semibold">
                {claimableAmount.toNumber() / LAMPORTS_PER_SOL}
              </span>{" "}
              SOL
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="dark:hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer hover:bg-accent/10"
                onClick={() => {
                  window.open(getAccountLink(row.original.publicKey), "_blank");
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              {roundsLoading || betsLoading ? (
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full" />
                    ))}
                  </div>
                </TableCell>
              ) : (
                <TableCell colSpan={columns.length} className="text-center">
                  {publicKey ? <span>No results.</span> : <EmptyWallet />}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {table.getRowCount()} bet{table.getRowCount() > 1 ? "s" : ""}.
        </p>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                    className="cursor-pointer"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <PaginationButton
              className="hidden lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <SrSpan text="Go to first page" />
              <ChevronsLeft />
            </PaginationButton>
            <PaginationButton
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <SrSpan text="Go to previous page" />
              <ChevronLeft />
            </PaginationButton>
            <PaginationButton
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <SrSpan text="Go to next page" />
              <ChevronRight />
            </PaginationButton>
            <PaginationButton
              className="hidden lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <SrSpan text="Go to last page" />
              <ChevronsRight />
            </PaginationButton>
          </div>
        </div>
      </div>
    </section>
  );
}
