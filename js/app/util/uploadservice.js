define([

],

function() {
	var UPLOAD_SERVICE = "upload.php";
	
/*
progressHandlingFunction
beforeSendHandler
completeHandler
errorHandler
formData
*/
	function upload(path, file, type, complete, progress, error) {
		var reader = new FileReader();
		reader.onload = function(e) {
			console.log("file has been readed", e.target.result);
		};
		reader.readAsText(file);
		/*
		$.ajax({
			url: UPLOAD_SERVICE,  //server script to process data
			type: 'POST',
			xhr: function() {  // custom xhr
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ // check if upload property exists
					myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
				}
				return myXhr;
			},
			//Ajax events
			beforeSend: beforeSendHandler,
			success: completeHandler,
			error: errorHandler,
			// Form data
			data: formData,
			headers : {
//                          "Content-Type"     : "multipart/form-data"
				  "X-File-Name"      : filename
				, "X-File-Size"      : file.fileSize || file.size
				, "X-File-Type"      : file.type
				, "X-Precog-Path"    : path
				, "X-Precog-UUID"    : id
				, "X-Precog-Apikey"  : precog.config.apiKey
				, "X-Precog-Version" : precog.config.version
				, "X-Precog-Service" : precog.config.analyticsService
			},
			//Options to tell JQuery not to process data or worry about content-type
			cache: false,
			contentType: false,
			processData: false
		});
		*/
	}
	
	return {
		ingest : function(path, data, type, complete, progress, error) {
			upload(path, file, type, complete, progress, error);
		}
	}
});
