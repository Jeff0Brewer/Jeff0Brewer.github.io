var VSHADER_TEX =
"attribute vec4 a_Position;\n" +
"attribute vec4 a_Normal;\n" +

"uniform mat4 u_ModelMatrix;\n" +
"uniform mat4 u_ViewMatrix;\n" +
"uniform mat4 u_ProjMatrix;\n" +
"uniform mat4 u_NormalMatrix;\n" +
"uniform vec4 u_Light;\n" +
"uniform vec4 u_CamPos;\n" +
"uniform float u_Diffuse;\n" +
"uniform vec4 u_Color;\n" +

"varying vec3 v_Position;\n" +
"varying vec4 v_Color;\n" +

"void main() {\n" +
	"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
	"vec4 normal = u_NormalMatrix * a_Normal;\n" +
	"vec4 inormal = u_NormalMatrix * (-a_Normal);\n" +
	"float shade;\n" +
	"if(length(normal - u_CamPos) > length(inormal - u_CamPos)){\n" +
		"shade = dot(normal, normalize(u_ModelMatrix * a_Position - u_Light));\n" +
	"}\n" +
	"else{\n" +
		"shade = dot(inormal, normalize(u_ModelMatrix * a_Position - u_Light));\n" +
	"}\n" +
	"shade = min(1.0, shade + u_Diffuse);\n" +
	"v_Color = vec4(u_Color[0]*shade, u_Color[1]*shade, u_Color[2]*shade, u_Color[3]);\n" +
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
"uniform float u_PWidth;\n" +
"uniform float u_PHeight;\n" +

"varying vec2 v_TexCoord;\n" +

"void main() {\n" +
	"gl_FragColor = vec4(texture2D(u_Sampler, vec2(v_TexCoord[0] - u_Spray/3.0, v_TexCoord[1] + u_Spray/3.0))[0], texture2D(u_Sampler, v_TexCoord)[1], texture2D(u_Sampler, vec2(v_TexCoord[0] + u_Spray/3.0, v_TexCoord[1] - u_Spray/3.0))[2], 1.0);\n" +
"}";

var p_fpv = 3;
var n_fpv = 3;
var t_fpv = 2;

var fovy = 10;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var g_last = Date.now();

function main() {
	let cam_pos = [16, 16, 12];
	view = new CameraController(cam_pos, [0, 0, 0], .5, .1, 0);

	canvas = document.getElementById("canvas");
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;

	setup_gl();
	vis = new Vis(p_fpv, n_fpv, 16);
	fill = new TexFill(p_fpv, t_fpv, 2, 2);
	init_buffers();

	setup_tex();

	switch_shader(tex_program);
	projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 500);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	light_vec = [16, 8, 12, 1];
	gl.uniform4fv(u_Light, light_vec);

	let diffuse = .35;
	gl.uniform1f(u_Diffuse, diffuse);

	gl.uniform4fv(u_CamPos, [cam_pos[0], cam_pos[1], cam_pos[2], 1]);

	switch_shader(cnv_program);
	gl.uniform1f(u_PWidth, canvas.width);
	gl.uniform1f(u_PHeight, canvas.height);

	var tick = function() {
		if(audio.currentTime >= audio.duration)
			nextsong(false);

		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;

		analyser.getByteFrequencyData(fData);
		songtime.innerHTML = Math.floor(audio.currentTime / 60).toString() + ":" + ("0" + Math.floor(audio.currentTime % 60).toString()).slice(-2);

		switch_shader(cnv_program);
		gl.uniform1f(u_Spray, 0);

		if(elapsed < 500){
			vis.update(elapsed, fData);
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

	modelMatrix = new Matrix4();
	modelMatrix.concat(vis.transform);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	normalMatrix.setInverseOf(modelMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	vis.draw(u_ModelMatrix);

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
	u_CamPos = gl.getUniformLocation(gl.program, "u_CamPos");
	u_Diffuse = gl.getUniformLocation(gl.program, "u_Diffuse");

	switch_shader(cnv_program);
	u_Spray = gl.getUniformLocation(gl.program, "u_Spray");
	u_PWidth = gl.getUniformLocation(gl.program, "u_PWidth");
	u_PHeight = gl.getUniformLocation(gl.program, "u_PHeight");
}

function init_shaders(){
	tex_program = createProgram(gl, VSHADER_TEX, FSHADER_TEX);
	cnv_program = createProgram(gl, VSHADER_CNV, FSHADER_CNV);
}

function init_buffers(){
	switch_shader(tex_program);
	vis.init_buffers();

	switch_shader(cnv_program);
	fill.init_buffers();
}

function switch_shader(program){
	gl.useProgram(program);
	gl.program = program;
}

document.body.onmousedown = function(e){
	view.mousedown(e);
}

document.body.onmousemove = function(e){
	view.mousemove(e);
	// vis.transform = view.rotation;
}	

document.body.onmouseup = function(e){
	view.mouseup(e);
}

document.body.onresize = function(){
	canvas.width = innerWidth*window.devicePixelRatio;
	canvas.height = innerHeight*window.devicePixelRatio;


	if(gl){
		switch_shader(tex_program);
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 500);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		switch_shader(cnv_program);
		gl.uniform1f(u_PWidth, canvas.width);
		gl.uniform1f(u_PHeight, canvas.height);

		setup_tex();

		draw();
	}
}
