define([
      "app/util/converters"
    , "app/util/precog"
    , "app/util/ui"
    , "app/util/converters"
],

function(convert, precog, ui, converters) {
    var tokenId = precog.config.tokenId,
        service = precog.config.analyticsService
    ;
    return [{
        token: "qrl",
        name : "Quirrel",
        handler : function(code, options) {
            if(options.compact)
                return converters.quirrelToOneLine(code);
            else
                return "-- Quirrel query generated with Quirrel Lab by Precog\n\n" + code.trim();
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
console.log("HANDLER", action, this);
                    action.options.compact = $(this).prop("checked");
                    handler();
                }
            }]);

/*
 name (group)
 checked
 label
 handler
 description
 */
        }
    }, {
        token: "js",
        name : "JavaScript",
        handler : function(code) {
            code = convert.quirrelToOneLine(code);
            return "// Quirrel query in JavaScript generated with Quirrel Lab by Precog\n\n" +
                'Precog.query("'+code+'",\n  function(data) { /* do something with the data */ },\n  function(error) { console.log(error); }\n);';
        }
    }, {
        token: "html",
        name : "HTML",
        handler : function(code) {
            code = convert.quirrelToOneLine(code);
            return '<!DOCTYPE html>\n<html>\n<head>\n<title>Quirrel Query</title>\n<script src="http://api.reportgrid.com/js/precog.js?tokenId='+tokenId+'&analyticsService='+service+'"></script>\n' +
                "<script>\n" +
                "function init() {\n" +
                "  // Quirrel query in JavaScript generated with Quirrel Lab by Precog\n" +
                '  Precog.query("'+code+'",\n    function(data) {\n      /* do something with the data */\n      console.log(data);\n    },\n    function(error) { console.log(error); }\n  );\n' +
                "}\n" +
                '</script>\n</head>\n<body onload="init()">\n</body>\n</html>'
                ;
        }
    }, {
        token: "php",
        name : "PHP",
        handler : function(code) {
            code = convert.quirrelToOneLine(code);
            return '<?php\n\n' +
                "// Quirrel query in PHP generated with Quirrel Lab by Precog\n\n" +
                'require_once("Precog.php");\n\n' +
                '' +
                '$precog = new PrecogAPI("'+tokenId+'", "'+service+'");\n$result = $precog->query("'+code+'");\n' +
                'if(false === $precog) {\n' +
                '  die($precog->errorMessage());\n' +
                '} else {\n' +
                '  // do something with $result here\n' +
                '}\n?>'
                ;
        }
    }];
});