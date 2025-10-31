use anchor_lang::prelude::*;

#[error_code]
pub enum MagicRouletteError {
    #[msg("Oracle queue does not match")]
    InvalidQueue,
    #[msg("Bet below minimum bet amount")]
    InvalidBetAmount,
    #[msg("Round number does not match")]
    InvalidRoundNumber,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Player does not match")]
    InvalidPlayer,
    #[msg("Round does not match")]
    InvalidRound,
    #[msg("Round has not finished yet")]
    RoundNotReadyToSpin,
    #[msg("Unable to map randomness to valid BetType")]
    InvalidRandomness,
}
