define([
    "util/ui"
], function(ui) {

    return function(el) {
        var wrapper, index = 0, callback;

        var tabs = ui.tabs(el.append('<div class="pg-support-tabs"><ul></ul></div>').find(".pg-support-tabs").css({
                padding: 0,
                margin : 0,
                border : 0
            })
            , {
                tabTemplate: "<li><a href='#{href}'>#{label}</a></li>",
                add: function(event, ui) {
    //                tabs.tabs("select", ui.index);
                    $(ui.panel).css({ padding : 0, overflow : "hidden" })
                    callback(ui.panel);
            }
        });
        tabs.removeClass("ui-corner-all");

        setTimeout(function() { tabs.find("ul").removeClass("ui-corner-all"); }, 0);

        return wrapper = {
            addPanel : function(label, contentHandler) {
                var id = "#pg-support-tab-" + (++index);
                if("function" !== typeof contentHandler) {
                    var content;
                    if("string" === typeof contentHandler && (contentHandler.substr(0, 8) === 'https://' || contentHandler.substr(0, 7) === 'http://')) {
                        content = '<iframe src="'+contentHandler+'" style="margin:0;padding:0;width:100%;height:100%;border:0"><iframe/>'
                    }
                    contentHandler = function(el) { $(el).append(content); };
                }
                callback = contentHandler;
                tabs.tabs("add", id, label);
            },
            resize : function() {

                var h = el.innerHeight() - tabs.find("ul").outerHeight();
                tabs.find(".ui-tabs-panel").css({
                    height: h + "px"
                });
            }
        };
    }
});