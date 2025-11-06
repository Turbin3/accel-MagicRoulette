use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use num_traits::ToPrimitive;

use crate::{
    error::MagicRouletteError, utils::close, Bet, Round, Table, BET_SEED, ID, ROUND_SEED,
    TABLE_SEED, VAULT_SEED,
};

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
    pub system_program: Program<'info, System>,
}

impl<'info> ClaimWinnings<'info> {
    pub fn handler(ctx: Context<'_, '_, '_, 'info, ClaimWinnings<'info>>) -> Result<()> {
        let ClaimWinnings {
            player,
            system_program,
            vault,
            ..
        } = ctx.accounts;

        let remaining_accounts = &mut ctx.remaining_accounts.iter();

        // claim winnings for each (round, bet) pair
        while let (Some(round_account), Some(bet_account)) =
            (remaining_accounts.next(), remaining_accounts.next())
        {
            let mut round = Round::try_deserialize(&mut &round_account.data.borrow_mut()[..])?;
            let round_seeds = &[ROUND_SEED, &round.round_number.to_le_bytes(), &[round.bump]];
            let round_pda = Pubkey::create_program_address(round_seeds, &ID).unwrap();

            require!(
                round_pda == round_account.key(),
                MagicRouletteError::InvalidRound
            );

            let bet = Bet::try_deserialize(&mut &bet_account.data.borrow_mut()[..])?;
            let round_key = round_account.key();
            let bet_type_u8 = bet.bet_type.to_u8().unwrap().to_le_bytes();
            let bet_seeds = &[
                BET_SEED,
                round_key.as_ref(),
                bet_type_u8.as_ref(),
                &[bet.bump],
            ];
            let bet_pda = Pubkey::create_program_address(bet_seeds, &ID).unwrap();

            require!(bet_pda == bet_account.key(), MagicRouletteError::InvalidBet);
            require!(
                bet.player == player.key(),
                MagicRouletteError::InvalidBetPlayer
            );
            require!(
                bet.round == round_account.key(),
                MagicRouletteError::InvalidBetRound
            );
            require!(
                bet.bet_type == round.winning_bet.unwrap(),
                MagicRouletteError::BetNotWinning
            );

            round.is_claimed = true;

            let mut data = round_account.try_borrow_mut_data()?;
            round.serialize(&mut &mut data[Round::DISCRIMINATOR.len()..])?;

            let vault_seeds: &[&[u8]] = &[VAULT_SEED, &[ctx.accounts.table.vault_bump]];

            transfer(
                CpiContext::new(
                    system_program.to_account_info(),
                    Transfer {
                        from: vault.to_account_info(),
                        to: player.to_account_info(),
                    },
                )
                .with_signer(&[vault_seeds]),
                round.pool_amount,
            )?;

            close(bet_account.to_account_info(), player.to_account_info())?;
        }

        // length of remaining accounts must be even
        require!(
            remaining_accounts.next().is_none(),
            MagicRouletteError::InsufficientRemainingAccounts
        );

        Ok(())
    }
}
