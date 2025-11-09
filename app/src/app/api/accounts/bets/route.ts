import { DISCRIMINATOR_SIZE } from "@/lib/constants";
import { MAGIC_ROULETTE_CLIENT } from "@/lib/server/solana";
import { boolToByte } from "@/lib/utils";
import { parseBet } from "@/types/accounts";
import { GetProgramAccountsFilter } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll("pda");
  const roundPda = searchParams.get("round");
  const player = searchParams.get("player");
  const isClaimed = searchParams.get("isClaimed");

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (player) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE,
            bytes: player,
            encoding: "base58",
          },
        });
      }

      if (roundPda) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 32,
            bytes: roundPda,
            encoding: "base58",
          },
        });
      }

      if (isClaimed) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 32 + 32 + 8 + 1 + 7,
            bytes: boolToByte(isClaimed.toLowerCase() === "true"),
            encoding: "base64",
          },
        });
      }

      return NextResponse.json(
        {
          bets: await MAGIC_ROULETTE_CLIENT.fetchAllProgramAccounts(
            "bet",
            parseBet,
            filters
          ),
        },
        {
          status: 200,
        }
      );
    } else if (pdas.length > 1) {
      return NextResponse.json(
        {
          bets: await MAGIC_ROULETTE_CLIENT.fetchMultipleProgramAccounts(
            pdas,
            "bet",
            parseBet
          ),
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          bet: await MAGIC_ROULETTE_CLIENT.fetchProgramAccount(
            pdas[0],
            "bet",
            parseBet
          ),
        },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to fetch bet account(s).",
      },
      {
        status: 500,
      }
    );
  }
}
