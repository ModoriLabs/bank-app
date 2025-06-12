import { prisma } from "./prisma";
import { User, Transaction } from "../types";

// User operations
export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      balance: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      balance: true,
    },
  });

  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  console.log("email, password", email, password);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      balance: true,
    },
  });

  if (!user || user.password !== password) {
    return null;
  }

  return user;
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

export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
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
        password: result.updatedFromUser.password,
        role: result.updatedFromUser.role,
        balance: result.updatedFromUser.balance,
      },
      {
        id: result.updatedToUser.id,
        name: result.updatedToUser.name,
        email: result.updatedToUser.email,
        password: result.updatedToUser.password,
        role: result.updatedToUser.role,
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

export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!transaction) {
      return null;
    }

    return {
      id: transaction.id,
      fromUserId: transaction.fromUserId,
      toUserId: transaction.toUserId,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      fromUserName: transaction.fromUser.name,
      toUserName: transaction.toUser.name,
    };
  } catch (error) {
    console.error("Failed to fetch transaction by ID:", error);
    return null;
  }
}

// Admin operations
export async function resetDatabase(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Delete all transactions first (foreign key constraint)
    await prisma.transaction.deleteMany({});

    // Delete all users
    await prisma.user.deleteMany({});

    // Recreate initial users
    await prisma.user.createMany({
      data: [
        {
          name: "qpzm",
          email: "qpzm@example.com",
          password: "qpzm",
          role: "user",
          balance: 10000,
        },
        {
          name: "karl",
          email: "karl@example.com",
          password: "karl",
          role: "user",
          balance: 10000,
        },
        {
          name: "teddev",
          email: "teddev@example.com",
          password: "teddev",
          role: "user",
          balance: 10000,
        },
        {
          name: "ky",
          email: "ky@example.com",
          password: "ky",
          role: "user",
          balance: 10000,
        },
        {
          name: "admin",
          email: "admin@example.com",
          password: "admin",
          role: "admin",
          balance: 10000,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Reset failed";
    return { success: false, error: errorMessage };
  }
}
