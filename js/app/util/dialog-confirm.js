define([
      "rtext!templates/dialog.confirm.html"
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
    var elDialog, currentHandler, currentType;

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-confirm:last')
            .dialog({
                  modal : true
                , autoOpen : false
                , resizable : false
                , dialogClass : "pg-el"
//                , width : "400px"
                , closeOnEscape: true
                , buttons : [{
                    text : "OK",
                    click : function() {
                        elDialog.dialog("close");
                        if(currentHandler)
                            currentHandler();
                        return true;
                    }
                }, {
                    text : "Cancel",
                    click : function() {
                        $(this).dialog("close");
                    }
                }]
            })
        ;

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });
    }

    var inited = false;
    return function(title, message, handler) {
        if(!inited) {
            init();
            inited = true;
        }

        currentHandler = handler;
        elDialog.find(".pg-message").html(message || "");
        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");
    };
});