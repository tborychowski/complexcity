var jscomplexity = require('jscomplexity');

var glob = '{node_modules/escomplex/**/*,!node_modules/escomplex/node_modules/**}';

jscomplexity(glob).then(res => {
	var files = res.report.map(f => ({
		name: f.escapedPath,
		cplx: f.complexity,
		func: f.functionCount,
		loc: f.lineCount
	}));

	require('fs').writeFile('data.js', 'var data = ' + JSON.stringify(files));
});
