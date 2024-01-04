import { Grid } from "@mui/material";
import { useRouter } from "next/navigation";

export default function videoList({
    videos,
    thumbnailVersion,
}: VideoListProps) {
    const router = useRouter();

    return (
        <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing="10px">
            {videos.map((video) => {
                const thumbnail =
                    video.thumbnails.find(
                        (t) => t.version === thumbnailVersion,
                    ) ?? video.thumbnails[0];

                const onClick = () => {
                    router.push(`/videos/${video.id}`);
                };
                return (
                    <Grid
                        item
                        xs={4}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <img
                            src={thumbnail.url}
                            style={{
                                cursor: "pointer",
                                height: "120px",
                                aspectRatio: 16 / 9,
                                objectFit: "cover",
                            }}
                            loading="lazy"
                            onClick={() => onClick()}
                        />
                        <div
                            style={{
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                paddingLeft: "5px",
                            }}
                            onClick={() => onClick()}
                        >
                            {video.title}
                        </div>
                    </Grid>
                );
            })}
        </Grid>
    );
}
