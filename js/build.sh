clear

# COPY PHP
cp -f ../download.php ../build/download.php
cp -f ../upload.php ../build/upload.php
cp -r -f ../php ../build

# COPY FILES
cp -f ../favicon.ico ../build/favicon.ico

cp -f ace/theme/textmate.css ../build/js/ace/theme/textmate.css

cp -f ace/theme/tomorrow.js ../build/js/ace/theme/tomorrow.js
cp -f ace/theme/tomorrow.css ../build/js/ace/theme/tomorrow.css
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

cp -r -f ../css/jquery/slickgrid/images ../build/css/jquery/slickgrid

cp -f ../css/images/progress-background.png ../build/css/images/progress-background.png
cp -f ../css/images/logo-precog-white.svg ../build/css/images/logo-precog-white.svg
cp -f ../css/images/logo-precog-black.svg ../build/css/images/logo-precog-black.svg
cp -f ../css/images/logo-gridgain-white.svg ../build/css/images/logo-gridgain-white.svg
cp -f ../css/images/logo-gridgain-black.svg ../build/css/images/logo-gridgain-black.svg
cp -f ../css/images/file.png ../build/css/images/file.png
cp -r -f libs/jquery/jstree/themes/default ../build/themes

cp -f libs/jquery/zclip/ZeroClipboard.swf ../build/js/libs/jquery/zclip/ZeroClipboard.swf

# MINIFY CSS
node r.js -o cssIn=../css/main.css out=../build/css/precog-labcoat.css
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