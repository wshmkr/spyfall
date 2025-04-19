import os
from contextlib import asynccontextmanager

import motor.motor_asyncio
from beanie import init_beanie
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.logging import logging

from app.models import Lobby
from app.routes import router
from app.sockets import websocket_router

logger = logging.getLogger("uvicorn")

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    uri = os.environ.get("DB_URI", None)
    database = os.environ.get("DB_NAME", None)
    if uri is None or database is None:
        raise Exception(".env is not properly configured")
    app.mongodb_client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    database = app.mongodb_client.get_database(database)
    await init_beanie(
        database=database,
        document_models=[Lobby],
    )
    logger.info("Connected to the MongoDB database.")
    yield
    logger.info("Database shutdown.")
    app.mongodb_client.close()


app = FastAPI(lifespan=lifespan)

app.include_router(router)
app.include_router(websocket_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://spyfall.playdat.es",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
