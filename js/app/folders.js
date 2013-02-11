define([
      "app/util/precog"
    , "app/util/storagemonitor"
    , "app/util/uiconfig"
    , "app/util/ui"
    , "app/util/utils"
    , "app/util/notification"
    , "app/util/dialog-lineinput"
    , "app/util/dialog-confirm"
    , "app/util/humanize"
    , "rtext!templates/toolbar.folders.html"

    , 'libs/jquery/jstree/vakata'
    , 'libs/jquery/jstree/jstree'
    , 'libs/jquery/jstree/jstree.sort'
    , 'libs/jquery/jstree/jstree.ui'
    , 'libs/jquery/jstree/jstree.themes'
],

/*
TODO:
  * display "events node" for non-empty folders
  * add "events node" after upload (force refresh at path?)
  * on dblclick "events node" load query
  * on "events node" selection:
    * deactivate create folder
    * deactivate delete folder
    * deactivate upload
    * deactivate download
  * on "folder node" selection:
    * deactivate execute query
  * prohibit saving a query with a conflicting name for "other node"
*/

function(precog, createStore, uiconfig, ui,  utils, notification, openRequestInputDialog, openConfirmDialog, humanize, tplToolbar){
//    var UPLOAD_SERVICE = "upload.php",
    var DOWNLOAD_SERVICE = "download.php",
        LOAD_MORE_LABEL = "[load more]",
        STORE_KEY = "pg-quirrel-virtualpaths-"+precog.hash,
        basePath = precog.config.basePath || "/",
        store = createStore(STORE_KEY, { virtuals : { }});

    function setVirtualPath(parent, name) {
        var arr = getVirtualPaths(parent);
        if(arr.indexOf(name) < 0)
        {
            arr.push(name);
            store.set("virtuals." + parent, arr);
        }
    }

    function getAllVirtualPaths() {
        return store.get("virtuals", {});
    }

    function getVirtualPaths(parent) {
        return store.get("virtuals."+parent, []);
    }

    function removeVirtualPaths(parent, name) {
      var arr = store.get("virtuals."+parent, []),
        pos = arr.indexOf(name);
      if(pos < 0) return;
      arr.splice(pos, 1);
      if(arr.length === 0) {
        store.remove("virtuals."+parent, true);
      } else {
        store.set("virtuals."+parent, arr, true);
      }
    }

    function normalizePath(path) {
      path = path.replace(/\/+/g, "/");
      if(path.substr(-1) === "/")
        path = path.substr(0, path.length - 1);
      return path;
    }

    function removeVirtualPath(path) {
      path = normalizePath(path).substr(1);
      var parts = path.split("/");
      while(parts.length > 0) {
        var name = parts.pop();
        removeVirtualPaths("/"+parts.join("/"), name);
      }
    }

    return function(el) {
        var wrapper, map;

        el.find(".pg-toolbar").append(tplToolbar);
        var elDescription = el.find(".pg-toolbar-description"),
            elActions = el.find(".pg-toolbar-actions"),
            elContext = el.find(".pg-toolbar-context"),
            elRoot = el.find(".pg-tree").append('<div class="pg-root"></div>').find(".pg-root"),
            elFolders = el.find(".pg-tree").append('<div class="pg-structure"></div>').find(".pg-structure"),
            elUploader = el.append('<div style="display: none"><input name="files" type="file" multiple></div>').find('input[type=file]'),
            contextButtons = [],
            selectedNode;

        if(!uiconfig.disableUpload) {
          contextButtons.push(ui.button(elContext, {
            text : false,
            icon : "ui-icon-new-folder",
            description : "create new folder",
            handler : function() { requestNodeCreationAt($(selectedNode).attr("data")); }
          }));

          contextButtons.push(ui.button(elContext, {
            text : false,
            icon : "ui-icon-trash",
            handler : function() { requestNodeRemovalAt($(selectedNode).attr("data")); }
          }));
        }

        contextButtons.push(
          ui.button(elContext, {
            text : false,
            icon : "ui-icon-query",
            description : "query data at path",
            handler : function() { triggerQuery(removeBasePath($(selectedNode).attr("data"))); }
          })
        );

        if(!uiconfig.disableDownload) {
			contextButtons.push(ui.button(elContext, {
				text : false,
				icon : "ui-icon-arrowthickstop-1-s",
				description : "download folder data",
				handler : function() { window.location.href = downloadUrl($(selectedNode).attr("data")); }
			}));
        }
		
        if(!uiconfig.disableUpload) {
          contextButtons.push(ui.button(elContext, {
            text : false,
            icon : "ui-icon-arrowthickstop-1-n",
            description : "upload data to folder",
            handler : function() { uploadDialog($(selectedNode).attr("data")); }
          }));
        }

        function refreshActions() {
            var path = selectedNode && $(selectedNode).attr("data");
            $.each(contextButtons, function() {
                $(this).button("disable");
            });
            if(path) {
                $(contextButtons[0]).button("enable");
                if(path !== "/") {
                    $.each(contextButtons, function() {
                        $(this).button("enable");
                    });
                }
            }
        }

        refreshActions();

        elDescription.html("file system");
        var tree = elFolders.jstree({
            plugins : [
                "themes", "sort", "ui", "types"
            ],
            ui : {
                  select_limit : 1
                , selected_parent_close : "deselect"
                , select_multiple_modifier : false
                , select_range_modifier : false
            },
            types : {
              more : {
                valid_children : "none"
              },
              folder : {
                valid_children : ["folder", "more"]
              }
            },
            sort : function (a, b) {
              var va = this.get_text(a, true),
                  vb = this.get_text(b, true);
              if(va === LOAD_MORE_LABEL)
                return 1;
              else if(vb == LOAD_MORE_LABEL)
                return -1;
              return va === vb ? 0 : (va > vb ? 1 : -1);
            }
        });
        elRoot.html('<div class="jstree jstree-default"><a href="#" data="'+basePath+'"><ins class="jstree-icon jstree-themeicon"> </ins>/</a></div>');
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

        tree.bind("open_node.jstree", function(e, data) {
            var paths = $(data.rslt.obj).find("li");

            paths.each(function(i, el){
                var path = normalizePath($(el).attr("data"));
                if(map[path]) return;
                loadAtPath(path, 1, el);
            });
        });

        function triggerQuery(path) {
            $(wrapper).trigger("querypath", normalizePath(path));
        }

        function createNodeAt(path, name) {
            if(!(name && path)) {
                return;
            }
            // create path in config
            setVirtualPath(path, name);
            // traverse the tree from the root to path
            var parent = path === basePath ? -1 : findNode(path);
            if(!parent) return;
            // create visual node
            var p = normalizePath(("/" === path ? "/" : path + "/") + name);
            if(map[p]) return; // node already exists in the tree
            map[p] = true;
            addNodeFolder(name, p, null, parent);
        }

        function findNode(path) {
            var list = tree.find("li"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function removeNode(path) {
            if(!path && (path = path.trim()) === "/" ) {
                return;
            }
            path = normalizePath(path);
            $(wrapper).trigger("requestPathDeletion", path);
            removeVirtualPath(path);

            delete map[path];
            for(var key in map) {
              if(map.hasOwnProperty(key)) {
                if(key.substr(0, path.length + 1) === path + "/") {
                  delete map[key];
                }
              }
            }

            removeFolder(path);
        }

        function requestNodeCreationAt(path) {
            var p = removeBasePath(path),
                title   = "Create Folder",
                message = "Create a sub folder at: <i>"+p+"</i>";
            openRequestInputDialog(title, message, "folder name", "", function(name) {
                if(null != name && name.match(/^[a-z0-9]+$/i))
                    return null; // OK
                else
                    return "path name cannot be empty and it can only be composed of alpha-numeric characters";
            }, function(name) {
                createNodeAt(path, name);
            });
        }

        function removeBasePath(path) {
          path = normalizePath(path);
          path = (path + "/").substr(0, basePath.length) === basePath ? (path + "/").substr(basePath.length) : path;
          if(!path) path = "/";
          return path;
        }

        function requestNodeRemovalAt(path) {
            var p = path.substr(0, basePath.length) === basePath ? "/" + path.substr(basePath.length) : path,
                title   = "Delete Folder",
                message = "Are you sure you want to delete the folder at: <i>"+path+"</i> and all of its content?<br>This operation cannot be undone!";
            openConfirmDialog(
                title,
                message,
                function() {
                    precog.deletePath(p, function(success) {
                      if(success)
                        removeNode(path);
                      else
                        alert("an error occurred deleting the path " + path);
                    });
                },
                { captcha : true }
            );
        }

        function uploadDialog(path) {
            var p = removeBasePath(path),
                title   = "Upload Data",
                message = "Upload data at: <i>"+p+"</i><br>You can use a JSON file (one array of values/objects), a text file containing one JSON object per line, a CSV file (headers are mandatory) or a zip file containing any combination of the previous formats.";
            openRequestInputDialog(title, message, "file to upload", "", function(name) {
                if(name)
                    return null; // OK
                else
                    return "select a file";
            }, function(_, files) {
              if(files) {
                for(var i = 0; i < files.length; i++) {
                  uploadFile(files[i], path);
                }
              }
            }, "file");
        }

        function downloadUrl(path) {
            return DOWNLOAD_SERVICE
                + "?apiKey=" + encodeURIComponent(precog.config.apiKey)
                + "&analyticsService=" + encodeURIComponent(precog.config.analyticsService)
                + "&path=" + encodeURIComponent(path);
        }

        function addNodeFolder(name, path, callback, parent) {
            if(!parent) parent = -1;
            return tree.jstree(
                  "create_node"
                , parent
                , {
                    "title" : name
                    , data : path
                    , "li_attr" : {
                        data : path,
                        rel : "folder"
                    }
                }
                , "last"
                , function(el) {
                    $(el).find("a:first").dblclick(function(e) {
                        tree.jstree("toggle_node", selectedNode);
                        e.preventDefault(); return false;
                    });
                    wireFileUpload(el, path);
                    if(callback)
                        callback.apply(el, [path, el]);
                    return false;
                }
            );
        }

        function nodeFromData(data) {
          var r = data.rslt;
          return $(r.obj[0]);
        }

        function nodeType(node) {
          return node.attr("rel");
        }

        tree.bind("create_node.jstree", function(e, data) {
          var node = nodeFromData(data),
              type = nodeType(node);
          if(type === "more") {
            tree.jstree("set_icon", node, 'pg-tree-more');
          }
        });

        tree.bind("select_node.jstree", function(e, data) {
          var node = nodeFromData(data),
              type = nodeType(node);
          if(type === "more") {
            tree.jstree("deselect_node", node);
          }
        });

        tree.bind("hover_node.jstree", function(e, data) {
          var node = nodeFromData(data),
              type = nodeType(node);
          if(type === "more") {
            tree.jstree("dehover_node", node);
          }
        });

        function addNodeMore(name, path, callback, parent) {
          if(!parent) parent = -1;
          return tree.jstree(
            "create_node"
            , parent
            , {
              "title" : name
              , data : path
              , rel : "more"
              , "li_attr" : {
                data : path,
                rel : "more"
              }
            }
            , "last"
            , function(el) {
              $(el).click(function() {
                var p = path.split("/").slice(0, -1).join("/");
                map[p].page++;
                loadPaths(p, 2);
                tree.jstree("delete_node", el);
              });
              if(callback)
                callback.apply(el, [path, el]);
              return false;
            }
          );
        }

        function removeFolder(path) {
            var node = findNode(path);
            if(node === null)
                return;
            tree.jstree("delete_node", node);
        }

        var page_size = 15;

        function loadPaths(path, levels) {

          var parent = findNode(path);

          var base = "/" === path ? "" : path;
          var pos = map[path].page * page_size,
              paths = map[path].paths.slice(pos, pos + page_size);
          function dequeue() {
            if(paths.length === 0) {
              if(map[path] && ((1 + map[path].page) * page_size) < map[path].paths.length) {
                var p = path + "/" + LOAD_MORE_LABEL;
                addNodeMore(LOAD_MORE_LABEL, p,
                  function(p, node) {},
                  parent || -1);
              }
              return;
            }
            var p = base + paths.shift();
            addNodeFolder(p.split("/").pop(), p, function(){
              if(levels > 1) {
                loadAtPath(p, levels-1);
              }
            }, parent || -1);
            setTimeout(dequeue, 0);
          }

          setTimeout(dequeue, 0);
        }

        function loadAtPath(path, levels) {
            if("undefined" === typeof levels)
                levels = 1;
            path = normalizePath(path);
            map[path] = true;
            var virtuals = getVirtualPaths(path)
            precog.paths(removeBasePath(path), function(paths){
                $.each(virtuals, function(i, virtual) {
                  if(virtual.substr(0,1) !== '/') virtual = '/' + virtual;
                  if(paths.indexOf(virtual) < 0) paths.push(virtual);
                });
                paths.sort();
                map[path] = { paths : paths, page : 0 };
                loadPaths(path, levels);
            });
        }

        ui.button(elActions, {
            icon   : "ui-icon-refresh",
            description : "refresh folders",
            handler : function() { wrapper.refresh(); }
        });

        wrapper = {
            refresh : function() {
                map = {};
                tree.jstree("delete_node", "*");
                loadAtPath(basePath, 2);
            },
            createNodeAt : function(path, name) {
                createNodeAt(path, name);
            },
            requestNodeCreationAt : function(path) {
                requestNodeCreationAt(path);
            }
        };

        // uploading logic
        elUploader.on("change", function() {
            e.preventDefault(); return false;
        });

        function uploadFile(file, path) {
          if(!file) return;
          var filename = file.fileName || file.name,
              extension = filename.split(".").pop().toLowerCase();
          if(["json", "csv", "zip"].indexOf(extension) < 0) {
            notification.error("invalid file type", { text : "You can only upload files of type json, csv or zip. Be sure that the file extension matches the type." });
            return;
          }
          path = removeBasePath(path);
          var data = file; //e.target.result, //file

          var noty = { text : "Starting upload of '" + filename+"'" };

          notification.progress("upload file", noty);

          function progress(e) {
            noty.progressStep(e.loaded/ e.total);
            noty.el.find(".pg-message").html("uploaded " + humanize.filesize(e.loaded) + " of " + humanize.filesize(e.total));
          }
          function complete(e) {
            if(e.failed > 0) {
              if(e.ingested === 0) {
                message = 'All of the ' + humanize.numberFormat(e.total, 0) + ' events failed to be stored.';
              } else {
                message = humanize.numberFormat(e.ingested, 0) + ' events have been stored correctly, ' + humanize.numberFormat(e.failed, 0) + ' failed to be stored.';
              }
              if(e.skipped) {
                message += "<br>Skipped " + humanize.numberFormat(e.skipped, 0) + " events (the ingest process stops after "+humanize.numberFormat(e.failed, 0)+" errors)."
              }
              if(e.errors.length) {
                var m = {};

                $(e.errors).each(function() {
                  var line   = this.line,
                      reason = this.reason,
                      arr    = m[reason] || (m[reason] = []);
                  arr.push(line);
                });

                var errors = [];
                for(var field in m) {
                  if(m.hasOwnProperty(field)) {
                    errors.push(field + " at line(s): " + m[field].join(", "));
                  }
                }
                message +=
                  "<p>Error details:</p>" +
                  "<ul class=\"errors\"><li>" +
                  errors.join("</li><li>") +
                  "</li></ul>";
              }
              noty.progressError(message);
              $(wrapper).trigger("uploadError");
            } else {
              message = 'all of the ' + humanize.numberFormat(e.total, 0) + ' events have been queued correctly and are now in the process to be ingested';
              noty.progressComplete(message);
              $(wrapper).trigger("uploadComplete");
            }
          }
          function error(e) {
            noty.progressError("An error occurred while uploading your file. No events have been stored in Precog: " + JSON.stringify(e));
            $(wrapper).trigger("uploadError");
          }

          precog.ingest(path, data, extension, progress, complete, error);
          $(wrapper).trigger("uploadStart");
        }
        function traverseFiles (files, path) {
            if (typeof files !== "undefined") {
                for (var i=0, l=files.length; i<l; i++) {
                    uploadFile(files[i], path);
                }
            } else {
                alert("No support for the File API in this web browser");
            }
        }

        var dragnoty;

        function removeDragNotification() {
            if(!dragnoty) return;
            dragnoty.hide();
            dragnoty.remove();
            dragnoty = null;
        }

        var $pgide = $(el).parents(".pg-labcoat")
            .on("dragenter", function(e) {
                if(dragnoty) return;
                dragnoty = notification.success("Drag your file on a folder to upload data", {
                      hide : false
                    , history : false
                });
                e.preventDefault(); return false;
            })
            .on("dragleave", function(e) {
                var x = e.originalEvent.pageX, y = e.originalEvent.pageY;
                var pos = $pgide.offset(),
                    w = $pgide.outerWidth(),
                    h = $pgide.outerHeight();
                if(x <= pos.left || (x >= pos.left + w) || (y <= pos.top) || (y >= pos.top + h)) {
                    removeDragNotification();
                }
            })
            .on("dragover", function (e) {
                e.preventDefault(); return false;
            })
            .on("drop", function(e) {
                removeDragNotification();
                e.preventDefault(); return false;
            });

        function wireFileUpload(el, path) {
            $(el).on("dragleave", function (e) {
                $(this).removeClass("ui-state-active");
                e.preventDefault(); return false;
            }).on("dragenter", function (e) {
                $(this).addClass("ui-state-active");
                e.preventDefault(); return false;
            }).on("dragover", function (e) {
                e.preventDefault(); return false;
            }).on("drop", function (e) {
                $(this).removeClass("ui-state-active");
                traverseFiles(e.originalEvent.dataTransfer.files, path);
                removeDragNotification();
                e.preventDefault(); return false;
            });
        }
        wrapper.refresh();

        store.monitor.bind("virtuals", function(_, paths) {
            var current = getAllVirtualPaths(),
                toadd = [];
            for(var path in paths) {
                if(current.hasOwnProperty(path)) {
                    if(!current[paths]) {
                        var list = paths[path];
                        for(var i = 0; i < list.length; i++) {
                            toadd.push({
                                path : path,
                                name : list[i]
                            });
                        }
                    }
                }
            }
            for(var i = 0; i < toadd.length; i++) {
                var o = toadd[i];
                createNodeAt(o.path, o.name);
            }
        });

        return wrapper;
    }
});