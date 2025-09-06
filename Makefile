.PHONY: up down build logs lint test mobile

up:
	docker-compose up --build

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f backend

lint:
	pre-commit run --all-files

test:
	docker-compose run --rm backend pytest --disable-warnings -q

mobile:
	docker-compose up mobile
