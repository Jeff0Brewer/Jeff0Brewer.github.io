class Vis{
	constructor(p_fpv, num_levels, detail){
		this.p_fpv = p_fpv;
		this.level_detail = Math.floor(detail/num_levels);
		this.level_size = (this.level_detail + 1)*2 + 1;
		this.num_levels = num_levels;
		this.size = [2, 5];

		this.color_map = new ColorMap('#000000 0%, #ff00ff 50%, #ffffff 100%');

		this.points = [];

		for(let level = 0; level < num_levels; level++){
			this.points.push([0,0]);
			this.points.push([0,0]);
			for(let i = 0; i <= 2*this.level_detail; i++){
				this.points.push([0,0]);
			}
		}

		this.pos_buffer = new Float32Array(this.p_fpv*this.points.length);

		let pos_ind = 0;
		for(let i = 0; i < this.points.length; i++){
			for(let j = 0; j < this.points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = this.points[i][j];
			}
		}
	}


	init_buffers(){
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		//position buffer
		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.u_Color = gl.getUniformLocation(gl.program, "u_Color");

		gl.lineWidth(5.0);
		modelMatrix.rotate(90, 0, 0, 1);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	}

	draw(u_ModelMatrix){
		//position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pos_buffer);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//drawing

		for(let level = 0; level < this.num_levels; level++){
			let color = this.color_map.map(level, 0, this.num_levels);
			gl.uniform4fv(this.u_Color, [color.r, color.g, color.b, 1.0]);
			gl.drawArrays(gl.TRIANGLE_FAN, level*this.level_size, this.level_size);
		}
	}

	update(fData){
		let amplitude = average(fData);
		let size = map(amplitude, 0, 255, this.size[0], this.size[1]);

		let f_ind = 0;
		this.points = [];
		for(let level = 0; level < this.num_levels; level++){
			f_ind = level*this.level_detail
			this.points.push([0,0]);
			for(let i = 0; i <= this.level_detail; i++, f_ind++){
				let len = map(fData[f_ind], 0, 255, 0, size);
				let angle = i/this.level_detail*Math.PI;
				this.points.push([Math.cos(angle)*len, Math.sin(angle)*len]);
			}
			f_ind--;
			for(let i = this.level_detail; i >= 0; i--, f_ind--){
				let len = map(fData[f_ind], 0, 255, 0, size);
				let angle = -1*i/this.level_detail*Math.PI;
				this.points.push([Math.cos(angle)*len, Math.sin(angle)*len]);
			}
		}

		let pos_ind = 0;
		for(let i = 0; i < this.points.length; i++){
			for(let j = 0; j < this.points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = this.points[i][j];
			}
		}
		// console.log(this.pos_buffer);
	}
}
