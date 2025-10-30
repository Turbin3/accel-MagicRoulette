use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY;

use crate::{Round, ROUND_SEED};

#[derive(Accounts)]
pub struct AdvanceRound<'info> {
    #[account(
        mut,
        address = VRF_PROGRAM_IDENTITY,
    )]
    pub vrf_program_identity: Signer<'info>,
    #[account(
        mut,
        seeds = [ROUND_SEED, &current_round.round_number.to_le_bytes()],
        bump = current_round.bump,
    )]
    pub current_round: Account<'info, Round>,
    #[account(
        init,
        payer = vrf_program_identity,
        space = Round::DISCRIMINATOR.len() + Round::INIT_SPACE,
        seeds = [ROUND_SEED, &(current_round.round_number + 1).to_le_bytes()],
        bump,
    )]
    pub new_round: Account<'info, Round>,
    pub system_program: Program<'info, System>,
}

impl<'info> AdvanceRound<'info> {
    pub fn handler(ctx: Context<AdvanceRound>, randomness: [u8; 32]) -> Result<()> {
        // TODO: set round.winning_bet based on randomness
        // TODO: figure out randomness logic for choosing winning bet type (how to map a random value in [u8; 32] to BetType enum)
        // TODO: initialize new_round account

        Ok(())
    }
}
