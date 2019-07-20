var VSHADER_RECT =
	"attribute vec2 a_Position;\n" +
	"attribute vec3 a_Color;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform vec2 u_PlayerCenter;\n" +

	"varying vec3 v_Position;\n" +
	"varying vec4 v_Color;\n"+

	"void main() {\n" +
		"gl_PointSize = 10.0;\n" +
		"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position[0], a_Position[1], 0, 1);\n" +
		"v_Color = vec4(a_Color[0], a_Color[1], a_Color[2], 1.0);\n" +
	"}\n";

var FSHADER_RECT =
	"precision highp float;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform float u_ShineSize;\n" +
	"uniform vec2 u_PlayerCenter;\n" +

	"varying vec4 v_Color;\n"+

	"void main() { \n" +
		"vec4 center_pos = vec4(u_PlayerCenter[0], u_PlayerCenter[1], 0, 1);\n" +
		"float dist = distance(center_pos, gl_FragCoord);\n" +
		"gl_FragColor = v_Color + max(pow((1.0 - dist/u_ShineSize), 3.0), 0.0);\n" +
	"}";

var VSHADER_POINT =
	"attribute vec2 a_Position;\n" +
	"attribute vec3 a_Color;\n" +
	"attribute float a_Size;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform vec2 u_PlayerCenter;\n" +

	"varying vec3 v_Position;\n" +
	"varying vec4 v_Color;\n"+

	"vec2 push_away(vec2 point_pos, vec2 push_pos){\n" +
		"float away = 2.0;\n" +
		"float d = distance(point_pos, push_pos);\n" +
		"if(d < away){\n" +
			"vec2 a = normalize(point_pos - push_pos)*min((away - d), d)*.5;\n" +
			"return point_pos - a;\n" +
		"}\n" +
		"return point_pos;\n" +
	"}\n" +

	"void main() {\n" +
		"gl_PointSize = a_Size;\n" +
		"vec2 pushed = push_away(a_Position, u_PlayerCenter);\n" +
		"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(pushed[0], pushed[1], 0, 1);\n" +
		"v_Color = vec4(a_Color[0], a_Color[1], a_Color[2], 1.0);\n" +
	"}\n";

var FSHADER_POINT =
	"precision highp float;\n" +

	"varying vec4 v_Color;\n"+

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
	"uniform float u_Time;\n" +

	"varying vec2 v_TexCoord;\n" +

	"float rand(vec2 n) {return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);}\n" +

	"float noise(vec2 n) {\n" +
		"const vec2 d = vec2(0.0, 1.0);\n" +
		"vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n" +
		"return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n" +
	"}\n" +

	"void main() {\n" +
		"vec2 ndc_pos = (v_TexCoord - .5)*2.0;\n" +
		"vec2 testVec = ndc_pos.xy / max(abs(ndc_pos.x), abs(ndc_pos.y));\n" +
		"float len = max(1.0,length( testVec ));\n" +
		"ndc_pos *= mix(1.0, mix(1.0,len,max(abs(ndc_pos.x), abs(ndc_pos.y))), .1);\n" +
		"vec2 texCoord = vec2(ndc_pos.s, ndc_pos.t) * 0.5 + 0.5;\n" +

		"if(texCoord[0] >= 0.0 && texCoord[0] <= 1.0 && texCoord[1] >= 0.0 && texCoord[1] <= 1.0){\n" +
			"float bar = (mod(gl_FragCoord.y, 4.0)/4.0)*.1 + .9;\n" +
			"gl_FragColor = bar*(noise(vec2(gl_FragCoord.x + u_Time, gl_FragCoord.y))*.1 + .9)*vec4(texture2D(u_Sampler, vec2(texCoord[0] + u_Spray/3.0, texCoord[1] - u_Spray/3.0))[0], texture2D(u_Sampler, texCoord)[1], texture2D(u_Sampler, vec2(texCoord[0] - u_Spray/3.0, texCoord[1] + u_Spray/3.0))[2], 1.0);\n" +
		"}\n" +
		"else{\n" +
			"discard;\n" +
		"}\n" +
	"}";

