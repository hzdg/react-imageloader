node:
	./node_modules/.bin/babel --stage=0 src --out-dir lib

browser:
	./node_modules/.bin/babel-node ./node_modules/.bin/webpack --config ./webpack.config.js

build: node browser

test:
	./node_modules/.bin/babel-node ./test/server.js

dev:
	./node_modules/.bin/babel-node ./test/server.js --open

major:
	mversion major

minor:
	mversion minor

patch:
	mversion patch

changelog.template.ejs:
	@echo "## x.x.x\n\n<% commits.forEach(function(commit) { -%>\n* <%= commit.title %>\n<% }) -%>" > changelog.template.ejs

changelog: changelog.template.ejs
	@git-release-notes $$(git describe --abbrev=0)..HEAD $< | cat - CHANGELOG.md >> CHANGELOG.md.new
	@mv CHANGELOG.md{.new,}
	@rm changelog.template.ejs
	@echo "Added changes since $$(git describe --abbrev=0) to CHANGELOG.md"

.PHONY: dev test changelog major minor patch
