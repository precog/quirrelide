define([

],

function() {
    var INTERACTION = "interaction",
        wrapper,
        queue = [];

    function processQueue() {
        if(queue.length === 0) return;
        if("undefined" === typeof _gaq) {
            clearInterval(this.timer);
            this.timer = setTimeout(function() { processQueue(); }, 1000);
            return;
        }
        var item = queue.shift();
        _gaq.push(['_trackEvent', item.category, item.action, item.label, item.value]);
        processQueue();
    }

    function enqueue(category, action, label, value) {
        queue.push({ category : category, action : action, label : label, value : value });
        processQueue();
    }

    return wrapper = {
        track : function(type, params) {
//            console.log(category, action, label, value);
            enqueue(category, action, label, value);
        }
    };
});
