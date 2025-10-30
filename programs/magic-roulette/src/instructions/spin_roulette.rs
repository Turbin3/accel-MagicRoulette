use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::consts::{DEFAULT_EPHEMERAL_QUEUE, DEFAULT_QUEUE};

use crate::{error::MagicRouletteError, Round, Table, ROUND_SEED, TABLE_SEED};

#[derive(Accounts)]
pub struct SpinRoulette<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [TABLE_SEED],
        bump = table.bump
    )]
    pub table: Account<'info, Table>,
    #[account(
        seeds = [ROUND_SEED, current_round.round_number.to_le_bytes().as_ref()],
        bump = current_round.bump
    )]
    pub current_round: Account<'info, Round>,
    /// CHECK: uninitialized, will be initialized in advance_round
    #[account(
        seeds = [ROUND_SEED, current_round.round_number.to_le_bytes().as_ref()],
        bump = current_round.bump
    )]
    pub new_round: UncheckedAccount<'info>,
    /// CHECK: MagicBlock default queue
    #[account(
        mut,
        constraint = oracle_queue.key() == DEFAULT_QUEUE || oracle_queue.key() == DEFAULT_EPHEMERAL_QUEUE @ MagicRouletteError::InvalidQueue
    )]
    pub oracle_queue: UncheckedAccount<'info>,
}

impl<'info> SpinRoulette<'info> {
    pub fn handler(ctx: Context<SpinRoulette>) -> Result<()> {
        // TODO: invoke create_request_randomness_ix with current_round and new_round accounts

        Ok(())
    }
}
