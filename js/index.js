// JavaScript Document 

document.addEventListener("deviceready", onDeviceReady, true);
//document.addEventListener("backbutton",	onBackBtn, false);

var siteURL = "http://onlineapps.solutions/pkessay";
var clientURL = siteURL+'/api.php';
//var siteURL = "http://pkessays.com";
//var clientURL = siteURL+'/api/api.php';
var appSecret = "aa0ad0a593817fe89de0c8acd21cec43"; // md5 of PKEssayAPI
//var userName = "";
//var passWord = "";
var userName = window.localStorage.getItem("userName");
var passWord = window.localStorage.getItem("passWord");
var userID = false;
var jTypes = '';
//userID = 10;

//var fileURL = '';
//var appDir = 'filedoup';
//var appFilesDir = 'cdvfile://localhost/persistent/'+appDir;
var $input;

//$(document).ready(function(e){
function onDeviceReady(){
	$input = $('.input__field');
	$input.each(function(){
		if($input.val().trim() !== '')
		{
			var $parent = $input.parent().parent();
			$parent.addClass('input--filled');
		}
	});
	
	$input.on('focus', onInputFocus);
	$input.on('blur', onInputBlur);


	
	if(device.platform == 'iOS')
	{
		StatusBar.overlaysWebView(false);
		StatusBar.styleDefault();
	}
	
	if(userName === null)
	{
		userName = '';
	}
	if(passWord === null)
	{
		passWord = '';
	}
	$("#si_username").val(userName);
	$("#si_password").val(passWord);
	
	if(userName != '' && passWord != '')
	{
		$("#si_remember").prop("checked", true);
		$("label[for=si_remember]").removeClass("ui-checkbox-off").addClass("ui-checkbox-on");
		$("#si_username").closest('div.input').addClass('input--filled');
		$("#si_password").closest('div.input').addClass('input--filled');
	}
	
	$("input[type=checkbox]#si_remember").click(function(e) {
		userName = '';
		passWord = '';
		var si_username = $.trim($("#si_username").val());
		var si_password = $.trim($("#si_password").val());
		if($(this).prop("checked") == true)
		{
			if(si_username != '' && si_password != '')
			{
				console.log("checkbox true");
				userName = si_username;
				passWord = si_password;
				window.localStorage.setItem("userName", userName);
				window.localStorage.setItem("passWord", passWord);
			}
		}
		else
		{
			console.log("checkbox false");
			window.localStorage.removeItem("userName");
			window.localStorage.removeItem("passWord");
		}
	});
	
	$("#j_ddate").on("focus", function(){showDatePicker("#j_ddate", true);});
	
	$("#signin_frm").submit(function(e) {
		e.preventDefault();
		if(checkConnection())
		{
			loginUser();
		}
		return false;
	});
	
	$("#signup_frm").submit(function(e) {
		e.preventDefault();
		if(checkConnection())
		{
			signupUser();
		}
		return false;
	});
	
	$("#job_frm").submit(function(e) {
		e.preventDefault();
		if(checkConnection())
		{
			addJob();
		}
		return false;
	});
	
	
	$(document).on("pagebeforeshow", '[data-role="page"]', function() {
		if($(this).attr('id')!="signin_pg" && $(this).attr('id')!="signup_pg")
		{
			if(!userID)
			{
				logoutUser('Login Expired.');
			}
		}
		
		if($(this).attr('id')=="main_pg")
		{
			$("#main_msg").html('&nbsp;');
			getJobStatus();
		}
		else if($(this).attr('id')=="job_pg")
		{
			$("#j_type").html(jTypes);
			$("#j_type").selectmenu( "refresh" );
			
			
			
			
			$("#up_file_p").hide();
			$("#up_file_p_bar").html('%nbsp;').css("width", '0');
			$("#up_file_msg").html('&nbsp;');
			$("#up_file_progress").html('&nbsp;');
			$("#up_file_url").html('&nbsp;');
			fileURL = '';
		}
		else if($(this).attr('id')=="list_pg")
		{
			$("#job_list").html('');
			$("#jobs_last_id").val('');
			getJobs();
			$("#jobs_load_more").show();
		}
	});
}//);

