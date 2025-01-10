from fastapi import APIRouter, Body, Request, status
from fastapi.encoders import jsonable_encoder
from typing import List
from models import Lobby, CreateLobbyResponse

import random
import string

router = APIRouter()

@router.post("/lobby", tags=["lobby"], response_description="Create a new lobby", status_code=status.HTTP_201_CREATED, response_model=CreateLobbyResponse)
def create_book(request: Request, lobby: Lobby = Body(...)):
    lobby = jsonable_encoder(lobby)
    code = random.choice(string.ascii_uppercase) + str(random.randint(0, 9)) + random.choice(string.ascii_uppercase) + str(random.randint(0, 9))
    lobby["code"] = code

    new_lobby = request.app.database["Lobby"].insert_one(lobby)
    created_lobby = request.app.database["Lobby"].find_one(
        {"_id": new_lobby.inserted_id}
    )

    return { "id": str(created_lobby["_id"]), "code": created_lobby["code"] }
