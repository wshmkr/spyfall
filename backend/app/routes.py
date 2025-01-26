from fastapi import APIRouter, HTTPException, Request, status
from app.models import (
    CheckLobbyResponse,
    CreateLobbyResponse,
    Lobby,
    CreateLobbyRequest,
    CheckLobbyRequest,
)
import uuid

from app.utils import sanitize_name

router = APIRouter()


@router.post(
    "/lobby",
    tags=["lobby"],
    response_description="Create a new lobby",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateLobbyResponse,
)
def create_lobby(request: Request, body: CreateLobbyRequest):
    lobby = Lobby()
    # todo: handle id collision
    request.app.database["Lobby"].insert_one(lobby.model_dump(by_alias=True))
    print(f"Created a lobby with code {lobby.id}")

    sanitized_name = sanitize_name(body.playerName)
    return CreateLobbyResponse(
        lobbyId=lobby.id, playerId=lobby.creator, playerName=sanitized_name
    )


@router.post(
    "/lobby/{lobby_id}",
    tags=["lobby"],
    response_description="Check if lobby exists",
    status_code=status.HTTP_200_OK,
    response_model=CheckLobbyResponse,
)
def check_lobby(lobby_id: str, request: Request, body: CheckLobbyRequest):
    database = request.app.database["Lobby"]
    if (database.find_one({"_id": lobby_id})) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lobby with code {lobby_id} not found",
        )

    sanitized_name = sanitize_name(body.playerName)
    return CheckLobbyResponse(
        lobbyId=lobby_id, playerId=uuid.uuid4().hex, playerName=sanitized_name
    )
