from fastapi import Body, FastAPI
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import time

from custom_types import CourseItem, PracticeItem, QuizItem

AUDIO_DIR = os.path.join(os.getcwd(), "audio")
COURSE_ITEMS_PATH = "dataset/jp.json"
PRACTICE_ITEMS_PATH = "dataset/jp_progress.json"


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/fcpwa-health")
async def read_root():
    return Response("fcpwa")  # can consider returning server version here


@app.get("/audio/{item_id}", response_class=FileResponse)
async def read_item(item_id: str):
    file_path = os.path.join(AUDIO_DIR, item_id)
    return FileResponse(file_path, filename=item_id, media_type="audio/mpeg")


# unused
@app.get("/course-item-ids", response_class=JSONResponse)
async def get_course_item_ids():
    with open(COURSE_ITEMS_PATH, "r", encoding="utf-8") as f:
        course_items: list[CourseItem] = json.load(f)
    ids = [item["id"] for item in course_items]
    return ids


# unused
@app.post("/course-items", response_class=JSONResponse)
async def get_course_items(ids: list[str] | None = Body(default=None)):
    with open(COURSE_ITEMS_PATH, "r", encoding="utf-8") as f:
        course_items: list[CourseItem] = json.load(f)
    if ids is None or len(ids) == 0:
        # send all
        return course_items
    # need to filter by ids
    id_set = set(ids)
    filtered_items = filter(lambda x: x["id"] in id_set, course_items)
    return list(filtered_items)


# unused
@app.post("/practice-items", response_class=JSONResponse)
async def get_practice_items(ids: list[str] | None = Body(default=None)):
    with open(PRACTICE_ITEMS_PATH, "r", encoding="utf-8") as f:
        practice_items: list[PracticeItem] = json.load(f)
    if ids is None or len(ids) == 0:
        # send all
        return practice_items
    # need to filter by ids
    id_set = set(ids)
    filtered_items = filter(lambda x: x["courseItemId"] in id_set, practice_items)
    return list(filtered_items)


@app.post("/jp", response_class=JSONResponse)
def jp(ids: list[str] | None = Body(default=None)):
    with open(COURSE_ITEMS_PATH, "r", encoding="utf-8") as f:
        course_items: list[CourseItem] = json.load(f)
    with open(PRACTICE_ITEMS_PATH, "r", encoding="utf-8") as f:
        practice_items: list[PracticeItem] = json.load(f)
    practice_items_map: dict[str, PracticeItem] = {}
    for item in practice_items:
        practice_items_map[item["courseItemId"]] = item
    quiz_items: list[QuizItem] = []

    exclude_set = set(ids if ids is not None else [])
    filtered_course_items = filter(lambda x: x["id"] not in exclude_set, course_items)
    for item in filtered_course_items:
        practice_item = practice_items_map.get(item["id"], None)
        if practice_item is None:
            raise Exception(f"item {item['id']} not found")
        quiz_items.append(
            {
                "courseItem": item,
                "practiceItem": practice_item,
            }
        )
    return quiz_items


@app.post("/sync", response_class=JSONResponse)
async def sync_progress(user_practice_items: list[PracticeItem]):
    # only update item in sqlite if date is newer
    # likewise only send items back to user if date is newer
    # (1) from user's payload, find items whose date is newer than in the db, update these in db
    # (2) from db, find items whose date is newer than user's payload, return this in response

    # make dict with index for easy searching
    client_item_map: dict[str, PracticeItem] = {}
    for item in user_practice_items:
        client_item_map[item["courseItemId"]] = item

    client_items_to_update: list[PracticeItem] = []
    server_items_to_update: list[PracticeItem] = []

    # compare client items with server ones
    with open(PRACTICE_ITEMS_PATH, "r", encoding="utf-8") as f:
        server_practice_items: list[PracticeItem] = json.load(f)
    for server_item in server_practice_items:
        client_item = client_item_map.get(server_item["courseItemId"], None)
        # server item is not present in client
        if client_item is None:
            client_items_to_update.append(server_item)
        # client item is newer than server item
        elif client_item["date"] > server_item["date"]:
            server_items_to_update.append(client_item)
        elif server_item["date"] > client_item["date"]:
            client_items_to_update.append(server_item)

    # update outdated server items
    server_item_map: dict[str, PracticeItem] = {}
    for item in server_practice_items:
        server_item_map[item["courseItemId"]] = item
    for item in server_items_to_update:
        server_item_map[item["courseItemId"]] = item
    final_server_items: list[PracticeItem] = list(server_item_map.values())
    with open(PRACTICE_ITEMS_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(final_server_items))

    return client_items_to_update


@app.post("/backup-progress", response_class=JSONResponse)
async def backup_progress(user_practice_items: list[PracticeItem]):
    timestamp = str(int(time.time()))
    with open(f"dataset/jp_progress_backup_{timestamp}.json") as f:
        f.write(json.dumps(user_practice_items))
