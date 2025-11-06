use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::{error::MagicRouletteError, Round, Table, ROUND_SEED, TABLE_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct InitializeTable<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Vault for holding round bet amounts, system account
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: UncheckedAccount<'info>,
    #[account(
        init,
        payer = admin,
        space = Table::DISCRIMINATOR.len() + Table::INIT_SPACE,
        seeds = [TABLE_SEED],
        bump,
    )]
    pub table: Account<'info, Table>,
    #[account(
        init,
        payer = admin,
        space = Round::DISCRIMINATOR.len() + Round::INIT_SPACE,
        seeds = [ROUND_SEED, 1_u64.to_le_bytes().as_ref()],
        bump,
    )]
    pub round: Account<'info, Round>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeTable<'info> {
    pub fn initialize_table(
        &mut self,
        bumps: &InitializeTableBumps,
        minimum_bet_amount: u64,
        round_period_ts: u64,
    ) -> Result<()> {
        require!(
            minimum_bet_amount > 0,
            MagicRouletteError::InvalidMinimumBetAmount
        );

        let now = Clock::get()?.unix_timestamp;

        self.table.set_inner(Table {
            admin: self.admin.key(),
            minimum_bet_amount,
            current_round_number: 1,
            next_round_ts: now + round_period_ts as i64,
            round_period_ts,
            bump: bumps.table,
            vault_bump: bumps.vault,
        });

        self.round.set_inner(Round {
            round_number: 1,
            pool_amount: 0,
            is_spun: false,
            is_claimed: false,
            bump: bumps.round,
            winning_bet: None,
        });

        let min_rent_lamports = Rent::get()?.minimum_balance(0);

        transfer(
            CpiContext::new(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.admin.to_account_info(),
                    to: self.vault.to_account_info(),
                },
            ),
            min_rent_lamports,
        )?;

        Ok(())
    }
}
