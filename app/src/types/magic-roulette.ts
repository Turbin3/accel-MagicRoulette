/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/magic_roulette.json`.
 */
export type MagicRoulette = {
  address: "RoU12A5xEwWtqqJHRsVwwHVqpRuZCXaffJEjvb4LFDa";
  metadata: {
    name: "magicRoulette";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "advanceRound";
      discriminator: [230, 88, 119, 80, 54, 4, 212, 250];
      accounts: [
        {
          name: "vrfProgramIdentity";
          signer: true;
          address: "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw";
        },
        {
          name: "table";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        },
        {
          name: "currentRound";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "account";
                path: "table.current_round_number";
                account: "table";
              }
            ];
          };
        },
        {
          name: "newRound";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "account";
                path: "table.current_round_number.add(1)";
                account: "table";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "randomness";
          type: {
            array: ["u8", 32];
          };
        }
      ];
    },
    {
      name: "claimWinnings";
      discriminator: [161, 215, 24, 59, 14, 236, 242, 221];
      accounts: [
        {
          name: "player";
          writable: true;
          signer: true;
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "table";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "initializeTable";
      discriminator: [223, 143, 246, 102, 122, 200, 108, 147];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "table";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        },
        {
          name: "round";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "const";
                value: [1, 0, 0, 0, 0, 0, 0, 0];
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "minimumBetAmount";
          type: "u64";
        },
        {
          name: "roundPeriodTs";
          type: "u64";
        }
      ];
    },
    {
      name: "placeBet";
      discriminator: [222, 62, 67, 220, 63, 166, 126, 33];
      accounts: [
        {
          name: "player";
          writable: true;
          signer: true;
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              }
            ];
          };
        },
        {
          name: "table";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        },
        {
          name: "round";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "account";
                path: "table.current_round_number";
                account: "table";
              }
            ];
          };
        },
        {
          name: "bet";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [98, 101, 116];
              },
              {
                kind: "account";
                path: "round";
              },
              {
                kind: "account";
                path: "player";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "betType";
          type: {
            defined: {
              name: "betType";
            };
          };
        },
        {
          name: "betAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "spinRoulette";
      discriminator: [6, 130, 248, 38, 161, 155, 17, 30];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "table";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        },
        {
          name: "currentRound";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "account";
                path: "table.current_round_number";
                account: "table";
              }
            ];
          };
        },
        {
          name: "newRound";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 111, 117, 110, 100];
              },
              {
                kind: "account";
                path: "table.current_round_number.add(1)";
                account: "table";
              }
            ];
          };
        },
        {
          name: "oracleQueue";
          writable: true;
          address: "Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh";
        },
        {
          name: "programIdentity";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 100, 101, 110, 116, 105, 116, 121];
              }
            ];
          };
        },
        {
          name: "vrfProgram";
          address: "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz";
        },
        {
          name: "slotHashes";
          address: "SysvarS1otHashes111111111111111111111111111";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "updateTable";
      discriminator: [224, 23, 10, 48, 181, 73, 121, 187];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          relations: ["table"];
        },
        {
          name: "table";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [116, 97, 98, 108, 101];
              }
            ];
          };
        }
      ];
      args: [
        {
          name: "minimumBetAmount";
          type: {
            option: "u64";
          };
        },
        {
          name: "roundPeriodTs";
          type: {
            option: "u64";
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "bet";
      discriminator: [147, 23, 35, 59, 15, 75, 155, 32];
    },
    {
      name: "round";
      discriminator: [87, 127, 165, 51, 73, 78, 116, 174];
    },
    {
      name: "table";
      discriminator: [34, 100, 138, 97, 236, 129, 230, 112];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "invalidQueue";
      msg: "Oracle queue does not match";
    },
    {
      code: 6001;
      name: "invalidBetAmount";
      msg: "Bet below minimum bet amount";
    },
    {
      code: 6002;
      name: "mathOverflow";
      msg: "Math overflow";
    },
    {
      code: 6003;
      name: "invalidPlayer";
      msg: "Player does not match";
    },
    {
      code: 6004;
      name: "invalidRound";
      msg: "Round does not match";
    },
    {
      code: 6005;
      name: "roundNotReadyToSpin";
      msg: "Round has not finished yet";
    },
    {
      code: 6006;
      name: "invalidRandomness";
      msg: "Unable to map randomness to valid BetType";
    },
    {
      code: 6007;
      name: "insufficientRemainingAccounts";
      msg: "Length of remaining accounts must be even";
    },
    {
      code: 6008;
      name: "invalidBet";
      msg: "Bet does not match";
    },
    {
      code: 6009;
      name: "betNotWinning";
      msg: "Bet is not a winning bet";
    },
    {
      code: 6010;
      name: "invalidMinimumBetAmount";
      msg: "Minimum bet amount must be greater than zero";
    },
    {
      code: 6011;
      name: "invalidRoundPeriod";
      msg: "Round period must be greater than zero";
    },
    {
      code: 6012;
      name: "unauthorizedAdmin";
      msg: "Admin does not match the one in table";
    },
    {
      code: 6013;
      name: "roundOver";
      msg: "Round is no longer accepting bets";
    },
    {
      code: 6014;
      name: "roundAwaitingOutcome";
      msg: "Round outcome is not yet available";
    },
    {
      code: 6015;
      name: "insufficientVaultFunds";
      msg: "Vault has insufficient funds to pay out winnings";
    },
    {
      code: 6016;
      name: "invalidBetType";
      msg: "Bet type is illegal";
    }
  ];
  types: [
    {
      name: "bet";
      type: {
        kind: "struct";
        fields: [
          {
            name: "player";
            docs: ["Player who placed the bet."];
            type: "pubkey";
          },
          {
            name: "round";
            docs: ["Round in which the bet was placed."];
            type: "pubkey";
          },
          {
            name: "amount";
            docs: ["Amount of lamports bet."];
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "betType";
            type: {
              defined: {
                name: "betType";
              };
            };
          },
          {
            name: "isClaimed";
            docs: [
              "Boolean that indicates if the prize for a winning bet has been claimed."
            ];
            type: "bool";
          }
        ];
      };
    },
    {
      name: "betType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "straightUp";
            fields: [
              {
                name: "number";
                type: "u8";
              }
            ];
          },
          {
            name: "split";
            fields: [
              {
                name: "numbers";
                type: {
                  array: ["u8", 2];
                };
              }
            ];
          },
          {
            name: "street";
            fields: [
              {
                name: "numbers";
                type: {
                  array: ["u8", 3];
                };
              }
            ];
          },
          {
            name: "corner";
            fields: [
              {
                name: "numbers";
                type: {
                  array: ["u8", 4];
                };
              }
            ];
          },
          {
            name: "fiveNumber";
          },
          {
            name: "line";
            fields: [
              {
                name: "numbers";
                type: {
                  array: ["u8", 6];
                };
              }
            ];
          },
          {
            name: "column";
            fields: [
              {
                name: "column";
                type: "u8";
              }
            ];
          },
          {
            name: "dozen";
            fields: [
              {
                name: "dozen";
                type: "u8";
              }
            ];
          },
          {
            name: "red";
          },
          {
            name: "black";
          },
          {
            name: "even";
          },
          {
            name: "odd";
          },
          {
            name: "high";
          },
          {
            name: "low";
          }
        ];
      };
    },
    {
      name: "round";
      type: {
        kind: "struct";
        fields: [
          {
            name: "roundNumber";
            docs: [
              "Number of the round.",
              "",
              "Starts at 1 and increments by 1 for each new round."
            ];
            type: "u64";
          },
          {
            name: "poolAmount";
            docs: ["Lamports pooled from all bets in this round."];
            type: "u64";
          },
          {
            name: "isSpun";
            docs: [
              "Boolean indicating if the round has been spun and is awaiting VRF callback."
            ];
            type: "bool";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "outcome";
            docs: ["The number that won (0-36, with 37 representing 00)"];
            type: {
              option: "u8";
            };
          }
        ];
      };
    },
    {
      name: "table";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            docs: ["Authority of the table."];
            type: "pubkey";
          },
          {
            name: "minimumBetAmount";
            docs: ["Minimum bet amount in lamports."];
            type: "u64";
          },
          {
            name: "currentRoundNumber";
            docs: ["Number of the current round."];
            type: "u64";
          },
          {
            name: "nextRoundTs";
            docs: ["Timestamp when round can be advanced."];
            type: "i64";
          },
          {
            name: "roundPeriodTs";
            docs: ["Timestamp for how long each round lasts."];
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "vaultBump";
            type: "u8";
          }
        ];
      };
    }
  ];
  constants: [
    {
      name: "betSeed";
      type: "bytes";
      value: "[98, 101, 116]";
    },
    {
      name: "roundSeed";
      type: "bytes";
      value: "[114, 111, 117, 110, 100]";
    },
    {
      name: "tableSeed";
      type: "bytes";
      value: "[116, 97, 98, 108, 101]";
    },
    {
      name: "vaultSeed";
      type: "bytes";
      value: "[118, 97, 117, 108, 116]";
    }
  ];
};
