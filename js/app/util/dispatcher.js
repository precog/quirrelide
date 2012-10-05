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

/*
 function emit(type) {
 var listeners = eventsMap[type] || [];
 for(var i = 0; i < listeners.length; i++) {
 if(listeners[i].apply(model, skipArgs(arguments, 1)) === false)
 break;
 }
 }

 return model = {
 set : function(newvalue, force) {
 if(value === newvalue) return true;
 if(!!force && (lastError = validator(newvalue)) !== null) {
 emit("validation.error", lastError, newvalue);
 return false;
 }
 var oldvalue = value;
 value = filter(newvalue);
 emit("value.change", newvalue, oldvalue);
 return true;
 },
 reset : function() {
 if(defaultValue === value) return false;
 if(this.set(defaultValue)) {
 emit("value.reset", defaultValue);
 return true;
 }
 return false;
 },
 get : function(alt) {
 return value !== null && typeof value !== "undefined" && value || alt;
 },
 validate : function(value) {
 var result = validator(value);
 return result === null;
 },
 lastError : function() {
 return lastError;
 },
 on : function(type, handler) {
 var list = eventsMap[type] || (eventsMap[type] = []);
 if(list.indexOf(handler) >= 0) return;
 list.push(handler);
 },
 off : function(type, handler) {
 var list = eventsMap[type], pos;
 if(!list || (pos = list.indexOf(handler)) < 0) return;
 list.splice(pos, 1);
 },
*/