function loginUser()
{
	$("#signin_msg").html('&nbsp;');
	var si_username = $.trim($("#si_username").val());
	var si_password = $.trim($("#si_password").val());
	if(si_username == '' || si_password == '')
	{
		$("#signin_msg").html('Both EMAIL and PASSWORD must be provided.');
		return false;
	}
	userName = si_username;
	passWord = si_password;
	
	if($("input[type=checkbox]#si_remember").prop("checked") == true)
	{
		if(userName != '' && passWord != '')
		{
			console.log("checkbox true");
			window.localStorage.setItem("userName", userName);
			window.localStorage.setItem("passWord", passWord);
		}
	}
	else
	{
		console.log("checkbox false");
		window.localStorage.removeItem("userName");
		window.localStorage.removeItem("passWord");
	}
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		data: "type=loginUser&secret="+appSecret+"&email="+userName+"&password="+passWord, 
		success: function(res)
		{
			if(res.result == 'success')
			{
				userID = res.data.userID;
				getAssignTypes();
				$("body").pagecontainer("change", "#main_pg");
			}
			else
			{
				$("#signin_msg").html(res.message);
			}
		}
	}); 
}

function signupUser()
{
	$("#signup_msg").html('&nbsp;');
	var su_name = $.trim($("#su_name").val());
	var su_username = $.trim($("#su_username").val());
	var su_phone = $.trim($("#su_phone").val());
	var su_password = $.trim($("#su_password").val());
	if(su_name == '' || su_username == '' || su_phone == '' || su_password == '')
	{
		$("#signup_msg").html('All fields are necessary.');
		return false;
	}
	userName = su_username;
	passWord = su_password;
	
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		data: "type=signupUser&secret="+appSecret+"&name="+su_name+"&email="+userName+"&phone="+su_phone+"&password="+passWord, 
		success: function(res)
		{
			if(res.result == 'success')
			{
				userID = res.data.userID;
				getAssignTypes();
				$('#signup_frm').trigger("reset");
				$("body").pagecontainer("change", "#main_pg");
				/*$("body").pagecontainer("change", "#sign_pg");
				$("#signup_msg").html("Sign Up Successfull. Please login to continue.");*/
			}
			else
			{
				$("#signup_msg").html(res.message);
			}
		}
	}); 
}

function getJobStatus()
{	
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		data: "type=getJobStatus&secret="+appSecret+"&userID="+userID, 
		success: function(res)
		{
			if(res.result == 'success')
			{
				$("#status_p").html(res.data.t_pending);
				$("#status_c").html(res.data.t_completed);
				$("#status_t").html(res.data.t_total);
			}
		}
	}); 
}

function getAssignTypes()
{	
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		data: "type=getAssignTypes&secret="+appSecret, 
		success: function(res)
		{
			if(res.result == 'success')
			{
				jTypes = res.data.j_type;
			}
		}
	}); 
}

function addJob()
{
	$("#job_msg").html('&nbsp;');
	var j_title = $.trim($("#j_title").val());
	var j_type = $.trim($("#j_type").val());
	var j_ddate = $.trim($("#j_ddate").val());
	var j_description = $.trim($("#j_description").val());
	if(j_title == '' || j_type == '' || j_ddate == '' || j_description == '')
	{
		$("#job_msg").html('All fields are necessary.');
		return false;
	}
	
	$("#div_job_frm, #job_frm_submit").hide();
	$("#div_job_loader").show();
	var formData = new FormData($("#job_frm")[0]);                     
	formData.append('type', 'addJob');
	formData.append('secret', appSecret);
	formData.append('userID', userID);
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		//data: "type=addJob&secret="+appSecret+"&j_title="+j_title+"&j_type="+j_type+"&j_ddate="+j_ddate+"&j_description="+j_description+"&userID="+userID, 
		data: formData, 
		processData: false, //prevent jQuery from converting your FormData into a string
		contentType: false, //jQuery does not add a Content-Type header for you
		success: function(res)
		{
			if(res.result == 'success')
			{
				//uploadFile(res.jobID);
				$('#job_frm').trigger("reset");
				$("body").pagecontainer("change", "#main_pg");
				$("#main_msg").html("Job Added Successfully.");
			}
			else
			{
				$("#job_msg").html(res.message);
			}
			$("#div_job_loader").hide();
			$("#div_job_frm, #job_frm_submit").show();
		}
	}); 
}

