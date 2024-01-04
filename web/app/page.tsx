import { Container, List, ListItemButton, ListItemText } from "@mui/material";

export default function Home() {
    return (
        <main>
            <Container maxWidth="md">
                <List>
                    <ListItemButton href="/channels">
                        <ListItemText>チャンネル一覧</ListItemText>
                    </ListItemButton>
                    <ListItemButton href="/videos">
                        <ListItemText>動画検索</ListItemText>
                    </ListItemButton>
                </List>
            </Container>
        </main>
    );
}
