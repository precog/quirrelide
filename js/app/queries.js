define([
      "util/precog"
    , "util/storagemonitor"
    , "util/ui"
    , "util/utils"
    , "text!templates/toolbar.folders.html"
    , "text!templates/menu.context.queries.query.html"
],
function(precog, createStore, ui, utils, tplToolbar, tplQueryContextMenut) {
    var STORE_KEY = "pg-quirrel-queries-"+precog.hash,
        store = createStore(STORE_KEY, { queries : {}});

    function normalizeName(value) {
        value = value.trim().toLowerCase();
        value.replace(/\s+/g, "_");
        return value;
    }

    store.monitor.start(500);

    return function(el) {
        var wrapper;

        el.find(".pg-toolbar").append(tplToolbar);
        var elActions = el.find(".pg-toolbar-actions"),
            elContext = el.find(".pg-toolbar-context"),
            elMain    = el.find(".pg-queries"),
            elList    = elMain.append('<ul class="pg-query-list"></ul>');
        elActions.html("queries");

        function openQuery(id) {
            $(wrapper).trigger("requestopenquery", store.get("queries."+normalizeName(id)));
        }

        var menuselected, menu = ui.contextmenu(tplQueryContextMenut);

        menu.find(".pg-open").click(function(e) {
            var id = $(menuselected).attr("class");
            openQuery(id);
            menu.hide();
            e.preventDefault(); return false;
        });
        menu.find(".pg-remove").click(function(e) {
            var id = $(menuselected).attr("class");
            wrapper.remove(id);
            menu.hide();
            e.preventDefault(); return false;
        });

        function addQuery(id, name) {
            var li = elList.append('<li class="'+id+'">'+name+'</li>').find("li:last");
            li.click(function(e) {
                    var pos = $(e.currentTarget).offset(),
                        h = $(e.currentTarget).outerHeight();
                    menu.css({
                        position : "absolute",
                        top : (pos.top + h) + "px",
                        left : (pos.left) + "px",
                        zIndex : e.currentTarget.style.zIndex + 100
                    }).show();
                    menuselected = e.currentTarget;
                    e.preventDefault(); return false;
                })
                .dblclick(function(e) {
                    var id = $(e.currentTarget).attr("class");
                    openQuery(id);
                    menu.hide();
                    e.preventDefault(); return false;
                });
            utils.sortNodes(elList.find("li"), function(a, b) {
                return a.className < b.className ? -1 : (a.className > b.className ? 1 : 0);
            });
        }

        function removeQuery(id) {
            elList.find("."+id).remove();
        }

        var queries = store.get("queries");
        for(var id in queries) {
            if(queries.hasOwnProperty(id)) {
                addQuery(id, queries[id].name);
            }
        }

        return wrapper = {
            exist : function(name) {
                var id = normalizeName(name);
                return !!store.get("queries."+id);
            },
            save : function(name, code) {
                if(this.exist(name))
                    return this.update(name, code);
                else
                    return this.create(name, code);
            },
            create : function(name, code) {
                var id = normalizeName(name);
                var query = store.get("queries."+id);
                if(query) return false;
                store.set("queries."+id, query = {
                    name : name,
                    code : code
                });
                addQuery(id, name);
                $(wrapper).trigger("created", query);
                return true;
            },
            update : function(name, code) {
                var id = normalizeName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                query.code = code;
                store.set("queries."+id, query);
                $(wrapper).trigger("updated", query);
                return true;
            },
            remove : function(name) {
                var id = normalizeName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                store.remove("queries."+id);
                removeQuery(id);
                $(wrapper).trigger("removed", query);
                return true;
            }
        };
    }
});
