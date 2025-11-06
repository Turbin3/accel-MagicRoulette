import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { MagicRoulette } from "../target/types/magic_roulette";
import {
  AnchorProvider,
  IdlTypes,
  Program,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { MagicRouletteClient } from "./client";
import idl from "../target/idl/magic_roulette.json";
import { defundAccount, fundAccounts, skipBetAccIfExists } from "./utils";
import { DEFAULT_QUEUE } from "./constants";
import { sleep } from "bun";

type BetType = IdlTypes<MagicRoulette>["betType"];

describe("magic-roulette", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);
  const program = new Program<MagicRoulette>(idl, provider);
  const magicRouletteClient = new MagicRouletteClient(program);

  const wallet = Wallet.local();
  // simulating with 12 players for 13 possible bet types
  const players = Array.from({ length: 12 }, () => Keypair.generate());
  const playerBetIdxs: number[] = [];

  const tablePda = magicRouletteClient.getTablePda();
  const vaultPda = magicRouletteClient.getVaultPda();

  // must follow the same order as in BetType enum
  const possibleBetTypes: BetType[] = [
    { straightUp: {} },
    { split: {} },
    { street: {} },
    { corner: {} },
    { line: {} },
    { column: {} },
    { dozen: {} },
    { red: {} },
    { black: {} },
    { even: {} },
    { odd: {} },
    { high: {} },
    { low: {} },
  ];

  beforeAll(async () => {
    // fund each account used in testing
    console.log("Funding wallets...");

    await fundAccounts(
      provider.connection,
      wallet.payer,
      players.map((player) => player.publicKey),
      LAMPORTS_PER_SOL * 0.1
    );
  });

  // for the purpose of speed testing, set a short round period
  const roundPeriodTs = 35; // 35 secs

  test("initialize table", async () => {
    let tableAcc = await magicRouletteClient.fetchProgramAccount(
      tablePda,
      "table"
    );

    // table is a singleton, so this test only succeeds once per program deployed on a cluster
    if (tableAcc !== null) {
      console.log("Table already initialized, skipping...");
      return;
    }

    const minimumBetAmount = 500; // 500 lamports

    await program.methods
      .initializeTable(new BN(minimumBetAmount), new BN(roundPeriodTs))
      .accounts({
        admin: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc();

    tableAcc = await magicRouletteClient.fetchProgramAccount(tablePda, "table");

    expect(tableAcc.admin).toStrictEqual(wallet.payer.publicKey);
    expect(tableAcc.minimumBetAmount.toNumber()).toBe(minimumBetAmount);
    expect(tableAcc.roundPeriodTs.toNumber()).toBe(roundPeriodTs);

    const vaultBal = await provider.connection.getBalance(vaultPda);

    expect(vaultBal).toBeGreaterThan(0);
  });

  test("update table", async () => {
    const minimumBetAmount = 1000; // 1000 lamports

    await program.methods
      .updateTable(new BN(minimumBetAmount), null)
      .accounts({
        admin: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc();

    const tableAcc = await magicRouletteClient.fetchProgramAccount(
      tablePda,
      "table"
    );

    expect(tableAcc.minimumBetAmount.toNumber()).toBe(minimumBetAmount);
    expect(tableAcc.roundPeriodTs.toNumber()).toBe(roundPeriodTs);
  });

  test("place bet for all players", async () => {
    const tableAcc = await magicRouletteClient.fetchProgramAccount(
      tablePda,
      "table"
    );
    const currentRoundNumber = tableAcc.currentRoundNumber;
    const roundPda = magicRouletteClient.getRoundPda(currentRoundNumber);

    const betAmount = new BN(1000); // 1000 lamports

    for (let i = 0; i < players.length; i++) {
      console.log(`Placing bet for player ${i + 1}...`);
      const player = players[i];

      const betType: BetType = possibleBetTypes[i % possibleBetTypes.length];
      const betTypeIndex = possibleBetTypes.findIndex((t) => {
        return Object.keys(t)[0] === Object.keys(betType)[0];
      });

      playerBetIdxs[i] = betTypeIndex;

      const betPda = magicRouletteClient.getBetPda(roundPda, betTypeIndex);
      await skipBetAccIfExists(magicRouletteClient, betPda);

      await program.methods
        .placeBet(betType, betAmount)
        .accountsPartial({
          player: player.publicKey,
          bet: betPda,
        })
        .signers([player])
        .rpc();
    }

    const roundAcc = await magicRouletteClient.fetchProgramAccount(
      roundPda,
      "round"
    );

    expect(roundAcc.poolAmount.toNumber()).toBe(
      players.length * betAmount.toNumber()
    );
  });

  let currentRoundPda: PublicKey;

  test("spin the roulette", async () => {
    const tableAcc = await magicRouletteClient.fetchProgramAccount(
      tablePda,
      "table"
    );
    const currentRoundNumber = tableAcc.currentRoundNumber;

    currentRoundPda = magicRouletteClient.getRoundPda(currentRoundNumber);
    const newRoundPda = magicRouletteClient.getRoundPda(
      currentRoundNumber.addn(1)
    );

    const currentTs = Math.floor(Date.now() / 1000);

    // wait until current time surpasses nextRoundTs
    if (currentTs < tableAcc.nextRoundTs.toNumber() + 1) {
      const waitTimeMs =
        (tableAcc.nextRoundTs.toNumber() + 1 - currentTs) * 1000;
      console.log(`Waiting ${waitTimeMs} ms for round period to elapse...`);
      await sleep(waitTimeMs);
    }

    await program.methods
      .spinRoulette()
      .accounts({
        payer: wallet.publicKey,
        newRound: newRoundPda,
        oracleQueue: DEFAULT_QUEUE,
      })
      .signers([wallet.payer])
      .rpc();

    const currentRoundAcc = await magicRouletteClient.fetchProgramAccount(
      currentRoundPda,
      "round"
    );

    expect(currentRoundAcc.isSpun).toBe(true);
  });

  let winningBetType: BetType;

  test("advance table round", async () => {
    while (true) {
      const currentRoundAcc = await magicRouletteClient.fetchProgramAccount(
        currentRoundPda,
        "round"
      );

      if (currentRoundAcc.winningBet !== null) {
        console.log("winningBet:", Object.keys(currentRoundAcc.winningBet)[0]);
        winningBetType = currentRoundAcc.winningBet;
        break;
      }

      console.log("Waiting for winning bet to be set...");
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  });

  test("claim winnings", async () => {
    let roundAcc = await magicRouletteClient.fetchProgramAccount(
      currentRoundPda,
      "round"
    );

    await Promise.all(
      players.map(async (player, i) => {
        const betPda = magicRouletteClient.getBetPda(
          currentRoundPda,
          playerBetIdxs[i]
        );
        const betAcc = await magicRouletteClient.fetchProgramAccount(
          betPda,
          "bet"
        );

        if (Object.keys(betAcc.betType)[0] === Object.keys(winningBetType)[0]) {
          console.log(`Player ${i + 1} has winning bet, claiming winnings...`);

          const prePlayerBal = await provider.connection.getBalance(
            player.publicKey
          );

          await program.methods
            .claimWinnings()
            .accounts({
              player: player.publicKey,
            })
            .remainingAccounts([
              {
                pubkey: currentRoundPda,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: betPda,
                isSigner: false,
                isWritable: true,
              },
            ])
            .signers([player])
            .rpc();

          const postPlayerBal = await provider.connection.getBalance(
            player.publicKey
          );

          console.log(postPlayerBal);

          expect(prePlayerBal).toBeLessThan(
            postPlayerBal - roundAcc.poolAmount.toNumber()
          );
        }
      })
    );

    roundAcc = await magicRouletteClient.fetchProgramAccount(
      currentRoundPda,
      "round"
    );

    if (!roundAcc.isClaimed) {
      console.log("No players have winning bets...");
    }
  });

  afterAll(async () => {
    // defund all accounts used in testing
    console.log("Defunding wallets...");

    for (const kp of players) {
      try {
        const balance = await provider.connection.getBalance(kp.publicKey);
        if (balance > 5000) {
          await defundAccount(
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
