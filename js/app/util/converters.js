define([

],

function() {
    function quoteSplitter(s) {
        var parts = [],
            pos = 0;
        while(pos >= 0) {
            var npos = s.indexOf(s, pos);
            if(npos < 0) {
                // no quotes found

            }
        }

        return parts;
    }
    return {
        jsonToCsv : function(json) {
            if(!json) return "";
            var rows = [],
                o = json[0],
                values, key, keys = [],
                requote = /[",\n\r]/g,
                ren = /\n/g,
                rer = /\r/g,
                req = /"/g,
                i;

            function escape(s) {
                return s
                    .replace(ren, "\\n")
                    .replace(rer, "\\r")
                    .replace(req, '""')
                    ;
            }

            function value(v) {
                if("string" == typeof v) {
                    if(v.match(requote)) {
                        return '"' + escape(v) + '"';
                    } else {
                        return v;
                    }
                } else if(v instanceof Array || v instanceof Object) {
                    return value(JSON.stringify(v));
                } else {
                    return "" + v;
                }
            }

            values = [];
            if(o instanceof Object) {
                for(key in o) {
                    if(o.hasOwnProperty(key)) {
                        keys.push(key);
                        values.push(value(key));
                    }
                }
                rows.push(values.join(","));
                for(i = 0; i<json.length; i++) {
                    values = [];
                    o = json[i];
                    for(var j = 0; j < keys.length; j++) {
                        values.push(value(o[keys[j]]));
                    }
                    rows.push(values.join(","));
                }
            } else {
                rows.push(value("value"));
                for(i = 0; i<json.length; i++) {
                    rows.push(value(json[i]));
                }
            }

            return rows.join("\n");
        },

        minifyQuirrel : function(code) {
            var stringcontexts = [{
                        open : '"',  close : '"',  escape : '\\', start : -1, end : -1, handler : function(s) { return '"' + s + '"'; }
                    }],
                allcontexts = stringcontexts.concat([{
                        open : '--', close : '\n', escape : false, start : -1, end : -1, handler : function(s) { return ' '; }
                    }, {
                        open : '(-', close : '-)', escape : false, start : -1, end : -1, handler : function(s) { return ' '; }
                    }]),
                defaultHandler = function(s) {
                    return s.replace(/(\s+)/g, ' ');
                };

            function findEnd(s, ctx, pos) {
                if(ctx.escape) {
                    var elen = ctx.escape.length, npos;
                    while(true) {
                        npos = s.indexOf(ctx.close, pos);
                        if(npos < 0) return npos;
                        pos = npos + ctx.close.length;
                        if(s.substr(npos - elen, elen) === ctx.escape) {
                            continue;
                        } else {
                            break;
                        }
                    }
                    return npos;
                } else {
                    return s.indexOf(ctx.close, pos);
                }
            }

            function selectContext(contexts, s, pos) {
                var minpos = s.length, npos, ctx;
                for(var i = 0; i < contexts.length; i++) {
                    npos = s.indexOf(contexts[i].open, pos);
                    if(npos >= 0 && npos < minpos) {
                        ctx = contexts[i];
                        ctx.start = minpos = npos;
                    }
                }
                if(!ctx) return null;
                ctx.end = findEnd(s, ctx, ctx.start + ctx.open.length);
                return ctx;
            }

            function process(contexts, s) {
                var result = "", ctx, pos = 0;

                var guard = 20;
                do {
                    ctx = selectContext(contexts, s, pos);
                    if(!ctx) break;
                    if(ctx.start > pos) {
                        result += defaultHandler(s.substr(pos, ctx.start - pos));
                    }
                    if(ctx.end >= 0) {
                        result += ctx.handler(s.substr(ctx.start + ctx.open.length, ctx.end - (ctx.start + ctx.open.length)));
                        pos = ctx.end + ctx.close.length;
                    } else {
                        pos = -1;
                    }

                    guard--;
                    if(guard < 0) {
                        console.log("GUARD REACHED", s);
                        break;
                    }
                } while(ctx && pos < s.length && pos >= 0);
                if(ctx) {
                    result += ctx.handler(s.substr(ctx.start + ctx.open.length));
                } else {
                    result += defaultHandler(s.substr(pos));
                }
                return result.trim();
            }

            return process(stringcontexts, process(allcontexts, code));
        }
    }
});