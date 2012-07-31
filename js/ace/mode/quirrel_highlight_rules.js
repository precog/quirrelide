define(
function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var lang = require("../lib/lang");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var QuirrelHighlightRules = function() {

        var keywords = lang.arrayToMap(
            ("difference|else|forall|if|import|intersect|new|then|union|where|with").split("|")
        );

        var builtinConstants = lang.arrayToMap(
            ("true|false|null").split("|")
        );

        var builtinFunctions = lang.arrayToMap(
            ("count|distinct|load|max|mean|geometricMean|sumSq|variance|median|min|mode|stdDev|sum").split("|")
        );

        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "--.*$"
            }, {
                token : "comment",
                regex : '\(-([^\-]|-+[^)\-])*-\)'
            }, {
                token : "string",           // " string
                regex : '"([^\n\r\\"]|\\.)*"'
            }, {
                token : "constant.numeric", // float
                regex : "[0-9]+(\\.[0-9]+)?([eE][0-9]+)?"
            }, {
                token : "variable",
                regex : "'[a-zA-Z_0-9]['a-zA-Z_0-9]*\\b"
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
                regex : "[a-zA-Z]['a-zA-Z_0-9]*|_['a-zA-Z_0-9]+\\b"
            }, {
                token : "string",
                regex : "/(/[a-zA-Z_\-0-9]+)+\\b"
            }, {
                token : "invalid",
                regex : "//"
            }, {
                token : "keyword.operator",
                regex : "~|:=|\\+|\\/|\\-|\\*|&|\\||<|>|<=|=>|!=|<>|=|!|neg"
            }, {
            	token : "keyword.operator",
            	regex : "\{",
            	next : "object-start"
            }, {
            	token : "constant.character",
            	regex : '`([^`\\]|\\.)+`'
            }
            ],
        
			"object-start" : [ {
				token : "entity.name.function",
				regex : '([a-zA-Z_][a-zA-Z_0-9]*|`([^`\\]|\\.)+`|"([^"\\]|\\.)+"):',
				next : "object-contents"
			}, {
				token : "keyword.operator",
				regex : '\}',
				next : "start"
			}
			],
			
			// TODO if we have nested objects, we will abort the state stack prematurely
			"object-contents" : this.start.concat([{
				token : "keyword.operator",
				regex : ',',
				next : "object-start"
			}])
        };
    };

    oop.inherits(QuirrelHighlightRules, TextHighlightRules);

    exports.QuirrelHighlightRules = QuirrelHighlightRules;
});
