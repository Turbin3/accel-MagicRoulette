use anchor_lang::prelude::*;
use num_derive::{FromPrimitive, ToPrimitive};
use strum_macros::EnumIter;

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    InitSpace,
    FromPrimitive,
    ToPrimitive,
    Clone,
    Copy,
    PartialEq,
    EnumIter,
)]
pub enum BetType {
    StraightUp,
    Split,
    Street,
    Corner,
    Line,
    Column,
    Dozen,
    Red,
    Black,
    Even,
    Odd,
    High,
    Low,
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
