define([

],

function() {
	var version,
		undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );
	
	version = v > 4 ? v : undef;
	
	return {
		isIE : function() {
			return !!version;
		},
		version : function() {
			return version;
		},
		greaterOrEqualTo : function(v) {
			return version && version > v;
		}
	};
});