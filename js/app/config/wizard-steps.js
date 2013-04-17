define([

],

function() {

  return function createWizardSteps() {
    var select_folder = {
      name   : "select_folder",
      step   : 3,
      target : null,
      text   : "now select your newly created folder",
      width: 300,
      height: 50,
      init : function (goto, step, value) {
        $(step.target).one("click", function() {
          goto("upload_file")
        });
      },
      position : ["left center", "right center"]
    };
    return [
      {
        name : "welcome",
        step : null,
        target : ".pg-labcoat",
        text : '<p>Welcome to Labcoat! Follow this small tutorial to find out how to load your data in Labcoat and make your first queries</p><p><button class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left ui-corner-right" role="button" aria-disabled="false"><span class="ui-button-text">continue</span></button></p>',
        position : ["center", "center"],
        width: 300,
        height: 150,
        init : function(goto, step) {
          $(this).find("button").click(function () { goto("select_root"); });
        }
      }, {
        name   : "select_root",
        step   : 1,
        target : ".pg-labcoat .pg-folders .pg-tree .pg-root .jstree.jstree-default:first-child ins",
        text   : "start creating a folder where you will store your data. Click on the root path",
        width: 300,
        height: 70,
        init : function (goto, step) {
          $('.pg-labcoat .pg-folders .pg-root a').one("click", function() {
            goto("create_folder")
          });
        },
        position : ["left+10 center", "right center"]
      }, {
        name   : "create_folder",
        step   : 2,
        target : ".pg-labcoat .pg-folders .ui-icon-new-folder",
        text   : "click on the 'create new folder' button",
        width: 300,
        height: 50,
        init : function (goto, step) {
          $(step.target).one("click", function() {
            goto("#hide");

            function poll() {
              if(!$('.pg-el.ui-dialog').length) {
                setTimeout(poll, 100);
                return;
              }
              $('.pg-el.ui-dialog').one("dialogclose", function() {
                var value = ($(this).find(".pg-error:visible").length) ? null : $(this).find("#pg-input-lineinput").val();
                if(!value) {
                  goto("create_folder");
                } else {
                  var li = $('.pg-labcoat .pg-folders li').filter(function() {
                    return value == $(this).attr("data").split("/").pop();
                  });
                  select_folder.target = '.pg-labcoat .pg-folders .pg-tree li[data="'+li.attr("data")+'"] a';
                  goto("select_folder");
                }
              });
            }

            poll();
          });
        },
        position : ["left-36 top", "right bottom"]
      },
      select_folder,
      {
        name : "upload_file",
        step : 4,
        target : ".pg-labcoat .pg-folders .ui-icon-arrowthickstop-1-n",
        text : "click on the upload file button and choose one of your files to upload",
        width : 250,
        height : 80,
        position : ["center top", "center bottom"]
      }
    ];
  };
});