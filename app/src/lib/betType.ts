import { BetType } from "@/types/accounts";

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

export function isWinner(betType: BetType, outcome: number | null): boolean {
  if (!outcome) return false;

  if (betType.straightUp) {
    return betType.straightUp.number === outcome;
  }

  if (betType.split) {
    return betType.split.numbers.includes(outcome);
  }

  if (betType.street) {
    return betType.street.numbers.includes(outcome);
  }

  if (betType.corner) {
    return betType.corner.numbers.includes(outcome);
  }

  if (betType.fiveNumber) {
    return [0, 1, 2, 3, 37].includes(outcome);
  }

  if (betType.line) {
    return betType.line.numbers.includes(outcome);
  }

  if (betType.column) {
    // 0 and 37 (00) are not in any column
    if (outcome === 0 || outcome === 37) {
      return false;
    }
    const column = ((outcome - 1) % 3) + 1;
    return column === betType.column.column;
  }

  if (betType.dozen) {
    // 0 and 37 (00) are not in any dozen
    if (outcome >= 1 && outcome <= 12) {
      return betType.dozen.dozen === 1;
    }
    if (outcome >= 13 && outcome <= 24) {
      return betType.dozen.dozen === 2;
    }
    if (outcome >= 25 && outcome <= 36) {
      return betType.dozen.dozen === 3;
    }
    return false;
  }

  if (betType.red) {
    return RED_NUMBERS.includes(outcome);
  }

  if (betType.black) {
    return BLACK_NUMBERS.includes(outcome);
  }

  if (betType.even) {
    // Even numbers (1-36 only, 0 and 00 don't count)
    return outcome > 0 && outcome <= 36 && outcome % 2 === 0;
  }

  if (betType.odd) {
    // Odd numbers (1-36 only)
    return outcome > 0 && outcome <= 36 && outcome % 2 === 1;
  }

  if (betType.high) {
    // High: 19-36
    return outcome >= 19 && outcome <= 36;
  }

  if (betType.low) {
    // Low: 1-18
    return outcome >= 1 && outcome <= 18;
  }

  return false;
}

export function payoutMultiplier(betType: BetType): number {
  if ("straightUp" in betType) return 35;
  if ("split" in betType) return 17;
  if ("street" in betType) return 11;
  if ("corner" in betType) return 8;
  if ("fiveNumber" in betType) return 6;
  if ("line" in betType) return 5;
  if ("column" in betType) return 2;
  if ("dozen" in betType) return 2;
  if ("red" in betType) return 1;
  if ("black" in betType) return 1;
  if ("even" in betType) return 1;
  if ("odd" in betType) return 1;
  if ("high" in betType) return 1;
  if ("low" in betType) return 1;

  throw new Error("Invalid bet type.");
}
