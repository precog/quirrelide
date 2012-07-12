define([
      "rtext!templates/dialog.lineinput.html"
    , "app/util/ui"
    , "app/util/dom"


    // FORCE INCLUSION?
    , 'libs/jquery/ui/jquery.ui.core'
    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.widget'
    , 'libs/jquery/ui/jquery.ui.mouse'
    , 'libs/jquery/ui/jquery.ui.resizable'
    , 'libs/jquery/ui/jquery.ui.button'
    , 'libs/jquery/ui/jquery.ui.sortable'
    , 'libs/jquery/ui/jquery.ui.draggable'
    , "libs/jquery/ui/jquery.ui.dialog"
],

function(tplDialog, ui, dom) {
    var elDialog, currentHandler, currentValidator;

    function ok(e) {
        elDialog.find(".pg-error").hide()
        var value = elDialog.find(".pg-lineinput input[type=text]").val();
        if(currentValidator) {
            var message = currentValidator(value);
            if(message) {
                elDialog.find(".pg-error").html(message).show();
                if(e)
                    e.preventDefault();
                return false;
            }
        }
        if(currentHandler)
            currentHandler(value);
        elDialog.dialog("close");
    }

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-lineinput:last')
            .dialog({
                modal : true
                , autoOpen : false
                , resizable : false
                , dialogClass : "pg-el"
                , width : "400px"
                , closeOnEscape: true
                , buttons : [{
                    text : "Close",
                    click : function() {
                        elDialog.dialog("close");
                        return true;
                    }
                }, {
                    text : "OK",
                    click : ok
                }]
            })
        ;

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });
    }

    var inited = false;
    return function(title, message, label, defaultInput, validator, handler) {
        if(!inited) {
            init();
            inited = true;
        }
        currentValidator = validator;
        currentHandler = handler;
        elDialog.find(".pg-message").html(message || "");
        elDialog.find(".pg-lineinput input[type=text]")
            .val(defaultInput || "")
            .keyup(function(e) {
                if(e.keyCode == 13) // enter
                    ok();
            });
        elDialog.find(".pg-error").hide();
        elDialog.find("label").html((label && (label + ":")) || "");
        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");
    };
});