define([
      "rtext!templates/dialog.export.html"
    , "app/util/ui"
    , "app/util/dom"
    , "app/util/notification"



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
    , "libs/jquery/zclip/jquery.zclip"
],

function(tplDialog, ui, dom, notification) {
    var downloadQueryService = "http://api.reportgrid.com/services/viz/proxy/download-code.php",
        elText, elDialog, elActions, elForm, clip;

    function selectCode() {
        setTimeout(function() { dom.selectText(elText.get(0)); }, 100);
    }

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }
    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-export')
            .dialog({
                  modal : true
                , autoOpen : false
                , resizable : false
                , width : 820
                , height : 480
                , dialogClass : "pg-el"
                , closeOnEscape: true
                , buttons : [{
                    text : "Copy",
                    click : function() {
                        elDialog.dialog("close");
                        return true;
                    }
                }, {
                    text : "Download",
                    click : function() {
                        notification.quick("code downloaded");
                        elForm.submit();
                        elDialog.dialog("close");
                    }
                }]
            }),
        elActions = elDialog.find(".pg-actions"),
        elOptions = elDialog.find(".pg-options"),
        elText = elDialog.find(".pg-export textarea"),
        elForm = elDialog.find("form");

        elForm.attr("action", downloadQueryService);

        elText.click(function() {
            selectCode();
        });

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });
    }

    var inited = false;
    return function(title, actions, code, selected) {
        if(!inited) {
            init();
            inited = true;
        }
        elActions.find("*").remove();
        elOptions.find("*").remove();

        function execute(action) {
            elDialog.find("input[name=name]").val("precog." + action.token);
            elOptions.find("*").remove();
            if(action.buildOptions)
                action.buildOptions(elOptions, function() {
                    elText.text(action.handler(code, action.options));
                    selectCode();
                });
            elText.text(action.handler(code, action.options));
            selectCode();
        }

        var selectedIndex = -1;
        ui.radios(elActions, $(actions).map(function(i, action) {
            if(action.token === selected)
                selectedIndex = i;
            return {
                  label : action.name
                , handler : function() {
                    execute(action);
                    return true;
                }
                , group : "actions"
                , checked : selectedIndex === i
            };
        }));

        if(selectedIndex === -1) selectedIndex = 0;
        execute(actions[selectedIndex]);

        elActions.find(".ui-button:first").click();

        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");

        if(clip) {
            $(window).trigger("resize"); // triggers reposition of the Flash overlay
        } else {
            clip = elDialog.dialog("widget").find('.ui-dialog-buttonpane button.ui-button:first')
                .css({ zIndex : 1000000 })
                .zclip({
                    path:'js/libs/jquery/zclip/ZeroClipboard.swf',
                    copy:function(){
                        return ""+elText.val();
                    },
                    afterCopy : function() {
                        notification.quick("copied to clipboard");
                    }
                });
        }
    };
});