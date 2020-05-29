var VSHADER_TEX =
"attribute vec4 a_Position;\n" +
"attribute vec4 a_Normal;\n" +

"uniform mat4 u_ModelMatrix;\n" +
"uniform mat4 u_ViewMatrix;\n" +
"uniform mat4 u_ProjMatrix;\n" +
"uniform mat4 u_NormalMatrix;\n" +
"uniform vec4 u_Light;\n" +
"uniform float u_Diffuse;\n" +
"uniform vec4 u_Color;\n" +

"varying vec3 v_Position;\n" +
"varying vec4 v_Color;\n" +

"void main() {\n" +
	"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
	"vec4 normal = normalize(u_NormalMatrix * a_Normal);\n" +
	"float shade = dot(normalize(u_ModelMatrix * a_Position - u_Light), normal);\n" +
	"shade = min(1.0, u_Diffuse - shade);\n" +
	"v_Color = vec4(u_Color[0]*shade, u_Color[1]*shade, u_Color[2]*shade, u_Color[3]);\n" +
"}\n";

var FSHADER_TEX =
"precision highp float;\n" +

"varying vec4 v_Color;\n" +

"void main() { \n" +
	"gl_FragColor = v_Color;\n" +
"}";

var VSHADER_DOT =
"attribute vec4 a_Position;\n" +
"attribute vec4 a_Color;\n" +
"attribute float a_Size;\n" +

"uniform mat4 u_ModelMatrix;\n" +
"uniform mat4 u_ViewMatrix;\n" +
"uniform mat4 u_ProjMatrix;\n" +

"uniform float u_Pow;\n" +
"uniform float u_Radius;\n" +

"uniform vec4 u_P0p;\n" +
"uniform float u_P0r;\n" +
"uniform vec4 u_P1p;\n" +
"uniform float u_P1r;\n" +
"uniform vec4 u_P2p;\n" +
"uniform float u_P2r;\n" +
"uniform vec4 u_P3p;\n" +
"uniform float u_P3r;\n" +

"varying vec3 v_Position;\n" +
"varying vec4 v_Color;\n"+

"void main() {\n" +
	"vec4 pos = a_Position;\n" +
	"if(length(pos) < u_Radius){\n" +
		"pos = normalize(pos)*u_Radius;\n" +
	"}\n" +
	"if(distance(pos, u_P0p) < u_P0r){\n" +
		"pos = normalize(pos - u_P0p)*u_P0r + u_P0p;\n" +
	"}\n" +
	"else if(distance(pos, u_P1p) < u_P1r){\n" +
		"pos = normalize(pos - u_P1p)*u_P1r + u_P1p;\n" +
	"}\n" +
	"else if(distance(pos, u_P2p) < u_P2r){\n" +
		"pos = normalize(pos - u_P2p)*u_P2r + u_P2p;\n" +
	"}\n" +
	"else if(distance(pos, u_P3p) < u_P3r){\n" +
		"pos = normalize(pos - u_P3p)*u_P3r + u_P3p;\n" +
	"}\n" +
	"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * pos;\n" +
	"gl_PointSize = a_Size*min(60.0, 60.0*(length(pos.xyz) - 1.1)/.25)/pow(gl_Position.w, 1.75);\n" +
	"v_Color = vec4(a_Color.xyz, length(pos.xyz) <= 1.1 ? 0.0 : a_Color.w);\n" +
"}\n";

var FSHADER_DOT =
"precision highp float;\n" +
"varying vec4 v_Color;\n"+

"void main() { \n" +
	"float r = 0.0;\n" +
	"vec2 cxy = 2.0 * gl_PointCoord - 1.0;\n" +
	"r = dot(cxy,cxy);\n" +
	"if(r > 1.0){discard;}\n" +
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

"varying vec2 v_TexCoord;\n" +
"uniform float u_Time;\n" +

"float rand(vec2 n) {return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);}\n" +

