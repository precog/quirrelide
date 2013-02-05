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
          {id: "type", name: "Type", field: "type", width : 120, resizable: false},
          {id: "msg", name: "Message", field: "msg"}
        ],
        layout = $el.parentsUntil("ui-layout-center").layout(),
        grid;

    function open_pane() {
      layout.open("south");
    }

    function close_pane() {
      layout.close("south");
    }

console.log();
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
        var messages =
          errors.map(function(error) {
            return { type : "error", msg : error };
          }).concat(
            warnings.map(function(warning) {
              return { type : "warning", msg : warning };
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