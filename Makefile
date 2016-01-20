test: check

install:
	npm install

check:
	npm test

frontend:
	npm run-script frontend

clean: clear

clear:
	rm public/dist/ -rf
	rm node_modules/ -rf
	rm bower_components/ -rf