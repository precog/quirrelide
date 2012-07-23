define([
      "app/util/precog"
    , "app/util/storagemonitor"
    , "app/util/ui"
    , "app/util/utils"
    , "app/config/demo-queries"
    , "app/util/dialog-lineinput"
    , "app/util/dialog-confirm"

    , "rtext!templates/toolbar.folders.html"

    , 'libs/jquery/jstree/vakata'
    , 'libs/jquery/jstree/jstree'
    , 'libs/jquery/jstree/jstree.sort'
    , 'libs/jquery/jstree/jstree.ui'
    , 'libs/jquery/jstree/jstree.themes'
],

function(precog, createStore, ui, utils, demo, openRequestInputDialog, openConfirmDialog, tplToolbar) {
    var list = [],
        DEMO_TOKEN = "1BF2FA96-8817-4C98-8BCB-BEC6E86CB3C2",
        STORE_KEY = "pg-quirrel-queries-"+precog.hash,
        store = createStore(STORE_KEY, { queries : (DEMO_TOKEN === precog.config.tokenId ? demo : {}), folders : ["/a", "/b/c"] });


    store.monitor.start(500);

    return function(el) {
        var wrapper;

        el.find(".pg-toolbar").append(tplToolbar);
        var elDescription = el.find(".pg-toolbar-description"),
            elActions = el.find(".pg-toolbar-actions"),
            elContext = el.find(".pg-toolbar-context"),
            elMain    = el.find(".pg-queries"),
            elTree    = elMain.append('<div class="pg-tree"></div><div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>You don\'t have saved queries. To save a query use the "disk" button on the editor toolbar.</p></div>').find(".pg-tree"),
            elRoot    = elTree.append('<div class="pg-root"></div>').find(".pg-root"),
            elFolders = elTree.append('<div class="pg-structure"></div>').find(".pg-structure"),
            contextButtonsRoot = [
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-plus",
                    handler : function() { requestFolderCreationAt($(selectedNode).attr("data")); }
                })
            ],
            contextButtonsFolder = [
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-plus",
                    handler : function() { requestFolderCreationAt($(selectedNode).attr("data")); }
                })
            ],
            contextButtonsQuery = [
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-minus",
                    handler : function() { wrapper.queryRemove($(selectedNode).attr("data")); }
                })
            ],
            selectedNode;
        elDescription.html("query manager");

        function refreshActions() {
            var path = selectedNode && $(selectedNode).attr("data");
            if(!path || path !== "/") {
                $.each(contextButtonsRoot, function() {
                    this.hide();
                });
            }
            if(!path || (path.length > 1 && path.substr(0, 1) !== "/")) {
                $.each(contextButtonsQuery, function() {
                    this.hide();
                });
            }
            if(!path || path === "/") {
                $.each(contextButtonsFolder, function() {
                    this.hide();
                });
            }
            if(!path || path === "/") {
                $.each(contextButtonsQuery, function() {
                    this.hide();
                });
            }
            if(path) {
                if(path === "/") {
                    $.each(contextButtonsRoot, function() {
                        this.show();
                    });
                } else if(path.substr(0, 1) === '/') {
                    $.each(contextButtonsFolder, function() {
                        this.show();
                    });
                } else {
                    $.each(contextButtonsQuery, function() {
                        this.show();
                    });
                }
            }
        }

        refreshActions();

        function requestFolderCreationAt(path) {
            var title   = "Create Folder",
                message = "Create a sub folder at: <i>"+path+"</i>";
            openRequestInputDialog(title, message, "folder name", "", function(name) {
                if(null != name && name.match(/^[a-z0-9]+$/i))
                    return null; // OK
                else
                    return "path name cannot be empty and it can only be composed of alpha-numeric characters";
            }, function(name) {
                var p = path +"/"+ name;
                folders.push(p);
                store.set("folders", folders, true);
                whenPathExists(p);
            });
        }

        var tree = elFolders.jstree({
            plugins : [
                "themes", "sort", "ui"
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
            },
            ui : {
                  select_limit : 1
                , selected_parent_close : "deselect"
                , select_multiple_modifier : false
                , select_range_modifier : false
            }
        });
        elRoot.html('<div class="jstree jstree-default"><a href="#" data="/"><ins class="jstree-icon jstree-themeicon"> </ins>/</a></div>');
        elRoot.find('a')
            .mouseenter(function(){
                $(this).addClass("jstree-hovered");
            })
            .mouseleave(function() {
                $(this).removeClass("jstree-hovered");
            })
            .click(function() {
                tree.jstree("deselect_all");
                $(this).addClass("jstree-clicked");
                selectedNode = this;
                refreshActions();
            });
        tree.bind("click.jstree", function() {
            elRoot.find('a').removeClass("jstree-clicked");
            selectedNode = tree.jstree("get_selected");
            refreshActions();
        });

        function openQuery(id) {
            $(wrapper).trigger("requestopenquery", store.get("queries."+utils.normalizeQueryName(id)));
        }

        function hideMessage() {
            elTree.show();
            elMain.find(".pg-message").hide();
        }

        function showMessage() {
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
            tree.bind("create_node.jstree", createNodeCreatedHandler(name, function(el) {
                tree.jstree("set_icon", el, 'pg-tree-leaf');
                $(el).dblclick(function() {
                    var path = $(this).attr("data");
                    openQuery(path);
                });
                if(callback) callback(el);
            }));
            return tree.jstree(
                  "create_node"
                , folder
                , {
                     "title" : name.split("/").pop()
                    , "li_attr" : {
                        data : name,
                        rel : "query"
                    }
                }
                , "last"
            );
        }

        function addChildFolder(parent, name, callback) {
            if(!parent) parent = -1;
            var path = (parent === -1 ? "" : $(parent).attr("data")) + "/" + name;
            tree.bind("create_node.jstree", createNodeCreatedHandler(path, function(el) {
                $(el).find("a:first").dblclick(function(e) {
                    tree.jstree("toggle_node", selectedNode);
                    e.preventDefault(); return false;
                });
                if(callback) callback(el);
            }));

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
        }

        function removeQuery(path) {
            var node = getQueryNodeByPath(path);
            if(!node) return;
            tree.jstree("delete_node", node);
        }

        var queries = store.get("queries");
        for(var id in queries) {
            if(queries.hasOwnProperty(id)) {
                addQuery(id, queries[id].name);
            }
        }

        var folders = store.get("folders", []);
        for(var i = 0; i < folders.length; i++) {
            var path = folders[i];
            whenPathExists(path);
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
        store.monitor.bind("folders", function(_, names) {
            var added   = utils.arrayDiff(names, folders);

            store.load();
            for(var i = 0; i < added.length; i++) {
                whenPathExists(added[i]);
            }
            folders = names;
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
                store.set("queries."+id, query, true);
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
                if(!selectedNode)
                    return name;
                var path = $(selectedNode).attr("data");
                if(!path || path === "/")
                    return name;
                return path.substr(1) + "/" + name;
            }
        };
    }
});
