define([
  "app/util/dispatcher"
],

function(createDispatcher) {

  return function() {
    var map = {},
        dispatcher = createDispatcher(),
        model;

    return model = {
      addField : function(name, field) {
        this.removeField(name);
        
      },
      removeField : function(name) {
        if(!this.hasField(name)) return false;
        var field = map[name];
        delete map[name];
        dispatcher.emit(this, "field.remove", name, field);
      },
      hasField : function(name) {
        return !!map[name];
      },
      getField : function(name) {
        return map[name];
      },
      on : function(type, handler) {
        dispatcher.on(type, handler);
      },
      off : function(type, handler) {
        dispatcher.off(type, handler);
      }
    };
  }
});