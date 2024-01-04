export default function Channel({
    channelId,
    title,
    description,
    thumbnails,
    onClick,
}: ChannelProps) {
    const defaultThumbnail =
        thumbnails.find((t) => t.version === "default") ?? thumbnails[0];

    return (
        <div
            style={{
                width: "100%",
                cursor: "pointer",
                display: "flex",
                gap: "30px",
                border: "solid 1px",
            }}
            onClick={() => onClick(channelId)}
        >
            <img src={defaultThumbnail.url} style={{ height: "100px" }} />
            <p
                style={{
                    display: "inline-block",
                    flex: 1,
                    maxHeight: "100px",
                    verticalAlign: "middle",
                    margin: "auto",
                    overflow: "hidden",
                }}
            >
                {title}
            </p>
            <div
                style={{
                    flex: 3,
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    height: "100px",
                }}
            >
                {description}
            </div>
        </div>
    );
}
