define([
      "app/util/traverse"
    , "libs/jquery/jstorage/jstorage"
],

function(traverse) {
  return function(key, defaults) {
    var LIMIT_SIZE = 500,
        dirty  = false,
        params = $.extend({}, defaults);

    function cloneLimited(obj, limit) {
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" !== typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        var copy = [],
            len  = obj.length;
        if(len > limit) {
          len = limit;
        }
        for (var i = 0; i < len; ++i) {
          copy[i] = cloneLimited(obj[i], limit);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = cloneLimited(obj[attr], limit);
        }
        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    function save() {
      var o = cloneLimited(params, LIMIT_SIZE);
      var result = $.jStorage.set(key, o);
      dirty = false;
    }

    function load() {
      if(enableDebug)
        console.log("Load Storage Data");
      $.jStorage.reInit();
      var value = $.jStorage.get(key);
      $.extend(params, value);
    }

    var delayedSave = function() {
      dirty = true;
      clearInterval(this.killDelayedSave);
      this.killDelayedSave = setTimeout(function() { save(); }, 100);
    };

    load();

    var enableDebug = false;

    function debug(action, key, value) {
      if(!enableDebug) return;
      var s = ((("undefined" !== typeof value) && JSON.stringify(value)) || ""),
          len = 100,
          ellipsis = '...';
      if(s.length > len - ellipsis.length) {
        s = s.substr(0, len - ellipsis.length) + ellipsis;
      }
      console.log(((action && (action + " ")) || "") + key + ((s && ": " + s) || ""));
    }

    var storage = {
          get : function(key, alternative) {
            var v = traverse.get(params, key);

            debug("get", key, v);

            if("undefined" === typeof v)
              return alternative;
            else
              return v;
          },
          set : function(key, value, instant) {
            if(traverse.set(params, key, value))
            {
              debug("set", key, value);
              this.save(instant);
            }
          },
          remove : function(key, instant) {
            debug("del", key);
            traverse.remove(params, key);
            this.save(instant);
          },
          keys : function(key) {
            var ref = traverse.get(params, key);
            if(ref && "object" === typeof ref) {
              var result = [];
              for(var k in ref) {
                if (ref.hasOwnProperty(k)) {
                  result.push(k);
                }
              }
              return result;
            } else {
              return [];
            }
          },
          save : function(instant) {
            if(instant)
              save();
            else
              delayedSave();
          },
          load : function() {
            load();
          },
          clear : function() {
            // TODO: this should not flush everything
            $.jStorage.flush();
          },
          toString : function() {
            return JSON.stringify(params);
          },
          all : function() {
            return params;
          },
          dirty : function() {
            return dirty;
          }
      };
    return storage;
  };
});