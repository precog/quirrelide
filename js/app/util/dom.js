define([

],

function() {
    return {
        selectText : function(element, start, end) {
            start = start || 0;
            end   = end || $(element).text().length;
            if(element.setSelectionRange) {
                element.focus();
                element.setSelectionRange(start, end);
            } else if(element.createTextRange) {
                var range = element.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        },
        canSelect : function(element) {
            return !!(element.setSelectionRange || element.createTextRange);
        }
    }
});