"use client";

import VideoList from "@/components/videoList";
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
} from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function Home() {
    const [searchTarget, setSearchTarget] = useState("");

    const [videos, setVideos] = useState<VideoResponse[]>([]);

    const [onLoading, setOnLoading] = useState(false);

    const onChangeSearchTarget = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTarget(value);
    };

    const search = async () => {
        setOnLoading(true);

        const response = await fetch(
            encodeURI(`/api/videos?word=${searchTarget}`),
        );
        const json: VideosResponse = await response.json();
        setVideos(json.videos);

        setOnLoading(false);
    };

    useEffect(() => {
        search();
    }, []);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        search();
    };

    return (
        <main>
            <Box padding="10px">
                <form onSubmit={onSubmit}>
                    <Stack
                        direction="row"
                        spacing={{ xs: 1 }}
                        alignItems="center"
                        paddingBottom="10px"
                    >
                        <TextField
                            type="search"
                            label="検索ワード (部分一致)"
                            variant="outlined"
                            autoFocus
                            autoComplete="off"
                            onChange={onChangeSearchTarget}
                        />
                        <Button
                            type="submit"
                            size="large"
                            style={{ width: "5em" }}
                            variant="contained"
                        >
                            検索
                        </Button>
                    </Stack>
                </form>
                <VideoList videos={videos} thumbnailVersion="medium" />
                <Backdrop open={onLoading}>
                    <CircularProgress />
                </Backdrop>
            </Box>
        </main>
    );
}
