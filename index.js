$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
    
    
});

var player=null;
function pageLoad(){
      
	player = new YT.Player('player', {
	});
	
	
	$('#two').live('pagehide',function(event, ui){
		player.stopVideo();
	});
	
	//player.loadVideoById(videoId:String, startSeconds:Number, suggestedQuality:String)
	//player.stopVideo()
}

function loadVideo(videoID){
	player.loadVideoById(videoID);//, startSeconds:Number, suggestedQuality:String)
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
		html += ('<li><a href="#two" onclick="loadVideo(\''+video.videoId+'\');" ><img src="'+video.thumbs[3].url+'" /><h3>'+video.title+'</h3><p></p></a>'+
			 '<a href="#download" data-rel="popup" data-position-to="window" data-transition="pop">Download MP3</a></li>');
	}
	$("#videoList").html(html);
	$("#videoList").listview("refresh");
	});

}