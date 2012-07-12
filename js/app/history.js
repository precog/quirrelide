define([
      "util/precog"
    , "util/storage"
    , "util/md5"
],
function(precog, createStorage, md5) {
    var wrapper,
        DEFAULT_MAX_VALUES = 20,
        STORAGE_KEY = "pg-quirrel-history-"+precog.hash,
        store = createStorage(STORAGE_KEY);

    function encode(name) {
//        if(name.substr(0,1) === "*")
//            name = name.substr(1);
        var map = this.map || (this.map = {});
        if(!map[name]) {
            map[name] = md5(name);
        }
        return map[name];
    }

    return wrapper = {
        revisions : function(name) {
            var id = encode(name),
                history = store.get("history."+id, []);
            return history.slice(0);
        },
        save : function(name, code, data) {
            var id = encode(name),
                history = store.get("history."+id, []);
            code = code.trim();
            if(code === (history[0] && history[0].code)) return;
            var value  = (data && "undefined" !== typeof data[0]) ? data[0] : null,
                length = (data && data.length) || 0,
                timestamp = +new Date();
            history.unshift({
                timestamp : timestamp,
                code : code,
                sample : {
                    first  : value,
                    length : length
                }
            });
            store.set("result."+id+"."+timestamp, data);
            var values = this.getHistoryLength();
            while(history.length > values) {
                var removed = history.pop();
                store.remove("result."+id+"."+removed.timestamp);
            }
            store.set("history."+id, history, true);
        },
        load : function(name, index) {
            var history = this.revisions(name),
                rev = history[index];
            if(!rev) return null;

            var id = encode(name);
            return {
                index : index,
                timestamp : rev.timestamp,
                code: rev.code,
                data : store.get("result."+id+"."+rev.timestamp)
            };
        },
        setHistoryLength : function(values) {
            store.set("max_values", +values);
        },
        getHistoryLength : function() {
            return store.get("max_values", DEFAULT_MAX_VALUES);
        },
        remove : function(name) {
            var id = encode(name);
        },
        rename : function(oldname, newname) {
            var oldid = encode(oldname),
                newid = encode(newname),
                history = store.get("history."+oldid),
                results = store.get("result."+oldid);

            store.remove("history."+oldid);
            store.remove("result."+oldid);
            store.set("history."+newid, history);
            store.set("result."+newid, results, true);
        }
    };
});