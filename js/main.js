requirejs.config({
    waitSeconds : 20,
    baseUrl: "./js/",
    shim : {
        // JQUERY UI
          'libs/jquery/ui/jquery.ui.core'  : ['jquery']
        , 'libs/jquery/ui/jquery.ui.position' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.widget' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.mouse' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.resizable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.button' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.sortable' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.draggable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.dialog' : [
              'libs/jquery/ui/jquery.ui.widget'
            , 'libs/jquery/ui/jquery.ui.draggable'
            , 'libs/jquery/ui/jquery.ui.button'
            , 'libs/jquery/ui/jquery.ui.position'
            , 'libs/jquery/ui/jquery.ui.resizable'
        ]
        , 'libs/jquery/ui/jquery.ui.progressbar' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.tabs' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.menu' : ['libs/jquery/ui/jquery.ui.widget']

        , 'libs/jquery/slickgrid/jquery.event.drag-2.0.min' : ['jquery']
        , 'libs/jquery/slickgrid/slick.core' : ['libs/jquery/slickgrid/jquery.event.drag-2.0.min', 'libs/jquery/ui/jquery.ui.sortable']
        , 'libs/jquery/slickgrid/slick.grid' : ['libs/jquery/slickgrid/slick.core']
        , 'libs/jquery/slickgrid/slick.dataview' : ['libs/jquery/slickgrid/slick.grid']
        , 'libs/jquery/slickgrid/slick.pager' : ['libs/jquery/slickgrid/slick.dataview']
        , 'libs/jquery/slickgrid/slick.columnpicker' : ['libs/jquery/slickgrid/slick.pager']
        , 'app/util/output-table' : ['libs/jquery/slickgrid/slick.columnpicker']

        , 'app/util/ui' : ['libs/jquery/ui/jquery.ui.menu', 'libs/jquery/ui/jquery.ui.tabs', 'libs/jquery/ui/jquery.ui.progressbar']
        , 'libs/jquery/layout/jquery.layout' : ['libs/jquery/ui/jquery.ui.draggable']
        , 'libs/jquery/jstree/jstree' : ['libs/jquery/jstree/vakata']
        , 'libs/jquery/jstree/jstree.sort' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.types' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.themes' : ['libs/jquery/jstree/jstree']
        , 'app/folders' : ['libs/jquery/jstree/jstree.themes']
    }
});

