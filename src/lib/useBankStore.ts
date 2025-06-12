"use client";

import { useState, useEffect } from "react";
import {
  getState,
  subscribe,
  login,
  logout,
  transfer,
  getUserTransactions,
} from "./bankStore";
import { BankState } from "../types";

export function useBankStore() {
  const [state, setState] = useState<BankState>(getState());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setState(getState());
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    login,
    logout,
    transfer,
    getUserTransactions,
  };
}
