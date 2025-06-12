"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { Transaction, BankState } from "../types";
import { initialUsers, initialTransactions } from "../data/mockData";

// Action types
type BankAction =
  | { type: "LOGIN"; payload: string }
  | { type: "LOGOUT" }
  | {
      type: "TRANSFER";
      payload: { fromUserId: string; toUserId: string; amount: number };
    };

// Context type
interface BankContextType {
  state: BankState;
  login: (userId: string) => void;
  logout: () => void;
  transfer: (fromUserId: string, toUserId: string, amount: number) => boolean;
  getUserTransactions: (userId: string) => Transaction[];
}

// Initial state
const initialState: BankState = {
  users: [...initialUsers],
  transactions: [...initialTransactions],
  currentUser: null,
};

// Reducer function
const bankReducer = (state: BankState, action: BankAction): BankState => {
  switch (action.type) {
    case "LOGIN": {
      const user = state.users.find((u) => u.id === action.payload);
      if (!user) return state;

      return {
        ...state,
        currentUser: user,
      };
    }

    case "LOGOUT": {
      return {
        ...state,
        currentUser: null,
      };
    }

    case "TRANSFER": {
      const { fromUserId, toUserId, amount } = action.payload;
      const fromUser = state.users.find((u) => u.id === fromUserId);
      const toUser = state.users.find((u) => u.id === toUserId);

      if (!fromUser || !toUser || fromUser.balance < amount || amount <= 0) {
        return state; // No change if transfer is invalid
      }

      // Create new users array with updated balances
      const updatedUsers = state.users.map((user) => {
        if (user.id === fromUserId) {
          return { ...user, balance: user.balance - amount };
        }
        if (user.id === toUserId) {
          return { ...user, balance: user.balance + amount };
        }
        return user;
      });

      // Create new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        fromUserId,
        toUserId,
        amount,
        timestamp: new Date(),
        fromUserName: fromUser.name,
        toUserName: toUser.name,
      };

      // Update current user if they are involved in the transaction
      let updatedCurrentUser = state.currentUser;
      if (state.currentUser) {
        if (state.currentUser.id === fromUserId) {
          updatedCurrentUser = {
            ...state.currentUser,
            balance: state.currentUser.balance - amount,
          };
        } else if (state.currentUser.id === toUserId) {
          updatedCurrentUser = {
            ...state.currentUser,
            balance: state.currentUser.balance + amount,
          };
        }
      }

      return {
        ...state,
        users: updatedUsers,
        transactions: [...state.transactions, newTransaction],
        currentUser: updatedCurrentUser,
      };
    }

    default:
      return state;
  }
};

// Create context
const BankContext = createContext<BankContextType | undefined>(undefined);

// Provider component
export function BankProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankReducer, initialState);

  const login = (userId: string) => {
    dispatch({ type: "LOGIN", payload: userId });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const transfer = (
    fromUserId: string,
    toUserId: string,
    amount: number
  ): boolean => {
    const fromUser = state.users.find((u) => u.id === fromUserId);
    const toUser = state.users.find((u) => u.id === toUserId);

    if (!fromUser || !toUser || fromUser.balance < amount || amount <= 0) {
      return false;
    }

    dispatch({ type: "TRANSFER", payload: { fromUserId, toUserId, amount } });
    return true;
  };

  const getUserTransactions = (userId: string): Transaction[] => {
    return state.transactions.filter(
      (t) => t.fromUserId === userId || t.toUserId === userId
    );
  };

  const value: BankContextType = {
    state,
    login,
    logout,
    transfer,
    getUserTransactions,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

// Custom hook to use the bank context
export function useBankContext() {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error("useBankContext must be used within a BankProvider");
  }
  return context;
}
