use anchor_lang::prelude::*;

use crate::{Round, Table, ROUND_SEED, TABLE_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct InitializeTable<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: Vault for holding round bet amounts, system account
    #[account(
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: UncheckedAccount<'info>,
    #[account(
        init,
        payer = admin,
        space = Table::DISCRIMINATOR.len()+ Table::INIT_SPACE,
        seeds = [TABLE_SEED],
        bump,
    )]
    pub table: Account<'info, Table>,
    #[account(
        init,
        payer = admin,
        space = Round::DISCRIMINATOR.len() + Round::INIT_SPACE,
        seeds = [ROUND_SEED, 0_u8.to_le_bytes().as_ref()],
        bump,
    )]
    pub round: Account<'info, Round>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeTable<'info> {
    pub fn handler(ctx: Context<InitializeTable>) -> Result<()> {
        // TODO: just initialize table and round accounts
        // TODO: transfer minimum system account rent to vault, to prevent it from being under-rent when winnings are first drawn

        Ok(())
    }
}
