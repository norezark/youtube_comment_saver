import asyncio

from bs4 import BeautifulSoup
import ast
import requests
import requests_html
import re
import sys


# HTTPリクエストのセッション
session = requests_html.AsyncHTMLSession()


async def get_youtube_live_chat_replay(video_id):
    print(f"get {video_id}")
    # URLの頭部分
    youtube_url = "https://www.youtube.com/watch?v="
    # 目的の動画のURL
    target_url = youtube_url + video_id
    dict_str = None
    next_url = ''
    # コメントデータ
    comment_data = []
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'}

    # 動画ページの取得
    resp = await session.get(target_url)
    print("start render")
    await resp.html.arender(sleep=5)  # レンダリング完了のため20秒まつ
    print("finished render")

    for iframe in resp.html.find("iframe"):
        if ("live_chat_replay" in iframe.attrs["src"]):
            next_url = "".join(
                ["https://www.youtube.com", iframe.attrs["src"]])

    if not next_url:
        return None

    while (True):
        try:
            html = await session.get(next_url, headers=headers)
            soup = BeautifulSoup(html.text, 'lxml')

            dict_str = None
            for script in soup.find_all('script'):
                script_text = str(script)
                if 'ytInitialData' in script_text:
                    dict_str = ''.join(script_text.split(" = ")[1:])
            if dict_str is None:
                continue

            # boolの表記をPython dictで扱えるように変換する
            dict_str = dict_str.replace("false", "False")
            dict_str = dict_str.replace("true", "True")

            tmp = dict_str
            # jsonから余分なHTMLを分割して捨てる
            dict_str = re.sub(r'};.*', '}', dict_str)

            dics = ast.literal_eval(dict_str)

            # これ以上continuationsもactionsもない場合、最後のループでKeyErrorが発生する。その場合はおとなしくループを抜けます。
            continue_url = dics["continuationContents"]["liveChatContinuation"][
                "continuations"][0]["liveChatReplayContinuationData"]["continuation"]
            next_url = "https://www.youtube.com/live_chat_replay?continuation=" + continue_url

            comment_data += dics["continuationContents"]["liveChatContinuation"]["actions"]

        # next_urlが入手できなくなったら終わり
        except requests.ConnectionError:
            print("Connection Error")
            continue
        except requests.HTTPError:
            print("HTTPError")
            continue
        except requests.Timeout:
            print("Timeout")
            continue
        except requests.exceptions.RequestException as e:
            print(e)
            break
        except KeyError as e:
            error = str(e)
            if 'liveChatReplayContinuationData' in error:
                print('Hit last live chat segment, finishing job.')
            else:
                print("KeyError")
                print(e)
            break
        except SyntaxError as e:
            print("SyntaxError")
            print(e)
            print(tmp)
            break
        except KeyboardInterrupt:
            break
        except Exception:
            print("Unexpected error:" + str(sys.exc_info()[0]))
    print(f"finish retrive. chats: {len(comment_data)}")

    def is_valid_comment(c: dict):
        return 'addChatItemAction' in c['replayChatItemAction']['actions'][0] \
            and "liveChatTextMessageRenderer" in c['replayChatItemAction']['actions'][0]['addChatItemAction']['item']

    comment_data = list(filter(is_valid_comment, comment_data))

    def covert_comment_data(comment: dict):
        info = comment['replayChatItemAction']['actions'][0]['addChatItemAction']['item']['liveChatTextMessageRenderer']
        text = ""
        try:
            for fragment in info['message']['runs']:
                if 'text' in fragment:
                    text += fragment['text']
                elif "emoji" in fragment:
                    text += fragment["emoji"]["shortcuts"][0] if "shortcuts" in fragment["emoji"] else ":unknown-emoji:"
        except Exception as e:
            print(e)
        return {
            "authorName": info['authorName']['simpleText'],
            "text": text,
            "timestampText": info["timestampText"]["simpleText"],
            "timestampUsec": info["timestampUsec"]
        }

    simple_comment_data = list(map(covert_comment_data, comment_data))

    return simple_comment_data


async def main():
    comment_data = await get_youtube_live_chat_replay("LhNiQvWUYg8")
    print(comment_data)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
