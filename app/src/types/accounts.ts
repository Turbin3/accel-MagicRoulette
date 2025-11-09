import { BN, IdlAccounts, IdlTypes } from '@coral-xyz/anchor';
import { MagicRoulette } from './magic-roulette';
import { PublicKey, SystemProgram } from '@solana/web3.js';

// Denotes a bigint serialized as a string, JavaScript cannot natively represent 2^64-1
export type bigIntString = string;
type pubkey = string;
type u8 = number;
type u16 = number;
type u32 = number;
type u64 = bigIntString;
type i32 = number;
type i64 = bigIntString;
type Option<T> = T | null; 

type Table = IdlAccounts<MagicRoulette>['table'];
export type Round = IdlAccounts<MagicRoulette>['round'];
type Bet = IdlAccounts<MagicRoulette>['bet'];
export type BetType = IdlTypes<MagicRoulette>['betType'];

export interface ParsedProgramAccount {
  publicKey: string;
}

export interface ParsedTable extends ParsedProgramAccount {
  admin: pubkey;
  minimumBetAmount: u64;
  currentRoundNumber: u64;
  nextRoundTs: i64;
  roundPeriodTs: u64;
}

export interface ParsedRound extends ParsedProgramAccount {
  roundNumber: u64;
  poolAmount: u64;
  isSpun: boolean;
  outcome: Option<u8>;
}

export interface ParsedBet extends ParsedProgramAccount {
  player: pubkey;
  round: pubkey;
  amount: u64;
  betType: BetType;
  isClaimed: boolean;
}

function parsePublicKey(field: PublicKey | null): string {
  return !field || field.equals(SystemProgram.programId)
    ? ''
    : field.toBase58();
}

function parseBN(field: BN): bigIntString {
  return field.toString();
}

function parseOption<T>(field: any, parser: (field: any) => T): T | null {
  return field === null ? null : parser(field);
}

export function parseTable({
  admin,
  currentRoundNumber,
  minimumBetAmount,
  nextRoundTs,
  roundPeriodTs,
}: Table): Omit<ParsedTable, 'publicKey'> {
  return {
    admin: parsePublicKey(admin),
    currentRoundNumber: parseBN(currentRoundNumber),
    minimumBetAmount: parseBN(minimumBetAmount),
    nextRoundTs: parseBN(nextRoundTs),
    roundPeriodTs: parseBN(roundPeriodTs),
  };
}

export function parseRound({
  isSpun,
  poolAmount,
  roundNumber,
  outcome,
}: Round): Omit<ParsedRound, 'publicKey'> {
  return {
    isSpun,
    poolAmount: parseBN(poolAmount),
    roundNumber: parseBN(roundNumber),
    outcome: parseOption<u8>(outcome, (o) => o),
  };
}

export function parseBet({
  amount,
  betType,
  player,
  round,
  isClaimed,
}: Bet): Omit<ParsedBet, 'publicKey'> {
  return {
    amount: parseBN(amount),
    betType,
    player: parsePublicKey(player),
    round: parsePublicKey(round),
    isClaimed,
  };
}
