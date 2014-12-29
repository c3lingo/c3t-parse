var fs = require('fs');
var __ = require('lodash');
var path = require('path');
var async = require('async');
var parse = require('./lib/parse');

var opts = {
	dataDir: path.resolve(__dirname, 'data/')
};

var times = {};

var files = fs.readdirSync(opts.dataDir);
async.eachLimit(files, 5, function iterator (filename, done) {
	var filePath = path.resolve(opts.dataDir, filename);
	// The proper way would be to pipe this through a parser, but with less than
	// 10 KB per file we may as well pick the quick and dirty way
	fs.readFile(filePath, function (err, data) {
		var talks = parse(data);
		talks.forEach(function (talk) {
			talk.translators.forEach(function (translator) {
				times[translator] = (times[translator] || 0) + talk.duration;
			});
		});
		done();
	});
}, function done () {
	var translators = __(times).map(function (time, name) {
		return { name: name, time: time };
	}).sortBy('time').reverse()
	.value();
	console.log(translators);
});
