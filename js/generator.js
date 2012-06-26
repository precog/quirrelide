/*global requirejs, require, $, console*/
requirejs.config({
    paths: {
    
    }
});

require([],
    function () {
        'use strict';
        
        function stripTrailingSlash(value) {
            value = value.trim();
            if (value.length > 1 && value.substr(-1) === "/") {
                value = value.substr(0, value.length - 1);
            }
            return value;
        }
        
        var model = {
                ideHost : "ide.precog.com/",
                protocol : "https",
                tokenId : null,
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
                    if (!!value.match(/^(([a-z0-9_\-.]+)+([\/a-z0-9_\-.]+)*)$/i)) {
                        return true;
                    } else {
                        this.validationError = "invalid IDE host url";
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
            if (!(model.protocol && model.tokenId && model.basePath && model.analyticsService && model.ideHost)) {
                return;
            }
            console.log(JSON.stringify(model));
            var url = model.protocol
                + "://"
                + model.ideHost
                + "?tokenId=" + encodeURIComponent(model.tokenId);
            if (model.basePath !== "/") {
                url += "&basePath=" + encodeURIComponent(model.basePath);
            }
            if (model.analyticsService !== "api.precog.com/v1") {
                url += "&analyticsService=" + encodeURIComponent(model.protocol + "://" + model.analyticsService);
            }
            $("input#ideurl").val(url);
            $("#gotoide").attr("href", url).show();
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
        
        $('input#ideHost')
            .val(model.ideHost)
            .keyup(validateInput(host, assignToModel("ideHost")))
            .change(validateInput(host, assignToModel("ideHost")));
        
        $('input#tokenId')
            .val(model.tokenId)
            .keyup(validateInput(token, assignToModel("tokenId")))
            .change(validateInput(token, assignToModel("tokenId")));
        
        $('input#basePath')
            .val(model.basePath)
            .keyup(validateInput(path, assignToModel("basePath")))
            .change(validateInput(path, assignToModel("basePath")));
        
        $('input#analyticsService')
            .val(model.analyticsService)
            .keyup(validateInput(service, assignToModel("analyticsService")))
            .change(validateInput(service, assignToModel("analyticsService")));
/*
        $('input#tokenId').keypress(function () {
            console.log($('input#tokenId').val());    
        });
*/
    });