export type BuildGatewayTransactionResponse = {
  result: {
    transaction: string;
    latestBlockhash: {
      blockhash: string;
      lastValidBlockHeight: string;
    };
  };
};

export type SendTransactionResponse = {
  result?: string;
  error?: {
    code: number;
    message: string;
  };
};

export enum CuPriceRange {
  Low = "low",
  Median = "median",
  High = "high",
}
