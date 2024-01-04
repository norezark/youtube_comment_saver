import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const { id } = params;
    const response = await fetch(`http://localhost:8080/videos/${id}`);
    const json: VideoResponse = await response.json();
    const nextResponse = NextResponse.json(json);
    return nextResponse;
}
