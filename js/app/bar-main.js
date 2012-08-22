define([
      "app/util/ui"
    , "rtext!templates/toolbar.main.html"
    , "rtext!templates/menu.settings.html"
    , "app/util/fullscreen"
    , "app/theme"
], function(ui, tplToolbar, tplMenu, fullscreen, theme) {
    var ABOUT_LINK  = "http://precog.com/labcoat",
        BRAND_CLASS = "pg-precog";

    switch(document.location.host)
    {
//        case "localhost":
        case "labcoat.gridgain.com":
            ABOUT_LINK  = "http://precog.com/labcoat";
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
        anchor.attr("href", ABOUT_LINK);
        anchor.find(".pg-logo").addClass(BRAND_CLASS);
    }

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
    }
});