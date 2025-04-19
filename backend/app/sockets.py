import json
import random
import time

from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

from app.models import Player, Lobby, sanitize_name, sanitize_lobby_id


class PlayerMetadata:
    def __init__(self, lobby_id: str, player_id: str):
        self.lobby_id = lobby_id
        self.player_id = player_id


class ConnectionManager:
    def __init__(self):
        self.lobby_to_connections: dict[str, list[WebSocket]] = {}
        self.connection_to_metadata: dict[WebSocket, PlayerMetadata] = {}

    async def connect(self, connection: WebSocket):
        await connection.accept()

    async def send_event(
        self, connection: WebSocket, event_type: str, data: dict[str, any]
    ):
        await connection.send_json({"type": event_type, "data": data})

    async def broadcast_event(
        self, lobby_id: str, event_type: str, data: dict[str, any]
    ):
        for connection in self.lobby_to_connections[lobby_id]:
            await self.send_event(connection, event_type, data)

    async def handle_player_join(
        self, connection: WebSocket, lobby_id: str, player_id: str, player_name: str
    ):
        lobby_id = sanitize_lobby_id(lobby_id)
        player_name = sanitize_name(player_name)

        if (lobby := await Lobby.get(lobby_id)) is None or player_name == "":
            await self.send_event(connection, "GO_HOME", {})
            return

        if lobby_id not in self.lobby_to_connections:
            self.lobby_to_connections[lobby_id] = []
        self.lobby_to_connections[lobby_id].append(connection)
        self.connection_to_metadata[connection] = PlayerMetadata(lobby_id, player_id)

        # reconnect if player already in lobby
        player_by_id = next(
            (player for player in lobby.players if player.id == player_id), None
        )
        if player_by_id is not None:
            player_by_id.name = player_name
            player_by_id.disconnected = False
            await lobby.save()
            await self.broadcast_event(
                lobby_id,
                "PLAYER_RECONNECT",
                {"playerId": player_id, "playerName": player_name},
            )
            with open("location-packs/location-pack-1.json") as json_file:
                location_pack = json.load(json_file)
                await self.send_event(
                    connection,
                    "POSSIBLE_LOCATIONS",
                    {
                        "locations": [
                            location["name"] for location in location_pack["locations"]
                        ]
                    },
                )
        # handle player join
        else:
            # handle player name collision
            dedupe_num = 0
            for player in lobby.players:
                if player.name == player_name:
                    dedupe_num = max(player.dedupe + 1, dedupe_num)

            player = Player(id=player_id, name=player_name, dedupe=dedupe_num)
            lobby.players.append(player)
            await lobby.save()

            await self.broadcast_event(
                lobby_id,
                "PLAYER_JOIN",
                {
                    "playerId": player_id,
                    "playerName": player_name,
                    "dedupe": dedupe_num,
                },
            )

        await self.send_event(
            connection,
            "LOBBY_STATE",
            {"lobby": lobby.model_dump()},
        )

    async def handle_player_leave(self, connection: WebSocket):
        metadata = self.connection_to_metadata.pop(connection, None)
        if metadata is None:
            return
        player_id = metadata.player_id
        lobby_id = metadata.lobby_id
        self.lobby_to_connections[lobby_id].remove(connection)

        lobby = await Lobby.get(lobby_id)

        # pass lobby leader if they leave
        if lobby.creator == player_id:
            new_creator = next(
                (player for player in lobby.players if player.id != player_id), None
            )
            if new_creator is not None:
                lobby.creator = new_creator.id
                await lobby.save()
                await self.broadcast_event(
                    lobby_id,
                    "CREATOR_CHANGE",
                    {"playerId": new_creator.id},
                )

        player = next((player for player in lobby.players if player.id == player_id))
        # game not started
        if lobby.start_time is None:
            lobby.players.remove(player)
            await lobby.save()
            await self.broadcast_event(
                lobby_id,
                "PLAYER_LEAVE",
                {"playerId": player_id},
            )
        # game in progress
        else:
            player.disconnected = True
            await lobby.save()
            await self.broadcast_event(
                lobby_id,
                "PLAYER_DISCONNECT",
                {"playerId": player_id},
            )

    async def handle_player_rename(self, connection: WebSocket, player_name: str):
        player_name = sanitize_name(player_name)
        if player_name == "":
            return

        metadata = self.connection_to_metadata.get(connection)
        player_id = metadata.player_id
        lobby_id = metadata.lobby_id

        lobby = await Lobby.get(lobby_id)

        player_by_id = next(
            (player for player in lobby.players if player.id == player_id), None
        )

        if player_by_id.name != player_name:
            dedupe_num = 0
            for player in lobby.players:
                if player.name == player_name:
                    dedupe_num = max(player.dedupe + 1, dedupe_num)

            player_by_id.name = player_name
            player_by_id.dedupe = dedupe_num
            await lobby.save()

            await self.broadcast_event(
                lobby_id,
                "PLAYER_RENAME",
                {
                    "playerId": player_id,
                    "playerName": player_name,
                    "dedupe": dedupe_num,
                },
            )

    async def handle_player_kick(self, connection: WebSocket, player_id: str):
        metadata = self.connection_to_metadata.get(connection)
        lobby_id = metadata.lobby_id

        lobby = await Lobby.get(lobby_id)
        if lobby.creator != metadata.player_id:
            return

        for connect in self.lobby_to_connections[lobby_id]:
            metadata = self.connection_to_metadata.get(connect)
            if metadata.player_id == player_id:
                await self.send_event(connect, "GO_HOME", {})

    async def handle_start_game(self, connection: WebSocket):
        metadata = self.connection_to_metadata.get(connection)
        lobby_id = metadata.lobby_id

        lobby = await Lobby.get(lobby_id)
        if len(lobby.players) < 3:
            return

        with open("location-packs/location-pack-1.json") as json_file:
            location_pack = json.load(json_file)
            location = random.choice(location_pack["locations"])

            spy = random.choice(lobby.players)
            spy.role = "Spy"

            for player in lobby.players:
                if player.role != "Spy":
                    role = random.choice(location["roles"])
                    location["roles"].remove(role)
                    player.role = role["name"]

            await self.broadcast_event(
                lobby_id,
                "POSSIBLE_LOCATIONS",
                {
                    "locations": [
                        location["name"] for location in location_pack["locations"]
                    ]
                },
            )

        lobby.start_time = int(time.time())
        lobby.location = location["name"]
        await lobby.save()

        await self.broadcast_event(
            lobby_id,
            "LOBBY_STATE",
            {"lobby": lobby.model_dump()},
        )

    async def handle_reset_game(self, connection: WebSocket):
        metadata = self.connection_to_metadata.get(connection)
        lobby_id = metadata.lobby_id

        lobby = await Lobby.get(lobby_id)
        lobby.start_time = None
        lobby.location = None
        for player in lobby.players:
            player.role = None
        lobby.players = [player for player in lobby.players if not player.disconnected]
        await lobby.save()

        await self.broadcast_event(
            lobby_id,
            "LOBBY_STATE",
            {"lobby": lobby.model_dump()},
        )


websocket_router = APIRouter()
manager = ConnectionManager()


@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            event = await websocket.receive_json()
            event_type = event["type"]
            event_data = event["data"]

            match event_type:
                case "PLAYER_JOIN":
                    await manager.handle_player_join(
                        websocket,
                        event_data["lobbyId"],
                        event_data["playerId"],
                        event_data["playerName"],
                    )
                case "PLAYER_RENAME":
                    await manager.handle_player_rename(
                        websocket,
                        event_data["playerName"],
                    )
                case "KICK_PLAYER":
                    await manager.handle_player_kick(websocket, event_data["playerId"])
                case "START_GAME":
                    await manager.handle_start_game(websocket)
                case "RESET_GAME":
                    await manager.handle_reset_game(websocket)
                case _:
                    print(f"Received event with unhandled type: {event}")

    except WebSocketDisconnect:
        await manager.handle_player_leave(websocket)
