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

var MAIN_CHANNELS = ['rc1', 'rc2'];
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
}

function minsAsHours(mins) {
	var m = '0' + (mins % 60);
	m = m.substr(m.length - 2);
	return Math.floor(mins / 60) + ':' + m;
}

function ENDEcovered(talk) {
	if (talk.language == 'de')
		return Object.keys(talk.translators).includes('en');
	else if (talk.language == 'en')
		return Object.keys(talk.translators).includes('de');
	else
		return true;
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
			var otherLang = false
			Object.entries(talk.translators).forEach(function (language) {

				if (language[0] != 'en' && language[0] != 'de')
					otherLang = true;

				totalTime += talk.duration;

				if (langTalkNums.hasOwnProperty(language[0]))
					langTalkNums[language[0]] += 1
				else
					langTalkNums[language[0]] = 1

				language[1].forEach(function (translator) {
					times[translator] = (times[translator] || 0) + talk.duration;
				});
			});
			if (MAIN_CHANNELS.includes(talk.location.toLowerCase())) {
				coverage.main.total++;
				if (ENDEcovered(talk))
					coverage.main.EN_DE++;
				if (otherLang)
					coverage.main.other++;
			} else {
				coverage.other.total++;
				if (ENDEcovered(talk))
					coverage.other.EN_DE++;
				if (otherLang)
					coverage.main.other++;
			}
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

	console.log('\nEN <> DE COVERAGE:');
	console.log(coverage);
	console.log('Main channels EN<>DE: ' + Math.floor(100 * coverage.main.EN_DE/coverage.main.total) + '%');
	console.log('Other channels EN<>DE: ' + Math.floor(100 * coverage.other.EN_DE/coverage.other.total) + '%');
	console.log('Main channels other Lang: ' + Math.floor(100 * coverage.main.other/coverage.main.total) + '%');
	console.log('Other channels other Lang: ' + Math.floor(100 * coverage.other.other/coverage.other.total) + '%');

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
