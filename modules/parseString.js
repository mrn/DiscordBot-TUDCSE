const config = require('../config.json');

module.exports = {
	// replace placeholders in a string written as {index} with given variables,
	// where 'index' is a number indicating the replacement string from a given array
	formatVariables: function(string, replacements) {
		replacements.forEach(function(replacement, index) {
			// define the placeholder regex and use the 'g' flag to target all occurrences
			const match = new RegExp('\\{' + index + '\\}', 'g');
			// replace all the matches with the replacement variable
			string = string.replace(match, replacement);
		});

		// always replace {prefix} with the prefix
		const match_prefix = new RegExp('\\{prefix\\}', 'g');
		string = string.replace(match_prefix, config.prefix);

		// always replace {staff} with a staff tag
		const match_staff_tag = new RegExp('\\{staff\\}', 'g');
		string = string.replace(match_staff_tag, config.staffTag);

		return string;
	},

	// count the number of occurrences of a pattern defined using regex
	countOccurrences: function(string, regex) {
		return ((string || '').match(regex) || []).length;
	},

	splitUserList: function(msg) {
		let remaining = msg;
		const replies = [];
		while (remaining.length > 2000) {
			const current = remaining.substring(0, 2000);
			const lastIndex = current.lastIndexOf('`, ');
			replies.push(current.substring(0, lastIndex + 2));
			remaining = remaining.substring(lastIndex + 3, remaining.length + 1);
		}
		replies.push(remaining);
		return replies;
	},
};
