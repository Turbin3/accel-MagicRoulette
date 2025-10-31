use anchor_lang::prelude::*;

#[error_code]
pub enum MagicRouletteError {
    #[msg("Oracle queue does not match")]
    InvalidQueue,
    #[msg("Bet below minimum bet amount")]
    InvalidBetAmount,
    #[msg("Invalid Round Number")]
    InvalidRound,
    #[msg("Math overflow")]
    MathOverflow,
}
