clear

# COPY PHP
cp -f ../download.php ../build/download.php
cp -f ../upload.php ../build/upload.php
cp -r -f ../php ../build

# COPY FILES
cp -f ace/theme/textmate.css ../build/js/ace/theme/textmate.css

cp -f ace/theme/dawn.js ../build/js/ace/theme/dawn.js
cp -f ace/theme/dawn.css ../build/js/ace/theme/dawn.css
cp -f ace/theme/idle_fingers.js ../build/js/ace/theme/idle_fingers.js
cp -f ace/theme/idle_fingers.css ../build/js/ace/theme/idle_fingers.css
cp -f ace/theme/solarized_dark.js ../build/js/ace/theme/solarized_dark.js
cp -f ace/theme/solarized_dark.css ../build/js/ace/theme/solarized_dark.css
cp -f ace/theme/merbivore.js ../build/js/ace/theme/merbivore.js
cp -f ace/theme/merbivore.css ../build/js/ace/theme/merbivore.css

cp -r -f ../css/jquery/ui/gray/images ../build/css/jquery/ui/gray
cp -r -f ../css/jquery/ui/blue/images ../build/css/jquery/ui/blue
cp -r -f ../css/jquery/ui/dark/images ../build/css/jquery/ui/dark
cp -r -f ../css/jquery/ui/black/images ../build/css/jquery/ui/black

cp -f ../css/images/progress-background.png ../build/css/images/progress-background.png
cp -f ../css/images/logo-precog.svg ../build/css/images/logo-precog.svg
cp -f ../css/images/file.png ../build/css/images/file.png
cp -r -f libs/jquery/jstree/themes/default ../build/themes

cp -f libs/jquery/zclip/ZeroClipboard.swf ../build/js/libs/jquery/zclip/ZeroClipboard.swf

# MINIFY CSS
node r.js -o cssIn=../css/main.css out=../build/css/precog-ide.css
node r.js -o cssIn=../css/generator.css out=../build/css/precog-link.css
node r.js -o cssIn=ace/css/editor.css out=../build/js/ace/css/editor.css
node r.js -o cssIn=../css/jquery/ui/black/jquery-ui.css out=../build/css/jquery/ui/black/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/blue/jquery-ui.css out=../build/css/jquery/ui/blue/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/dark/jquery-ui.css out=../build/css/jquery/ui/dark/jquery-ui.css
node r.js -o cssIn=../css/jquery/ui/gray/jquery-ui.css out=../build/css/jquery/ui/gray/jquery-ui.css

# MINIFY JS
~/bin/uglifyjs -o ../build/js/require-jquery.js require-jquery.js
node r.js -o app.build.js
node r.js -o gen.build.js