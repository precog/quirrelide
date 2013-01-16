define([
    "app/util/ui"
], function(ui) {

    return function(el) {
        var wrapper, index = 0, callback, onchange = {};

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

        setTimeout(function() {
          tabs.find("ul").removeClass("ui-corner-all");
          tabs.on("tabsactivate", function(event, ui) {
            var id = "#" + ui.newPanel.attr("id");
            if(onchange[id])
              onchange[id]();
            return false;
          });
        }, 0);

        return wrapper = {
            addPanel : function(label, content_handler, onchange_handler) {
                var id = "#pg-support-tab-" + (++index);
                if("function" !== typeof content_handler) {
                    var content;
                    if("string" === typeof content_handler && (content_handler.substr(0, 8) === 'https://' || content_handler.substr(0, 7) === 'http://')) {
                        content = '<iframe src="'+content_handler+'" style="margin:0;padding:0;width:100%;height:100%;border:0"><iframe/>'
                    }
                    content_handler = function(el) { $(el).append(content); };
                }
                onchange[id] = onchange_handler;
                callback = content_handler;
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