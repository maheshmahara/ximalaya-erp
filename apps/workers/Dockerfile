FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml .
RUN pip install --no-cache-dir celery redis psycopg2-binary
COPY . .
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
