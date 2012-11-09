window.appRootDirName = "download_mp";
document.addEventListener("deviceready", onDeviceReady, false);
var lock=false;
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


downloadFile = function(atr, url, fname){
    var fileTransfer = new FileTransfer();

    var filePath = window.appRootDir.fullPath + "/" + fname + ".mp3";

	$('#dl_toast').toast('show');
    //alert('try:'+ filePath); 
    fileTransfer.download(
        url,
        filePath,
        function(entry) {
		alert('Download Complete for: ' + fname + ".mp3" + ' File saved to: [' + filePath +']');
        },
        function(error) {
		  alert('An error occurd while trying to download: ' + fname + ".mp3" + ' Attempted to save file saved to: [' + filePath +']');
        }
    );
}


$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
	$.mobile.buttonMarkup.hoverDelay=0;
	
	$.mobile.loader.prototype.options.text = "loading";
  $.mobile.loader.prototype.options.textVisible = false;
  $.mobile.loader.prototype.options.theme = "a";
  $.mobile.loader.prototype.options.html = "";
    
    
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
	
}


function download(atr, videoID){


	
	$.mobile.allowCrossDomainPages = true;
	//queue converstion
		
		$.getScript('http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v='+videoID, function() {});
		//alert('test');
		$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id='+videoID, function() {
			//console.log(info.h);
			//alert(info.h);
			if (info != null){
				//window.open("http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h);
				downloadFile(atr, "http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h, info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase());
			}else{
				//alert('Video Cannot Be Downloaded...');
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
		
		
			//console.log(info);
			//console.log("http://www.youtube-mp3.org/get?video_id=wA4ppvp2IzY&h="+info.h);
			if (info != null){
				el.show();
				info=null;
			}else{
				//alert('Video Cannot Be Downloaded...');
			}
				
		});
	
	return true;
	
}

// Audio player
var mediaPlaying=false;
var my_media = null;
var mediaTimer = null;
var cur_song=0;

function pauseAudio(){
	if (my_media){
		my_media.pause();
		$("#playPauseButtonID").jqmData('icon','arrow-r');
		$("#playPauseButtonID .ui-icon").addClass("ui-icon-arrow-r").removeClass("ui-icon-delete");
		mediaPlaying=false;
	  }
}

function resumeAudio(){
	if (my_media){
		mediaPlaying=true;
		$("#playPauseButtonID").jqmData('icon','delete');
		$("#playPauseButtonID .ui-icon").addClass("ui-icon-delete").removeClass("ui-icon-arrow-r");
		my_media.play();
	  }
}

function nextSong(forward){
	stopAudio();
	if (forward){
		cur_song++;
	}else{
		cur_song--;
	}
	
	getSong(cur_song, function(json){
		if (json){
			playAudio(json.path, json.title, cur_song);
		}else{
			alert('end of list reach..');
			if (forward){
				cur_song=-1;
			}else{
				cur_song=1;
			}
			nextSong(forward);
		}
	});
}

function stopAudio(){
	if (my_media){
		mediaPlaying=false;
		$("#playPauseButtonID").jqmData('icon','arrow-r');
		$("#playPauseButtonID .ui-icon").addClass("ui-icon-arrow-r").removeClass("ui-icon-delete");
		my_media.stop();
	  }
}

function playPauseAudio() {
	if (my_media){
		if(mediaPlaying){
			pauseAudio();
		}else{
			resumeAudio();
		}
	  }
}
function playAudio(src, name, num) {

		alert('play!');
		alert(src);
		alert(name);
		alert(num);
		$("#songName").html(name);
		
		cur_song=num;
		alert('stopping..');
           // Create Media object from src
	    stopAudio();
	    
		my_media = new Media(src, function(){}, function(){}, function status(constant){
			if (constant==Media.MEDIA_STOPPED){
				alert('stoped');
				if (mediaPlaying){
					nextSong(true);
				}
			}
		});

		// Update media position every second
		var mediaTimer = setInterval(function() {
			// get media position
			my_media.getCurrentPosition(
				// success callback
				function(position) {
					if (position > -1) {
						$('#songSlider').val(""+(position/my_media.getDuration() * 100));
						$('#songSlider').slider('refresh');
					}
				},
				// error callback
				function(e) {
					console.log("Error getting pos=" + e);
				}
			);
		}, 1000);
	
		// Play audio
		resumeAudio();
}

function getNumSongs(callback){
	function dirsRead(entries) {
		callback(entries.length);
	}
	
	function fail(error) {
		alert("Failed to list directory contents: " + error.code);
		callback(null);
	}
	
	// Get a directory reader
	var directoryReader = window.appRootDir.createReader();

	// Get a list of all the entries in the directory
	directoryReader.readEntries(dirsRead,fail);
}

function getSong(num, callback){
	function dirsRead(entries) {
	    var i;
	    for (i=0; i<entries.length; i++) {
			if (i==num){
				callback("{'path':'"+entries[i].fullPath  +"', 'title':'"+entries[i].name+"'}");
			}
	    }
		callback(null);
	}
	
	function fail(error) {
		alert("Failed to list directory contents: " + error.code);
		callback(null);
	}
	
	// Get a directory reader
	var directoryReader = window.appRootDir.createReader();

	// Get a list of all the entries in the directory
	directoryReader.readEntries(dirsRead,fail);
}

function refresh(){

	function dirsRead(entries) {
	    var html="";
	    var i;
	    for (i=0; i<entries.length; i++) {
		alert("playAudio(\''+entries[i].fullPath+'\', \''+ entries[i].name +'\', ' + i + ');");
		html += ('<li data-icon="arrow-r" data-videoid="'+entries[i].fullPath+'" ><a href="#" onclick="playAudio(\''+entries[i].fullPath+'\', \''+ entries[i].name +'\', ' + i + ');" ><h2>'+entries[i].name+'</h2></a>'+
				'</li>');
	    }
	    
	    $("#musicList").html(html);
	    $("#musicList").listview("refresh"); 
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
	alert(uri);
	try{
		navigator.app.loadUrl(uri, { openExternal:true });
	}catch(ex){
		alert('Exception loading URL: ' + uri);
	}
}

function search(){
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
		//console.log(video);
		
		html += ('<li data-icon="plus" data-videoid="'+video.videoId+'" ><a onclick="watchVideo(\''+video.videoId+'\');"class="watchVideo" href="#"><img style"vertical-align: middle;" width="120px" height="90px" src="'+video.thumbs[1].url+'" /><h2>'+video.title+'</h2><p><i>'+video.viewCount+' views</i><br/>'+video.description+'</p></a>'+
			 '<a class="dlLink" href="#" data-role="button" data-rel="dialog" data-transition="pop">Download MP3</a>'+
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
		    'prompt' : 'Are you sure?',
		    'useModal': true,
		    'buttons' : {
		      'Download': {
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
	});
	
	

}