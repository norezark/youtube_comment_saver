import { Box, Grid, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import YouTube from "react-youtube";

export default function Video({ videoId }: VideoProps) {
    const theme = useTheme();

    const [player, setPlayer] = useState<YT.Player>();

    const [comments, setComments] = useState<VideoResponse>();

    const onReadyPlayer = (e: { target: YT.Player }) => {
        setPlayer(e.target);
    };

    async function getComments(): Promise<VideoResponse> {
        const response = await fetch(`/api/videos/${videoId}`);
        return response.json();
    }

    const seek = (seconds: number) => {
        player?.seekTo(seconds, true);
        return false;
    };

    const timestampTextToSeconds = (timestampText: string) => {
        const strs = timestampText.split(":");
        let seconds = 0;
        if (strs.length == 3) {
            // hh
            seconds += Number(strs.shift()) * 60 * 60;
        }
        // mm
        seconds += Number(strs.shift()) * 60;
        // ss
        seconds += Number(strs.shift());
        return seconds > 0 ? seconds : 0;
    };

    useEffect(() => {
        window.seek = seek;
    }, [player]);

    useEffect(() => {
        (async () => {
            const json = await getComments();
            json.comments = json.comments.map((comment) => {
                console.log(comment);
                comment.text = comment.text
                    .replaceAll(/<a href="(?!http).*?"><\/a>/g, "")
                    .replaceAll(
                        /<a href="https:\/\/www\.youtube\.com\/watch\?v=.*?\&amp;t=(.*?)">(.*?)<\/a>/g,
                        '<a href="#" onclick="seek($1);">$2</a>',
                    );
                return comment;
            });
            setComments(json);
        })();
    }, []);

    const headerBackgroundColor = useMemo(
        () =>
            theme.palette.mode === "dark"
                ? theme.palette.grey.A700
                : theme.palette.grey.A400,
        [theme],
    );

    return (
        <Grid container columns={{ xs: 6, md: 12 }}>
            <Grid item xs={6} height={{ xs: "65vh", md: "97vh" }}>
                <Box height={{ xs: "33vh", md: "49vh" }}>
                    <YouTube
                        className="youtube"
                        videoId={videoId}
                        onReady={onReadyPlayer}
                        style={{
                            height: "100%",
                            width: "100%",
                            aspectRatio: 16 / 9,
                        }}
                        opts={{
                            height: "100%",
                            width: "100%",
                            playerVars: { autoPlay: 1 },
                        }}
                    />
                </Box>
                <Box
                    height={{ xs: "32vh", md: "48vh" }}
                    width="100%"
                    style={{
                        overflowY: "scroll",
                    }}
                >
                    {comments?.comments ? (
                        <table
                            rules="rows"
                            cellPadding="10"
                            style={{ width: "100%" }}
                        >
                            <tr>
                                <th
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        left: 0,
                                        textAlign: "start",
                                        background: headerBackgroundColor,
                                    }}
                                >
                                    コメント
                                </th>
                                <th
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        left: 0,
                                        textAlign: "start",
                                        width: "4em",
                                        background: headerBackgroundColor,
                                    }}
                                >
                                    ライク
                                </th>
                                <th
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        left: 0,
                                        textAlign: "start",
                                        width: "4em",
                                        background: headerBackgroundColor,
                                    }}
                                >
                                    返信
                                </th>
                            </tr>
                            {comments.comments.map((comment) => (
                                <tr>
                                    <td
                                        dangerouslySetInnerHTML={{
                                            __html: comment.text,
                                        }}
                                    ></td>
                                    <td>{comment.like}</td>
                                    <td>{comment.reply}</td>
                                </tr>
                            ))}
                        </table>
                    ) : (
                        <></>
                    )}
                </Box>
            </Grid>
            <Grid
                item
                xs={6}
                height={{
                    xs: "32vh",
                    md: "97vh",
                }}
                style={{ overflowY: "scroll" }}
            >
                {comments?.chat_replay ? (
                    <table
                        rules="rows"
                        cellPadding="10"
                        style={{ width: "100%" }}
                    >
                        <tr>
                            <th
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    left: 0,
                                    textAlign: "start",
                                    width: "5em",
                                    background: headerBackgroundColor,
                                }}
                            >
                                時間
                            </th>
                            <th
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    left: 0,
                                    textAlign: "start",
                                    width: "10em",
                                    background: headerBackgroundColor,
                                }}
                            >
                                名前
                            </th>
                            <th
                                style={{
                                    position: "sticky",
                                    top: 0,
                                    left: 0,
                                    textAlign: "start",
                                    background: headerBackgroundColor,
                                }}
                            >
                                チャット
                            </th>
                        </tr>
                        {comments.chat_replay.map((chat) => (
                            <tr
                                onClick={() => {
                                    seek(
                                        timestampTextToSeconds(
                                            chat.timestampText,
                                        ),
                                    );
                                }}
                            >
                                <td style={{ width: "5em" }}>
                                    {chat.timestampText}
                                </td>
                                <td
                                    style={{
                                        width: "10em",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        maxWidth: "10em",
                                    }}
                                >
                                    {chat.authorName}
                                </td>
                                <td
                                    style={{
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {chat.text}
                                </td>
                            </tr>
                        ))}
                    </table>
                ) : (
                    <></>
                )}
            </Grid>
        </Grid>
    );
}
