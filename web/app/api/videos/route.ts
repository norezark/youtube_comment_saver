import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const word = searchParams.get("word");
    const response = await fetch(
        encodeURI(`http://localhost:8080/videos?word=${word}`),
    );
    const json: VideoResponse = await response.json();
    const nextResponse = NextResponse.json({ videos: json });
    return nextResponse;
}
