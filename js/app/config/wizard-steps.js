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
            $(step.target).closest("a").one("click", function() {
              goto("upload_file")
            });
          },
          position : ["left center", "right center"]
        },
        load_data = {
          name   : "load_data",
          step   : 6,
          target : null,
          text   : "Double click on a data file to load its content.<br>You can also select it and click on the 'lightning bolt' button above.",
          width: 300,
          height: 90,
          init : function (goto, step, value) {
            $(step.ctx.folders).one("querypath", function() {
              goto("save_query");
            });
          },
          position : ["left center", "right center"]
        };
    return [
      {
        name : "welcome",
        step : null,
        target : ".pg-labcoat",
        text : 'Welcome to Labcoat! Follow this small tutorial to find out how to load your data in Labcoat and run your first query<br><a href="#">continue</a>',
        position : ["center", "center"],
        width: 300,
        height: 80,
        init : function(goto, step) {
          $(this).find("a").click(function (e) {
            e.preventDefault();
            goto("select_root");
            return false;
          });
        }
      }, {
        name   : "select_root",
        step   : 1,
        target : ".pg-labcoat .pg-folders .pg-tree .pg-root .jstree.jstree-default:first-child ins",
        text   : "start creating a folder where you will store your data. Click on the root path",
        width: 300,
        height: 70,
        position : ["left+10 center", "right center"],
        init : function (goto, step) {
          $('.pg-labcoat .pg-folders .pg-root a').one("click", function() {
            goto("create_folder")
          });
        }
      }, {
        name   : "create_folder",
        step   : 2,
        target : ".pg-labcoat .pg-folders .ui-icon-new-folder",
        text   : "click on the 'create new folder' button",
        width: 300,
        height: 50,
        init : function (goto, step) {
          $(step.target).closest("button").one("click", function() {
            goto("#hide");

            function poll() {
              console.log("do we have the dialog? " + !!$('.pg-el.ui-dialog').length);

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
                  load_data.target = '.pg-labcoat .pg-folders .pg-tree li[data="'+li.attr("data")+'/[records]"] a';
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
        position : ["center top", "center bottom"],
        init : function(goto, step, value) {
          $(step.target).closest("button").one("click", function() {
console.log("UPLOAD CLICKED");
            goto("#hide");

            var started = false;
            function start() {
              started = true;
            }
            $(step.ctx.folders).on("uploadStart", start);
            function poll() {
              if(!$('.pg-el.ui-dialog').length) {
                setTimeout(poll, 100);
                return;
              }
              var o = $(step.ctx.folders);
              o.one("uploadStart", start);
              o.one("uploadComplete", complete);
              o.one("uploadError", error);

              function clear() {
                o.off("uploadStart", start);
                o.off("uploadComplete", complete);
                o.off("uploadError", error);
              }
              function complete() {
                clear();
                goto("upload_success");
              }
              function error() {
                clear();
                goto("upload_failure");
              }

              $('.pg-el.ui-dialog').one("dialogclose", function() {

                if(!started) {
                  clear();
                  goto("upload_file");
                  return;
                }
              });
            }

            poll();

          });
        }
      }, {
        name   : "upload_success",
        step   : 5,
        target : ".pg-labcoat .pg-results",
        text   : 'Great, it seems like your data was successfully uploaded! Have a look at the results below and <a href="#">click here</a> to continue.',
        width: 300,
        height: 85,
        position : ["center bottom", "center top"],
        init : function (goto, step) {
          $(this).find("a").click(function(e) {
            e.preventDefault();
            goto("load_data");
            return false;
          });
        }
      }, {
        name   : "upload_failure",
        step   : null,
        target : ".pg-labcoat .pg-results",
        text   : 'Oh nooo! Something went wrong uploading your data. Be sure that the file you tried to upload is a valid CSV (with headers) or JSON file. Have a look at the results below and <a href="#">click here</a> to try uploading your data again.',
        width: 300,
        height: 140,
        position : ["center bottom", "center top"],
        init : function (goto, step) {
          $(this).find("a").one("click", function(e) {
            e.preventDefault();
            goto("upload_file");
            return false;
          });
        }
      },
      load_data, {
        step   : 7,
        name   : "save_query",
        target : ".pg-labcoat .pg-editor .ui-icon-disk",
        text   : 'Congratulations, you just executed your first query! Clicking on the above button will save the query in the query manager so that you can easily reload it.',
        width: 300,
        height: 140,
        position : ["center top", "center bottom"],
        init : function (goto, step) {
          $(step.target).closest("button").one("click", function() {
            goto("the_end");
            return false;
          });
        }
      }, {
        step   : 8,
        name   : "the_end",
        target : ".pg-labcoat",
        text   : 'Well, this is all. You can now have a look at the tutorials on the right and start writing your custom queries to analyze your data.<br><a href="#">close tutorial</a>',
        width: 300,
        height: 120,
        position : ["center center", "center center"],
        init : function (goto, step) {
          $(this).find("a").one("click", function(e) {
            e.preventDefault();
            goto("#end");
            return false;
          });
        }
      }
    ];
  };
});

// TODO request double click or select and click on lightning bolt to query all

// TODO request save query

// TODO display where saved queries are stored and mention double-click to open

// TODO ask for autogenerating queries

// TODO ship it