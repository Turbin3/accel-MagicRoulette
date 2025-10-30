use anchor_lang::prelude::*;
use num_derive::{FromPrimitive, ToPrimitive};

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    InitSpace,
    FromPrimitive,
    ToPrimitive,
    Clone,
    Copy,
    PartialEq,
)]
pub enum BetType {
    A,
    B,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    /// Player who placed the bet.
    pub player: Pubkey,
    /// Round in which the bet was placed.
    pub round: Pubkey,
    /// Amount of lamports bet.
    pub amount: u64,
    pub bump: u8,
    pub bet_type: BetType,
}
