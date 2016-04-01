///<reference path='../imports.d.ts'/>
"use strict";
/**
 * StringReader
 */
var StringReader = (function () {
    /**
     * Creates a StringReader with a string.
     *
     * @param string String to read.
     */
    function StringReader(string) {
        this.string = string;
        this.position = 0;
        this.currentLine = 1;
    }
    /**
     * Gets the position.
     */
    StringReader.prototype.getOffset = function () {
        return this.position;
    };
    StringReader.prototype.getSlice = function (start, end) {
        return this.string.substr(start, end - start);
    };
    StringReader.prototype.getSliceWithCallback = function (callback) {
        var start = this.getOffset();
        callback();
        var end = this.getOffset();
        return this.getSlice(start, end);
    };
    /**
     * Determines if the stream has more characters to read.
     */
    StringReader.prototype.hasMore = function () {
        return this.getLeftCount() > 0;
    };
    /**
     * Obtains the number of characters remaining in the stream.
     */
    StringReader.prototype.getLeftCount = function () {
        return this.string.length - this.position;
    };
    /**
     * Skips reading some characters.
     *
     * @param count Number of characters to skip
     */
    StringReader.prototype.skipChars = function (count) {
        this.currentLine += this.string.substr(this.position, count).split("\n").length - 1;
        this.position += count;
    };
    /**
     * Read all the remaining characters as a string.
     */
    StringReader.prototype.readLeft = function () {
        return this.readChars(this.getLeftCount());
    };
    /**
     * Peeks a number of characters allowing them to be readed after.
     *
     * @param count Number of characters to peek.
     */
    StringReader.prototype.peekChars = function (count) {
        return this.string.substr(this.position, count);
    };
    /**
     * Reads a number of characters as a string.
     *
     * @param count Number of characters to read.
     */
    StringReader.prototype.readChars = function (count) {
        var str = this.peekChars(count);
        this.skipChars(count);
        return str;
    };
    /**
     * Reads a single character as a string.
     */
    StringReader.prototype.readChar = function () {
        return this.readChars(1);
    };
    /**
     * Locates a regular expression in the remaining characters.
     * Returns the position and length of the match.
     *
     * @param regexp Regular expression to find
     */
    StringReader.prototype.findRegexp = function (regexp) {
        var match = this.string.substr(this.position).match(regexp);
        if (match === null) {
            return {
                position: null,
                length: null
            };
        }
        else {
            return {
                position: match['index'],
                length: match[0].length
            };
        }
    };
    return StringReader;
}());
exports.StringReader = StringReader;
