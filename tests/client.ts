import { MagicRoulette } from "../target/types/magic_roulette";
import { PublicKey } from "@solana/web3.js";
import {
  AccountNamespace,
  Address,
  BN,
  IdlAccounts,
  Program,
  ProgramAccount,
} from "@coral-xyz/anchor";

export class MagicRouletteClient {
  program: Program<MagicRoulette>;

  constructor(program: Program<MagicRoulette>) {
    this.program = program;
  }

  getBetPda(round: PublicKey, betTypeIndex: number) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        round.toBuffer(),
        new BN(betTypeIndex).toArrayLike(Buffer, "le", 1),
      ],
      this.program.programId
    )[0];
  }

  getTablePda() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("table")],
      this.program.programId
    )[0];
  }

  getVaultPda() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      this.program.programId
    )[0];
  }

  getRoundPda(roundNumber: BN) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("round"), roundNumber.toArrayLike(Buffer, "le", 8)],
      this.program.programId
    )[0];
  }

  async fetchProgramAccount<T extends keyof AccountNamespace<MagicRoulette>>(
    pda: Address,
    accountName: T
  ): Promise<IdlAccounts<MagicRoulette>[T] | null> {
    const acc = await this.program.account[accountName].fetchNullable(pda);

    return acc;
  }

  async fetchMultipleProgramAccounts<
    T extends keyof AccountNamespace<MagicRoulette>
  >(pdas: Address[], accountName: T): Promise<IdlAccounts<MagicRoulette>[T][]> {
    const accs = await this.program.account[accountName].fetchMultiple(pdas);

    return accs;
  }

  async fetchAllProgramAccounts<
    T extends keyof AccountNamespace<MagicRoulette>
  >(accountName: T): Promise<ProgramAccount<IdlAccounts<MagicRoulette>[T]>[]> {
    const accs = await this.program.account[accountName].all();

    return accs;
  }
}