function uploadFile(jobID)
{
	if($.trim(fileURL) != '')
	{
		$("#up_file_msg").html('Starting Upload');
		$("#up_file_p").show();
		var ftOptions = new FileUploadOptions();
		ftOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/')+1);
		
		var params = {};
		params.type = "upload";
		params.secret = appSecret;
		params.jobID = jobID;
		
		ftOptions.params = params;
	
		var ft = new FileTransfer();
		ft.onprogress = function(progressEvent)
		{
			var file_prog = $("#up_file_progress");
			if (progressEvent.lengthComputable)
			{
				var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
				file_prog.html('Uploading '+perc+' %');
				$("#up_file_p_bar").html(perc+' %').css("width", perc+'%');
			}
			else
			{
				if($.trim(file_prog.html()) != '')
				{
					file_prog.html('Uploading');
				}
				else
				{
					file_prog.append('.');
				}
			}
		}
		ft.upload(fileURL, encodeURI(clientURL), ftUpSuccess, ftUpError, ftOptions, true);
	}
}

function ftUpSuccess(ftRes)
{
	showAlert("Code = " + ftRes.responseCode+"\nResponse = " + ftRes.response+"\nSent = " + ftRes.bytesSent, null, 'FT Success Alert', 'OK');
	$("#up_file_msg").html('Upload Successful');
	$("#up_file_progress").html('&nbsp;');
	$("#up_file_url").html('&nbsp;');
	fileURL = '';
}

function ftUpError(ftRes)
{
	showAlert("Code = " + ftRes.code+"\nSource = " + ftRes.source+"\nTarget = " + ftRes.target, null, 'FT Error Alert', 'OK');
	$("#up_file_msg").html('Upload Error');
	$("#up_file_progress").html('&nbsp;');
	$("#up_file_url").html('&nbsp;');
	fileURL = '';
}

function selectFile()
{
	$("#up_file_url").html('&nbsp;');
	/*window.plugins.mfilechooser.open(
		[],
		function (url)
		{
			fileURL = url;
			$("#up_file_url").html(fileURL);
		},
		function (error)
		{
			fileURL = '';
			showAlert(error, null, 'File Selection Alert', 'OK');
			$("#up_file_url").html('Selection Error');
		}
	);
	var utis = ["public.content", "public.data", "public.text", "public.utf8-plain-text", "public.rtf", "public.image", "public.movie", "public.audiovisual-​content", "public.audio"];
	FilePicker.pickFile(
		function (url)
		{
			fileURL = url;
			$("#up_file_url").html(fileURL);
		},
		function (error)
		{
			fileURL = '';
			showAlert(error, null, 'File Selection Alert', 'OK');
			$("#up_file_url").html('Selection Error');
		},
		utis);
		*/
	FilePicker.pickFile(
		function (url)
		{
			fileURL = url;
			$("#up_file_url").html(fileURL);
		},
		null);
}

function getJobs()
{
	$("#list_msg").html('&nbsp;');
	var last_id = $.trim($("#jobs_last_id").val());
	
	jQuery.support.cors = true; 
	$.ajax({ 
		url: clientURL,
		crossDomain: true,
		type: 'post',
		data: "type=getJobs&secret="+appSecret+"&last_id="+last_id+"&userID="+userID, 
		success: function(res)
		{
			if(res.result == 'success')
			{
				if(res.count > 0)
				{
					$("#job_list").append(res.job_list);
					$("#jobs_last_id").val(res.lastID);
				}
				else
				{
					$("#jobs_load_more").hide();
				}
			}
			else
			{
				$("#list_msg").html(res.message);
			}
		}
	}); 
}

function approveJob(jobID)
{
	if(jobID != '' && jobID != '0')
	{
		jQuery.support.cors = true; 
		$.ajax({ 
			url: clientURL,
			crossDomain: true,
			type: 'post',
			data: "type=approveJob&secret="+appSecret+"&jobID="+jobID+"&userID="+userID, 
			success: function(res)
			{
				if(res.result == 'success')
				{
					$("#res"+jobID).html(res.job_list);
				}
				else
				{
					$("#list_msg").html(res.message);
				}
			}
		});
	}
}

