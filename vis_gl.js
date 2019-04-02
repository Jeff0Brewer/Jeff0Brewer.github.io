class Vis{
	constructor(p_fpv, width, height, scale){
		this.speed = -300;
		this.roughness = .075;
		this.depth = 60;
		this.x = 0;
		this.curr_hit = 0;
		this.last_hit = 0;
		this.spray = 0;
		this.spray_duration = .9;
		this.spray_dir = [[-1.2, -.8], [.8, 1.2], [-1.2, -.8]];

		this.max_y = height*scale;
		this.scale = scale;

		noise.seed(Math.random());

		this.p_fpv = p_fpv;

		let points = [];

		for(let x = -width*scale; x <= width*scale; x += scale){
			for(let y = -height*scale; y <= height*scale; y += scale){
				if(y != height*scale){
					points.push([x, y, 0]);
					points.push([x, y + scale, 0]);
				}
				if(x != width*scale){
					points.push([x, y, 0]);
					points.push([x + scale, y, 0]);
				}
			}
		}

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);

		let pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = points[i][j];
			}
		}

		this.u_Color = gl.getUniformLocation(gl.program, "u_Color");
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
	}

	draw(u_ModelMatrix){
		let spray = this.curr_hit - this.last_hit;
		spray = spray > 0 ? spray : 0;
		this.spray = max(spray, this.spray * this.spray_duration + spray * (1 - this.spray_duration));
		this.last_hit = this.curr_hit;

		let spray_dir = [map(Math.random(), 0, 1, this.spray_dir[0][0], this.spray_dir[0][1]), map(Math.random(), 0, 1, this.spray_dir[1][0], this.spray_dir[1][1]), map(Math.random(), 0, 1, this.spray_dir[2][0], this.spray_dir[2][1])];


		//position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pos_buffer);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//drawing
		pushMatrix(modelMatrix);

		modelMatrix.translate(1/3*this.spray*spray_dir[0], 1/3*this.spray*spray_dir[1], 1/3*this.spray*spray_dir[2]);
		gl.uniform4fv(this.u_Color, [1.0, 0.0, 0.0, 1.0]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);

		modelMatrix = popMatrix();
		pushMatrix(modelMatrix);

		modelMatrix.translate(2/3*this.spray*spray_dir[0], 2/3*this.spray*spray_dir[1], 2/3*this.spray*spray_dir[2]);
		gl.uniform4fv(this.u_Color, [0.0, 1.0, 0.0, 1.0]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);

		pushMatrix(modelMatrix);
		modelMatrix = popMatrix();

		modelMatrix.translate(this.spray*spray_dir[0], this.spray*spray_dir[1], this.spray*spray_dir[2]);
		gl.uniform4fv(this.u_Color, [0.0, 0.0, 1.0, 1.0]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);

		modelMatrix = popMatrix();

		gl.uniform4fv(this.u_Color, [1.0, 1.0, 1.0, 1.0]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);
	}

	update(elapsed, fData){
		let speed = pow_map(average(fData.slice(0, Math.floor(fData.length*.16))), 0, 255, 0, this.speed, 3)
		this.curr_hit = pow_map(average(fData.slice(0, Math.floor(fData.length*.05))), 0, 255, 0, 10, 7);

		let smoothed = smooth(fData, .2, 7);
		let depth = [];
		for(let y = 0; y <= this.max_y; y += this.scale){
			depth.push(pow_map(smoothed[Math.floor(map(y, 0, this.max_y, Math.floor(fData.length*.16), fData.length*.75))], 0, 255, 0, this.depth, 3));
		}


		this.x += (elapsed/1000)*speed*this.roughness;
		gl.uniform4fv(this.u_Color, [1.0, 1.0, 1.0, 1.0]);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, 0, this.pos_buffer.length / this.p_fpv);
		for(let i = 0; i < this.pos_buffer.length; i += this.p_fpv){
			this.pos_buffer[i + 2] = depth[Math.abs(this.pos_buffer[i + 1])/this.scale]*noise.perlin3(this.roughness*this.pos_buffer[i] + this.x - (this.x % (this.scale*this.roughness)), this.roughness*this.pos_buffer[i + 1], 0);
		}
	}

}
