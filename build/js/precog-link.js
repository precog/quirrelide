requirejs.config({paths:{}}),require([],function(){$(function(){function a(a){return a=a.trim(),a.length>1&&a.substr(-1)==="/"&&(a=a.substr(0,a.length-1)),a}function h(a,b){return function(){var c=a.filter($(this).val());a.validate(c)?($(this).parent(".section").find(".input-error").hide(),b(c)):$(this).parent(".section").find(".input-error").html(a.validationError).show()}}function i(){if(!(b.protocol&&b.apiKey&&b.basePath&&b.analyticsService&&b.labcoatHost))return;var a=b.protocol+"://"+b.labcoatHost+"?apiKey="+encodeURIComponent(b.apiKey);b.basePath!=="/"&&(a+="&basePath="+encodeURIComponent(b.basePath)),b.analyticsService!=="api.precog.com/v1"&&(a+="&analyticsService="+encodeURIComponent(b.protocol+"://"+b.analyticsService)),$("input#labcoatUrl").val(a),$("#gotoLabcoat").attr("href",a).show()}function j(a){return function(c){if(b[a]===c)return;b[a]=c,i()}}function k(a){var b=j("protocol");$(".protocol").html(a),b.call(this,a)}var b={labcoatHost:"labcoat.precog.com/",protocol:"https",apiKey:null,basePath:"/",analyticsService:"beta2012v1.precog.com/v1"},c={validate:function(a){return["http","https"].indexOf(a)>=0?!0:(this.validationError="invalid protocol",!1)},filter:function(a){return a.trim().toLowerCase()}},d={validate:function(a){return a.match(/^([A-F0-9]{8})(-[A-F0-9]{4}){3}-([A-F0-9]{12})$/)?!0:(this.validationError="invalid token pattern",!1)},filter:function(a){return a.trim().toUpperCase()}},e={validate:function(a){return a.match(/^((\/[a-z0-9_\-]+)+|\/)$/i)?!0:(this.validationError="invalid path pattern",!1)},filter:a},f={validate:function(a){return a.match(/^(([a-z0-9_\-.]+)+([:]\d+)?([\/a-z0-9_\-.]+)*)$/i)?!0:(this.validationError="invalid Labcoat host url",!1)},filter:a},g={validate:function(a){return a.match(/^((\/?[a-z0-9_\-.]+)+)$/i)?!0:(this.validationError="invalid analytics service url",!1)},filter:a};$("select#protocol").val(b.protocol).change(h(c,k)).change(),$("input#labcoatHost").val(b.labcoatHost).keyup(h(f,j("labcoatHost"))).change(h(f,j("labcoatHost"))),$("input#apiKey").val(b.apiKey).keyup(h(d,j("apiKey"))).change(h(d,j("apiKey"))),$("input#basePath").val(b.basePath).keyup(h(e,j("basePath"))).change(h(e,j("basePath"))),$("input#analyticsService").val(b.analyticsService).keyup(h(g,j("analyticsService"))).change(h(g,j("analyticsService")))})}),define("generator",function(){})