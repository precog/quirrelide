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
    , 'libs/jquery/jstree/jstree.sort'
    , 'libs/jquery/jstree/jstree.themes'
],

function(precog, createStore, ui, utils, demo, openRequestInputDialog, openConfirmDialog, tplToolbar, tplQueryContextMenut) {
    var list = [],
        DEMO_TOKEN = "1BF2FA96-8817-4C98-8BCB-BEC6E86CB3C2",
        STORE_KEY = "pg-quirrel-queries-"+precog.hash,
        store = createStore(STORE_KEY, { queries : (DEMO_TOKEN === precog.config.tokenId ? demo : {})});


    store.monitor.start(500);

// activate folder toggle on dblclick
// folder menu
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
//            elList    = elMain.append('<ul class="pg-query-list"></ul>').find("ul"),
            elTree    = elMain.append('<div class="pg-tree"></div><div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>You don\'t have saved queries. To save a query use the "disk" button on the editor toolbar.</p></div>').find(".pg-tree"),
            elRoot    = elTree.append('<div class="pg-root"></div>').find(".pg-root"),
            elFolders = elTree.append('<div class="pg-structure"></div>').find(".pg-structure");
        elActions.html("query manager");
        var tree = elFolders.jstree({
            plugins : [
                "themes", "sort"
            ],
            sort : function (a, b) {
                if($(a).attr("rel") > $(b).attr("rel")) {
                    return 1;
                }
                return $(a).attr("data") > $(b).attr("data") ? 1 : -1;
            },
            types : {
                query : {
                    valid_children : "none"
                },
                folder : {
                    valid_children : ["folder", "query"]
                }
            }
        });
        elRoot.html('<div class="jstree jstree-default"><a href="#" data="/"><ins class="jstree-icon jstree-themeicon"> </ins>/</a></div>');

        function openQuery(id) {
            $(wrapper).trigger("requestopenquery", store.get("queries."+utils.normalizeQueryName(id)));
        }

        var menuselected, menu = ui.contextmenu(tplQueryContextMenut);

        menu.find(".pg-open").click(function(e) {
            var id = $(menuselected).attr("data");
            openQuery(id);
            menu.hide();
            e.preventDefault(); return false;
        });
        menu.find(".pg-remove").click(function(e) {
            var id = $(menuselected).attr("data");
            wrapper.queryRemove(id);
            menu.hide();
            e.preventDefault(); return false;
        });

        function hideMessage() {
//            elList.show();
            elTree.show();
            elMain.find(".pg-message").hide();
        }

        function showMessage() {
//            elList.hide();
            elTree.hide();
            elMain.find(".pg-message").show();
        }

        function pathFromId(id) {
            if(id.substr(0, 1) === '/') id = id.substr(1);
            var t = id.split("/");
            t.pop(); // discard query name
            if(t.length === 0)
                return "/";
            else
                return "/" + t.join("/");
        }

        function getFolderNodeByPath(path) {
            if(!path || path === "/") return -1;
            var list = tree.find("li[rel=folder]"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function getQueryNodeByPath(path) {
            if(!path || path === "/") return -1;
            var list = tree.find("li[rel=query]"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function createNodeCreatedHandler(path, callback) {
            var f = function(e, data) {
                var r = data.rslt, el = $(r.obj[0]);
                if(el.attr("data") !== path) return;
                tree.unbind("create_node.jstree", f);
                if(callback)
                    callback(el);
            }
            return f;
        }

        function addQueryToFolder(folder, name, callback) {
            var path = (folder === -1 ? "" : $(folder).attr("data")) + "/" + name;
            tree.bind("create_node.jstree", createNodeCreatedHandler(path, function(el) {
                tree.jstree("set_icon", el, 'pg-tree-leaf');
                ui.clickOrDoubleClick(el, function(e) {
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
                    var id = $(e.currentTarget).attr("data");
                    openQuery(id);
                    menu.hide();
                    e.preventDefault(); return false;
                });
                el.mouseenter(function() { $(this).addClass("ui-state-hover"); })
                    .mouseleave(function() { $(this).removeClass("ui-state-hover"); });
                if(callback) callback(el);
            }));
            return tree.jstree(
                  "create_node"
                , folder
                , {
                     "title" : name
                    , "li_attr" : {
                        data : path,
                        rel : "query"
                    }
                }
                , "last"
            );
        }

        function addChildFolder(parent, name, callback) {
            if(!parent) parent = -1;
            var path = (parent === -1 ? "" : $(parent).attr("data")) + "/" + name;
            tree.bind("create_node.jstree", createNodeCreatedHandler(path, callback));

            return tree.jstree(
                  "create_node"
                , parent
                , {
                      "title" : name
                    , "li_attr" : {
                        data : path,
                        rel : "folder"
                    }
                }
                , "last"
            );
        }

        function whenPathExists(path, handler) {
            handler = handler || function() {};
            var fpath = path, parent;
            while(null === (parent = getFolderNodeByPath(fpath))) {
                var parts = fpath.substr(1).split("/");
                parts.pop();
                fpath = "/" + parts.join("/");
            }
            if(fpath === path) {
                handler(parent);
                return;
            }
            var segment = path.substr(fpath.length).split("/").filter(function(v) { return !!v; }).shift();
            addChildFolder(parent, segment, function(el) {
                whenPathExists(path, handler);
            });
        }

        function addQuery(id, name) {
            var path = pathFromId(id);
            whenPathExists(path, function(el) {
                addQueryToFolder(el, name);
                hideMessage();
            });

            // OLD
            /*
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
            */
        }

        function removeQuery(path) {
            console.log(path);
            var node = getQueryNodeByPath(path);
            console.log(node);
            if(!node) return;
            tree.jstree("delete_node", node);
            // OLD
            /*
            elList.find('[data-name="'+id+'"]').remove();
            var pos = list.indexOf(id);
            if(pos >= 0)
                list.splice(pos, 1);
            if(list.length === 0) {
                showMessage();
            }
            */
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
            queryExist : function(name) {
                var id = utils.normalizeQueryName(name);
                return !!store.get("queries."+id);
            },
            querySave : function(name, code) {
                if(this.queryExist(name))
                    return this.queryUpdate(name, code);
                else
                    return this.queryCreate(name, code);
            },
            queryCreate : function(name, code) {
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
            queryUpdate : function(name, code) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                query.code = code;
                store.set("queries."+id, query);
                $(wrapper).trigger("updated", query);
                return true;
            },
            queryRemove : function(name) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                store.remove("queries."+id);
                removeQuery(name);
                $(wrapper).trigger("removed", query.name);
                return true;
            },
            nameAtPath : function(name) {
                return name;
            }
        };
    }
});
