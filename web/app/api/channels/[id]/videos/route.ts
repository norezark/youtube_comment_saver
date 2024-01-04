import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const response = await fetch(
        `http://localhost:8080/channels/${params.id}/videos`,
    );
    const json: VideoResponse[] = await response.json();
    const nextResponse = NextResponse.json({ videos: json });
    return nextResponse;
}
