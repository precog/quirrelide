define([
      "rtext!templates/dialog.support.html"
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
    var elDialog, currentHandler, showRequest;

    function validate(email, request) {
      var re_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re_email.test(email)) {
        return "invalid email address";
      } else if(!request.trim()) {
        return "empty support request";
      } else {
        return null;
      }
    }

    function ok(e) {
        elDialog.find(".pg-error").hide()
        var email   = elDialog.find("#pg-input-email").val(),
            request = elDialog.find("#pg-input-request").val();
        var validation_message = validate(email, request);
        if(validation_message) {
            elDialog.find(".pg-error").html(validation_message).show();
            if(e)
                e.preventDefault();
            return false;
        }
        if(currentHandler)
            currentHandler(email, request);
        elDialog.dialog("close");
    }

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-support:last')
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
        elDialog.find(".pg-email")
          .keyup(function(e) {
            if(e.keyCode == 13) {
              if(showRequest) {
                elDialog.find(".pg-request").focus();
              } else {
                ok();
              }
            }

          });

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });
    }

    var inited = false;
    return function(title, message, email, request, show_request, handler) {
        if(!inited) {
            init();
            inited = true;
        }

        currentHandler = handler;
        elDialog.find(".pg-message").html(message || "");
        elDialog.find("#pg-input-email").val(email || "");
        elDialog.find("#pg-input-request").val(request || "");
        if(showRequest = show_request) {
          elDialog.find(".pg-request").show();
        } else {
          elDialog.find(".pg-request").hide();
        }

        elDialog.find(".pg-error").hide();

        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");
    };
});