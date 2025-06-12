"use client";

import { useState } from "react";
import { User } from "../types";

interface TransferFormProps {
  currentUser: User;
  users: User[];
  onTransfer: (toUserId: string, amount: number) => Promise<boolean>;
  loading?: boolean;
}

export function TransferForm({
  currentUser,
  users,
  onTransfer,
  loading = false,
}: TransferFormProps) {
  const [toUserId, setToUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableUsers = users.filter((user) => user.id !== currentUser.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !amount) return;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (transferAmount > currentUser.balance) {
      setMessage("Insufficient balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onTransfer(toUserId, transferAmount);

      if (success) {
        setMessage("Transfer successful!");
        setToUserId("");
        setAmount("");
      } else {
        setMessage("Transfer failed. Please try again.");
      }
    } catch {
      setMessage("Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Send Money</h3>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.includes("successful")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700"
          >
            Recipient
          </label>
          <select
            id="recipient"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={loading || isSubmitting}
          >
            <option value="">Select recipient...</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
            max={currentUser.balance}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="0.00"
            required
            disabled={loading || isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Available balance: ${currentUser.balance.toLocaleString()}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading || !toUserId || !amount}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Send Money"}
        </button>
      </form>
    </div>
  );
}
