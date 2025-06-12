import { prisma } from "./prisma";
import { User, Transaction } from "../types";

// User operations
export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: user.balance,
  };
}

export async function updateUserBalance(
  userId: string,
  newBalance: number
): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });
    return true;
  } catch {
    return false;
  }
}

// Transaction operations
export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: true,
      toUser: true,
    },
    orderBy: { timestamp: "desc" },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    fromUserId: transaction.fromUserId,
    toUserId: transaction.toUserId,
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    fromUserName: transaction.fromUser.name,
    toUserName: transaction.toUser.name,
  }));
}

export async function createTransaction(
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<{ success: boolean; error?: string; updatedUsers?: User[] }> {
  try {
    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get both users
      const fromUser = await tx.user.findUnique({ where: { id: fromUserId } });
      const toUser = await tx.user.findUnique({ where: { id: toUserId } });

      if (!fromUser) {
        throw new Error("Sender not found");
      }

      if (!toUser) {
        throw new Error("Recipient not found");
      }

      if (amount <= 0) {
        throw new Error("Invalid amount");
      }

      if (fromUser.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Update balances
      const updatedFromUser = await tx.user.update({
        where: { id: fromUserId },
        data: { balance: fromUser.balance - amount },
      });

      const updatedToUser = await tx.user.update({
        where: { id: toUserId },
        data: { balance: toUser.balance + amount },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          fromUserId,
          toUserId,
          amount,
        },
      });

      return {
        updatedFromUser,
        updatedToUser,
      };
    });

    const updatedUsers: User[] = [
      {
        id: result.updatedFromUser.id,
        name: result.updatedFromUser.name,
        email: result.updatedFromUser.email,
        balance: result.updatedFromUser.balance,
      },
      {
        id: result.updatedToUser.id,
        name: result.updatedToUser.name,
        email: result.updatedToUser.email,
        balance: result.updatedToUser.balance,
      },
    ];

    return { success: true, updatedUsers };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Transfer failed";
    return { success: false, error: errorMessage };
  }
}
