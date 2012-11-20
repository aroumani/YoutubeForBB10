window.appRootDirName = "download_mp";
document.addEventListener("deviceready", onDeviceReady, false);
var lock=false;
var lock5=false;
var songLock=false;
var curSong=null;
var playing=false;
var autoMove=false;
function onDeviceReady() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}

function fail() {
    console.log("failed to get filesystem");
}

function gotFS(fileSystem) {
    window.fileSystem = fileSystem;
    fileSystem.root.getDirectory(window.appRootDirName, {
        create : true,
        exclusive : false
    }, dirReady, fail);
}

function dirReady(entry) {
    window.appRootDir = entry;
    //$("#fileLoc").html(entry.fullPath);
}

function showModal(str){
  $("body").append('<div class="modalWindow"/>');
  $.mobile.showPageLoadingMsg("b", str);
}

function hideModal(){
 $(".modalWindow").remove();
  $.mobile.hidePageLoadingMsg();

}

downloadFile = function(atr, url, fname){

    
    try{
    var fileTransfer = new FileTransfer();

    var filePath = window.appRootDir.fullPath + "/" + fname + ".mp3";
    showModal("Starting Download ["+filePath+"]");
    
    
    fileTransfer.download(
        url,
        filePath,
        function(entry) {
		hideModal();
		alert('Download Complete for: ' + fname + ".mp3");
        },
        function(error) {
		hideModal();
		alert('An error occurd while trying to download: ' + fname + ".mp3");
        }
    );
    }catch(ex){
	hideModal();
	alert("Error: " + ex);
    }
}


$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
    //$.mobile.defaultDialogTransition = 'none';
    //$.mobile.defaultPageTransition = 'none';
    
    
});


var info=null;
function pageLoad(){

	 $(document).ajaxError(function(event, request, setting) 
{ 
                    alert('fuckk...');
         }); 
	 
	 $("#searchField").keypress(function(e) {
	  if(e.keyCode == 13)
	     {
		 e.preventDefault();
		 search();
	     }
	}).focus();
	
	
	$('#music').live( 'pageshow',function(event, ui){
		refresh();
		
		$( "#songSlider" ).on( 'slidestart', function( event ) { autoMove=true; });
		$( "#songSlider" ).on( 'slidestop', function( event ) { 
			var songVal = $(this).val();
			alert(songVal);
			alert(event.target.value);
			my_media.seekTo(songVal/100.0 * my_media.getDuration());
			autoMove=false; 
		});
	});
	//player.loadVideoById(videoId:String, startSeconds:Number, suggestedQuality:String)
	//player.stopVideo()
	
	$("#lnkDialog").click();
}

function popupClose(agree){

	$.mobile.changePage('#search'); 
	if (agree){
		search();
	}else{
		alert("You should quit this application...");
	}
}

function download(atr, videoID){

	$.mobile.allowCrossDomainPages = true;
	//queue converstion
		
		$.getScript('http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v='+videoID, function() {});
		$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id='+videoID, function() {
			if (info != null){
				//window.open("http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h);
				downloadFile(atr, "http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h, info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase());
			}else{
				alert('Video Cannot Be Downloaded...');
			}
				
		});
	return true;
}

function checkForDownload(videoID, el){

	$.mobile.allowCrossDomainPages = true;
	//queue converstion
		$.getScript('http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v='+videoID, function() {});
		$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id='+videoID, function() {
		//$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id=Ki86x1WKPmE', function() {
		
		
			console.log(info);
			//console.log("http://www.youtube-mp3.org/get?video_id=wA4ppvp2IzY&h="+info.h);
			if (info != null){
				el.show();
				info=null;
			}else{
			}
				
		});
	
	return true;
	
}

// Audio player
var my_media = null;
var mediaTimer = null;

function play(){
	my_media.play();
	$("#playPauseOption").attr("src","pause.png");
	$("#songState").html("Playing: ");
}

function pause(){
	my_media.pause();
	$("#playPauseOption").attr("src","play.png");
	$("#songState").html("Stopped: ");
}
function resumeAudio(){
	if (my_media){
		if (playing){
			playing=false
			pause();
		}else{
			playing=true;
			play();
		}
		
	  }
}

