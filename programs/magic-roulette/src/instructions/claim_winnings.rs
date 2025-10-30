use anchor_lang::prelude::*;

use crate::{Bet, Round, Table, BET_SEED, ROUND_SEED, TABLE_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = table.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        seeds = [TABLE_SEED],
        bump = table.bump
    )]
    pub table: Account<'info, Table>,
    #[account(
        mut,
        seeds = [ROUND_SEED, round.round_number.to_le_bytes().as_ref()],
        bump = round.bump
    )]
    pub round: Account<'info, Round>,
    #[account(
        mut,
        close = player,
        seeds = [BET_SEED, player.key().as_ref(), round.key().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
}

impl<'info> ClaimWinnings<'info> {
    pub fn handler(ctx: Context<ClaimWinnings>) -> Result<()> {
        // TODO: assert bet.player and bet.round
        // TODO: transfer round.pool_amount from vault to player
        // TODO: set round.is_claimed

        Ok(())
    }
}
