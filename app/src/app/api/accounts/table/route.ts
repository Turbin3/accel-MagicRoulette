import { MAGIC_ROULETTE_CLIENT } from '@/lib/server/solana';
import { parseTable } from '@/types/accounts';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(
      {
        table: await MAGIC_ROULETTE_CLIENT.fetchProgramAccount(
          MAGIC_ROULETTE_CLIENT.getTablePda(),
          'table',
          parseTable
        ),
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to fetch table account.',
      },
      {
        status: 500,
      }
    );
  }
}
