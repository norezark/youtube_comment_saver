import asyncio
import os
import json
from pprint import pprint
import time
import gc
from datetime import datetime
from typing import Any, Optional

from fastapi import FastAPI, Response
from pydantic import BaseModel
import requests
from live_chat import get_youtube_live_chat_replay
import psycopg2 as pg
from psycopg2 import extras

URL = 'https://www.googleapis.com/youtube/v3/'
API_KEY = os.environ["API_KEY"]
RETRIVE_CHATS_CONCURRENCY = 8

conn = pg.connect(host="db", port=5432, dbname="postgres",
                  user=os.environ["POSTGRES_USER"], password=os.environ["POSTGRES_PASSWORD"])


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


def fetch_video_comments(video_id: str) -> list[Comment]:
    page_token = None
    params = {
        'key': API_KEY,
        'part': 'id,snippet',
        'videoId': video_id,
        'order': 'relevance',
        'textFormat': 'html',
        'maxResults': 100,
    }

    comments = []

    while (True):
        print(f"retrieved comments: {len(comments)}")
        if page_token is not None:
            params['pageToken'] = page_token
        response = requests.get(URL + 'commentThreads', params=params)
        resource = response.json()

        def convert(comment_dict: dict) -> Comment:
            authorChannelId = None
            if 'authorChannelId' in comment_dict['snippet']['topLevelComment']['snippet']:
                authorChannelId = comment_dict['snippet']['topLevelComment']['snippet']['authorChannelId']['value']
            return Comment(
                id=comment_dict['id'],
                authorName=comment_dict['snippet']['topLevelComment']['snippet']['authorDisplayName'],
                authorChannelId=authorChannelId,
                text=comment_dict['snippet']['topLevelComment']['snippet']['textDisplay'],
                like=comment_dict['snippet']['topLevelComment']['snippet']['likeCount'],
                reply=comment_dict['snippet']['totalReplyCount']
            )

        if "items" not in resource:
            pprint(resource)
        else:
            comments += list(map(convert, resource['items']))

        if "nextPageToken" in resource:
            page_token = resource["nextPageToken"]
        else:
            print(f"finished retrieve. comments: {len(comments)}")
            return comments


def print_video_comments(video_id: str):
    video_comments = fetch_video_comments(video_id, None)
    print(json.dumps(video_comments))


async def fetch_comments_chat_replay(video_id: str):
    comments = fetch_video_comments(video_id)
    # chat_replay_dict = await get_youtube_live_chat_replay(video_id)
    chat_replay_dict = None
    chat_replay = None
    if chat_replay_dict is not None:
        chat_replay = [Chat.model_validate(chat) for chat in chat_replay_dict]
    return comments, chat_replay


def save_video(video_entity: tuple, thumbnails: list[Thumbnail], comments: list[Comment], chat_replay: list[Chat] | None):
    video_id = video_entity[0]
    with conn.cursor() as cursor:
        cursor.execute(
            'INSERT INTO videos VALUES(%s, %s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, "description" = EXCLUDED."description", publishedAt = EXCLUDED.publishedAT', video_entity)

        extras.execute_values(
            cursor, "INSERT INTO video_thumbnails VALUES %s ON CONFLICT (videoId, version) DO UPDATE SET url = EXCLUDED.url, width = EXCLUDED.width, height = EXCLUDED.height", thumbnails)
        comment_values = [(
            comment.id,
            video_id,
            comment.authorName,
            comment.authorChannelId,
            comment.text,
            comment.like,
            comment.reply
        ) for comment in comments]
        extras.execute_values(
            cursor,
            '''
            INSERT INTO comments (
                id,
                videoId,
                authorName,
                authorChannelId,
                "text",
                "like",
                reply
            ) VALUES %s ON CONFLICT (
                id
            ) DO UPDATE SET
                authorName = EXCLUDED.authorName,
                authorChannelId = EXCLUDED.authorChannelId,
                "text" = EXCLUDED."text",
                "like" = EXCLUDED."like",
                reply = EXCLUDED.reply
            ''',
            comment_values
        )
        if chat_replay is not None:
            cursor.execute('DELETE FROM chats WHERE videoId = %s', (video_id,))
            chat_values = [(video_id, chat.authorName, chat.text, chat.timestampText,
                            chat.timestampUsec) for chat in chat_replay]
            extras.execute_values(
                cursor, 'INSERT INTO chats (videoId, authorName, "text", timestampText, timestampUsec) VALUES %s', chat_values)
        conn.commit()