require([
      'app/util/config'
    , 'app/layout'
    , 'app/editors'
    , 'app/history'
    , 'app/bar-main'
    , 'app/bar-editor'
    , 'app/bar-status'
    , 'app/theme'
    , 'app/editor/editor.ace'
    , 'app/editorsync'
    , 'app/output'
    , 'app/folders'
    , 'app/queries'
    , 'app/support'
    , 'app/startup-tips'
    , 'app/util/precog'
    , 'app/util/querystring'
],

function(config, createLayout, editors, history, buildBarMain, buildBarEditor, buildBarStatus, theme, buildEditor, sync, buildOutput, buildFolders, buildQueries, buildSupport, buildTips, precog, qs) {
$(function() {

    precog.cache.disable();

    var queries,
        layout = createLayout(config.get('ioPanesVertical'));

    layout.container.hide();

    buildBarMain(layout.getBarMain());

    $(theme).on('changed', function() {
        // refreshes the panes layout after theme changing
        layout.refresh();
    });

    $(theme).on('change', function(e, name) {
        config.set('theme', name);
    });

    var editor = buildEditor(layout.getCodeEditor(), config.get('ioPanesVertical'));
    editor.setTabSize(config.get('tabSize'));
    editor.setUseSoftTabs(config.get('softTabs'));

    $(layout).on('resizeCodeEditor', function() {
        editor.resize();
    });

    $(layout).on('ioOrientationChanged', function(_, vertical) {
        config.set('ioPanesVertical', vertical);
        editor.orientButton(vertical);
    });

    $(theme).on('change', function(e, name) {
        editor.setTheme(theme.getEditorTheme(name, editor.engine()));
    });

    $(editor).on('useSoftTabsChanged', function(_, value) {
//console.log('useSoftTabsChanged ' + value);
        config.set('softTabs', value);
    });

    $(editor).on('tabSizeChanged', function(_, value) {
//console.log('tabSizeChanged ' + value);
        config.set('tabSize', value);
    });

    var status = buildBarStatus(layout.getStatusBar(), editor, layout);

    var output = buildOutput(layout.getOutput(), editors); // TODO editors should not be passed here

    var support = buildSupport(layout.getSupport());

    support.addPanel('tutorial', 'https://quirrel.precog.com/tutorial.html');
    support.addPanel('reference', 'https://quirrel.precog.com/reference.html');
    support.addPanel('IRC channel', 'https://api.precog.com:9090/?channels=#quirrel');

//    support.addPanel('live support', 'http://widget.mibbit.com/?settings=3e7a9e32a26494b80748cfe11f66e956&server=irc.mibbit.net&channel=%23precog_test_channel');
//    support.addPanel('wsirc', 'http://wsirc.mobi/mobileChat.aspx?username=u_******&server=binary.ipocalypse.net%3A6667&channel=%23quirrel&autojoin=true&color=%23eeeeee&dark=false');
//    support.addPanel('freenode', 'http://webchat.freenode.net?randomnick=1&channels=quirrel&uio=Mz1mYWxzZSY5PXRydWU32');

    $(layout).on('resizeCodeEditor', function() {
        output.resize();
        support.resize();
    });

    $(output).on('syntaxError', function(_, pos) {
        editor.highlightSyntax(pos.line - 1, pos.column - 1, pos.text, 'error');
    });

    $(output).on('requestCursorChange', function(_, pos) {
        editor.setCursorPosition(pos.line - 1, pos.column - 1);
    });

    $(output).on('typeChanged', function(_, type) {
        editors.setOutputType(type);
    });

    var queue = [];
    $(precog).on('execute', function(_, query, lastExecution) {
        queue.push({ query : query, name : editors.getName() });
        status.startRequest();
    });

    $(precog).on('completed', function(_, data) {
        var exec = queue.shift();
        history.save(exec.name, exec.query, data);

        status.endRequest(true);
        output.setOutput(data, null, editors.getOutputOptions());
        editors.setOutputResult(data);

        if(editorbar.historyPanelIsOpen()) {
            refreshHistoryList();
        }
    });
    $(precog).on('failed', function(_, data) {
        queue.shift(); // cleanup the queue
        status.endRequest(false);
        output.setOutput(data, 'error', editors.getOutputOptions());
        editors.setOutputResult(data);
    });
    $(editor).on('execute', function(_, code) {
        precog.query(code);
    });

    $(editors).on('activated', function(_, index) {
        var result  = editors.getOutputResult(),
            type    = editors.getOutputType(),
            options = editors.getOutputOptions();
        output.setOutput(result, type, options);
    });

    $(editors).on('saved', function(_, data) {
        queries.querySave(data.name, data.code);
    });

    sync(editor, editors, config);

    var folders = buildFolders(layout.getSystem());

    $(folders).on('querypath', function(e, path) {
        var q = '/' + path;
        if(editors.getCode().trim() == '') {
            editor.set(q);
        } else {
            editors.add({ code : q });
            editors.activate(editors.count()-1);
        }
        editor.triggerExecute();
    });

    queries = buildQueries(layout.getQueries());
    $(queries).on('requestopenquery', function(_, data) {
        editors.open(data.name, data.code);
    });
    $(queries).on('removed', function(_, name) {
        var index = editors.getIndexByName(name);
        if(index >= 0) {
            editorbar.invalidateTab(index);
        }
    });

    var editorbar = buildBarEditor(layout.getBarEditor(), queries, editor);

    $(editors).on('saved', function(e, editor){
        var index = editors.getIndexById(editor.id);
        if(index < 0) return;
        editorbar.changeTabName(index, editor.name);
    });

    $(editors).on('added', function(e, editor) {
        editorbar.addTab(editor.name, !!editor.dirty);
    });

    $(editors).on('removed', function(e, name) {
        editorbar.removeTabByName(name);
    });

    var invalidationSuspended = true;
    function currentTabInvalidator() {
        if(invalidationSuspended) return;
        editors.setDirty();
        editorbar.invalidateTab(editors.current());
    }

    $(editor).on('change', currentTabInvalidator);

    $(editors).on('activated', function(e, index) {
        editorbar.activateTab(index);
        clearInterval(this.k);
        this.k = setTimeout(function() {
            invalidationSuspended = false;
        }, 1000);
        if(editorbar.historyPanelIsOpen()) {
            refreshHistoryList();
        }
    });

    function refreshHistoryList() {
        var data = history.revisions(editors.getName());
        editorbar.displayHistoryList(data);
    }

    $(editors).on('deactivated', function(e, index) {
        invalidationSuspended = true;
    });

    $(editors).on('removed', function(e, name) {
        if(!queries.queryExist(name))
            history.remove(name);
    });

    $(editorbar).on('requesthistorylist', refreshHistoryList);

    $(editorbar).on('requestopenrevision', function(e, info) {
        var name = editors.getName(),
            data = history.load(name, info.index);
        if(info.usenewtab) {
            editors.add({ code : data.code, output : { result : data.data } });
            editors.activate(editors.count()-1);
        } else {
            editor.set(data.code);
        }
        output.setOutput(data.data, null, editors.getOutputOptions());
    });

    $(editorbar).on('tabrenamed', function(e, data) {
        history.rename(data.oldname, data.newname);
        if(editorbar.historyPanelIsOpen()) {
            refreshHistoryList();
        }
    });

    var tips = buildTips(layout);

    editors.load();


    var query = qs.get('q');

    function editorcontains(q) {
        for(var i = 0; i < editors.count(); i++) {
            if(editors.getCode(i) === q)
                return true;
        }
        return false
    }

    if(!editors.count() || (query && !editorcontains(query))) {
        editors.add(query && { code : query });
    }
    setTimeout(function() {
        editors.activate(editors.count()-1); // prevents bug in safari

        $(output).on('optionsChanged', function(_, options) {
            editors.setOutputOptions(options);
        });

        theme.set(config.get('theme', 'franco'));

        config.monitor.bind('theme', function(e, name) {
            theme.set(name);
        });

        config.monitor.bind('softTabs', function(_, value) {
//console.log('from config softTabs ' + value);
            editor.setUseSoftTabs(value);
        });

        config.monitor.bind('tabSize', function(_, value) {
//console.log('from config tabSize ' + value);
            editor.setTabSize(value);
        });
    }, 150);

    layout.container.show();
});
});