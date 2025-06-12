import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "../../../lib/serverStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromUserId, toUserId, amount } = body;

    // Validation
    if (!fromUserId || !toUserId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Perform transfer
    const result = serverStore.transfer(fromUserId, toUserId, amount);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Return updated user data
    const updatedFromUser = serverStore.getUser(fromUserId);
    const updatedToUser = serverStore.getUser(toUserId);

    return NextResponse.json({
      success: true,
      updatedUsers: [updatedFromUser, updatedToUser],
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
