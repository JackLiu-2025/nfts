.PHONY: help build up down restart logs shell clean test health

help:
	@echo "NFT Marketplace Backend - Docker Commands"
	@echo "=========================================="
	@echo "make build       - Build Docker image"
	@echo "make up          - Start services"
	@echo "make down        - Stop services"
	@echo "make restart     - Restart services"
	@echo "make logs        - View logs"
	@echo "make shell       - Enter container shell"
	@echo "make clean       - Clean up containers and images"
	@echo "make test        - Run tests"
	@echo "make health      - Check service health"
	@echo "make prod-build  - Build production image"
	@echo "make prod-up     - Start production services"
	@echo "make prod-down   - Stop production services"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "✅ Services started"
	@echo "API: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend bash

clean:
	docker-compose down --rmi all -v
	docker system prune -f

test:
	docker-compose exec backend pytest

health:
	@curl -f http://localhost:8000/health && echo "\n✅ Service is healthy" || echo "\n❌ Service is not healthy"

# Production commands
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production services started"

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f
