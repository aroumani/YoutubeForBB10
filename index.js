window.appRootDirName = "download_mp";
document.addEventListener("deviceready", onDeviceReady, false);
var lock=false;
var songLock=false;
var curSong=null;
var playing=false;
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

function resumeAudio(){
	if (my_media){
		if (playing){
			playing=false
			my_media.pause();
			$("#playPauseOption").attr("src","play.png");
		}else{
			playing=true;
			my_media.play();
			$("#playPauseOption").attr("src","play.png");
		}
		
	  }
}

function stopAudio() {
	if (my_media){
		playing=false;
		my_media.stop();
		$("#songSlider").attr('disabled','true');
		$("#playPauseOption").attr("src","play.png");
		my_media.release();
		my_media=null;
	  }
}

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
			playAudio(entries[i].fullPath);
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

function nextSong(){
	curSong++;
	playAudioByNum(curSong);
}

function prevSong(){
	curSong--;
	playAudioByNum(curSong);
}

function setupSlider(){
	if (my_media){
		$("#songSlider").live("change", function() {
			var songVal = $(this).val();
			my_media.seekTo(songVal/100 * my_media.getDuration());
		});
		
		
		my_media.getCurrentPosition(
			// success callback
			function(position) {
				if (position > -1) {
					var posInt = (position/my_media.getDuration() * 100);
					
					$('#songSlider').val(posInt);
					alert(posInt);
					$('#songSlider').slider('refresh');
				}
			},
			// error callback
			function(e) {
				console.log("Error getting pos=" + e);
			}
		);
	}
}
function playAudio(src) {
	
		if (songLock){return;}
		else{
			songLock=true;
			var t=setTimeout(function(){songLock=false;},1000);
		}
            // Create Media object from src
	    stopAudio();
	    playing=true;
	    
            my_media = new Media(src, function(){
		if (playing)
		{
			alert('next song');
			nextSong();
		}
	    }, function(medError){});
	
	    
	    // Update media position every second
	    if(!mediaTimer){
		alert('setting timer');
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
	    alert('playing');
	    $("#playPauseOption").attr("src","pause.png");
	    alert('pause');
	    $("#songSlider").removeAttr('disabled');
	    alert('playing now..');
            my_media.play();
	    $("#songStatus").html("<p>Playing: ["+src+"]</p>");
}


function refresh(){

	function dirsRead(entries) {
	    var html="";
	    var i;
	    for (i=0; i<entries.length; i++) {
		html += ('<li data-icon="arrow-r" data-videoid="'+entries[i].fullPath+'" ><a href="#" onclick="playAudioByNum('+i+');" ><h2>'+entries[i].name+'</h2></a>'+
		//html += ('<li data-icon="arrow-r" data-videoid="'+entries[i].fullPath+'" ><a href="#" onclick="playAudio(\''+entries[i].fullPath+'\');" ><h2>'+entries[i].name+'</h2></a>'+
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