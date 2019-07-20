class Player{
	constructor(p_fpv, c_fpv, left_top, right_bottom){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.lt = left_top;
		this.rb = right_bottom;
		this.center = [(left_top[0] + right_bottom[0])/2, (left_top[1] + right_bottom[1])/2];

		this.velocity = {
			x: 0,
			y: 0
		};
		this.moving = {
			left: false,
			right: false
		};
		this.move_speed = 5;
		this.jump_speed = 5;
		this.wall_jump_speed = 10;
		this.move_smooth = .9;
		this.jump_state = 0;
		this.flip_speed = 10;

		this.rotation_smooth = .85;
		this.rotation = 0;
		this.flip_state = 0;

		this.points = [];
		this.points.push(left_top);
		this.points.push([right_bottom[0], left_top[1]]);
		this.points.push([left_top[0], right_bottom[1]]);
		this.points.push(right_bottom);

		this.points_last = this.points.slice();

		this.pos_buffer = new Float32Array(this.points.length*this.p_fpv);
		this.col_buffer = new Float32Array(this.points.length*this.c_fpv);

		let color = [1, 1, 1];
		let pos_ind = 0;
		let col_ind = 0;
		for(let point = 0; point < this.points.length; point++){
			for(let coord = 0; coord < this.points[point].length; coord++, pos_ind++){
				this.pos_buffer[pos_ind] = this.points[point][coord];
			}
			for(let comp = 0; comp < this.c_fpv; comp++, col_ind++){
				this.col_buffer[col_ind] = color[comp];
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
		let pos_ind = 0;
		for(let point = 0; point < this.points.length; point++){
			for(let coord = 0; coord < this.points[point].length; coord++, pos_ind++){
				this.pos_buffer[pos_ind] = this.points[point][coord];
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.pos_buffer.length / this.p_fpv);
	}


	update(g_acceleration, elapsed){
		this.jump_state = 0;

		if(Math.abs(this.rotation) > Math.PI/2)
			g_acceleration = 0;

		if(this.moving.right)
			this.velocity.x = this.velocity.x*this.move_smooth + this.move_speed*(1 - this.move_smooth);
		if(this.moving.left)
			this.velocity.x = this.velocity.x*this.move_smooth - this.move_speed*(1 - this.move_smooth);
		if(!this.moving.left && !this.moving.right)
			this.velocity.x = this.velocity.x*this.move_smooth;

		this.velocity.y += g_acceleration*elapsed/1000;
		let translation = [this.velocity.x * elapsed/1000, this.velocity.y * elapsed/1000];

		this.points_last = this.points.slice();
		for(let point = 0; point < this.points.length; point++)
			this.points[point] = add(this.points[point], translation);
		this.center = add(this.center, translation);
	}

	rotate(elapsed){
		let new_rotation = this.rotation*this.rotation_smooth - this.rotation;

		for(let point = 0; point < this.points.length; point++){
			let vec = sub(this.points[point], this.center);
			vec = rotateabout([vec[0], vec[1], 0], [0, 0, 1], new_rotation);
			this.points[point] = add(this.center, vec);
		}

		this.rotation = this.rotation + new_rotation;
	}

	collide_y(rect){
		let translation = [0, 0];

		this.t = -1000000;
		this.b = 1000000;
		this.l = 1000000;
		this.r = -1000000;
		this.l_t = -1000000;
		this.l_b = 1000000;
		this.l_l = 1000000;
		this.l_r = -1000000;

		for(let point = 0; point < this.points.length; point++){
			this.t = max(this.t, this.points[point][1]);
			this.b = min(this.b, this.points[point][1]);
			this.l = min(this.l, this.points[point][0]);
			this.r = max(this.r, this.points[point][0]);

			this.l_t = max(this.l_t, this.points_last[point][1]);
			this.l_b = min(this.l_b, this.points_last[point][1]);
			this.l_l = min(this.l_l, this.points_last[point][0]);
			this.l_r = max(this.l_r, this.points_last[point][0]);
		}

		let w = 0.5 * ((this.r - this.l) + (rect.rb[0] - rect.lt[0]));
		let h = 0.5 * ((this.t - this.b) + (rect.lt[1] - rect.rb[1]));
		let dx = this.center[0] - (rect.rb[0] + rect.lt[0])/2;
		let dy = this.center[1] - (rect.lt[1] + rect.rb[1])/2;

		if(Math.abs(dx) <= w && Math.abs(dy) <= h){
			let shift = [0, 0];
			let shift_inc = [this.velocity.x == 0 ? 0 : Math.sign(this.velocity.x)*-.01, this.velocity.y == 0 ? 0 : Math.sign(this.velocity.y)*-.01];
			if(shift_inc[0] != 0 || shift_inc[1] != 0){
				while(Math.abs(dx) <= w && Math.abs(dy) <= h){
					shift = add(shift, shift_inc);

					w = 0.5 * ((this.r - this.l + shift[0]) + (rect.rb[0] - rect.lt[0]));
					h = 0.5 * ((this.t - this.b + shift[1]) + (rect.lt[1] - rect.rb[1]));
					dx = this.center[0] + shift[0] - (rect.rb[0] + rect.lt[0])/2;
					dy = this.center[1] + shift[1] - (rect.lt[1] + rect.rb[1])/2;
				}
			}
			shift = sub(shift, shift_inc);
			w = 0.5 * ((this.r - this.l + shift[0]) + (rect.rb[0] - rect.lt[0]));
			h = 0.5 * ((this.t - this.b + shift[1]) + (rect.lt[1] - rect.rb[1]));
			dx = this.center[0] + shift[0] - (rect.rb[0] + rect.lt[0])/2;
			dy = this.center[1] + shift[1] - (rect.lt[1] + rect.rb[1])/2;


		    let wy = w * dy;
		    let hx = h * dx;

		    if(wy > hx)
	        if(wy > -hx){
						this.velocity.y = 0;
				 		translation[1] = rect.top - this.b;
						this.jump_state = 1;
						this.flip_state = 1;
					}
	        else{
					}
		    else
	        if(wy > -hx){
					}
	        else{
				 		this.velocity.y = 0;
				 		translation[1] = rect.bottom - this.t;
					}
		}

		for(let point = 0; point < this.points.length; point++)
			this.points[point] = add(this.points[point], translation);
		this.center = add(this.center, translation);
	}

	collide_x(rect){
		let translation = [0, 0];

		this.t = -1000000;
		this.b = 1000000;
		this.l = 1000000;
		this.r = -1000000;
		this.l_t = -1000000;
		this.l_b = 1000000;
		this.l_l = 1000000;
		this.l_r = -1000000;

		for(let point = 0; point < this.points.length; point++){
			this.t = max(this.t, this.points[point][1]);
			this.b = min(this.b, this.points[point][1]);
			this.l = min(this.l, this.points[point][0]);
			this.r = max(this.r, this.points[point][0]);

			this.l_t = max(this.l_t, this.points_last[point][1]);
			this.l_b = min(this.l_b, this.points_last[point][1]);
			this.l_l = min(this.l_l, this.points_last[point][0]);
			this.l_r = max(this.l_r, this.points_last[point][0]);
		}

		let w = 0.5 * ((this.r - this.l) + (rect.rb[0] - rect.lt[0]));
		let h = 0.5 * ((this.t - this.b) + (rect.lt[1] - rect.rb[1]));
		let dx = this.center[0] - (rect.rb[0] + rect.lt[0])/2;
		let dy = this.center[1] - (rect.lt[1] + rect.rb[1])/2;

		if(Math.abs(dx) <= w && Math.abs(dy) <= h){
			let shift = [0, 0];
			let shift_inc = [this.velocity.x == 0 ? 0 : Math.sign(this.velocity.x)*-.01, this.velocity.y == 0 ? 0 : Math.sign(this.velocity.y)*-.01];
			if(shift_inc[0] != 0 || shift_inc[1] != 0){
				while(Math.abs(dx) <= w && Math.abs(dy) <= h){
					shift = add(shift, shift_inc);

					w = 0.5 * ((this.r - this.l + shift[0]) + (rect.rb[0] - rect.lt[0]));
					h = 0.5 * ((this.t - this.b + shift[1]) + (rect.lt[1] - rect.rb[1]));
					dx = this.center[0] + shift[0] - (rect.rb[0] + rect.lt[0])/2;
					dy = this.center[1] + shift[1] - (rect.lt[1] + rect.rb[1])/2;
				}
			}
			shift = sub(shift, shift_inc);
			w = 0.5 * ((this.r - this.l + shift[0]) + (rect.rb[0] - rect.lt[0]));
			h = 0.5 * ((this.t - this.b + shift[1]) + (rect.lt[1] - rect.rb[1]));
			dx = this.center[0] + shift[0] - (rect.rb[0] + rect.lt[0])/2;
			dy = this.center[1] + shift[1] - (rect.lt[1] + rect.rb[1])/2;

				let wy = w * dy;
				let hx = h * dx;

				if(wy > hx)
					if(wy > -hx){
					}
					else{
						this.velocity.x = 0;
						translation[0] = rect.left - this.r;
						this.jump_state = 3;
						this.flip_state = 1;
					}
				else
					if(wy > -hx){
						this.velocity.x = 0;
						translation[0] = rect.right - this.l;
						this.jump_state = 2;
						this.flip_state = 1;
					}
					else{
					}
		}

		for(let point = 0; point < this.points.length; point++)
			this.points[point] = add(this.points[point], translation);
		this.center = add(this.center, translation);
	}

	move_right(bool){
		this.moving.right = bool;
	}

	move_left(bool){
		this.moving.left = bool;
	}

	flip(){
		if(this.jump_state == 0 && this.flip_state == 1){
			if(this.moving.right)
				this.rotation += Math.PI*2;
			else if(this.moving.left)
				this.rotation -= Math.PI*2;
			else
				this.rotation -= Math.PI*2;

			this.flip_state = 0;
		}
	}

	jump(){
		switch(this.jump_state){
			case 1:
				this.velocity.y = this.jump_speed;
				break;
			case 2:
				this.velocity.y = this.jump_speed;
				this.velocity.x = this.wall_jump_speed;
				break;
			case 3:
				this.velocity.y = this.jump_speed;
				this.velocity.x = -this.wall_jump_speed;
				break;
		}
	}
}
