BUILD        = ./dist
NODE_MODULES = ./node_modules
NPM_BIN      = $(shell npm bin)

.PHONY: build clean install lint shrinkwrap up watch

all: build

build: shrinkwrap
	NODE_ENV=production $(NPM BIN)/webpack --bail

shrinkwrap: install
	npm prune
	npm shrinkwrap

lint: install
	$(NPM_BIN)/eslint  --ext .js,.jsx ./src

clean:
	rm -rf $(BUILD)
	rm -rf $(NODE_MODULES)

install:
	npm install
	npm prune

up: install
	NODE_PATH=./src/shared/ node ./src/server/app.js

watch: install
	$(npm bin)/webpack --watch