def get_comments_chat_replay(video_id: str):
    with conn.cursor() as cursor:
        cursor.execute(
            'SELECT id, authorName, authorChannelId, "text", "like", reply FROM comments WHERE videoId=%s', (video_id,))
        comment_entities = cursor.fetchall()
        comments = [Comment(
            id=entity[0],
            authorName=entity[1],
            authorChannelId=entity[2],
            text=entity[3],
            like=entity[4],
            reply=entity[5],
        )for entity in comment_entities]

        cursor.execute(
            'SELECT authorName, "text", timestampText, timestampUsec FROM chats WHERE videoId=%s ORDER BY timestampUsec ASC', (video_id,))
        chat_entities = cursor.fetchall()
        chat_replay = None
        if len(chat_entities) != 0:
            chat_replay = [Chat(authorName=entity[0], text=entity[1], timestampText=entity[2], timestampUsec=entity[3])
                           for entity in chat_entities]
        return comments, chat_replay


app = FastAPI()


@app.get("/videos/{video_id}")
async def get_video_comments(response: Response, video_id: str) -> Video | LiveArchive:
    with conn.cursor() as cursor:
        cursor.execute(
            'SELECT id, title, "description", publishedAt FROM videos WHERE id = %s', (video_id,))
        video_entities = cursor.fetchall()
        video = get_video_from_entity(video_entities[0])
    return video


@app.get("/channels")
async def crawl_channel(response: Response) -> list[Channel]:
    channels = []
    with conn.cursor() as cursor:
        cursor.execute('SELECT id, title, description FROM channels')
        channel_entities = cursor.fetchall()
        for channel_entity in channel_entities:
            cursor.execute(
                'SELECT version, url, width, height FROM channel_thumbnails WHERE channelId=%s', (channel_entity[0],))
            channel_thumbnail_entities = cursor.fetchall()
            thumbnails = [Thumbnail(version=entity[0], url=entity[1], width=entity[2],
                                    height=entity[3]) for entity in channel_thumbnail_entities]
            channels.append(Channel(
                id=channel_entity[0], title=channel_entity[1], description=channel_entity[2], thumbnails=thumbnails))
    return channels


def fetch_channel_info(channel_id: str) -> dict:
    params = {
        'key': API_KEY,
        'part': 'snippet',
        'id': channel_id
    }
    response = requests.get(URL + 'channels', params=params)
    resource = response.json()
    return resource["items"][0]["snippet"]


def save_channel(channel_id: str, channel_info: dict):
    with conn.cursor() as cursor:
        cursor.execute('INSERT INTO channels VALUES(%s, %s, %s) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, "description" = EXCLUDED."description"',
                       (channel_id, channel_info["title"], channel_info["description"]))
        thumbnails = []
        versions = ["default", "medium", "high"]
        for version in versions:
            if version in channel_info["thumbnails"]:
                thumbnails.append((
                    channel_id,
                    version,
                    channel_info["thumbnails"][version]["url"],
                    channel_info["thumbnails"][version]["width"],
                    channel_info["thumbnails"][version]["height"]
                ))
        extras.execute_values(
            cursor, "INSERT INTO channel_thumbnails VALUES %s ON CONFLICT (channelId, version) DO UPDATE SET url = EXCLUDED.url, width = EXCLUDED.width, height = EXCLUDED.height", thumbnails)
        conn.commit()


@app.post("/channels/{channel_id}")
async def crawl_channel(response: Response, channel_id: str) -> Response:
    if not channel_id.startswith("UC"):
        response.status_code = 400
        return

    channel_info = fetch_channel_info(channel_id)
    save_channel(channel_id, channel_info)

    playlist_id = "UU" + channel_id[2:]
    params = {
        'key': API_KEY,
        'part': 'id,contentDetails,snippet',
        'playlistId': playlist_id,
        'maxResults': 50,
    }

    page_token = None
    video_entities = []
    thumbnails_by_video = []

    while (True):
        print(f"retrieved videos: {len(video_entities)}")
        if page_token is not None:
            params['pageToken'] = page_token
        response = requests.get(URL + 'playlistItems', params=params)
        resource = response.json()

        if "items" not in resource:
            pprint(resource)
        else:
            for item in resource['items']:
                video_id = item["contentDetails"]["videoId"]
                versions = ["default", "medium", "high"]
                thumbnails = []
                for version in versions:
                    if version in item["snippet"]["thumbnails"]:
                        thumbnails.append((
                            video_id,
                            version,
                            item["snippet"]["thumbnails"][version]["url"],
                            item["snippet"]["thumbnails"][version]["width"],
                            item["snippet"]["thumbnails"][version]["height"]
                        ))
                thumbnails_by_video.append(thumbnails)
                publishedAt = datetime.fromisoformat(
                    item["snippet"]["publishedAt"])
                video_entities.append(
                    (video_id, channel_id, item["snippet"]["title"], item["snippet"]["description"], publishedAt))

        if "nextPageToken" in resource:
            page_token = resource["nextPageToken"]
        else:
            print(f"finished retrieve. videos: {len(video_entities)}")
            break

    padding = 0

    def chunks(l, n):
        for i in range(padding, len(l), n):
            yield l[i:i + n]
    chunked = chunks(
        list(zip(video_entities, thumbnails_by_video)), RETRIVE_CHATS_CONCURRENCY)

    saved_count = padding
    for element in chunked:
        coroutines = []
        for video_entity, thumbnails in element:
            video_id = video_entity[0]
            coroutines.append(fetch_comments_chat_replay(video_id))
        results = await asyncio.gather(*coroutines)

        for (video_entity, thumbnails), (comments, chat_replay) in zip(element, results):
            save_video(video_entity, thumbnails, comments, chat_replay)
            saved_count += 1
            print(f"saved: {saved_count} / {len(video_entities)}")

        gc.collect()


