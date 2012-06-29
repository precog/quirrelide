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
            return history.splice(0);
        },
        save : function(name, code, result) {
            var id = encode(name),
                history = store.get("history."+id, []);
            history.unshift({
                timestamp : +new Date(),
                code : code
            });
            store.set("result."+id+"."+removed.timestamp, result);
            var values = this.getMaxValues();
            while(history.length > values) {
                var removed = history.pop();
                store.remove("result."+id+"."+removed.timestamp);
            }
            store.set("history."+id, history);
        },
        load : function(name, index) {
            var history = this.revisions(),
                rev = history[index];
            if(!rev) return null;

            var id = encode(name);
            return {
                index : index,
                timestamp : rev.timestamp,
                code: rev.code,
                result : store.get("result."+id+"."+rev.timestamp)
            };
        },
        setMaxValue : function(values) {
            store.set("max_values", +values);
        },
        getMaxValue : function() {
            return store.get("max_values", DEFAULT_MAX_VALUES);
        }
    };
});