define([
      "app/util/ui"
    , "app/util/notification"
    , "app/util/querystring"
    , "app/util/converters"
    , "app/util/utils"
    , "app/util/precog"
    , "app/util/dialog-export"
    , "app/util/dialog-lineinput"
    , "app/config/output-languages"
    , "rtext!templates/toolbar.editor.html"

    , "libs/moment/moment"
],

// TODO remove editors dependency

function(ui, notification, qs, conv, utils, precog, openExportDialog, openInputDialog, createExportLanguages, tplToolbar) {

    return function(el, queries, editors) {
        var wrapper,
            exportLanguages = createExportLanguages();
        el.append(tplToolbar);
        var elContext = el.find('.pg-toolbar-context'),
            autoGoToTab = 0,
            tabs = ui.tabs(el.find('.pg-editor-tabs'), {
                tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close pg-tab-close'>Remove Tab</span></li>",
                add: function(event, ui) {
                    var index = ui.index;
                    if(autoGoToTab)
                    {
                        tabs.tabs("select", index);
                        editors.activate(index);
                        autoGoToTab--;
                    }
                }
            }),
            index = 0;

        tabs.on({
            click : function(){
                var index = $("li", tabs).index($(this).parent());
                editors.remove(index);
            }
        }, '.ui-icon-close');

        tabs.on({
            click : function() {
                var index = $("li", tabs).index($(this).parent());
                editors.activate(index);
            }
        }, 'li a');

        function getIndexByName(name) {
            var len = tabs.find("li a").length;
            for(var i = 0; i < len; i++) {
                if(getTabName(i) === name)
                    return i;
            }
            return -1;
        }

        function getTabName(index) {
            return getTabLabelElement(index).attr("data");
        }

        function getTabLabelElement(index) {
            return tabs.find("li:nth("+index+") a");
        }

        function changeTabName(index, value, dirty) {
            var el = getTabLabelElement(index);
            el.attr("data", value).attr("title", value).html(utils.truncate(value.split("/").pop()));
            if(dirty) {
                wrapper.invalidateTab(index);
            }
        }

        function invalidateTab(index) {
            var el = getTabLabelElement(index),
                content = el.html();
            if(content && content.substr(0, 1) !== "*")
                el.html("*"+content);
        }

        function revalidateTab(index) {
            var el = getTabLabelElement(index),
                content = el.html();
            if(content.substr(0, 1) === "*")
                el.html(content.substr(1));
        }

        var history = ui.button(elContext, {
            icon : "ui-icon-clock",
            description : "display query history",
            handler : function() {
                $(wrapper).trigger("requesthistorylist");
            }
        });

        ui.button(elContext, {
            icon : "ui-icon-disk",
            description : "save query",
            handler : function() {
                var editor = editors.get();
                if(editor.hasname) {
                    editors.save(editor);
                } else {
                    openInputDialog("Save Query", "Select a unique identification name for your query", null, "",
                    function(value) {
                        return utils.validateQueryName(value, queries.nameAtPath(value), queries);
                    }, function(value) {
                        editor.name = queries.nameAtPath(value);
                        editor.hasname = true;
                        editors.save(editor);
                    });
                }
            }
        });

        ui.button(elContext, {
            icon : "ui-icon-mail-closed",
            description : "send query by email",
            handler : function(e) {
                var email   = 'support@precog.com',
                    subject = 'Quirrel Help',
                    body    = 'I need help with the following query:\n\n' + editors.getCode();

                var url = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
                window.open(url, "_blank");
            }
        });

        var copier;
        ui.button(elContext, {
            icon : "ui-icon-link",
            description : "copy a link with the current query",
            handler : function(e) {
                var base = document.location.protocol + "//" + document.location.hostname + document.location.pathname;
                // strip q if it exists
                var params = {};
                params.q = editors.getCode();
                if(precog.config.apiKey)
                  params.apiKey = precog.config.apiKey;
                if(precog.config.basePath)
                  params.basePath = precog.config.basePath;
                if(precog.config.analyticsService)
                  params.analyticsService = precog.config.analyticsService;

                if(copier) copier.remove();
                copier = notification.copier("Create Query Link", {
                    text : "Copy this link to pass the current query to someone else.<br>Don't forget that the URL contains your token!",
                    copy : base + "?" + $.param(params),
                    target : this
                });
            }
        });

      ui.button(elContext, {
        icon : "ui-icon-arrowthickstop-1-s",
        description : "download query code",
        handler : function() {
          openExportDialog("Download Query", exportLanguages, editors.getCode(), null, null, function() {
            $(wrapper).trigger("exportCode");
          });
        }
      });

        ui.button(elContext, {
            icon : "ui-icon-plus",
            description : "create new empty tab",
            handler : function() {
                autoGoToTab++;
                editors.add();
            }
        });

        function formatHistoryItem(item) {
            var numlines = 3,
                tlen = 40;
            var execution = moment(new Date(item.timestamp)).fromNow();
            var codeLines = item.code.split("\n");
            if(codeLines.length > numlines)
            {
                var lines = codeLines.length - numlines;
                codeLines.splice(numlines-1);
                codeLines.push("... +" + lines + " more line(s)");
            }
            var code = codeLines.map(function(v) { return utils.truncate(v, tlen); }).join("\n");
            return '<div class="pg-history-item ui-content ui-state-highlight ui-corner-all">'
                  + '<div class="pg-header">query:</div>'
                  + '<pre>'+code+'</pre>'
                  + '<div class="pg-header">sample:</div>'
                  + '<pre>'+utils.truncate(JSON.stringify(item.sample.first), tlen)+'</pre>'
                  + '<div class="pg-info">generated '+item.sample.length+' records<br>executed '+ execution +'</div>'
                  + '<div class="pg-toolbar"></div>'
                  + '<div class="pg-clear"></div>'
                  + '</div>'
            ;
        }


        var historypanel;

        return wrapper = {
            addTab : function(name, dirty) {
                var a = tabs.tabs("add", "#pg-editor-tab-" + (++index), "");
                changeTabName(tabs.tabs("length")-1, name, dirty);
                var closers = tabs.find(".pg-tab-close");
                if(closers.length == 1) {
                    closers.hide();
                } else if(closers.length == 2) {
                    closers.show();
                }
            },
            removeTab : function(index) {
                tabs.tabs("remove", index);
                var closers = tabs.find(".pg-tab-close");
                if(closers.length === 1) {
                    closers.hide();
                }
            },
            removeTabByName : function(name) {
                var index = getIndexByName(name);
                if(index >= 0)
                    this.removeTab(index);
            },
            activateTab : function(index) {
                tabs.tabs("select", index);
            },
            changeTabName : function(index, name) {
                var old = getTabName(index);
                changeTabName(index, name);
                $(wrapper).trigger("tabrenamed", { oldname : old, newname : name });
            },
            invalidateTab : function(index) {
                invalidateTab(index);
            },
            revalidateTab : function(index) {
                revalidateTab(index);
            },
            displayHistoryList : function(data) {
                if(historypanel) {
                    historypanel.remove();
                }
                var text;
                if(data.length == 0) {
                    text = "No queries have been performed yet in this editor context.";
                } else {
                    text = '<div class="pg-history"><ul><li>'+data.map(formatHistoryItem).join('</li><li>')+'</li></ul></div>';
                }
                historypanel = notification.context("History", {
                    target: history,
                    text : text
                });
                historypanel.find(".pg-toolbar").each(function(index) {
                    var item = data[index];
                    $(this).append("open in ")
                    if(index !== 0) {
                        ui.button(this, {
                            label : "current tab",
                            handler : function() {
                                historypanel.remove();
                                $(wrapper).trigger("requestopenrevision", {
                                    usenewtab : false,
                                    index : index
                                });
                            }
                        });
                    }
                    ui.button(this, {
                        label : "new tab",
                        handler : function() {
                            historypanel.remove();
                            $(wrapper).trigger("requestopenrevision", {
                                usenewtab : true,
                                index : index
                            });
                        }
                    });
                });
            },
            historyPanelIsOpen : function() {
                return historypanel && historypanel.is(":visible");
            }
        }
    }
});