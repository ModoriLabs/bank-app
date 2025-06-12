"use client";

import { useState, useEffect } from "react";
import { bankStore } from "./bankStore";
import { BankState } from "../types";

export function useBankStore() {
  const [state, setState] = useState<BankState>(bankStore.getState());

  useEffect(() => {
    const unsubscribe = bankStore.subscribe(() => {
      setState(bankStore.getState());
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    login: bankStore.login.bind(bankStore),
    logout: bankStore.logout.bind(bankStore),
    transfer: bankStore.transfer.bind(bankStore),
    getUserTransactions: bankStore.getUserTransactions.bind(bankStore),
  };
}
