use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::{consts::VRF_PROGRAM_IDENTITY, rnd::random_u8_with_range};

use crate::{error::MagicRouletteError, BetType, Round, Table, ROUND_SEED, TABLE_SEED};

#[derive(Accounts)]
pub struct AdvanceRound<'info> {
    #[account(address = VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,
    #[account(
        mut,
        seeds = [TABLE_SEED],
        bump = table.bump,
    )]
    pub table: Account<'info, Table>,
    #[account(
        mut,
        seeds = [ROUND_SEED, &table.current_round_number.to_le_bytes()],
        bump = current_round.bump,
    )]
    pub current_round: Account<'info, Round>,
    #[account(
        mut,
        seeds = [ROUND_SEED, new_round.round_number.to_le_bytes().as_ref()],
        bump = new_round.bump,
    )]
    pub new_round: Account<'info, Round>,
    pub system_program: Program<'info, System>,
}

impl<'info> AdvanceRound<'info> {
    pub fn handler(&mut self, randomness: [u8; 32]) -> Result<()> {
        let outcome = random_u8_with_range(&randomness, 0, BetType::MAX_OUTCOME);

        self.current_round.outcome = Some(outcome);
        self.table.current_round_number += 1;

        let now = Clock::get()?.unix_timestamp;

        // round_period_ts is only set on successful callback
        self.table.next_round_ts = now
            .checked_add(self.table.round_period_ts as i64)
            .ok_or(MagicRouletteError::MathOverflow)?;

        Ok(())
    }
}
