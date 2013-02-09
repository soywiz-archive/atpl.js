@echo off

SET REPORTER=dot
.\node_modules\.bin\mocha --ui exports --globals name --reporter %REPORTER% -g ".*%1.*"