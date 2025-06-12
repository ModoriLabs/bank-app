"use client";

import { Transaction, BankState } from "../types";
import { initialUsers, initialTransactions } from "../data/mockData";

// Global state
const state: BankState = {
  users: [...initialUsers],
  transactions: [...initialTransactions],
  currentUser: null,
};

// Listeners for state changes
let listeners: (() => void)[] = [];

// Helper function to notify all listeners
const notify = () => {
  listeners.forEach((listener) => listener());
};

// Get current state (returns a copy to prevent direct mutation)
export const getState = (): BankState => {
  return {
    users: [...state.users],
    transactions: [...state.transactions],
    currentUser: state.currentUser ? { ...state.currentUser } : null,
  };
};

// Subscribe to state changes
export const subscribe = (listener: () => void) => {
  listeners.push(listener);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

// Login function
export const login = (userId: string) => {
  const user = state.users.find((u) => u.id === userId);
  if (user) {
    state.currentUser = user;
    notify();
  }
};

// Logout function
export const logout = () => {
  state.currentUser = null;
  notify();
};

// Transfer function
export const transfer = (
  fromUserId: string,
  toUserId: string,
  amount: number
): boolean => {
  const fromUser = state.users.find((u) => u.id === fromUserId);
  const toUser = state.users.find((u) => u.id === toUserId);

  if (!fromUser || !toUser || fromUser.balance < amount || amount <= 0) {
    return false;
  }

  // Update balances
  fromUser.balance -= amount;
  toUser.balance += amount;

  // Create transaction record
  const transaction: Transaction = {
    id: Date.now().toString(),
    fromUserId,
    toUserId,
    amount,
    timestamp: new Date(),
    fromUserName: fromUser.name,
    toUserName: toUser.name,
  };

  state.transactions.push(transaction);
  notify();
  return true;
};

// Get user transactions
export const getUserTransactions = (userId: string): Transaction[] => {
  return state.transactions.filter(
    (t) => t.fromUserId === userId || t.toUserId === userId
  );
};

// Export all functions as a single object for convenience (optional)
export const bankStore = {
  getState,
  subscribe,
  login,
  logout,
  transfer,
  getUserTransactions,
};
