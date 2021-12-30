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

		line = lines.shift().match(/#(\d+)/);
		if (!line) {return false;}
		line.shift();
		talk.id = parseInt(line.shift());

		var l = lines.shift();
		line = l.match(/\[(.*?)\] (\d\d:\d\d) \+(\d\d):(\d\d), (.*)/);
		if (!line) {console.error('no data match: "' + l + '"'); return false;}
		line.shift();
		talk.language = line.shift();
		talk.start = new Time(line.shift());
		talk.duration = 60 * I(line.shift()) + I(line.shift());
		talk.location = line.shift();

		line = lines.shift().match(/(.*?)( \((.*?)\))?/);
		if (!line) {console.error('no title match'); return false;}
		line.shift();
		talk.title = line.shift();
		line.shift();
		talk.type = line.shift() || null;
		talk.speakers = lines.shift().split(', ');

		line = lines.shift().match(/(https?:.*)/);
		if (!line) {console.error('no url match'); return false;}
		line.shift();
		talk.url = line.shift();

		lines.shift();

		talk.interpreters = {};
		while (line = lines.shift()) {
			line = line.match(/^\s*(?:→|->)\s+(\S{2,3}?):(.*)/);
			if (!line) continue;
			line.shift();
			var lang = line.shift();
			var names = line.shift().split(',');
			if (names[0].trim() == '') continue;
			talk.interpreters[lang] = [];
			names.forEach(function (name) {
				talk.interpreters[lang].push(name.trim().replace(/ .*/, ""));
			});
		}

		//console.log(talk);

		return talk;
	});
	return blocks.filter(function (b) { return b; });
}
