//object for controlling menu
var Menu = function(){
	this.m = document.getElementById('menu');
	this.fft = null;
	this.items = [];
	this.inds = [];
	this.selected_ind = -1;
	this.i_t = document.getElementById('item_template').cloneNode(true);
	this.i_t.classList.remove('hidden');
	this.i_t.childNodes[1].innerHTML = '';
	this.i_t.childNodes[3].classList.add('hidden');
	this.i_t.id = '';
	this.dragging = false;
	this.collapsed = false;
	this.mouse_over = true;
	this.selected_y = 0;
	this.scroll_state = 0;
	this.scroll_max = -1;
	this.menu_top = 0;
	this.collapse_time = {
		count: 0,
		max: 2000
	};
	this.f_b = document.getElementById('file_button');
	this.s_b = document.getElementById('scroll_bar');

	let menu = this;
	document.getElementById('file_input').onchange = function(){
		let files = this.files;
		if(files.length > 0){
			menu.clear_items();
			let inds = [];
			for(let i = 0; i < files.length; i++)
				inds.push(i);
			for(let i = 0; i < files.length; i++){
				let ind = inds.splice(Math.floor(Math.random()*inds.length), 1)[0];
				menu.add_item(files[ind].name.substring(0, files[ind].name.lastIndexOf('.')), URL.createObjectURL(files[ind]));
			}
			menu.select_item(0);
			menu.list_height = menu.s_l.getBoundingClientRect().height;
			menu.scroll_max = menu.s_l.scrollHeight - menu.list_height;
			menu.scroll_state = 0;
			menu.selected_y = 0;
			menu.uncollapse();
			menu.update_scroll();
		}
	}

	this.m.onmouseenter = function(){menu.mouse_over = true; if(menu.collapsed){menu.uncollapse();}}
	this.m.onmouseleave = function(){menu.mouse_over = false;}

	this.s_l = document.getElementById('song_list');
	this.list_height = this.s_l.getBoundingClientRect().height;
	this.s_l.onscroll = function(){
		menu.scroll_state = this.scrollTop;
		menu.update_scroll();
	};
}

//select an item in the list
Menu.prototype.select_item = function(i){
	if(i != this.selected_ind){
		if(this.selected_ind >= 0) {
			this.items[this.selected_ind][2].classList.remove('selected');
			this.items[this.selected_ind][2].childNodes[3].classList.add('hidden');
			if(this.items[this.selected_ind][2].childNodes[3].childNodes[1].classList.contains('hidden')){
				this.items[this.selected_ind][2].childNodes[3].childNodes[1].classList.remove('hidden')
				this.items[this.selected_ind][2].childNodes[3].childNodes[3].classList.add('hidden')
			}
		}
		this.selected_ind = i;
		this.items[i][2].classList.add('selected');
		this.items[i][2].childNodes[3].classList.remove('hidden');
		this.items[i][2].classList.remove('in');
		this.items[i][2].classList.remove('out');
		if(this.fft != null && this.fft.change_file(this.items[i][1])){
			this.items[i][2].childNodes[3].childNodes[1].classList.add('hidden');
			this.items[i][2].childNodes[3].childNodes[3].classList.remove('hidden');
		}
	}
}

//add a song with given name
Menu.prototype.add_item = function(name, file){
	let menu = this;
	let item = this.i_t.cloneNode(true);
	item.childNodes[1].innerHTML = name;
	item.classList.add('fade_in');
	item.onmouseenter = function(){
		this.childNodes[3].classList.remove('hidden');
	}
	item.id = this.items.length.toString();
	item.onmouseleave = function(){
		if(menu.selected_ind != parseFloat(this.id))
			this.childNodes[3].classList.add('hidden');
	}
	item.childNodes[3].id = item.id;
	item.childNodes[3].onmousedown = function(){
		if(this.childNodes[1].classList.contains('hidden')){
			if(menu.fft != null){
				this.childNodes[1].classList.remove('hidden');
				this.childNodes[3].classList.add('hidden');
				menu.fft.pause_audio();
			}
		}
		else{
			menu.select_item(parseFloat(this.id));
			if(menu.fft != null){
				this.childNodes[1].classList.add('hidden');
				this.childNodes[3].classList.remove('hidden');
				menu.fft.play_audio();
			}
		}
	}

	item.childNodes[7].onmousedown = function(e){
		menu.dragging = true;
		this.style.cursor = 'grabbing';
		if(menu.fft != null){
			let rect = this.getBoundingClientRect();
			let per = 100*(e.clientX - rect.left)/rect.width;
			menu.fft.set_progress(per);
			this.childNodes[1].style.width = per.toFixed(2) + '%';
		}
	}
	item.childNodes[7].onmouseup = function(){
		menu.dragging = false;
		this.style.cursor = 'grab';
	}
	item.childNodes[7].onmouseleave = function(){
		menu.dragging = false;
		this.style.cursor = 'grab';
	}
	item.childNodes[7].onmousemove = function(e){
		if(menu.dragging && menu.fft != null){
			let rect = this.getBoundingClientRect();
			let per = 100*(e.clientX - rect.left)/rect.width;
			menu.fft.set_progress(per);
			this.childNodes[1].style.width = per.toFixed(2) + '%';
		}
	}

	this.s_l.appendChild(item);
	this.items.push([name, file, item]);
}

