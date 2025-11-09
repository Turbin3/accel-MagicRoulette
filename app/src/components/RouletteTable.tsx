"use client";

import { BetType } from "@/types/accounts";
import { useState } from "react";

const tableNumbers = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export function RouletteTable() {
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);

  const getNumberColor = (num: number) => {
    if (num === 0 || num === 37) return "bg-green-600";
    return redNumbers.includes(num) ? "bg-red-600" : "bg-black";
  };

  const formatBet = (bet: BetType) => {
    if ("straightUp" in bet)
      return `Straight: ${
        bet.straightUp?.number === 37 ? "00" : bet.straightUp?.number
      }`;
    if ("split" in bet) return `Split: ${bet.split?.numbers?.join("-")}`;
    if ("street" in bet) return `Street: ${bet.street?.numbers?.join("-")}`;
    if ("corner" in bet) return `Corner: ${bet.corner?.numbers?.join("-")}`;
    if ("fiveNumber" in bet) return "Five Number (0-00-1-2-3)";
    if ("line" in bet) return `Line: ${bet.line?.numbers?.join("-")}`;
    if ("column" in bet) return `Column ${bet.column?.column}`;
    if ("dozen" in bet) return `Dozen ${bet.dozen?.dozen}`;
    if ("red" in bet) return "Red";
    if ("black" in bet) return "Black";
    if ("even" in bet) return "Even";
    if ("odd" in bet) return "Odd";
    if ("high" in bet) return "High (19-36)";
    if ("low" in bet) return "Low (1-18)";
    return "Unknown bet type";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  px-8 py-4">
      {/* <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          American Roulette
        </h1>
      </div> */}

      <div className="bg-green-700 p-6 rounded-lg shadow-2xl border-4 border-yellow-600">
        <div className="flex gap-1">
          {/* Zero and Double Zero Section */}
          <div className="flex flex-col gap-1 mr-1 relative">
            <button
              onClick={() => setSelectedBet({ straightUp: { number: 0 } })}
              className={`${getNumberColor(
                0
              )} text-white font-bold w-12 h-28 rounded border-2 border-yellow-600 hover:opacity-80 transition`}
            >
              0
            </button>
            <button
              onClick={() => setSelectedBet({ straightUp: { number: 37 } })}
              className={`${getNumberColor(
                37
              )} text-white font-bold w-12 h-28 rounded border-2 border-yellow-600 hover:opacity-80 transition`}
            >
              00
            </button>
            {/* Five Number Bet - intersection of 0, 00, 1, 2, 3 */}
            <button
              onClick={() => setSelectedBet({ fiveNumber: {} })}
              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full border border-yellow-600 hover:w-4 hover:h-4 transition-all z-10"
              data-tooltip="Five Number (0-00-1-2-3)"
            />
          </div>

          {/* Main Number Grid */}
          <div className="flex flex-col gap-1 relative">
            {tableNumbers.map((row, rowIdx) => {
              // console.log(row, rowIdx);
              return (
                <div key={rowIdx} className="flex gap-1 relative">
                  {row.map((num, colIdx) => (
                    <div key={num} className="relative">
                      {/* Straight Up Bet */}
                      <button
                        onClick={() =>
                          setSelectedBet({ straightUp: { number: num } })
                        }
                        className={`${getNumberColor(
                          num
                        )} text-white font-bold w-12 h-12 rounded border-2 border-yellow-600 hover:opacity-80 transition shownone`}
                      >
                        {num}
                      </button>

                      {/* Split Bets - Horizontal (right edge) */}
                      {colIdx < row.length - 1 && (
                        <button
                          onClick={() =>
                            setSelectedBet({
                              split: {
                                numbers: [num, row[colIdx + 1]] as [
                                  number,
                                  number
                                ],
                              },
                            })
                          }
                          className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-green-400 rounded-full hover:w-3 transition-all z-1 opacity-70 hover:opacity-100"
                          data-tooltip={`Split: ${num}-${row[colIdx + 1]}`}
                        />
                      )}

                      {/* Split Bets - Vertical (bottom edge) */}
                      {rowIdx < tableNumbers.length - 1 && (
                        <button
                          onClick={() =>
                            setSelectedBet({
                              split: {
                                numbers: [
                                  num,
                                  tableNumbers[rowIdx + 1][colIdx],
                                ] as [number, number],
                              },
                            })
                          }
                          className="absolute left-1/2 -bottom-0.5 transform -translate-x-1/2 w-8 h-2 bg-blue-300 rounded-full hover:h-3 transition-all z-1 opacity-70 hover:opacity-100"
                          data-tooltip={`Split: ${num}-${
                            tableNumbers[rowIdx + 1][colIdx]
                          }`}
                        />
                      )}

                      {/* Corner Bets */}
                      {rowIdx < tableNumbers.length - 1 &&
                        colIdx < row.length - 1 && (
                          <button
                            onClick={() =>
                              setSelectedBet({
                                corner: {
                                  numbers: [
                                    num,
                                    row[colIdx + 1],
                                    tableNumbers[rowIdx + 1][colIdx],
                                    tableNumbers[rowIdx + 1][colIdx + 1],
                                  ] as [number, number, number, number],
                                },
                              })
                            }
                            className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-white rounded-full hover:w-4 hover:h-4 transition-all z-1 opacity-70 hover:opacity-100"
                            data-tooltip={`Corner: ${num}-${row[colIdx + 1]}-${
                              tableNumbers[rowIdx + 1][colIdx]
                            }-${tableNumbers[rowIdx + 1][colIdx + 1]}`}
                          />
                        )}
                    </div>
                  ))}

                  {/* Street Bets - Left edge of each row */}
                  <button
                    onClick={() =>
                      setSelectedBet({
                        street: {
                          numbers: [row[0], row[1], row[2]] as [
                            number,
                            number,
                            number
                          ],
                        },
                      })
                    }
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-yellow-200 rounded-full hover:w-3 transition-all z-1 opacity-70 hover:opacity-100"
                    data-tooltip={`Street: ${row[0]}-${row[1]}-${row[2]}`}
                  />

                  {/* 2 to 1 Column Bets */}
                  <button
                    onClick={() =>
                      setSelectedBet({ column: { column: rowIdx + 1 } })
                    }
                    className="bg-green-600 text-yellow-400 font-bold w-16 h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
                  >
                    2 to 1
                  </button>
                </div>
              );
            })}

            {/* Line Bets - 6 buttons for 6 pairs of columns */}
            {Array.from({ length: 6 }, (_, buttonIdx) => {
              const col1 = buttonIdx * 2; // 0, 2, 4, 6, 8, 10
              const col2 = col1 + 1; // 1, 3, 5, 7, 9, 11

              return (
                <button
                  key={`line-${buttonIdx}`}
                  onClick={() =>
                    setSelectedBet({
                      line: {
                        numbers: [
                          tableNumbers[0][col1], // Row 0, First column of pair
                          tableNumbers[0][col2], // Row 0, Second column of pair
                          tableNumbers[1][col1], // Row 1, First column of pair
                          tableNumbers[1][col2], // Row 1, Second column of pair
                          tableNumbers[2][col1], // Row 2, First column of pair
                          tableNumbers[2][col2], // Row 2, Second column of pair
                        ] as [number, number, number, number, number, number],
                      },
                    })
                  }
                  className="absolute w-3 h-3 bg-purple-900 rounded-full hover:w-4 hover:h-4 transition-all z-1 opacity-70 hover:opacity-100"
                  style={{
                    left: `${((col1 + col2 + 1) / 2 / 12) * 91}%`, // Position between the two columns
                    top: `-5%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  data-tooltip={`Line: ${tableNumbers[0][col1]}-${tableNumbers[0][col2]}-${tableNumbers[1][col1]}-${tableNumbers[1][col2]}-${tableNumbers[2][col1]}-${tableNumbers[2][col2]}`}
                />
              );
            })}
          </div>
        </div>

        {/* Dozen Bets */}
        <div className="flex gap-1 mt-1">
          <div className="w-12"></div>
          <div className="flex gap-1 flex-1">
            <button
              onClick={() => setSelectedBet({ dozen: { dozen: 1 } })}
              className="bg-green-600 text-yellow-400 font-bold flex-1 h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              1st 12
            </button>
            <button
              onClick={() => setSelectedBet({ dozen: { dozen: 2 } })}
              className="bg-green-600 text-yellow-400 font-bold flex-1 h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              2nd 12
            </button>
            <button
              onClick={() => setSelectedBet({ dozen: { dozen: 3 } })}
              className="bg-green-600 text-yellow-400 font-bold flex-1 h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              3rd 12
            </button>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Outside Bets */}
        <div className="flex gap-1 mt-1">
          <div className="w-12"></div>
          <div className="grid grid-cols-6 gap-1 flex-1">
            <button
              onClick={() => setSelectedBet({ low: {} })}
              className="bg-green-600 text-yellow-400 font-bold h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              1-18
            </button>
            <button
              onClick={() => setSelectedBet({ even: {} })}
              className="bg-green-600 text-yellow-400 font-bold h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              EVEN
            </button>
            <button
              onClick={() => setSelectedBet({ red: {} })}
              className="bg-red-600 text-white font-bold h-12 rounded border-2 border-yellow-600 hover:opacity-80 transition flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white"></div>
            </button>
            <button
              onClick={() => setSelectedBet({ black: {} })}
              className="bg-black text-white font-bold h-12 rounded border-2 border-yellow-600 hover:opacity-80 transition flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-black rounded-full border-2 border-white"></div>
            </button>
            <button
              onClick={() => setSelectedBet({ odd: {} })}
              className="bg-green-600 text-yellow-400 font-bold h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              ODD
            </button>
            <button
              onClick={() => setSelectedBet({ high: {} })}
              className="bg-green-600 text-yellow-400 font-bold h-12 rounded border-2 border-yellow-600 hover:bg-green-500 transition text-sm"
            >
              19-36
            </button>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setSelectedBet(null)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          Clear Bets
        </button>
        <button
          onClick={() =>
            alert("Spinning! Bets: " + JSON.stringify(selectedBet))
          }
          className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-8 rounded-lg transition"
        >
          Spin
        </button>
      </div>

      {selectedBet && (
        <div className="mt-4 bg-green-800 p-4 rounded-lg border-2 border-yellow-600 max-w-2xl">
          <div className="font-semibold text-yellow-400 mb-2">
            Selected Bets:
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-green-900 text-white px-3 py-1 rounded border border-yellow-600 text-sm flex items-center gap-2">
              <span>{formatBet(selectedBet)}</span>
              <button
                onClick={() => setSelectedBet(null)}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
