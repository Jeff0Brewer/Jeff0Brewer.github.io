function generate_isosphere(iterations){
	let t = (1.0 + Math.sqrt(5.0)) / 2.0;
	let vertices = [
		[-1,t,0],
		[1,t,0],
		[-1,-t,0],
		[1,-t,0],
		[0,-1,t],
		[0,1,t],
		[0,-1,-t],
		[0,1,-t],
		[t,0,-1],
		[t,0,1],
		[-t,0,-1],
		[-t,0,1]
	];

	let triangles = [
		[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
		[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
		[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
		[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
	];

	for(let iteration = 0; iteration < iterations; iteration++){
		let new_tri = [];
		let new_vert = [];
		for(let t = 0; t < triangles.length; t++){
			let a = midpoint(vertices[triangles[t][0]], vertices[triangles[t][1]]);
			let b = midpoint(vertices[triangles[t][1]], vertices[triangles[t][2]]);
			let c = midpoint(vertices[triangles[t][0]], vertices[triangles[t][2]]);

			let ind = new_vert.length;

			for(let i = 0; i < 3; i++){
				new_vert.push(vertices[triangles[t][i]])
			}
			new_vert.push(a);
			new_vert.push(b);
			new_vert.push(c);


			new_tri.push([ind + 0, ind + 3, ind + 5]);
			new_tri.push([ind + 1, ind + 4, ind + 3]);
			new_tri.push([ind + 2, ind + 5, ind + 4]);
			new_tri.push([ind + 3, ind + 4, ind + 5]);
		}
		for(let v = 0; v < new_vert.length; v++){
			new_vert[v] = norm(new_vert[v]);
		}
		triangles = new_tri.slice();
		vertices = new_vert.slice();
	}

	let points = [];

	for(let t = 0; t < triangles.length; t++){
		for(let v = 0; v < triangles[t].length; v++){
			points.push(vertices[triangles[t][v]]);
		}
	}

	return points;
}
