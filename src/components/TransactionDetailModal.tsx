"use client";

import { useState, useEffect } from "react";
import { Transaction } from "../types";

interface TransactionDetailModalProps {
  transactionId: number;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function TransactionDetailModal({
  transactionId,
  isOpen,
  onClose,
  currentUserId,
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetail();
    }
  }, [isOpen, transactionId]);

  const fetchTransactionDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/transactions/${transactionId}`);
      const data = await response.json();

      if (response.ok) {
        setTransaction(data.transaction);
      } else {
        setError(data.error || "Failed to fetch transaction details");
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError("Failed to fetch transaction details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isSent = transaction?.fromUserId === currentUserId;
  const isReceived = transaction?.toUserId === currentUserId;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading transaction details...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchTransactionDetail}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Type Badge */}
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isSent
                      ? "bg-red-100 text-red-800"
                      : isReceived
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isSent
                    ? "📤 Sent"
                    : isReceived
                    ? "📥 Received"
                    : "🔄 Transfer"}
                </span>
              </div>

              {/* Amount */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {isSent ? "-" : isReceived ? "+" : ""}$
                  {transaction.amount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Transaction ID</span>
                  <span className="text-sm font-mono text-gray-900 break-all">
                    {transaction.id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">From</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.fromUserName}
                    {transaction.fromUserId === currentUserId && " (You)"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">To</span>
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.toUserName}
                    {transaction.toUserId === currentUserId && " (You)"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Date & Time</span>
                  <span className="text-sm text-gray-900">
                    {new Date(transaction.timestamp).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}{" "}
                    at{" "}
                    {new Date(transaction.timestamp).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Completed
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
