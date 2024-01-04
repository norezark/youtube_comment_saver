FROM python:3.11

RUN apt-get update && apt-get install -y \
    gconf-service \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxss1 \
    libxtst6 \
    libappindicator1 \
    libnss3 \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY ./pyproject.toml /pyproject.toml

RUN  curl -sSL https://install.python-poetry.org | python3 - && /root/.local/bin/poetry install

WORKDIR /app

ENTRYPOINT [ "/root/.local/bin/poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--loop", "asyncio", "--reload" ]
