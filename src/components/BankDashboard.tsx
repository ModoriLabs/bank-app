"use client";

import { useState, useEffect, useCallback } from "react";
import { Transaction } from "../types";
import { useBankContext } from "../lib/BankContext";
import { UserInfo } from "./UserInfo";
import { TransferForm } from "./TransferForm";
import { TransactionHistory } from "./TransactionHistory";

type TabType = "personal" | "all";

export function BankDashboard() {
  const {
    state: { users, currentUser, loading, allTransactions },
    logout,
    transfer,
    getUserTransactions,
    getAllTransactions,
    resetDatabase,
  } = useBankContext();

  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [resetLoading, setResetLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) return;

    setTransactionLoading(true);
    try {
      if (activeTab === "personal") {
        const transactions = await getUserTransactions(currentUser.id);
        setUserTransactions(transactions);
      } else if (activeTab === "all" && currentUser.role === "admin") {
        await getAllTransactions();
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionLoading(false);
    }
  }, [currentUser, activeTab, getUserTransactions, getAllTransactions]);

  // Fetch transactions when user logs in or tab changes
  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    } else {
      setUserTransactions([]);
    }
  }, [currentUser, fetchTransactions]);

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

  const handleDatabaseReset = async () => {
    if (!currentUser || currentUser.role !== "admin") return;

    if (
      !confirm(
        "Are you sure you want to reset the database? This will delete all transactions and reset all user balances to $10,000."
      )
    ) {
      return;
    }

    setResetLoading(true);
    try {
      const success = await resetDatabase();
      if (success) {
        alert("Database reset successfully!");
        setUserTransactions([]);
        // Refresh current data
        await fetchTransactions();
      } else {
        alert("Failed to reset database.");
      }
    } catch (error) {
      console.error("Database reset error:", error);
      alert("Failed to reset database.");
    } finally {
      setResetLoading(false);
    }
  };

  if (!currentUser) return null;

  const displayTransactions =
    activeTab === "personal" ? userTransactions : allTransactions;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="flex justify-between items-start">
              <UserInfo user={currentUser} onLogout={handleLogout} />

              {/* Admin Controls */}
              {currentUser.role === "admin" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Admin Controls
                  </h3>
                  <button
                    onClick={handleDatabaseReset}
                    disabled={resetLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {resetLoading ? "Resetting..." : "Reset Database"}
                  </button>
                </div>
              )}
            </div>

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
                        Total Personal Transactions
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

            {/* Transaction History with Tabs */}
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "personal"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    My Transactions
                  </button>
                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "all"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      All Transactions
                      <span className="ml-2 bg-red-100 text-red-600 py-1 px-2 rounded-full text-xs">
                        Admin
                      </span>
                    </button>
                  )}
                </nav>
              </div>

              <div className="p-6">
                <TransactionHistory
                  transactions={displayTransactions}
                  currentUserId={currentUser.id}
                  loading={transactionLoading}
                  showAllUsers={activeTab === "all"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