"float noise(vec2 n) {\n" +
	"const vec2 d = vec2(0.0, 1.0);\n" +
  	"vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n" +
	"return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n" +
"}\n" +

"void main() { \n" +
	"float n = noise(vec2(gl_FragCoord.x*.7 + u_Time*1.9, gl_FragCoord.y*.7));\n" +
	"n = n*n;\n" +
	"vec4 color = texture2D(u_Sampler, v_TexCoord);\n" +
	"gl_FragColor = vec4(color.xyz*(n*.1 + 1.0), color.w);\n" +
"}";

var p_fpv = 3;
var c_fpv = 4;
var n_fpv = 3;
var t_fpv = 2;

var fovy = 50;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var g_last = Date.now();

var audio_initialized = false;

function main() {
	view = new CameraController([0, 0, 0], [0, 0, 0], .5, .1, 0);
	angle = Math.PI/14;
	d = 6;
	offset = .9;
	cs = .975;

	canvas = document.getElementById("canvas");
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;

	noise.seed(Math.random());

	setup_gl();
	worlds = [];
	worlds.push(new Vis(p_fpv, n_fpv, 16, [0, 0, 0], [0, 0, 1]));
	worlds.push(new Vis(p_fpv, n_fpv, 8, [2.3, 0, 0], [.1, 0, 1]));
	worlds.push(new Vis(p_fpv, n_fpv, 7, [2.2*Math.cos(Math.PI*2/3), 1.75*Math.sin(Math.PI*2/3), 0], [-.3*Math.cos(Math.PI*2/3), .3*Math.sin(Math.PI*2/3), 1]));
	worlds.push(new Vis(p_fpv, n_fpv, 6, [2.1*Math.cos(Math.PI*4/3), 1.5*Math.sin(Math.PI*4/3), 0], [-.3*Math.cos(Math.PI*2/3), -.3*Math.sin(Math.PI*2/3), 1]));
	dots = new Dots(p_fpv, c_fpv, 4000, [-.5, .5]);
	fill = new TexFill(p_fpv, t_fpv, 2, 2);
	init_buffers();

	setup_tex();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	switch_shader(tex_program);
	projMatrix.setPerspective(fovy, canvas.width / canvas.height, .01, 500000);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	light_vec = [3, .25, 5, 1];
	gl.uniform4fv(u_Light, light_vec);

	let diffuse = .5;
	gl.uniform1f(u_Diffuse, diffuse);

	switch_shader(dot_program);
	gl.uniformMatrix4fv(u_ProjMatrix_d, false, projMatrix.elements);
	gl.uniformMatrix4fv(u_ViewMatrix_d, false, viewMatrix.elements);
	gl.uniformMatrix4fv(u_ModelMatrix_d, false, modelMatrix.elements);

	gl.uniform1f(u_P0r, worlds[0].scale*1.1);
	gl.uniform1f(u_P1r, worlds[1].scale*1.1);
	gl.uniform1f(u_P2r, worlds[2].scale*1.1);
	gl.uniform1f(u_P3r, worlds[3].scale*1.1);

	var tick = function() {
		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;


		if(audio_initialized){
			if(audio.currentTime >= audio.duration)
				nextsong(false);

			analyser.getByteFrequencyData(fData);
			songtime.innerHTML = Math.floor(audio.currentTime / 60).toString() + ":" + ("0" + Math.floor(audio.currentTime % 60).toString()).slice(-2);
		}

		switch_shader(cnv_program);
		gl.uniform1f(u_Time, ((new Date().getTime() / 1000) % 60)*canvas.width % canvas.width);

		if(elapsed < 500){
			let f_adj = [];
			for(let i = 0; i < worlds.length; i++){
				f_adj = worlds[i].update(elapsed, fData);
			}
			let avg = average(f_adj)/255;
			dots.update(elapsed, pow_map(average(f_adj.slice(0, 3)), 0, 255, .9, 4.5, 2));

			switch_shader(dot_program);
			gl.uniform4fv(u_P0p, worlds[0].p);
			gl.uniform4fv(u_P1p, worlds[1].p);
			gl.uniform4fv(u_P2p, worlds[2].p);
			gl.uniform4fv(u_P3p, worlds[3].p);

			angle = angle*cs + (1 - cs)*map(avg, 0, 1, .03*Math.PI, .35*Math.PI);
			d = d*cs + (1 - cs)*map(avg, 0, 1, 3, 5.5)*Math.sqrt(2);
			offset = offset*cs + (1 - cs)*pow_map(avg, 0, 1, -Math.PI/8, Math.PI/3, 2);
			let p = rotateabout([d, 0, 0], [0, -d, 0], angle);
			p = rotateabout(p, [0, 0, 1], offset);
			view.camera.x = p[0];
			view.camera.y = p[1];
			view.camera.z = p[2];
	
			viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);

			switch_shader(tex_program);
			gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

			switch_shader(dot_program);
			gl.uniformMatrix4fv(u_ViewMatrix_d, false, viewMatrix.elements);
		}
		
		draw();

		requestAnimationFrame(tick, canvas);
	};
	tick();
}
main();

