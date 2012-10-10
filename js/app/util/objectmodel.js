define([
  "app/util/dispatcher"
],

function(createDispatcher) {

  return function() {
    var map = {},
        dispatcher = createDispatcher(),
        model,
        validMap = {},
        isValid = true;
    
    function validate() {
      for(key in validMap)
        if(validMap.hasOwnProperty(key))
          return false;
      return true;
    }

    return model = {
      addField : function(name, field) {
        this.removeField(name);
        map[name] = field;
        field.on("value.change", function() {
          dispatcher.emit(this, "value.change", name, field);
          if(!isValid) {
            delete validMap[name];
            isValid = validate();
          }
          if(isValid) {
            dispatcher.emit(this, "validation.success", name, field);
          }
          dispatcher.emit(this, "object.change", name, field);
        });
        field.on("validation.error", function() {
          isValid = false;
          validMap[name] = true;
          dispatcher.emit(this, "validation.error", name, field);
        });
        dispatcher.emit(this, "field.add", name, field);
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
      get : function(name) {
        var field = this.getField(name);
        if(null == field)
          return null;
        return field.get();
      },
      on : function(type, handler) {
        dispatcher.on(type, handler);
      },
      off : function(type, handler) {
        dispatcher.off(type, handler);
      },
      isValid : function() {
        return isValid;
      },
      reset : function() {
        for(name in map) {
          if(map.hasOwnProperty(name)) {
            map[name].reset();
          }
        }
      },
      hasChanged : function() {
        for(name in map) {
          if(map.hasOwnProperty(name) && !map[name].isDefault()) {
            return true;
          }
        }
        return false;
      }
    };
  }
});