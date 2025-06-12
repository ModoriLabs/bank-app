import { User, Transaction } from "../types";
import { initialUsers, initialTransactions } from "../data/mockData";

// Server-side state (in real app, this would be a database)
class ServerStore {
  private users: User[] = [...initialUsers];
  private transactions: Transaction[] = [...initialTransactions];

  getUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  updateUserBalance(userId: string, newBalance: number): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.balance = newBalance;
      return true;
    }
    return false;
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  getUserTransactions(userId: string): Transaction[] {
    return this.transactions.filter(
      (t) => t.fromUserId === userId || t.toUserId === userId
    );
  }

  getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }

  transfer(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): { success: boolean; error?: string } {
    const fromUser = this.users.find((u) => u.id === fromUserId);
    const toUser = this.users.find((u) => u.id === toUserId);

    if (!fromUser) {
      return { success: false, error: "Sender not found" };
    }

    if (!toUser) {
      return { success: false, error: "Recipient not found" };
    }

    if (amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    if (fromUser.balance < amount) {
      return { success: false, error: "Insufficient balance" };
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

    this.transactions.push(transaction);

    return { success: true };
  }
}

// Singleton instance for server-side state
export const serverStore = new ServerStore();
