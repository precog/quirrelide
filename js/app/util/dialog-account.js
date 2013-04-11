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
    , "libs/jquery/jquery.cookie/jquery.cookie"
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
      this.validate = function() {
        for(var id in map) {
          if(!map.hasOwnProperty(id)) continue;
          map[id].validate();
        }
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
          function() { return elDialog.find("input#email").val(); },
          function() { return elDialog.find("div.error.email"); },
          function(value, handler) { handler(validateEmail(value)); }
        );
        login.password = login.createEmpty(
          function() { return elDialog.find("input#password").val(); },
          function() { return elDialog.find("div.error.password"); }
        );

        var register = new Validator();
        register.email = register.create(
          function() { return elDialog.find("input#email").val(); },
          function() { return elDialog.find("div.error.email"); },
          function(value, handler) { handler(validateEmail(value)); }
        );
        register.password = register.createMinLength(
          function() { return elDialog.find("input#password").val(); },
          function() { return elDialog.find("div.error.password"); },
          6
        );
        register.confirmPassword = register.create(
          function() { return elDialog.find("input#account-confirm-password").val(); },
          function() { return elDialog.find("div.error.account-confirm-password"); },
          function(value, handler) { handler(elDialog.find("input#password").val() !== value ? "confirmation password doesn't match" : null); }
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
          el.button({ disabled : false });
          /*
          return function() {
            if(validator.isValid()) {
              el.button("enable");
//              el.focus();
            } else {
              el.button("disable");
            }
          };
          */
        }

        login.toggle = createToggle("#account-login", login);
//        $(login).on("validation", login.toggle);
        $(login).on("validation", clearFormError);

        register.toggle = createToggle("#account-create", register);
