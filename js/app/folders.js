define([
      "app/util/precog"
    , "app/util/storagemonitor"
    , "app/util/ui"
    , "app/util/utils"
    , "app/util/notification"
    , "app/util/dialog-lineinput"
    , "app/util/dialog-confirm"
    , "rtext!templates/toolbar.folders.html"
    , "rtext!templates/menu.context.system.node.html"
    , "rtext!templates/menu.context.system.root.html"

    , 'libs/jquery/jstree/vakata'
    , 'libs/jquery/jstree/jstree'
    , 'libs/jquery/jstree/jstree.sort'
    , 'libs/jquery/jstree/jstree.ui'
    , 'libs/jquery/jstree/jstree.themes'
],

function(precog, createStore, ui,  utils, notification, openRequestInputDialog, openConfirmDialog, tplToolbar, tplNodeContextMenut, tplRootContextMenut){
    var UPLOAD_SERVICE = "upload.php",
        DOWNLOAD_SERVICE = "download.php",
        STORE_KEY = "pg-quirrel-virtualpaths-"+precog.hash,
        basePath = precog.config.basePath || "/",
        store = createStore(STORE_KEY, { virtuals : { }});

    store.monitor.start(500);

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
            store.remove("virtuals."+parent);
        } else {
            store.set("virtuals." + parent, arr);
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
//            btnCreateFolder = ui.button(elContext, {
//                disabled : false,
//                label : "create folder",
//                text : false,
//                handler : function() {},
//                icons : null
//            }),
            contextButtonsRoot = [
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-plus",
                    handler : function() { requestNodeCreationAt($(selectedNode).attr("data")); }
                })
            ],
            contextButtonsNode = [
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-plus",
                    handler : function() { requestNodeCreationAt($(selectedNode).attr("data")); }
                }),
                ui.button(elContext, {
                    text : false,
                    icon : "ui-icon-lightbulb",
                    handler : function() { triggerQuery($(selectedNode).attr("data")); }
                })
            ],
            selectedNode;

        function refreshActions() {
            var path = selectedNode && $(selectedNode).attr("data");
            console.log(path);
            if(!path || path !== "/") {
                $.each(contextButtonsRoot, function() {
                    this.hide();
                });
            }
            if(!path || path === "/") {
                $.each(contextButtonsNode, function() {
                    this.hide();
                });
            }
            if(path) {
                if(path === "/") {
                    $.each(contextButtonsRoot, function() {
                        this.show();
                    });
                } else {
                    $.each(contextButtonsNode, function() {
                        this.show();
                    });
                }
            }
            console.log("SELECTED NODE", selectedNode);
        }

        refreshActions();

        elDescription.html("virtual file system");
        var tree = elFolders.jstree({
            plugins : [
                "themes", "sort", "ui"
            ],
            ui : {
                  select_limit : 1
                , selected_parent_close : "deselect"
                , select_multiple_modifier : false
                , select_range_modifier : false
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
                var path = $(el).attr("data");
                if(map[path]) return;
                loadAtPath(path, 1, el);
            });
        });

        function triggerQuery(path) {
            $(wrapper).trigger("querypath", path);
        }

        function pathFromSelectedNode() {
            return $(menuselected).closest("li").attr("data") || $(menuselected).attr("data");
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
            var p = ("/" === path ? "/" : path + "/") + name;
            if(map[p]) return; // node already exists in the tree
            map[p] = true;
            addFolder(name, p, null, parent);
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
            $(wrapper).trigger("requestPathDeletion", path);
            // TODO: WIRE HERE PRECOG CALL
            delete map[path];
            removeFolder(path);
        }

        function requestNodeCreationAt(path) {
            var p = path.substr(0, basePath.length) === basePath ? "/" + path.substr(basePath.length) : path,
                title   = "Create Folder",
                message = "Create a sub folder at: <i>"+path+"</i>";
            // open dialog
            openRequestInputDialog(title, message, "folder name", "", function(name) {
                if(null != name && name.match(/^[a-z0-9]+$/i))
                    return null; // OK
                else
                    return "path name cannot be empty and it can only be composed of alpha-numeric characters";
            }, function(name) {
                createNodeAt(path, name);
            });
        }

        function requestNodeRemovalAt(path) {
            var p = path.substr(0, basePath.length) === basePath ? "/" + path.substr(basePath.length) : path,
                title   = "Delete Folder",
                message = "Are you sure you want to delete the folder at: <i>"+path+"</i> and all of its content?<br>This operation cannot be undone!";
            // open dialog
            openConfirmDialog(title, message, function() {
                removeNode(path);
            });
        }

        function uploadDialog(path) {
            var p = path.substr(0, basePath.length) === basePath ? "/" + path.substr(basePath.length) : path,
                title   = "Upload Data",
                message = "Upload data at: <i>"+path+"</i><br>You can use a JSON file (one array of values/objects), a text file containing one JSON object per line, a CSV file (headers are mandatory) or a zip file containing any combination of the previous formats.";
            // open dialog
            openRequestInputDialog(title, message, "file to upload", "", function(name) {
                if(name)
                    return null; // OK
                else
                    return "select a file";
            }, function(_, files) {
                for(var i = 0; i < files.length; i++) {
                    uploadFile(files[i], path);
                }
//                    createNodeAt(path, name);
            }, "file");
        }

        function downloadUrl(path) {
//                var p = basePath.substr(0, basePath.length - 1) + path;
            return DOWNLOAD_SERVICE
                + "?tokenId=" + encodeURIComponent(precog.config.tokenId)
                + "&analyticsService=" + encodeURIComponent(precog.config.analyticsService)
                + "&path=" + encodeURIComponent(path);
        }

        var menuselected,
            menu = ui.contextmenu(tplNodeContextMenut),
            menuRoot = ui.contextmenu(tplRootContextMenut);

        menu.find(".pg-toggle").click(function(e) {
            tree.jstree("toggle_node", menuselected);
            e.preventDefault(); return false;
        });
