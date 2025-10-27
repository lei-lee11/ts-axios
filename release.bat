@echo off
setlocal enabledelayedexpansion

echo Enter release version:
set /p VERSION=

echo Releasing %VERSION% - are you sure? (y/n)
set /p REPLY=

if /i "!REPLY!"=="y" (
  echo Releasing %VERSION% ...
  
  REM commit
  git add -A
  git commit -m "[build] %VERSION%"
  npm version %VERSION% --message "[release] %VERSION%"
  git push origin master
  
  REM publish
  npm publish
) else (
  echo Release cancelled.
)

pause