define([
      "util/jsonmodel"
],

function(jsonmodel) {
    var elPanel = $('<div class="ui-widget"><div class="pg-table" style="height:100%;width:100%"></div></div>'),
        elOutput = elPanel.find('.pg-table'),
        dataView = new Slick.Data.DataView(),
        grid,
        gridOptions = {
              enableCellNavigation: false
            , enableColumnReorder: true
            , autoHeight : false
            , forceFitColumns: true
            , multiColumnSort: true
        },
        wrapper;

    grid = new Slick.Grid(elOutput, dataView, [], gridOptions);

    dataView.setPagingOptions({
        pageSize: 20
    });
    dataView.onRowCountChanged.subscribe(function (e, args) {
        if(!grid) return;
        try {
            grid.updateRowCount();
        } catch(_) {}
        grid.render();
    });
    dataView.onRowsChanged.subscribe(function (e, args) {
        if(!grid) return;
        grid.invalidateRows(args.rows);
        grid.render();
    });

    function transformData(model, data) {
        var result = [];
        if(model.length != 1 || !model[0].pgvalue) {
            for(var i = 0; i < data.length; i++) {
                var o = $.extend({}, data[i], { "#id" : "#" + i});
                result.push(o);
            }
        } else {
            for(var i = 0; i < data.length; i++) {
                result.push({ value : data[i], "#id" : "#" + i });
            }
        }
        return result;
    }

    function updateDataView(data, options) {
        dataView.setItems([], "#id"); // forces correct refreshes of data

        if(options && options.table.sort)
            sortData(data, options.table.sort);

        dataView.beginUpdate();
        dataView.setItems(data, "#id");
        dataView.endUpdate();
        if(options && options.table.pager && (("undefined" !== typeof options.table.pager.size) || ("undefined" !== typeof options.table.pager.pageNum)))
        {
            var pager = {};
            if(options.table.pager.size)
                pager.pageSize = options.table.pager.size;
            if(options.table.pager.page)
                pager.pageNum = options.table.pager.page;
            dataView.setPagingOptions(pager);
        }
    }

    function reducedResize() {
        clearInterval(this.killReducedResize);
        this.killReducedResize = setTimeout(function() {
            if(grid) grid.resizeCanvas();
        }, 0);
    }

    function sortData(data, cols) {
        data.sort(function (dataRow1, dataRow2) {
            for (var i = 0, l = cols.length; i < l; i++) {
                var field = cols[i].field;
                var sign = cols[i].asc ? 1 : -1;
                var value1 = dataRow1[field], value2 = dataRow2[field];
                var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                if (result != 0) {
                    return result;
                }
            }
            return 0;
        });
    }

    var changePagerHandler;
    return wrapper = {
        type : "table",
        name : "Table",
        panel : function() { return elPanel; },
        toolbar : function() {
            return $('<div></div>');
        },
        update : function(data, options) {
            if("undefined" === typeof options.table) {
                options.table = {
                    pager : {}
                };
            }
            if(changePagerHandler)
                dataView.onPagingInfoChanged.unsubscribe(changePagerHandler);
            try {
                if(grid) grid.destroy();
            } catch(e) {}

            var model = (!data || data.length == 0) ? [{
                id : "empty",
                name : "No Records Match Your Query",
                field : "empty"
            }] : jsonmodel.create(data);
            data = transformData(model, data);

            try {
                grid = new Slick.Grid(elOutput, dataView, model, gridOptions);
            } catch(e) {}

            changePagerHandler = function(e, args) {
                options.table.pager = { size : args.pageSize, page : args.pageNum };
                $(wrapper).trigger("optionsChanged", options);
            }

            if(options.table.sort) {
                grid.setSortColumns(options.table.sort.map(function(col){
                    return {
                        columnId : col.field,
                        sortAsc : col.asc
                    };
                }));
            }

            grid.onSort.subscribe(function (e, args) {
                options.table.sort = args.sortCols.map(function(def) {
                    return {
                        asc : def.sortAsc,
                        field : def.sortCol.field
                    };
                });
                $(wrapper).trigger("optionsChanged", options);
                updateDataView(data, options);
            });
            new Slick.Controls.Pager(dataView, grid, this.toolbar);

            updateDataView(data, options);

            dataView.onPagingInfoChanged.subscribe(changePagerHandler);

            reducedResize();
        },
        resize : reducedResize
    };
});