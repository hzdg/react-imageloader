build\:node:
	babel src --out-dir lib

build\:browser:
	babel-node ./node_modules/.bin/webpack --config ./webpack.config.js

# bump:

test:
	babel-node ./test/server.js

dev:
	babel-node ./test/server.js --open

.PHONY: dev test build\:node build\:browser
