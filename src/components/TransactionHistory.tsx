"use client";

import { useState } from "react";
import { Transaction } from "../types";
import { TransactionDetailModal } from "./TransactionDetailModal";

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentUserId: string;
  loading: boolean;
  showAllUsers?: boolean;
}

export function TransactionHistory({
  transactions,
  currentUserId,
  loading,
  showAllUsers = false,
}: TransactionHistoryProps) {
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransactionId("");
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {showAllUsers ? "All Transactions" : "Transaction History"}
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {showAllUsers ? "All Transactions" : "Transaction History"}
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {showAllUsers
              ? "No transactions have been made by any user yet."
              : "Start by making your first transfer!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {showAllUsers ? "All Transactions" : "Transaction History"}
        </h3>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const isSent = transaction.fromUserId === currentUserId;
            const otherUser = isSent
              ? transaction.toUserName
              : transaction.fromUserName;

            return (
              <div
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction.id)}
                className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
                  showAllUsers
                    ? "border-l-gray-400 bg-gray-50 hover:bg-gray-100"
                    : isSent
                    ? "border-l-red-400 bg-red-50 hover:bg-red-100"
                    : "border-l-green-400 bg-green-50 hover:bg-green-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          showAllUsers
                            ? "text-gray-900"
                            : isSent
                            ? "text-red-900"
                            : "text-green-900"
                        }`}
                      >
                        {showAllUsers ? (
                          <>
                            {transaction.fromUserName} →{" "}
                            {transaction.toUserName}
                          </>
                        ) : (
                          <>
                            {isSent ? "Sent to" : "Received from"} {otherUser}
                          </>
                        )}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                        Click for details
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-semibold ${
                        showAllUsers
                          ? "text-gray-900"
                          : isSent
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {showAllUsers ? "" : isSent ? "-" : "+"}$
                      {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transactionId={selectedTransactionId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUserId={currentUserId}
      />
    </>
  );
}
