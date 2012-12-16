var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
function getOrdinalFor(intNum) {
    return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st" : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3 && intNum != 13) ? "rd" : "th");
}
function getISO8601Year(aDate) {
    var d = new Date(aDate.getFullYear() + 1, 0, 4);
    if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7) {
        return d.getFullYear();
    }
    if(aDate.getMonth() > 0 || aDate.getDate() >= 4) {
        return aDate.getFullYear();
    }
    return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
}
function getISO8601Week(aDate) {
    var d = new Date(getISO8601Year(aDate), 0, 4);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return Math.floor((aDate - d) / 604800000) + 1;
}
function date(date, format) {
    if(typeof format !== "string" || /^\s*$/.test(format)) {
        return date + "";
    }
    var jan1st = new Date(date.getFullYear(), 0, 1);
    var me = date;
    return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, function (option) {
        switch(option) {
            case "d": {
                return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");

            }
            case "D": {
                return shortDays[me.getDay()];

            }
            case "j": {
                return me.getDate();

            }
            case "l": {
                return fullDays[me.getDay()];

            }
            case "N": {
                return (me.getDay() + 6) % 7 + 1;

            }
            case "S": {
                return getOrdinalFor(me.getDate());

            }
            case "w": {
                return me.getDay();

            }
            case "z": {
                return Math.ceil((jan1st - me) / 86400000);

            }
            case "W": {
                return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");

            }
            case "F": {
                return fullMonths[me.getMonth()];

            }
            case "m": {
                return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");

            }
            case "M": {
                return shortMonths[me.getMonth()];

            }
            case "n": {
                return me.getMonth() + 1;

            }
            case "t": {
                return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();

            }
            case "L": {
                return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;

            }
            case "o": {
                return getISO8601Year(me);

            }
            case "Y": {
                return me.getFullYear();

            }
            case "y": {
                return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");

            }
            case "a": {
                return me.getHours() < 12 ? "am" : "pm";

            }
            case "A": {
                return me.getHours() < 12 ? "AM" : "PM";

            }
            case "B": {
                return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);

            }
            case "g": {
                return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;

            }
            case "G": {
                return me.getHours();

            }
            case "h": {
                return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");

            }
            case "H": {
                return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");

            }
            case "i": {
                return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");

            }
            case "s": {
                return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");

            }
            case "u": {
                return me.getMilliseconds();

            }
        }
    });
}
exports.date = date;