function stopAudio() {
	if (my_media){
		playing=false;
		my_media.stop();
		$('#songSlider').slider('disable');
		$("#playPauseOption").attr("src","play.png");
		$("#songState").html("Stopped: ");
		my_media.release();
		my_media=null;
		
		$('#songSlider').val(0);
		$('#songSlider').slider('refresh');
		$('#songTime').html("[0:00 of 00:00]");
					
	  }
}

var firstTime=true;
function playAudioByNum(index){
	
	function dirsRead(entries) {
	    var html="";
	    var i;
	    
	    if (index>=entries.length){
		index=0;
	    }else if (index<0){
		index=entries.length-1;
	    }
	    
	    for (i=0; i<entries.length; i++) {
		if (i==index){
			curSong=index;
			playAudio(entries[i].fullPath, entries[i].name, i, firstTime);
			if (firstTime){
				firstTime=false;
			}
			return;
		}
	    }
	}
	
	function fail(error) {
		alert("Failed to list directory contents: " + error.code);
	}
	
	// Get a directory reader
	var directoryReader = window.appRootDir.createReader();

	// Get a list of all the entries in the directory
	directoryReader.readEntries(dirsRead,fail);
}

var lock1=false;
var lock2=false;
function nextSong(){
	if (lock1){return;}
	else{
		lock1=true;
		var t=setTimeout(function(){lock1=false;},350);
	}
	curSong++;
	playAudioByNum(curSong);
}

function prevSong(){
	if (lock2){return;}
	else{
		lock2=true;
		var t=setTimeout(function(){lock2=false;},350);
	}
	curSong--;
	playAudioByNum(curSong);
}

function zeroOut(str){
	if (str.length==1){
		return "0" + str;
	}
	return str;
}
function setupSlider(){
	if (my_media){
		my_media.getCurrentPosition(
			// success callback
			function(position) {
				if (position > -1)
				{
					if (my_media && my_media.getDuration() != 0){
						var posInt = (position/my_media.getDuration() * 100);
						if (!autoMove){
							$('#songSlider').val(posInt);
							$('#songSlider').slider('refresh');
						}
						$('#songTime').html("["+zeroOut(Math.floor(position / 60)) + ":" + zeroOut((position % 60).toFixed(0)) + " of " + 
						zeroOut(Math.floor(my_media.getDuration() / 60)) + ":" + zeroOut((my_media.getDuration() % 60).toFixed(0))+"]");
					}
				}
			},
			// error callback
			function(e) {
				console.log("Error getting pos=" + e);
			}
		);
	}
}
function playAudio(src, name, num, startPlay) {
	
		if (songLock){return;}
		else{
			songLock=true;
			var t=setTimeout(function(){songLock=false;},300);
		}
            // Create Media object from src
	    stopAudio();
	    playing=true;
	    
            my_media = new Media(src, function(){
		if (playing)
		{
			nextSong();
		}
	    }, function(medError){});
	
	    
	    // Update media position every second
	    if(!mediaTimer){
		mediaTimer = setInterval(function() {
			// get media position
			setupSlider();
		}, 1000);
	    }else{
		clearInterval(mediaTimer);
		mediaTimer = setInterval(function() {
			// get media position
			setupSlider();
		}, 1000);
	    }
            // Play audio
	    playing=true;
	    $("#playPauseOption").attr("src","pause.png");
	    $('#songSlider').slider('enable');
            my_media.play();
	    
	    $("#songState").html("Playing: ");
	    if (name.length >15){
		name = name.substring(0,15)+"...";
	    }
	    $("#songStatus").html("<p>("+num+") "+name+"</p>");
}

function deleteSong(path){
	function success(file) {
		try{
			file.remove();
			refresh();
		}catch(ex){
			alert('Could not delete file... ' + ex);
		}	
	}

	function fail(error) {
	    alert("Failed to retrieve file: " + error.code);
	}

	alert("Trying to delete: " + path);
	// Retrieve an existing file, or create it if it does not exist
	window.appRootDir.getFile(path, {create: false, exclusive: false}, success, fail);
}

