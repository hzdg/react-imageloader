# build\:node:

# build\:browser:

# build: build\:node build\:browser

# bump:

# test:

dev:
	babel-node ./test/server.js --open

.PHONY: dev
