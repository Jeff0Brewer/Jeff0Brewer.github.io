class Vis{
	constructor(p_fpv, n_fpv, detail, translation, axis){
		let iso = generate_isosphere_triangles(5);

		let points = [];
		for(let t = 0; t < iso.length; t += 3){
			let in_bounds = [false, false, false];
			for(let p = 0; p < 3; p++){
				if(iso[t + p][2] <= 0){
					in_bounds[p] = true;
				}
			}
			if(in_bounds[0] || in_bounds[1] || in_bounds[2]){
				for(let p = 0; p < 3; p++){
					points.push(iso[t + p]);
				}
			}
		}

		this.p_fpv = p_fpv;
		this.n_fpv = n_fpv;

		this.pos_buffer_sph = new Float32Array(points.length*this.p_fpv);
		this.nrm_buffer_sph = new Float32Array(points.length*this.n_fpv);

		let pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer_sph[pos_ind] = points[i][j];
			}
		}

		let normals = {};
		let normals_c = {};
		let nrm_ind = 0;
		for(let i = 0; i < this.pos_buffer_sph.length; i += 3*this.p_fpv){
			let a = this.pos_buffer_sph.slice(i + 0, i + 3);
			let b = this.pos_buffer_sph.slice(i + 3, i + 6);
			let c = this.pos_buffer_sph.slice(i + 6, i + 9);

			let n = norm(cross(sub(a, b), sub(c, b)));

			let a_look = a[0].toString() + ',' + a[1].toString() + ',' + a[2].toString();
			let b_look = b[0].toString() + ',' + b[1].toString() + ',' + b[2].toString();
			let c_look = c[0].toString() + ',' + c[1].toString() + ',' + c[2].toString();

			let looks = [a_look, b_look, c_look];

			for(let j = 0; j < looks.length; j++){
				if(!(looks[j] in normals)){
					normals[looks[j]] = n;
					normals_c[looks[j]] = 1;
				}
				else{
					normals[looks[j]] = add(normals[looks[j]], n);
					normals_c[looks[j]]++;
				}
			}
		}
		for(let i = 0; i < this.pos_buffer_sph.length; i += this.p_fpv){
			let point = this.pos_buffer_sph.slice(i, i + 3);
			let look = point[0].toString() + ',' + point[1].toString() + ',' + point[2].toString();

			this.nrm_buffer_sph[i] = -normals[look][0]/normals_c[look];
			this.nrm_buffer_sph[i + 1] = -normals[look][1]/normals_c[look];
			this.nrm_buffer_sph[i + 2] = -normals[look][2]/normals_c[look];
		}

		for(let i = 2; i < this.pos_buffer_sph.length; i += this.p_fpv){
			if(this.pos_buffer_sph[i] > 0)
				this.pos_buffer_sph[i] = 0;
		}


		let squares = [];
		let step = 2/detail;
		let splits = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
		for(let x = 0; x <= 1; x += step){
			for(let y = 0; y <= 1; y += step){
				for(let s = 0; s < splits.length; s++){
					let square = [];
					square.push([x*splits[s][0], y*splits[s][1], 0]);
					square.push([(x + step)*splits[s][0], y*splits[s][1], 0]);
					square.push([(x + step)*splits[s][0], (y + step)*splits[s][1], 0]);
					square.push([x*splits[s][0], (y + step)*splits[s][1], 0]);
					let outside = [];
					for(let i = 0; i < square.length; i++){
						outside.push(magnitude(square[i]) > 1);
					}
					if(!(outside[0] || outside[1] || outside[2] || outside[3])){
						if(splits[s][0]*splits[s][1] > 0){
							let t = square.shift();
							square.reverse();
							square.unshift(t);
						}
						squares.push(square);
					}
					else if(!(outside[0] && outside[1] && outside[2] && outside[3])){
						let new_square = [];
						new_square.push(square[0]);
						if(!(outside[0] || outside[1] || outside[3])){
							let p1 = [(x + step)*splits[s][0], Math.sqrt(1 - Math.pow(x + step, 2))*splits[s][1], 0];
							let p2 = [Math.sqrt(1 - Math.pow(y + step, 2))*splits[s][0], (y + step)*splits[s][1], 0];
							new_square.push(square[1]);
							new_square.push(p1);
							new_square.push(norm(midpoint(p1, p2)));
							new_square.push(p2);
							new_square.push(square[3]);
						}
						else if(outside[1] && outside[3]){
							let p1 = [Math.sqrt(1 - y*y)*splits[s][0], y*splits[s][1], 0];
							let p2 = [x*splits[s][0], Math.sqrt(1 - x*x)*splits[s][1], 0];
							new_square.push(p1);
							new_square.push(norm(midpoint(p1, p2)));
							new_square.push(p2);
						}
						else if(outside[1]){
							let p1 = [Math.sqrt(1 - y*y)*splits[s][0], y*splits[s][1], 0];
							let p2 = [Math.sqrt(1 - Math.pow(y + step, 2))*splits[s][0], (y + step)*splits[s][1], 0];
							new_square.push(p1);
							new_square.push(norm(midpoint(p1, p2)));
							new_square.push(p2);
							new_square.push(square[3]);
						}
						else{
							let p1 = [(x + step)*splits[s][0], Math.sqrt(1 - Math.pow(x + step, 2))*splits[s][1], 0];
							let p2 = [x*splits[s][0], Math.sqrt(1 - x*x)*splits[s][1], 0];
							new_square.push(square[1]);
							new_square.push(p1);
							new_square.push(norm(midpoint(p1, p2)));
							new_square.push(p2);
						}
						if(splits[s][0]*splits[s][1] > 0){
							let t = new_square.shift();
							new_square.reverse();
							new_square.unshift(t);
						}

						squares.push(new_square);
					}
				}
			}
		}

		points = [];

		let square_end = points.length;
		let square_inds = [];
		for(let s = 0; s < squares.length; s++){
			for(let p = 0; p < squares[s].length; p++){
				let np = (p + 1) % squares[s].length;
				points.push([squares[s][p][0], squares[s][p][1], 0]);
				points.push([squares[s][np][0], squares[s][np][1], 0]);
				points.push([squares[s][np][0], squares[s][np][1], 1]);

				points.push([squares[s][np][0], squares[s][np][1], 1]);
				points.push([squares[s][p][0], squares[s][p][1], 1]);
				points.push([squares[s][p][0], squares[s][p][1], 0]);

				if(p > 1){
					points.push([squares[s][0][0], squares[s][0][1], 1]);
					points.push([squares[s][p - 1][0], squares[s][p - 1][1], 1]);
					points.push([squares[s][p][0], squares[s][p][1], 1]);
				}
			}
			square_inds.push(points.length);
		}

		this.pos_buffer_grd = new Float32Array(points.length*this.p_fpv);
		this.nrm_buffer_grd = new Float32Array(points.length*this.n_fpv);

		this.change_inds = [[]];
		this.step = step;

		pos_ind = 0;
		for(let i = 0; i < points.length; i++){
			if(i > square_inds[this.change_inds.length - 1])
				this.change_inds.push([]);
			for(let j = 0; j < points[i].length; j++, pos_ind++){
				this.pos_buffer_grd[pos_ind] = points[i][j];
				if(j == points[i].length - 1 && points[i][j] > 0){
					this.change_inds[this.change_inds.length - 1].push(pos_ind);
				}
			}
		}

		nrm_ind = 0;
		for(let i = 0; i < this.pos_buffer_grd.length; i += 3*this.p_fpv){
			let a = this.pos_buffer_grd.slice(i + 0, i + 3);
			let b = this.pos_buffer_grd.slice(i + 3, i + 6);
			let c = this.pos_buffer_grd.slice(i + 6, i + 9);

			let fn = norm(cross(sub(a, b), sub(c, b)));
			let n = [fn, fn, fn];

			let pts = [[a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0]];
			let cyl = true;
			for(let p = 0; p < 3; p++){
				cyl = cyl && soft_comp(magnitude(pts[p]), 1, .01);
			}
			if(cyl)
				n = pts.slice();

			for(let p = 0; p < 3; p++){
				for(let j = 0; j < n.length; j++, nrm_ind++){
					this.nrm_buffer_grd[nrm_ind] = n[p][j];
				}
			}
		}

		this.translate = translation.slice();
		this.scale = detail/16;
		this.rotate = 45;
		this.rotate_speed = 15;
		this.axis = axis.slice();

		this.ns = .15;
		this.nx = Math.random()*100/this.ns;
		this.ny = Math.random()*100/this.ns;
		this.offset = 0;

		this.transform = new Matrix4();

		this.transform.translate(translation[0], translation[1], translation[2]);
		this.transform.scale(detail/16, detail/16, detail/16);

		this.height = detail/8;

		this.p = [0, 0, 0, 1];
	}

	init_buffers(){
		this.fsize = this.pos_buffer_sph.BYTES_PER_ELEMENT;

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
		gl.vertexAttribPointer(this.a_Normal, this.n_fpv, gl.FLOAT, false, this.fsize * this.n_fpv, 0);
		gl.enableVertexAttribArray(this.a_Normal);

		//position buffer sphere
		this.gl_pos_buf_sph = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf_sph);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer_sph, gl.STATIC_DRAW);

		//normal buffer sphere
		this.gl_nrm_buf_sph = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf_sph);
		gl.bufferData(gl.ARRAY_BUFFER, this.nrm_buffer_sph, gl.STATIC_DRAW);

		//position buffer grid
		this.gl_pos_buf_grd = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf_grd);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer_grd, gl.DYNAMIC_DRAW);

		//normal buffer grid
		this.gl_nrm_buf_grd = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf_grd);
		gl.bufferData(gl.ARRAY_BUFFER, this.nrm_buffer_grd, gl.STATIC_DRAW);

		this.u_Color = gl.getUniformLocation(gl.program, 'u_Color');
		this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
		this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	}

	draw(){
		//position buffer sphere
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf_sph);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//normal buffer sphere
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf_sph);
		gl.vertexAttribPointer(this.a_Normal, this.n_fpv, gl.FLOAT, false, this.fsize * this.n_fpv, 0);

		//drawing sphere
		let p = new Vector4([0, 0, 0, 1]);
		pushMatrix(modelMatrix);
		modelMatrix.rotate(this.rotate + this.offset, this.axis[0], this.axis[1], this.axis[2]);
		modelMatrix.concat(this.transform);
		modelMatrix.rotate(-(this.rotate + this.offset), this.axis[0], this.axis[1], this.axis[2]);
		modelMatrix.rotate(45, 0, 0, 1);
		this.p = modelMatrix.multiplyVector4(p).elements;
		gl.uniformMatrix4fv(this.u_ModelMatrix, false, modelMatrix.elements);

		let normalMatrix = new Matrix4();
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);

		gl.uniform4fv(this.u_Color, [1, 1, 1, 1]);
		gl.drawArrays(gl.TRIANGLES, 0, this.pos_buffer_sph.length / this.p_fpv);

		//position buffer grid
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf_grd);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer_grd, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		//normal buffer grid
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_nrm_buf_grd);
		gl.vertexAttribPointer(this.a_Normal, this.n_fpv, gl.FLOAT, false, this.fsize * this.n_fpv, 0);

		//drawing grid
		modelMatrix.translate(0, 0, -.002);
		gl.uniformMatrix4fv(this.u_ModelMatrix, false, modelMatrix.elements);
		modelMatrix.translate(0, 0, .002);
		gl.drawArrays(gl.TRIANGLES, 0, this.pos_buffer_grd.length / this.p_fpv);
		modelMatrix = popMatrix();

	}

	update(elapsed, fData){
		let fData_trimmed = fData.slice(0, Math.floor(fData.length*.7));
		fData = [];
		let exp = 2;
		for(let i = 0; i < Math.sqrt(fData_trimmed.length); i++){
			fData.push(average(fData_trimmed.slice(Math.pow(i, exp), Math.pow(i + 1, exp))));
		}

		for(let i = 0; i < this.change_inds.length; i++){
			let data_i = Math.floor(map(magnitude([this.pos_buffer_grd[this.change_inds[i][2] - 2], this.pos_buffer_grd[this.change_inds[i][2] - 1]]), 0, 1, 0, fData.length));
			let height = pow_map(fData[data_i], 0, 255, 0, this.height, 2);
			for(let j = 0; j < this.change_inds[i].length; j++){
				this.pos_buffer_grd[this.change_inds[i][j]] = height;
			}
		}

		this.rotate += this.rotate_speed*elapsed/1000;

		this.nx += this.ns*elapsed/1000;
		this.offset = map(noise.perlin2(this.nx, this.ny), -1, 1, -45, 45);

		return fData;
	}
}
