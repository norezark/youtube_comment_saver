CREATE TABLE IF NOT EXISTS channels(
    id TEXT PRIMARY KEY,
    title TEXT,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS channel_thumbnails(
    channelId TEXT,
    "version" TEXT,
    "url" TEXT,
    width INTEGER,
    height INTEGER,
    CONSTRAINT channel_thumbnails_u UNIQUE (channelId, "version"),
    CONSTRAINT channel_thumbnails_channel_id_fk FOREIGN KEY (channelId) REFERENCES channels(id)
);

CREATE TABLE IF NOT EXISTS videos(
    id TEXT PRIMARY KEY,
    channelId TEXT,
    title TEXT,
    "description" TEXT,
    publishedAt TIMESTAMP WITH TIME ZONE,
    CONSTRAINT videos_channel_id_fk FOREIGN KEY (channelId) REFERENCES channels(id)
);

CREATE TABLE IF NOT EXISTS video_thumbnails(
    videoId TEXT,
    "version" TEXT,
    "url" TEXT,
    width INTEGER,
    height INTEGER,
    CONSTRAINT video_thumbnails_u UNIQUE (videoId, "version"),
    CONSTRAINT video_thumbnails_video_id_fk FOREIGN KEY (videoId) REFERENCES videos(id)
);

CREATE TABLE IF NOT EXISTS comments(
    id TEXT PRIMARY KEY,
    videoId TEXT,
    authorName TEXT,
    authorChannelId TEXT NULL,
    "text" TEXT,
    "like" INTEGER,
    reply INTEGER,
    CONSTRAINT comments_video_id_fk FOREIGN KEY (videoId) REFERENCES videos(id)
);

CREATE TABLE IF NOT EXISTS chats(
    id serial PRIMARY KEY,
    videoId TEXT,
    authorName TEXT,
    "text" TEXT,
    timestampText TEXT,
    timestampUsec BIGINT,
    CONSTRAINT chats_video_id_fk FOREIGN KEY (videoId) REFERENCES videos(id)
);
