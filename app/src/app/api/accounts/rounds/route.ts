import { DISCRIMINATOR_SIZE } from "@/lib/constants";
import { MAGIC_ROULETTE_CLIENT } from "@/lib/server/solana";
import { BNtoBase64, boolToByte } from "@/lib/utils";
import { parseRound } from "@/types/accounts";
import { GetProgramAccountsFilter } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { BN } from "@coral-xyz/anchor";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll("pda");
  const roundNumber = searchParams.get("roundNumber");
  const isSpun = searchParams.get("isSpun");

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (roundNumber) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE,
            bytes: BNtoBase64(new BN(roundNumber)),
            encoding: "base64",
          },
        });
      }

      if (isSpun) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 8 + 8,
            bytes: boolToByte(isSpun.toLowerCase() === "true"),
            encoding: "base64",
          },
        });
      }

      return NextResponse.json(
        {
          rounds: await MAGIC_ROULETTE_CLIENT.fetchAllProgramAccounts(
            "round",
            parseRound,
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
          rounds: await MAGIC_ROULETTE_CLIENT.fetchMultipleProgramAccounts(
            pdas,
            "round",
            parseRound
          ),
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          round: await MAGIC_ROULETTE_CLIENT.fetchProgramAccount(
            pdas[0],
            "round",
            parseRound
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
            : "Unable to fetch round account(s).",
      },
      {
        status: 500,
      }
    );
  }
}
