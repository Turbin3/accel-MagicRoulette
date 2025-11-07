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
    #[msg("Bet is not a winning bet")]
    BetNotWinning,
    #[msg("Minimum bet amount must be greater than zero")]
    InvalidMinimumBetAmount,
    #[msg("Round period must be greater than zero")]
    InvalidRoundPeriod,
    #[msg("Admin does not match the one in table")]
    UnauthorizedAdmin,
    #[msg("Round is no longer accepting bets")]
    RoundOver,
    #[msg("Round outcome is not yet available")]
    RoundAwaitingOutcome,
    #[msg("Vault has insufficient funds to pay out winnings")]
    InsufficientVaultFunds,
    #[msg("Bet type is illegal")]
    InvalidBetType,
}
