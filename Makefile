node:
	babel src --out-dir lib

browser:
	babel-node ./node_modules/.bin/webpack --config ./webpack.config.js

build: node browser

major:
	mversion major

minor:
	mversion minor

patch:
	mversion patch

test:
	babel-node ./test/server.js

dev:
	babel-node ./test/server.js --open

.PHONY: dev test major minor patch
