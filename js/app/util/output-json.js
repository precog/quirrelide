define([
    "app/util/ui"
],

function(ui) {
    var wrapper,
        elPanel = $('<div class="ui-widget"><pre class="json ui-content"></pre></div>'),
        elOutput = elPanel.find('.json');

    var spaces = 2,
        toolbar, options, currentData;

    return wrapper = {
        type : "json",
        name : "Json",
        panel : function() { return elPanel; },
        update : function(data, o) {
            if(data) {
                currentData = data;
            } else {
                data = currentData;
            }
            options = o;
            if(!options.json)
                options.json = { compact : false };
            var json = options.json.compact ? JSON.stringify(data) : JSON.stringify(data, null, spaces);
            toolbar.find('input[type="checkbox"]').attr("checked", options.json.compact).button("refresh");
            elOutput.text(json);
        },
        activate : function() {
            if(!toolbar) {
                toolbar = $(this.toolbar).append("<div></div>").find("div:last");
                ui.checks(toolbar, {
                    label : "compact",
                    handler : function(action) {
                        if(options.json.compact === action.checked) return;
                        options.json.compact = action.checked;
                        wrapper.update(null, options);
                        $(wrapper).trigger("optionsChanged", options);
                    }
                });
            }
            toolbar.show();
        },
        deactivate : function() {
            toolbar.hide();
        }
    };
});