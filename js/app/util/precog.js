define([
      "app/util/querystring"
    , "app/util/md5"
    , "app/util/guid"
	  , "app/util/ie"
    , "app/util/config"
//	, "app/util/uploadservice"
    , "libs/precog/precog"
//    , "https://api.reportgrid.com/js/precog.js"
//    , "http://localhost/rg/js/precog.js"
],

function(qs, md5, guid, ie, localConfig /*, upload*/){
    var config   = window.Precog.$.Config,
        params   = ["apiKey", "analyticsService", "basePath", "limit", "theme"],
        contexts = [null],
        reprecog = /(require|precog|quirrel)[^.]*.js[?]/i;

	if(!ie.isIE() /*|| ie.greaterOrEqualTo(10)*/)
		window.Precog.$.Http.setUseJsonp(window.Precog.$.PageConfig.useJsonp === "true");


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
      config.limit = localConfig.get("queryLimit");

    $(localConfig).on("queryLimit", function(_, value) {
      config.limit = value;
    });

    var map = {},
        q = {
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
              params.format = "detailed";
              $(q).trigger("execute", [text, this.lastExecution, id]);
              var me = this,
                  start = new Date().getTime();
              map[id] = window.Precog.query(text, function(data, errors, warnings, headers) {
                  if(!map[id]) {
                    return;
                  }
                  me.lastExecution = new Date().getTime() - start;
                  var extra = null;
                  if("undefined" !== typeof options.skip) {
                    extra = {
                      skip : options.skip,
                      limit : options.limit,
                      count : headers["X-Quirrel-Count"] || 1000
                    };
                  }
                  delete map[id];
                  $(q).trigger("completed", [id, data, errors, warnings, extra]);
              }, function(code, e) {
                  if(!map[id]) {
                    return;
                  }
                  if("string" == typeof e) e = { message : e };
                  delete map[id];
                  $(q).trigger("failed", [id, e]);
              }, params) || true;
          },
          paths : function(parent, callback) {
              window.Precog.retrieveMetadata(parent, function(r) {
                console.log(r);
                 var paths = r.children.map(function(path) {
                               return path.substr(-1) === '/' && path.substr(0, path.length-1) || path;
                             }).sort(),
                     has_records = r.structure && r.structure.children.length > 0;
                  callback(paths, has_records);
              }, function(code, e) {
                throw "Unable To Query Path API";
              });
            /*
              window.Precog.children(parent, function(r) {
                  callback(r.map(function(path) {
                      return path.substr(-1) === '/' && path.substr(0, path.length-1) || path;
                  }).sort());
              }, function(code, e) {
                  throw "Unable To Query Path API";
              })
              */
          },
          is_demo : function() {
            var domains = ["labcoat.precog.com", "demo.precog.com"],
                service = config.analyticsService;
            for(var i = 0; i < domains.length; i++) {
              if(service.indexOf("http://"+domains[i]+"/") === 0 || service.indexOf("https://"+domains[i]+"/") === 0) {
                return true;
              }
            }
            return false;
          },
          config : config,
          lastExecution : 2000,
          hash : md5(config.apiKey),
          cache : window.Precog.cache
        };

    $(q).on("abort", function(_, id) {
      if("undefined" === map[id]) return;
      var xhr = (map[id] && map[id].abort) ? map[id] : null;
      delete map[id];
      if(xhr) xhr.abort();
      $(q).trigger("aborted", id);
    });

    return q;
});