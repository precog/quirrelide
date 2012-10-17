requirejs.config({
    waitSeconds : 20,
    baseUrl: "./js/",
    shim : {
        // JQUERY UI
          'libs/jquery/ui/jquery.ui.core'  : ['jquery']
        , 'libs/jquery/ui/jquery.ui.position' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.widget' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.mouse' : ['libs/jquery/ui/jquery.ui.widget']
//        , 'libs/jquery/ui/jquery.ui.tooltip' : ['libs/jquery/ui/jquery.ui.position']
        , 'libs/jquery/ui/jquery.ui.resizable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.button' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.sortable' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.draggable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.droppable' : ['libs/jquery/ui/jquery.ui.draggable']
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

        , 'libs/jquery/slickgrid/jquery.event.drag-2.0.min' : ['jquery', 'libs/jquery/ui/jquery.ui.sortable']
        , 'libs/jquery/slickgrid/slick.core' : ['libs/jquery/slickgrid/jquery.event.drag-2.0.min', 'libs/jquery/ui/jquery.ui.sortable']
        , 'libs/jquery/slickgrid/slick.grid' : ['libs/jquery/slickgrid/slick.core']
        , 'libs/jquery/slickgrid/slick.dataview' : ['libs/jquery/slickgrid/slick.grid']
        , 'libs/jquery/slickgrid/slick.pager' : ['libs/jquery/slickgrid/slick.dataview']
        , 'libs/jquery/slickgrid/slick.columnpicker' : ['libs/jquery/slickgrid/slick.pager']
        , 'app/util/output-table' : ['libs/jquery/slickgrid/slick.columnpicker', 'libs/jquery/ui/jquery.ui.sortable']

        , 'app/util/ui' : ['libs/jquery/ui/jquery.ui.menu', 'libs/jquery/ui/jquery.ui.tabs', 'libs/jquery/ui/jquery.ui.progressbar', 'app/util/dom']
        , 'libs/jquery/layout/jquery.layout' : ['libs/jquery/ui/jquery.ui.draggable']
        , 'libs/jquery/jstree/jstree' : ['libs/jquery/jstree/vakata']
//        , 'libs/jquery/jstree/jstree.dnd2' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.sort' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.types' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.themes' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.ui' : ['libs/jquery/jstree/jstree']
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
    , 'app/eggmanager'
    , 'app/gatrack'
],

function(config, createLayout, editors, history, buildBarMain, buildBarEditor, buildBarStatus, theme, buildEditor, sync, buildOutput, buildFolders, buildQueries, buildSupport, buildTips, precog, qs, eastereggs, ga) {
$(function() {

    precog.cache.disable();

    var queries,
        layout = createLayout(config.get('ioPanesVertical'));

    layout.getContainer().hide();

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
        config.set('softTabs', value);
    });

    $(editor).on('tabSizeChanged', function(_, value) {
        config.set('tabSize', value);
    });

    var status = buildBarStatus(layout.getStatusBar(), editor, layout);

    var output = buildOutput(layout.getOutput(), editors); // TODO editors should not be passed here

    var support = buildSupport(layout.getSupport());

    support.addPanel('tutorial', 'https://quirrel.precog.com/tutorial.html');
    support.addPanel('reference', 'https://quirrel.precog.com/reference.html');
    support.addPanel('IRC channel', 'https://api.precog.com:9090/?channels=#quirrel');

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

    var executions = {};
    $(precog).on("execute", function(_, query, lastExecution, id) {
        executions[id] = { query : query, name : editors.getName() };
        status.startRequest();
    });

    $(precog).on("completed", function(_, id, data, extra) {
      var execution = executions[id];
      delete executions[id];
      history.save(execution.name, execution.query, data); // TODO CHECK HOW PAGINATION AFFECTS THE BEHAVIOR OF HISTORY
      status.endRequest(true);
      if(editors.getName() === execution.name) {
        output.setOutput(data, null, editors.getOutputOptions()); // TODO ADD HERE OUTPUT OPTIONS AND REMOVE REFERENCES TO DEFAULT TABLE
        // TODO SET OUTPUT OPTIONS FOR PAGINATION
        editors.setOutputResult(data);

        if(editorbar.historyPanelIsOpen()) {
          refreshHistoryList();
        }
      } else {
        var index = editors.getIndexByName(execution.name);
        if(index >= 0) {
          var currenttype = editors.getOutputType(index);
          if(currenttype === "message" || currenttype === "error")
            editors.setOutputType("table", index);
          // TODO SET OUTPUT OPTIONS FOR PAGINATION
          editors.setOutputResult(data, index);
        }
      }
      ga.trackQueryExecution("success");
    });
    $(precog).on('failed', function(_, id, data) {
      data = data instanceof Array ? data[0] : data;
      var execution = executions[id];
      delete executions[id];
      status.endRequest(false);
      if(editors.getName() === execution.name) {
        output.setOutput(data, 'error', editors.getOutputOptions());
        editors.setOutputResult(data);
      } else {
        var index = editors.getIndexByName(execution.name);
        if(index >= 0)
          editors.setOutputResult(data, index);
      }

      ga.trackQueryExecution("undefined" !== typeof data.lineNum ? "syntax-error" : "service-error");
    });

    var execTimer;
    $(editor).on("execute", function(_, code) {
      if(eastereggs.easterEgg(code)) return;

      clearInterval(execTimer);
      execTimer = setTimeout(function() {
        var pagination = output.paginationOptions();
//        precog.query(code, pagination);
        precog.query(code);
      }, 0);
    });
/*
    $(output).on("paginationChanged", function(_) {
      clearInterval(execTimer);
      execTimer = setTimeout(function() {
        var pagination = output.paginationOptions();
console.log(JSON.stringify(pagination));
        precog.query(editor.get(), pagination);
      }, 0);
    });
*/
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
        if(path.substr(0, 1) !== "/")
          path = "/" + path;
        var q = 'load("/' + path.replace(/"/g, '\"') + '")';
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

    $(editors).on("added", function(e, editor) {
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

        theme.set(precog.config.theme || config.get('theme', 'gray'));

        config.monitor.bind('theme', function(e, name) {
            theme.set(name);
        });

        config.monitor.bind('softTabs', function(_, value) {
            editor.setUseSoftTabs(value);
        });

        config.monitor.bind('tabSize', function(_, value) {
            editor.setTabSize(value);
        });

        layout.getContainer().show();
    }, 150);
});
});