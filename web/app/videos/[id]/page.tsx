"use client";

import Video from "@/components/video";

export default function Home({ params }: { params: { id: string } }) {
    return (
        <main>
            <Video videoId={params.id} />
        </main>
    );
}
