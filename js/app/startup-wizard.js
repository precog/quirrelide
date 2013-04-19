define([
      "app/util/notification"
    , "app/util/ui"
    , "app/util/storage"
    , "app/config/wizard-steps"
    , "rtext!templates/content.tip.main.html"
    , "rtext!templates/content.tip.codepane.html"
    , "rtext!templates/content.tip.filesystem.html"
    , "rtext!templates/content.tip.querybrowser.html"
    , "rtext!templates/content.tip.resultspane.html"
    , "rtext!templates/content.tip.supportpane.html"
],
function(notification, ui, createStore, createSteps, tplMain, tplCode, tplFileSystem, tplQueryBrowser, tplResultsPane, tplSupportPane) {
    return function(ctx) {
      var STORE_KEY = "pg-quirrel-wizard",
          store = createStore(STORE_KEY, {
            step : "welcome",
            dismissed : false
          }),
          current;

      store.set("step", "welcome"); // the_end

      if(store.get("dismissed"))
        return;

      var steps = createSteps();

      var $tip = $('<div class="pg-el pg-wizard"><div class="pg-frame"><div class="pg-content"></div></div><div class="pg-arrow"></div></div>').appendTo("body");
      $tip.hide();

      function displayStep(step, value) {
        var content = $tip.find(".pg-content"),
            arrow   = $tip.find(".pg-arrow");


        $tip.find(".pg-frame").css({
          "width" : (step.width || 200)+"px",
//          "height" : (step.height || 50)+"px"
        });

        content.html(step.text);

        var position = {
          my : (step.position[0] || "left top"),
          at : (step.position[1] || "right bottom"),
          of : step.target
        };

        $tip.position(position);
        arrow.removeClass("fade");
        var cls = position.my.replace(/[+-]\d+[%]?/g, '').split(" ").join("-");
        arrow.attr("class", "pg-arrow " + cls);
        if(cls != "center-center") {
          setTimeout(function() {
            arrow.addClass("fade");
          }, 500);
        }

        if(step.init) {
          step.ctx = ctx;
          step.init.call(content, goTo, step, value);
        }
      }

      function goTo(name, value) {
        /*
        if(name === null) {
          store.set("dismissed", true);
          $tip.remove();
          current = null;
          return;
        }
        store.set("step", name);
        */
        if(name === "#hide") {
          $tip.hide();
          return;
        } else if(name === "#end") {
console.log("END!");
          $tip.hide();
//          store.set("dismissed", true);
          return;
        }
        $tip.show();
        current = steps.filter(function(step) { return step.name == name; })[0];
        displayStep(current, value);
      }

      setTimeout(function() {
        $tip.show();
        goTo(store.get("step"));
        setTimeout(function() { $tip.addClass("transition"); }, 0);
      }, 1000);
    }
});