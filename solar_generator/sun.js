class Sun{
	constructor(p_fpv, c_fpv, n_fpv, iso){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;
		this.n_fpv = n_fpv;

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

		for(let i = 0; i < this.col_buffer.length; i += this.c_fpv){
			this.col_buffer[i + 0] = 1.0;
			this.col_buffer[i + 1] = 1.0
			this.col_buffer[i + 2] = 1.0;
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
				normals[looks[j]] = mult(n, -1/6);
			}
			else{
				normals[looks[j]] = add(normals[looks[j]], mult(n, -1/6));
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

	draw(u_ModelMatrix){
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

	}

}
