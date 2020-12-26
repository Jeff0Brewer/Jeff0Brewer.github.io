var gl;
var programs = [];
var framebuffers = [[null, null]];
var p_fpv = 3;

//load a shader from string
function load_shader(type, source){
	let s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	return s;
}

//create a gl program from strings
function create_program(vs, fs){
	let p = gl.createProgram();
	let v = load_shader(gl.VERTEX_SHADER, vs);
	let f = load_shader(gl.FRAGMENT_SHADER, fs);
	gl.attachShader(p, v);
	gl.attachShader(p, f);
	gl.linkProgram(p);
	return p;
}

//switch to another shader program
function switch_shader(i){
	gl.useProgram(programs[i]);
	gl.program = programs[i];
}

//switch to another framebuffer
function switch_fb(i){
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i][0]);
	if(i != 0) gl.bindTexture(gl.TEXTURE_2D, framebuffers[i][1]);
}

//initialize gl context
function setup_gl(){
	gl = document.getElementById('c').getContext('webgl', {preserveDrawingBuffer: false});
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clearColor(0, 0, 0, 0);

	programs.push(create_program(document.getElementById('v_iso').text, document.getElementById('f_solid').text));
	programs.push(create_program(document.getElementById('v_mxr').text, document.getElementById('f_solid').text));
	programs.push(create_program(document.getElementById('v_tex').text, document.getElementById('f_tex').text));
}

//make a texture framebuffer and add to framebuffer list, return index of fb in list
function make_tex_fb(){
	let w = window.innerWidth*window.devicePixelRatio;
	let h = window.innerHeight*window.devicePixelRatio;
	let tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	let fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

	const depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

	framebuffers.push([fb, tex]);
	return framebuffers.length - 1;
}

//remove a framebuffer from the list
function remove_fb(i){
	framebuffers.splice(i);
}








