@echo off

GOTO start

:add_test
SET TESTS=%TESTS% "%1"
EXIT /B

:start

SET TESTS=
FOR %%X IN (test\*.js) DO CALL :add_test %%X

REM echo %TESTS%
REM SET REPORTER=spec
SET REPORTER=dot
call build_release.bat && mocha --ui exports --globals name --reporter %REPORTER% %TESTS% -g ".*%1.*"