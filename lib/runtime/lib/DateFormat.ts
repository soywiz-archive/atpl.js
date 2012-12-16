///<reference path='../../imports.d.ts'/>

 var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
function getOrdinalFor(intNum) {
    return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st"
            : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3
            && intNum != 13) ? "rd" : "th");
}
function getISO8601Year(aDate) {
    var d = new Date(aDate.getFullYear() + 1, 0, 4);
    if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7)
            return d.getFullYear();
    if(aDate.getMonth() > 0 || aDate.getDate() >= 4)
            return aDate.getFullYear();
    return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
}
function getISO8601Week(aDate) {
    // Get a day during the first week of the year.
    var d = new Date(getISO8601Year(aDate), 0, 4);
    // Get the first monday of the year.
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return Math.floor((aDate - d) / 604800000) + 1;
}

/// <summary>
///   Gets a string for this date, formatted according to the given format
///   string.
/// </summary>
/// <param name="format" type="String">
///   The format of the output date string.  The format string works in a
///   nearly identical way to the PHP date function which is highlighted here:
///   http://php.net/manual/en/function.date.php.
///   The only difference is the fact that "u" signifies milliseconds
///   instead of microseconds.  The following characters are recognized in
///   the format parameter string:
///     d - Day of the month, 2 digits with leading zeros
///     D - A textual representation of a day, three letters
///     j - Day of the month without leading zeros
///     l (lowercase 'L') - A full textual representation of the day of the week
///     N - ISO-8601 numeric representation of the day of the week (starting from 1)
///     S - English ordinal suffix for the day of the month, 2 characters st,
///         nd, rd or th. Works well with j.
///     w - Numeric representation of the day of the week (starting from 0)
///     z - The day of the year (starting from 0)
///     W - ISO-8601 week number of year, weeks starting on Monday
///     F - A full textual representation of a month, such as January or March
///     m - Numeric representation of a month, with leading zeros
///     M - A short textual representation of a month, three letters
///     n - Numeric representation of a month, without leading zeros
///     t - Number of days in the given month
///     L - Whether it's a leap year
///     o - ISO-8601 year number. This has the same value as Y, except that if
///         the ISO week number (W) belongs to the previous or next year, that
///         year is used instead.
///     Y - A full numeric representation of a year, 4 digits
///     y - A two digit representation of a year
///     a - Lowercase Ante meridiem and Post meridiem
///     A - Uppercase Ante meridiem and Post meridiem
///     B - Swatch Internet time
///     g - 12-hour format of an hour without leading zeros
///     G - 24-hour format of an hour without leading zeros
///     h - 12-hour format of an hour with leading zeros
///     H - 24-hour format of an hour with leading zeros
///     i - Minutes with leading zeros
///     s - Seconds, with leading zeros
///     u - Milliseconds
/// </param>
/// <returns type="String">
///   Returns the string for this date, formatted according to the given
///   format string.
/// </returns>
// If the format was not passed, use the default toString method.
export function date(date, format) {
	if (typeof format !== "string" || /^\s*$/.test(format))
		return date + "";
	var jan1st = new Date(date.getFullYear(), 0, 1);
	var me = date;
	return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, function (option) {
		switch (option) {
			// Day of the month, 2 digits with leading zeros
			case "d": return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
			// A textual representation of a day, three letters
			case "D": return shortDays[me.getDay()];
			// Day of the month without leading zeros
			case "j": return me.getDate();
			// A full textual representation of the day of the week
			case "l": return fullDays[me.getDay()];
			// ISO-8601 numeric representation of the day of the week
			case "N": return (me.getDay() + 6) % 7 + 1;
			// English ordinal suffix for the day of the month, 2 characters
			case "S": return getOrdinalFor(me.getDate());
			// Numeric representation of the day of the week
			case "w": return me.getDay();
			// The day of the year (starting from 0)
			case "z": return Math.ceil((jan1st - me) / 86400000);
			// ISO-8601 week number of year, weeks starting on Monday
			case "W": return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
			// A full textual representation of a month, such as January or March
			case "F": return fullMonths[me.getMonth()];
			// Numeric representation of a month, with leading zeros
			case "m": return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
			// A short textual representation of a month, three letters
			case "M": return shortMonths[me.getMonth()];
			// Numeric representation of a month, without leading zeros
			case "n": return me.getMonth() + 1;
			// Number of days in the given month
			case "t": return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();
			// Whether it's a leap year
			case "L": return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;
			// ISO-8601 year number. This has the same value as Y, except that if the
			// ISO week number (W) belongs to the previous or next year, that year is
			// used instead.
			case "o": return getISO8601Year(me);
			// A full numeric representation of a year, 4 digits
			case "Y": return me.getFullYear();
			// A two digit representation of a year
			case "y": return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
			// Lowercase Ante meridiem and Post meridiem
			case "a": return me.getHours() < 12 ? "am" : "pm";
			// Uppercase Ante meridiem and Post meridiem
			case "A": return me.getHours() < 12 ? "AM" : "PM";
			// Swatch Internet time
			case "B": return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);
			// 12-hour format of an hour without leading zeros
			case "g": return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
			// 24-hour format of an hour without leading zeros
			case "G": return me.getHours();
			// 12-hour format of an hour with leading zeros
			case "h": return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
			// 24-hour format of an hour with leading zeros
			case "H": return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
			// Minutes with leading zeros
			case "i": return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
			// Seconds, with leading zeros
			case "s": return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
			// Milliseconds
			case "u": return me.getMilliseconds();
		}
	});
}