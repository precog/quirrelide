define([

],

function() {

  function skipArgs(args, skip) {
    var len = args.length,
      result = [];
    for(var i = skip; i < len; i++) {
      result.push(args[i]);
    }
    return result;
  }

  return function() {
    var map = {}, wrapper;
    return wrapper = {
      emit : function(emitter, type){
        var listeners = map[type] || [];
        for(var i = 0; i < listeners.length; i++) {
          if(listeners[i].apply(emitter, skipArgs(arguments, 2)) === false)
            break;
        }
      },
      on : function(type, handler) {
        var list = map[type] || (map[type] = []);
        if(list.indexOf(handler) >= 0) return false;
        list.push(handler);
        return true;
      },
      off : function(type, handler) {
        var list = map[type], pos;
        if(!list || (pos = list.indexOf(handler)) < 0) false;
        list.splice(pos, 1);
        return true;
      }
    };
  }
});