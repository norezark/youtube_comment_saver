import { Container, Divider, Typography } from "@mui/material";

export default function about() {
    return (
        <main>
            <Container maxWidth="md" style={{ padding: "10px" }}>
                <div>
                    <Typography variant="h4">このサイトについて</Typography>
                    <br />
                    <Typography variant="body1">
                        Youtubeの動画に対するコメント、および生配信でのチャットを検索できるサイト。
                        <br />
                        Youtubeの検索に不満がありまくるので作成。
                        <br />
                        ついでに、ASMRを見るときのために視聴ページを便利にしたい。
                        <br />
                        特定のチャンネルの動画をクロールしてDBに貯蓄しておき、SQLで検索する。
                        <br />
                        今のところ、登録と更新は手動。
                    </Typography>
                </div>
                <br />
                <Divider />
                <br />
                <div>
                    <Typography variant="h4">機能一覧</Typography>
                    <br />
                    <div>
                        <Typography variant="h5">チャンネル一覧</Typography>
                        <Typography variant="body2">
                            このサイトに登録されているチャンネルを一覧できる。
                        </Typography>
                    </div>
                    <br />
                    <div>
                        <Typography variant="h5">チャンネルページ</Typography>
                        <Typography variant="body2">
                            そのチャンネルの動画を一覧できる。
                        </Typography>
                    </div>
                    <br />
                    <div>
                        <Typography variant="h5">動画ページ</Typography>
                        <Typography variant="body2">
                            動画視聴ページ。
                            <br />
                            Youtubeの視聴ページに勝っているところ
                            <br />
                            ・動画、コメント、チャットを同時に見れる
                            <br />
                            ・チャットをクリックするとジャンプできる
                            <br />
                            ・名前が長い人がいても省略するので、目障りにならない
                            <br />
                            Youtubeの視聴ページに劣っているところ
                            <br />
                            ・今のところ、いっぱいある
                        </Typography>
                    </div>
                    <br />
                    <div>
                        <Typography variant="h5">動画検索</Typography>
                        <Typography variant="body2">
                            動画を検索できる。
                            <br />
                            今のところ、コメントorチャットから部分一致で検索することしかできない。
                        </Typography>
                    </div>
                </div>
            </Container>
        </main>
    );
}
