use anchor_lang::prelude::*;

#[error_code]
pub enum MagicRouletteError {
    #[msg("Oracle queue does not match")]
    InvalidQueue,
    #[msg("Bet below minimum bet amount")]
    InvalidBetAmount,
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
    #[msg("Length of remaining accounts must be even")]
    InsufficientRemainingAccounts,
    #[msg("Bet does not match")]
    InvalidBet,
    #[msg("Bet player does not match")]
    InvalidBetPlayer,
    #[msg("Bet round does not match")]
    InvalidBetRound,
    #[msg("Bet is not a winning bet")]
    BetNotWinning,
    #[msg("Minimum bet amount must be greater than zero")]
    InvalidMinimumBetAmount,
}
