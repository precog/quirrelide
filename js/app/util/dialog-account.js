define([
      "rtext!templates/dialog.account.html"
    , "app/util/ui"
    , "app/util/dom"


    // FORCE INCLUSION?
    , 'libs/jquery/ui/jquery.ui.core'
    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.widget'
    , 'libs/jquery/ui/jquery.ui.mouse'
    , 'libs/jquery/ui/jquery.ui.resizable'
    , 'libs/jquery/ui/jquery.ui.button'
    , 'libs/jquery/ui/jquery.ui.sortable'
    , 'libs/jquery/ui/jquery.ui.draggable'
    , "libs/jquery/ui/jquery.ui.dialog"
],

function(tplDialog, ui, dom) {
    var elDialog, precog;

    function validateEmail(email) {
      var re_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re_email.test(email)) {
        return "invalid email address";
      } else {
        return null;
      }
    }

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function Validator() {
      var map = {},
          nextid = 0,
          self = this;
      this.create = function(getvalue, geterrorcontainer, validatorhandler){
          var id = "validation_"+(++nextid);

          return map[id] = {
            valid : false,
            validate : function() {
              var errorcontainer = geterrorcontainer();
              errorcontainer.hide();
              var value = getvalue();
              validatorhandler(value, function(response) {
                if(response) {
                  map[id].valid = false;
                  errorcontainer.html(response);
                  errorcontainer.show();
                  $(self).trigger("validation");
                } else {
                  map[id].valid = true;
                  errorcontainer.hide();
                  $(self).trigger("validation");
                }
              });
            },
            reset : function() {
              map[id].validate();
              geterrorcontainer().hide();
            }
          };
        };
      this.createEmpty = function(getvalue, errorcontainer) {
          return self.create(getvalue, errorcontainer, function(value, handler) {
            var result = !value ? "invalid empty field" : null;
            handler(result);
          });
        };
      this.createMinLength = function(getvalue, errorcontainer, min) {
          return self.create(getvalue, errorcontainer, function(value, handler) {
            var result = (value || "").length < min ? "should be at least " + min + " characters long" : null;
            handler(result);
          });
        };

      this.isValid = function() {
          for(var id in map) {
            if(!map.hasOwnProperty(id)) continue;
            if(!map[id].valid)
              return false;
          }
          return true;
        };
      this.reset = function() {
        for(var id in map) {
          if(!map.hasOwnProperty(id)) continue;
          map[id].reset();
        }
      }
    }

    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-account:last')
            .dialog({
                modal : true
                , autoOpen : false
                , resizable : false
                , dialogClass : "pg-el"
                , width : "500px"
                , dialogClass : "pg-el pg-dialog-account"
                , closeOnEscape: false
            })
        ;


        elDialog.find("button.try-demo").click(function(e) {
          e.preventDefault();
          elDialog.dialog("close");
          return false;
        });

        var createPanel  = elDialog.find("div.create"),
            recoverPanel = elDialog.find("div.recover");


        var login = new Validator();
        login.email = login.create(
          function() { return elDialog.find("input#account-email").val(); },
          function() { return elDialog.find("div.error.account-email"); },
          function(value, handler) { handler(validateEmail(value)); }
        );
        login.password = login.createEmpty(
          function() { return elDialog.find("input#account-password").val(); },
          function() { return elDialog.find("div.error.account-password"); }
        );

        var register = new Validator();
        register.email = register.create(
          function() { return elDialog.find("input#account-email").val(); },
          function() { return elDialog.find("div.error.account-email"); },
          function(value, handler) { handler(validateEmail(value)); }
        );
        register.password = register.createMinLength(
          function() { return elDialog.find("input#account-password").val(); },
          function() { return elDialog.find("div.error.account-password"); },
          6
        );
        register.confirmPassword = register.create(
          function() { return elDialog.find("input#account-confirm-password").val(); },
          function() { return elDialog.find("div.error.account-confirm-password"); },
          function(value, handler) { handler(elDialog.find("input#account-password").val() !== value ? "confirmation password doesn't match" : null); }
        );
        register.name = register.createMinLength(
          function() { return elDialog.find("input#account-name").val(); },
          function() { return elDialog.find("div.error.account-name"); },
          3
        );
        register.company = register.createMinLength(
          function() { return elDialog.find("input#account-company").val(); },
          function() { return elDialog.find("div.error.account-company"); },
          2
        );
        register.title = register.createEmpty(
          function() { return elDialog.find("input#account-title").val(); },
          function() { return elDialog.find("div.error.account-title"); }
        );



        function createToggle(selector, validator) {
          var el = elDialog.find(selector);
          el.button({ disabled : true });
          return function() {
            if(validator.isValid()) {
              el.button("enable");
              el.focus();
            } else {
              el.button("disable");
            }
          };
        }

        login.toggle = createToggle("#account-login", login);
        $(login).on("validation", login.toggle);

        register.toggle = createToggle("#account-create", register);
        $(register).on("validation", register.toggle);


        function wireLogin()
        {
          login.reset();
          elDialog.find("input#account-email").on("change", login.email.validate);
          elDialog.find("input#account-password").on("change", login.password.validate);
        }
        function unwireLogin()
        {
          elDialog.find("input#account-email").off("change", login.email.validate);
          elDialog.find("input#account-password").off("change", login.password.validate);
        }
        function wireRegister()
        {
          register.reset();
          elDialog.find("input#account-email").on("change", register.email.validate);
          elDialog.find("input#account-password").on("change", register.password.validate);
          elDialog.find("input#account-confirm-password").on("change", register.confirmPassword.validate);
          elDialog.find("input#account-name").on("change", register.name.validate);
          elDialog.find("input#account-company").on("change", register.company.validate);
          elDialog.find("input#account-title").on("change", register.title.validate);
        }
        function unwireRegister()
        {
          elDialog.find("input#account-email").off("change", register.email.validate);
          elDialog.find("input#account-password").off("change", register.password.validate);
          elDialog.find("input#account-confirm-password").off("change", register.confirmPassword.validate);
          elDialog.find("input#account-name").off("change", register.name.validate);
          elDialog.find("input#account-company").off("change", register.company.validate);
          elDialog.find("input#account-title").off("change", register.title.validate);
        }

        function updateForm()
        {
          var mode = elDialog.find("input.choose-ui:checked").val();
          createPanel.hide();
          recoverPanel.hide();
          unwireLogin();
          unwireRegister();
          switch(mode) {
            case "create":
              createPanel.show();
              wireRegister();
              break;
            case "login":
              recoverPanel.show();
              wireLogin();
              break;
          }
        }
        elDialog.find("input.choose-ui").change(updateForm);

        if(false) // TODO replace condition with email is present
          elDialog.find("input.choose-ui[value=\"login\"]").attr("checked", true);
        else
          elDialog.find("input.choose-ui[value=\"create\"]").attr("checked", true);
        updateForm();

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });

      function actionLogin(email, password)
      {
        window.Precog.createAccount(email, password,
          function(data) {
            console.log("login data", data);
          },
          function(err) {
            console.log("error", err);
          }
        );
      }

      function actionCreate(email, password, profile)
      {
        window.Precog.createAccount(email, password,
          function(data) {
            console.log("create data", data);
          },
          function(err) {
            console.log("error", err);
          },
          {
            profile : profile
          }
        );
      }

      elDialog.find("#account-login").click(function(e) {
        e.preventDefault();
        actionLogin(
          elDialog.find("input#account-email").val(),
          elDialog.find("input#account-password").val()
        );
        return false;
      });

      elDialog.find("#account-create").click(function(e) {
        e.preventDefault();
        actionCreate(
          elDialog.find("input#account-email").val(),
          elDialog.find("input#account-password").val(),
          {
            title   : elDialog.find("input#account-title").val(),
            name    : elDialog.find("input#account-name").val(),
            company : elDialog.find("input#account-company").val()
          }
        );
        return false;
      });
    }

    function setDemoConfig()
    {
      precog.config.apiKey = "5CDA81E8-9817-438A-A340-F34E578E86F8";
      precog.config.analyticsService = "http://labcoat.precog.com/";
    }


    var inited = false;
    return function(p, callback) {
        precog = p;
        if(!inited) {
            init();
            inited = true;
        }
        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", "Login to Labcoat");
        elDialog.dialog("open");
        if(callback)
        {
          elDialog.bind("dialogclose", function() {
            setDemoConfig();
            callback();
          });
        }

    };
});