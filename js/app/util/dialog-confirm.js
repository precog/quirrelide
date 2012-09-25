define([
      "rtext!templates/dialog.confirm.html"
    , "app/util/ui"
    , "app/util/dom"
    , "app/util/numbercaptcha"


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

function(tplDialog, ui, dom, createCaptcha) {
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
                , closeOnEscape: true
                , buttons : [{
                    text : "OK",
                    click : function() {
                        elDialog.dialog("close");
                        if(currentHandler)
                            currentHandler();
                        return true;
                    },
                    ref : "ok"
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

window.dialog = elDialog;
    }

    var inited = false;
    return function(title, message, handler, options) {
        options = options || {};
        if(!inited) {
            init();
            inited = true;
        }

        currentHandler = handler;
        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");


        var ok = elDialog.parent().find('button[ref=ok]'),
            el = elDialog.find(".pg-message");
        el.find("*").remove();

        message = '<div>' + (message || "") +'</div>';
        el.html(message);
        if(options.captcha) {
          ok.button("disable");

          var cont = $('<div class="captcha"></div>'),
              captcha = createCaptcha(100);
          cont.append('<div class="ui-widget"><div class="ui-state-highlight"><p>Solve this simple problem if you want to delete the data: <b>'+captcha.description+' is equal to?</b></p></div></div>');
          var input = $('<input type="number" step="1">').keyup(function() {
            var val = $(this).attr("value");
            if(val === "" + captcha.result) {
              cont.find("*").remove();
              cont.append('<div class="ui-widget"><div class="ui-state-highlight"><p>Good Job! Now click OK to confirm</p></div></div>');
              ok.button("enable");
            }
          });
          cont.append($('<div class="ui-widget"></div>').append("<p></p>").append(input));
          el.append(cont);
        } else {
          ok.button("enable");
        }
    };
});