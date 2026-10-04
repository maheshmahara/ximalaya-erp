SHELL := /bin/bash
PROJECT_NAME := ximalaya-erp
COMPOSE_FILE := infra/docker-compose.prod.yml

.PHONY: help init up down test db-seed

help:
	@echo "Ximalaya Coffee Group ERP Controller"
	@echo "make up     - Spin up Docker Compose stack"
	@echo "make down   - Stop containers"
	@echo "make test   - Run integration tests"

init:
	git branch -M main

up:
	docker compose -f $(COMPOSE_FILE) up -d --build

down:
	docker compose -f $(COMPOSE_FILE) down

test:
	docker compose -f $(COMPOSE_FILE) run --rm api pytest -v tests/
