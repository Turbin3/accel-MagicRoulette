use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Copy, PartialEq)]
pub enum BetType {
    /// Bet on a single number (0-36, 37 for 00).
    StraightUp { number: u8 },
    /// Bet on two adjacent numbers.
    Split { numbers: [u8; 2] },
    /// Bet on three numbers in a row.
    Street { numbers: [u8; 3] },
    /// Bet on four numbers that meet at a corner.
    Corner { numbers: [u8; 4] },
    /// Bet on 0, 00, 1, 2, 3.
    FiveNumber,
    /// Bet on six numbers (two rows).
    Line { numbers: [u8; 6] },
    /// Bet on a column (1, 2, or 3).
    Column { column: u8 },
    /// Bet on a dozen (1, 2, or 3).
    Dozen { dozen: u8 },
    /// Bet on red.
    Red,
    /// Bet on black.
    Black,
    /// Bet on even numbers.
    Even,
    /// Bet on odd numbers.
    Odd,
    /// Bet on high numbers (19-36).
    High,
    /// Bet on low numbers (1-18).
    Low,
}

impl BetType {
    pub const MAX_OUTCOME: u8 = 37; // 0-36 + 00

    /// Check if two numbers form a valid split bet (adjacent horizontally or vertically)
    fn is_valid_split(n1: u8, n2: u8) -> bool {
        let (min, max) = if n1 < n2 { (n1, n2) } else { (n2, n1) };
        let diff = max - min;

        // Vertical adjacent (difference of 3)
        if diff == 3 {
            return true;
        }

        // Horizontal adjacent (difference of 1, but must be in same row)
        if diff == 1 {
            // Check they're in the same row (1-3, 4-6, 7-9, etc.)
            let row1 = (min - 1) / 3;
            let row2 = (max - 1) / 3;
            return row1 == row2;
        }

        false
    }

    /// Check if three numbers form a valid street (consecutive numbers in same row)
    fn is_valid_street(numbers: &[u8; 3]) -> bool {
        let mut sorted = *numbers;
        sorted.sort_unstable();

        // Must be consecutive (n, n+1, n+2)
        if sorted[1] != sorted[0] + 1 || sorted[2] != sorted[1] + 1 {
            return false;
        }

        // Must all be in the same row
        let row = (sorted[0] - 1) / 3;
        for &num in &sorted {
            if (num - 1) / 3 != row {
                return false;
            }
        }

        // First number must start a row (1, 4, 7, 10, ...)
        (sorted[0] - 1) % 3 == 0
    }

    /// Check if four numbers form a valid corner
    fn is_valid_corner(numbers: &[u8; 4]) -> bool {
        let mut sorted = *numbers;
        sorted.sort_unstable();

        // Valid corner pattern: n, n+1, n+3, n+4
        // Example: 1, 2, 4, 5 or 5, 6, 8, 9
        if sorted[1] != sorted[0] + 1 {
            return false;
        }
        if sorted[2] != sorted[0] + 3 {
            return false;
        }
        if sorted[3] != sorted[0] + 4 {
            return false;
        }

        // The smallest number must be at a valid corner position
        // (not at the right edge, i.e., not numbers 3, 6, 9, 12, etc.)
        (sorted[0] - 1) % 3 != 2
    }

    /// Check if six numbers form a valid line (two adjacent rows)
    fn is_valid_line(numbers: &[u8; 6]) -> bool {
        let mut sorted = *numbers;
        sorted.sort_unstable();

        // Must be consecutive (n, n+1, n+2, n+3, n+4, n+5)
        for i in 1..6 {
            if sorted[i] != sorted[i - 1] + 1 {
                return false;
            }
        }

        // First three must be in one row, last three in adjacent row
        let first_row = (sorted[0] - 1) / 3;
        let last_row = (sorted[5] - 1) / 3;

        // Must span exactly 2 adjacent rows
        if last_row != first_row + 1 {
            return false;
        }

        // First number must start a row
        (sorted[0] - 1) % 3 == 0
    }

    /// Check if all elements in a 3-element array are unique
    fn are_unique_3(arr: &[u8; 3]) -> bool {
        arr[0] != arr[1] && arr[0] != arr[2] && arr[1] != arr[2]
    }

    /// Check if all elements in a 4-element array are unique
    fn are_unique_4(arr: &[u8; 4]) -> bool {
        for i in 0..4 {
            for j in (i + 1)..4 {
                if arr[i] == arr[j] {
                    return false;
                }
            }
        }
        true
    }

    /// Check if all elements in a 6-element array are unique
    fn are_unique_6(arr: &[u8; 6]) -> bool {
        for i in 0..6 {
            for j in (i + 1)..6 {
                if arr[i] == arr[j] {
                    return false;
                }
            }
        }
        true
    }