@app.get("/channels/{channel_id}")
async def get_channel(response: Response, channel_id: str) -> Channel:
    with conn.cursor() as cursor:
        cursor.execute(
            'SELECT title, description FROM channels WHERE id=%s', (channel_id,))
        channel_entity = cursor.fetchall()[0]
        cursor.execute(
            'SELECT version, url, width, height FROM channel_thumbnails WHERE channelId=%s', (channel_id,))
        channel_thumbnail_entities = cursor.fetchall()
        thumbnails = [Thumbnail(version=entity[0], url=entity[1], width=entity[2],
                                height=entity[3]) for entity in channel_thumbnail_entities]
        return Channel(id=channel_id, title=channel_entity[0], description=channel_entity[1], thumbnails=thumbnails)


def get_video_from_entity(video_entity):
    video_id = video_entity[0]
    comments, chat_replay = get_comments_chat_replay(video_id)
    with conn.cursor() as cursor:
        cursor.execute(
            'SELECT version, url, width, height FROM video_thumbnails WHERE videoId=%s', (video_id,))
        video_thumbnail_entities = cursor.fetchall()
    thumbnails = [Thumbnail(version=entity[0], url=entity[1], width=entity[2],
                            height=entity[3]) for entity in video_thumbnail_entities]
    if chat_replay is not None:
        return LiveArchive(id=video_id, title=video_entity[1], description=video_entity[2], publishedAt=video_entity[3], thumbnails=thumbnails, comments=comments, chat_replay=chat_replay)
    else:
        return Video(id=video_id, title=video_entity[1], description=video_entity[2], publishedAt=video_entity[3], thumbnails=thumbnails, comments=comments)


def get_videos_from_entities(video_entities):
    videos = []
    for video_entity in video_entities:
        video_id = video_entity[0]
        with conn.cursor() as cursor:
            cursor.execute(
                'SELECT version, url, width, height FROM video_thumbnails WHERE videoId=%s', (video_id,))
            video_thumbnail_entities = cursor.fetchall()
        thumbnails = [Thumbnail(version=entity[0], url=entity[1], width=entity[2],
                                height=entity[3]) for entity in video_thumbnail_entities]
        videos.append(Video(
            id=video_id, title=video_entity[1], description=video_entity[2], publishedAt=video_entity[3], thumbnails=thumbnails, comments=[]))
    return videos


@app.get("/channels/{channel_id}/videos")
async def get_channel_videos(response: Response, channel_id: str) -> list[Video | LiveArchive]:
    with conn.cursor() as cursor:
        cursor.execute(
            'SELECT id, title, "description", publishedAt FROM videos WHERE channelId=%s', (channel_id,))
        video_entities = cursor.fetchall()
        return get_videos_from_entities(video_entities)


@app.get("/videos")
async def search_comments(response: Response, word: str) -> list[Video | LiveArchive]:
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT videoId FROM comments WHERE text like %s", (f"%{word}%",))
        video_ids_in_comments = cursor.fetchall()
        cursor.execute(
            "SELECT videoId FROM chats WHERE text like %s", (f"%{word}%",))
        video_ids_in_chats = cursor.fetchall()
        video_ids = tuple(set(video_ids_in_comments) | set(video_ids_in_chats))

        cursor.execute(
            'SELECT id, title, "description", publishedAt FROM videos WHERE id IN %s', (video_ids,))
        video_entities = cursor.fetchall()
        return get_videos_from_entities(video_entities)
