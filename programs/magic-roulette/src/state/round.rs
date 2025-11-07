use anchor_lang::prelude::*;

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
    pub bump: u8,
    /// The number that won (0-36, with 37 representing 00)
    pub outcome: Option<u8>,
}

impl Round {
    pub fn new(round_number: u64, bump: u8) -> Self {
        Self {
            round_number,
            pool_amount: 0,
            is_spun: false,
            bump,
            outcome: None,
        }
    }
}
