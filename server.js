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

// wwwディレクトリを静的ファイルディレクトリとして登録
app.use(express.static('www'));

// サーバを開始
server.listen(process.env.PORT || 3000);

// 次の動画idをplayに送信する
function sendNextVideoId(){
	io.emit('timeZero', '');
	if(playList.length==0){
		io.emit('nextVideoId', 'zzcWPu7dxSw');
	} else {
		var video = playList.shift()
		io.emit('nextVideoId', video.id);
		histryList.push(video);
		io.emit('playList', {playList:playList, historyList:histryList});
	}
}

// 動画の情報を取得する
function getVideoData(video){
	
	var videoId;
	
	var a = video.match(/(https:\/\/www.youtube.com\/watch\?)(.*)v=([^&]*)/);
	console.log("a:" + a);
	
	if(a){
		videoId = a[3];
	} else{
		videoId = video;
	}
	
	var json;
	var options = {
		url: 'https://www.googleapis.com/youtube/v3/videos?' + 'id=' + videoId + '&key=' + 'AIzaSyAgsw-_vsAqdwjltVav4HmJfyKq4MsTKys' + '&part=' + 'snippet,contentDetails,statistics,status', 
		json: true
	};

	request.get(options, function (error, response, json) {
		if(json.items.length > 0) {
			playList.push(json.items[0]);
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
	socket.on('volume', function(volume){
		console.log(volume);
		io.emit('volume', volume);
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
	
	socket.on('delete', function(del){
		playList.splice(del,1);
		io.emit('playList', {playList:playList, historyList:histryList});
	});
	
	socket.on('update', function(update){
		io.emit('playList', {playList:playList, historyList:histryList});
	});
	
});