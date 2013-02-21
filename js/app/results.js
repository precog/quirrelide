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
  function message_type_formatter(r, c, value, cell, item) {
    var src = value == 'warning'
              ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUM2OEZDQTg4RTU0MTFFMUEzM0VFRTM2RUY1M0RBMjYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUM2OEZDQTk4RTU0MTFFMUEzM0VFRTM2RUY1M0RBMjYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQzY4RkNBNjhFNTQxMUUxQTMzRUVFMzZFRjUzREEyNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQzY4RkNBNzhFNTQxMUUxQTMzRUVFMzZFRjUzREEyNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pgd7PfIAAAGmSURBVHjaYvr//z8DJZiJgUIANoCRkREb9gLiSVAaQx4OQM7AAkwd7XU2/v++/rOttdYGEB9dASEvOMydGKfH8Gv/p4XTkvRBfLxeQAP+1cUhXopyvzhP7P/IoSj7g7Mw09cNKO6J1QQ0L4gICPIv/veg/8W+JdFvQNLHVsW9/nmn9zk7B+cCkDwhL7gt6knSZnx9/LuCEOcvkIAMP+cvto9nfqyZmmUAksfnBUtbM60gX/3/kgyv3/xSFOL5DZT+L8vP+Yfh5cvfPvp/xUHyQHXGyAYwgpwBjZYFT3Y1OEl/OfCH4ffv3wzc4iwMvNIsDJ+f/mH4+vIPAxsb631WW0Yln6ZpQLXdMK/DXGDflh+sIv37EivD5x//Gb7+YWT4y86sl7BCCkSD+Z++/1dkvsFRl+HnD1Rvje4F8whjMXmGj58YGf5zsDMwcnAwfPvKcml62DsQDeaDxN+/Y0qwlpEHqrdB94IRNIDUgfgfKJChGK4OikEW3gTiXUB950ASLFAF54AC94A0G9QAfOnmF9DCDzABFqS08IHYDIScdijOjQABBgC+/9awBH96jwAAAABJRU5ErkJggg=="
              : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUM2OEZDQTQ4RTU0MTFFMUEzM0VFRTM2RUY1M0RBMjYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUM2OEZDQTU4RTU0MTFFMUEzM0VFRTM2RUY1M0RBMjYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQzY4RkNBMjhFNTQxMUUxQTMzRUVFMzZFRjUzREEyNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQzY4RkNBMzhFNTQxMUUxQTMzRUVFMzZFRjUzREEyNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkgXxbAAAAJbSURBVHjapFNNaBNBFH4zs5vdZLP5sQmNpT82QY209heh1ioWisaDRcSKF0WKJ0GQnrzrxasHsR6EnlrwD0TagxJabaVEpFYxLWlLSS822tr87m66ccfd2GKyVhA6MMybgfe97/vmPUQphd0sZjto9XIn9OOsvlu2nkqRzVU+6vvlzPf8W6bk8dxQ0NPbxAALgCgg2JkaQuhzQau/El0zbmUA7U0Es8v2CiYmKQJHGO1QICCLoqilMhkmurDAyapKgqItezi/USRdJqEYY4D5jCy03ht2yMkkvL91jTTX10qzyyu2hruPRN7jgbH+EOsXcMLgYiThEgAMhABW85oqy1DXdRIdvP1AHJ2acQXvDIrVHcdQNrEKNYSVMSZGMjEzIIAwDXIo+6G/FxcGnzkC3T2oMhLjre49sBB+RRcHLqdafK6sYdE/GGBwU1VpFNj0aN8pJbe+BkZyevUrvLl6Xmm0W9IuTc0DxrDNAJd5oEvI/KRsNC3bQyNjPO9yQ1YHcfj2QvfQc/5TUhJTBc2iM0U7AWDQtc1nJHvD/cfO2s7jaGkiTEfa/Ep8coLu7zmNmh8+dc5lZDuUeFAGUNA/OY6JVaypQ0vjr7XYjUvJM37vt+j1vuTK5DgVfVUoTjVe+y3/LxMxY2GgU+CSLy4cpfsYorRXuXIOi0Vt40h67uZFTdIo6nLaZcwUJWAzwNS0tBnqqKzQDnjdG/iPyZxo46HaKUpbvYkj8qYRTZsBhge+JHhZyh0x9b95JqjVJkT084kZIPwu/mPWqPgfQ5jXh2+92Ay7HedfAgwA6KDWafb4w3cAAAAASUVORK5CYII="
    ;
    return '<img src="'+src+'" alt="'+value+'" class="result-icon">';
  }

  function report_formatter(r, c, value, cell, item) {
    if(value !== "report") {
      return null;
    }
    return '<a href="#" class="report">report</a>';
  }

  function code_formatter(r, c, value, cell, item) {
    return '<span class="inline-code ace_editor">'+value+'</span>';
  }

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
          { id: "type", name: " ", field: "type", width : 25, resizable : false, formatter : message_type_formatter, cssClass : "centered" },
          { id: "nline", name: "L", field: "nline", width : 25, resizable : false, cssClass : "centered" },
          { id: "ncol", name: "C", field: "ncol", width : 25, resizable : false, cssClass : "centered" },
          { id: "detail", name: "Detail", field: "detail"},
          { id: "line", name: "Line", field: "line", formatter : code_formatter},
          { id: "timestamp", name: "Timestamp", field: "timestamp", width : 170, resizable : false},
          { id: "report", name: "", field: "report", width : 100, resizable : false, formatter : report_formatter }
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
      if(!msg.position)
        return null;

      var position = msg.position.detail
        ? msg.position.detail
        : {
            lineNum : msg.position.line,
            colNum  : msg.position.column,
            detail  : msg.message.split("\n").shift(),
            line    : msg.position.text,
            message : msg.message
          };

      var o = {
        "#id"       : id,
        type        : type,
        message     : msg.message,
        timestamp   : new Date(msg.timestamp).toLocaleString(),
        nline       : position.lineNum,
        ncol        : position.colNum,
        detail      : position.detail,
        line        : position.line,
        linemessage : position.message
      };
      if(type === "error") {
        o.report = "report"
      }
      return o;
    }

    function reduced_resize() {
      clearInterval(this.killReducedResize);
      this.killReducedResize = setTimeout(function() {
        if(grid)
          grid.resizeCanvas();
      }, 20);
    }

    dataView.onRowsChanged.subscribe(function (e, args) {
      if(!grid) return;
      grid.invalidateRows(args.rows);
      grid.render();
      grid.onClick.subscribe(function(e) {
        var cell   = grid.getCellFromEvent(e),
            data   = dataView.getItem(cell.row),
            line   = data.nline,
            column = data.ncol,
            type   = data.type;
        if(model[cell.cell].id === "report" && data.report === "report") {
          $(wrapper).trigger("report", data);
        } else {
          $(wrapper).trigger("goto", { line : line, column : column, type : type });
        }
      });
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
              ).filter(function(o) {
                  return !!o;
              });

        messages.sort(function(a, b) {
          return a.nline - b.nline;
        });

        if(messages.length)
          open_pane();
        else
          close_pane();

        dataView.setItems([], "#id"); // forces correct refreshes of data

        dataView.beginUpdate();
        dataView.setItems(messages, "#id");
        dataView.endUpdate();

        setTimeout(function() {
          var i = messages.length,
              item;
          $(wrapper).trigger("resetHighlightSyntax");
          while(--i >= 0) {
            item = messages[i];
            $(wrapper).trigger("highlightSyntax", {
              line : item.nline,
              column : item.ncol,
              text : item.detail,
              type : item.type
            });
          }
        }, 100);
      },
      resize : reduced_resize
    };
  };
});