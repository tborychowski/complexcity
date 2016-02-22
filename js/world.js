/*globals THREE, GrowingPacker */

function ensureDefaults (cfg) {
	cfg.x = cfg.x || 0;
	cfg.z = cfg.z || 0;
	cfg.w = cfg.w || 1;
	cfg.h = cfg.h || 1;
	cfg.color = cfg.color ? new THREE.Color(cfg.color) : 0xcccccc;
	return cfg;
}



function World () {
	this.init();
}

World.prototype.init = function () {
	var ww = window.innerWidth, wh = window.innerHeight;
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setSize(ww, wh);
	this.renderer.setClearColor(0xffffff, 1);

	this.scene = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera(45, ww / wh, 1, 1000);
	this.camera.position.set(0, 20, 20);
	this.camera.lookAt(this.scene.position);

	this.scene.add(this.camera);

	this.camCtrl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	this.camCtrl.target.set(0, 0, 0);
	this.bounds = {};

	document.body.appendChild(this.renderer.domElement);
	this.render();
};


World.prototype.render = function () {
	this.camCtrl.update();
	this.renderer.render(this.scene, this.camera);
	requestAnimationFrame(this.render.bind(this));
};


World.prototype.floor = function (cfg) {
	cfg = ensureDefaults(cfg);
	this.bounds = {
		x: cfg.x,
		x2: cfg.x / 2,
		z: cfg.z,
		z2: cfg.z / 2
	};
	var material = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide });
	var geometry = new THREE.PlaneGeometry(cfg.x + 0.5, cfg.z + 0.5);
	var floor = new THREE.Mesh(geometry, material);

	floor.position.y = -0.001;
	floor.rotation.x = Math.PI / 2;
	this.scene.add(floor);


	var pointLight = new THREE.PointLight(0xffffff);	// center
	pointLight.position.set(0, 20, 0);
	this.scene.add(pointLight);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(-cfg.x, 10, -cfg.z / 2);
	this.scene.add(pointLight);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(cfg.x / 2, 40, cfg.z);
	this.scene.add(pointLight);
};


// World.prototype.carpet = function (cfg) {
// 	cfg = ensureDefaults(cfg);

// 	var material = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide });
// 	var geometry = new THREE.PlaneGeometry(cfg.w + 0.3, cfg.h + 0.3);
// 	var carpet = new THREE.Mesh(geometry, material);
// 	carpet.position.x = cfg.x - this.bounds.x2 + (cfg.w / 2);
// 	carpet.position.z = cfg.z - this.bounds.z2 + (cfg.h / 2);

// 	carpet.rotation.x = Math.PI / 2;
// 	this.scene.add(carpet);
// };


World.prototype.block = function (cfg) {
	cfg = ensureDefaults(cfg);

	var geometry = new THREE.CubeGeometry(1, 1, 1);
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

	geometry.faces.splice(6, 2);	// remove bottom for optimization
	var material = new THREE.MeshLambertMaterial({ color: cfg.color });
	var cube = new THREE.Mesh(geometry, material);

	var x = cfg.x - this.bounds.x2 + (cfg.w / 2);
	var z = cfg.z - this.bounds.z2 + (cfg.w / 2);
	cube.position.set(x, 0.01, z);

	cube.scale.x = cfg.w;
	cube.scale.z = cfg.w;
	cube.scale.y = cfg.h;

	this.scene.add(cube);

	// var edges = new THREE.EdgesHelper(cube, 0x000000);
	// this.scene.add(edges);
};


World.prototype.draw = function (blocks) {
	this.floor({ x: this.maxx, z: this.maxz, color: '#444' });

	blocks.forEach(function (b) {
		this.block(b);
	}.bind(this));
};


World.prototype.distribute = function (blocks) {
	var packer = new GrowingPacker(), maxx = 0, maxz = 0, margin = 0.1;

	blocks = blocks.map(function (b) {
		return { block: b, w: b.w + margin, h: b.w + margin };
	});

	blocks = packer.fit(blocks);
	console.log(blocks.filter(function (b) { return !b.fit; }));

	blocks.sort(function (a, b) {
		return b.w < a.w;
	});

	blocks = blocks.map(function (b) {
		// FIXME: for some reason some don't have fit
		if (!b.fit) {
			b.fit = { x: -5, y: -5 };
		}

		maxx = Math.max(maxx, b.fit.x + b.w);
		maxz = Math.max(maxz, b.fit.y + b.h);
		return {
			x: b.fit.x,
			z: b.fit.y,
			w: b.block.w,
			h: b.block.h,
			color: b.block.color
		};
	}.bind(this));


	this.maxx = maxx;
	this.maxz = maxz;
	console.log('size ', maxx, maxz);
	return blocks;
};
