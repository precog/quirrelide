define([
      "app/util/traverse"
    , "app/util/storage"
    , "app/util/utils"
],

function(traverse, buildStorage, utils) {
    var monitors = [], timer, storage;

    function equals(a, b) {
        if(typeof a !== typeof b)
            return false;
        else if(a instanceof Array) {
            if(a.length != b.length)
                return false;
            for(var i = 0; i < a.length; i++) {
                if(!equals(a[i], b[i]))
                    return false;
            }
            return true;
        } else if(a instanceof Object) {
            var akeys = $.map(a, function(value, key) { return key }),
                bkeys = $.map(b, function(value, key) { return key });
            if(!equals(akeys, bkeys))
                return false;
            for(var i = 0; i < akeys.length; i++) {
                if(!equals(a[akeys[i]], b[akeys[i]]))
                    return false;
            }
            return true;
        } else {
            return a === b;
        }
    }

    function loop() {
        var inited = false;
        for(var i = 0; i < monitors.length; i++) {
            storage = monitors[i];
            if(storage.monitor.paths.length == 0 || storage.dirty()) {
                return;
            }
            if(!inited) {
                $.jStorage.reInit();
                inited = true;
            }

            var params = storage.all(),
                len = storage.monitor.paths.length,
                cached = $.jStorage.get(storage.monitor.key, {}),
                path,
                cvalue;
            for(var j = 0; j < len; j++) {
                path = storage.monitor.paths[j];
                cvalue = traverse.get(cached, path);
                if("undefined" === typeof storage.monitor.last[path]) {
                    storage.monitor.last[path] = cvalue;
                    continue;
                }

                if(equals(storage.monitor.last[path], cvalue)) continue;
                if(equals(cvalue, traverse.get(params, path))) continue; // value has not changed
                storage.monitor.last[path] = cvalue;
                traverse.set(params, path, cvalue);
                $(storage).trigger(path, [cvalue]);
            }
        }
    }

    function isMonitoring(storage) {
        return monitors.indexOf(storage) >= 0;
    }

    function addStorageMonitor(storage) {
        utils.arrayRemove(monitors, storage).push(storage);
        // if first start the loop
        if(monitors.length === 1)
            setInterval(loop, 5000);
    }

    function removeStorageMonitor(storage) {
        utils.arrayRemove(monitors, storage)
        // if empty cut the loop
        if(monitors.length === 0)
            clearInterval(timer);
    }


    return function(key, defaults) {
        var storage = buildStorage(key, defaults),
            monitor;

        storage.monitor = monitor = (function() {
            var pathsCounter = {};
            return {
                paths : [],
                last : {},
                key : key,
                start : function(delay) {
                    addStorageMonitor(storage);
                },
                end : function() {
                    removeStorageMonitor()
                },
                monitoring : function() {
                    return isMonitoring(storage);
                },
                bind : function(path, handler) {
                    pathsCounter[path] = (pathsCounter[path] && (++pathsCounter[path])) || 1;
                    if(pathsCounter[path] === 1) storage.monitor.paths.push(path);
                    $(storage).on(path, handler);
                },
                unbind : function(path, handler) {
                    if(!pathsCounter[path]) return;
                    pathsCounter[path]--;
                    if(pathsCounter[path] === 0) storage.monitor.paths.splice(storage.monitor.paths.indexOf(path), 1);
                    $(storage).off(path, handler);
                }
            }
        }());

        monitor.start();
        return storage;
    };
});