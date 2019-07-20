class CameraController{
	constructor(cam, focus, up, rot_speed, zoom_speed){
		this.dragging = false;
		this.mouse = {
			x: 0,
			y: 0,
		};
		this.rotation = new Matrix4();
		this.camera = {
			x: cam[0],
			y: cam[1],
			z: cam[2],
			speed: {
				rotation: rot_speed,
				zoom: zoom_speed,
			},
		};
		this.focus = {
			x: focus[0],
			y: focus[1],
			z: focus[2],
		};
		this.up = {
			x: up[0],
			y: up[1],
			z: up[2],
		}
	}

	mousedown(e){
		this.dragging = true;
		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
	}

	mousemove(e){ //CANNED, only works for cam position of [0, 0, >0]
		if(this.dragging){
			let dx = this.camera.speed.rotation * (e.clientX - this.mouse.x);
			let dy = this.camera.speed.rotation * (e.clientY - this.mouse.y);

			let i_rot = new Matrix4();
			i_rot.setInverseOf(this.rotation);

			let v1 = new Vector3();
			v1.elements = [1, 0, 0];
			let a1 = i_rot.multiplyVector3(v1).elements;

			let v2 = new Vector3();
			v2.elements = [0, 1, 0];
			let a2 = i_rot.multiplyVector3(v2).elements;

			this.rotation.rotate(dy, a1[0], a1[1], a1[2]);
			this.rotation.rotate(dx, a2[0], a2[1], a2[2]);

			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
		}
		return this.dragging;
	}

	mouseup(e){
		this.dragging = false;
	}

	wheel(e){
		let camvec = [this.camera.x - this.focus.x, this.camera.y - this.focus.y, this.camera.z - this.focus.z];
		let resized = resize(camvec, e.deltaY*this.camera.speed.zoom);
		if(Math.sign(resized[0]) == Math.sign(camvec[0]) && Math.sign(resized[1]) == Math.sign(camvec[1]) && Math.sign(resized[2]) == Math.sign(camvec[2])){
			this.camera.x = this.focus.x + resized[0];
			this.camera.y = this.focus.y + resized[1];
			this.camera.z = this.focus.z + resized[2];
		}
	}
}
