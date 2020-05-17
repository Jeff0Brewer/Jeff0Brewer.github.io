class TexFill{
	constructor(p_fpv, t_fpv, w, h){
		this.p_fpv = p_fpv;
		this.t_fpv = t_fpv;
		this.width = w;
		this.height = h;

		let points = [
			[-w/2,h/2, 0],
			[w/2,h/2, 0],
			[-w/2,-h/2, 0],

			[-w/2,-h/2, 0],
			[w/2,h/2, 0],
			[w/2,-h/2, 0]
		];
		let tcoord = [
			[0,1],
			[1,1],
			[0,0],

			[0,0],
			[1,1],
			[1,0],
		];

		this.pos_buffer = new Float32Array(this.p_fpv*points.length);
		this.tex_buffer = new Float32Array(this.t_fpv*tcoord.length);

		let pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = points[i][j];
			}
		}
		let tex_ind = 0;
		for(let i = 0; i < tcoord.length; i++){
			for(let j = 0; j < tcoord[i].length; j++, tex_ind++){
				this.tex_buffer[tex_ind] = tcoord[i][j];
			}
		}
	}


	init_buffers(){
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);

		this.gl_tex_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_tex_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.tex_buffer, gl.STATIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
		gl.vertexAttribPointer(this.a_TexCoord, this.t_fpv, gl.FLOAT, false, this.fsize * this.t_fpv, 0);
		gl.enableVertexAttribArray(this.a_TexCoord);
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_tex_buf);
		gl.vertexAttribPointer(this.a_TexCoord, this.t_fpv, gl.FLOAT, false, this.fsize * this.t_fpv, 0);

		gl.drawArrays(gl.TRIANGLES, 0, this.pos_buffer.length / this.p_fpv);
	}
}