var p_fpv = 2;
var c_fpv = 3;
var s_fpv = 1;
var t_fpv = 2;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();

var fovy = 40;

var g_last = Date.now();

var gravity = -13;
var level_size = 50;

var cam = {
	x: 0,
	y: 0
}

function main() {
	view = new CameraController([0, 0, 10], [0, 0, 0], [0,1,0], .5, .05);
	h = 10*Math.tan(fovy*Math.PI/180/2);
	w = h*window.innerWidth/window.innerHeight;

	canvas = document.getElementById("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	rects = [];

	points = new Points(p_fpv, c_fpv, s_fpv, [], [], []);

	player = new Player(p_fpv, c_fpv, [0, 2], [.15, 1.7]);

	fill = new TexFill(p_fpv, t_fpv, 2, 2);

	setup_gl();
	setup_tex();

	projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 10000);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, view.up.x, view.up.y, view.up.z);


	switch_shader(rect_program);
	gl.uniformMatrix4fv(r_ProjMatrix, false, projMatrix.elements);
	gl.uniformMatrix4fv(r_ViewMatrix, false, viewMatrix.elements);
	gl.uniform1f(r_ShineSize, window.innerHeight*.5);

	switch_shader(point_program);
	gl.uniformMatrix4fv(p_ProjMatrix, false, projMatrix.elements);
	gl.uniformMatrix4fv(p_ViewMatrix, false, viewMatrix.elements);

	tick = function() {
		let now = Date.now();
		elapsed = now - g_last;
		g_last = now;

		if(elapsed < 100){
			switch_shader(cnv_program);
			gl.uniform1f(u_Time, ((new Date().getTime() / 1000) % 60)*100000 % 100000);
			gl.uniform1f(u_Spray, pow_map(min(magnitude([player.velocity.x, player.velocity.y]), 11), 0, 11, 0, innerHeight*.00004, 2.5));

			player.update(gravity, elapsed);
			player.rotate(elapsed);

			for(let i = 0; i < rects.length; i++){
				player.collide_y(rects[i]);
			}
			for(let i = 0; i < rects.length; i++){
				player.collide_x(rects[i]);
			}

			for(let i = 0; i < points.pos_buffer.length / p_fpv; i++){
				let point = [points.pos_buffer[i*p_fpv], points.pos_buffer[i*p_fpv + 1]];
				if(dist(point, player.center) < .4)
					points.collect_point(i*p_fpv);
			}

			draw();
		}

		requestAnimationFrame(tick, canvas);
	};
}

main();

function draw() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.clearColor(.1,.1,.1,1);

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);



	cam.x = cam.x*.85 + player.velocity.x*elapsed/1000*4*.15;
	cam.y = cam.y*.85 + player.velocity.y*elapsed/1000*4*.15;



	pushMatrix(modelMatrix);
	modelMatrix.translate(-player.center[0] + cam.x,
	 											-player.center[1] + cam.y, 0, 0);
	let frag_center = [cam.x/w*window.innerWidth/2 + window.innerWidth/2, cam.y/h*window.innerHeight/2 + window.innerHeight/2];


	switch_shader(rect_program);
	gl.uniform2fv(r_PlayerCenter, frag_center);
	gl.uniformMatrix4fv(r_ModelMatrix, false, modelMatrix.elements);

	for(let i = 0; i < rects.length; i++){
		rects[i].draw();
	}
	player.draw();

	switch_shader(point_program);
	gl.uniform2fv(p_PlayerCenter, player.center);
	gl.uniformMatrix4fv(p_ModelMatrix, false, modelMatrix.elements);

	points.draw();

	modelMatrix = popMatrix();

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(0,0,0,1);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	switch_shader(cnv_program);
	fill.draw();
}

