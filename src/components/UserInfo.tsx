"use client";

import { User } from "../types";

interface UserInfoProps {
  user: User;
  onLogout: () => void;
}

export function UserInfo({ user, onLogout }: UserInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-3xl font-bold text-green-600">
              ${user.balance.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
