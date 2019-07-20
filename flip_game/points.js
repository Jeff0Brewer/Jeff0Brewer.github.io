class Points{
	constructor(p_fpv, c_fpv, s_fpv, positions, colors, sizes){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.s_fpv = s_fpv;

		this.pos_buffer = new Float32Array(positions.length*this.p_fpv);
		this.col_buffer = new Float32Array(colors.length*this.c_fpv);
		this.siz_buffer = new Float32Array(sizes.length*this.s_fpv);

		let pos_ind = 0;
		let col_ind = 0;
		let siz_ind = 0;
		for(let point = 0; point < positions.length; point++){
			for(let coord = 0; coord < positions[point].length; coord++, pos_ind++){
				this.pos_buffer[pos_ind] = positions[point][coord];
			}
			for(let comp = 0; comp < this.c_fpv; comp++, col_ind++){
				this.col_buffer[col_ind] = colors[point][comp];
			}
			for(let i = 0; i < this.s_fpv; i++, siz_ind++){
				this.siz_buffer[siz_ind] = sizes[point][i];
			}
		}
	}

	init_buffers(){
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.gl_col_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.col_buffer, gl.STATIC_DRAW);

		this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);
		gl.enableVertexAttribArray(this.a_Color);

		this.gl_siz_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_siz_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.siz_buffer, gl.STATIC_DRAW);

		this.a_Size = gl.getAttribLocation(gl.program, "a_Size");
		gl.vertexAttribPointer(this.a_Size, this.s_fpv, gl.FLOAT, false, this.fsize * this.s_fpv, 0);
		gl.enableVertexAttribArray(this.a_Size);
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_siz_buf);
		gl.vertexAttribPointer(this.a_Size, this.s_fpv, gl.FLOAT, false, this.fsize * this.s_fpv, 0);

		gl.drawArrays(gl.POINTS, 0, this.pos_buffer.length / this.p_fpv);
	}

	collect_point(offset){
		let pos = new Float32Array([-100000, -100000]);
		this.pos_buffer[offset] = pos[0];
		this.pos_buffer[offset + 1] = pos[1];

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset * this.fsize, pos);
	}
}
