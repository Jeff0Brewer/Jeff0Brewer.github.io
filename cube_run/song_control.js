var songname = document.getElementById("songname");
var songtime = document.getElementById("songtime");

var currsong = 0;
var songs = [new Song('songe.mp3',
					  'ODESZA - Divide (feat. Kelsey Bulkin)')];
songname.innerHTML = songs[currsong].name;

var song_controls = [
	document.getElementById('h0'),
	document.getElementById('h1'),
	document.getElementById('h2'),
	document.getElementById('h3'),
	document.getElementById('h4'),
	document.getElementById('h5')
];

function check_song_controls(){
	for(let i = 0; i < song_controls.length; i++){
		song_controls[i].className = song_controls[i].className.replace(' fade_out', '');
	}
}

function show_song_controls(){
	for(let i = 0; i < song_controls.length; i++){
		song_controls[i].className = song_controls[i].className.replace(' fade_in', '');
		song_controls[i].className = song_controls[i].className.replace(' fade_out', '');
		song_controls[i].className += ' fade_in';
	}
}

function hide_song_controls(){
	for(let i = 0; i < song_controls.length; i++){
		song_controls[i].className = song_controls[i].className.replace(' fade_in', '');
		song_controls[i].className = song_controls[i].className.replace(' fade_out', '');
		song_controls[i].className += ' fade_out';
	}
}

function Song(file, name){
	this.file = file;
	this.name = name;
}

function shuffle(array){
	var len = array.length;
	for(var i = 0; i < len; i++){
		var ind = Math.floor(Math.random()*(len - i)) + i;
		var temp = array[i]
		array[i] = array[ind];
		array[ind] = temp;
	}
}

var fData = [];
var audio = undefined;

function init_audio(){
	var AudioContext = window.AudioContext
		|| window.webkitAudioContext;

	var actx = new AudioContext();
	audio = new Audio(songs[currsong].file);
	var audioSrc = actx.createMediaElementSource(audio);
	analyser = actx.createAnalyser();
	analyser.fftSize = 4096;
	analyser.smoothingTimeConstant = .5;
	audioSrc.connect(analyser);
	audioSrc.connect(actx.destination);
	fData = new Uint8Array(analyser.frequencyBinCount);

	nextsong = function(paused){
		if(currsong < songs.length - 1){
			audio.pause();
			currsong++;
			songname.innerHTML = songs[currsong].name;

			audio = new Audio(songs[currsong].file);
			audioSrc = actx.createMediaElementSource(audio);
			audioSrc.connect(analyser);
			audioSrc.connect(actx.destination);
			if(!paused)
				audio.play();
			return true;
		}
		return false;
	}

	prevsong = function(paused){
		if(currsong > 0){
			audio.pause();
			currsong--;
			songname.innerHTML = songs[currsong].name;

			audio = new Audio(songs[currsong].file);
			audioSrc = actx.createMediaElementSource(audio);
			audioSrc.connect(analyser);
			audioSrc.connect(actx.destination);
			if(!paused)
				audio.play();
			return true;
		}
		return false;
	}
}

file_button = document.getElementById('filebutton');

filebutton.onmouseenter = function(){ this.style.opacity = .85; }
filebutton.onmouseleave = function(){ this.style.opacity = 1; }
filebutton.onmousedown = function(){ this.style.opacity = .7; }
filebutton.onmouseup = function(){ this.style.opacity = .85; }

file_in = document.getElementById('openfile');

file_in.oninput = function(){
	var files = this.files;
	if(files.length != 0){
		if(files.length > 1)
			show_song_controls();
		else if(songs.length > 1)
			hide_song_controls();

		songs = [];
		for(var i = 0; i < files.length; i++){
			songs.push(new Song(URL.createObjectURL(files[i]), files[i].name.substring(0,files[i].name.lastIndexOf("."))));
		}
		shuffle(songs);

		if(audio == undefined)
			init_audio();

		currsong = -1;
		nextsong(audio.paused);

		songname.innerHTML = songs[currsong].name;
		songtime.innerHTML = '0:00';
	}
	
}
