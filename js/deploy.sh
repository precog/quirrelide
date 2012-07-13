./build.sh

clear

git commit -a -m "deploy"
git push
git co deploy
git merge master
git push
git co master