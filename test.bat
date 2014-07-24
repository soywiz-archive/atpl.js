@echo off

SET REPORTER=spec
.\node_modules\.bin\mocha --ui exports --globals name --reporter %REPORTER% -g ".*%1.*"