"use client";

import { TransactionToast } from "@/components/TransactionToast";
import { useSettings } from "@/providers/SettingsProvider";
import { useState } from "react";

export function useTransaction() {
  const { getTransactionLink } = useSettings();
  const [isSendingTransaction, setIsSendingTransaction] =
    useState<boolean>(false);

  function showTransactionToast(title: string, signature: string) {
    setIsSendingTransaction(false);

    return (
      <TransactionToast title={title} link={getTransactionLink(signature)} />
    );
  }

  return {
    isSendingTransaction,
    setIsSendingTransaction,
    showTransactionToast,
  };
}