    pub fn is_valid(&self) -> bool {
        match self {
            BetType::StraightUp { number } => {
                // Must be 0-36 or 37 (representing 00)
                *number <= Self::MAX_OUTCOME
            }
            BetType::Split { numbers } => {
                // Must have exactly 2 unique numbers that are adjacent
                if numbers[0] == numbers[1] {
                    return false;
                }
                if numbers[0] > 36 || numbers[1] > 36 {
                    // Special case: 0 and 00 (37) can form a split
                    return (numbers[0] == 0 && numbers[1] == 37)
                        || (numbers[0] == 37 && numbers[1] == 0);
                }
                Self::is_valid_split(numbers[0], numbers[1])
            }
            BetType::Street { numbers } => {
                // Must be 3 unique consecutive numbers in the same row
                if !Self::are_unique_3(numbers) {
                    return false;
                }
                if numbers.iter().any(|&n| n > 36 || n == 0) {
                    return false;
                }
                Self::is_valid_street(numbers)
            }
            BetType::Corner { numbers } => {
                // Must be 4 unique numbers forming a corner
                if !Self::are_unique_4(numbers) {
                    return false;
                }
                if numbers.iter().any(|&n| n > 36 || n == 0) {
                    return false;
                }
                Self::is_valid_corner(numbers)
            }
            BetType::FiveNumber => {
                // Always valid - this bet is always 0, 00, 1, 2, 3
                true
            }
            BetType::Line { numbers } => {
                // Must be 6 unique consecutive numbers across two adjacent rows
                if !Self::are_unique_6(numbers) {
                    return false;
                }
                if numbers.iter().any(|&n| n > 36 || n == 0) {
                    return false;
                }
                Self::is_valid_line(numbers)
            }
            BetType::Column { column } => {
                // Must be 1, 2, or 3
                matches!(*column, 1 | 2 | 3)
            }
            BetType::Dozen { dozen } => {
                // Must be 1, 2, or 3
                matches!(*dozen, 1 | 2 | 3)
            }
            BetType::Red
            | BetType::Black
            | BetType::Even
            | BetType::Odd
            | BetType::High
            | BetType::Low => {
                // Always valid
                true
            }
        }
    }

    pub fn is_winner(&self, outcome: u8) -> bool {
        match self {
            BetType::StraightUp { number } => *number == outcome,
            BetType::Split { numbers } => numbers.contains(&outcome),
            BetType::Street { numbers } => numbers.contains(&outcome),
            BetType::Corner { numbers } => numbers.contains(&outcome),
            BetType::FiveNumber => matches!(outcome, 0 | 1 | 2 | 3 | 37),
            BetType::Line { numbers } => numbers.contains(&outcome),
            BetType::Column { column } => {
                // Column: 1, 2, or 3. 0 and 37 (00) are not in any column
                if outcome == 0 || outcome == 37 {
                    false
                } else {
                    ((outcome - 1) % 3) + 1 == *column
                }
            }
            BetType::Dozen { dozen } => {
                // Dozen: 1 (1-12), 2 (13-24), 3 (25-36). 0 and 37 (00) are not in any dozen
                match outcome {
                    1..=12 => *dozen == 1,
                    13..=24 => *dozen == 2,
                    25..=36 => *dozen == 3,
                    _ => false,
                }
            }
            BetType::Red => {
                // Red numbers: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
                matches!(
                    outcome,
                    1 | 3
                        | 5
                        | 7
                        | 9
                        | 12
                        | 14
                        | 16
                        | 18
                        | 19
                        | 21
                        | 23
                        | 25
                        | 27
                        | 30
                        | 32
                        | 34
                        | 36
                )
            }
            BetType::Black => {
                // Black numbers: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
                matches!(
                    outcome,
                    2 | 4
                        | 6
                        | 8
                        | 10
                        | 11
                        | 13
                        | 15
                        | 17
                        | 20
                        | 22
                        | 24
                        | 26
                        | 28
                        | 29
                        | 31
                        | 33
                        | 35
                )
            }
            BetType::Even => {
                // Even numbers (1-36 only, 0 and 00 don't count)
                outcome > 0 && outcome <= 36 && outcome % 2 == 0
            }
            BetType::Odd => {
                // Odd numbers (1-36 only)
                outcome > 0 && outcome <= 36 && outcome % 2 == 1
            }
            BetType::High => {
                // High: 19-36
                outcome >= 19 && outcome <= 36
            }
            BetType::Low => {
                // Low: 1-18
                outcome >= 1 && outcome <= 18
            }
        }
    }

    pub fn payout_multiplier(&self) -> u8 {
        match self {
            BetType::StraightUp { .. } => 35,
            BetType::Split { .. } => 17,
            BetType::Street { .. } => 11,
            BetType::Corner { .. } => 8,
            BetType::FiveNumber => 6,
            BetType::Line { .. } => 5,
            BetType::Column { .. } => 2,
            BetType::Dozen { .. } => 2,
            BetType::Red
            | BetType::Black
            | BetType::Even
            | BetType::Odd
            | BetType::High
            | BetType::Low => 1,
        }
    }
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
