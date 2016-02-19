var colors = [
	'#00701C',	// dark green
	'#00F13D',	// green
	'#F6FF43',	// yellow
	'#FF9B30',	// orange
	'#FF0121'	// red
];

function getMaxes(max, data) {
	data.forEach(function (d) {
		max.loc = Math.max(max.loc, d.loc);
		max.cplx = Math.max(max.cplx, d.cplx);
		max.func = Math.max(max.func, d.func);
	});
	return max;
}


// h = loc
// w = no of functions
// color = complexity / function
function translate (data) {
	var scale = { loc: 10, cplx: 5, func: 3 };
	var max = getMaxes({ loc: 0, cplx: 0, func: 0 }, data);

	return data.map(function (d) {
		return {
			h: d.loc * scale.loc / max.loc,
			w: d.func * scale.func / max.func,
			color: colors[Math.ceil(d.cplx * scale.cplx / max.cplx) - 1],
		};
	});
}


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

	var srcData = [], i = 0, l = 50;
	for (; i < l; i++) {
		srcData.push({
			loc: rand(10, 1000),
			cplx: rand(1, 20),
			func: rand(1, 50)
		});
	}

	return translate(srcData);
}
