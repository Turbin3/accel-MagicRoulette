import { buildTx } from "@/lib/server/solana";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transaction, cuPriceRange } = await req.json();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction is required." },
        { status: 400 }
      );
    }

    const optimizedTransaction = await buildTx(transaction, cuPriceRange);

    return NextResponse.json({ transaction: optimizedTransaction });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to build transaction.",
      },
      { status: 500 }
    );
  }
}
