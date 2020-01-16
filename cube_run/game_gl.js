class Game{
	constructor(p_fpv, c_fpv, width, depth, size, border, space, num_blocks){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.width = width;
		this.depth = depth;
		this.size = size;

		this.height = -.4;
		this.speed_bounds = [-30, -100];
		this.speed = 0;
		this.speed_smoothing = .5;
		this.acceleration = -1;
		this.strafe = 6;
		this.rotation = 0;
		this.max_rotation = 20;
		this.rotation_smoothing = .9;
		this.ship_size = .1;
		this.ship_pos = [.7, 0, this.height + size/2];
		this.block_height = 5;
		this.block_boost = 0;
		this.block_smoothing = .7;
		this.game_over = false;

		let center_gap = 2;
		this.blocks = [];
		for(let i = 0; i < num_blocks; i++){
			this.blocks.push([(num_blocks - i)/num_blocks*depth, (Math.random() > .5 ? -1 : 1) * (Math.random()*(width - center_gap)/2 + center_gap/2), Math.random(), 0]);
		}

		let points = [];
		let colors = [];

		points.push([0, -width/2, this.height]);
		points.push([0, width/2, this.height]);
		points.push([depth, width/2, this.height]);


		points.push([depth, width/2, this.height]);
		points.push([depth, -width/2, this.height]);
		points.push([0, -width/2, this.height]);

		for(let i = 0; i < points.length; i++){
			colors.push([.0, .0, .0, .9]);
		}

		this.stage_end = points.length;

		points.push([-size/2, -size/2, -size/2]);
		points.push([size/2, -size/2, -size/2]);
		points.push([size/2, size/2, -size/2]);

		points.push([size/2, size/2, -size/2]);
		points.push([-size/2, size/2, -size/2]);
		points.push([-size/2, -size/2, -size/2]);

		points.push([-size/2, -size/2, size/2]);
		points.push([size/2, -size/2, size/2]);
		points.push([size/2, size/2, size/2]);

		points.push([size/2, size/2, size/2]);
		points.push([-size/2, size/2, size/2]);
		points.push([-size/2, -size/2, size/2]);

		points.push([-size/2, -size/2, -size/2]);
		points.push([-size/2, -size/2, size/2]);
		points.push([-size/2, size/2, size/2]);

		points.push([-size/2, size/2, size/2]);
		points.push([-size/2, size/2, -size/2]);
		points.push([-size/2, -size/2, -size/2]);

		points.push([size/2, -size/2, -size/2]);
		points.push([size/2, -size/2, size/2]);
		points.push([size/2, size/2, size/2]);

		points.push([size/2, size/2, size/2]);
		points.push([size/2, size/2, -size/2]);
		points.push([size/2, -size/2, -size/2]);

		points.push([-size/2, -size/2, -size/2]);
		points.push([size/2, -size/2, -size/2]);
		points.push([size/2, -size/2, size/2]);

		points.push([size/2, -size/2, size/2]);
		points.push([-size/2, -size/2, size/2]);
		points.push([-size/2, -size/2, -size/2]);

		points.push([-size/2, size/2, -size/2]);
		points.push([size/2, size/2, -size/2]);
		points.push([size/2, size/2, size/2]);

		points.push([size/2, size/2, size/2]);
		points.push([-size/2, size/2, size/2]);
		points.push([-size/2, size/2, -size/2]);

		for(let i = colors.length; i < points.length; i++){
			colors.push([0, 0, 0, .4]);
		}

		size += space;

		let border_start = points.length;

		points.push([size/2, -size/2, -size/2]);
		points.push([size/2, size/2, -size/2]);
		points.push([size/2, size/2, -size/2 + border]);

		points.push([size/2, size/2, -size/2 + border]);
		points.push([size/2, -size/2, -size/2 + border]);
		points.push([size/2, -size/2, -size/2]);

		points.push([size/2, -size/2, size/2]);
		points.push([size/2, size/2, size/2]);
		points.push([size/2, size/2, size/2 - border]);

		points.push([size/2, size/2, size/2 - border]);
		points.push([size/2, -size/2, size/2 - border]);
		points.push([size/2, -size/2, size/2]);

		points.push([size/2, -size/2, -size/2 + border]);
		points.push([size/2, -size/2, size/2 - border]);
		points.push([size/2, -size/2 + border, size/2 - border]);

		points.push([size/2, -size/2 + border, size/2 - border]);
		points.push([size/2, -size/2 + border, -size/2 + border]);
		points.push([size/2, -size/2, -size/2 + border]);

		points.push([size/2, size/2, -size/2 + border]);
		points.push([size/2, size/2, size/2 - border]);
		points.push([size/2, size/2 - border, size/2 - border]);

		points.push([size/2, size/2 - border, size/2 - border]);
		points.push([size/2, size/2 - border, -size/2 + border]);
		points.push([size/2, size/2, -size/2 + border]);

		let border_end = points.length;

		for(let i = border_start; i < border_end; i++)
			points.push([points[i][1], points[i][0], points[i][2]]);
		for(let i = border_start; i < border_end; i++)
			points.push([points[i][1], -points[i][0], points[i][2]]);
		for(let i = border_start; i < border_end; i++)
			points.push([points[i][1], -points[i][2], points[i][0]]);
		for(let i = border_start; i < border_end; i++)
			points.push([points[i][1], -points[i][2], -points[i][0]]);
		for(let i = border_start; i < border_end; i++)
			points.push([-points[i][0], -points[i][1], points[i][2]]);

		for(let i = colors.length; i < points.length; i++){
			colors.push([1, 1, 1, 1]);
		}

		this.block_end = points.length;

		points.push([0, 0, 0]);
		points.push([-this.ship_size*.5, 0, 0]);
		points.push([-this.ship_size, -this.ship_size/4, 0]);

		points.push([0, 0, 0]);
		points.push([-this.ship_size*.5, 0, 0]);
		points.push([-this.ship_size, this.ship_size/4, 0]);

		for(let i = colors.length; i < points.length; i++){
			colors.push([1, 1, 1, 1]);
		}

		this.ship_end = points.length;

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);
		this.col_buffer = new Float32Array(colors.length*this.c_fpv);

		let pos_ind = 0;
		let col_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer[pos_ind] = points[i][j];
			}
			for(let j = 0; j < colors[i].length; j++, col_ind++){
				this.col_buffer[col_ind] = colors[i][j];
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

	draw(u_ModelMatrix){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);		
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);		
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES, 0, this.stage_end);

		modelMatrix.translate(0, 0, this.height);
		for(let i = 0; i < this.blocks.length; i++){
			modelMatrix.translate(this.blocks[i][0], this.blocks[i][1], (this.blocks[i][3] + this.block_boost)/4);
			modelMatrix.scale(1, 1, 1 + this.blocks[i][3] + this.block_boost);
			gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLES, this.stage_end, this.block_end - this.stage_end);
			modelMatrix.scale(1, 1, 1/(1 + this.blocks[i][3] + this.block_boost));
			modelMatrix.translate(-this.blocks[i][0], -this.blocks[i][1], -(this.blocks[i][3] + this.block_boost)/4);
		}

		modelMatrix.setTranslate(this.ship_pos[0], this.ship_pos[1], this.ship_pos[2]);
		modelMatrix.rotate(-this.rotation, 1, 0, 0);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES, this.block_end, this.ship_end - this.block_end);
	}

	update(elapsed, input, fData){
		let fData_trimmed = fData.slice(0, Math.floor(fData.length*.7));
		fData = [];
		for(let i = 0; i < Math.sqrt(fData_trimmed.length); i++){
			fData.push(average(fData_trimmed.slice(Math.pow(i, 2), Math.pow(i + 1, 2))));
		}

		this.block_boost = pow_map(average(fData.slice(0, Math.floor(fData.length*.1))), 0, 255, 0, 1, 5);

		this.speed = this.speed*this.speed_smoothing + map(average(fData.slice(0, Math.floor(fData.length*.25))), 0, 255, this.speed_bounds[0], this.speed_bounds[1])*(1 - this.speed_smoothing);
		this.speed_bounds[0] += this.acceleration*elapsed/4000;
		this.speed_bounds[1] += this.acceleration*elapsed/1000;

		let strafe = 0;
		let rotation = 0;

		if(input.left){
			strafe -= this.strafe;
			rotation += this.max_rotation;
		}
		if(input.right){
			strafe += this.strafe;
			rotation -= this.max_rotation;
		}

		this.rotation = this.rotation*this.rotation_smoothing + rotation*(1 - this.rotation_smoothing);

		let vel = [this.speed*elapsed/1000, strafe*elapsed/1000];
		let past = -1;
		for(let i = 0; i < this.blocks.length; i++){
			this.blocks[i][0] += vel[0]; 
			if(past == -1 && this.blocks[i][0] < -10)
				past = i;

			this.blocks[i][1] += vel[1];
			if(this.blocks[i][1] < -this.width/2)
				this.blocks[i][1] += this.width;
			if(this.blocks[i][1] > this.width/2)
				this.blocks[i][1] -= this.width;
		}

		for(let i = 0; i < this.blocks.length; i++){
			let p1 = [this.blocks[i][0], this.blocks[i][1]];
			let p2 = sub(p1, vel);

			if(cube_intersect([this.ship_pos[0]*2, this.ship_pos[1]], [p2, p1], this.size/2))
				this.game_over = true;

			this.blocks[i][3] = this.blocks[i][3]*this.block_smoothing + pow_map(fData[Math.floor(this.blocks[i][2]*fData.length)], 0, 255, 0, this.block_height, 3)*(1 - this.block_smoothing);
		}

		if(past != -1){
			for(let i = past; i < this.blocks.length; i++){
				let block = this.blocks.pop();
				this.blocks.unshift([this.depth + block[0] - vel[0], Math.random()*this.width - this.width/2, Math.random(), 0]);
			}
		}
	}

}
