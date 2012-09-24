/*global requirejs, require, $, console*/
requirejs.config({
    paths: {
    
    }
});

require([],
function () {
'use strict';
$(function() {
    function stripTrailingSlash(value) {
        value = value.trim();
        if (value.length > 1 && value.substr(-1) === "/") {
            value = value.substr(0, value.length - 1);
        }
        return value;
    }

    var model = {
            labcoatHost : "labcoat.precog.com/",
            protocol : "https",
            apiKey : null,
            basePath : "/",
            analyticsService : "beta2012v1.precog.com/v1"
        },
        protocol = {
            validate : function (value) {
                if (["http", "https"].indexOf(value) >= 0) {
                    return true;
                } else {
                    this.validationError = "invalid protocol";
                    return false;
                }
            },
            filter : function (value) {
                return value.trim().toLowerCase();
            }
        },
        token = {
            validate : function (value) {
                if (!!value.match(/^([A-F0-9]{8})(-[A-F0-9]{4}){3}-([A-F0-9]{12})$/)) {
                    return true;
                } else {
                    this.validationError = "invalid token pattern";
                    return false;
                }
            },
            filter : function (value) {
                return value.trim().toUpperCase();
            }
        },
        path = {
            validate : function (value) {
                if (!!value.match(/^((\/[a-z0-9_\-]+)+|\/)$/i)) {
                    return true;
                } else {
                    this.validationError = "invalid path pattern";
                    return false;
                }
            },
            filter : stripTrailingSlash
        },
        host = {
            validate : function (value) {
                if (!!value.match(/^(([a-z0-9_\-.]+)+([:]\d+)?([\/a-z0-9_\-.]+)*)$/i)) {
                    return true;
                } else {
                    this.validationError = "invalid Labcoat host url";
                    return false;
                }
            },
            filter : stripTrailingSlash
        },
        service = {
            validate : function (value) {
                if (!!value.match(/^((\/?[a-z0-9_\-.]+)+)$/i)) {
                    return true;
                } else {
                    this.validationError = "invalid analytics service url";
                    return false;
                }
            },
            filter : stripTrailingSlash
        };

    function validateInput(validator, callback) {
        return function () {
            var val = validator.filter($(this).val());
            if (validator.validate(val)) {
                $(this).parent(".section").find(".input-error").hide();
                callback(val);
            } else {
                $(this).parent(".section").find(".input-error").html(validator.validationError).show();
            }
        };
    }

    function generate() {
        if (!(model.protocol && model.apiKey && model.basePath && model.analyticsService && model.labcoatHost)) {
            return;
        }
        var url = model.protocol
            + "://"
            + model.labcoatHost
            + "?apiKey=" + encodeURIComponent(model.apiKey);
        if (model.basePath !== "/") {
            url += "&basePath=" + encodeURIComponent(model.basePath);
        }
        if (model.analyticsService !== "api.precog.com/v1") {
            url += "&analyticsService=" + encodeURIComponent(model.protocol + "://" + model.analyticsService);
        }
        $("input#labcoatUrl").val(url);
        $("#gotoLabcoat").attr("href", url).show();
    }

    function assignToModel(name) {
        return function (value) {
            if (model[name] === value) { return; }
            model[name] = value;
            generate();
        };
    }

    function changeProtocol(value) {
        var handler = assignToModel("protocol");
        $(".protocol").html(value);
        handler.call(this, value);
    }

    $('select#protocol')
        .val(model.protocol)
        .change(validateInput(protocol, changeProtocol))
        .change();

    $('input#labcoatHost')
        .val(model.labcoatHost)
        .keyup(validateInput(host, assignToModel("labcoatHost")))
        .change(validateInput(host, assignToModel("labcoatHost")));

    $('input#apiKey')
        .val(model.apiKey)
        .keyup(validateInput(token, assignToModel("apiKey")))
        .change(validateInput(token, assignToModel("apiKey")));

    $('input#basePath')
        .val(model.basePath)
        .keyup(validateInput(path, assignToModel("basePath")))
        .change(validateInput(path, assignToModel("basePath")));

    $('input#analyticsService')
        .val(model.analyticsService)
        .keyup(validateInput(service, assignToModel("analyticsService")))
        .change(validateInput(service, assignToModel("analyticsService")));
/*
    $('input#apiKey').keypress(function () {
        console.log($('input#apiKey').val());
    });
*/
    });
});