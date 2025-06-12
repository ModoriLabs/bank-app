"use client";

import { Transaction, BankState } from "../types";
import { initialUsers, initialTransactions } from "../data/mockData";

class BankStore {
  private state: BankState = {
    users: [...initialUsers],
    transactions: [...initialTransactions],
    currentUser: null,
  };

  private listeners: (() => void)[] = [];

  getState(): BankState {
    return { ...this.state };
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  login(userId: string) {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      this.notify();
    }
  }

  logout() {
    this.state.currentUser = null;
    this.notify();
  }

  transfer(fromUserId: string, toUserId: string, amount: number): boolean {
    const fromUser = this.state.users.find((u) => u.id === fromUserId);
    const toUser = this.state.users.find((u) => u.id === toUserId);

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

    this.state.transactions.push(transaction);
    this.notify();
    return true;
  }

  getUserTransactions(userId: string): Transaction[] {
    return this.state.transactions.filter(
      (t) => t.fromUserId === userId || t.toUserId === userId
    );
  }
}

export const bankStore = new BankStore();
