define([
      "app/util/output-table"
    , "app/util/output-json"
    , "app/util/output-chart"
    , "app/util/output-error"
    , "app/util/output-message"
],

function() {
    var formats = arguments,
        empties = [{
            name : "update",
            f : function() {
                return function(_) {  };
            }
        }, {
            name : "panel",
            f : function() {
                return function() { return $("<div></div>"); };
            }
        }, {
            name : "toolbar",
            f : function() {
                return function() { return $("<div></div>"); };
            }
        }, {
            name : "activate",
            f : function() { return function() {}; }
        }, {
            name : "deactivate",
            f : function() { return function() {}; }
        }, {
            name : "display",
            f : function() { return true; }
        }, {
            name : "resize",
            f : function() {
                return function() {  };
            }
        }],
        inited = false;

    return function() {
        if(!inited) {
            for(var i = 0; i < formats.length; i++) {
                var format = formats[i];
                if("function" === typeof format)
                    formats[i] = format = format();

                $.each(empties, function(_, empty) {
                    if("undefined" === typeof format[empty.name]) {
//                console.log("assigning " + empty.name + " to " + format.name);
                        format[empty.name] = empty.f();
                    }
                });
            }
            inited = true;
        }
        return formats;
    };
});