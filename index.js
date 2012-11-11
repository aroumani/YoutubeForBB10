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

    //alert('try:'+ filePath); 
    fileTransfer.download(
        url,
        filePath,
        function(entry) {
		alert('Download Complete for: ' + fname + ".mp3");
        },
        function(error) {
		  alert('An error occurd while trying to download: ' + fname + ".mp3");
        }
    );
}


$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
    
    
});


var info=null;
var player=null;
function pageLoad(){

	$('#two').live('pagehide',function(event, ui){
		player.stopVideo();
	});
	
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
	
	//player.loadVideoById(videoId:String, startSeconds:Number, suggestedQuality:String)
	//player.stopVideo()
	
}

function loadVideo(videoID){

//wA4ppvp2IzY

//http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v=3U72hzeBLOw
//http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v=wA4ppvp2IzY&r=1351652598093
//http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch%3Fv%3DwA4ppvp2IzY&xy=yx&bf=false&r=1351652598093
//wA4ppvp2IzY

//http://www.youtube-mp3.org/api/itemInfo/?video_id=wA4ppvp2IzY&ac=www&r=1351652598222
//info = { "title" : "One and Only - Adele (Lyrics)", "image" : "http://i.ytimg.com/vi/wA4ppvp2IzY/default.jpg", "length" : "5", "status" : "serving",  "progress_speed" : "",  "progress" : "",  "ads" : "",  "pf" : "http://d27e.u.aclst.com/ping.php?video_id=wA4ppvp2IzY&h=1040",  "h" : "8e61d58bf57d57021c631c02a219af3b"  }

//http://www.youtube-mp3.org/get?video_id=wA4ppvp2IzY&h=8e61d58bf57d57021c631c02a219af3b&r=1351652598334

	player.loadVideoById(videoID);//, startSeconds:Number, suggestedQuality:String)
	
	return true;
}

function download(atr, videoID){


	
	$.mobile.allowCrossDomainPages = true;
	//queue converstion
		
		$.getScript('http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v='+videoID, function() {});
		//alert('test');
		$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id='+videoID, function() {
			console.log(info.h);
			//alert(info.h);
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
				alert('Video Cannot Be Downloaded...');
			}
				
		});
	
	return true;
	
}

// Audio player
var my_media = null;
var mediaTimer = null;

function pauseAudio(){
	if (my_media){
		my_media.pause();
	  }
}

function resumeAudio(){
	if (my_media){
		my_media.play();
	  }
}

function stopAudio() {
	if (my_media){
		my_media.stop();
	  }
}
function playAudio(src) {
            // Create Media object from src
	    stopAudio();
	    
            my_media = new Media(src, function(){}, function(){alert('failed to load');});

            // Play audio
            my_media.play();
}


function refresh(){

	function dirsRead(entries) {
	    var html="";
	    var i;
	    for (i=0; i<entries.length; i++) {
		html += ('<li data-icon="plus" data-videoid="'+entries[i].fullPath+'" ><a href="#" onclick="playAudio(\''+entries[i].fullPath+'\');" ><h2>'+entries[i].name+'</h2></a>'+
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
		console.log(video);
		
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
	});
	
	

}