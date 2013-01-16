define([
  // TODO needs cookie for email
  "app/util/iframesubmit"
],

function(submit) {
  var PAGE_ACTION = "actions/",
      FORM_ACTION = "/",
      wrapper,
      queue = [],
      email;

  function retrieve_email() {

  }

  return wrapper = {
    track_page : function(action) {
      submit({
        action : PAGE_ACTION + action,
        method : "get",
        complete : function() {
          console.log("Page Action Done: " + PAGE_ACTION + action);
        }
      });
    },
    track_form : function(action, params, user_message) {
      // TODO retrieve email
      // TODO
    }
  };
});
