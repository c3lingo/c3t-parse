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
var totalTalkTime = 0;
var totalInterpreterTime = 0;
var times = {};

var MAIN_CHANNELS = [];
var coverage = {
	main: {
		total: 0,
		EN_DE: 0,
		other: 0
	},
	other: {
		total: 0,
		EN_DE: 0,
		other: 0
	}
};

function minsAsHours(mins) {
	var m = '0' + (mins % 60);
	m = m.substr(m.length - 2);
	return Math.floor(mins / 60) + ':' + m;
}

function ENDEcovered(talk) {
	if (talk.language == 'de') {
		return Object.keys(talk.interpreters).includes('en');
	}
	else if (talk.language == 'en') {
		return Object.keys(talk.interpreters).includes('de');
	} else {
		return true;
	}
}

var files = fs.readdirSync(opts.dataDir);
async.eachLimit(files, 5, function iterator (filename, done) {
	var filePath = path.resolve(opts.dataDir, filename);
	// The proper way would be to pipe this through a parser, but with less than
	// 10 KB per file we may as well pick the quick and dirty way
	console.log(filePath);
	fs.readFile(filePath, function (err, data) {
		var dayTalks = parse(data);
		dayTalks.forEach(function (talk) {
			var otherLang = false;
			Object.entries(talk.interpreters).forEach(function (language) {

				if (language[0] != 'en' && language[0] != 'de') {
					otherLang = true;
				}

				totalTalkTime += talk.duration;

				if (langTalkNums.hasOwnProperty(language[0])) {
					langTalkNums[language[0]] += 1;
				} else {
					langTalkNums[language[0]] = 1;
				}

				language[1].forEach(function (interpreter) {
					times[interpreter] = (times[interpreter] || 0) + talk.duration;
				});
			});
			if (MAIN_CHANNELS.includes(talk.location.toLowerCase())) {
				coverage.main.total++;
				if (ENDEcovered(talk)) {
					coverage.main.EN_DE++;
				}
				if (otherLang) {
					coverage.main.other++;
				}
			} else {
				coverage.other.total++;
				if (ENDEcovered(talk)) {
					coverage.other.EN_DE++;
				}
				if (otherLang) {
					coverage.main.other++;
				}
			}
		});
		talks = talks.concat(dayTalks);
		done();
	});
}, function done () {
	var interpreters = __(times).map(function (time, name) {
		return { name: name, time: time };
	})
	.sortBy('time')
	.reverse()
	.value();

	console.log('\nTotal interpreted talks:');
	console.log(talks.length);

	console.log('\nen↔de coverage:');
	console.log(coverage);
	console.log('Main channels en↔de: ' + Math.floor(100 * coverage.main.EN_DE/coverage.main.total) + '%');
	console.log('Other channels en↔de: ' + Math.floor(100 * coverage.other.EN_DE/coverage.other.total) + '%');
	console.log('Main channels other lang: ' + Math.floor(100 * coverage.main.other/coverage.main.total) + '%');
	console.log('Other channels other lang: ' + Math.floor(100 * coverage.other.other/coverage.other.total) + '%');

	console.log('\nLanguages:');
	console.log(langTalkNums);

	console.log('\nInterpreters: (' + interpreters.length + ')');
	interpreters.forEach(function (t) {
		var hours = minsAsHours(t.time);
		var s1 = ' '.repeat(24 - t.name.length);
		var s2 = ' '.repeat(6 - hours.length);
		console.log('- ' + t.name + ':' + s1 + s2 + hours);
		totalInterpreterTime += t.time;
	});

	console.log('\nTotal interpreted hours:');
	console.log(minsAsHours(totalTalkTime));

	console.log('\nTotal interpretation shifts:');
	console.log(minsAsHours(totalInterpreterTime));

	console.log('\nAverage shift time per interpreter:');
	console.log(minsAsHours(Math.floor(totalInterpreterTime / interpreters.length)));

});
