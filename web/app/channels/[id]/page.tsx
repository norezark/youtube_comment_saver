"use client";

import VideoList from "@/components/videoList";
import { Box } from "@mui/material";
import { useState, useEffect } from "react";

export default function Channel({ params }: { params: { id: string } }) {
    const [videos, setVideos] = useState<VideoResponse[]>([]);

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/channels/${params.id}/videos`);
            const json: VideosResponse = await response.json();
            setVideos(json.videos);
        })();
    }, []);

    return (
        <div>
            <Box padding="10px">
                <VideoList videos={videos} thumbnailVersion="medium" />
            </Box>
        </div>
    );
}
