import { NextRequest, NextResponse } from "next/server";
import { getTransactionById } from "../../../../lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Parse string id to number
    const transactionId = parseInt(id, 10);

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const transaction = await getTransactionById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
