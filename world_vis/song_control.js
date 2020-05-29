var songname = document.getElementById("songname");
var songtime = document.getElementById("songtime");

var currsong = 0;
var songs = [new Song('songe.mp3',
					  'COSMIC - Sensei')];
songname.innerHTML = songs[currsong].name;

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

let fftSize = 4096;
var fData = new Uint8Array(4);
var audio = undefined;

function init_audio(){
	var AudioContext = window.AudioContext
		|| window.webkitAudioContext;

	var actx = new AudioContext();
	audio = new Audio(songs[currsong].file);
	var audioSrc = actx.createMediaElementSource(audio);
	analyser = actx.createAnalyser();
	analyser.fftSize = fftSize;
	fData = new Uint8Array(analyser.frequencyBinCount);
	analyser.smoothingTimeConstant = .75;
	audioSrc.connect(analyser);
	audioSrc.connect(actx.destination);

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

	checkbuttons = function(){
		if(currsong == 0){
			backsong.style.pointerEvents = "none";
			backsong.style.opacity = clickopacity;
		}
		else{
			backsong.style.pointerEvents = "auto";
			backsong.style.opacity = 1;
		}
		if(currsong == songs.length - 1){
			skipsong.style.pointerEvents = "none";
			skipsong.style.opacity = clickopacity;
		}
		else{
			skipsong.style.pointerEvents = "auto";
			skipsong.style.opacity = 1;
		}
		if(audio.paused){
			pause_symbol.style.visibility = "hidden";
			play_symbol.style.visibility = "visible";
		}
		else{
			play_symbol.style.visibility = "hidden";
			pause_symbol.style.visibility = "visible";
		}
	}
}

file_button = document.getElementById('file_in');

file_button.onmouseenter = function(){ this.style.opacity = .85; }
file_button.onmouseleave = function(){ this.style.opacity = 1; }
file_button.onmousedown = function(){ this.style.opacity = .7; }
file_button.onmouseup = function(){ this.style.opacity = .85; }

file_in = document.getElementById('file_in');

file_in.oninput = function(){
	var files = this.files;
	if(files.length != 0){
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
var clickopacity = .7;
var hoveropacity = .85;
var menu = document.getElementById("menu");

menu.onmouseenter = function(){
	menu.className = menu.className.replace("hiding", "showing");
}

menu.onmouseleave = function(){
	if(menu.className.indexOf("showing") == -1)
		menu.className += " hiding";
	else
		menu.className = menu.className.replace("showing", "hiding");
}

var file_in = document.getElementById("file_in");
var filebutton = document.getElementById("filebutton");

file_in.onchange = function(){
	var files = this.files;
	if(files.length != 0){
		songs = [];
		for(var i = 0; i < files.length; i++){
			songs.push(new Song(URL.createObjectURL(files[i]),
								files[i].name.substring(0,files[i].name.lastIndexOf("."))));
		}
		shuffle(songs);

		currsong = -1;
		nextsong(audio.paused);
	}
}

filebutton.onmouseenter = function(){ filebutton.style.opacity = hoveropacity; }
filebutton.onmousedown = function(){ filebutton.style.opacity = clickopacity; }
filebutton.onmouseleave = function(){ filebutton.style.opacity = 1; }
filebutton.onmouseup = function(){ filebutton.style.opacity = hoveropacity; }

var playpause = document.getElementById("playpause");
var play_symbol = document.getElementById("play_symbol");
var pause_symbol = document.getElementById("pause_symbol");

playpause.onmouseenter = function(){ play_symbol.style.opacity = hoveropacity;
									 pause_symbol.style.opacity = hoveropacity; }
playpause.onmousedown = function(){ play_symbol.style.opacity = clickopacity;
									pause_symbol.style.opacity = clickopacity; }
playpause.onmouseleave = function(){ play_symbol.style.opacity = 1;
									 pause_symbol.style.opacity = 1; }
playpause.onmouseup = function(){
	play_symbol.style.opacity = hoveropacity;
	pause_symbol.style.opacity = hoveropacity;
	if(audio.paused){
		audio.play();
		play_symbol.style.visibility = "hidden";
		pause_symbol.style.visibility = "visible";
	}
	else{
		audio.pause();
		pause_symbol.style.visibility = "hidden";
		play_symbol.style.visibility = "visible";
	}
}

var backsong = document.getElementById("backsong");

backsong.onmouseenter = function(){ backsong.style.opacity = hoveropacity; }
backsong.onmousedown = function(){ backsong.style.opacity = clickopacity; }
backsong.onmouseleave = function(){
	if(backsong.style.pointerEvents !== "none")
		backsong.style.opacity = 1;
}
backsong.onmouseup = function(){
	backsong.style.opacity = hoveropacity;
	prevsong(audio.paused);
}

var skipsong = document.getElementById("skipsong");

skipsong.onmouseenter = function(){ skipsong.style.opacity = hoveropacity; }
skipsong.onmousedown = function(){ skipsong.style.opacity = clickopacity; }
skipsong.onmouseleave = function(){
	if(skipsong.style.pointerEvents !== "none")
		skipsong.style.opacity = 1;
}
skipsong.onmouseup = function(){
	skipsong.style.opacity = hoveropacity;
	nextsong(audio.paused);
}

var gitbutton = document.getElementById("gitbutton");

gitbutton.onmouseenter = function(){ gitbutton.style.opacity = hoveropacity; }
gitbutton.onmousedown = function(){ gitbutton.style.opacity = clickopacity; }
gitbutton.onmouseleave = function(){ gitbutton.style.opacity = 1; }
gitbutton.onmouseup = function(){ gitbutton.style.opacity = 1; }
