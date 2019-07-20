var VSHADER_TEX =
	"attribute vec2 a_Position;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform vec4 u_Color;\n" +

	"varying vec3 v_Position;\n" +
	"varying vec4 v_Color;\n" +

	"void main() {\n" +
		"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position[0], a_Position[1], 0, 1);\n" +
		"v_Color = u_Color;\n" +
	"}\n";

var FSHADER_TEX =
"precision highp float;\n" +
"varying vec4 v_Color;\n" +

"void main() { \n" +
	"gl_FragColor = v_Color;\n" +
"}";

"void main() { \n" +
	"gl_FragColor = v_Color*(noise(vec2(gl_FragCoord.x + u_Time, gl_FragCoord.y))*.2 + .8);\n" +
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
	"vec2 ndc_pos = (v_TexCoord - .5)*2.0;\n" +
	"vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));\n" +
	"float len = max(1.0,length( testVec ));\n" +
	"ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), .5);\n" +
	"vec2 texCoord = vec2(ndc_pos.s, ndc_pos.t) * 0.5 + 0.5;\n" +

	"float bar = (mod(gl_FragCoord.y, 3.0)/3.0)*.1 + .9;\n" +
	"gl_FragColor = bar*vec4(texture2D(u_Sampler, vec2(texCoord[0] + u_Spray/3.0, texCoord[1] - u_Spray/3.0))[0], texture2D(u_Sampler, texCoord)[1], texture2D(u_Sampler, vec2(texCoord[0] - u_Spray/3.0, texCoord[1] + u_Spray/3.0))[2], 1.0);\n" +
"}";


var p_fpv = 2;
var c_fpv = 3;
var t_fpv = 2;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();

var fovy = 40;

var g_last = Date.now();

function main() {
	view = new CameraController([0, 0, 10], [0, 0, 0], [0,1,0], .5, .05);
	let h = 10*Math.tan(fovy*Math.PI/180/2);
	let w = h*window.innerWidth/window.innerHeight;


	canvas = document.getElementById("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	setup_gl();
	vis = new Vis(p_fpv, 20, analyser.fftSize/2*.7);
	fill = new TexFill(p_fpv, t_fpv, 2, 2);
	init_buffers();

	setup_tex();

	switch_shader(tex_program);
	projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 10000);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, view.up.x, view.up.y, view.up.z);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	var tick = function() {
		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;

		analyser.getByteFrequencyData(fData);

		switch_shader(cnv_program);
		gl.uniform1f(u_Spray, pow_map(average(fData.slice(0, Math.floor(fData.length*.4))), 0, 255, 0, innerHeight*.0002, 3));

		if(audio.currentTime >= audio.duration)
			nextsong(false);

		vis.update(fData);
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
	gl.texImage2D(gl.TEXTURE_2D, level, internal_format, innerWidth, innerHeight, border, format, type, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	attachment_point = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment_point, gl.TEXTURE_2D, texture, level);
}

function setup_gl(){
	gl = canvas.getContext("webgl", {});
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);

	gl.clearColor(1, 1, 1, 1);

	init_shaders();

	switch_shader(tex_program);
	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

	switch_shader(cnv_program);
	u_Spray = gl.getUniformLocation(gl.program, "u_Spray");
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

document.body.onresize = function(){
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	if(gl){
		switch_shader(tex_program);
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 500);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		setup_tex();

		draw();
	}
}
