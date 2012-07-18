define([
      "app/util/precog"
    , "app/util/storagemonitor"
    , "app/util/ui"
    , "app/util/utils"
    , "app/config/demo-queries"
    , "app/util/dialog-lineinput"
    , "app/util/dialog-confirm"

    , "rtext!templates/toolbar.folders.html"
    , "rtext!templates/menu.context.queries.query.html"

    , 'libs/jquery/jstree/vakata'
    , 'libs/jquery/jstree/jstree'
    , 'libs/jquery/jstree/jstree.themes'
],

function(precog, createStore, ui, utils, demo, openRequestInputDialog, openConfirmDialog, tplToolbar, tplQueryContextMenut) {
    var list = [],
        DEMO_TOKEN = "1BF2FA96-8817-4C98-8BCB-BEC6E86CB3C2",
        STORE_KEY = "pg-quirrel-queries-"+precog.hash,
        store = createStore(STORE_KEY, { queries : (DEMO_TOKEN === precog.config.tokenId ? demo : {})}),
        foldersmap = {};


    store.monitor.start(500);

// path map
// collect paths from existing queries
// display path nodes
// display queries for each node
// display script icon for queries
// activate folder toggle
// activate query dbl click
// folder create
// folder remove
// folder drag/drop
// query remove
// query drag drop
// keep everything in sync
// session sync
// remove old system

    return function(el) {
        var wrapper;

        el.find(".pg-toolbar").append(tplToolbar);
        var elActions = el.find(".pg-toolbar-actions"),
            elContext = el.find(".pg-toolbar-context"),
            elMain    = el.find(".pg-queries"),
            elList    = elMain.append('<ul class="pg-query-list"></ul><div class="pg-tree"></div><div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>You don\'t have saved queries. To save a query use the "disk" button on the editor toolbar.</p></div>').find("ul"),
            elTree    = elMain.find(".pg-tree"),
            elRoot    = elTree.append('<div class="pg-root"></div>').find(".pg-root"),
            elFolders = elTree.append('<div class="pg-structure"></div>').find(".pg-structure");
        elActions.html("query manager");
        var tree = elFolders.jstree({
            plugins : [
                "themes"
            ]
        });
        elRoot.html('<div class="jstree jstree-default"><a href="#" data="/"><ins class="jstree-icon jstree-themeicon"> </ins>/</a></div>');

        function openQuery(id) {
            $(wrapper).trigger("requestopenquery", store.get("queries."+utils.normalizeQueryName(id)));
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

        function hideMessage() {
            elList.show();
            elTree.show();
            elMain.find(".pg-message").hide();
        }

        function showMessage() {
            elList.hide();
            elTree.hide();
            elMain.find(".pg-message").show();
        }

        function pathFromId(id) {
            var t = id.split("/");
            t.pop(); // discard query name
            if(t.length == 0) {
                return null;
            } else {
                return t.join("/");
            }
        }

        function getFolderByPath(path) {
            if(path === null || path === "/") return -1;
            var list = tree.find("li"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function addQueryToFolder(folder, name) {

        }

        function addFolderPath(folder) {
            var parentpath = folder,
                parent;
console.log(())
            // walk back until a valid node is found
            while((parent = getFolderByPath(parentpath)) !== null) {
                var parts = parentpath.split("/");
                parts.pop();
                parentpath = parts.join("/");
            }
console.log(parent);
            if(parentpath.length === folder.length) return parent; // folder already exists in the tree
            // walk forward adding new sub-folders
            var segments = folder.substr(0, parentpath.length + 1).split("/");
            for(var i = 0; i < segments.length; i++) {
                parent = addChildFolder(parent, segments[i]);
            }
            return parent;
        }

        function addChildFolder(parent, name, callback) {
            if(!parent) parent = -1;
            return tree.jstree(
                "create_node"
                , parent
                , {
                      "title" : name
                    , data : name
                    , "li_attr" : {
                        data : name
                    }
                }
                , "last"
                , function(el) {
                    /*
                    ui.clickOrDoubleClick($(el).find("a:first"), function(e) {
                        menuselected = e.currentTarget;
                        var pos = $(e.currentTarget).offset(),
                            h = $(e.currentTarget).outerHeight();
                        menu.css({
                            position : "absolute",
                            top : (pos.top + h) + "px",
                            left : (pos.left) + "px",
                            zIndex : e.currentTarget.style.zIndex + 100
                        }).show();
                        e.preventDefault(); return false;
                    }, function(e) {
                        menuselected = e.currentTarget;
                        tree.jstree("toggle_node", menuselected);
                        e.preventDefault(); return false;
                    });
                    wireFileUpload(el, path);
                    if(callback)
                        callback.apply(el, [path]);
                    */
                    e.preventDefault(); return false;
                }
            );
        }

        function addQuery(id, name) {
            var path = pathFromId(id),
                npath = "/" + (path === null ? "" : path);
            if(!foldersmap[npath]) {
                foldersmap[npath] = [name];
                if(npath != "/")
                    addFolderPath(path);
            } else {
                foldersmap[npath].push(name);
            }
            var folder = getFolderByPath(path);
            addQueryToFolder(folder, name);

            // OLD
            var li = elList.append('<li class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" data-name="'+id+'"><span class="ui-button-icon-primary ui-icon ui-icon-script"></span><span class="ui-button-text">'+name+'</span></li>').find("li:last");
            ui.clickOrDoubleClick(li, function(e) {
                var pos = $(e.currentTarget).offset(),
                    h = $(e.currentTarget).outerHeight(),
                    w = $(e.currentTarget).outerWidth();
                menu.css({
                    position : "absolute",
                    top : (pos.top + h) + "px",
                    left : (pos.left) + "px",
                    width : w + "px",
                    zIndex : e.currentTarget.style.zIndex + 100
                }).show().find("ul").outerWidth(w);
                menuselected = e.currentTarget;
                e.preventDefault(); return false;
            }, function(e) {
                var id = $(e.currentTarget).attr("data-name");
                openQuery(id);
                menu.hide();
                e.preventDefault(); return false;
            });
            li.mouseenter(function() { $(this).addClass("ui-state-hover"); })
              .mouseleave(function() { $(this).removeClass("ui-state-hover"); });
            utils.sortNodes(elList.find("li"), function(a, b) {
                return a.getAttribute("data-name") < b.getAttribute("data-name") ? -1 : (a.getAttribute("data-name") > b.getAttribute("data-name") ? 1 : 0);
            });
            list.push(name);
            if(list.length === 1) {
                hideMessage();
            }
        }

        function removeQuery(id) {
            elList.find('[data-name="'+id+'"]').remove();
            var pos = list.indexOf(id);
            if(pos >= 0)
                list.splice(pos, 1);
            if(list.length === 0) {
                showMessage();
            }
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
                removeQuery(utils.normalizeQueryName(removed[i]));
                $(wrapper).trigger("removed", removed[i]);
            }
            for(var i = 0; i < added.length; i++) {
                addQuery(utils.normalizeQueryName(added[i]), added[i]);
            }
            list = names;
        });

        return wrapper = {
            exist : function(name) {
                var id = utils.normalizeQueryName(name);
                return !!store.get("queries."+id);
            },
            save : function(name, code) {
                if(this.exist(name))
                    return this.update(name, code);
                else
                    return this.create(name, code);
            },
            create : function(name, code) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(query) return false;
                store.set("queries."+id, query = {
                    name : name,
                    code : code
                }, true);
                addQuery(id, name);
                $(wrapper).trigger("created", query);
                return true;
            },
            update : function(name, code) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                query.code = code;
                store.set("queries."+id, query);
                $(wrapper).trigger("updated", query);
                return true;
            },
            remove : function(name) {
                var id = utils.normalizeQueryName(name);
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
