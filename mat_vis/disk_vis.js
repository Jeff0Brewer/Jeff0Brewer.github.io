//disk visualization
class Disk{
	constructor(inner_r, outer_r, detail, shader_ind){
		this.ir = inner_r;
		this.or = outer_r;
		this.detail = detail + (detail % 2);
		this.sh = shader_ind; 

		this.fpv = 7;
		this.warp = 0;
		this.buffer = new Float32Array(2*(this.detail + 1)*2*this.fpv);
		this.fsize = this.buffer.BYTES_PER_ELEMENT;
		let z = 0;
		let a = Math.PI/2;
		let stp = Math.PI*2/(this.detail - 1);
		let buf_ind = 0;
		for(let i = 0; i < this.detail; i++, a += stp){
			this.buffer[buf_ind    ] = Math.cos(a)*this.or;
			this.buffer[buf_ind + 1] = Math.sin(a)*this.or;
			this.buffer[buf_ind + 2] = z;
			this.buffer[buf_ind + 3] = 1;
			this.buffer[buf_ind + 4] = 1;
			this.buffer[buf_ind + 5] = 1;
			this.buffer[buf_ind + 6] = 1;
			buf_ind += this.fpv;
			this.buffer[buf_ind    ] = Math.cos(a)*this.ir;
			this.buffer[buf_ind + 1] = Math.sin(a)*this.ir;
			this.buffer[buf_ind + 2] = z;
			this.buffer[buf_ind + 3] = 1;
			this.buffer[buf_ind + 4] = 1;
			this.buffer[buf_ind + 5] = 1;
			this.buffer[buf_ind + 6] = 1;
			buf_ind += this.fpv;
		}
		this.buf_mid = buf_ind;
		for(let i = 0; i < this.detail; i++, a += stp){
			this.buffer[buf_ind    ] = Math.cos(a)*this.ir;
			this.buffer[buf_ind + 1] = Math.sin(a)*this.ir;
			this.buffer[buf_ind + 2] = z;
			this.buffer[buf_ind + 3] = 0;
			this.buffer[buf_ind + 4] = 0;
			this.buffer[buf_ind + 5] = 0;
			this.buffer[buf_ind + 6] = .7;
			buf_ind += this.fpv;
			this.buffer[buf_ind    ] = 0;
			this.buffer[buf_ind + 1] = 0;
			this.buffer[buf_ind + 2] = z;
			this.buffer[buf_ind + 3] = 0;
			this.buffer[buf_ind + 4] = 0;
			this.buffer[buf_ind + 5] = 0;
			this.buffer[buf_ind + 6] = .7;
			buf_ind += this.fpv;
		}
		this.detail *= .5;

		switch_shader(this.sh);
		this.gl_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.buffer, gl.DYNAMIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.a_Color = gl.getAttribLocation(gl.program, 'a_Color');
		gl.vertexAttribPointer(this.a_Color, 4, gl.FLOAT, false, this.fsize*this.fpv, this.fsize*3);
		gl.enableVertexAttribArray(this.a_Color);

		this.u_Warp = gl.getUniformLocation(gl.program, 'u_Warp');
		gl.uniform3f(gl.getUniformLocation(gl.program, 'u_WarpCurve'), .2, 1.0, .6);
	}

	draw(){
		switch_shader(this.sh);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.vertexAttribPointer(this.a_Color, 4, gl.FLOAT, false, this.fsize*this.fpv, this.fsize*3);

		gl.uniform1f(this.u_Warp, this.warp);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.buf_mid / this.fpv);
		gl.drawArrays(gl.TRIANGLE_STRIP, this.buf_mid / this.fpv, (this.buffer.length - this.buf_mid) / this.fpv);
	}

	update(elapsed, fft){
		for(let i = 0; i <= this.detail; i++){
			let color = exp_map(fft.sub_pro(.8*i/this.detail, .8*(i + 1)/this.detail), [0, 255], [0, 1], 1.25);
			let v_s = [i*2*this.fpv, this.buf_mid - (i + 1)*2*this.fpv];
			for(let side = 0; side < 2; side++){
				for(let vrt = 0; vrt < 2; vrt++){
					for(let col = 3; col < 7; col++){
						this.buffer[v_s[side] + vrt*this.fpv + col] = color;
					}
				}
			}
		}

		this.warp = this.warp*.85 + exp_map(fft.sub_pro(0, .1), [0, 255], [0, 1], 3)*.15;

	}
}

