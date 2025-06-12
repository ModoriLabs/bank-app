"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, Transaction, BankState } from "../types";

// Action types
type BankAction =
  | { type: "SET_USERS"; payload: User[] }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USERS"; payload: User[] }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_ALL_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESTORE_USER"; payload: User };

// Context type
interface BankContextType {
  state: BankState & { loading: boolean; allTransactions: Transaction[] };
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  transfer: (
    fromUserId: string,
    toUserId: string,
    amount: number
  ) => Promise<boolean>;
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
  getAllTransactions: () => Promise<Transaction[]>;
  resetDatabase: () => Promise<boolean>;
  refreshUsers: () => Promise<void>;
}

// localStorage helper functions
const saveUserToStorage = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("bankApp_currentUser", JSON.stringify(user));
  }
};

const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("bankApp_currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const removeUserFromStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bankApp_currentUser");
  }
};

// Initial state
const initialState: BankState & {
  loading: boolean;
  allTransactions: Transaction[];
} = {
  users: [],
  transactions: [],
  allTransactions: [],
  currentUser: null,
  loading: false,
};

// Reducer function
const bankReducer = (
  state: BankState & { loading: boolean; allTransactions: Transaction[] },
  action: BankAction
): BankState & { loading: boolean; allTransactions: Transaction[] } => {
  switch (action.type) {
    case "SET_USERS": {
      return {
        ...state,
        users: action.payload,
      };
    }

    case "LOGIN": {
      saveUserToStorage(action.payload);
      return {
        ...state,
        currentUser: action.payload,
      };
    }

    case "RESTORE_USER": {
      return {
        ...state,
        currentUser: action.payload,
      };
    }

    case "LOGOUT": {
      removeUserFromStorage();
      return {
        ...state,
        currentUser: null,
        transactions: [],
        allTransactions: [],
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
          // Update localStorage as well
          saveUserToStorage(currentUserUpdate);
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

    case "SET_ALL_TRANSACTIONS": {
      return {
        ...state,
        allTransactions: action.payload,
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

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      dispatch({ type: "RESTORE_USER", payload: storedUser });
    }
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: "LOGIN", payload: data.user });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
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

  const getUserTransactions = useCallback(
    async (userId: string): Promise<Transaction[]> => {
      try {
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
      }
    },
    []
  );

  const getAllTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      const response = await fetch("/api/transactions/all");
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_ALL_TRANSACTIONS", payload: data.transactions });
        return data.transactions;
      } else {
        console.error("Failed to fetch all transactions:", data.error);
        return [];
      }
    } catch (error) {
      console.error("All transactions fetch error:", error);
      return [];
    }
  }, []);

  const resetDatabase = async (): Promise<boolean> => {
    if (!state.currentUser || state.currentUser.role !== "admin") {
      return false;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: state.currentUser.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh all data
        await fetchUsers();
        dispatch({ type: "SET_TRANSACTIONS", payload: [] });
        dispatch({ type: "SET_ALL_TRANSACTIONS", payload: [] });
        return true;
      } else {
        console.error("Database reset failed:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Database reset error:", error);
      return false;
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
    getAllTransactions,
    resetDatabase,
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
