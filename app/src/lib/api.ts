import { VersionedTransaction } from "@solana/web3.js";
import { v0TxToBase64 } from "./utils";
import { CuPriceRange } from "@/types/transactions";

export async function wrappedFetch(
  url: string,
  method: string = "GET",
  body: any = null
): Promise<any> {
  const res = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function optimizeTx(
  tx: VersionedTransaction,
  cuPriceRange: CuPriceRange
): Promise<VersionedTransaction> {
  const data = await wrappedFetch("/api/transaction/build", "POST", {
    transaction: v0TxToBase64(tx),
    cuPriceRange,
  });

  return VersionedTransaction.deserialize(
    Buffer.from(data.transaction, "base64")
  );
}

export async function sendTx(tx: VersionedTransaction): Promise<string> {
  const data = await wrappedFetch("/api/transaction/send", "POST", {
    transaction: v0TxToBase64(tx),
  });

  return data.signature;
}
