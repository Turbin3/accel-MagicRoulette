use anchor_lang::prelude::*;

use crate::{error::MagicRouletteError, Table, TABLE_SEED};

#[derive(Accounts)]
pub struct UpdateTable<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [TABLE_SEED],
        bump = table.bump,
        has_one = admin @ MagicRouletteError::UnauthorizedAdmin
    )]
    pub table: Account<'info, Table>,
}

impl<'info> UpdateTable<'info> {
    pub fn update_table(
        &mut self,
        minimum_bet_amount: Option<u64>,
        round_period_ts: Option<u64>,
        new_admin: Option<Pubkey>,
    ) -> Result<()> {
        if let Some(minimum_bet_amount) = minimum_bet_amount {
            require!(
                minimum_bet_amount > 0,
                MagicRouletteError::InvalidMinimumBetAmount
            );

            self.table.minimum_bet_amount = minimum_bet_amount;
        }

        if let Some(round_period_ts) = round_period_ts {
            require!(round_period_ts > 0, MagicRouletteError::InvalidRoundPeriod);

            self.table.round_period_ts = round_period_ts;
        }

        if let Some(new_admin) = new_admin {
            require!(
                new_admin != Pubkey::default(),
                MagicRouletteError::InvalidAddress
            );

            self.table.admin = new_admin;
        }

        Ok(())
    }
}
