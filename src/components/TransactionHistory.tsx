"use client";

import { Transaction } from "../types";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentUserId: string;
}

export function TransactionHistory({
  transactions,
  currentUserId,
}: TransactionHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Transaction History
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Transaction History
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Counterparty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => {
              const isSent = transaction.fromUserId === currentUserId;
              const counterparty = isSent
                ? transaction.toUserName
                : transaction.fromUserName;

              return (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isSent ? (
                        <ArrowUpIcon className="h-5 w-5 text-red-500 mr-2" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isSent ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isSent ? "Sent" : "Received"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{counterparty}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        isSent ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isSent ? "-" : "+"}${transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
