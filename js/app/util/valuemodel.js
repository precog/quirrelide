define([
  "app/util/dispatcher"
],

function(createDispatcher) {

  return function(defaultValue, defaultValidator, defaultFilter) {
    var model,
        value = defaultValue,
        validator = defaultValidator || function() { return null;},
        filter = defaultFilter || function(v) { return v;},
        dispatcher = createDispatcher(),
        lastError
      ;

    return model = {
      set : function(newvalue) {
        if((lastError = validator(newvalue)) !== null) {
          dispatcher.emit(this, "validation.error", lastError, newvalue);
          return false;
        }
        var oldvalue = value;
        value = filter(newvalue);
        dispatcher.emit(this, "value.change", value, oldvalue);
        return true;
      },
      reset : function() {
        if(defaultValue === value) return false;
        if(this.set(defaultValue)) {
          dispatcher.emit(this, "value.reset", defaultValue);
          return true;
        }
        return false;
      },
      get : function(alt) {
        return value !== null && typeof value !== "undefined" && value || alt;
      },
      validate : function(value) {
        return validator(value) == null;
        return result === null;
      },
      lastError : function() {
        return lastError;
      },
      on : function(type, handler) {
        dispatcher.on(type, handler);
      },
      off : function(type, handler) {
        dispatcher.off(type, handler);
      },
      setValidator : function(newvalidator) {
        validator = newvalidator || function() { return null; };
        dispatcher.emit(this, "validator.change", validator);
      },
      setFilter : function(newfilter) {
        filter = newfilter || function() { return null; };
        dispatcher.emit(this, "filter.change", newfilter);
      }
    }
  }
});