function strtotime(text, now) {
    if(!text) {
        return null;
    }
    if(text instanceof Date) {
        return text;
    }
    text = String(text);
    text = text.trim().replace(/\s{2,}/g, ' ').replace(/[\t\r\n]/g, '').toLowerCase();
    var parse;
    var parsed;
    var match;
    var date;
    if(now instanceof Date) {
        date = now;
    } else if(now) {
        date = new Date(now * 1000);
    } else {
        date = new Date();
    }
    if(match = text.match(/^now\s*/i)) {
        text = text.substr(match[0].length);
        date = new Date();
    }
    if(!isNaN(parse = Date.parse(text))) {
        date = new Date(parse);
        text = '';
    }
    if(match = text.match(/^(\d{2,4})-(\d{2})-(\d{2})(?:\s(\d{1,2}):(\d{2})(?::\d{2})?)?(?:\.(\d+)?)?/)) {
        text = text.substr(match[0].length);
        var year = (match[1] >= 0 && match[1] <= 69) ? (+match[1] + 2000) : (match[1]);
        date = new Date(year, parseInt(match[2], 10) - 1, (match[3]), (match[4]) || 0, (match[5]) || 0, (match[6]) || 0, (match[7]) || 0);
    }
    var days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
    };
    var ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
    };
    function lastNext(type, range, modifier) {
        var day = days[range];
        if(typeof (day) !== 'undefined') {
            var diff = day - date.getDay();
            if(diff === 0) {
                diff = 7 * modifier;
            } else if(diff > 0 && type === 'last') {
                diff -= 7;
            } else if(diff < 0 && type === 'next') {
                diff += 7;
            }
            date.setDate(date.getDate() + diff);
        }
    }
    function process(val) {
        var split = val.match(/^([+-]?\d+)\s*(\w+)$/);
        var type = split[1];
        var range = split[2].substring(0, 3);
        var typeIsNumber = /\d+/.test(type);
        var ago = split[2] === 'ago';
        var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);
        if(typeIsNumber) {
            num *= parseInt(type, 10);
        }
        if(ranges.hasOwnProperty(range)) {
            return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
        } else if(range === 'wee') {
            return date.setDate(date.getDate() + (num * 7));
        }
        if(type === 'next' || type === 'last') {
            lastNext(type, range, num);
        } else if(!typeIsNumber) {
            return false;
        }
        return true;
    }
    var regex = '([+-]?\\d+\\s*' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?';
    if(text.length > 0) {
        match = text.match(new RegExp(regex, 'gi'));
        if(!match) {
            return false;
        }
        for(var i = 0, len = match.length; i < len; i++) {
            if(!process(match[i])) {
                return false;
            }
        }
    }
    return (date.getTime() / 1000);
}
exports.strtotime = strtotime;
