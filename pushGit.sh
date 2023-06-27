#!/bin/bash

echo ------ GIT ADD --------
git add .
echo Enter commit message:
read message
echo ------ GIT COMMIT -----
git commit -m "$message"
echo ------ GIT PUSH -------
git push origin master
echo -----------------------
echo --------- DONE --------
echo -----------------------
