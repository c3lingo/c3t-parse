var fs = require('fs');
var __ = require('lodash');
var path = require('path');
var async = require('async');
var parse = require('./lib/parse');

var opts = {
	dataDir: path.resolve(__dirname, 'data/')
};

var talks = [];
var langTalkNums = {};
var totalTime = 0;
var times = {};

function minsAsHours(mins) {
	var m = '0' + (mins % 60);
	m = m.substr(m.length - 2);
	return Math.floor(mins / 60) + ':' + m;
}

var files = fs.readdirSync(opts.dataDir);
async.eachLimit(files, 5, function iterator (filename, done) {
	var filePath = path.resolve(opts.dataDir, filename);
	// The proper way would be to pipe this through a parser, but with less than
	// 10 KB per file we may as well pick the quick and dirty way
	console.log(filePath)
	fs.readFile(filePath, function (err, data) {
		var dayTalks = parse(data);
		dayTalks.forEach(function (talk) {
			Object.entries(talk.translators).forEach(function (language) {
				totalTime += talk.duration;

				if (langTalkNums.hasOwnProperty(language[0]))
					langTalkNums[language[0]] += 1
				else
					langTalkNums[language[0]] = 1

				language[1].forEach(function (translator) {
					times[translator] = (times[translator] || 0) + talk.duration;
				});
			});
		});
		talks = talks.concat(dayTalks);
		done();
	});
}, function done () {
	var translators = __(times).map(function (time, name) {
		return { name: name, time: time };
	}).sortBy('time').reverse()
	.value();

	console.log('\nTOTAL TRANSLATED TALKS:');
	console.log(talks.length);

	console.log('\nLANGUAGES:');
	console.log(langTalkNums);

	console.log('\nTRANSLATORS: (' + translators.length + ')');
	translators.forEach(function (t) {
		var s = ' '.repeat(24 - t.name.length);
		console.log('- ' + t.name + ':' + s + minsAsHours(t.time));
	});

	console.log('\nTOTAL TRANSLATED HOURS:');
	console.log(minsAsHours(totalTime));

	console.log('\nAVG HOURS TRANSLATED P.P.:');
	console.log(minsAsHours(Math.floor(totalTime / translators.length)));

});
