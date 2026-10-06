FROM python:3.12-slim

WORKDIR /workspace

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    "fastapi>=0.111.0" \
    "uvicorn[standard]>=0.30.0" \
    "sqlalchemy[asyncio]>=2.0.30" \
    "greenlet>=3.0.3" \
    "asyncpg>=0.29.0" \
    "psycopg2-binary>=2.9.9" \
    "pydantic>=2.7.0" \
    "celery>=5.4.0" \
    "redis>=5.0.4"

COPY . /workspace

EXPOSE 8000

ENV PYTHONPATH=/workspace
CMD ["uvicorn", "apps.api.src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
