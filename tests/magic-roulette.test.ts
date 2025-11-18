import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { MagicRoulette } from "../target/types/magic_roulette";
import { AnchorProvider, IdlTypes, Program, Wallet } from "@coral-xyz/anchor";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { MagicRouletteClient } from "./client";
import idl from "../target/idl/magic_roulette.json";
import { defundAccount, fundAccounts, skipBetAccIfExists } from "./utils";
import { sleep } from "bun";
import { isWinner } from "./bet-type";
import { BASE_TX_FEE } from "./constants";

type BetType = IdlTypes<MagicRoulette>["betType"];

describe("magic-roulette", () => {
  const connection = new Connection(
    process.env.ANCHOR_PROVIDER_URL || clusterApiUrl("devnet"),
    { commitment: "confirmed" }
  );
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.ANCHOR_WALLET!))
  );
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet);
  const program = new Program<MagicRoulette>(idl, provider);
  const magicRouletteClient = new MagicRouletteClient(program);

  // simulating with 12 players for 13 possible bet types
  const players = Array.from({ length: 12 }, () => Keypair.generate());

  const tablePda = magicRouletteClient.getTablePda();
  const vaultPda = magicRouletteClient.getVaultPda();

  const possibleBetTypes: BetType[] = [
    { straightUp: { number: 0 } },
    { split: { numbers: [1, 2] } },
    { street: { numbers: [7, 8, 9] } },
    { corner: { numbers: [10, 11, 13, 14] } },
    { line: { numbers: [31, 32, 33, 34, 35, 36] } },
    { column: { column: 1 } },
    { dozen: { dozen: 2 } },
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
  const roundPeriodTs = 45; // 45 secs

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

    // fund vault to cover any potential winnings
    await fundAccounts(
      provider.connection,
      wallet.payer,
      [vaultPda],
      LAMPORTS_PER_SOL
    );
  });

  test("update table", async () => {
    const minimumBetAmount = 1000; // 1000 lamports

    await program.methods
      .updateTable(new BN(minimumBetAmount), null, null)
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

      const betPda = magicRouletteClient.getBetPda(roundPda, player.publicKey);
      await skipBetAccIfExists(magicRouletteClient, betPda);

      await program.methods
        .placeBet(betType, betAmount)
        .accounts({
          player: player.publicKey,
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
      .accountsPartial({
        payer: wallet.publicKey,
        currentRound: currentRoundPda,
        newRound: newRoundPda,
      })
      .signers([wallet.payer])
      .rpc();

    const currentRoundAcc = await magicRouletteClient.fetchProgramAccount(
      currentRoundPda,
      "round"
    );

    expect(currentRoundAcc.isSpun).toBe(true);
  });

  let outcome: number;

  test("advance table round", async () => {
    while (true) {
      const currentRoundAcc = await magicRouletteClient.fetchProgramAccount(
        currentRoundPda,
        "round"
      );

      if (currentRoundAcc.outcome !== null) {
        console.log("outcome:", currentRoundAcc.outcome);
        outcome = currentRoundAcc.outcome;
        break;
      }

      console.log("Waiting for outcome to be set...");
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  });

  test("claim winnings", async () => {
    let roundAcc = await magicRouletteClient.fetchProgramAccount(
      currentRoundPda,
      "round"
    );

    // wait a bit to ensure all bets are finalized
    await sleep(500);

    await Promise.all(
      players.map(async (player, i) => {
        const betPda = magicRouletteClient.getBetPda(
          currentRoundPda,
          player.publicKey
        );
        const betAcc = await magicRouletteClient.fetchProgramAccount(
          betPda,
          "bet"
        );

        if (isWinner(betAcc.betType, roundAcc.outcome)) {
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

          expect(prePlayerBal).toBeLessThan(postPlayerBal);
        }
      })
    );
  });

  test("withdraw from vault", async () => {
    const minRent = await connection.getMinimumBalanceForRentExemption(0);
    const preVaultBal = await provider.connection.getBalance(vaultPda);
    const preAdminBal = await provider.connection.getBalance(wallet.publicKey);
    const withdrawAmount = (preVaultBal - minRent) / 2; // withdraw half of vault balance

    await program.methods
      .withdrawVault(new BN(withdrawAmount))
      .accounts({
        admin: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc();

    const postAdminBal = await provider.connection.getBalance(wallet.publicKey);

    expect(preAdminBal).toBe(postAdminBal - withdrawAmount + BASE_TX_FEE);

    const postVaultBal = await provider.connection.getBalance(vaultPda);

    expect(preVaultBal).toBe(postVaultBal + withdrawAmount);
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
