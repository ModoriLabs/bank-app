import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "../../../lib/serverStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const transactions = serverStore.getUserTransactions(userId);
    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
