class Planet{
	constructor(p_fpv, c_fpv, n_fpv, iso){
		this.x = Math.random()*1000;
		this.y = Math.random()*1000;

		this.terrain_scales = [1, 2, 4, 10, 100];
		this.terrain_weights = [1, .5, .25, .1, .005];
		this.terrain_weights = norm(this.terrain_weights);

		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.n_fpv = n_fpv;

		this.color_maps = [
			new ColorMap('#3870C9 0%, #4286F4 1%, #FFF9AD 5%, #59D84E 13%, #3BB230 40%, #F4F5Fc 65%, #FFFFFF 100%'),
			new ColorMap('#111111 0%, #222222 1%, #a00000 10%, #ff0000 50%, #e06c00 70%, #ffff00 100%'),
			new ColorMap('#9989dd 0%, #ab99ff 1%, #c0b2ff 5%, #eaeaff 10%, #FFFFFF 100%'),
			new ColorMap('#3a3a3a 0%, #9a9ba5 100%'),
			new ColorMap('#d6d482 0%, #fff9ad 15%, #ffffff 100%'),
			new ColorMap('#8788c1 0%, #56567c 1%, #444444 2%, #6b6c9b 50%, #ffffff 100%'),
			new ColorMap('#772582 0%, #f9d3ff 10%, #bd15d3 20%, #530053 100%'),
			new ColorMap('#ffffff 0%, #feffc6 15%, #faff00 50%, #ffffff 100%'),
			new ColorMap('#200024 0%, #74007f 20%, #000000 30%, #de02f2 80%, #ffffff 100%'),
			new ColorMap('#8cc3ff 0%, #e3effc 1%, #adba50 15%, #6b7232 60%, #000000 100%'),
			new ColorMap('#562727 0%, #a04949 1%, #e27cc9 15%, #ba1891 50%, #ce009a 70%, #f9ace6 80%, #ffffff 100%'),
			new ColorMap('#2d2d2d 0%, #474747 1%, #ffb200 50%, #ffffff 70%, #ffffff 100%'),
		];

		let points = iso;

		this.pos_buffer = new Float32Array(points.length*this.p_fpv);
		this.col_buffer = new Float32Array(points.length*this.c_fpv);
		this.nrm_buffer = new Float32Array(points.length*this.n_fpv);

		let pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < this.p_fpv; j++, pos_ind++){
				this.pos_buffer[pos_ind] = points[i][j];
			}
		}

		noise.seed(Math.random());
		let roughness = map(Math.random(), 0, 1, .5, 2);
		let terrain_height = map(Math.random(), 0, 1, .1, .25)
		let sea_height = map(Math.random(), 0, 1, .25, 1);
		let color_map = this.color_maps[Math.floor(map(Math.random(), 0, 1, 0, this.color_maps.length))];

		let height_map = {};
		for(let i = 0; i < this.pos_buffer.length; i += this.p_fpv){
			let point = norm(this.pos_buffer.slice(i, i + 3));
			let lookup = point[0].toString() + ',' + point[1].toString() + ',' + point[2].toString();
			let terrain = 0;
			if(!(lookup in height_map)){
				for(let j = 0; j < this.terrain_scales.length; j++){
					terrain += this.terrain_weights[j]*noise.perlin3(roughness*this.terrain_scales[j]*point[0],
																													 roughness*this.terrain_scales[j]*point[1],
																													 roughness*this.terrain_scales[j]*point[2]);
				}
				terrain = max(Math.pow(terrain, 1.75)*terrain_height + sea_height, sea_height);
				height_map[lookup] = terrain;
			}
			else{
				terrain = height_map[lookup];
			}
			let noised = mult(point, terrain);
			for(let j = 0; j < 3; j++){
				this.pos_buffer[i + j] = noised[j];
			}
		}

		for(let i = 0; i < this.col_buffer.length; i += this.c_fpv){
			let len = magnitude(this.pos_buffer.slice(i/this.c_fpv*this.p_fpv, i/this.c_fpv*this.p_fpv + this.p_fpv));
			let mapped = color_map.map(len, sea_height, sea_height + terrain_height);
			this.col_buffer[i + 0] = mapped.r;
			this.col_buffer[i + 1] = mapped.g;
			this.col_buffer[i + 2] = mapped.b;
			this.col_buffer[i + 3] = 1.0;
		}


		let normals = {};
		let nrm_ind = 0;
		for(let i = 0; i < this.pos_buffer.length; i += 3*this.p_fpv){
			let a = this.pos_buffer.slice(i + 0, i + 3);
			let b = this.pos_buffer.slice(i + 3, i + 6);
			let c = this.pos_buffer.slice(i + 6, i + 9);

			let n = norm(cross(sub(a, b), sub(c, b)));

			let a_look = a[0].toString() + ',' + a[1].toString() + ',' + a[2].toString();
			let b_look = b[0].toString() + ',' + b[1].toString() + ',' + b[2].toString();
			let c_look = c[0].toString() + ',' + c[1].toString() + ',' + c[2].toString();

			let looks = [a_look, b_look, c_look];

			for(let j = 0; j < looks.length; j++)
			if(!(looks[j] in normals)){
				normals[looks[j]] = mult(n, 1/6);
			}
			else{
				normals[looks[j]] = add(normals[looks[j]], mult(n, 1/6));
			}
		}
		for(let i = 0; i < this.pos_buffer.length; i += this.p_fpv){
			let point = this.pos_buffer.slice(i, i + 3);
			let look = point[0].toString() + ',' + point[1].toString() + ',' + point[2].toString();

			this.nrm_buffer[i] = normals[look][0];
			this.nrm_buffer[i + 1] = normals[look][1];
			this.nrm_buffer[i + 2] = normals[look][2];
		}

		this.transform = new Matrix4();

		this.rotation_speed = map(Math.random(), 0, 1, -30, 30);
		this.rotation = 0;

		this.orbit_speed = map(Math.random(), 0, 1, 10, 20);
		this.orbit_radius = map(Math.random(), 0, 1, 5, 20);
		this.orbit = Math.random()*360;
	}

	init_buffers(){
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		//position buffer
		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.STATIC_DRAW);

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		//color buffer
		this.gl_col_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.col_buffer, gl.STATIC_DRAW);

		this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);
		gl.enableVertexAttribArray(this.a_Color);

		//normal buffer
		this.gl_nrm_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.nrm_buffer, gl.STATIC_DRAW);

		this.a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
		gl.vertexAttribPointer(this.a_Normal, this.n_fpv, gl.FLOAT, false, this.fsize * this.n_fpv, 0);
		gl.enableVertexAttribArray(this.a_Normal);
	}

	draw(u_ModelMatrix){Math.floor(map(Math.random(), 0, 1, 0, this.color_maps.length))
		pushMatrix(modelMatrix);
		modelMatrix.multiply(this.transform);

		//position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//color buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		//color buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf);
		gl.vertexAttribPointer(this.a_Normal, this.n_fpv, gl.FLOAT, false, this.fsize * this.n_fpv, 0);

		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES, 0, this.pos_buffer.length / this.p_fpv);

		modelMatrix = popMatrix();
	}

	update(elapsed){
		this.rotation += this.rotation_speed*elapsed/1000;
		this.orbit += this.orbit_speed*elapsed/1000;

		this.transform.setTranslate(0, 0, 0);
		this.transform.rotate(this.orbit, 0, 0, 1); //planet orbit
		this.transform.translate(this.orbit_radius, 0, 0);
		this.transform.rotate(this.rotation, 0, 0, 1); //planet rotation
	}

}
