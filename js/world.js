/*globals THREE, GrowingPacker */

// tooltip example: view-source:http://stemkoski.github.io/Three.js/Mouse-Tooltip.html

function ensureDefaults (cfg) {
	cfg.x = cfg.x || 0;
	cfg.z = cfg.z || 0;
	cfg.w = cfg.w || 1;
	cfg.h = cfg.h || 1;
	cfg.color = cfg.color ? new THREE.Color(cfg.color) : 0xcccccc;
	return cfg;
}

var colors = [
	'#00701C',	// dark green
	'#00F13D',	// green
	'#F6FF43',	// yellow
	'#FF9B30',	// orange
	'#FF0121'	// red
];

function getMaxes(max, data) {
	data.forEach(d => {
		max.loc = Math.max(max.loc, d.loc);
		max.cplx = Math.max(max.cplx, d.cplx);
		max.func = Math.max(max.func, d.func);
	});
	return max;
}


class World {

	constructor(data) {
		this.data = this.translate(data);

		const ww = window.innerWidth, wh = window.innerHeight;
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(ww, wh);
		this.renderer.setClearColor(0xffffff, 1);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(45, ww / wh, 0.01, 1000);
		this.camera.position.set(0, 10, 10);
		this.camera.lookAt(this.scene.position);

		this.scene.add(this.camera);

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);
		this.bounds = {};
		this.intersected = null;

		// initialize object to perform world/screen calculations
		this.projector = new THREE.Projector();

		document.body.appendChild(this.renderer.domElement);
		document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

		this.render().distribute();
	}

	// loc => h
	// no of functions => w
	// complexity / function => color
	translate(data) {
		var scale = { loc: 5, cplx: 5, func: 5 };
		var max = getMaxes({ loc: 0, cplx: 0, func: 0 }, data);
		return data.map(d => {
			return {
				h: d.loc * scale.loc / max.loc,
				w: d.func * scale.func / max.func,
				color: colors[Math.ceil(d.cplx * scale.cplx / max.cplx) - 1],
				data: d
			};
		});
	}


	render() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.update();
		requestAnimationFrame(this.render.bind(this));
		return this;
	}

	draw() {
		this.floor({ x: this.maxx, z: this.maxz, color: '#444' });
		this.blocks.forEach(this.block.bind(this));
		return this;
	}

	distribute() {
		var packer = new GrowingPacker(), margin = 0.1;
		this.maxx = 0;
		this.maxz = 0;

		this.blocks = this.data
			.map(b => ({ block: b, w: b.w + margin, h: b.w + margin }))
			.sort((a, b) => b.w - a.w);

		packer.fit(this.blocks);

		this.blocks = this.blocks.map(b => {
			if (!b.fit) {
				console.log('error', b);
				b.fit = { x: 0, y: 0 };
			}
			this.maxx = Math.max(this.maxx, b.fit.x + b.w);
			this.maxz = Math.max(this.maxz, b.fit.y + b.h);
			return {
				x: b.fit.x,
				z: b.fit.y,
				w: b.block.w,
				h: b.block.h,
				color: b.block.color,
				data: b.block.data
			};
		});
		return this;
	}


	floor(cfg) {
		cfg = ensureDefaults(cfg);
		this.bounds = {
			x: cfg.x,
			x2: cfg.x / 2,
			z: cfg.z,
			z2: cfg.z / 2
		};

		const material = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide });
		const geometry = new THREE.PlaneGeometry(cfg.x + 0.5, cfg.z + 0.5);
		const floor = new THREE.Mesh(geometry, material);

		floor.position.y = -0.001;
		floor.rotation.x = Math.PI / 2;
		this.scene.add(floor);


		let pointLight = new THREE.PointLight(0xffffff);	// center
		pointLight.position.set(0, 15, 0);
		this.scene.add(pointLight);

		pointLight = new THREE.PointLight(0xffffff);
		pointLight.position.set(-cfg.x, 5, cfg.z);
		this.scene.add(pointLight);

		pointLight = new THREE.PointLight(0xffffff);
		pointLight.position.set(cfg.x, 10, cfg.z);
		this.scene.add(pointLight);
	}

	carpet(cfg) {
		cfg = ensureDefaults(cfg);

		var material = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide });
		var geometry = new THREE.PlaneGeometry(cfg.w + 0.3, cfg.h + 0.3);
		var carpet = new THREE.Mesh(geometry, material);
		carpet.position.x = cfg.x - this.bounds.x2 + (cfg.w / 2);
		carpet.position.z = cfg.z - this.bounds.z2 + (cfg.h / 2);

		carpet.rotation.x = Math.PI / 2;
		this.scene.add(carpet);
	}


	block(cfg) {
		cfg = ensureDefaults(cfg);

		var geometry = new THREE.CubeGeometry(1, 1, 1);
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

		geometry.faces.splice(6, 2);	// remove bottom for optimization
		var material = new THREE.MeshLambertMaterial({ color: cfg.color });
		var cube = new THREE.Mesh(geometry, material);
		cube.userData = cfg.data || {};

		var x = cfg.x - this.bounds.x2 + (cfg.w / 2);
		var z = cfg.z - this.bounds.z2 + (cfg.w / 2);
		cube.position.set(x, 0.01, z);

		cube.scale.x = cfg.w;
		cube.scale.z = cfg.w;
		cube.scale.y = cfg.h;

		this.scene.add(cube);

		// var edges = new THREE.EdgesHelper(cube, 0x000000);
		// this.scene.add(edges);
	}





	onMouseMove(event) {
		this.mouse = {
			x: (event.clientX / window.innerWidth) * 2 - 1,
			y: -(event.clientY / window.innerHeight) * 2 + 1
		};
	}

	update() {
		if (!this.mouse) return this;
		// find intersections
		// create a Ray with origin at the mouse position and direction into the scene
		let vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
		vector.unproject(this.camera);
		let ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

		// create an array containing all objects in the scene with which the ray intersects
		let intersects = ray.intersectObjects(this.scene.children);

		// if there is one (or more) intersections
		if (intersects.length > 0) {
			// if the closest object intersected is not the currently stored intersection object
			if (intersects[0].object !== this.intersected) {
				// restore previous intersection object (if it exists) to its original color
				if (this.intersected && this.intersected.currentHex) {
					this.intersected.material.color.setHex(this.intersected.currentHex);
				}
				// store reference to closest object as current intersection object
				this.intersected = intersects[0].object;

				if (Object.keys(this.intersected.userData).length) {

					console.log(this.intersected.userData);

					// store color of closest object (for later restoration)
					this.intersected.currentHex = this.intersected.material.color.getHex();
					// set a new color for closest object
					this.intersected.material.color.setHex(0x0000ff);
				}
			}
		}
		else {
			// restore previous intersection object (if it exists) to its original color
			if (this.intersected && Object.keys(this.intersected.userData).length) {
				this.intersected.material.color.setHex(this.intersected.currentHex);
			}
			// remove previous intersection object reference
			// by setting current intersection object to "nothing"
			this.intersected = null;
		}
		this.controls.update();
	}

}

