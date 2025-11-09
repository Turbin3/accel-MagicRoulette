"use client";

import { ParsedTable } from "@/types/accounts";
import { wrappedFetch } from "@/lib/api";
import { createContext, ReactNode, useContext } from "react";
import useSWR, { KeyedMutator } from "swr";

interface TableContextType {
  tableData: ParsedTable | undefined;
  tableLoading: boolean;
  tableMutate: KeyedMutator<ParsedTable>;
}

const TableContext = createContext<TableContextType>({} as TableContextType);

const apiEndpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/table`;

export function useTable() {
  return useContext(TableContext);
}

export function TableProvider({ children }: { children: ReactNode }) {
  const {
    data: tableData,
    isLoading: tableLoading,
    mutate: tableMutate,
  } = useSWR(apiEndpoint, async (url) => {
    return (await wrappedFetch(url)).table as ParsedTable;
  });

  return (
    <TableContext.Provider
      value={{
        tableData,
        tableLoading,
        tableMutate,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}
