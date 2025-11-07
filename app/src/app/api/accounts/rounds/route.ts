import { MAGIC_ROULETTE_CLIENT } from '@/lib/server/solana';
import { boolToByte } from '@/lib/utils';
import { parseRound } from '@/types/accounts';
import { DISCRIMINATOR_SIZE } from '@coral-xyz/anchor';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pdas = searchParams.getAll('pda');
  const roundNumber = searchParams.get('roundNumber');
  const isSpun = searchParams.get('isSpun');
  const isClaimed = searchParams.get('isClaimed');
  const winningBet = searchParams.get('winningBet');

  try {
    if (!pdas.length) {
      const filters: GetProgramAccountsFilter[] = [];

      if (roundNumber) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE,
            bytes: roundNumber,
            encoding: 'base58',
          },
        });
      }

      if (isSpun) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 8 + 8,
            bytes: boolToByte(Boolean(isSpun)),
            encoding: 'base58',
          },
        });
      }

      if (isClaimed) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 8 + 8 + 1,
            bytes: boolToByte(Boolean(isClaimed)),
            encoding: 'base58',
          },
        });
      }

      // filters for round with winning_bet set
      if (winningBet) {
        filters.push({
          memcmp: {
            offset: DISCRIMINATOR_SIZE + 8 + 8 + 1 + 1 + 1 + 1,
            bytes: winningBet,
            encoding: 'base58',
          },
        });
      }

      return NextResponse.json(
        {
          rounds: await MAGIC_ROULETTE_CLIENT.fetchAllProgramAccounts(
            'round',
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
            'round',
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
            'round',
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
            : 'Unable to fetch round account(s).',
      },
      {
        status: 500,
      }
    );
  }
}
