var VSHADER_TEX =
"attribute vec4 a_Position;\n" +
"attribute vec4 a_Color;\n" +

"uniform mat4 u_ModelMatrix;\n" +
"uniform mat4 u_ViewMatrix;\n" +
"uniform mat4 u_ProjMatrix;\n" +

"varying vec4 v_Color;\n" +

"void main() {\n" +
	"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
	"v_Color = a_Color;\n" +
"}\n";

var FSHADER_TEX =
"precision highp float;\n" +

"varying vec4 v_Color;\n" +

"void main() { \n" +
	"gl_FragColor = v_Color;\n" +
"}";

var VSHADER_CNV =
"attribute vec2 a_Position;\n" +
"attribute vec2 a_TexCoord;\n" +

"varying vec2 v_TexCoord;\n" +

"void main() {\n" +
	"gl_Position = vec4(a_Position[0], a_Position[1], 0.0, 1.0);\n" +
	"v_TexCoord = a_TexCoord;\n" +
"}";

var FSHADER_CNV =
"precision highp float;\n" +

"uniform sampler2D u_Sampler;\n" +
"uniform float u_Spray;\n" +

"varying vec2 v_TexCoord;\n" +

"void main() {\n" +
	"gl_FragColor = vec4(texture2D(u_Sampler, vec2(v_TexCoord[0] - u_Spray/3.0, v_TexCoord[1] + u_Spray/3.0))[0], texture2D(u_Sampler, v_TexCoord)[1], texture2D(u_Sampler, vec2(v_TexCoord[0] + u_Spray/3.0, v_TexCoord[1] - u_Spray/3.0))[2], 1.0);\n" +
"}";

var p_fpv = 3;
var c_fpv = 4;
var t_fpv = 2;

var fovy = 40;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();

var g_last = Date.now();

var keys = {
	left: false,
	right: false
}

var first = true;
var playing = false;

menu = document.getElementById('menu');
title = document.getElementById('title');
begin = document.getElementById('begin');

function main() {
	view = new CameraController([0, 0, 0], [10, 0, 0], .5, .1);

	canvas = document.getElementById("canvas");
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);

	setup_gl();
	vis = new Vis(p_fpv, c_fpv);
	game = new Game(p_fpv, c_fpv, 100, 300, .5, .03, .01, 300);
	fill = new TexFill(p_fpv, t_fpv, 2, 2);
	init_buffers();

	setup_tex();

	switch_shader(tex_program);
	projMatrix.setPerspective(fovy, canvas.width / canvas.height, .000001, 500);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	vis.update(0, fData);
	draw();

	tick = function() {
		if(audio.currentTime >= audio.duration && !nextsong(false)){
			game.game_over = true;
		}

		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;

		if(elapsed < 500){
			analyser.getByteFrequencyData(fData);
			songtime.innerHTML = Math.floor(audio.currentTime / 60).toString() + ":" + ("0" + Math.floor(audio.currentTime % 60).toString()).slice(-2);

			switch_shader(cnv_program);
			gl.uniform1f(u_Spray, pow_map(average(fData.slice(0, Math.floor(fData.length*.05))), 0, 255, 0, innerHeight*window.devicePixelRatio*.000015, 2));

			vis.update(elapsed, fData);
			game.update(elapsed, keys, fData);
			
			draw();
		}

		if(!game.game_over)
			requestAnimationFrame(tick, canvas);
		else{
			document.body.appendChild(menu);
			check_song_controls();
			audio.pause();
			playing = false;
		}
	};

	if(!first){
		requestAnimationFrame(tick);
		audio.play();
	}
}
main();

function draw() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	switch_shader(tex_program);

	modelMatrix.setRotate(game.rotation, 1, 0, 0);
	modelMatrix.translate(10, 0, .7);
	modelMatrix.scale(1.5, 1.5, 1.5);
	vis.draw(u_ModelMatrix);

	modelMatrix.setTranslate(0, 0, 0);
	modelMatrix.rotate(game.rotation, 1, 0, 0);
	game.draw(u_ModelMatrix);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	switch_shader(cnv_program);
	fill.draw();
}

function setup_tex(){
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	let level = 0;
	let internal_format = gl.RGBA;
	let border = 0;
	let format = gl.RGBA;
	let type = gl.UNSIGNED_BYTE;
	let data = null;
	gl.texImage2D(gl.TEXTURE_2D, level, internal_format, innerWidth*window.devicePixelRatio, innerHeight*window.devicePixelRatio, border, format, type, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	attachment_point = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment_point, gl.TEXTURE_2D, texture, level);
}

function setup_gl(){
	gl = getWebGLContext(canvas);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clearColor(0,0,0,0);

	init_shaders();

	switch_shader(tex_program);
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

	switch_shader(cnv_program);
	u_Spray = gl.getUniformLocation(gl.program, "u_Spray");
	u_Pwidth = gl.getUniformLocation(gl.program, "u_Pwidth");
	u_Pheight = gl.getUniformLocation(gl.program, "u_Pheight");
}

function init_shaders(){
	tex_program = createProgram(gl, VSHADER_TEX, FSHADER_TEX);
	cnv_program = createProgram(gl, VSHADER_CNV, FSHADER_CNV);
}

function init_buffers(){
	switch_shader(tex_program);
	vis.init_buffers();
	game.init_buffers();

	switch_shader(cnv_program);
	fill.init_buffers();
}

function switch_shader(program){
	gl.useProgram(program);
	gl.program = program;
}

function keydown(e){
	switch(e.keyCode){
		case 65: //A
			keys.left = true;
			break;
		case 68: //D
			keys.right = true;
			break;
	}
}

function keyup(e){
	switch(e.keyCode){
		case 65: //A
			keys.left = false;
			break;
		case 68: //D
			keys.right = false;
			break;
		case 32: //Space
			if(audio == undefined)
				init_audio();
			first = false;
			if(!playing){
				title.innerHTML = 'Continue?';
				begin.innerHTML = 'continue game';
				playing = true;
				document.body.removeChild(menu);
				main();
			}
			break;
		case 39: //Right
			nextsong(audio.paused);
			break;
		case 37: //Left
			prevsong(audio.paused);
			break;
	}
}

document.body.onmouseenter = function(){
	if('activeElement' in document)
		document.activeElement.blur();
}

document.body.onresize = function(){
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;


	if(gl){
		switch_shader(tex_program);
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, .000001, 500);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		setup_tex();

		draw();
	}
}
