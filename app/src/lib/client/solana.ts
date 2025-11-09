import {
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
  AddressLookupTableAccount,
  Connection,
  Cluster,
} from "@solana/web3.js";
import { CuPriceRange } from "@/types/transactions";
import { optimizeTx } from "../api";

export const CLUSTER: Cluster = (process.env.NEXT_PUBLIC_SOLANA_RPC_CLUSTER ??
  "devnet") as Cluster;

export async function getALTs(
  connection: Connection,
  addresses: PublicKey[]
): Promise<AddressLookupTableAccount[]> {
  const lookupTableAccounts: AddressLookupTableAccount[] = [];

  for (const address of addresses) {
    const account = await connection.getAddressLookupTable(address);

    if (account.value) {
      lookupTableAccounts.push(account.value);
    } else {
      throw new Error(`Lookup table not found: ${address.toBase58()}`);
    }
  }

  return lookupTableAccounts;
}

export async function buildTx(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: AddressLookupTableAccount[] = [],
  cuPriceRange: CuPriceRange = CuPriceRange.Low
): Promise<VersionedTransaction> {
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    instructions,
  }).compileToV0Message(lookupTables);

  const v0Tx = new VersionedTransaction(messageV0);

  return await optimizeTx(v0Tx, cuPriceRange);
}
