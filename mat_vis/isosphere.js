//generate an isosphere with given iterations
function gen_iso(iter){ 
	//init base with 20 sides
	let f = (1.0 + Math.sqrt(5.0)) / 2.0; 
	let v = [[-1,f,0],[1,f,0],[-1,-f,0],
			 [1,-f,0],[0,-1,f],[0,1,f],
			 [0,-1,-f],[0,1,-f],[f,0,-1],
			 [f,0,1],[-f,0,-1],[-f,0,1]];
	let t = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
			 [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
			 [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
			 [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
	for(let i = 0; i < v.length; i++)
		v[i] = norm(v[i]);

	//iteratively convert every one triangle into 4 and normalize vertices
	for(let i = 0; i < iter; i++){
		let n_v = [];
		let n_t = [];
		for(let j = 0; j < t.length; j++){
			let a = norm(midpoint(v[t[j][0]], v[t[j][1]]));
			let b = norm(midpoint(v[t[j][1]], v[t[j][2]]));
			let c = norm(midpoint(v[t[j][0]], v[t[j][2]]));
			let l = n_v.length;

			for(let k = 0; k < 3; k++)
				n_v.push(v[t[j][k]]);
			n_v = n_v.concat([a,b,c]);
			n_t = n_t.concat([[l+0,l+3,l+5]],[[l+1,l+4,l+3]],
							 [[l+2,l+5,l+4]],[[l+3,l+4,l+5]]);
		}
		v = n_v.slice();
		t = n_t.slice();
	}

	//return pairs of vertices for wireframe mesh
	let o = [];
	for(let i = 0; i < t.length; i++){
		o = o.concat([v[t[i][0]]],[v[t[i][1]]],
					 [v[t[i][1]]],[v[t[i][2]]],
					 [v[t[i][0]]],[v[t[i][2]]]);
	}
	return o;
}