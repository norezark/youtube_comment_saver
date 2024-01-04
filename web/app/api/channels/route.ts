import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const response = await fetch(`http://localhost:8080/channels`);
    const json: ChannelsResponse = await response.json();
    const nextResponse = NextResponse.json({ channels: json });
    return nextResponse;
}
