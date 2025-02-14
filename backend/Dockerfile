# syntax = docker/dockerfile:1

ARG PYTHON_VERSION=3.10
FROM python:${PYTHON_VERSION}-slim-bookworm

# Download uv
COPY --from=ghcr.io/astral-sh/uv:0.5.31 /uv /uvx /bin/

ADD . /app
WORKDIR /app

# Install modules, freeze lockfile before run, and compile bytecode
RUN uv sync --frozen --compile-bytecode

# Start the server
EXPOSE 8000
CMD ["uv", "run", "fastapi", "run"]
