// IFrame Player API の読み込み
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var socket = io();

socket.on('nextVideoId', function(videoId){
	ytPlayer.loadVideoById(videoId);
});

// コントローラ部分
socket.on('play', function(play){
	ytPlayer.playVideo();
});
socket.on('pause', function(play){
	ytPlayer.pauseVideo();
});
socket.on('mute', function(play){
	// トグルる
	if(ytPlayer.isMuted()) {
		// ミュートの解除
		ytPlayer.unMute();
	} else {
		// ミュート
		ytPlayer.mute();
	}
});
socket.on('volume', function(volume){
	ytPlayer.setVolume(volume);
});


function getNextVideoId(){
	socket.emit('next','');
}

// YouTubeの埋め込み
function onYouTubeIframeAPIReady() {
	ytPlayer = new YT.Player(
		'yt', // 埋め込む場所の指定
		{
			width: 640, // プレーヤーの幅
			height: 390, // プレーヤーの高さ
			videoId: 'zzcWPu7dxSw', // YouTubeのID
			// イベントの設定
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange // プレーヤーの状態が変更されたときに実行
			},
			// プレーヤーの設定
			playerVars: {
				autoplay: 1,
				controls:0,
			},
		}
	);
}

// プレーヤーの準備ができたとき
function onPlayerReady(event) {
	getNextVideoId();
}

// プレーヤーの状態が変更されたとき
function onPlayerStateChange(event) {
	// 現在のプレーヤーの状態を取得
	var ytStatus = event.data;

	// 再生終了したとき
	if (ytStatus == YT.PlayerState.ENDED) {
		getNextVideoId();
	}
	// 再生中のとき
	if (ytStatus == YT.PlayerState.PLAYING) {
	}
	// 停止中のとき
	if (ytStatus == YT.PlayerState.PAUSED) {
	}
	// バッファリング中のとき
	if (ytStatus == YT.PlayerState.BUFFERING) {
	}
	// 頭出し済みのとき
	if (ytStatus == YT.PlayerState.CUED) {
	}
}