function draw() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	switch_shader(tex_program);

	for(let i = 0; i < worlds.length; i++){
		worlds[i].draw();
	}

	switch_shader(dot_program);
	dots.draw();

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
	let targetTextureWidth = innerWidth*window.devicePixelRatio;
	let targetTextureHeight = innerHeight*window.devicePixelRatio;
	gl.texImage2D(gl.TEXTURE_2D, level, internal_format, targetTextureWidth, targetTextureHeight, border, format, type, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	attachment_point = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment_point, gl.TEXTURE_2D, texture, level);

	const depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
}

function setup_gl(){
	gl = getWebGLContext(canvas);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.cullFace(gl.FRONT_AND_BACK);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,0);

	init_shaders();

	switch_shader(tex_program);
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	u_Light = gl.getUniformLocation(gl.program, "u_Light");
	u_Diffuse = gl.getUniformLocation(gl.program, "u_Diffuse");

	switch_shader(dot_program);
	u_ModelMatrix_d = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix_d= gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix_d = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	u_Pow = gl.getUniformLocation(gl.program, "u_Pow");
	u_Radius = gl.getUniformLocation(gl.program, "u_Radius");
	u_P0p = gl.getUniformLocation(gl.program, "u_P0p");
	u_P0r = gl.getUniformLocation(gl.program, "u_P0r");
	u_P1p = gl.getUniformLocation(gl.program, "u_P1p");
	u_P1r = gl.getUniformLocation(gl.program, "u_P1r");
	u_P2p = gl.getUniformLocation(gl.program, "u_P2p");
	u_P2r = gl.getUniformLocation(gl.program, "u_P2r");
	u_P3p = gl.getUniformLocation(gl.program, "u_P3p");
	u_P3r = gl.getUniformLocation(gl.program, "u_P3r");

	switch_shader(cnv_program);
	u_Time = gl.getUniformLocation(gl.program, "u_Time");
}

function init_shaders(){
	tex_program = createProgram(gl, VSHADER_TEX, FSHADER_TEX);
	dot_program = createProgram(gl, VSHADER_DOT, FSHADER_DOT);
	cnv_program = createProgram(gl, VSHADER_CNV, FSHADER_CNV);
}

function init_buffers(){
	switch_shader(tex_program);
	for(let i = 0; i < worlds.length; i++){
		worlds[i].init_buffers();
	}

	switch_shader(dot_program);
	dots.init_buffers();

	switch_shader(cnv_program);
	fill.init_buffers();
}

function switch_shader(program){
	gl.useProgram(program);
	gl.program = program;
}

document.body.onmousedown = function(){
	if(!audio_initialized){
		init_audio();
		audio_initialized = true;
	}
}

document.body.onresize = function(){
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;


	if(gl){
		switch_shader(tex_program);
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, .01, 500000);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		setup_tex();

		draw();
	}
}
