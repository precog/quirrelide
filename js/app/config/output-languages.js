define([
      "app/util/converters"
    , "app/util/precog"
    , "app/util/ui"
],

function(convert, precog, ui) {
    var apiKey = precog.config.apiKey,
        service = precog.config.analyticsService,
        basePath = precog.config.basePath,
        version = precog.config.version
    ;

    if(basePath.substring(-1) === "/")
      basePath = basePath.substr(0, basePath.length - 1);

    if(basePath.substring(0, 1) === "/")
      basePath = basePath.substr(1);

    function escapeQuotes(s) {
        return s.replace(/"/g, '\\"');
    }

    function urlEncode(query) {
      return service
        + "analytics/"
        + (version ? "v" + version + "/" : "")
        + "fs/"
        + basePath
        + "?apiKey=" + encodeURIComponent(apiKey)
        + "&q=" + encodeURIComponent(convert.minifyQuirrel(query))
      ;
    }

    return [{
        token: "qrl",
        name : "Quirrel",
        handler : function(code, options) {
            if(options.compact)
                return convert.minifyQuirrel(code);
            else
                return "-- Quirrel query generated with Labcoat by Precog\n\n" + code.trim();
        },
        options : { compact : false },
        buildOptions : function(el, handler) {
            var action = this;
            ui.checks(el, [{
                name : "options",
                checked : this.options.compact,
                label : "compact",
                description : "remove newlines and comments from query",
                handler : function() {
                    action.options.compact = $(this).prop("checked");
                    handler();
                }
            }]);
        }
    }, {
        token: "js",
        name : "JavaScript",
        handler : function(code) {
            code = escapeQuotes(convert.minifyQuirrel(code));
            return "// Quirrel query in JavaScript generated with Labcoat by Precog\n\n" +
                'Precog.query("'+code+'",\n  function(data) { /* do something with the data */ },\n  function(error) { console.log(error); }\n);';
        }
    }, {
        token: "html",
        name : "HTML",
        handler : function(code) {
            code = escapeQuotes(convert.minifyQuirrel(code));
            return '<!DOCTYPE html>\n<html>\n<head>\n<title>Quirrel Query</title>\n<script src="http://api.reportgrid.com/js/precog.js?apiKey='+apiKey+'&analyticsService='+service+'"></script>\n' +
                "<script>\n" +
                "function init() {\n" +
                "  // Quirrel query in JavaScript generated with Labcoat by Precog\n" +
                '  Precog.query("'+code+'",\n    function(data) {\n      /* do something with the data */\n      console.log(data);\n    },\n    function(error) { console.log(error); }\n  );\n' +
                "}\n" +
                '</script>\n</head>\n<body onload="init()">\n</body>\n</html>'
                ;
        }
    }, {
        token: "php",
        name : "PHP",
        handler : function(code) {
            code = escapeQuotes(convert.minifyQuirrel(code));
            return '<?php\n\n' +
                "// Quirrel query in PHP generated with Labcoat by Precog\n\n" +
                'require_once("Precog.php");\n\n' +
                '' +
                '$precog = new PrecogAPI("'+apiKey+'", "'+service+'");\n$result = $precog->query("'+code+'");\n' +
                'if(false === $precog) {\n' +
                '  die($precog->errorMessage());\n' +
                '} else {\n' +
                '  // do something with $result here\n' +
                '}\n?>'
                ;
        }
    }, {
      token : "url",
      name : "URL",
      handler : function(code) {
        return urlEncode(code);
      }
    }, {
      token : "curl",
      name : "cURL",
      handler : function(code) {
        return 'curl "'+escapeQuotes(urlEncode(code))+'"';
      }
    }];
});