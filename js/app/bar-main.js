define([
      "app/util/ui"
    , "rtext!templates/toolbar.main.html"
    , "rtext!templates/menu.settings.html"
    , "app/util/fullscreen"
    , "app/theme"
    , "app/util/dialog-confirm"
    , "rtext!templates/dialog.global.settings.html"
    , "app/util/valuemodel"
    , "app/util/precog"
], function(ui, tplToolbar, tplMenu, fullscreen, theme, openDialog, tplGlobalSettings, valueModel, precog) {
    var ABOUT_LINK  = "http://precog.com/products/labcoat",
        BRAND_LINK  = "http://precog.com/products/labcoat",
        BRAND_CLASS = "pg-precog";

    switch(document.location.host)
    {
//        case "localhost":
        case "labcoat.gridgain.com":
            BRAND_LINK  = "http://www.gridgain.com/";
            BRAND_CLASS = "pg-gridgain";
            break;
    }


    function buildItems(menu, groups) {
        $.each(groups, function(key) {
            menu.append('<li class="ui-state-disabled ui-menu-item" role="presentation"><a href="#">'+key+' themes:</a></li>');
            $.each(this, function() {
                menu.append('<li data-editor-theme="'+this.token+'" class="editor-theme ui-menu-item" role="presentation"><a href="#">'+this.name+'</a></li>');
            })
        });
    }

    function updateBrand(anchor) {
        anchor.attr("href", BRAND_LINK);
        anchor.find(".pg-logo").addClass(BRAND_CLASS);
    }

    function extractFromConfig() {
      return precog.config[this.name];
    }

    // add global settings
    var message = $(tplGlobalSettings),
      settings = [{
        name    : "limit",
        extract : extractFromConfig
      }, {
        name    : "analyticsService",
        extract : function() {
          var url = extractFromConfig.call(this);
console.log(url);
          url = url.split("://").pop();
console.log(url);
          if(url.substr(-1) == "/")
            url = url.substr(0, url.length - 1);
          return url;
        }
      }, {
        name    : "apiKey",
        extract : extractFromConfig
      }, {
        name    : "labcoatHost",
        extract : function() { return window.location.hostname; }
      }, {
        name    : "basePath",
        extract : extractFromConfig
      }, {
        name    : "version",
        extract : extractFromConfig
      }, {
        name     : "protocol",
        extract  : function() { return window.location.protocol === "https:" ? "https" : "http"; },
        callback : function(value) {
          message.find(".protocol").text(value);
        }
      }];

    $(settings).each(function(index, info) {
      var model = valueModel(info.defaultValue || info.extract(), info.validator, info.filter);
      var input = message.find("#"+info.name);
      input.val(model.get());
      input.on("change", function() {
        model.set(input.val());
      });
      model.on("validation.error", function(newvalue, error) {
        console.log(info.name +": validation error '" + error + "' for " + newvalue);
      });
      model.on("value.change", function(newvalue, oldvalue) {
        console.log(info.name+": value changed from " + oldvalue + " to " + newvalue);
        if(info.callback) {
          info.callback(newvalue);
        }
      });
    });

    return function(el) {
        el.append(tplToolbar);
        var right = el.find(".pg-toolbar-context"),
            menu = ui.contextmenu(tplMenu);

        updateBrand(el.find("a.pg-brand"));
        buildItems(menu.find("ul:first"), theme.groups());

        $(theme).on("change", function(e, name) {
            menu.find('.editor-theme').each(function() {
                if($(this).attr("data-editor-theme") === name) {
                    $(this).addClass('ui-state-active');
                } else {
                    $(this).removeClass('ui-state-active');
                }
            });
        });

        menu.find(".editor-theme").click(function() {
            theme.set($(this).attr("data-editor-theme"));
        });

        ui.button(right, {
            icon : "ui-icon-info",
            description : "about Labcoat"
        }).click(function() {
            window.open(ABOUT_LINK);
        });

        ui.button(right, {
            icon : "ui-icon-gear",
            description : "theme settings"
        }).click(function() {
                var pos = $(this).offset(),
                    w = $(this).outerWidth(),
                    h = $(this).outerHeight();
                menu.css({
                    position : "absolute",
                    top : (pos.top + h) + "px",
                    left : (pos.left + w - menu.outerWidth()) + "px"
                }).show();
            });

        ui.button(right, {
            icon : fullscreen.isFullScreen() ? "ui-icon-newwin" : "ui-icon-arrow-4-diag",
            description : "toggle fullscreen",
            handler : function() {
                fullscreen.toggle();
                if(fullscreen.isFullScreen()) {
                    $(this).find('.pg-icon').removeClass("ui-icon-newwin").addClass("ui-icon-arrow-4-diag");
                } else {
                    $(this).find('.pg-icon').removeClass("ui-icon-arrow-4-diag").addClass("ui-icon-newwin");
                }
            }
        });

        var settingsButton = $('<li class="ui-menu-item" role="presentation"><a href="#">global settings</a></li>');
        menu.find("ul:first")
          .append('<li class="ui-menu-item menu-separator ui-state-highlight"></li>')
          .append(settingsButton);

        settingsButton.click(function() {
            var title   = "Hello World",
                handler = function() {},
                options = {
                    width  : 600
                  , height : 600
                };
            openDialog(title, message, handler, options);
        });
    }
});