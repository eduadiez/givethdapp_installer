#!/bin/sh
npm install --prefix /usr/src/app/
sleep 5
npm run testrpc --prefix /usr/src/app/ &
node /usr/src/app/scripts/deploy.js && npm start --prefix /usr/src/app/