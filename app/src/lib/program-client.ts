import { ParsedProgramAccount } from "@/types/accounts";
import {
  AccountNamespace,
  Address,
  AnchorProvider,
  Idl,
  IdlAccounts,
  Program,
} from "@coral-xyz/anchor";
import { GetProgramAccountsFilter } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

export class ProgramClient<I extends Idl> {
  connection: Connection;
  program: Program<I>;

  constructor(connection: Connection, idl: any) {
    this.connection = connection;

    const provider = { connection } as AnchorProvider;

    this.program = new Program<I>(idl, provider);
  }

  getProgramId() {
    return this.program.programId;
  }

  async fetchProgramAccount<
    T extends keyof AccountNamespace<I>,
    R extends ParsedProgramAccount
  >(
    pda: Address,
    accountName: T,
    parser: (acc: IdlAccounts<I>[T]) => Omit<R, "publicKey">
  ): Promise<R | null> {
    const acc = await this.program.account[accountName].fetchNullable(pda);

    return acc
      ? ({ publicKey: pda, ...parser(acc as IdlAccounts<I>[T]) } as R)
      : null;
  }

  async fetchMultipleProgramAccounts<
    T extends keyof AccountNamespace<I>,
    R extends ParsedProgramAccount
  >(
    pdas: Address[],
    accountName: T,
    parser: (acc: IdlAccounts<I>[T]) => Omit<R, "publicKey">
  ): Promise<(R | null)[]> {
    const accs = await this.program.account[accountName].fetchMultiple(pdas);

    return accs.map((acc, i) => {
      return acc
        ? ({ publicKey: pdas[i], ...parser(acc as IdlAccounts<I>[T]) } as R)
        : null;
    });
  }

  async fetchAllProgramAccounts<
    T extends keyof AccountNamespace<I>,
    R extends ParsedProgramAccount
  >(
    accountName: T,
    parser: (acc: IdlAccounts<I>[T]) => Omit<R, "publicKey">,
    filters: GetProgramAccountsFilter[] = []
  ): Promise<R[]> {
    const accs = await this.program.account[accountName].all(filters);

    return accs.map(({ account, publicKey }) => {
      return {
        ...parser(account as IdlAccounts<I>[T]),
        publicKey: publicKey.toBase58(),
      } as R;
    });
  }
}
