define([
      "order!util/ui"
    , "app/editors"
    , "util/notification"
    , "util/querystring"
    , "util/converters"
    , "order!util/dialog-export"
    , "order!util/dialog-lineinput"
    , "config/output-languages"
    , "text!templates/toolbar.editor.html"
],

// TODO remove editors dependency
// TODO remove queries dependency
// TODO add invalidate tab content

function(ui, editors, notification, qs, conv, openExportDialog, openInputDialog, exportLanguages, tplToolbar) {

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

        function getTabLabelElement(index) {
            return tabs.find("li:nth("+index+") a");
        }

        function truncate(value) {
            var maxlen = 25,
                ellipsis = "...";
            if(value.length >= maxlen)
                value = value.substr(0, maxlen-ellipsis.length)+ellipsis;
            return value;
        }

        function changeTabName(index, value) {
            getTabLabelElement(index).html(truncate(value));
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
/*
        var history = ui.button(elContext, {
            icon : "ui-icon-clock",
            handler : function() {
                $(wrapper).trigger("requesthistorylist");
            }
        });
*/
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
                params.q = conv.quirrelToOneLine(editors.getCode());
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

        return wrapper = {
            addTab : function(name, dirty) {
                tabs.tabs("add", "#pg-editor-tab-" + (++index), truncate(name));
                if(dirty)
                    this.invalidateTab(index-1);


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
                if(closers.length == 1) {
                    closers.hide();
                }
            },
            activateTab : function(index) {
                tabs.tabs("select", index);
            },
            changeTabName : function(index, name) {
                changeTabName(index, name);
            },
            invalidateTab : function(index) {
                invalidateTab(index);
            },
            revalidateTab : function(index) {
                revalidateTab(index);
            },
            displayHistoryList : function(data) {
                console.log("displayHistoryList", data);
            }
        }
    }
});