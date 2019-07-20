var VSHADER_SOURCE =
	"attribute vec4 a_Position;\n" +
	"attribute vec4 a_Color;\n" +
	"attribute vec4 a_Normal;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform mat4 u_NormalMatrix;\n" +
	"uniform vec4 u_Light;\n" +

	"varying vec4 v_Color;\n" +
	"varying vec4 v_Normal;\n" +

	"void main() {\n" +
		"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n" +
		"v_Normal = u_NormalMatrix * a_Normal;\n" +
		"float shade = dot(v_Normal, normalize(u_ModelMatrix * a_Position - u_Light));\n" +
		"v_Color = vec4(a_Color[0]*shade, a_Color[1]*shade, a_Color[2]*shade, 1.0);\n" +
	"}\n";

var FSHADER_SOURCE =
	"precision highp float;\n" +
	"varying vec4 v_Color;\n" +

	"void main() { \n" +
		"gl_FragColor = v_Color;\n" +
	"}";

var p_fpv = 3;
var c_fpv = 4;
var n_fpv = 3;

var fovy = 30;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var g_last = Date.now();

function main() {
	canvas = document.getElementById("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	setup_gl();

	let num_planets = Math.floor(Math.random()*8 + 4);
	planets = [];
	let iso = generate_isosphere(5);
	for(let i = 0; i < num_planets; i++){
		planets.push(new Planet(p_fpv, c_fpv, n_fpv, iso));
		planets[i].init_buffers();
	}
	planets.push(new Sun(p_fpv, c_fpv, n_fpv, iso));
	planets[num_planets].init_buffers();

	view = new CameraController([75, 0, 0], [0, 0, 0], .4, .1);

	projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 50000);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);


	light_vec = new Vector4();
	light_vec.elements[0] = 0.0;
	light_vec.elements[1] = 0.0;
	light_vec.elements[2] = 0.0;
	light_vec.elements[3] = 1.0;
	gl.uniform4fv(u_Light, light_vec.elements);

	let last_time = Date.now();

	var tick = function(){
		let current_time = Date.now();
		let elapsed = current_time - last_time;
		last_time = current_time;

		for(let i = 0; i < planets.length; i++){
			planets[i].update(elapsed);
		}

		draw();

		requestAnimationFrame(tick);
	}
	tick();
}
main();

function draw() {
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	for(let i = 0; i < planets.length; i++){
		pushMatrix(modelMatrix);
		normalMatrix.setInverseOf(modelMatrix.multiply(planets[i].transform));
		normalMatrix.transpose();
		gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
		modelMatrix = popMatrix();

		planets[i].draw(u_ModelMatrix);
	}
}

function setup_gl(){
	gl = getWebGLContext(canvas);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clearColor(0,0,0,0);
	gl.lineWidth(2);

	initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
	u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
	u_Light = gl.getUniformLocation(gl.program, "u_Light");
}

document.body.onresize = function(){
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	if(gl){
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 5000);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}
}


canvas.onmousedown = function(e){
	if(view)
		view.mousedown(e);
}

canvas.onmousemove = function(e){
	if(view && view.mousemove(e)){
		viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
		modelMatrix = new Matrix4();
		modelMatrix.multiply(view.rotation);
		gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	}
}

canvas.onmouseup = function(e){
	if(view)
		view.mouseup(e);
}

canvas.onwheel = function(e){
	if(view){
		view.wheel(e);
		viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, 0, 0, 1);
		gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	}
}
