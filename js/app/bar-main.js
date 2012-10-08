define([
      "app/util/ui"
    , "rtext!templates/toolbar.main.html"
    , "rtext!templates/menu.settings.html"
    , "app/util/fullscreen"
    , "app/theme"
    , "app/util/dialog-confirm"
    , "rtext!templates/dialog.global.settings.html"
    , "app/util/valuemodel"
    , "app/util/objectmodel"
    , "app/util/precog"
], function(ui, tplToolbar, tplMenu, fullscreen, theme, openDialog, tplGlobalSettings, valueModel, objectModel, precog) {
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

    function intValidator(min, max) {
      return function(value) {
        value = trimFilter(value);
        if(""+parseInt(value) !== ""+value)
          return "must be an integer value";
        value = parseInt(value);
        if(min && value < min)
          return "must be greater than " + min;
        if(max && value > max)
          return "must be less than " + max;
        return null;
      }
    }

    function trimFilter(value) {
      return (""+value).trim();
    }

    function onlyTrailingSlash(value) {
      value = trimFilter(value);
      var ext = value.split(".").pop().toLowerCase();
      if(value.substr(-1) !== "/" && ext !== "htm" && ext !== "html")
      {
        value += "/";
      }
      if(value.length === 1)
        return value;
      while(value.substr(0, 1) === "/")
        value = value.substr(1);
      return value;
    }

    function ensureSlashes(value) {
      value = trimFilter(value);
      if(value.substr(0, 1) !== "/")
        value = "/" + value;
      if(value.length === 1)
        return value;
      if(value.substr(-1) !== "/")
        value += "/";
      return value;
    }

    function toUpper(value) {
      return trimFilter(value).toUpperCase();
    }

    function toLower(value) {
      return trimFilter(value).toLowerCase();
    }

    function updateProtocol(value) {
      message.find(".protocol").text(value);
    }

    function urlValidator(value) {
      if (!!value.match(/^((\/?[a-z0-9_\-.]+)+)\/?$/i)) {
        return null;
      } else {
        return "invalid url";
      }
    }

    // add global settings
    var message = $(tplGlobalSettings),
      settings = [{
        name      : "limit",
        extract   : extractFromConfig,
        validator : intValidator(1, null),
        filter    : trimFilter
      }, {
        name      : "analyticsService",
        extract   : function() {
          var url = extractFromConfig.call(this);
          url = url.split("://").pop();
          if(url.substr(-1) == "/")
            url = url.substr(0, url.length - 1);
          return url;
        },
        filter    : onlyTrailingSlash,
        validator : urlValidator
      }, {
        name      : "apiKey",
        extract   : extractFromConfig,
        filter    : toUpper,
        validator : function (value) {
            if (!!value.match(/^([A-F0-9]{8})(-[A-F0-9]{4}){3}-([A-F0-9]{12})$/)) {
              return null;
            } else {
              return "invalid token pattern";
            }
          }
      }, {
        name         : "basePath",
        extract      : extractFromConfig,
        defaultValue : "/",
        filter       : ensureSlashes,
        validator : function (value) {
          if (!!value.match(/^(\/?([a-z0-9_\-]+)(\/[a-z0-9_\-]+)*\/?)$/i)) {
            return null;
          } else {
            return "invalid path pattern";
          }
        }
      }, {
        name      : "labcoatHost",
        extract   : function() { return window.location.hostname + window.location.pathname; },
        filter    : onlyTrailingSlash,
        validator : urlValidator
      }, {
        name      : "version",
        extract   : extractFromConfig,
        validator : intValidator(1, null),
        filter    : trimFilter
      }, {
        name      : "protocol",
        extract   : function() { return window.location.protocol === "https:" ? "https" : "http"; },
        callback  : updateProtocol,
        filter    : toLower,
        validator : function (value) {
          if (["http", "https"].indexOf(value) >= 0) {
            return null;
          } else {
            return "invalid protocol";
          }
        }
      }];

    var obmodel = objectModel(),
       output = message.find(".labcoatUrl");

    function changeUrlSuccess() {
      var url = buildUrlSuccess();
      output.attr("href", url);
      output.text(url);
      message.find(".output").show();
    }

    function buildUrlSuccess() {
      var labcoat = obmodel.get("protocol") + "://" + obmodel.get("labcoatHost");
      var params = [], t;

      params.push("apiKey=" + encodeURIComponent(obmodel.get("apiKey")));

      t = obmodel.get("protocol") + "://" + obmodel.get("analyticsService");
      if(t !== labcoat)
        params.push("analyticsService=" + encodeURIComponent(t));
      params.push("limit=" + encodeURIComponent(obmodel.get("limit")));
      t = obmodel.get("basePath");
      if(t != "/")
        params.push("basePath=" + encodeURIComponent(t));
      t = obmodel.get("version");
      if(t != 1)
        params.push("version=" + encodeURIComponent(t));

      return labcoat + "?" + params.join("&");
    }

    function changeUrlError() {
      message.find(".output").hide();
      output.attr("href", "#");
      output.text("");
    }

    $(settings).each(function(index, info) {
      var model = valueModel(info.extract() || info.defaultValue, info.validator, info.filter);
      obmodel.addField(info.name, model);
      var input = message.find("#"+info.name);
      input.val(model.get());
      input.on("change", function() {
        model.set(input.val());
      });
      model.on("validation.error", function(error, newvalue) {
        input.parent().find(".input-error").html(error).show();
      });
      model.on("value.change", function(newvalue, oldvalue) {
        input.val(newvalue);
        input.parent().find(".input-error").hide();
        if(info.callback) {
          info.callback(newvalue);
        }
      });
    });
    obmodel.on("validation.error", changeUrlError);
    obmodel.on("validation.success", changeUrlSuccess);

    updateProtocol(obmodel.get("protocol"));
    if(obmodel.isValid())
      changeUrlSuccess();
    else
      changeUrlError();

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
                handler = function() {
                  if(obmodel.isValid())
                    window.location = buildUrlSuccess();
                },
                options = {
                    width  : 500
                  , height : 460
                };
            openDialog(title, message, handler, options);
        });
    }
});