//remove song with the given name
Menu.prototype.clear_items = function(){
	this.selected_ind = -1;
	this.items = [];
	while(this.s_l.firstChild){
		this.s_l.removeChild(this.s_l.firstChild);
	}
}

//add reference to fft object
Menu.prototype.attach_fft = function(fft){
	this.fft = fft;
}

//update the menu
Menu.prototype.update = function(elapsed){
	//update progress bar
	let per = this.fft == null ? 0 : this.fft.get_progress();
	this.items[this.selected_ind][2].childNodes[7].childNodes[1].style.width = per.toFixed(2) + '%';
	if(per >= 100){
		this.advance();
	}

	//collapse after set time without mouse
	this.collapse_time.count += !this.collapsed && !this.mouse_over ? elapsed : 0;
	if(this.collapse_time.count > this.collapse_time.max){
		this.collapse_time.count = 0;
		this.collapse();
	}

	//animate collapse and uncollapse
	if(this.collapsed){
		this.scroll_state = this.scroll_state*.9 + this.selected_y*.1;
		this.s_l.scrollTop = this.scroll_state;
		this.menu_top = this.scroll_max - this.scroll_state;
		if(this.menu_top > 0) 
			this.menu_top = 0;
		this.m.style.top = this.menu_top.toString() + 'px';
	}
	else{
		this.scroll_state = this.scroll_state > this.scroll_max ? this.scroll_max : this.scroll_state;
		this.menu_top = this.menu_top*.9;
		this.m.style.top = this.menu_top.toString() + 'px';
	}
}

//advance to the next song
Menu.prototype.advance = function(){
	if(this.selected_ind + 1 < this.items.length){
		if(this.collapsed){
			this.uncollapse();
		}
		menu.select_item(menu.selected_ind + 1); 
		menu.fft.play_audio();
	}
}

//collapse the menu
Menu.prototype.collapse = function(){
	this.collapsed = true;
	this.selected_y = this.items[this.selected_ind][2].getBoundingClientRect().top - (this.s_l.getBoundingClientRect().top - this.s_l.scrollTop);
	for(let i = 0; i < this.items.length; i++){
		if(i != this.selected_ind){
			this.items[i][2].remove();
			this.items[i][2].classList.remove('in');
			this.items[i][2].classList.add('out');
			if(i != this.items.length - 1)
				this.s_l.insertBefore(this.items[i][2], this.items[i + 1][2]);
		}
	}
	this.s_l.appendChild(this.items[this.items.length - 1][2]);

	this.f_b.remove();
	this.f_b.classList.remove('in');
	this.f_b.classList.add('out');
	this.m.appendChild(this.f_b);

	this.s_b.remove();
	this.s_b.classList.remove('in');
	this.s_b.classList.add('out');
	this.m.prepend(this.s_b);
}

//uncollapse the menu
Menu.prototype.uncollapse = function(){
	this.collapse_time.count = 0;
	this.collapsed = false;
	for(let i = 0; i < this.items.length; i++){
		if(i != this.selected_ind){
			this.items[i][2].remove();
			this.items[i][2].classList.remove('out');
			this.items[i][2].classList.add('in');
			if(i != this.items.length - 1)
				this.s_l.insertBefore(this.items[i][2], this.items[i + 1][2]);
		}
	}
	this.s_l.appendChild(this.items[this.items.length - 1][2]);
	
	this.f_b.remove();
	this.f_b.classList.remove('out');
	this.f_b.classList.add('in');
	this.m.appendChild(this.f_b);

	this.s_b.remove();
	this.s_b.classList.remove('out');
	this.s_b.classList.add('in');
	this.m.prepend(this.s_b);
}

//update the visual scrollbar after setting scroll_state
Menu.prototype.update_scroll = function(){
	if(this.scroll_max > 0){
		let f = this.list_height/(this.scroll_max+this.list_height);
		this.s_b.style.top = ((1 - f)*this.scroll_state/this.scroll_max*this.list_height).toString() + 'px';
		this.s_b.style.height = (f*this.list_height).toString() + 'px';
	}
	else{
		this.s_b.style.height = '0';
	}
}

//handle page resizes
Menu.prototype.resize = function(){
	if(this.collapsed)
		this.uncollapse();
	this.list_height = this.s_l.getBoundingClientRect().height;
	this.scroll_max = this.s_l.scrollHeight - this.list_height;
	this.update_scroll();
}
