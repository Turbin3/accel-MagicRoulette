use anchor_lang::prelude::*;

use crate::BetType;

#[account]
#[derive(InitSpace)]
pub struct Round {
    /// Number of the round.
    ///
    /// Starts at 1 and increments by 1 for each new round.
    pub round_number: u64,
    /// Lamports pooled from all bets in this round.
    pub pool_amount: u64,
    /// Boolean indicating if the round has been spun and is awaiting VRF callback.
    pub is_spun: bool,
    /// Boolean indicating if the winnings have been claimed.
    pub is_claimed: bool,
    pub bump: u8,
    /// The winning bet type for this round after being spun.
    ///
    /// None if no winning bet has been determined yet.
    pub winning_bet: Option<BetType>,
}
