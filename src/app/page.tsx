"use client";

import { useBankContext } from "../lib/BankContext";
import { LoginForm } from "../components/LoginForm";
import { BankDashboard } from "../components/BankDashboard";

export default function Home() {
  const { state, login } = useBankContext();

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <LoginForm users={state.users} onLogin={login} />;
  }

  return <BankDashboard />;
}
