import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { MagicRoulette } from "../target/types/magic_roulette";
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "bn.js";
import { MagicRouletteClient } from "./client";
import idl from "../target/idl/magic_roulette.json";
import { fundAccount } from "./utils";
import { DEFAULT_QUEUE } from "./constants";
describe("magic-roulette", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);
  const program = new Program<MagicRoulette>(idl, provider);
  const magicRouletteClient = new MagicRouletteClient(program);

  const wallet = Wallet.local();
  const [admin, player1, player2] = Array.from({ length: 3 }, () =>
    Keypair.generate()
  );

  const tablePda = magicRouletteClient.getTablePda();
  const vaultPda = magicRouletteClient.getVaultPda();

  beforeAll(async () => {
    // fund each account used in testing
    for (const kp of [admin, player1, player2]) {
      await fundAccount(
        provider.connection,
        wallet.payer,
        kp.publicKey,
        LAMPORTS_PER_SOL * 0.1
      );
    }
  });

  test("initialize table", async () => {
    let tableAcc = await magicRouletteClient.fetchProgramAccount(
      tablePda,
      "table"
    );
    // table is a singleton, so this test only succeeds once per program deployed on a cluster
    if (tableAcc !== null) {
      console.log("Table already initialized, skipping...");
      console.log(tableAcc);
      return;
    }

    const minimumBetAmount = 1000; // 1000 lamports
    const roundPeriodTs = 60 * 5; // 5 minutes

    await program.methods
      .initializeTable(new BN(minimumBetAmount), new BN(roundPeriodTs))
      .accounts({
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    tableAcc = await magicRouletteClient.fetchProgramAccount(tablePda, "table");

    console.log(tableAcc);
    expect(tableAcc.admin).toStrictEqual(admin.publicKey);
    expect(tableAcc.minimumBetAmount.toNumber()).toBe(minimumBetAmount);
    expect(tableAcc.roundPeriodTs.toNumber()).toBe(roundPeriodTs);
  });

  test.skip("place bet as player1 and player2", async () => {
    // TODO
    let roundNumber = new BN(1);
    const roundPDA = magicRouletteClient.getRoundPda(roundNumber);

    let betAmount1 = new BN(10000);
    const bet_type_1 = { straightUp: {} };

    await program.methods
      .placeBet(betAmount1, bet_type_1)
      .accounts({
        player: player1.publicKey,
        round: roundPDA,
      })
      .signers([player1])
      .rpc();

    let betAmount2 = new BN(10000);
    const bet_type_2 = { red: {} };

    await program.methods
      .placeBet(betAmount2, bet_type_2)
      .accounts({
        player: player2.publicKey,
        round: roundPDA,
      })
      .signers([player2])
      .rpc();

    const roundAccount = await magicRouletteClient.fetchProgramAccount(
      roundPDA,
      "round"
    );

    // expect(roundAccount.poolAmount.toNumber()).toBe(
    //   betAmount1.toNumber() + betAmount2.toNumber()
    // );
    console.log(roundAccount.poolAmount.toString());
    expect(roundAccount.isClaimed).toBe(false);
    expect(roundAccount.isSpun).toBe(false);
  });

  test("spin the roulette", async () => {
    const currentRoundNumber = new BN(1);
    const newRoundNumber = new BN(2);

    const currentRound = magicRouletteClient.getRoundPda(currentRoundNumber);
    const newRound = magicRouletteClient.getRoundPda(newRoundNumber);

    console.log(currentRound.toString());

    console.log(newRound.toString());

    const roundAccount = await magicRouletteClient.fetchProgramAccount(
      currentRound,
      "round"
    );

    console.log("Round account after spin:", roundAccount);
    console.log(roundAccount.roundNumber);

    await program.methods
      .spinRoulette()
      .accountsPartial({
        payer: player1.publicKey,
        table: tablePda,
        currentRound,
        newRound,
        oracleQueue: DEFAULT_QUEUE,
      })
      .signers([player1])
      .rpc();

    expect(roundAccount.isSpun).toBe(true);
  });

  test.skip("advance table round", async () => {
    // TODO
  });

  test.skip("claim winnings", async () => {
    // TODO: can only test if there's a player with winning bet from a round
  });

  afterAll(async () => {
    // defund all accounts used in testing
    for (const kp of [admin, player1, player2]) {
      try {
        const balance = await provider.connection.getBalance(kp.publicKey);
        if (balance > 5000) {
          await fundAccount(
            provider.connection,
            kp,
            wallet.publicKey,
            balance - 5000
          );
        }
      } catch (error) {
        console.log(`Failed to defund account: ${error}`);
      }
    }
  });
});
