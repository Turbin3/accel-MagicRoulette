import { admin, program } from "../setup";
import { BN } from "@coral-xyz/anchor";

console.log("Updating table...")

// Params
const minimumBetAmount = 1000; // in lamports
const roundPeriodTs = 60; // in seconds
const newAdmin = admin.publicKey;

const signature = await program.methods
  .updateTable(new BN(minimumBetAmount), new BN(roundPeriodTs), newAdmin)
  .accounts({
    admin: admin.publicKey,
  })
  .signers([admin])
  .rpc();

console.log("Table updated:", signature);