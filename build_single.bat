@echo off
node node_modules\typescript\bin\tsc.js -cflowu --target ES3 lib\atpl.ts -out atpl.js
