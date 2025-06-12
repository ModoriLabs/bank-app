"use client";

import { useState, useEffect } from "react";
import { Transaction } from "../types";
import { useBankContext } from "../lib/BankContext";
import { LoginForm } from "../components/LoginForm";
import { UserInfo } from "../components/UserInfo";
import { TransferForm } from "../components/TransferForm";
import { TransactionHistory } from "../components/TransactionHistory";

export default function BankApp() {
  const {
    state: { users, currentUser, loading },
    login,
    logout,
    transfer,
    getUserTransactions,
  } = useBankContext();

  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Fetch transactions when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    } else {
      setUserTransactions([]);
    }
  }, [currentUser]);

  const fetchTransactions = async () => {
    if (!currentUser) return;

    setTransactionLoading(true);
    try {
      const transactions = await getUserTransactions(currentUser.id);
      setUserTransactions(transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleLogin = (userId: string) => {
    login(userId);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTransfer = async (
    toUserId: string,
    amount: number
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const success = await transfer(currentUser.id, toUserId, amount);
    if (success) {
      // Refresh transactions after successful transfer
      await fetchTransactions();
    }
    return success;
  };

  // Show loading state while fetching users
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if no user is logged in
  if (!currentUser) {
    return <LoginForm users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* User Info Section */}
            <UserInfo user={currentUser} onLogout={handleLogout} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transfer Form */}
              <TransferForm
                currentUser={currentUser}
                users={users}
                onTransfer={handleTransfer}
                loading={loading}
              />

              {/* Quick Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Summary
                </h3>
                {transactionLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Total Transactions
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {userTransactions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Money Sent</span>
                      <span className="text-sm font-medium text-red-600">
                        $
                        {userTransactions
                          .filter((t) => t.fromUserId === currentUser.id)
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Money Received
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        $
                        {userTransactions
                          .filter((t) => t.toUserId === currentUser.id)
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory
              transactions={userTransactions}
              currentUserId={currentUser.id}
              loading={transactionLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
