define([
      'jquery'
    , 'libs/jquery/ui/jquery.ui.core'
    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.widget'
    , 'libs/jquery/ui/jquery.ui.mouse'
    , 'libs/jquery/ui/jquery.ui.resizable'
    , 'libs/jquery/ui/jquery.ui.button'
//    , 'libs/jquery/ui/jquery.ui.sortable'
//    , 'libs/jquery/ui/jquery.ui.draggable'
//    , 'libs/jquery/ui/jquery.ui.dialog'
//    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.progressbar'
    , 'libs/jquery/ui/jquery.ui.tabs'
    , 'libs/jquery/ui/jquery.ui.menu'
],

function() {
    var uid = 0;

    $.fn.outerHTML = function(){

        // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
        return (!this.length) ? this : (this[0].outerHTML || (
            function(el){
                var div = document.createElement('div');
                div.appendChild(el.cloneNode(true));
                var contents = div.innerHTML;
                div = null;
                return contents;
            })(this[0]));

    }

    return {
        clickOrDoubleClick : function(el, clickHandler, dblClickHandler) {
            var sequence = 0;
            el.click(function(e) {
                sequence++;
                if(sequence === 1) {
                    setTimeout(function() {
                        if(sequence !== 1) {
                            sequence = 0;
                            return;
                        }
                        sequence = 0;
                        clickHandler.call(this, e);
                    }, 200);
                } else {
                    sequence = 0;
                    dblClickHandler.call(this, e);
                }
            });
        },
        button : function(el, o) {
            el = $(el);
            o = $.extend({
                disabled : false,
                label : "",
                text : false,
                handler : function() {},
                icons : null
            }, o);

            var options = {
                disabled : o.disabled,
                text: o.text,
                label: o.label,
                icons: o.icon ? { primary : o.icon } : o.icons
            };

            if(!options.icons) delete options.icons;

            var button = el.append('<button></button>')
                .find('button:last')
                .button(options)
                .click(function(e) {
                    o.handler.apply(button.get(0));
                    e.preventDefault(); return false;
                });

            return button;
        },
        menu : function(el, o) {
            el = $(el);
            o = $.extend({
                disabled : false
            }, o);
            return el.menu({
                disabled: o.disabled
            });
        },
        contextmenu : function(el, o) {
            if("string" === typeof el) {
                el = $("body").append(el).find("div:last ul");
            } else {
                el = $(el);
            }
            var parent = el.parent(),
                o = this.menu(el, o);
            parent.hide();
            parent.mouseleave(function() {
                parent.hide();
            }).click(function() {
                parent.hide();
            });
            return parent;
        },
        tabs : function(el, o) {
            el = $(el);
            return el.tabs(o);
        },
        radios : function(el, actions) { /* group, label, handler */
            el = $(el);
            if(actions) {
                el.find("*").remove();
                uid++;
                var current;
                $(actions).each(function(i, action) {
                    var name = action.group,
                        id = "pg-buttonset-" + uid + "-" + i,
                        label = action.label;
                    var btn = el.append('<input type="radio" id="'+id+'" name="'+name+'" '+(action.checked ? 'checked="checked" ' : '')+'/><label for="'+id+'">'+label+'</label>').find("#"+id);
                    btn.click(function() {
                        if(action.checked !== !!btn.attr("checked")) {
                            action.checked = !!btn.attr("checked");
                            if(action.handler) {
                                action.handler(action);
                            }
                        }
                    });
                    if(action.checked)
                        current = btn;
                });
            }
            var buttons = el.buttonset();
            // this should not be necessary, bug in buttonset?
            if(actions && current) {
                setTimeout(function() {
//                    el.buttonset("refresh");
                    current.change();
                }, 100);
            }
            return buttons;
        },
        checks : function(el, actions) { /* group, label, handler */
            el = $(el);
            if(actions) {
                el.find("*").remove();
                uid++;
                $(actions).each(function(i, action) {
                    var name = action.name || "",
                        checked = action.checked || false,
                        id = "pg-buttonset-" + uid + "-" + i,
                        label = action.label;
                    var btn = el.append('<input type="checkbox" id="'+id+'" name="'+name+'" '+(checked ? 'checked="checked" ' : "")+'/><label for="'+id+'">'+label+'</label>').find("#"+id);
                    btn.click(function() {
                        action.checked = !!btn.attr("checked");
                        if(action.handler)
                            action.handler(action);
                    });
                });
            }
            return el.buttonset();
        },
        buttonset : function(el) {
            el = $(el);
            return el.buttonset();
        },
        progressbar : function(el) {
            el = $(el);
            return el.progressbar();
        },
        select : function(el) {

        }
    };
});