FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    "celery>=5.4.0" \
    "redis>=5.0.4" \
    "psycopg2-binary>=2.9.9"

COPY . .

# Run Celery worker with embedded beat (-B) scheduler and schedule file in /tmp
CMD ["celery", "-A", "tasks", "worker", "-B", "-s", "/tmp/celerybeat-schedule", "--loglevel=info"]
