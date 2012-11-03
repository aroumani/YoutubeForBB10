window.appRootDirName = "download_mp";
document.addEventListener("deviceready", onDeviceReady, false);

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
}


downloadFile = function(url, fname){
    var fileTransfer = new FileTransfer();

    var filePath = window.appRootDir.fullPath + "/" + fname + ".mp3";

    //alert('try:'+ filePath); 
    fileTransfer.download(
        url,
        filePath,
        function(entry) {
            alert("download complete: " + entry.fullPath);
        },
        function(error) {
            alert("download error" + error.source);
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
      
	player = new YT.Player('player', {
	});
	
	
	$('#two').live('pagehide',function(event, ui){
		player.stopVideo();
	});
	
	 $(document).ajaxError(function(event, request, setting) 
{ 
                    alert('fuckk...');
         }); 
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

function download(videoID){


	
	$.mobile.allowCrossDomainPages = true;
	//queue converstion
		
		$.getScript('http://www.youtube-mp3.org/api/pushItem/?item=http%3A//www.youtube.com/watch?v='+videoID, function() {});
		//alert('test');
		$.getScript('http://www.youtube-mp3.org/api/itemInfo/?video_id='+videoID, function() {
			console.log(info.h);
			console.log("http://www.youtube-mp3.org/get?video_id=wA4ppvp2IzY&h="+info.h);
			alert(info.h);
			if (info != null){
				//window.open("http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h);
				downloadFile("http://www.youtube-mp3.org/get?video_id="+videoID+"&h="+info.h, info.title.replace(/ /g,"_"));
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
		html += ('<li data-videoid="'+video.videoId+'" ><a href="#two" onclick="loadVideo(\''+video.videoId+'\');" ><img src="'+video.thumbs[3].url+'" /><h3>'+video.title+'</h3><p></p></a>'+
			 '<a class="dlLink" href="#popup" data-role="button" data-rel="dialog" data-transition="pop">Download MP#</a></li>');
	}
	$("#videoList").html(html);
	$("#videoList").listview("refresh");
	
	$("#videoList").find(".dlLink").hide('slow', function(){
		checkForDownload($(this).parent("li").jqmData("videoid"), $(this));
	});
		
	$("#videoList a.ui-li-link-alt").live("click", function(e){
		download($(this).parent("li").jqmData("videoid"));
	});
	});
	
	

}