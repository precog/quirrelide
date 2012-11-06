define([

],

function() {
  var config = {
      disableUpload : $('head script[data-labcoat-disable-upload]').attr("data-labcoat-disable-upload") === "true",
      disableDownload : $('head script[data-labcoat-disable-download]').attr("data-labcoat-disable-download") === "true"
  };

console.log(config);

  return config;
});