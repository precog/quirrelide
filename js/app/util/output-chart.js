define([
      "util/jsonmodel"
    , "util/ui"
    , "util/notification"
    , "text!templates/panel.options.chart-output.html"
    , "https://api.reportgrid.com/js/reportgrid-core.js"
    , "https://api.reportgrid.com/js/reportgrid-charts.js"
],

function(jsonmodel, ui, notification, tplOptionsPanel) {
    var wrapper,
        elPanel  = $('<div class="ui-widget ui-content pg-overflow-hidden"><div class="pg-chart"></div></div>'),
        elChart  = elPanel.find('.pg-chart');

    var spaces = 2,
        toolbar, options, currentData;

    var noti, model, optionButton, params;

    function delayedRender() {
        clearInterval(this.k);
        this.k = setTimeout(render, 50);
    }

    function render() {
        try {
            elChart.find("*").remove();
            ReportGrid.chart(elChart.get(0), params);
        } catch(e) {}
    }

    function formatLabel(value, axis) {
        if(axis.type.substr(0, 5) === "time:") {
            return ReportGrid.format(typeof value === "number" ? new Date(value) : ReportGrid.date.parse(value), "DT");
        } else {
            return ReportGrid.humanize(value);
        }
    }

    function refresh() {
        clear();
        if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
        if(!options.x || !options.y || options.x === options.y) return;

        if(!options.samplesize)
            options.samplesize = 100;

        var x = jsonmodel.axis(model, options.x),
            y = jsonmodel.axis(model, options.y);

        if(!x || !y) return;

        var datapoints = currentData.slice(0);
        if(x.transformer) {
            datapoints = x.transformer(datapoints);
        }
        if(y.transformer) {
            datapoints = y.transformer(datapoints);
        }
        datapoints = dataSort(datapoints, options.x);
        if(datapoints.length > options.samplesize) {
            datapoints = datapoints.slice(0, options.samplesize);
        }

        params = {
            axes : [x, y],
            data : datapoints,
            options : {
//                download : true,
                displayrules : true,
                visualization : (x.type.substr(0, 5) === "time:") ? "linechart" : "barchart", // "scattergraph",
                label : {
                    axis : function(axis) {
                        return axis;
                    },
                    datapointover : function(dp, stats) {
                        return formatLabel(dp[options.x], x) + ": " + formatLabel(dp[options.y], y);
                    }
                }
            }
        };
        if(params.options.visualization === "linechart")
            params.options.effect = "dropshadow";
        if(options.segment)
            params.options.segmenton = options.segment;
        delayedRender();
    }

    function dataSort(data, x) {
        data = data.splice(0);
        data.sort(function(a, b) {
            return ReportGrid.compare(a[x], b[x]);
        });
        return data;
    }

    function selectOption(title) {

        function filterMultivalue(column) {
            return !!column.multivalue;
        }

        function filterNumbersAndMultivalue(column) {
            return (
                   (!!column.multivalue)
                || (column.type === "number")
                || (column.subtype === "datetime")
                || (options && options.x === column.field)
                || (options && options.y === column.field)
            );
        }

        function feed(select, columns, current, optional, filter) {
            select.find("option").remove();
            if(optional)
                select.append('<option value="">[none]</option>')
            for(var i = 0; i < columns.length; i++) {
                var value = filter(columns[i]);
                if(value) continue;
                select.append('<option value="'+columns[i].field+'"'+(current === columns[i].field ? " selected" : "")+'>'+columns[i].name+'</option>')
            }
            if(select.find("option").length === (optional ? 1 : 0)) {
                select.closest(".pg-selection").hide();
            } else {
                select.closest(".pg-selection").show();
            }
            return select;
        }

        function resetSegmentAndChangeOption(name) {
            return function() {
                options[name] = $(this).val();
                if(options.segment === options[name])
                    options.segment = null;
                feed(noti.find(".pg-segment"), model, options.segment, true, filterNumbersAndMultivalue);
                $(wrapper).trigger("optionsChanged", options);
                refresh();
            };
        }

        function changeOption(name) {
            return function() {
                options[name] = $(this).val();
                $(wrapper).trigger("optionsChanged", options);
                refresh();
            };
        }

        return function() {
            if(noti) noti.remove();
            noti = notification.context(title, {
                width: "264px",
                text : tplOptionsPanel,
                target : this,
                before_open : function() {
                    if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
                },
                after_open : function() {
                    var x = feed(noti.find(".pg-x"), model, options.x, false, filterMultivalue).change(resetSegmentAndChangeOption("x"));
                    feed(noti.find(".pg-y"), model, options.y, false, filterMultivalue).change(resetSegmentAndChangeOption("y"));
                    feed(noti.find(".pg-segment"), model, options.segment, true, filterNumbersAndMultivalue).change(changeOption("segment"));
                    noti.find(".pg-sample").val(options.samplesize).change(changeOption("samplesize"));
                    if(options.x !== noti.find(".pg-x").val())
                        x.change();
                }
            })
        };
    }

    function clear() {
        elChart.find("*").remove().removeClass("rg");
        elChart.append('<div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>Please select the chart axis using the options button above.</p></div>')
    }

    wrapper = {
        type : "chart",
        name : "Chart",
        panel : function() { return elPanel; },
        update : function(data, o) {
            if(noti) noti.remove();
            if(data) {
                currentData = data;
            } else {
                data = currentData;
            }
            if(!data || data.length <= 1) {
                // print out message
                elChart.html('<div class="pg-message ui-content ui-state-highlight ui-corner-all">The dataset doesn\'t contain enough values to build a chart.</div>');
                // disable options
                if(optionButton) optionButton.button("disable");
                return;
            }

            options = o || { samplesize : 200 };

            // create model
            model = jsonmodel.create(data);
            // enable options
            if(optionButton) optionButton.button("enable");

            refresh();
        },

        resize : function() {
            elChart.css({
                width  : elPanel.innerWidth() + "px",
                height : elPanel.innerHeight() + "px"
            });
            refresh();
        },

        activate : function() {
            if(!toolbar) {
                toolbar = $(this.toolbar);

                optionButton = ui.button(toolbar, {
                    label : "options",
                    text : true,
                    handler : selectOption("Chart Options"),
                    disabled : true
                });

                ui.button(toolbar, {
                    label : 'powered by ReportGrid <img src="http://api.reportgrid.com/css/images/reportgrid-clear.png" title="Powered by ReportGrid" height="29" width="194">',
                    text : true,
                    handler : function() {
                        window.open("http://reportgrid.com/", "_blank");
                    }
                }).addClass("pg-rg-logo");
            }
            toolbar.show();
        },
        deactivate : function() {
            if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
            if(noti) noti.remove();
            clear();
            toolbar.hide();
        }
    };

    return wrapper;
});