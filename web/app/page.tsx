"use client";

import { Container, List, ListItemButton, ListItemText } from "@mui/material";

export default function Home() {
    return (
        <main>
            <Container maxWidth="md">
                <List>
                    <ListItemButton component="a" href="/channels">
                        <ListItemText>チャンネル一覧</ListItemText>
                    </ListItemButton>
                    <ListItemButton component="a" href="/videos">
                        <ListItemText>動画検索</ListItemText>
                    </ListItemButton>
                    <ListItemButton component="a" href="/status">
                        <ListItemText>ステータス</ListItemText>
                    </ListItemButton>
                </List>
            </Container>
        </main>
    );
}
