use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Table {
    /// Authority of the table.
    pub admin: Pubkey,
    /// Minimum bet amount in lamports.
    pub minimum_bet_amount: u64,
    /// Number of the current round.
    pub current_round_number: u64,
    /// Timestamp when round can be advanced.
    pub next_round_ts: i64,
    /// Timestamp for how long each round lasts.
    pub round_period_ts: i64,
    pub bump: u8,
    pub vault_bump: u8,
}
