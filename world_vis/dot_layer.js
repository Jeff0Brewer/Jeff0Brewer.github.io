class Dots{
	constructor(p_fpv, c_fpv, num, bounds){
		this.p_fpv = p_fpv;
		this.c_fpv = c_fpv;

		this.p = [];

		let f = .2;
		let axes = [
			norm([Math.cos(0*Math.PI*2/5)*f, Math.sin(0*Math.PI*2/5)*f, 1]),
			norm([Math.cos(1*Math.PI*2/5)*f, Math.sin(1*Math.PI*2/5)*f, 1]),
			norm([Math.cos(2*Math.PI*2/5)*f, Math.sin(2*Math.PI*2/5)*f, 1]),
			norm([Math.cos(3*Math.PI*2/5)*f, Math.sin(3*Math.PI*2/5)*f, 1]),
			norm([Math.cos(4*Math.PI*2/5)*f, Math.sin(4*Math.PI*2/5)*f, 1])
		];

		let colors = [[1], [0, 1], [0], [0, 2], [2]];

		let as = 2*Math.PI/num;
		for(let i = 0; i < num; i++){
			this.p.push(new P_Dot(as*i, axes[i % axes.length], -1*map(Math.random(), 0, 1, Math.PI/10, Math.PI/3), pow_map(Math.random(), 0, 1, .7, .995, .5), mult(bounds, map(Math.random(), 0, 1, .5, 1)), 1));
		}

		this.pos_buffer = new Float32Array(this.p.length*(this.p[0].pos.length + 2)*this.p_fpv);
		this.col_buffer = new Float32Array(this.p.length*(this.p[0].pos.length + 2)*this.c_fpv);

		let pos_ind = 0;
		let col_ind = 0;
		for(let i = 0; i < this.p.length; i++){
			let c = Math.random() < .7 ? i % axes.length : Math.floor(Math.random()*axes.length);
			for(let j = 0; j < this.p[i].pos.length; j++){
				let d = 1;
				d += j == 0 ? 1 : 0;
				d += j == this.p[i].pos.length - 1 ? 1 : 0;
				for(let b = 0; b < d; b++){
					for(let l = 0; l < this.p[i].pos[j].length; l++, pos_ind++){
						this.pos_buffer[pos_ind] = this.p[i].pos[j][l];
					}
					let o = d > 1 && (j == 0 || j == this.p[i].pos.length - 1) ? 0 : 1;
					let s = map(j, 0, this.p[i].pos.length, 0, 1);
					let color = [s, s, s, o];
					for(let l = 0; l < colors[c].length; l++)
						color[colors[c][l]] = 1;
					for(let l = 0; l < color.length; l++, col_ind++){
						this.col_buffer[col_ind] = color[l];
					}
				}
			}
		}
	}

	init_buffers(){
		this.fsize = this.pos_buffer.BYTES_PER_ELEMENT;

		this.a_Position = gl.getAttribLocation(gl.program, "a_Position");
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);
		gl.enableVertexAttribArray(this.a_Position);

		this.gl_pos_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);

		this.a_Color = gl.getAttribLocation(gl.program, "a_Color");
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);
		gl.enableVertexAttribArray(this.a_Color);

		this.gl_col_buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.col_buffer, gl.STATIC_DRAW);
	}

	draw(u_ModelMatrix){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_pos_buf);
		gl.bufferData(gl.ARRAY_BUFFER, this.pos_buffer, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Position, this.p_fpv, gl.FLOAT, false, this.fsize * this.p_fpv, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_col_buf);
		gl.vertexAttribPointer(this.a_Color, this.c_fpv, gl.FLOAT, false, this.fsize * this.c_fpv, 0);

		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.drawArrays(gl.LINE_STRIP, 0, this.pos_buffer.length / this.p_fpv);
	}

	update(elapsed, r){
		let pos_ind = 0;
		for(let i = 0; i < this.p.length; i++){
			this.p[i].update(elapsed, r);
			for(let j = 0; j < this.p[i].pos.length; j++){
				let d = 1;
				d += j == 0 ? 1 : 0;
				d += j == this.p[i].pos.length - 1 ? 1 : 0;
				for(let b = 0; b < d; b++){
					for(let l = 0; l < this.p[i].pos[j].length; l++, pos_ind++){
						this.pos_buffer[pos_ind] = this.p[i].pos[j][l];
					}
				}
			}
		}
	}
}

class P_Dot{
	constructor(angle, axis, spd, size, bounds, scl){
		this.pos = [];
		for(let i = 0; i < 8; i++)
			this.pos.push([0, 0, 0]);
		this.angle = angle;
		this.axis = axis;
		this.spd = spd;
		this.bounds = bounds;
		this.r = 0;
		this.size = size;

		this.st = [Math.cos(this.angle), Math.sin(this.angle), 0];

		this.px = Math.random()*100/scl;
		this.py = Math.random()*100/scl;
		this.pz = Math.random()*100/scl;
		this.scl = scl;
	}

	update(elapsed, r){
		this.angle += this.spd*elapsed/1000;
		this.r = this.r*this.size + r*(1 - this.size);

		let base = rotateabout(mult(this.st, this.r), this.axis, this.angle);
		this.px += this.scl*elapsed/1000;
		this.py += this.scl*elapsed/1000;
		this.pz += this.scl*elapsed/1000;

		let pos = [
			map(noise.perlin2(this.px, 0), -1, 1, this.bounds[0], this.bounds[1]),
			map(noise.perlin2(this.py, 0), -1, 1, this.bounds[0], this.bounds[1]),
			map(noise.perlin2(this.pz, 0), -1, 1, this.bounds[0], this.bounds[1])
		];
		pos = add(pos, base);

		this.pos.shift();
		this.pos.push(pos);
	}
}