function setup_gl(){
	gl = getWebGLContext(canvas);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);
	gl.clearColor(.1,.1,.1,1);

	init_shaders();
	init_buffers();

	switch_shader(rect_program);
	r_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	r_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	r_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	r_PlayerCenter = gl.getUniformLocation(gl.program, "u_PlayerCenter");
	r_ShineSize = gl.getUniformLocation(gl.program, "u_ShineSize");

	switch_shader(point_program);
	p_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	p_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	p_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	p_PlayerCenter = gl.getUniformLocation(gl.program, "u_PlayerCenter");

	switch_shader(cnv_program);
	u_Spray = gl.getUniformLocation(gl.program, "u_Spray");
	u_Time = gl.getUniformLocation(gl.program, "u_Time");
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

function init_buffers() {
	switch_shader(rect_program);
	for(let i = 0; i < rects.length; i++){
		rects[i].init_buffers();
	}
	player.init_buffers();

	switch_shader(point_program);
	points.init_buffers();

	switch_shader(cnv_program);
	fill.init_buffers();
}

function init_shaders(){
	rect_program = createProgram(gl, VSHADER_RECT, FSHADER_RECT);
	point_program = createProgram(gl, VSHADER_POINT, FSHADER_POINT);
	cnv_program = createProgram(gl, VSHADER_CNV, FSHADER_CNV);
}

function switch_shader(program){
	gl.useProgram(program);
	gl.program = program;
}

document.body.onresize = function(){
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	h = 10*Math.tan(fovy*Math.PI/180/2);
	w = h*window.innerWidth/window.innerHeight;

	if(gl){
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 500);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		switch_shader(rect_program);
		gl.uniformMatrix4fv(r_ProjMatrix, false, projMatrix.elements);
		gl.uniform1f(r_ShineSize, window.innerHeight*.5);

		switch_shader(point_program);
		gl.uniformMatrix4fv(p_ProjMatrix, false, projMatrix.elements);

		setup_tex();

		draw();
	}
}

document.body.onkeydown = function(e){
  switch(e.keyCode){
    case 87: //W
      player.jump();
      break;
    case 65: //A
			player.move_left(true);
      break;
    case 68: //D
			player.move_right(true);
      break;
		case 32: //Space
			player.flip();
			break;
  }
}

document.body.onkeyup = function(e){
  switch(e.keyCode){
    case 65: //A
			player.move_left(false);
      break;
    case 68: //D
			player.move_right(false);
      break;
  }
}

function load_file() {
	rects = [];
  let frame = document.getElementById("frmFile");
  let raw = frame.contentWindow.document.body.childNodes[0].innerHTML;
  while (raw.indexOf("\r") >= 0)
    raw = raw.replace("\r", "");

	let tile_data = raw.split('+');
	let tiles = [];
	for(let i = 0; i < tile_data.length; i++){
		tiles.push(new Tile(tile_data[i]));
	}

	let point_params = [[], [], []];
	let translation = [0, 0];
	for(let i = 0; i < level_size; i++){
		let tile = tiles[Math.floor(Math.random()*tiles.length)];

		translation = sub(translation, tile.left_point);
		for(let j = 0; j < tile.rects.length; j++){
			rects.push(new Rectangle(p_fpv, c_fpv, add(tile.rects[j].lt, translation), add(tile.rects[j].rb, translation), tile.rects[j].color));
		}
		for(let j = 0; j < tile.points[0].length; j++){
			point_params[0].push(add(tile.points[0][j], translation));
			point_params[1].push(tile.points[1][j]);
			point_params[2].push(tile.points[2][j]);
		}
		translation = add(translation, tile.left_point);
		translation = add(translation, sub(tile.right_point, tile.left_point));
	}
	points = new Points(p_fpv, c_fpv, s_fpv, point_params[0], point_params[1], point_params[2]);

	init_buffers();

	tick();
}
