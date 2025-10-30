use anchor_lang::prelude::*;

use crate::{Bet, BetType, Round, Table, BET_SEED, TABLE_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = table.bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        seeds = [TABLE_SEED],
        bump = table.bump
    )]
    pub table: Account<'info, Table>,
    #[account(mut)]
    pub round: Account<'info, Round>,
    #[account(
        init,
        payer = player,
        space = Bet::DISCRIMINATOR.len() + Bet::INIT_SPACE,
        seeds = [BET_SEED, player.key().as_ref(), round.key().as_ref()],
        bump,
    )]
    pub bet: Account<'info, Bet>,
    pub system_program: Program<'info, System>,
}

impl<'info> PlaceBet<'info> {
    pub fn handler(ctx: Context<PlaceBet>, bet_amount: u64, bet_type: BetType) -> Result<()> {
        // TODO: assert minimum bet amount
        // TODO: assert table.current_round_number matches round.round_number
        // TODO: initialize bet account
        // TODO: transfer bet_amount to vault

        Ok(())
    }
}
