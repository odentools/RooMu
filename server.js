/**
	server
**/
var express = require('express');
var request = require('request');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var playList = new Array();
var histryList = new Array();
var nowVideo = null;
var isLoop = true;
var nowVolume=50;

// wwwディレクトリを静的ファイルディレクトリとして登録
app.use(express.static('www'));

// サーバを開始
server.listen(process.env.PORT || 8081);

// 次の動画idをplayに送信する
function sendNextVideoId(){
	io.emit('timeZero', '');
	
	// 初回起動時は落とす
	if(playList.length == 0 && nowVideo == null &&  isLoop == true) {
		return;
	}
	if(playList.length==0){
		// ToDo: histryListを消去する仕様に変更したら落ちるようになる
		nowVideo = histryList[ Math.floor( Math.random() * histryList.length ) ]
		isLoop = true;
	} else {
		isLoop = false;
		nowVideo = playList.shift()
		histryList.push(nowVideo);
	}
	
	io.emit('nextVideoId', nowVideo.id);
	io.emit('playList', {playList:playList, historyList:histryList, nowVideo:nowVideo});
	
}

// 動画の情報を取得する
function getVideoData(video){
	
	var videoId;
	var videoMatch = (video.match(/v=([^&]*)/) || video.match(/youtu\.be\/([^&]*)/));
	if ( videoMatch ) {
		videoId = videoMatch[1];
	} else {
		videoId = video;
	}
	
	var options = {
		url: 'https://www.googleapis.com/youtube/v3/videos?' + 'id=' + videoId + '&key=' + 'AIzaSyA0yPvyvL2IKjRHAVvvNYQKFRafPwtzL8A' + '&part=' + 'snippet,contentDetails,statistics,status', 
		json: true
	};

	request.get(options, function (error, response, json) {
		console.log(json);
		if(json.items.length > 0) {
			playList.push(json.items[0]);
			if(isLoop == true) {
				console.log("isLoopがtrueだったから再生する");
				sendNextVideoId();
			}
		}
		io.emit('playList', {playList:playList, historyList:histryList});
		console.log(playList);
	});

}

io.on('connection', function (socket) {
	
	// URLの追加処理
	socket.on('add', function (msg) {
		console.log(msg);
		getVideoData(msg);
	});

	// コントローラ部分
	socket.on('play', function(play){
		io.emit('play', play);
	});
	socket.on('pause', function(pause){
		io.emit('pause', pause);
	});
	socket.on('mute', function(mute){
		io.emit('mute', mute);
	});
	socket.on('volumeOn', function(volume){
		io.emit('volumeOn', volume);
	});
	socket.on('volumeChange', function(volume){
		io.emit('volumeChange', volume);
		nowVolume = volume;
	});
	

	// play側とコントローラ側からの次の動画要求
	socket.on('next', function(play){
		sendNextVideoId();
	});

	socket.on('up', function(up){
		if( 0 < up && up < playList.length ){
			var tmp = playList[parseInt(up)];
			playList[parseInt(up)] = playList[parseInt(up)-1];
			playList[parseInt(up)-1] = tmp;
		}
		io.emit('playList', {playList:playList, historyList:histryList});
	});

	socket.on('down', function(down){
		if( 0 <=  parseInt(down) && parseInt(down) < playList.length-1 ){
			var tmp = playList[parseInt(down)+1];
			playList[parseInt(down)+1] = playList[parseInt(down)];
			playList[parseInt(down)] = tmp;
		}
		io.emit('playList', {playList:playList, historyList:histryList});
	});

	socket.on('mostUp', function(up){
		for ( var i = up; i > 0; i--) {
			if( 0 < i && i < playList.length ){
				var tmp = playList[parseInt(i)];
				playList[parseInt(i)] = playList[parseInt(i)-1];
				playList[parseInt(i)-1] = tmp;
			}
		}
		
		io.emit('playList', {playList:playList, historyList:histryList, nowVideo:nowVideo});
	});

	socket.on('mostDown', function(down){
		for ( var i = down, leni = playList.length; i < leni-1;i++) {
			if( 0 <=  parseInt(i) && parseInt(i) < playList.length-1 ){
				var tmp = playList[parseInt(i)+1];
				playList[parseInt(i)+1] = playList[parseInt(i)];
				playList[parseInt(i)] = tmp;
			}
		}
		io.emit('playList', {playList:playList, historyList:histryList, nowVideo:nowVideo});
	});

	socket.on('delete', function(del){
		playList.splice(del,1);
		io.emit('playList', {playList:playList, historyList:histryList, nowVideo:nowVideo});
	});
	
	socket.on('update', function(update){
		io.emit('playList', {playList:playList, historyList:histryList, nowVideo:nowVideo});
		io.emit('volumeChange', nowVolume);
	});
	
});