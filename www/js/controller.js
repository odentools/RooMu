var socket = io();
var videoTime = 0;
	
$(document).ready(function(){

	socket.emit('update','');
	
	// 動画idを送信
	$('#send').on('click',function(){
		socket.emit('add',$('#url').val());
		$('#url').val("");
	});

	$('#url').keypress( function ( e ) {
		if ( e.which == 13 ) {
			socket.emit('add',$('#url').val());
			$('#url').val("");
		}
	} );

	$('#play').on('click',function(){
		socket.emit('play','');
	});

	$('#pause').on('click',function(){
		socket.emit('pause','');
	});

	$('#mute').on('click',function(){
		socket.emit('mute','');
	});

	$('#next').on('click',function(){
		socket.emit('next','');
	});

	$('#volume').on('input',function(){
		socket.emit('volumeOn',$(this).val());
	});

	$('#volume').change(function(){
		socket.emit('volumeChange',$(this).val());
	});

	$('#up').on('click',function(){
		if ($('input[name=q2]:checked').val())
			socket.emit('up',$('input[name=q2]:checked').val());
	});

	$('#down').on('click',function(){
		if ($('input[name=q2]:checked').val())
			socket.emit('down',$('input[name=q2]:checked').val());
	});

	$('#mostUp').on('click',function(){
		if ($('input[name=q2]:checked').val())
			socket.emit('mostUp',$('input[name=q2]:checked').val());
	});

	$('#mostDown').on('click',function(){
		if ($('input[name=q2]:checked').val())
			socket.emit('mostDown',$('input[name=q2]:checked').val());
	});

	$('#delete').on('click',function(){
		if ($('input[name=q2]:checked').val())
			socket.emit('delete',$('input[name=q2]:checked').val());
	});
	
	$('#update').on('click',function(){
		socket.emit('update','');
	});

	socket.on('playList', function(list){
		setPlayListTable(list.playList);
		setHistoryListTable(list.historyList);
		showPlaing(list.nowVideo);
	});
	
	socket.on('timeZero', function(){
		videoTime = 0;
	});
	
	socket.on('volumeChange', function(volume){
		$('#volume').val(volume);
	});
	
});

// playListのテーブルの作成
function setPlayListTable(playList){
	$('#playList table').empty();
		for (var arr in playList){
			$('#playList table').append($('<tr>').append( '<td><input class="point" type="radio" name="q2" value="'+arr+'"><td><img src="'+playList[arr].snippet.thumbnails.default.url+'"> <td>Title: ' + playList[arr].snippet.title + '<br>ID: ' + playList[arr].id + '<br>Time: ' + playList[arr].contentDetails.duration));
		}
}

// playListのテーブルの作成
function setHistoryListTable(historyList){
	$('#historyList table').empty();
		for (var arr in historyList){
			$('#historyList table').append($('<tr>').append( '<td><input class="point" type="radio" name="q2" value="'+arr+'"><td><img src="'+historyList[arr].snippet.thumbnails.default.url+'"> <td>Title: ' + historyList[arr].snippet.title + '<br>ID: ' + historyList[arr].id + '<br>Time: ' +historyList[arr].contentDetails.duration));
		}
}


function showPlaing(playing){
	console.log(playing);
	if(playing){
		$('#playing table').empty();
		$('#playing table').append($('<tr>').append( '<td><img src="'+playing.snippet.thumbnails.high.url+'"> <td>Title: ' + playing.snippet.title + '<br>ID: ' + playing.id + '<br>Time: ' +playing.contentDetails.duration));
	}
}