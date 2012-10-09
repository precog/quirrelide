define([
      "app/util/querystring"
    , "app/util/md5"
    , "app/util/guid"
	  , "app/util/ie"
//	, "app/util/uploadservice"
    , "https://api.reportgrid.com/js/precog.js"
//    , "http://localhost/rg/js/precog.js"
],

function(qs, md5, guid, ie /*, upload*/){
    var config   = window.Precog.$.Config,
        params   = ["apiKey", "analyticsService", "basePath", "limit", "theme"],
        contexts = [null],
        reprecog = /(require|precog|quirrel)[^.]*.js[?]/i;

	if(!ie.isIE() /*|| ie.greaterOrEqualTo(10)*/)
		window.Precog.$.Http.setUseJsonp(false);


    var precog = ".precog.com",
        host   = window.location.host;
    if(host.substr(host.length - precog.length) === precog) {
      config.analyticsService = window.location.protocol + "//" + host + "/";
    }

    $('script').each(function() {
        if(!this.src || !reprecog.test(this.src)) return;
        contexts.push(this.src);
    });

    function appendConfig(ctx) {
        for(var i = params.length-1; i >= 0; i--) {
            var param = params[i],
                value = qs.get(param, ctx);
            if(value !== "") {
                config[param] = value;
                params.splice(i, 1);
            }
        }
    }

    while(contexts.length > 0 && params.length > 0) {
        appendConfig(contexts.shift());
    }

    if(!config.limit)
      config.limit = 1000;

    var q = {
        ingest : function(path, data, type, progress, complete, error) {
//          if(config.useJsonp) {
//            upload.ingest(path, data, type, progress, complete, error);
//          } else {
            window.Precog.ingest(path, data, type, complete, error, { progress : progress });
//          }
        },
        deletePath : function(path, callback) {
          window.Precog.deletePath(path, function(r) {
            if(callback) callback(true);
          }, function(code, e) {
            if(callback)
               callback(false);
            else
              throw "Unable To Delete Path";
          });
        },
        query : function(text, options) {
            var params = {},
                id = guid(),
                limit = config.limit;
            options = options || {};
            params.limit = options.limit && options.limit < config.limit ? options.limit : config.limit;
            if(options.skip)
              params.offset = options.skip; // TODO UPDATE TO SKIP
            if(options.sort) {
              params.sortOn = options.sort.map(function(v) { return v.field; });
              params.sortOrder = options.sort[0].asc ? "asc" : "desc";
            }

            $(q).trigger("execute", [text, this.lastExecution, id]);
            var me = this,
                start = new Date().getTime();
            window.Precog.query(text, function(r, headers) {
                me.lastExecution = new Date().getTime() - start;
                var extra = null;
                if("undefined" !== typeof options.skip) {
                  extra = {
                    skip : options.skip,
                    limit : options.limit,
                    count : headers["X-Quirrel-Count"] || 1000
                  };
                }
                $(q).trigger("completed", [id, r, extra]);
            }, function(code, e) {
                if("string" == typeof e) e = { message : e };
                $(q).trigger("failed", [id, e]);
            }, params)
        },
        paths : function(parent, callback) {
            window.Precog.children(parent, function(r) {
                callback(r.map(function(path) {
                    return path.substr(-1) === '/' && path.substr(0, path.length-1) || path;
                }).sort());
            }, function(code, e) {
                throw "Unable To Query Path API";
            })
        },
        config : config,
        lastExecution : 2000,
        hash : md5(config.apiKey),
        cache : window.Precog.cache
    };

    return q;
});