define([
      "app/util/storagemonitor"
],

function(createStore) {
    var CONFIG_KEY = "pg-labcoat-config",
        defaults = {
            theme : "gray",
            indentUsingSpaces : false,
            tabSize : 2,
            softTabs : true,
            disableClientCache : true,
            ioPanesVertical : true,
            queryLimit : 1000
        };

    return createStore(CONFIG_KEY, defaults);
});