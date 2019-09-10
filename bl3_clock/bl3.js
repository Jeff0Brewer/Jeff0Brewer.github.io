let clock = document.getElementById('clock');
let bl3_time = new Date(2019, 8, 12, 22, 0, 0, 0);

set_clock();
set_size();
setInterval(set_clock, 1000);

function set_clock(){
	let ms = bl3_time - (new Date());
	let s = parseInt(ms/1000);
	let m = parseInt(s/60);
	let h = parseInt(m/60);
	let d = parseInt(h/24);
	s -= m*60;
	m -= h*60;
	h -= d*24;
	clock.innerHTML = d.toString() + ':' + h.toString() + ':' + m.toString() + ':' + s.toString();
}

function set_size(){
	let w = window.innerWidth*.2;
	let h = window.innerHeight*.4;
	clock.style.fontSize = w < h ? w.toString() + 'px' : h.toString + 'px';
}


function resize(){
	set_size();
}