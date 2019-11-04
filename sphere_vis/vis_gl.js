class Vis{
	constructor(p_fpv){
		noise.seed(Math.random());
		this.px = 0;
		this.py = 0;
		this.pz = 0;
		this.pxs = 5;
		this.pys = 2.5;
		this.pzs = 1.25;

		this.x = -1;
		this.y = -1;
		this.z = -1;

		this.points = generate_isosphere_lines(2);

		this.angle = 0;
		this.scale = 1;
		this.p_amp = [-3, 5];
		this.p_scales = [.2, 1, 2, 3, 4, 5];
		this.p_weights = [1, 1, 1, 1, 1, 1];
		let sum = 0;
		for(let i = 0; i < this.p_weights.length; i++)
			sum += this.p_weights[i];
		this.p_weights = mult(this.p_weights, 1/sum);
		this.p_pos = 0;
		this.p_spd = .25;

		this.spray = 0;
		this.spray_count = 20;

		this.p_fpv = p_fpv;

		let points = this.points.slice();

		this.sphere_end = points.length*this.p_fpv;
		this.line_end = -1;

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);
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

		gl.lineWidth(5);
	}

	draw(u_ModelMatrix){
		//position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//drawing
		modelMatrix = new Matrix4();
		modelMatrix.scale(this.scale, this.scale, this.scale);

		// gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		// gl.drawArrays(gl.TRIANGLE_STRIP, this.line_end / this.p_fpv, (this.pos_buffer.length - this.line_end) / this.p_fpv);

		modelMatrix.rotate(this.angle, this.x, this.y, this.z);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINES, this.sphere_end / this.p_fpv, (this.line_end - this.sphere_end) / this.p_fpv);
		let spray = this.spray/this.spray_count;
		for(let i = 0; i < this.spray_count; i++){
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.LINES, 0, this.sphere_end / this.p_fpv);
			modelMatrix.scale(1 + spray*Math.random(),1 + spray*Math.random(), 1 + spray*Math.random());
		}
		gl.drawArrays(gl.LINES, this.sphere_end / this.p_fpv, (this.line_end - this.sphere_end) / this.p_fpv);
	}

	update(elapsed, fData){
		let fData_trimmed = fData.slice(0, Math.floor(fData.length*.7));
		fData = [];
		for(let i = 0; i < Math.sqrt(fData_trimmed.length); i++){
			fData.push(average(fData_trimmed.slice(Math.pow(i, 2), Math.pow(i + 1, 2))));
		}

		let rot_speed = map(average(fData.slice(Math.floor(fData.length*.3), Math.floor(fData.length*.7))), 0, 255, .25, 1);
		this.px += rot_speed*this.pxs*elapsed/1000;
		this.py += rot_speed*this.pys*elapsed/1000;
		this.pz += rot_speed*this.pzs*elapsed/1000;

		this.x = map(noise.perlin2(this.px, this.py), -1, 1, 0, 1);
		this.y = map(noise.perlin2(this.py, this.pz), -1, 1, 0, 1);
		this.z = map(noise.perlin2(this.px, this.pz), -1, 1, 0, 1);

		this.angle = this.angle*.9 + map(average(fData), 0, 255, 0, 70)*.1;
		this.scale = this.scale*.5 + pow_map(average(fData.slice(0, Math.floor(fData.length*.15))), 0, 255, 1, 2, 5)*.5;
		this.spray = this.spray*.7 + pow_map(average(fData.slice(0, Math.floor(fData.length*.1))), 0, 255, 0, .4, 4)*.3;

		this.p_pos += this.p_spd*elapsed/1000;

		let points = this.points.slice();
		let num_points = points.length;
		for(let p = 0; p < num_points; p++){
			let level = 0;
			for(let i = 0; i < this.p_scales.length; i++){
				level += noise.perlin3((points[p][0] + this.p_pos)*this.p_scales[i], points[p][1]*this.p_scales[i], points[p][2]*this.p_scales[i])*pow_map(average(fData.slice(Math.floor(fData.length*i/this.p_scales.length), Math.floor(fData.length*(i + 1)/this.p_scales.length))), 0, 255, 0, this.p_weights[i], 2);
			}
			points[p] = mult(points[p], map(level, -1, 1, this.p_amp[0], this.p_amp[1]));
			points.push(add(points[p], mult(points[p], level + .5)));
			points.push(add(points[p], mult(points[p], Math.abs(level*10) + .5)));
		}

		this.line_end = points.length * this.p_fpv;

		let angle_detail = 100;
		let radius = 1.5;
		let width = .1;
		for(let i = 0; i <= angle_detail; i++){
			let angle = i*Math.PI*2/angle_detail;
			points.push([0, Math.cos(angle)*radius, Math.sin(angle)*radius]);
			points.push([0, Math.cos(angle)*(radius + width), Math.sin(angle)*(radius + width)]);
		}

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);

		let pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = points[i][j];
			}
		}
	}

}
