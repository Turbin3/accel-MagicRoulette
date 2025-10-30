pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("B5iruL7jqDXHtWrpBYu9FJVaq5tcgvv7sGLqte5iYRbg");

#[program]
pub mod magic_roulette {
    use super::*;

    pub fn initialize_table(ctx: Context<InitializeTable>) -> Result<()> {
        InitializeTable::handler(ctx)
    }

    pub fn spin_roulette(ctx: Context<SpinRoulette>) -> Result<()> {
        SpinRoulette::handler(ctx)
    }

    pub fn advance_round(ctx: Context<AdvanceRound>, randomness: [u8; 32]) -> Result<()> {
        AdvanceRound::handler(ctx, randomness)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, bet_amount: u64, bet_type: BetType) -> Result<()> {
        PlaceBet::handler(ctx, bet_amount, bet_type)
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        ClaimWinnings::handler(ctx)
    }
}
