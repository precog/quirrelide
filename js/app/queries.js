define([
      "util/precog"
    , "util/storagemonitor"
    , "util/ui"
    , "util/utils"
    , "text!templates/toolbar.folders.html"
],
function(precog, createStore, ui, utils, tplToolbar) {
    var STORE_KEY = "pg-quirrel-queries-"+precog.hash,
        store = createStore(STORE_KEY, { queries : {
            "my_query" : {
                name : "My Query",
                code : "//list/all"
            },
            "a_query" : {
                name : "A Query",
                code : "//list/other"
            },
        }});

    store.monitor.start(500);

    return function(el) {
        var wrapper;

        el.find(".pg-toolbar").append(tplToolbar);
        var elActions = el.find(".pg-toolbar-actions"),
            elContext = el.find(".pg-toolbar-context"),
            elMain    = el.find(".pg-queries"),
            elList    = elMain.append('<ul class="pg-query-list"></ul>');
        elActions.html("queries");

        function normalizeName(value) {
            value = value.trim().toLowerCase();
            value.replace(/\s+/g, "_");
            return value;
        }

        function addQuery(id, name) {
            elList.append('<li class="'+id+'">'+name+'</li>');
            utils.sortNodes(elList.find("li"), function(a, b) {
//                return 0;
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
            create : function(name, code) {
                var id = normalizeName(name);
                var query = store.get(id);
                if(query) return;


            },
            remove : function(name) {
                var id = normalizeName(name);
                var query = store.get(id);
                if(!query) return;
            }
        };
    }
});