//        $(register).on("validation", register.toggle);
        $(register).on("validation", clearFormError);

      elDialog.find("input#email")
        .keydown(function(e) {
          if(e.keyCode == 13) {
            e.preventDefault();
            return false;
          }
        })
        .keyup(function(e) {
          if(e.keyCode == 13) // enter
          {
            if(!$(this).val()) {
              // do nothing;
            } else if(!elDialog.find("input#password").val()) {
              elDialog.find("input#password").focus();
            } else {
              $(this).blur();
              return;
            }
            e.preventDefault();
            return false;
          }
        });

      elDialog.find("input:not(#email)")
        .keydown(function(e) {
          if(e.keyCode == 13) {
            e.preventDefault();
            return false;
          }
        })
        .keyup(function(e) {
          if(e.keyCode == 13) // enter
          {
            if(!$(this).val()) {
              console.log(currentToggle.button("option", "disabled"));
              // do nothing;
            } else {
              $(this).blur();
              console.log(currentToggle.button("option", "disabled"));
              if(!currentToggle.button("option", "disabled"))
                currentToggle.click();
              return;
            }
            e.preventDefault();
            return false;
          }

        });

        function wireLogin()
        {
          login.reset();
          elDialog.find("input#email").on("change blur", login.email.validate);
          elDialog.find("input#password").on("change blur keydown", login.password.validate);
        }
        function unwireLogin()
        {
          elDialog.find("input#email").off("change blur", login.email.validate);
          elDialog.find("input#password").off("change blur", login.password.validate);
        }
        function wireRegister()
        {
          register.reset();
          elDialog.find("input#email").on("change blur", register.email.validate);
          elDialog.find("input#password").on("change blur", register.password.validate);
          elDialog.find("input#account-confirm-password").on("change blur", register.confirmPassword.validate);
          elDialog.find("input#account-name").on("change blur", register.name.validate);
          elDialog.find("input#account-company").on("change blur", register.company.validate);
          elDialog.find("input#account-title").on("change blur", register.title.validate);
        }
        function unwireRegister()
        {
          elDialog.find("input#email").off("change blur", register.email.validate);
          elDialog.find("input#password").off("change blur", register.password.validate);
          elDialog.find("input#account-confirm-password").off("change blur", register.confirmPassword.validate);
          elDialog.find("input#account-name").off("change blur", register.name.validate);
          elDialog.find("input#account-company").off("change blur", register.company.validate);
          elDialog.find("input#account-title").off("change blur keydown", register.title.validate);
        }

        var currentToggle;
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
              currentToggle = elDialog.find("#account-create");
              break;
            case "login":
              recoverPanel.show();
              wireLogin();
              currentToggle = elDialog.find("#account-login");
              break;
          }
        }
        elDialog.find("input.choose-ui").change(updateForm);

        var email = $.cookie("Precog_eMail");
        if(email) { // TODO replace condition with email is present
          elDialog.find("input.choose-ui[value=\"login\"]").attr("checked", true);
          elDialog.find("input#email").val(email);
        } else
          elDialog.find("input.choose-ui[value=\"create\"]").attr("checked", true);
        updateForm();

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });

      function buildUrl(host, analyticsService, apiKey, basePath)
      {
        var url = host + "?apiKey=" + encodeURIComponent(apiKey) + "&basePath=" + encodeURIComponent(basePath);
        if(analyticsService)
          url += "&analyticsService=" + encodeURIComponent(analyticsService);
        return url;
      }

      function getHost()
      {
        return window.location.href.split("?").shift();
      }

      function formError(msg) {
        elDialog.find("#form-error .error").html(msg).show();
      }

      function clearFormError() {
        elDialog.find("#form-error .error").hide();
      }

      function goToLabcoat(email, apiKey, basePath) {
        $.cookie("Precog_eMail", email);
        var url = buildUrl(
          getHost(),
          precog.config.analyticsService,
          apiKey,
          basePath
        );
        elDialog.find("form").submit();
        setTimeout(function() {
          window.location = url;
        }, 100);
      }

      function describeAndLogin(email, password, accountId)
      {
        window.Precog.describeAccount(email, password, accountId,
          function(data) {
            goToLabcoat(email, data.apiKey, data.rootPath);
          },
          function(err) {
            elDialog.find("#account-login").button("enable");
            formError("password is incorrect");
          }
        );
      }

      function actionLogin(email, password)
      {
        elDialog.find("#account-login").button("disable");
        window.Precog.findAccount(email,
          function(accountId) {
            describeAndLogin(email, password, accountId);
          },
          function(err) {
            elDialog.find("#account-login").button("enable");
            formError("account not found for " + email);
          }
        );
      }

      function actionCreate(email, password, profile)
      {
        elDialog.find("#account-create").button("disable");
        window.Precog.findAccount(
          email,
          function() {
            elDialog.find("#account-create").button("enable");
            formError("a user is already registered with the email " + email)
          },
          function(_) {
            window.Precog.createAccount(email, password,
              function(data) {
                describeAndLogin(email, password, data.accountId);
//                goToLabcoat(email, data.apiKey, data.rootPath);
              },
              function(err) {
                elDialog.find("#account-create").button("enable");
                formError("failed to create an account: " + err);
              },
              {
                profile : profile
              }
            )
          }
        );
      }

      elDialog.find("#account-login").click(function(e) {
        e.preventDefault();
        login.validate();
        if(!login.isValid())
          return false;
        actionLogin(
          elDialog.find("input#email").val(),
          elDialog.find("input#password").val()
        );
        return false;
      });

      elDialog.find("#account-create").click(function(e) {
        e.preventDefault();
        register.validate();
        if(!register.isValid())
          return false;

        actionCreate(
          elDialog.find("input#email").val(),
          elDialog.find("input#password").val(),
          {
            title   : elDialog.find("input#account-title").val(),
            name    : elDialog.find("input#account-name").val(),
            company : elDialog.find("input#account-company").val()
          }
        );
        return false;
      });

      elDialog.find("#reset-password").click(function(e) {
        e.preventDefault();
        var email = elDialog.find("input#email").val().trim();
        if(!email) {
          formError("you need to provide an email to be able to reset your password");
          return false;
        }
        $(this).hide();
        window.Precog.requestResetPassword(email,
          function(data) {
            alert(data);
          }, function(err) {
            formError("an error occurred trying to reset your password: " + err)
          });
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