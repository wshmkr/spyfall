from fastapi import APIRouter, HTTPException, Response, status
from uvicorn.logging import logging

from app.models import (
    CheckLobbyRequest,
    CheckLobbyResponse,
    CreateLobbyRequest,
    CreateLobbyResponse,
    Lobby,
    sanitize_lobby_id,
)

logger = logging.getLogger("uvicorn")

router = APIRouter()


@router.get(
    "/",
    description="Dummy endpoint to mitigate cold start",
    status_code=status.HTTP_200_OK,
)
def default():
    return Response(status_code=status.HTTP_200_OK)


@router.post(
    "/lobby",
    tags=["lobby"],
    description="Create a new lobby and verify player info",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateLobbyResponse,
)
async def create_lobby(body: CreateLobbyRequest):
    max_attempts = 10
    for _ in range(max_attempts):
        lobby = Lobby(creator=body.playerId)
        if await Lobby.get(lobby.id) is None:
            await lobby.insert()
            logger.info("Created a lobby with code %s.", lobby.id)
            return CreateLobbyResponse(
                lobbyId=lobby.id, playerId=body.playerId, playerName=body.playerName
            )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to generate a unique lobby ID after {max_attempts} attempts",
    )


@router.post(
    "/lobby/{lobby_id}",
    tags=["lobby"],
    description="Check if lobby exists and verify player info",
    status_code=status.HTTP_200_OK,
    response_model=CheckLobbyResponse,
)
async def check_lobby(lobby_id: str, body: CheckLobbyRequest):
    lobby_id = sanitize_lobby_id(lobby_id)
    if (await Lobby.get(lobby_id)) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lobby with code {lobby_id} not found",
        )

    return CheckLobbyResponse(
        lobbyId=lobby_id, playerId=body.playerId, playerName=body.playerName
    )
