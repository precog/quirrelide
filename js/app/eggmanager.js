define([
      "app/config/eggs"
    , "app/util/notification"
],

function(eggs, notification) {
    function normalize(content) {
        return content.toLowerCase().replace(/\W+/, ' ').replace(/\s+/gm, ' ').trim();
    }

    function cleanQuery(q) {
        if(q.split("\n").length > 1) return null;
        q = q.trim();
        if(q.substr(0, 2) === '--')
            return q.substr(2);
        if(q.substr(0, 2) === "(*" && q.substr(q.length-2) === "*)")
            return q.substr(2, q.length-4);
        return null;
    }

    for(var i = 0; i < eggs.length; i++) {
        eggs[i].normalized = normalize(eggs[i].question);
    }

    return {
        findEgg : function(content) {
            var normalized = normalize(content);
            for(var i = 0; i < eggs.length; i++) {
                if(normalized === eggs[i].normalized) {
                    return i;
                }
            }
            return -1;
        },
        isEgg : function(content) {
            return this.findEgg(content) >= 0;
        },
        displayEgg : function(index, question) {
            if(index < 0) return;
            notification.main(question, {
                text : '<div class="pg-easter">' + eggs[index].answer + '</div>',
                min_height : '100px'
            });
        },
        easterEgg : function(question) {
            var q = cleanQuery(question);
            if(null === q) return false;
            var index = this.findEgg(q);
            if(index < 0) return false;
            this.displayEgg(index, q);
            return true;
        }
    }
})