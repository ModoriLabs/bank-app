"use client";

import { useBankStore } from "../lib/useBankStore";
import { LoginForm } from "../components/LoginForm";
import { UserInfo } from "../components/UserInfo";
import { TransferForm } from "../components/TransferForm";
import { TransactionHistory } from "../components/TransactionHistory";

export default function BankApp() {
  const { users, currentUser, login, logout, transfer, getUserTransactions } =
    useBankStore();

  const handleLogin = (userId: string) => {
    login(userId);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTransfer = (toUserId: string, amount: number): boolean => {
    if (!currentUser) return false;
    return transfer(currentUser.id, toUserId, amount);
  };

  // Show login form if no user is logged in
  if (!currentUser) {
    return <LoginForm users={users} onLogin={handleLogin} />;
  }

  const userTransactions = getUserTransactions(currentUser.id);

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
              />

              {/* Quick Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Summary
                </h3>
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
              </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory
              transactions={userTransactions}
              currentUserId={currentUser.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
