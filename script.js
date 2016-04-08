'use strict';

const directoryTree = require('directory-tree');
const jscomplexity = require('jscomplexity');
const fs = require('fs');

function getStats (item) {
	if (item.children) {
		return Promise.all(item.children.map(getStats))
			.then(ch => {
				item.children = ch;
				return item;
			});
	}

	return jscomplexity(item.path)
		.then(res => {
			const r = res.report[0] || { complexity: 0, functionCount: 0, lineCount: 0 };
			Object.assign(item, {
				cplx: r.complexity,
				func: Math.max(r.functionCount, 1),
				loc: r.lineCount
			});
			return item;
		});
}


function multiple() {
	const tree = directoryTree('./node_modules/jscomplexity/node_modules', ['.js']);

	getStats(tree)
		.then(res => {
			fs.writeFile('data-multi.js', 'var dataMulti = ' + JSON.stringify(res));
		})
		.catch(console.log.bind(console))
}

multiple();
