export default [{
	input: './client/index.js',
	output: {
		dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
	}
}, {
	input: './client/analyza-dat.js',
	output: {
		dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
	}
},
{
	input: './client/sprava-suborov.js',
	output: {
		dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
	}
},{
	input: './client/vypis-dat.js',
	output: {
		dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
	}
},{
	input: './client/o-aplikacii.js',
	output: {
		dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
	}
},{
  input: './client/vykreslovanie-dat.js',
  output: {
    dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"]
  }
},{
  input: './client/language.js',
  output: {
    name: "language",
    dir: './public/',
    format: 'iife',
    sourcemaps: true,
    globals: ["$"],
    external: ["$"]
  }
}];
