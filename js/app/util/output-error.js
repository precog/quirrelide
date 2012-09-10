define([

],

function() {

    var elPanel = $('<div class="ui-widget"><div class="ui-content ui-state-error ui-corner-all"></div></div>'),
        elError = elPanel.find('.ui-state-error');

    function escapeHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        type : "error",
        name : "Error",
        display : false,
        panel : function() {
            return elPanel;
        },
        update : function(error, options, wrapper) {
            var message = '<p>'+(error && escapeHtml("" + error.message || error))+'</p>';
            if("undefined" !== typeof error.lineNum) {
                message += '<p class="pg-position">Error at line '+error.lineNum+', column '+error.colNum+':</p><br>';
                message += '<pre>'+escapeHtml(error.detail)+'</pre>';
                $(wrapper).trigger("syntaxError", { line : error.lineNum, column : error.colNum, text : error.detail });
            }
            elError.html(message);
            elError.find(".pg-position").click(function() {
                $(wrapper).trigger("requestCursorChange", { line : error.lineNum, column : error.colNum });
            })
        }
    };
});

// "line":"//","lineNum":1,"colNum":1,"detail":"error:1: expected operator or path or expression\n  //\n   ^"}
