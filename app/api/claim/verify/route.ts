import { verifyOwnership } from "@/lib/actions/claim";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { websiteId, method } = await request.json();
    const result = await verifyOwnership(websiteId, method);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
