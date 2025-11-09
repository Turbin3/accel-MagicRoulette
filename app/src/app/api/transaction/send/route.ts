import { CONNECTION, sendTx } from "@/lib/server/solana";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transaction } = await req.json();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction is required." },
        { status: 400 }
      );
    }

    const res = await sendTx(transaction);

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
          err instanceof Error ? err.message : "Failed to send transaction.",
      },
      { status: 500 }
    );
  }
}
