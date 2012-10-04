define([
      "app/util/ui"
    , "app/config/output-results"
    , "app/config/output-formats"
    , "app/util/dialog-export"
    , "rtext!templates/toolbar.output.html"
],

function(ui, loadFormats, exportLanguages, openDialog, tplToolbar) {
    var radioIndex = 0;
    return function(el, editors) {
        var map = {},
            formats = loadFormats();
        $.each(formats, function(_, format) {
            map[format.type] = format;
        });

        radioIndex++;

        var wrapper,
            last = {
                result : null,
                type : null,
                current : null
            },
            elToolbar = el.find('.pg-toolbar').append(tplToolbar),
            elToolbarTypeContext = el.find('.pg-toolbar-context .pg-toolbar-result-type'),
            elToolbarMainContext = el.find('.pg-toolbar-context .pg-toolbar-result-general'),
            elOutputs = elToolbar.find('.pg-output-formats'),
            elResult  = el.find('.pg-result'),
            lastOptions;

        var downloadButton = ui.button(elToolbarMainContext, {
            icon : "ui-icon-arrowthickstop-1-s",
            description : "download query result",
            handler : function() {
                var format = last && map[last.current].preferredDownloadFormat(lastOptions);
                openDialog("Download Results", exportLanguages, editors.getOutputResult(), format);
            }
        });

        $.each(formats, function(i, format) {
            if(format.display)
            {
                var id = "pg-output-type-radio-" + radioIndex + "-" + (++i);
                format.display = elOutputs.append('<input type="radio" id="'+ id
                    + '" name="radio" data-format="'
                    + format.type
                    + '" /><label for="'+id+'">'
                    + format.name
                    + '</label>').find("#"+id);
                format.display.click(function() {
                    if(format.type === last.type)
                    {
                        last.current = format.type;
                        return;
                    }
                    wrapper.setOutput(last.result, format.type, lastOptions);
                });
            }

            format.panel = format.panel();
            elResult.append(format.panel);
            format.toolbar = format.toolbar();
            elToolbarTypeContext.append(format.toolbar);

            $(format.toolbar).hide();
            $(format.panel).hide();
            $(format).on("update", function() {
                wrapper.setOutput(null, null, lastOptions);
            });
            $(format).on("optionsChanged", function(_, options) {
                $(wrapper).trigger("optionsChanged", options);
            });
          $(format).on("paginationChanged", function(_, pager) {
console.log("INTERCEPT PAGINATION");
            $(wrapper).trigger("paginationChanged", pager);
          });
          $(format).on("sortChanged", function(_, sort) {
console.log("INTERCEPT SORT");
            $(wrapper).trigger("sortChanged", sort);
          });
        });


        ui.buttonset(elOutputs);

        function resize() {
            if(map[last.type]) {
                var el = map[last.type].panel;
                el.css({
                    width  : el.parent().width() + "px",
                    height : el.parent().height() + "px"
                });
                map[last.type].resize();
            }
        }
/*
        function paginationChanged() {
console.log("INTERMEDIATE TRIGGERING");
          $(wrapper).trigger("paginationChanged");
        }
*/
        function activatePanel(result, type, options) {
            if(type !== last.type) {
                if(last.type && map[last.type])
                {
//                    $(map[last.type]).off("paginationChanged");
                    map[last.type].deactivate();
                    $(map[last.type].toolbar).hide();
                    $(map[last.type].panel).hide();
                }
                $(map[type].toolbar).show();
                $(map[type].panel).show();
                map[type].activate();
                clearTimeout(this.killActivatePanel);
                this.killActivatePanel = setTimeout(resize, 0);
            }
            if(map[type].display) {
//                $(map[type]).on("paginationChanged");
                map[type].display[0].checked = true;
                map[type].display.button("refresh");
            }
            map[type].update(result, options, wrapper);
        }

        return wrapper = {
            setOutput : function(result, type, options) {
                if("undefined" === typeof result)
                    result = result || last.result || null;
                type = type || 'table';
                if(!options) {
                    options = {};
                }
                lastOptions = options;

                var enabled = false;
                if(result == null) {
                    activatePanel({ message : "please, type and execute a query" }, type = "message", options);
                } else if(result instanceof Array && result.length == 0) {
                    activatePanel({ message : "empty dataset" }, type = "message", options);
                } else if(map[type]) {
                    enabled = map[type].display;
                    activatePanel(result, type, options);
                } else {
                    enabled = false;
                    activatePanel({ message : "invalid result type: " + type }, type = "error", options);
                }

                if(result) last.result = result;
                if(last.type != type) {
                    last.type = type;
                    $(wrapper).trigger("typeChanged", type);
                }
                if(map[type] && map[type].display) {
                    last.current = type;
                }

                elOutputs.find("input[type=radio]").each(function() {
                    $(this).attr("checked", $(this).attr("data-format") === type);
                });
                if(enabled) {
                    elOutputs.buttonset("enable");
                    downloadButton.button("enable");
                } else {
                    elOutputs.buttonset("disable");
                    downloadButton.button("disable");
                }
                elOutputs.buttonset("refresh");
            },
            paginationOptions : function() {
              return map[last.current || "table"].paginationOptions();
            },
            last : last,
            resize : resize
        };
    }
});