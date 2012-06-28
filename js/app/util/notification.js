define([
    "jlib/pnotify/jquery.pnotify"
], function() {
    var timeout = 5000,
        shorttimeout = 2500,
        longtimeout  = 10000;

    function defaultHandler(v) { return v; };

    var map = [
          { src : "text", dst : "pnotify_text", handler : defaultHandler }
        , { src : "type", dst : "pnotify_type", handler : defaultHandler }
        , { src : "icon", dst : "pnotify_notice_icon", handler : function(v) { return "ui-icon "+v; } }
        , { src : "timeout", dst : "pnotify_delay", handler : defaultHandler }
        , { src : "hide", dst : "pnotify_hide", handler : defaultHandler }
        , { src : "before_open", dst : "pnotify_before_open", handler : defaultHandler }
        , { src : "before_close", dst : "pnotify_before_close", handler : defaultHandler }
        , { src : "after_open",  dst : "pnotify_after_open", handler : defaultHandler }
        , { src : "after_close", dst : "pnotify_after_close", handler : defaultHandler }
        , { src : "history", dst : "pnotify_history", handler : defaultHandler }
        , { src : "sticker", dst : "pnotify_sticker", handler : defaultHandler }
        , { src : "width", dst : "pnotify_width", handler : defaultHandler }
        , { src : "min_height", dst : "pnotify_min_height", handler : defaultHandler }
        , { src : "opacity", dst : "pnotify_opacity", handler : defaultHandler }
        , { src : "stack", dst : "pnotify_stack", handler : defaultHandler }
        , { src : "shadow", dst : "pnotify_shadow", handler : defaultHandler }
//        , { src : "", dst : "pnotify_", handler : defaultHandler }
    ];

    return {
        success : function(title, o) {
            o = o || {};

            var options = {
                  pnotify_title : title
                , pnotify_shadow : true
                , pnotify_delay : timeout
                , pnotify_sticker : false
            };

            for(var i = 0; i < map.length; i++) {
                if("undefined" !== typeof o[map[i].src]) {
                    options[map[i].dst] = map[i].handler(o[map[i].src]);
                }
            }

//            if(o.text) options.pnotify_text = o.text;
//            if(o.type) options.pnotify_type = o.type;
//            if(o.icon) options.pnotify_notice_icon = 'ui-icon ' + o.icon;
//            if("undefined" !== typeof o.timeout) options.pnotify_delay = o.timeout;
//            if("undefined" !== typeof o.hide) options.pnotify_hide = o.hide;
//            if(o.before_open)  options.pnotify_before_open  = o.before_open;
//            if(o.before_close) options.pnotify_before_close = o.before_close;
//            if("undefined" !== typeof o.history) options.pnotify_history = o.history;
//            if("undefined" !== typeof o.sticker) options.pnotify_sticker = o.sticker;


//            if("undefined" !== typeof o.width) options.width = o.sticker;

            return $.pnotify(options);
        },

        tip : function(title, o) {
            o = o || {};
            o.history = false;
            o.sticker = false;
            o.hide = false;
            o.stack = false;
            o.shadow = true;
            o.type = "info";
            o.opacity = 0.95;

            var el = o.target || document.body,
                n = this.success(title, o),
                voffset = 40,
                hoffset = 10;

            function position() {
                var pos = $(el).offset(),
                    vw  = $(el).outerWidth(),
                    ww  = n.outerWidth();

                var left = (vw - ww) / 2 + pos.left;
                if(left < hoffset)
                    left = hoffset;
                else if(left + ww + hoffset > $(window).width())
                    left = $(window).width() - hoffset - ww;
                n.css({
                    left : left+"px",
                    top  : (pos.top + voffset)+"px"
                });
            }

            $(window).on("resize", position);

            function remove_resize() {
                $(window).off("resize", position);
            }

            var old = o.before_close;
            o.before_close = function(e) {
                console.log(old);
                if(old)
                    old.apply(this, e);
                remove_resize(this, e);
            };

            setTimeout(position, 0);
            return n;
        },

        main : function(title, o) {
            o = o || {};
            o.history = false;
            o.sticker = false;
            o.width = '500px';
            o.min_height = '300px';
            o.hide = false;
            o.stack = false;
            o.shadow = true;
            o.type = "info";
            o.opacity = 0.95;
            var n = this.success(title, o);

            function center() {
                var vw = $(window).width(),
                    vh = $(window).height(),
                    ww = n.outerWidth(),
                    wh = n.outerHeight();
                n.css({
                    left : ((vw-ww)/2)+"px",
                    top  : ((vh-wh)/2)+"px"
                });
            }

            $(window).on("resize", center);

            function remove_resize() {
                $(window).off("resize", center);
            }

            var old = o.before_close;
            o.before_close = function(e) {
                console.log(old);
                if(old)
                    old.apply(this, e);
                remove_resize(this, e);
            };

            setTimeout(center, 0);
            return n;
        },
        quick : function(title, o) {
            o = o || {};
            o.timeout = shorttimeout;
            return this.success(title, o);
        },
        progress : function(title, o) {
            var cur_value = 1,
                pnotify,
                $progress,
                $message,
                text = o.text || "";
            // progress
            // complete

            var k;

            o.hide = false;
            o.text = '<div class="pg-message">'+text+'</div><div class="pg-progress-bar"></div>';
            o.before_open = function(pn) {
                pnotify = pn;
                $progress = pn.find("div.pg-progress-bar");
                $message = pn.find("div.pg-message");
            };

            o.progressStart = function(message) {
                clearInterval(k);
                pnotify.show();
                $message.removeClass("ui-state-error")
                $message.html(message);
                $progress.show();
                $progress.progressbar({
                    value : 0
                });
            };

            o.progressStep = function(value) {
                var v = value * 100;
                if(v > 100) v = 100;
                $progress.progressbar({
                    value : v
                });
            };

            o.progressComplete = function(message) {
                $message.html(message);
                $progress.hide();
                k = setTimeout(function() {
                    pnotify.hide();
                }, longtimeout);
            };

            o.progressError = function(err) {
                $progress.hide();
                $message.addClass("ui-state-error").html(err);
                k = setTimeout(function() {
                    pnotify.hide();
                }, longtimeout);
            };

            return o.el = this.success(title, o);
        }
    }
});