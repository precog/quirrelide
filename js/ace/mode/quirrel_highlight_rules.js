define(
function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var lang = require("../lib/lang");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var QuirrelHighlightRules = function() {

        var keywords = lang.arrayToMap(
            ("difference|else|solve|if|import|intersect|new|then|union|where|with").split("|")
        );

        var builtinConstants = lang.arrayToMap(
            ("true|false|undefined|null").split("|")
        );

        var builtinFunctions = lang.arrayToMap(
            ("count|distinct|load|max|mean|geometricMean|sumSq|variance|median|min|mode|stdDev|sum").split("|")
        );

        var identifier = "[A-Za-z_][A-Za-z0-9_']*";
 
        var start = [
            {
              token : "constant.language",
              regex : "import",
              next  : "import"
            },
            {
              token : "comment",
              regex : "--.*$"
            }, {
              token : "comment",
              regex  : '\\(-',
              merge : true,
              next : "comment"
            }, {
              token : "variable",
              regex : "['][A-Za-z][A-Za-z_0-9]*"
            }, {
              token : "identifier",
              regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:[^=])'
            }, {
              token : "identifier",
              regex : '[`](?:(?:\\\\.)|(?:[^`\\\\]))*?[`]\\s*(?=:[^=])'
            }, {
              token : "string",
              regex : '"(?:\\\\"|[^"])*"'
            }, {
              token : "string",
              regex : '`[^`]*`'
            }, {
              token : "string",
              regex : "/(?:/[a-zA-Z_0-9-]+)+\\b"
            }, {
              token : "constant.numeric", // float
              regex : "[0-9]+(?:\\\\.[0-9]+)?(?:[eE][0-9]+)?"
            }, {
              token : "keyword.operator",
              regex : "~|:=|\\+|\\/|\\-|\\*|&|\\||<|>|<=|=>|!=|<>|=|!|neg|union\\b"
            }, {
              token : ["support.function", "paren.lparen"],
              regex : "("+identifier + ")(?:\\s*)([(])"
            }, {
              token : function(value) {
                if (keywords.hasOwnProperty(value))
                  return "keyword";
                else if (builtinConstants.hasOwnProperty(value))
                  return "constant.language";
                else if (builtinFunctions.hasOwnProperty(value))
                  return "support.function";
                else
                  return "identifier";
              },
              regex : "(?:[a-zA-Z]['a-zA-Z_0-9]*\\b)"
            }, {
              token : "paren.lparen",
              regex : "[([{]"
            }, {
              token : "paren.rparen",
              regex : "[)}\\]]"
            }, {
              token: "punctuation.operator",
              regex: "[,]"
            }
        ];
        this.$rules = {
          "start" : start,
          "import" : [
            {
              token : "support.function",
              regex : "\\s*(?:[*]|[a-z0-9_]+)(?:\\s*$|\\s+)",
              next  : "start"
            }, {
              token : "support.function",
              regex : "\\s*[a-z0-9_]+\\s*"
            }, {
              token : "keyword.operator",
              regex : "[:]{2}"
            }
          ],
          "comment" : [
            {
              token : "comment", // closing comment
              regex : ".*?-\\)",
              next : "start"
            }, {
              token : "comment", // comment spanning whole line
              merge : true,
              regex : ".+"
            }
          ]
      };
    };

    oop.inherits(QuirrelHighlightRules, TextHighlightRules);

    exports.QuirrelHighlightRules = QuirrelHighlightRules;
});
