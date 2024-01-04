import { Grid, IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";

export default function videoList({
    videos,
    thumbnailVersion,
}: VideoListProps) {
    const theme = useTheme();

    type Order = "publishNewer" | "publishOlder";

    const [order, setOrder] = useState<Order>("publishNewer");

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const onClickMenu = (newOrder: Order) => {
        setOrder(newOrder);
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleMenuOpen}>
                <MenuIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => onClickMenu("publishNewer")}>
                    公開が新しい順
                </MenuItem>
                <MenuItem onClick={() => onClickMenu("publishOlder")}>
                    公開が古い順
                </MenuItem>
            </Menu>
            <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing="10px">
                {videos
                    .toSorted((l, r) => {
                        switch (order) {
                            case "publishNewer":
                                return (
                                    Date.parse(r.publishedAt) -
                                    Date.parse(l.publishedAt)
                                );
                            case "publishOlder":
                                return (
                                    Date.parse(l.publishedAt) -
                                    Date.parse(r.publishedAt)
                                );
                        }
                    })
                    .map((video) => {
                        const thumbnail =
                            video.thumbnails.find(
                                (t) => t.version === thumbnailVersion,
                            ) ?? video.thumbnails[0];

                        return (
                            <Grid
                                item
                                xs={4}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                }}
                            >
                                <a href={`/videos/${video.id}`}>
                                    <img
                                        src={thumbnail.url}
                                        style={{
                                            height: "120px",
                                            aspectRatio: 16 / 9,
                                            objectFit: "cover",
                                        }}
                                        loading="lazy"
                                    />
                                </a>
                                <a
                                    href={`/videos/${video.id}`}
                                    style={{
                                        textDecoration: "none",
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    <div
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            paddingLeft: "5px",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {video.title}
                                    </div>
                                </a>
                            </Grid>
                        );
                    })}
            </Grid>
        </>
    );
}
