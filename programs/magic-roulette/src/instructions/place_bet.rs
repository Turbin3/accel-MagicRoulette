use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use num_traits::ToPrimitive;

use crate::error::MagicRouletteError;
use crate::{Bet, BetType, Round, Table, BET_SEED, ROUND_SEED, TABLE_SEED, VAULT_SEED};

#[derive(Accounts)]
#[instruction(bet_type: BetType)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = table.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        seeds = [TABLE_SEED],
        bump = table.bump
    )]
    pub table: Account<'info, Table>,
    #[account(
        mut,
        seeds = [ROUND_SEED, table.current_round_number.to_le_bytes().as_ref()],
        bump = round.bump
    )]
    pub round: Account<'info, Round>,
    #[account(
        init,
        payer = player,
        space = Bet::DISCRIMINATOR.len() + Bet::INIT_SPACE,
        seeds = [
            BET_SEED,
            round.key().as_ref(),
            bet_type.to_u8().unwrap().to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub bet: Account<'info, Bet>,
    pub system_program: Program<'info, System>,
}

impl<'info> PlaceBet<'info> {
    pub fn handler(
        &mut self,
        bumps: &PlaceBetBumps,
        bet_type: BetType,
        bet_amount: u64,
    ) -> Result<()> {
        require!(
            bet_amount >= self.table.minimum_bet_amount,
            MagicRouletteError::InvalidBetAmount
        );

        let now = Clock::get()?.unix_timestamp;

        require!(
            now < self.table.next_round_ts,
            MagicRouletteError::RoundOver
        );

        self.bet.set_inner(Bet {
            player: self.player.key(),
            round: self.round.key(),
            amount: bet_amount,
            bump: bumps.bet,
            bet_type,
        });

        transfer(
            CpiContext::new(
                self.system_program.to_account_info(),
                Transfer {
                    from: self.player.to_account_info(),
                    to: self.vault.to_account_info(),
                },
            ),
            bet_amount,
        )?;

        self.round.pool_amount = self
            .round
            .pool_amount
            .checked_add(bet_amount)
            .ok_or(MagicRouletteError::MathOverflow)?;

        Ok(())
    }
}
