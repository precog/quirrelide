define([

],

function() {
   return {
       arrayDiff : function(a1, a2) {
           return a1.filter(function(i) {return !(a2.indexOf(i) > -1);});
       },
       guid : function() {
           var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
           };
           return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
       },
       sortNodes: function(els, comparator) {
           var arr = $(els).map(function() { return this; });
           arr.sort(comparator);
           var parent = arr[0] && arr[0].parentNode;
           $(arr).each(function(i) {
               parent.appendChild(arr[i]);
           });
       },
       truncate : function(value, maxlen, ellipsis) {
           maxlen = maxlen || 25;
           ellipsis = ellipsis || "...";
           if(value.length >= maxlen)
               value = value.substr(0, maxlen-ellipsis.length)+ellipsis;
           return value;
       },
       normalizeQueryName : function (value) {
           value = value.trim().toLowerCase();
           if(value.substr(0, 1) === "/")
           value = value.substr(1);
           value.replace(/[ \-.]+/g, "_");
           return value;
       },
       arrayRemove : function(arr, el) {
           var index = arr.indexOf(el);
           if(index < 0) return arr;
           arr.splice(index, 1);
           return arr;
       },
       // return null if it is valid, an error message if it is not
       validateQueryName : function(query, path, queries) {
           if(query.match(/^[a-z0-9][a-z0-9 ]*[a-z0-9]$/i)) {
               if(queries.queryExist(path))
                   return "a query with this identifier already exists";
               else
                   return null;
           } else
               return "the name can only include alpha-numeric characters, white spaces (but not in the beginning and at the end) and must be at least 2 characters long.";
       }
   }
});