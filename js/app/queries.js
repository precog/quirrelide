define([
      "util/precog"
    , "util/storagemonitor"
    , "util/ui"
    , "util/utils"
    , "text!templates/toolbar.folders.html"
    , "text!templates/menu.context.queries.query.html"
],
function(precog, createStore, ui, utils, tplToolbar, tplQueryContextMenut) {
    var list = [],
        STORE_KEY = "pg-quirrel-queries-"+precog.hash,
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
            var id = $(menuselected).attr("data-name");
            openQuery(id);
            menu.hide();
            e.preventDefault(); return false;
        });
        menu.find(".pg-remove").click(function(e) {
            var id = $(menuselected).attr("data-name");
            wrapper.remove(id);
            menu.hide();
            e.preventDefault(); return false;
        });

        function addQuery(id, name) {
            var li = elList.append('<li class="" data-name="'+id+'">'+name+'</li>').find("li:last");
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
                    var id = $(e.currentTarget).attr("data-name");
                    openQuery(id);
                    menu.hide();
                    e.preventDefault(); return false;
                });
            utils.sortNodes(elList.find("li"), function(a, b) {
                return a.getAttribute("data-name") < b.getAttribute("data-name") ? -1 : (a.getAttribute("data-name") > b.getAttribute("data-name") ? 1 : 0);
            });
            list.push(name);
        }

        function removeQuery(id) {
            elList.find('[data-name="'+id+'"]').remove();
            var pos = list.indexOf(name);
            if(pos >= 0)
                list.splice(pos, 1);
        }

        var queries = store.get("queries");
        for(var id in queries) {
            if(queries.hasOwnProperty(id)) {
                addQuery(id, queries[id].name);
            }
        }

        store.monitor.bind("queries", function(_, q) {
            var names = [];
            for(var query in q) {
                if(q.hasOwnProperty(query))
                    names.push(query);
            }
            var removed = utils.arrayDiff(list, names),
                added   = utils.arrayDiff(names, list);

            store.load();
            for(var i = 0; i < removed.length; i++) {
                removeQuery(normalizeName(removed[i]));
                $(wrapper).trigger("removed", removed[i]);
            }
            for(var i = 0; i < added.length; i++) {
                addQuery(normalizeName(added[i]), added[i]);
            }
            list = names;
        });

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
                $(wrapper).trigger("removed", query.name);
                return true;
            }
        };
    }
});
