class Tile{
	constructor(raw_text){
		this.rects = [];
		this.points = [[], [], []];

		let data = raw_text.split("P");
	  let lines = data[0].split("\n");
	  for (let i = 0; i < lines.length - 1; i++) {
	    let line = lines[i];

			let splitted = lines[i].split('|');
			let pos = splitted[0];
			let color = splitted[1];

			pos = pos.split(' ');
			for(let j = 0; j < pos.length; j++){
				pos[j] = pos[j].split(',');
				for(let l = 0; l < pos[j].length; l++){
					pos[j][l] = parseFloat(pos[j][l]);
				}
			}

			color = color.split(',');
			let col = [];
			for(let j = 0; j < color.length; j += 3){
				col.push([parseFloat(color[j + 0]), parseFloat(color[j + 1]), parseFloat(color[j + 2])]);
			}

			this.rects.push(new Rectangle(p_fpv, c_fpv, pos[0], pos[1], col));
	  }
		lines = data[1].split("\n");
		for(let i = 0; i < lines.length - 1; i++){
			let line = lines[i];

			let splitted = lines[i].split(" ");
			let pos = splitted[0];
			let col = splitted[1];
			let siz = splitted[2];

			pos = pos.split(",");
			for(let j = 0; j < pos.length; j++){
				pos[j] = parseFloat(pos[j]);
			}
			col = col.split(",");
			for(let j = 0; j < col.length; j++){
				col[j] = parseFloat(col[j]);
			}
			siz = parseFloat(siz);

			this.points[0].push(pos);
			this.points[1].push(col);
			this.points[2].push([siz]);
		}

		this.left_point = [100000000, 0];
		this.right_point = [-10000000, 0];

		for(let i = 0; i < this.rects.length; i++){
			this.left_point = this.left_point[0] < this.rects[i].lt[0] ? this.left_point : this.rects[i].lt.slice();
			this.right_point = this.right_point[0] > this.rects[i].rb[0] ? this.right_point : [this.rects[i].rb[0], this.rects[i].lt[1]];
		}
	}
}
