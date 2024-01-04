import { Container, Divider, Stack, Typography } from "@mui/material";

export default async function status() {
    const response = await fetch("http://localhost:8080/status");
    const status: StatusResponse = await response.json();

    return (
        <main>
            <Container maxWidth="sm" style={{ padding: "10px" }}>
                <Stack>
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">チャンネル数</Typography>
                        <div>
                            <Typography variant="subtitle1">
                                このサイトに登録されているチャンネル数
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.channelCount.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">動画数</Typography>
                        <div>
                            <Typography variant="subtitle1">
                                このサイトに登録されている動画数
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.videoCount.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">コメント数</Typography>
                        <div>
                            <Typography variant="subtitle1">
                                このサイトに登録されているコメント数
                                (動画の下のほうにあるやつ)
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.commentCount.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">チャット数</Typography>
                        <div>
                            <Typography variant="subtitle1">
                                このサイトに登録されているチャット数
                                (生配信だと右にあるやつ)
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.chatCount.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">
                            Queries per day (limit)
                        </Typography>
                        <div>
                            <Typography variant="subtitle1">
                                1日あたりのAPI使用数の上限
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="caption">
                                APIごとに単価が異なる
                            </Typography>
                            <br />
                            <Typography variant="caption">
                                太平洋時間の0時(日本時間の17時くらい)に更新される
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.queriesPerDayLimit.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div style={{ padding: "10px" }}>
                        <Typography variant="h4">Queries per day</Typography>
                        <div>
                            <Typography variant="subtitle1">
                                今日のAPI使用数
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="caption">
                                自分で数えてるだけなので、あっち側のカウントと異なる可能性がある
                            </Typography>
                            <br />
                            <Typography variant="caption">
                                大体上限の半分ぐらいにおさえたい
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5">
                                → {status.queriesPerDay.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                </Stack>
            </Container>
        </main>
    );
}
