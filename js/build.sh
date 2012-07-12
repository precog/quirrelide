clear
cp ace/css/editor.css ../build/js/ace/css/editor.css
cp ace/theme/textmate.css ../build/js/ace/theme/textmate.css

cp ace/theme/dawn.js ../build/js/ace/theme/dawn.js
cp ace/theme/dawn.css ../build/js/ace/theme/dawn.css
cp ace/theme/idle_fingers.js ../build/js/ace/theme/idle_fingers.js
cp ace/theme/idle_fingers.css ../build/js/ace/theme/idle_fingers.css
cp ace/theme/solarized_dark.js ../build/js/ace/theme/solarized_dark.js
cp ace/theme/solarized_dark.css ../build/js/ace/theme/solarized_dark.css
cp ace/theme/merbivore.js ../build/js/ace/theme/merbivore.js
cp ace/theme/merbivore.css ../build/js/ace/theme/merbivore.css

cp -r ../css/jquery/ui/gray ../build/css/jquery/ui/gray
cp -r ../css/jquery/ui/blue ../build/css/jquery/ui/blue
cp -r ../css/jquery/ui/dark ../build/css/jquery/ui/dark
cp -r ../css/jquery/ui/black ../build/css/jquery/ui/black

cp ../css/images/progress-background.png ../build/css/images/progress-background.png
cp ../css/images/logo-precog.svg ../build/css/images/logo-precog.svg
cp libs/jquery/jstree/themes/default/* ../build/themes/default/

node r.js -o cssIn=../css/main.css out=../build/css/precog-ide.css
node r.js -o app.build.js