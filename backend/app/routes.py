from fastapi import APIRouter, HTTPException, Response, status
from app.models import (
    CheckLobbyResponse,
    CreateLobbyResponse,
    Lobby,
    CreateLobbyRequest,
    CheckLobbyRequest,
)


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
    description="Create a new lobby",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateLobbyResponse,
)
async def create_lobby(body: CreateLobbyRequest):
    lobby = Lobby(creator=body.playerId)
    # todo: handle id collision
    await lobby.insert()
    print(f"Created a lobby with code {lobby.id}")

    return CreateLobbyResponse(
        lobbyId=lobby.id, playerId=body.playerId, playerName=body.playerName
    )


@router.post(
    "/lobby/{lobby_id}",
    tags=["lobby"],
    description="Check if lobby exists",
    status_code=status.HTTP_200_OK,
    response_model=CheckLobbyResponse,
)
async def check_lobby(lobby_id: str, body: CheckLobbyRequest):
    if (await Lobby.get(lobby_id)) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lobby with code {lobby_id} not found",
        )

    return CheckLobbyResponse(
        lobbyId=lobby_id, playerId=body.playerId, playerName=body.playerName
    )
