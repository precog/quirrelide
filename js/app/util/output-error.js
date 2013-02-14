define([

],

function() {

    var elPanel = $('<div class="ui-widget"><div class="ui-content"></div></div>'),
        elError = elPanel.find('.ui-state-error');

    function escapeHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
/*
    function formatError(error, wrapper) {
      var message = '<p>'+(error && escapeHtml(("undefined" !== typeof error.message) ? error.message : error))+'</p>';
      if("undefined" !== typeof error.lineNum) {
        message += '<p class="pg-position">Error at line '+error.lineNum+', column '+error.colNum+'</p>';
        message += '<pre>'+escapeHtml(error.detail)+'</pre>';
        $(wrapper).trigger("syntaxError", { line : error.lineNum, column : error.colNum, text : error.detail });
      }

      var $message = $(message);

      if("undefined" !== typeof error.lineNum) {
        $message.find(".pg-position").click(function() {
          $(wrapper).trigger("requestCursorChange", { line : error.lineNum, column : error.colNum });
        })
      }

      return $('<div class="error-container"></div>').append($message);
    }
*/
    return {
        type : "error",
        name : "Error",
        display : false,
        panel : function() {
            return elPanel;
        },
        update : function(errors, options, wrapper) {
          elError.find("*").remove();
          $(errors).each(function(){
            if(!this.message && "string" !== typeof this)
              return;
//            elError.append(formatError(this, wrapper));
          });
        }
    };
});

// [{"message":"Errors occurred compiling your query.","line":"loadaasd","lineNum":1,"colNum":1,"detail":"undefined name: loadaasd"}]
