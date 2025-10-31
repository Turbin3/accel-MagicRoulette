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

    pub fn initialize_table(
        ctx: Context<InitializeTable>,
        minimum_bet_amount: u64,
        round_period_ts: u64,
    ) -> Result<()> {
        ctx.accounts
            .initialize_table(&ctx.bumps, minimum_bet_amount, round_period_ts)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, bet_amount: u64, bet_type: BetType) -> Result<()> {
        ctx.accounts.handler(bet_amount, bet_type, &ctx.bumps)
    }

    pub fn spin_roulette(ctx: Context<SpinRoulette>) -> Result<()> {
        ctx.accounts.handler()
    }

    pub fn advance_round(ctx: Context<AdvanceRound>, randomness: [u8; 32]) -> Result<()> {
        ctx.accounts.handler(&ctx.bumps, randomness)
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        ctx.accounts.handler()
    }
}
