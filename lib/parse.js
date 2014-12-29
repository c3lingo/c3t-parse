// We can't rely on coercion to integer because times may have leading zeros.
function I (string) {
	return parseInt(string, 10);
}
function Time (string) {
	this._string = string;
	string = string.split(':');
	this.hours = I(string.shift());
	this.minutes = I(string.shift());
}
Time.prototype.toString = function () {
	return this._string;
}

module.exports = function (input) {
	input = input.toString();
	var blocks = input.split(/\n{2,}/).map(function (lines) {
		lines = lines.split('\n');
		var talk = {};

		var line;
		line = lines.shift().match(/(\d\d:\d\d) \+(\d\d):(\d\d), (.*?), (.*)/);
		if (!line) return false;
		line.shift();
		talk.start = new Time(line.shift());
		talk.duration = 60 * I(line.shift()) + I(line.shift());
		talk.location = line.shift();
		talk.language = line.shift();
		
		line = lines.shift().match(/^https?:.*/);
		if (!line) return false;
		talk.url = line.shift();
		
		line = lines.shift().split(': ');
		if (!line) return false;
		talk.type = line.shift();
		talk.title = line.shift();

		talk.speakers = lines.shift().split(', ');

		talk.translators = [];
		while (line = lines.shift()) {
			line = line.match(/Transl.*: (.*)/);
			if (!line) continue;
			line.shift();
			line.shift().split(/,\s*/).forEach(function (t) { talk.translators.push(t); });
		}
		return talk;
	});
	return blocks.filter(function (b) { return b; });
}
