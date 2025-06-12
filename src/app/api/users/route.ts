import { NextResponse } from "next/server";
import { serverStore } from "../../../lib/serverStore";

export async function GET() {
  try {
    const users = serverStore.getUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
