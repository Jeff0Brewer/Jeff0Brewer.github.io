//matrix rain visualization
class Matrix_Rain{
	constructor(p_fpv, num, len){
		this.p_fpv = p_fpv;
		this.num = num + (num % 2);
		this.len = len;
		this.warp = 0;
		this.rotation = 0;
		this.rot_time = 0;
		this.switch_time = 0;

		let s = .04;
		this.symbols = [[-.5*s,s,0, .5*s,s,0,
						 -.5*s,s,0, 0,-s,0,
						 .5*s,s,0, 0,-s,0],
						[-.5*s,s,0, .5*s,s,0,
						 -.5*s,-s,0, .5*s,-s,0,
						 0,s,0, 0,-s,0],
						 [-.5*s,-s,0, .5*s,-s,0,
						 -.5*s,-s,0, 0,s,0,
						 .5*s,-s,0, 0,s,0]];

		this.sym_len = this.symbols[0].length;
		this.offsets = [];
		for(let i = 0; i < len; i++){
			this.offsets.push(exp_map(i, [0, len], [.1, .005], .25));
		}

		let vertex_length = num*len*this.sym_len;
		this.pos_buffer = new Float32Array(vertex_length*this.p_fpv);
		this.off_buffer = new Float32Array(vertex_length);
		this.opc_buffer = new Float32Array(vertex_length);
		this.ang_buffer = new Float32Array(vertex_length);
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.strands = [];
		this.curr_sym = [];
		this.st_b = [30, 80];

		let r_b = [1.75, 8]; 
		let a_b = [Math.PI*.6, Math.PI*2.4];
		let h_b = [7, -7];
		let pos_ind = 0;
		let buf_ind = 0;
		for(let n = 0; n < num; n++){
			this.strands.push([Math.floor(Math.random()*2*len), map(Math.random(), [0, 1], this.st_b), Math.random()*this.st_b[0]]);
			let noise_pos = n > num/2 ? n % (num/2) : -n;
			let r = map(noise.simplex2(noise_pos*.1, 0), [-1, 1], r_b);
			let a = map(noise.simplex2(noise_pos*.4, 0), [-1, 1], a_b);
			let pos = [Math.cos(a)*r, 0, Math.sin(a)*r];
			let a_off = map(Math.random(), [0, 1], [0, Math.PI*2]);
			for(let l = 0; l < len; l++){
				let center_pos = add(pos, [0, map(l, [0, len], h_b), 0]);
				let angle = map(l, [0, len], [a_off, a_off + Math.PI*10]);
				for(let p = 0; p < 2; p++){
					let symbol = 0;
					this.curr_sym.push(symbol);
					for(let i = 0; i < this.symbols[symbol].length; i++, pos_ind += 3, buf_ind++){
						let vertex_pos = add(this.symbols[symbol].slice(i*3, i*3+3), center_pos);
						this.pos_buffer[pos_ind + 0] = vertex_pos[0];
						this.pos_buffer[pos_ind + 1] = vertex_pos[1];
						this.pos_buffer[pos_ind + 2] = vertex_pos[2];

						this.off_buffer[buf_ind] = p == 0 ? -.04 : .04;
						this.opc_buffer[buf_ind] = 0;
						this.ang_buffer[buf_ind] = angle;
					}
				}
			}
		}

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);
		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.gl_off_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_off_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.off_buffer, gl.DYNAMIC_DRAW);
		this.a_Offset = gl.getAttribLocation(gl.program, 'a_Offset');
		gl.vertexAttribPointer(this.a_Offset, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Offset);

		this.gl_opc_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_opc_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.opc_buffer, gl.DYNAMIC_DRAW);
		this.a_Opacity = gl.getAttribLocation(gl.program, 'a_Opacity');
		gl.vertexAttribPointer(this.a_Opacity, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Opacity);

		this.gl_ang_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_ang_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.ang_buffer, gl.STATIC_DRAW);
		this.a_Angle = gl.getAttribLocation(gl.program, 'a_Angle');
		gl.vertexAttribPointer(this.a_Angle, 1, gl.FLOAT, false, this.fsize, 0);
		gl.enableVertexAttribArray(this.a_Angle);

		this.u_Warp = gl.getUniformLocation(gl.program, 'u_Warp');
		this.u_Rotation = gl.getUniformLocation(gl.program, 'u_Rotation');
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize*this.p_fpv, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_ang_buf);
		gl.vertexAttribPointer(this.a_Angle, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_off_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.off_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Offset, 1, gl.FLOAT, false, this.fsize, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_opc_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.opc_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Opacity, 1, gl.FLOAT, false, this.fsize, 0);

		gl.uniform1f(this.u_Warp, this.warp);
		gl.uniform1f(this.u_Rotation, this.rotation);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);
	}

	update(elapsed, fft){
		this.warp = this.warp*.85 + exp_map(fft.sub_pro(0, .1), [0, 255], [0, 1], 2)*.15;

		let rot_spd = 5000;
		this.rot_time = (this.rot_time + elapsed) % rot_spd;
		this.rotation = map(this.rot_time, [0, rot_spd], [0, Math.PI*2]);

		let f_b = [.2, 1];
		for(let i = 0; i < this.num; i++){
			this.strands[i][2] += elapsed;
			if(this.strands[i][2] > this.strands[i][1]){
				this.strands[i][2] = 0;
				this.strands[i][0] = (this.strands[i][0] + 1) % (2*this.len);
			}
			let drop_len = map(fft.sub_pro(map(i % 10, [0, 10], f_b), map(i % 10, [0, 10], f_b)), [0, 255], [this.len*.2, this.len*.5]);
			for(let j = 0; j < 2*this.len; j++){
				let d = this.strands[i][0] - j >= 0 ? this.strands[i][0] - j : this.strands[i][0] + 2*this.len - j;
				let opacity = d == 0 ? .9 : exp_map(d, [0, drop_len], [.7, 0], .8);
				let vertex_start = (i*2*this.len + j)*this.sym_len;
				for(let k = 0; k < this.sym_len/this.p_fpv; k++){
					this.opc_buffer[vertex_start + k] = opacity;
					this.off_buffer[vertex_start + k] = (j % 2 == 0 ? -1 : 1) * this.offsets[d];
				}
			}
		}
		let sym_lvl = map(fft.sub_pro(0, .15), [0, 255], [0, this.symbols.length]);
		for(let i = 0; i < 1000; i++){
			let sym_ind = Math.floor(map(Math.random(), [0, 1], [0, this.curr_sym.length]));
			let symbol = Math.floor(exp_map(Math.random(), [0, 1] , [0, sym_lvl], .5));
			let pos_start = sym_ind*this.sym_len*this.p_fpv;
			let transition = add(mult_scalar(this.symbols[symbol], 1.0), mult_scalar(this.symbols[this.curr_sym[sym_ind]], -1.0));
			if(symbol != this.curr_sym[sym_ind]){
				for(let j = 0; j < this.sym_len; j++){
					this.pos_buffer[pos_start + j] += transition[j];
				}
				this.curr_sym[sym_ind] = symbol;
			}
		}

	}
}

