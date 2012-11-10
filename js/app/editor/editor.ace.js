define([
      "require"
    , "ace/ace"
    , "app/util/ui"
    , "ace/mode/quirrel"
],

function(require, ace, ui) {
    return function(el, vertical) {
        var wrapper,
            sess,
            editor = ace.edit($(el).get(0));

        function execute() {
            $(wrapper).trigger("execute", wrapper.get());
        }

        function executeSelected() {
            $(wrapper).trigger("execute", editor.session.getTextRange(editor.getSelectionRange()));
        }

        editor.commands.addCommand({
			name : "executeSelection",
            bindKey: {
                win: 'Shift-Ctrl-Return',
                mac: 'Shift-Ctrl-Return|Command-Ctrl-Return',
                sender: 'editor|cli'
            },
            exec: executeSelected
        });

        editor.commands.addCommand({
			name : "executeAll",
            bindKey: {
                win: 'Shift-Return',
                mac: 'Shift-Return|Command-Return',
                sender: 'editor|cli'
            },
            exec: execute
        });

        editor.setShowPrintMargin(false);
        sess = editor.getSession();
        sess.setUseWrapMode(true);
        sess.setMode(new (require("ace/mode/quirrel").Mode)());
        sess.getSelection().on("changeCursor", function() {
            $(wrapper).trigger("changeCursor", editor.getCursorPosition());
        });
        sess.getSelection().on("changeSelection", function(e) {
            $(wrapper).trigger("changeSelection", editor.getSelection());
            if(editor.getSelection().isEmpty())
                runselected.hide();
            else
                runselected.show();
        });
        sess.on("change", (function() {
            var killChange;

            function trigger() {
                $(wrapper).trigger("change", wrapper.get());
            };

            return function() {
                clearInterval(killChange);
                killChange = setTimeout(trigger, 250);
            };
        })());

        var run = ui.button(el, {
                label : "run",
                text : true,
                icons : { primary : "ui-icon-circle-triangle-s" },
                handler : execute
            }),
            runselected = ui.button(el, {
                label : "run selected",
                text : true,
                icons : { primary : "ui-icon-circle-triangle-s" },
                handler : executeSelected
            });

        function orientButton(vertical) {
            run.css({
                display: "block",
                position: "absolute",
                right: "25px",
                bottom: vertical ? "10px" : "25px",
                zIndex: 100
            });
            runselected.css({
                display: "block",
                position: "absolute",
                right: "100px",
                bottom: vertical ? "10px" : "25px",
                zIndex: 100
            });
            if(vertical) {
                run.find(".ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-e").addClass("ui-icon-circle-triangle-s");
                runselected.find(".ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-e").addClass("ui-icon-circle-triangle-s");
            } else {
                run.find(".ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-e");
                runselected.find(".ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-e");
            }
        }

        orientButton(vertical);
        runselected.hide();

        wrapper = {
            get : function() {
                return sess.getValue(); //editor.getSession()
            },
            set : function(code) {
                sess.setValue(code);
            },
            setTabSize : function(size) {
                if(size === sess.getTabSize()) return;
                sess.setTabSize(size);
                $(wrapper).trigger("tabSizeChanged", size);
            },
            setUseSoftTabs : function(toogle) {
                if(toogle === sess.getUseSoftTabs()) return;
                sess.setUseSoftTabs(toogle);
                $(wrapper).trigger("useSoftTabsChanged", toogle);
            },
            getTabSize : function() {
                return sess.getTabSize();
            },
            getUseSoftTabs : function(toogle) {
                return sess.getUseSoftTabs();
            },
            setTheme : function(theme) {
                var path = "ace/theme/" + theme;
                require([path], function() {
                    editor.setTheme(path);
                });
            },
            resize : function() {
                editor.resize();
            },
            engine : function() {
                return "ace";
            },
            focus : function() {
                editor.focus();
            },
            highlightSyntax : function(row, column, text, type) {
                // https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js
                // https://groups.google.com/forum/?fromgroups#!topic/ace-discuss/joAFrXwWLX8
                sess.setAnnotations([{
                    row : row,
                    column : column,
                    text : text,
                    type : type
                }]);
                function removeAnnotations() {
                    sess.setAnnotations([]);
                    sess.removeListener("change", removeAnnotations);
                }
                sess.on("change", removeAnnotations);
            },
            setCursorPosition : function(row, column) {
                editor.navigateTo(row, column);
                editor.focus();
            },
            triggerExecute : execute,
            orientButton : orientButton
        };

        return wrapper;
    }
});