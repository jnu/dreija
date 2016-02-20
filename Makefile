BUILD        = ./dist
NODE_MODULES = ./node_modules
NPM_BIN      = $(shell npm bin)

.PHONY: build clean install lint shrinkwrap watch devimg

all: build

build: shrinkwrap
	NODE_ENV=production $(NPM_BIN)/webpack --bail

shrinkwrap: $(NODE_MODULES)
	npm prune
	npm shrinkwrap

lint: $(NODE_MODULES)
	$(NPM_BIN)/eslint  --ext .js,.jsx ./src

clean:
	rm -rf $(BUILD)
	rm -rf $(NODE_MODULES)

$(NODE_MODULES):
	npm install
	npm prune

# up: $(NODE_MODULES) $(BUILD) stop start

devimg: lint
	docker build -t "joen/dreija:dev" .


watch: $(NODE_MODULES)
	$(NPM_BIN)/webpack --watch
