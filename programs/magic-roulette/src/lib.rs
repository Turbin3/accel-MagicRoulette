pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("RoUnLrec2JvYFMf6ZWnK2wgK8xKaUjwi1GEUPf6fFiF");

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
        new_admin: Option<Pubkey>,
    ) -> Result<()> {
        ctx.accounts
            .update_table(minimum_bet_amount, round_period_ts, new_admin)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, bet_type: BetType, bet_amount: u64) -> Result<()> {
        ctx.accounts.handler(&ctx.bumps, bet_type, bet_amount)
    }

    pub fn spin_roulette(ctx: Context<SpinRoulette>) -> Result<()> {
        ctx.accounts.handler(&ctx.bumps)
    }

    pub fn advance_round(ctx: Context<AdvanceRound>, randomness: [u8; 32]) -> Result<()> {
        ctx.accounts.handler(randomness)
    }

    // different handler signature due to remaining accounts
    pub fn claim_winnings<'info>(
        ctx: Context<'_, '_, '_, 'info, ClaimWinnings<'info>>,
    ) -> Result<()> {
        ClaimWinnings::handler(ctx)
    }
}
