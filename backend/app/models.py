import random
import string
import uuid

from beanie import Document
from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated


def sanitize_name(name):
    name = name.strip()
    return name[:24] if len(name) > 24 else name


def valid_uuid(value):
    try:
        return uuid.UUID(value, version=4).hex
    except ValueError:
        return uuid.uuid4().hex


class Player(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    name: Annotated[str, BeforeValidator(sanitize_name)]
    role: Optional[str] = None
    dedupe: Optional[int] = 0
    disconnected: bool = False


class Lobby(Document):
    @staticmethod
    def generate_id() -> str:
        characters = string.ascii_letters + string.digits
        return "".join(random.choice(characters) for _ in range(4)).upper()

    id: str = Field(default_factory=generate_id)
    creator: str = Field(default_factory=lambda: uuid.uuid4().hex)
    players: List[Player] = Field(default_factory=list)
    location: Optional[str] = None
    start_time: Optional[int] = None
    duration: int = Field(default=480)  # seconds


class CreateLobbyRequest(BaseModel):
    playerName: Annotated[str, BeforeValidator(sanitize_name)]
    playerId: Annotated[str, BeforeValidator(valid_uuid)]


class CheckLobbyRequest(BaseModel):
    playerName: Annotated[str, BeforeValidator(sanitize_name)]
    playerId: Annotated[str, BeforeValidator(valid_uuid)]


class CreateLobbyResponse(BaseModel):
    lobbyId: str
    playerId: str
    playerName: str


class CheckLobbyResponse(BaseModel):
    playerId: str
    lobbyId: str
    playerName: str
