define([
      "util/ui"
    , "app/editors"
    , "util/notification"
    , "util/querystring"
    , "util/converters"
    , "util/utils"
    , "util/dialog-export"
    , "util/dialog-lineinput"
    , "config/output-languages"
    , "text!templates/toolbar.editor.html"

    , "libs/moment/moment"
],

// TODO remove editors dependency
// TODO add invalidate tab content

function(ui, editors, notification, qs, conv, utils, openExportDialog, openInputDialog, exportLanguages, tplToolbar) {

    return function(el, queries) {
        var wrapper;
        el.append(tplToolbar);
        var elContext = el.find('.pg-toolbar-context'),
            autoGoToTab = false,
            tabs = ui.tabs(el.find('.pg-editor-tabs'), {
                tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close pg-tab-close'>Remove Tab</span></li>",
                add: function(event, ui) {
                    var index = ui.index;
                    if(autoGoToTab)
                    {
                        tabs.tabs("select", ui.index);
                        editors.activate(ui.index);
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
            var el = getTabLabelElement(index),
                name = el.text();
            if(name.substr(0, 1) === "*")
                name = name.substr(1);
            return name;
        }

        function getTabLabelElement(index) {
            return tabs.find("li:nth("+index+") a");
        }

        function changeTabName(index, value) {
            getTabLabelElement(index).html(utils.truncate(value));
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
            handler : function() {
                $(wrapper).trigger("requesthistorylist");
            }
        });

        ui.button(elContext, {
            icon : "ui-icon-disk",
            handler : function() {
                var editor = editors.get();
                if(editor.hasname) {
                    editors.save(editor);
                } else {
                    openInputDialog("Save Query", "Select a unique identification name for your query", null, "",
                    function(value) {
                        if(value.match(/^[a-z0-9][a-z0-9 ]*[a-z0-9]$/i)) {
                            if(queries.exist(value))
                                return "a query with this identifier already exists";
                            else
                                return null;
                        } else
                            return "the name can only include alpha-numeric characters, white spaces (but not in the beginning and at the end) and must be at least 2 characters long.";
                    }, function(value) {
                        editor.name = value;
                        editor.hasname = true;
                        editors.save(editor);
                    });
                }
                //if anonymous
                //  dialog request name
                //  trigger create query request
                //else
                //  trigger update query request
            }
        });

        ui.button(elContext, {
            icon : "ui-icon-mail-closed",
            handler : function(e) {
                var email   = 'support@precog.com',
                    subject = 'Quirrel Help',
                    body    = 'I need help with the following query:\n\n' + editors.getCode();

                document.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
            }
        });

        var copier;
        ui.button(elContext, {
            icon : "ui-icon-link",
            handler : function(e) {
                var base = document.location.origin + document.location.pathname;
                // strip q if it exists
                var params = qs.all();
                params.q = editors.getCode(); // conv.quirrelToOneLine(editors.getCode());
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
            handler : function() {
                openExportDialog("Download Query", exportLanguages, editors.getCode());
            }
        });

        ui.button(elContext, {
            icon : "ui-icon-plus",
            handler : function() {
                autoGoToTab = true;
                editors.add();
                autoGoToTab = false;
            }
        });

        function formatHistoryItem(item) {
            // item.timestamp
            // item.code
            // item.sample.first
            // item.sample.length
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
                tabs.tabs("add", "#pg-editor-tab-" + (++index), utils.truncate(name));
                if(dirty) {
                    this.invalidateTab(index-1);
                }

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