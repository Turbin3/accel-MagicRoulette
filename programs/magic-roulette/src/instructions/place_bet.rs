use std::ops::Add;

use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::error::MagicRouletteError;
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
    pub fn handler(
        &mut self,
        bet_amount: u64,
        bet_type: BetType,
        bumps: &PlaceBetBumps,
    ) -> Result<()> {
        // min bet amount
        require!(
            bet_amount > self.table.minimum_bet_amount,
            MagicRouletteError::InvalidBetAmount
        );
        // assert table.current_round_number matches round.round_number
        require!(
            self.table.current_round_number == self.round.round_number,
            MagicRouletteError::InvalidRound
        );

        // initialize bet account
        self.bet.set_inner(Bet {
            player: self.player.key(),
            round: self.round.round_number,
            amount: bet_amount,
            bump: bumps.bet,
            bet_type,
        });

        // transfer bet_amount to vault
        let cpi_ctx = CpiContext::new(
            self.system_program.to_account_info(),
            Transfer {
                from: self.player.to_account_info(),
                to: self.vault.to_account_info(),
            },
        );

        transfer(cpi_ctx, bet_amount)?;

        self.round.pool_amount = self
            .round
            .pool_amount
            .checked_add(bet_amount)
            .ok_or(MagicRouletteError::MathOverflow)?;

        Ok(())
    }
}
