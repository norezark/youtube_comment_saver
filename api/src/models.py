
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Status(BaseModel):
    channelCount: int
    videoCount: int
    commentCount: int
    chatCount: int
    queriesPerDay: int
    queriesPerDayLimit: int


class Thumbnail(BaseModel):
    version: str
    url: str
    width: int
    height: int


class Comment(BaseModel):
    id: str
    authorName: str
    authorChannelId: Optional[str] = None
    text: str
    like: int
    reply: int


class Video(BaseModel):
    id: str
    title: str
    description: str
    publishedAt: datetime
    thumbnails: list[Thumbnail]
    comments: list[Comment]


class Chat(BaseModel):
    authorName: str
    text: str
    timestampText: str
    timestampUsec: int


class LiveArchive(Video):
    chat_replay: list[Chat]


class Channel(BaseModel):
    id: str
    title: str
    description: str
    thumbnails: list[Thumbnail]
