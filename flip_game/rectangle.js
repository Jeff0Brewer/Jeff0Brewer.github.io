class Rectangle{
	constructor(p_fpv, c_fpv, left_top, right_bottom, color){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.lt = left_top;
		this.rb = right_bottom;
		this.color = color;

		this.left = left_top[0];
		this.top = left_top[1];
		this.right = right_bottom[0];
		this.bottom = right_bottom[1];

		let points = [];
		points.push(left_top);
		points.push([right_bottom[0], left_top[1]]);
		points.push([left_top[0], right_bottom[1]]);
		points.push(right_bottom);

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);
		this.col_buffer = new Float32Array(points.length*this.c_fpv);

		let pos_ind = 0;
		let col_ind = 0;
		for(let point = 0; point < points.length; point++){
			for(let coord = 0; coord < points[point].length; coord++, pos_ind++){
				this.pos_buffer[pos_ind] = points[point][coord];
			}
			for(let comp = 0; comp < this.c_fpv; comp++, col_ind++){
				this.col_buffer[col_ind] = color[point][comp];
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
	}

	draw(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.pos_buffer.length / this.p_fpv);
	}

	in_bounds_x(x){
		return (x > this.left && x < this.right);
	}

	in_bounds_x(a, b){
		return (a > this.left && a < this.right) || (b > this.left && b < this.right) || (a < this.left && b > this.right);
	}

	in_bounds_y(y){
		return (y > this.bottom && y < this.top);
	}

	in_bounds_y(a, b){
		return (a > this.bottom && a < this.top) || (b > this.bottom && b < this.top) || (a > this.top && b < this.bottom);
	}

}
