pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2XxU8pq1HfvB5QAb7snmMPqNsQf8jzQevvJ41JUMzba9");

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

    pub fn update_table(
        ctx: Context<UpdateTable>,
        minimum_bet_amount: Option<u64>,
        round_period_ts: Option<u64>,
    ) -> Result<()> {
        ctx.accounts
            .update_table(minimum_bet_amount, round_period_ts)
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

    pub fn claim_winnings<'info>(
        ctx: Context<'_, '_, '_, 'info, ClaimWinnings<'info>>,
    ) -> Result<()> {
        // ctx.accounts.handler()
        ClaimWinnings::handler(ctx)
    }
}
