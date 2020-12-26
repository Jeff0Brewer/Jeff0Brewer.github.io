//initialize transform matrices
var model_matrix = new Mat4();
var view_matrix = new Mat4();
var proj_matrix = new Mat4();

//get canvas object
var canvas = document.getElementById('c');
canvas.width = window.innerWidth*window.devicePixelRatio;
canvas.height = window.innerHeight*window.devicePixelRatio;

//initialize audio analyser variable
var fft = new FFT();

//initialize menu control object
let file = 'COSMIC - Sensei.mp3'
var menu = new Menu();
menu.add_item(file.substring(0, file.lastIndexOf('.')), file);
menu.select_item(0);

//seed noise function
noise.seed(Math.random());

function main(){
	//setup gl and uniforms
	setup_gl();
	make_tex_fb();

	fovy = 50;
	view_matrix.set_camera([0, 0, 8], [0, 0, 0], [0, 1, 0]);
	proj_matrix.set_perspective(fovy, canvas.width/canvas.height, .01, 500);

	mvp_shaders = [0, 1];
	for(let i = 0; i < mvp_shaders.length; i++){
		switch_shader(mvp_shaders[i]);
		gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_ModelMatrix'), false, model_matrix.e);
		gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_ViewMatrix'), false, view_matrix.e);
		gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_ProjMatrix'), false, proj_matrix.e);
	}

	//initialize visualizations
	iso = new Iso(p_fpv, 0);
	mxr = new Matrix_Rain(p_fpv, 200, 75, 1);
	fil = new TexFill(2, 2, 2);

	//start drawing loop
	let last_t = Date.now();
	var tick = function(){
		//find elapsed time
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		//update and draw visualizations
		if(elapsed < 500){
			if(fft.actx != null){
				fft.get_data();
			}
			menu.update(elapsed);
			
			switch_fb(1);
			gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

			iso.update(elapsed, fft);
			iso.draw();

			mxr.update(elapsed, fft);
			mxr.draw();

			switch_fb(0);
			gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
			fil.draw(fft);
		}

		requestAnimationFrame(tick, canvas);
	}
	tick();
}


//initialize audio analyser
document.body.onmousedown = function(){
	if(fft.actx == null){
		fft.init_ctx(file);
		menu.attach_fft(fft);
	}
}

//handle window resizing
document.body.onresize = function(){
	canvas.width = window.innerWidth*window.devicePixelRatio;
	canvas.height = window.innerHeight*window.devicePixelRatio;
	menu.resize();
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
		proj_matrix.set_perspective(fovy, canvas.width/canvas.height, .01, 500);
		for(let i = 0; i < mvp_shaders.length; i++){
			switch_shader(mvp_shaders[i]);
			gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_ProjMatrix'), false, proj_matrix.e);
		}
		remove_fb(1);
		make_tex_fb();
	}
}