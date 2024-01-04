type VideoProps = {
    videoId: string;
};

type CommentEntity = {
    text: string;
    like: number;
    reply: number;
};

type Chat = {
    authorName: string;
    text: string;
    timestampText: string;
    timestampUsec: number;
};

type VideoResponse = {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: Thumbnail[];
    comments: CommentEntity[];
    chat_replay?: Chat[];
};

type ThumbnailVersion = "default" | "medium" | "high";

type Thumbnail = {
    version: ThumbnailVersion;
    url: string;
    width: number;
    height: number;
};

type ChannelProps = {
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnail[];
    onClick: (channelId: string) => void;
};

type Channel = {
    id: string;
    title: string;
    description: string;
    thumbnails: Thumbnail[];
};

type ChannelsResponse = {
    channels: Channel[];
};

type VideosResponse = {
    videos: VideoResponse[];
};

interface Window {
    seek: (seconds: number) => boolean;
    onYouTubeIframeAPIReady: () => void;
}

type VideoListProps = {
    videos: VideoResponse[];
    thumbnailVersion: ThumbnailVersion;
};
