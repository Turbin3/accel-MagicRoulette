import { VersionedTransaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import {
  FUNDED_KEYPAIR,
  CONNECTION,
  sendTx,
  validateProgramIx,
} from "@/lib/server/solana";
import { v0TxToBase64 } from "@/lib/utils";

const allowedIxs = ["spin_roulette"];

export async function POST(req: NextRequest) {
  try {
    const { transaction } = await req.json();

    if (!transaction) {
      return NextResponse.json(
        { error: "Serialized transaction is required." },
        { status: 400 }
      );
    }

    const tx = VersionedTransaction.deserialize(
      Buffer.from(transaction, "base64")
    );

    if (!validateProgramIx(tx, allowedIxs)) {
      return NextResponse.json(
        { error: "Transaction does not contain the permissioned instruction." },
        { status: 400 }
      );
    }

    tx.sign([FUNDED_KEYPAIR]);

    const res = await sendTx(v0TxToBase64(tx));

    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 });
    }

    const signature = res.result!;
    await CONNECTION.confirmTransaction(signature, "confirmed");

    return NextResponse.json({ signature });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to send permissioned transaction.",
      },
      { status: 500 }
    );
  }
}
