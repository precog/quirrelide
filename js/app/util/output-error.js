define([

],

function() {

    var elPanel = $('<div class="ui-widget"><div class="ui-content"></div></div>'),
        elError = elPanel.find('.ui-state-error');

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
          });
        }
    };
});