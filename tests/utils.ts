import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export async function fundAccount(
  connection: Connection,
  funder: Keypair,
  to: PublicKey,
  lamports: number = LAMPORTS_PER_SOL
) {
  const ix = SystemProgram.transfer({
    fromPubkey: funder.publicKey,
    toPubkey: to,
    lamports,
  });
  const tx = new Transaction().add(ix);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = funder.publicKey;
  await sendAndConfirmTransaction(connection, tx, [funder]);
}
