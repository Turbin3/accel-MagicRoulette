use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::{consts::VRF_PROGRAM_IDENTITY, rnd::random_u8_with_range};
use strum::IntoEnumIterator;

use crate::{error::MagicRouletteError, BetType, Round, Table, ROUND_SEED, TABLE_SEED};

#[derive(Accounts)]
pub struct AdvanceRound<'info> {
    #[account(
        mut,
        address = VRF_PROGRAM_IDENTITY,
    )]
    pub vrf_program_identity: Signer<'info>,
    #[account(
        mut,
        seeds = [TABLE_SEED],
        bump = table.bump,
    )]
    pub table: Account<'info, Table>,
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
    pub fn handler(&mut self, bumps: &AdvanceRoundBumps, randomness: [u8; 32]) -> Result<()> {
        let rnd = random_u8_with_range(&randomness, 0, BetType::iter().count() as u8 - 1);
        let winning_bet_type = BetType::iter()
            .nth(rnd as usize)
            .ok_or(MagicRouletteError::InvalidRandomness)?;

        self.current_round.winning_bet = Some(winning_bet_type);
        self.table.current_round_number += 1;

        self.new_round.set_inner(Round {
            bump: bumps.new_round,
            is_claimed: false,
            is_spun: false,
            pool_amount: 0,
            round_number: self.table.current_round_number,
            winning_bet: None,
        });

        Ok(())
    }
}
