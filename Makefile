DOCKERIP := $(shell docker-machine ip)
.PHONY: watch

watch:
	./lib/cli/dreija.js --watch --secrets ./src/app/demo/secrets.json --app ./src/app/demo/app.js --env DBHOST="$(DOCKERIP)" --env REDISHOST="$(DOCKERIP)"