function downViewF(url, fileName, id)
{
	console.log(url);
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) {
			fileSystem.root.getFile(
			"dummy.html", {create: true, exclusive: false}, 
			function gotFileEntry(fileEntry) {
				var sPath = fileEntry.fullPath.replace("dummy.html","");
				var fileTransfer = new FileTransfer();
				fileEntry.remove();
	
				fileTransfer.download(
					url,
					targetPath = cordova.file.documentsDirectory + fileName,
					function(theFile) {
						console.log("got the file " + fileName);
						showLink(theFile.toURL(), id);
					},
					function(error) {
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("upload error code: " + error.code);
					}
				);
			}, fail);
		}, fail);
}

function showLink(url, id){
	console.log(url);
	var aElem = document.getElementById(id);
	aElem.removeAttribute("onclick");
	aElem.setAttribute("onclick", "ref = cordova.InAppBrowser.open('"+ url +"', '_blank', 'location=no'); ref.addEventListener('exit', exitwin);");
	aElem.innerHTML = "View File";
}

function exitwin() {
	StatusBar.hide();
	StatusBar.show();
	}

function fail(evt) {
   console.log(evt.target.error.code);
}

function filter_list()
{
	var list_search = $.trim($("#list_search").val());
	if(list_search != '')
	{
		$("#job_list > div > table.job_table td.description").each(function(k, v) {
			var check = RegExp(list_search, "i").test($(v).text());
			if(check)
			{
				$(v).closest('div').show();
			}
			else
			{
				$(v).closest('div').hide();
			}
		});
	}
	else
	{
		$("#job_list > div").each(function(k, v) {
			$(v).show();
		});
	}
}

function showDatePicker(field, hasTime)
{
	var d = new Date();
	var newDate = null;
	var options = {date: d, mode: 'datetime', androidTheme: 3};

	datePicker.show(options, 
		function(date)
		{
			newDate = formatDate(date, hasTime);
			$(field).val(newDate);
		}, 
		function(error)
		{
			var value = $.trim($(field).val());
			if(value == '')
			{
				newDate = formatDate(d, hasTime);
				$(field).val(newDate);
			}
		}
	);
	var $parent = field.closest('div.input');
 	$parent.addClass('input--filled');
	$(field).blur();
}

function formatDate(date, hasTime)
{
	var now = new Date(date);
	var year = "" + now.getFullYear();
	var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
	var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
	var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
	var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
	var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
	var nowDate = day + "-" + month + "-" + year;
	if(hasTime)
	{
		nowDate = day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second;
	}
	return nowDate;
}

function logoutUser(message)
{
	userName = "";
	passWord = "";
	userID = false;
	$("body").pagecontainer("change", "#signin_pg");
	$("#signin_msg").html(message);
}

function showAlert(message, callback, title, btnTxt)
{
	if(navigator.notification)
	{
		navigator.notification.alert(message, callback, title, btnTxt);
	}
	else
	{
		alert(message);
	}
}

function onBackBtn(e)
{
	e.preventDefault();
	closeApp();
}

function checkConnection()
{
	return true;
	var networkState = navigator.connection.type;
	var states = {};
	states[Connection.UNKNOWN]  = 'Unknown connection.';
	states[Connection.ETHERNET] = 'Ethernet connection.';
	states[Connection.WIFI]     = 'WiFi connection.';
	states[Connection.CELL_2G]  = 'Cell 2G connection.';
	states[Connection.CELL_3G]  = 'Cell 3G connection.';
	states[Connection.CELL_4G]  = 'Cell 4G connection.';
	states[Connection.CELL]     = 'Cell generic connection.';
	states[Connection.NONE]     = 'No network connection found.';
	if(networkState == 'none')
	{
		showAlert(states[networkState]+"\nPlease connect and try again.", null, 'Warning!', 'OK');
		return false;
	}
	return true;
}

function closeApp()
{
	navigator.app.exitApp();
}

function onInputFocus(event)
{
	var $target = $(event.target);
	var $parent = $target.closest('div.input');
	$parent.addClass('input--filled');
}

function onInputBlur(event)
{
	var $target = $(event.target);
	var $parent = $target.closest('div.input');
	if (event.target.value.trim() === '')
	{
		$parent.removeClass('input--filled');
	}
}
