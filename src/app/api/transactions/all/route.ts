import { NextResponse } from "next/server";
import { getAllTransactions } from "../../../../lib/database";

export async function GET() {
  try {
    const transactions = await getAllTransactions();
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Failed to fetch all transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