//        menu.find(".pg-query").click(function(e) {
//            triggerQuery(pathFromSelectedNode());
//            e.preventDefault(); return false;
//        });
//        menu.find(".pg-create").click(function(e) {
//            var path = pathFromSelectedNode();
//            requestNodeCreationAt(path);
//            e.preventDefault(); return false;
//        });
        menu.find(".pg-upload").click(function(e) {
            var path = pathFromSelectedNode();
            uploadDialog(path);
            e.preventDefault(); return false;
        });
        menu.find(".pg-download").click(function(e) {
            var path = pathFromSelectedNode();
            window.location.href = downloadUrl(path);
//                console.log(downloadUrl(path));
            e.preventDefault(); return false;
        });
        menu.find(".pg-remove").click(function(e) {
            var path = pathFromSelectedNode();
            requestNodeRemovalAt(path);
            e.preventDefault(); return false;
        });
        menuRoot.find(".pg-create").click(function(e) {
            var path = pathFromSelectedNode();
            requestNodeCreationAt(path);
            e.preventDefault(); return false;
        });

        elRoot.find("a").click(function(e) {
            var left = e.pageX - menuRoot.outerWidth() / 2;
            if(left < 0) left = 0;
            var pos = $(e.currentTarget).offset(),
                h = $(e.currentTarget).outerHeight();
            menuRoot.css({
                position : "absolute",
                top : (pos.top + h) + "px",
                left : (pos.left) + "px",
                zIndex : e.currentTarget.style.zIndex + 100
            }).show();
            menuselected = e.currentTarget;
            e.preventDefault(); return false;
        });
        wireFileUpload(elRoot.get(0), "/");

        function addFolder(name, path, callback, parent) {
            if(!parent) parent = -1;
            return tree.jstree(
                "create_node"
                , parent
                , {
                    "title" : name
                    , data : path
                    , "li_attr" : {
                        data : path
                    }
                }
                , "last"
                , function(el) {
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

        function loadAtPath(path, levels, parent) {
            if("undefined" === typeof levels)
                levels = 1;

            map[path] = true;
            precog.paths(path, function(paths){
                var base = "/" === path ? "" : path,
                    virtuals = getVirtualPaths(path);
                virtuals.forEach(function(virtual) {
                    if(virtual.substr(0,1) !== '/') virtual = '/' + virtual;
                    if(paths.indexOf(virtual) < 0) paths.push(virtual);
                });
                paths.sort();
                paths.forEach(function(subpath) {
                    subpath = base + subpath;
                    addFolder(subpath.split("/").pop(), subpath, function(){
                        if(levels > 1) {
                            loadAtPath(subpath, levels-1, this);
                        }
                    }, parent || -1);
                });
            });
        }

        ui.button(elActions, {
            icon   : "ui-icon-refresh",
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

        function pollStatus(noty, id, retry) {
            retry = retry || 0;
            $.ajax({
                url: UPLOAD_SERVICE,
                data: { uuid : id },
                success: function(data) {
                    if(data && data.done === data.total) {
                        var message;
                        if(data.failures) {
                            if(data.total - data.failures === 0) {
                                message = 'all of the ' +data.failures+ ' events failed to be stored';
                            } else {
                                message = (data.total - data.failures) + ' events have been stored correctly and ' + data.failures + ' failed to be stored';
                            }
                            noty.progressError(message);
                        } else {
                            message = 'all of the ' + data.total + ' events have been queued correctly and are now in the process to be ingested';
                            noty.progressComplete(message);
                        }

                    } else {
                        if(!data) {
                            if(retry > 10) {
                                message = 'all the events have been queued correctly and are now in the process to be ingested';
                                noty.progressComplete(message);
                                return;
                            }
                        } else {
                            if(data.total > 0) {
                                noty.el.find(".pg-ingest-message").html(
                                    "queued " + data.done + " events" + (data.failures ? " (" + data.failures + " failures)" : "") + " of " + data.total
                                );
                            }
                            noty.progressStep(data.done / data.total);
                        }
                        setTimeout(function() {
                            pollStatus(noty, id, data ? 0 : retry + 1);
                        }, 500);
                    }
                },
                error : function(e) {
                    var err = JSON.parse(e.responseText);
                    noty.progressError("An error occurred while uploading your file. No events have been stored in Precog: " + err.error);
                },
                dataType: "json"
            });
        }

        function uploadFile(file, path) {
            if(!file) return;

            var filename = file.fileName || file.name,
                id = utils.guid();

            var noty = { text : "starting upload of '" + filename+"'" };

            notification.progress("upload file", noty);

            function progressHandlingFunction(e) {
                noty.progressStep(e.loaded / e.total);
            }
            function beforeSendHandler() {
                noty.progressStart('<div class="pg-ingest-phase">Phase 1 of 2</div><div class="pg-ingest-message">' + "uploading '" + filename + "'</div>");
            }
            function completeHandler() {
                noty.progressComplete("'"+filename+"' has been uploaded to the path '<var>"+path+"</var>'. Now your data will be queued.");
                noty.progressStart('<div class="pg-ingest-phase">Phase 2 of 2</div><div class="pg-ingest-message">queue events</div>');
                pollStatus(noty, id);
            }
            function errorHandler(e) {

                var err = JSON.parse(e.responseText);
                noty.progressError("An error occurred while uploading your file. No events have been stored in Precog: " + err.error);
            }

            var formData = new FormData();
            formData.append("file", file);

            $.ajax({
                url: UPLOAD_SERVICE,  //server script to process data
                type: 'POST',
                xhr: function() {  // custom xhr
                    myXhr = $.ajaxSettings.xhr();
                    if(myXhr.upload){ // check if upload property exists
                        myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
                    }
                    return myXhr;
                },
                //Ajax events
                beforeSend: beforeSendHandler,
                success: completeHandler,
                error: errorHandler,
                // Form data
                data: formData,
                headers : {
//                          "Content-Type"     : "multipart/form-data"
                      "X-File-Name"      : filename
                    , "X-File-Size"      : file.fileSize || file.size
                    , "X-File-Type"      : file.type
                    , "X-Precog-Path"    : path
                    , "X-Precog-UUID"    : id
                    , "X-Precog-Token"   : precog.config.tokenId
                    , "X-Precog-Service" : precog.config.analyticsService
                },
                //Options to tell JQuery not to process data or worry about content-type
                cache: false,
                contentType: false,
                processData: false
            });

        }
        function traverseFiles (files, path) {
            if (typeof files !== "undefined") {
                for (var i=0, l=files.length; i<l; i++) {
                    uploadFile(files[i], path);
                }
            }
            else {
                fileList.innerHTML = "No support for the File API in this web browser";
            }
        }

        var dragnoty;

        function removeDragNotification() {
            if(!dragnoty) return;
            dragnoty.hide();
            dragnoty.remove();
            dragnoty = null;
        }

        var $pgide = $(el).parents(".pg-ide")
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
/*
console.log(window.FileReader);
            if (!!window.FileReader) {
                console.log(el);
                $(el).find("a").on('dragstart', function(e) {
                    console.log("DRAG START");
                    if (this.dataset) {
                        e.dataTransfer.setData('DownloadURL', downloadUrl(
                            precog.config.tokenId,
                            precog.config.analyticsService,
                            path
                        ));
                    }
                }, false);
            }
*/
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