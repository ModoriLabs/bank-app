"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, Transaction, BankState } from "../types";

// Action types
type BankAction =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "LOGIN"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USERS"; payload: User[] }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_LOADING"; payload: boolean };

// Context type
interface BankContextType {
  state: BankState & { loading: boolean };
  login: (userId: string) => void;
  logout: () => void;
  transfer: (
    fromUserId: string,
    toUserId: string,
    amount: number
  ) => Promise<boolean>;
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
  refreshUsers: () => Promise<void>;
}

// Initial state
const initialState: BankState & { loading: boolean } = {
  users: [],
  transactions: [],
  currentUser: null,
  loading: false,
};

// Reducer function
const bankReducer = (
  state: BankState & { loading: boolean },
  action: BankAction
): BankState & { loading: boolean } => {
  switch (action.type) {
    case "SET_USERS": {
      return {
        ...state,
        users: action.payload,
      };
    }

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
        transactions: [],
      };
    }

    case "UPDATE_USERS": {
      const updatedUsers = [...state.users];
      action.payload.forEach((updatedUser) => {
        const index = updatedUsers.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          updatedUsers[index] = updatedUser;
        }
      });

      // Update current user if they were updated
      let updatedCurrentUser = state.currentUser;
      if (state.currentUser) {
        const currentUserUpdate = action.payload.find(
          (u) => u.id === state.currentUser!.id
        );
        if (currentUserUpdate) {
          updatedCurrentUser = currentUserUpdate;
        }
      }

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }

    case "SET_TRANSACTIONS": {
      return {
        ...state,
        transactions: action.payload,
      };
    }

    case "SET_LOADING": {
      return {
        ...state,
        loading: action.payload,
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

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch("/api/users");
      const data = await response.json();
      dispatch({ type: "SET_USERS", payload: data.users });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshUsers = async () => {
    await fetchUsers();
  };

  const login = (userId: string) => {
    dispatch({ type: "LOGIN", payload: userId });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const transfer = async (
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromUserId, toUserId, amount }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update users with new balances
        dispatch({ type: "UPDATE_USERS", payload: data.updatedUsers });
        return true;
      } else {
        console.error("Transfer failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Transfer error:", error);
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getUserTransactions = async (
    userId: string
  ): Promise<Transaction[]> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`/api/transactions?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_TRANSACTIONS", payload: data.transactions });
        return data.transactions;
      } else {
        console.error("Failed to fetch transactions:", data.error);
        return [];
      }
    } catch (error) {
      console.error("Transaction fetch error:", error);
      return [];
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value: BankContextType = {
    state,
    login,
    logout,
    transfer,
    getUserTransactions,
    refreshUsers,
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
