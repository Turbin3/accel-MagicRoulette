use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::consts::DEFAULT_QUEUE;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;

use crate::{error::MagicRouletteError, Round, Table, ROUND_SEED, TABLE_SEED};
use crate::{instruction, ID};

#[vrf]
#[derive(Accounts)]
pub struct SpinRoulette<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [TABLE_SEED],
        bump = table.bump
    )]
    pub table: Account<'info, Table>,
    #[account(
        mut,
        seeds = [ROUND_SEED, current_round.round_number.to_le_bytes().as_ref()],
        bump = current_round.bump
    )]
    pub current_round: Account<'info, Round>,
    /// CHECK: uninitialized, will be initialized in advance_round
    #[account(
        seeds = [ROUND_SEED, (current_round.round_number + 1).to_le_bytes().as_ref()],
        bump = current_round.bump
    )]
    pub new_round: UncheckedAccount<'info>,
    /// CHECK: MagicBlock default queue
    #[account(
        mut,
        constraint = oracle_queue.key() == DEFAULT_QUEUE @ MagicRouletteError::InvalidQueue
    )]
    pub oracle_queue: UncheckedAccount<'info>,
}

impl<'info> SpinRoulette<'info> {
    pub fn handler(&mut self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        require!(
            now >= self.table.next_round_ts,
            MagicRouletteError::RoundNotReadyToSpin
        );

        self.current_round.is_spun = true;

        let seed = self.current_round.round_number as u8;

        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: self.payer.key(),
            oracle_queue: self.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::AdvanceRound::DISCRIMINATOR.to_vec(),
            caller_seed: [seed; 32],
            accounts_metas: Some(vec![
                SerializableAccountMeta {
                    pubkey: self.table.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: self.current_round.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: self.new_round.key(),
                    is_signer: false,
                    is_writable: true,
                },
                SerializableAccountMeta {
                    pubkey: self.system_program.key(),
                    is_signer: false,
                    is_writable: false,
                },
            ]),
            ..Default::default()
        });

        self.invoke_signed_vrf(&self.payer.to_account_info(), &ix)?;

        Ok(())
    }
}
