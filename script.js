'use strict';

const jscomplexity = require('jscomplexity');
const fs = require('fs');
const path = require('path');

function getDirectories(root) {
	return fs.readdirSync(root)
		.filter(folder => {
			const isNotHidden = folder.indexOf('.') !== 0;
			const isDir = fs.statSync(path.join(root, folder)).isDirectory();
			return isDir && isNotHidden;
		})
		.map(folder => ({ name: folder, path: root + folder }));
}

function getStats (folder) {
	return jscomplexity(folder.path + '/**/*.js')
		.then(res => {
			folder.files = res.report.map(f => ({
				name: f.escapedPath,
				cplx: f.complexity,
				func: Math.max(f.functionCount, 1),
				loc: f.lineCount
			}));
			return folder;
		});
}

function multiple() {
	const root = 'node_modules/jscomplexity/node_modules/';
	const folders = getDirectories(root).map(getStats);
	Promise.all(folders).then(res => {
		fs.writeFile('data-multi.js', 'var dataMulti = ' + JSON.stringify(res));
	});
}

function single() {
	jscomplexity('node_modules/jscomplexity/**/*.js').then(res => {
		var files = res.report.map(f => ({
			name: f.escapedPath,
			cplx: f.complexity,
			func: Math.max(f.functionCount, 1),
			loc: f.lineCount
		}));

		require('fs').writeFile('data-single.js', 'var dataSingle = ' + JSON.stringify(files));
	});
}

multiple();
single();