function refresh(){

	function dirsRead(entries) {
	    var html="";
	    var i;
	    for (i=0; i<entries.length; i++) {
		//html += ('<li data-icon="arrow-r" data-videoid="'+entries[i].fullPath+'" ><a href="#" onclick="playAudioByNum('+i+');" ><h3>('+i+') ' + entries[i].name+'</h3></a>'+'</li>');
		
		html += ('<li data-icon="minus" data-videoid="'+entries[i].name+'" ><a onclick="playAudioByNum('+i+');" href="#"><h3>('+i+') ' + entries[i].name+'</h3></a>'+
			 '<a href="#" data-theme="e" data-role="button" data-rel="dialog" data-transition="pop">Delete</a>'+
			 '</li>');
			 
		/*html += ('<li data-icon="minus" data-videoid="'+entries[i].fullPath+'" ><a href="' +entries[i].fullPath+'"><h3>('+i+') ' + entries[i].fullPath+'</h3></a>'+
			 '<a style="display:none" class="dlLink" href="#" data-theme="e" data-role="button" data-rel="dialog" data-transition="pop">Delete</a>'+
			 '</li>');*/
	    }
	    
	    $("#musicList").html(html);
	    $("#musicList").listview("refresh"); 
	    
	    $("#musicList a.ui-li-link-alt").live("click", function(e){
		if (lock5){return;}
		else{
			lock5=true;
			var t=setTimeout(function(){lock5=false;},1000);
		}
		$(this).simpledialog({
		    'mode' : 'bool',
		    'prompt' : 'Delete?',
		    'useModal': true,
		    'buttons' : {
		      'OK': {
			click: function () {
				deleteSong($(this).parent("li").jqmData("videoid"));
			}
		      },
		      'Cancel': {
			click: function () {
			},
			icon: "delete",
			theme: "c"
		      }
		    }
		  });
	  });
	}
	
	function fail(error) {
		alert("Failed to list directory contents: " + error.code);
	}
	
	// Get a directory reader
	var directoryReader = window.appRootDir.createReader();

	// Get a list of all the entries in the directory
	directoryReader.readEntries(dirsRead,fail);
	
	
}

function watchVideo(videoID){
	var uri="http://www.youtube.com/watch?v="+videoID;
	try{
		navigator.app.loadUrl(uri, { openExternal:true });
	}catch(ex){
		alert('Exception loading URL: ' + uri);
	}
}

function search(){

	showModal("Searching for videos...");
	 
	var q=$("#searchField").val();
	jQTubeUtil.search(q, function(response){
	var html = "";
	for(v in response.videos){
		var video = response.videos[v]; // this is a 'friendly' YouTubeVideo object
		
		/*<li><a href="index.html">	
				<img src="images/album-af.jpg" />
				<h3>The Suburbs</h3>
				<p>Arcade Fire</p>
				</a><a href="#purchase" data-rel="popup" data-position-to="window" data-transition="pop">Purchase album</a>
			</li>*/	
		console.log(video);
		
		html += ('<li data-icon="plus" data-videoid="'+video.videoId+'" ><a onclick="watchVideo(\''+video.videoId+'\');"class="watchVideo" href="#"><img style"vertical-align: middle;" width="120px" height="90px" src="'+video.thumbs[1].url+'" /><h2>'+video.title+'</h2><p><i>'+video.viewCount+' views</i><br/>'+video.description+'</p></a>'+
			 '<a style="display:none" class="dlLink" href="#" data-theme="e" data-role="button" data-rel="dialog" data-transition="pop">Download MP3</a>'+
			 '</li>');
	}
	$("#videoList").html(html);
	$("#videoList").listview("refresh"); 
	
	$("#videoList").find(".dlLink").hide('slow', function(){
		checkForDownload($(this).parent("li").jqmData("videoid"), $(this));
	});
	

	
	$("#videoList a.ui-li-link-alt").live("click", function(e){
		if (lock){return;}
		else{
			lock=true;
			var t=setTimeout(function(){lock=false;},1000);
		}
		$(this).simpledialog({
		    'mode' : 'bool',
		    'prompt' : 'Are You Sure?',
		    'useModal': true,
		    'buttons' : {
		      'OK': {
			click: function () {
				download($(this), $(this).parent("li").jqmData("videoid"));
			}
		      },
		      'Cancel': {
			click: function () {
			},
			icon: "delete",
			theme: "c"
		      }
		    }
		  });
	});
		hideModal();
	});
	
	

}