function rand (max, min) {
	min = min || 0;
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getData () {
	// var srcData = [
	// 	{ loc: 200, cplx: 5,  func: 20 },
	// 	{ loc: 100, cplx: 10, func: 10 },
	// 	{ loc: 50,  cplx: 1,  func: 10 },
	// 	{ loc: 40,  cplx: 3,  func: 2 },
	// 	{ loc: 10,  cplx: 1,  func: 1 },
	// ];

	// var srcData = [], i = 0, l = 50;
	// for (; i < l; i++) {
	// 	srcData.push({ name: 'filename', loc: rand(10, 1000), cplx: rand(1, 20), func: rand(1, 50) });
	// }
	return window.data;
}
