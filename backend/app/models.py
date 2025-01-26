import random
import string
import uuid

from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated


def sanitize_name(name):
    name = name.strip()
    return name[:16] if len(name) > 16 else name


class Player(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: Annotated[str, BeforeValidator(sanitize_name)]
    role: Optional[str] = None
    dedupe: Optional[int] = 0


class Lobby(BaseModel):
    @staticmethod
    def generate_id() -> str:
        characters = string.ascii_letters + string.digits
        return "".join(random.choice(characters) for _ in range(4)).upper()

    id: str = Field(alias="_id", default_factory=generate_id)
    creator: str = Field(default_factory=lambda: uuid.uuid4().hex)
    players: List[Player] = Field(default_factory=list)
    location: Optional[str] = None
    start_time: Optional[int] = None
    duration: int = Field(default=480)  # seconds


class CreateLobbyRequest(BaseModel):
    playerName: Annotated[str, BeforeValidator(sanitize_name)]


class CheckLobbyRequest(BaseModel):
    playerName: Annotated[str, BeforeValidator(sanitize_name)]


class CreateLobbyResponse(BaseModel):
    lobbyId: str
    playerId: str
    playerName: str


class CheckLobbyResponse(BaseModel):
    playerId: str
    lobbyId: str
    playerName: str
