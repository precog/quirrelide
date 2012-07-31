define([
      "app/util/converters"
    , "app/util/ui"
],

function(convert, ui) {
    return [{
        token: "json",
        name : "Json",
        handler : function(json, options) {
            if(options.compact)
                return JSON.stringify(json);
            else
                return JSON.stringify(json, null, 2);
        },
        options : { compact : false },
        buildOptions : function(el, handler) {
            var action = this;
            ui.checks(el, [{
                name : "options",
                checked : this.options.compact,
                label : "compact json",
                description : "format json output with no newlines and minimal spacing",
                handler : function() {
                    action.options.compact = $(this).prop("checked");
                    handler();
                }
            }]);
        }

    }, {
        token: "csv",
        name : "CSV",
        handler : function(json) {
            return convert.jsonToCsv(json);
        }
    }];
});