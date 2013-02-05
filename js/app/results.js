define([
  // JQUERY UI
    'libs/jquery/slickgrid/jquery.event.drag-2.0.min'
  , 'libs/jquery/ui/jquery.ui.sortable'
  , 'libs/jquery/slickgrid/slick.core'
  , 'libs/jquery/slickgrid/slick.grid'
  , 'libs/jquery/slickgrid/slick.dataview'
  , 'libs/jquery/slickgrid/slick.pager'
  , 'libs/jquery/slickgrid/slick.columnpicker'
],

function() {
  return function($el) {
    var wrapper,
        dataView = new Slick.Data.DataView(),
        gridOptions = {
            enableCellNavigation: false
          , enableColumnReorder: true
          , autoHeight : false
          , forceFitColumns: true
          , multiColumnSort: true
        },
        model = [
//          { id: "type", name: "Type", field: "type", width : 120, resizable: false},
          { id: "nline", name: "L", field: "nline", width : 25, resizable : false},
          { id: "ncol", name: "C", field: "ncol", width : 25, resizable : false},
          { id: "message", name: "Message", field: "message", width : 80, resizable : false},
          { id: "detail", name: "Detail", field: "detail"},
          { id: "line", name: "Code Line", field: "line"},
          { id: "timestamp", name: "Timestamp", field: "timestamp", width : 150, resizable : false}

//          { id: "linemessage", name: "Message", field: "linemessage"}
        ],
        layout = $el.parentsUntil("ui-layout-center").layout(),
        grid;

    function open_pane() {
      layout.open("south");
    }

    function close_pane() {
      layout.close("south");
    }

    function transform(type, id, msg) {
      return {
        "#id"       : id,
        type        : type,
        message     : msg.message,
        timestamp   : new Date(msg.timestamp).toLocaleString(),
        nline       : msg.position.lineNum,
        ncol        : msg.position.colNum,
        detail      : msg.position.detail,
        line        : msg.position.line,
        linemessage : msg.position.message
      };
    }

//TODO add grid refresh on resize
    dataView.onRowsChanged.subscribe(function (e, args) {
      if(!grid) return;
      grid.invalidateRows(args.rows);
      grid.render();
    });

    setTimeout(function() {
      grid = new Slick.Grid($el, dataView, model, gridOptions)
    }, 1000);

    return wrapper = {
      update : function(errors, warnings) {
        var counter = 0,
            messages =
              errors.map(function(msg) {
                return transform("error", ++counter, msg);
              }).concat(
                warnings.map(function(msg) {
                  return transform("warning", ++counter, msg);
                })
              );
        console.log("errors", errors);
        console.log("warnings", warnings);

        open_pane();

        dataView.setItems([], "#id"); // forces correct refreshes of data

        dataView.beginUpdate();
        dataView.setItems(messages, "#id");
        dataView.endUpdate();
      }
    };
  };
});