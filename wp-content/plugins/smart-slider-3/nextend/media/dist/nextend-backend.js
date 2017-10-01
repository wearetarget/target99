/*
 json2.js
 2012-10-08

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

n2.extend(window.nextend, {
    fontManager: null,
    styleManager: null,
    notificationCenter: null,
    animationManager: null,
    browse: null,
    askToSave: true,
    cancel: function (url) {
        nextend.askToSave = false;
        window.location.href = url;
        return false;
    }
});

function n2Context() {
    this.window = ['main'];
    this.mouseDownArea = false;
    this.timeout = null;

    this.isPreventDblClick = false;
    this.dblClickTimeout = null;
}

n2Context.prototype.addWindow = function (name) {
    this.window.push(name);
};

n2Context.prototype.removeWindow = function () {
    this.window.pop();
};

n2Context.prototype.getCurrentWindow = function () {
    return this.window[this.window.length - 1];
};

n2Context.prototype.setMouseDownArea = function (area, e) {
    this.mouseDownArea = area;
    if (this.timeout) {
        clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(n2.proxy(function () {
        this.timeout = null;
        this.mouseDownArea = false;
    }, this), 50);
};

n2Context.prototype.preventDblClick = function () {
    this.isPreventDblClick = true;
    if (this.dblClickTimeout) {
        clearTimeout(this.dblClickTimeout);
    }
    this.dblClickTimeout = setTimeout(n2.proxy(function () {
        this.dblClickTimeout = null;
        this.isPreventDblClick = false;
    }, this), 200);
}

/**
 * @type {n2Context}
 */
window.nextend.context = new n2Context();

window.n2_ = function (text) {
    if (typeof nextend.localization[text] !== 'undefined') {
        return nextend.localization[text];
    }
    return text;
};

window.n2_printf = function (text) {
    var args = arguments;
    var index = 1;
    return text.replace(/%s/g, function () {
        return args[index++];
    });
};

/**
 * Help us to track when the user loaded the page
 */
window.nextendtime = n2.now();

window.nextend.roundTo = 5;
window.nextend.roundHelper = function (value) {
    if (window.nextend.roundTo <= 1) {
        return value;
    }

    return Math.round(value / window.nextend.roundTo) * window.nextend.roundTo;
};

/*
 * Moves an element with the page scroll to be in a special position
 */
(function ($) {

    var elems = [],
        sidename = {
            left: 'left',
            right: 'right'
        };

    function rtl() {
        sidename = {
            left: 'right',
            right: 'left'
        };
    }

    function ltr() {
        sidename = {
            left: 'left',
            right: 'right'
        };
    }

    function getOffset($el, side) {
        var offset = 0;
        if (side == sidename.right) {
            offset = ($(window).width() - ($el.offset().left + $el.outerWidth()));
        } else {
            offset = $el.offset().left;
        }
        if (offset < 0)
            return 0;
        return offset;
    }

    $('html').on('changedir', function (e, dir) {
        for (var i = 0; i < elems.length; i++) {
            elems[i][0].css(sidename[elems[i][2]], 'auto');
        }
        if (dir === 'rtl') {
            rtl();
        } else {
            ltr();
        }
        $(document).trigger('scroll');
    });

    var scrollAdjustment = 0;

    nextend.ready(function () {
        var topBarHeight = $('#wpadminbar, .navbar-fixed-top').height();
        if (topBarHeight) {
            scrollAdjustment += topBarHeight;
        }
        $(document).trigger('scroll');
    });

    $(document).on('scroll', function () {
        var scrolltop = $(document).scrollTop() + scrollAdjustment;
        for (var i = 0; i < elems.length; i++) {
            if (elems[i][1] > scrolltop) {
                elems[i][0].removeClass('n2-static');
            } else {
                elems[i][0].addClass('n2-static');
                elems[i][0].css(sidename[elems[i][2]], elems[i][3]);
            }
        }
    });

    $(window).on('resize', function () {
        for (var i = 0; i < elems.length; i++) {
            elems[i][1] = elems[i][0].parent().offset().top;
            elems[i][3] = getOffset(elems[i][0].parent(), elems[i][2]);
        }
        $(document).trigger('scroll');
    });

    $.fn.staticonscroll = function (side) {
        this.each(function () {
            var $el = $(this);
            elems.push([$el, $el.parent().offset().top, side, getOffset($el.parent(), side)]);
        });
        $(document).trigger('scroll');
    };
})(n2);

(function ($) {

    var NextendAjaxHelper = {
            query: {}
        },
        loader = null;

    NextendAjaxHelper.addAjaxLoader = function () {
        loader = $('<div class="n2-loader-overlay"><div class="n2-loader"></div></div>')
            .appendTo('body');
    };

    NextendAjaxHelper.addAjaxArray = function (parts) {
        for (var k in parts) {
            NextendAjaxHelper.query[k] = parts[k];
        }
    };

    NextendAjaxHelper.makeAjaxQuery = function (queryArray, isAjax) {
        if (isAjax) {
            queryArray['mode'] = 'ajax';
            queryArray['nextendajax'] = '1';
        }
        for (var k in NextendAjaxHelper.query) {
            queryArray[k] = NextendAjaxHelper.query[k];
        }
        return N2QueryString.stringify(queryArray);
    };

    NextendAjaxHelper.makeAjaxUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + NextendAjaxHelper.makeAjaxQuery(parsed, true);
    };

    NextendAjaxHelper.makeFallbackUrl = function (url, queries) {
        var urlParts = url.split("?");
        if (urlParts.length < 2) {
            urlParts[1] = '';
        }
        var parsed = N2QueryString.parse(urlParts[1]);
        if (typeof queries != 'undefined') {
            for (var k in queries) {
                parsed[k] = queries[k];
            }
        }
        return urlParts[0] + '?' + NextendAjaxHelper.makeAjaxQuery(parsed, false);
    };

    NextendAjaxHelper.ajax = function (ajax) {
        NextendAjaxHelper.startLoading();
        return $.ajax(ajax).always(function (response, status) {
            NextendAjaxHelper.stopLoading();
            try {

                if (status != 'success') {
                    response = JSON.parse(response.responseText);
                } else if (typeof response === 'string') {
                    response = JSON.parse(response);
                }
                if (typeof response.redirect != 'undefined') {
                    NextendAjaxHelper.startLoading();
                    window.location.href = response.redirect;
                    return;
                }

                NextendAjaxHelper.notification(response);
            } catch (e) {
                console.log(e);
            }
        });
    };

    NextendAjaxHelper.notification = function (response) {

        if (typeof response.notification !== 'undefined' && response.notification) {
            for (var k in response.notification) {
                for (var i = 0; i < response.notification[k].length; i++) {
                    nextend.notificationCenter[k](response.notification[k][i][0], response.notification[k][i][1]);
                }
            }
        }
    };

    NextendAjaxHelper.getJSON = function (ajax) {
        NextendAjaxHelper.startLoading();
        return $.getJSON(ajax).always(function () {
            NextendAjaxHelper.stopLoading();
        });
    };

    NextendAjaxHelper.startLoading = function () {
        loader.addClass('n2-active');
    };

    NextendAjaxHelper.stopLoading = function () {
        loader.removeClass('n2-active');
    };

    window.NextendAjaxHelper = NextendAjaxHelper;
    nextend.ready(function () {
        NextendAjaxHelper.addAjaxLoader();
    });
})(n2);

(function ($, scope) {

    function NextendHeadingPane($node, headings, contents, identifier) {
        this.$node = $node.data('pane', this);
        this.headings = headings;
        this.contents = contents;
        this.tabNames = [];
        this.headings.each($.proxy(function (i, el) {
            this.tabNames.push($(el).data('tab'));
        }, this));
        this.identifier = identifier;

        this._active = headings.index(headings.filter('.n2-active'));

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.switchToPane, this, i));
        }

        if (identifier) {
            var saved = $.jStorage.get(this.identifier + "-pane", -1);
            if (saved != -1) {
                this.switchToPane(saved);
                return;
            }
        }
        this.hideAndShow();
    };


    NextendHeadingPane.prototype.switchToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        this.headings.eq(this._active).removeClass('n2-active');
        this.headings.eq(i).addClass('n2-active');
        this._active = i;

        this.hideAndShow();
        this.store(this._active);

        this.$node.triggerHandler('changetab');
    };

    NextendHeadingPane.prototype.hideAndShow = function () {
        $(this.contents[this._active]).css('display', 'block').trigger('activate');
        for (var i = 0; i < this.contents.length; i++) {
            if (i != this._active) {
                $(this.contents[i]).css('display', 'none');
            }
        }
    };

    NextendHeadingPane.prototype.store = function (i) {
        if (this.identifier) {
            $.jStorage.set(this.identifier + "-pane", i);
        }
    };

    NextendHeadingPane.prototype.showTabs = function (tabNames) {
        var activatedFirst = false;
        for (var i = 0; i < this.tabNames.length; i++) {
            if ($.inArray(this.tabNames[i], tabNames) != '-1') {
                this.headings.eq(i).css('display', '');
                $(this.contents[i]).css('display', '');
                if (i == this._active) {
                    activatedFirst = i;
                } else if (activatedFirst === false) {
                    activatedFirst = i;
                }
            } else {
                this.headings.eq(i).css('display', 'none');
                $(this.contents[i]).css('display', 'none');
            }
        }
        this.switchToPane(activatedFirst);
    };

    scope.NextendHeadingPane = NextendHeadingPane;


    function NextendHeadingScrollToPane(headings, contents, identifier) {
        this.headings = headings;
        this.contents = contents;
        this.identifier = identifier;

        for (var i = 0; i < headings.length; i++) {
            headings.eq(i).on('click', $.proxy(this.scrollToPane, this, i));
        }
    }

    NextendHeadingScrollToPane.prototype.scrollToPane = function (i, e) {
        if (e) {
            e.preventDefault();
        }
        $('html, body').animate({
            scrollTop: this.contents[i].offset().top - $('.n2-main-top-bar').height() - $('#wpadminbar, .navbar-fixed-top').height() - 10
        }, 1000);
    };

    scope.NextendHeadingScrollToPane = NextendHeadingScrollToPane;

})(n2, window);

(function ($, scope) {
    var FiLo = [],
        doc = $(document),
        isListening = false;
    scope.NextendEsc = {
        _listen: function () {
            if (!isListening) {
                doc.on('keydown.n2-esc', function (e) {
                    if ((e.keyCode == 27 || e.keyCode == 8)) {
                        if (!$(e.target).is("input, textarea")) {
                            e.preventDefault();
                            var ret = FiLo[FiLo.length - 1]();
                            if (ret) {
                                scope.NextendEsc.pop();
                            }
                        } else if (e.keyCode == 27) {
                            e.preventDefault();
                            $(e.target).blur();
                        }
                    }
                });
                isListening = true;
            }
        },
        _stopListen: function () {
            doc.off('keydown.n2-esc');
            isListening = false;
        },
        add: function (callback) {
            FiLo.push(callback);
            scope.NextendEsc._listen();
        },
        pop: function () {
            FiLo.pop();
            if (FiLo.length === 0) {
                scope.NextendEsc._stopListen();
            }
        }
    };
})(n2, window);


(function ($, scope) {
    $.fn.n2opener = function () {
        return this.each(function () {
            var opener = $(this).on("click", function (e) {
                opener.toggleClass("n2-active");
            });

            opener.siblings('span').on("click", function (e) {
                opener.toggleClass("n2-active");
            });

            opener.parent().on("mouseleave", function () {
                opener.removeClass("n2-active");
            })
            opener.find(".n2-button-menu").on("click", function (e) {
                e.stopPropagation();
                opener.removeClass("n2-active");
            });
        });
    };
})(n2, window);

if (typeof jQuery !== 'undefined') {
    jQuery(document).on('wp-collapse-menu', function () {
        n2(window).trigger('resize');
    });
}


nextend.deepDiff = function () {
    return {
        map: function (obj1, obj2) {
            if (this.isValue(obj1)) {
                if ('undefined' != typeof(obj1) && obj1 != obj2) {
                    return obj1;
                } else {
                    return undefined;
                }
            }

            for (var key in obj2) {
                if (this.isFunction(obj2[key])) {
                    continue;
                }

                obj1[key] = this.map(obj1[key], obj2[key]);
                if (obj1[key] === undefined || (n2.isPlainObject(obj1[key]) && n2.isEmptyObject(obj1[key])) || (this.isArray(obj1[key]) && obj1[key].length == 0)) {
                    delete obj1[key];
                }
            }


            return obj1;

        },

        isFunction: function (obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function (obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isObject: function (obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function (obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();


(function ($, scope) {
    function tooltip() {
        this.$element = $('<div class="n2 n2-tooltip n2-radius-m"></div>');
        this.timeout = null;
        this.$tipFor = null;


        $(window).ready($.proxy(this.ready, this));

    }

    tooltip.prototype.ready = function () {
        this.$element.appendTo('body');
        this.add($('body'));
    }

    tooltip.prototype.add = function ($parent) {
        $parent.find('[data-n2tip]').off('.n2hastip').on({
            'mouseenter.n2hastip': $.proxy(this.onEnter, this)
        });
    }

    tooltip.prototype.addElement = function ($el, title, h, v) {
        $el.data({
            n2tip: title,
            n2tipv: v,
            n2tiph: h
        }).off('.n2hastip').on({
            'mouseenter.n2hastip': $.proxy(this.onEnter, this)
        });
    }

    tooltip.prototype.onEnter = function (e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.$tipFor = $(e.currentTarget).on({
            'mousemove.n2tip': $.proxy(this.onMove, this),
            'mouseleave.n2tip': $.proxy(this.onLeave, this)
        });
        this.onMove(e);
        this.timeout = setTimeout($.proxy(function () {
            var v = this.$tipFor.data('n2tipv'),
                h = this.$tipFor.data('n2tiph');
            if (typeof v === 'undefined') {
                v = 10;
            }
            if (typeof h === 'undefined') {
                h = 10;
            }
            this.$element.css({
                margin: v + 'px ' + h + 'px'
            }).html(this.$tipFor.data('n2tip')).addClass('n2-active');
        }, this), 500);
    }

    tooltip.prototype.onMove = function (e) {
        this.$element.css({
            left: e.pageX,
            top: e.pageY
        });
    }

    tooltip.prototype.onLeave = function (e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.$tipFor) {
            this.$tipFor.off('.n2tip');
            this.$tipFor = null;
            this.$element.removeClass('n2-active').css('margin', '');
        }
    }

    function tooltipMouse() {
        this.isVisible = false;
        this.$body = $('body');
        this.$element = $('<div class="n2 n2-tooltip n2-radius-m"></div>').appendTo(this.$body);
    }

    tooltipMouse.prototype.show = function (text, e) {
        if (this.isVisible) {
            this.$element.html(text);
        } else {
            this.isVisible = true;
            this.$body.on('mousemove.tooltipMouse', $.proxy(this.mouseMove, this));
            this.mouseMove(e);
            this.$element.html(text).addClass('n2-active');
        }
    }

    tooltipMouse.prototype.mouseMove = function (e) {
        this.$element.css({
            left: e.pageX + 10,
            top: e.pageY + 10
        });
    }

    tooltipMouse.prototype.hide = function () {
        this.$body.off('mousemove.tooltipMouse');
        this.$element.removeClass('n2-active').html('');
        this.isVisible = false;
    }

    nextend.tooltip = new tooltip();

    $(window).ready(function () {
        nextend.tooltipMouse = new tooltipMouse();
    });
})(n2, window);


nextend.UnicodeToHTMLEntity = function (s) {
    try {
        var patt = /(?:[\uD800-\uDBFF][\uDC00-\uDFFF])/g,
            match;

        function surrogatePairToCodePoint(charCode1, charCode2) {
            return ((charCode1 & 0x3FF) << 10) + (charCode2 & 0x3FF) + 0x10000;
        }

        function stringToCodePointArray(str) {
            var codePoints = [],
                i = 0,
                charCode;
            while (i < str.length) {
                charCode = str.charCodeAt(i);
                if ((charCode & 0xF800) == 0xD800) {
                    codePoints.push(surrogatePairToCodePoint(charCode, str.charCodeAt(++i)));
                } else {
                    codePoints.push(charCode);
                }
                ++i;
            }
            return '&#' + codePoints + ';';
        }

        while ((match = patt.exec(s))) {
            s = s.substr(0, match.index) + stringToCodePointArray(s.substr(match.index, patt.lastIndex - match.index)) + s.substr(patt.lastIndex);
        }
    } catch (e) {
        console.error(e);
        return s;
    }

    return s;
}
/**
 * Convert 8 char hexadecimal color into RGBA color
 * @param 8 characters of hexadecimal color value. Last two character stands for alpha 0-255
 * @returns RGBA representation string
 */

window.N2Color = {
    hex2rgba: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return [num >> 24 & 255, num >> 16 & 255, num >> 8 & 255, (num & 255) / 255];
    },
    hex2rgbaCSS: function (str) {
        return 'RGBA(' + N2Color.hex2rgba(str).join(',') + ')';
    },
    hexdec: function (hex_string) {
        hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
        return parseInt(hex_string, 16);
    },

    hex2alpha: function (str) {
        var num = parseInt(str, 16); // Convert to a number
        return ((num & 255) / 255).toFixed(3);
    },
    colorizeSVG: function (str, color) {
        var parts = str.split('base64,');
        if (parts.length == 1) {
            return str;
        }
        parts[1] = Base64.encode(Base64.decode(parts[1]).replace('fill="#FFF"', 'fill="#' + color.substr(0, 6) + '"').replace('opacity="1"', 'opacity="' + N2Color.hex2alpha(color) + '"'));
        return parts.join('base64,');
    },
    colorToSVG: function (str) {
        var num = parseInt(str, 16); // Convert to a number

        return [str.substr(0, 6), (num & 255) / 255];
    }
};
/*!
 query-string
 Parse and stringify URL query strings
 https://github.com/sindresorhus/query-string
 by Sindre Sorhus
 MIT License
 */
(function () {
    'use strict';
    var module, define;
    var N2QueryString = {};

    N2QueryString.parse = function (str) {
        if (typeof str !== 'string') {
            return {};
        }

        str = str.trim().replace(/^(\?|#)/, '');

        if (!str) {
            return {};
        }

        return str.trim().split('&').reduce(function (ret, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var key = parts[0];
            var val = parts[1];

            key = decodeURIComponent(key);
            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };

    N2QueryString.stringify = function (obj) {
        return obj ? Object.keys(obj).map(function (key) {
            var val = obj[key];

            if (Array.isArray(val)) {
                return val.map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    };

    window.N2QueryString = N2QueryString;
})();

;
!function (g) {
    var $0 = [], // result
        $1 = [], // tail
        $2 = [], // blocks
        $3 = [], // s1
        $4 = ("0123456789abcdef").split(""), // hex
        $5 = [], // s2
        $6 = [], // state
        $7 = false, // is state created
        $8 = 0, // len_cache
        $9 = 0, // len
        BUF = [];

    // use Int32Array if defined
    if (g.Int32Array) {
        $1 = new Int32Array(16);
        $2 = new Int32Array(16);
        $3 = new Int32Array(4);
        $5 = new Int32Array(4);
        $6 = new Int32Array(4);
        BUF = new Int32Array(4);
    } else {
        var i;
        for (i = 0; i < 16; i++) $1[i] = $2[i] = 0;
        for (i = 0; i < 4; i++) $3[i] = $5[i] = $6[i] = BUF[i] = 0;
    }

    // fill s1
    $3[0] = 128;
    $3[1] = 32768;
    $3[2] = 8388608;
    $3[3] = -2147483648;

    // fill s2
    $5[0] = 0;
    $5[1] = 8;
    $5[2] = 16;
    $5[3] = 24;

    function encode(s) {
        var utf = enc = "",
            start = end = 0;

        for (var i = 0, j = s.length; i < j; i++) {
            var c = s.charCodeAt(i);

            if (c < 128) {
                end++;
                continue;
            } else if (c > 127 && c < 2048)
                enc = String.fromCharCode((c >> 6) | 192, (c & 63) | 128);
            else
                enc = String.fromCharCode((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);

            if (end > start)
                utf += s.slice(start, end);

            utf += enc;
            start = end = i + 1;
        }

        if (end > start)
            utf += s.slice(start, j);

        return utf;
    }

    function md5_update(s) {
        var i, I;

        s += "";
        $7 = false;
        $8 = $9 = s.length;

        if ($9 > 63) {
            getBlocks(s.substring(0, 64));
            md5cycle($2);
            $7 = true;

            for (i = 128; i <= $9; i += 64) {
                getBlocks(s.substring(i - 64, i));
                md5cycleAdd($2);
            }

            s = s.substring(i - 64);
            $9 = s.length;
        }

        $1[0] = 0;
        $1[1] = 0;
        $1[2] = 0;
        $1[3] = 0;
        $1[4] = 0;
        $1[5] = 0;
        $1[6] = 0;
        $1[7] = 0;
        $1[8] = 0;
        $1[9] = 0;
        $1[10] = 0;
        $1[11] = 0;
        $1[12] = 0;
        $1[13] = 0;
        $1[14] = 0;
        $1[15] = 0;

        for (i = 0; i < $9; i++) {
            I = i % 4;
            if (I === 0)
                $1[i >> 2] = s.charCodeAt(i);
            else
                $1[i >> 2] |= s.charCodeAt(i) << $5[I];
        }
        $1[i >> 2] |= $3[i % 4];

        if (i > 55) {
            if ($7) md5cycleAdd($1);
            else {
                md5cycle($1);
                $7 = true;
            }

            return md5cycleAdd([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $8 << 3, 0]);
        }

        $1[14] = $8 << 3;

        if ($7) md5cycleAdd($1);
        else md5cycle($1);
    }

    function getBlocks(s) {
        for (var i = 16; i--;) {
            var I = i << 2;
            $2[i] = s.charCodeAt(I) + (s.charCodeAt(I + 1) << 8) + (s.charCodeAt(I + 2) << 16) + (s.charCodeAt(I + 3) << 24);
        }
    }

    function md5(data, ascii, arrayOutput) {
        md5_update(ascii ? data : encode(data));

        var tmp = $6[0];
        $0[1] = $4[tmp & 15];
        $0[0] = $4[(tmp >>= 4) & 15];
        $0[3] = $4[(tmp >>= 4) & 15];
        $0[2] = $4[(tmp >>= 4) & 15];
        $0[5] = $4[(tmp >>= 4) & 15];
        $0[4] = $4[(tmp >>= 4) & 15];
        $0[7] = $4[(tmp >>= 4) & 15];
        $0[6] = $4[(tmp >>= 4) & 15];

        tmp = $6[1];
        $0[9] = $4[tmp & 15];
        $0[8] = $4[(tmp >>= 4) & 15];
        $0[11] = $4[(tmp >>= 4) & 15];
        $0[10] = $4[(tmp >>= 4) & 15];
        $0[13] = $4[(tmp >>= 4) & 15];
        $0[12] = $4[(tmp >>= 4) & 15];
        $0[15] = $4[(tmp >>= 4) & 15];
        $0[14] = $4[(tmp >>= 4) & 15];

        tmp = $6[2];
        $0[17] = $4[tmp & 15];
        $0[16] = $4[(tmp >>= 4) & 15];
        $0[19] = $4[(tmp >>= 4) & 15];
        $0[18] = $4[(tmp >>= 4) & 15];
        $0[21] = $4[(tmp >>= 4) & 15];
        $0[20] = $4[(tmp >>= 4) & 15];
        $0[23] = $4[(tmp >>= 4) & 15];
        $0[22] = $4[(tmp >>= 4) & 15];

        tmp = $6[3];
        $0[25] = $4[tmp & 15];
        $0[24] = $4[(tmp >>= 4) & 15];
        $0[27] = $4[(tmp >>= 4) & 15];
        $0[26] = $4[(tmp >>= 4) & 15];
        $0[29] = $4[(tmp >>= 4) & 15];
        $0[28] = $4[(tmp >>= 4) & 15];
        $0[31] = $4[(tmp >>= 4) & 15];
        $0[30] = $4[(tmp >>= 4) & 15];

        return arrayOutput ? $0 : $0.join("");
    }

    function R(q, a, b, x, s1, s2, t) {
        a += q + x + t;
        return ((a << s1 | a >>> s2) + b) << 0;
    }

    function md5cycle(k) {
        md5_rounds(0, 0, 0, 0, k);

        $6[0] = (BUF[0] + 1732584193) << 0;
        $6[1] = (BUF[1] - 271733879) << 0;
        $6[2] = (BUF[2] - 1732584194) << 0;
        $6[3] = (BUF[3] + 271733878) << 0;
    }

    function md5cycleAdd(k) {
        md5_rounds($6[0], $6[1], $6[2], $6[3], k);

        $6[0] = (BUF[0] + $6[0]) << 0;
        $6[1] = (BUF[1] + $6[1]) << 0;
        $6[2] = (BUF[2] + $6[2]) << 0;
        $6[3] = (BUF[3] + $6[3]) << 0;
    }

    function md5_rounds(a, b, c, d, k) {
        var bc, da;

        if ($7) {
            a = R(((c ^ d) & b) ^ d, a, b, k[0], 7, 25, -680876936);
            d = R(((b ^ c) & a) ^ c, d, a, k[1], 12, 20, -389564586);
            c = R(((a ^ b) & d) ^ b, c, d, k[2], 17, 15, 606105819);
            b = R(((d ^ a) & c) ^ a, b, c, k[3], 22, 10, -1044525330);
        } else {
            a = k[0] - 680876937;
            a = ((a << 7 | a >>> 25) - 271733879) << 0;
            d = k[1] - 117830708 + ((2004318071 & a) ^ -1732584194);
            d = ((d << 12 | d >>> 20) + a) << 0;
            c = k[2] - 1126478375 + (((a ^ -271733879) & d) ^ -271733879);
            c = ((c << 17 | c >>> 15) + d) << 0;
            b = k[3] - 1316259209 + (((d ^ a) & c) ^ a);
            b = ((b << 22 | b >>> 10) + c) << 0;
        }

        a = R(((c ^ d) & b) ^ d, a, b, k[4], 7, 25, -176418897);
        d = R(((b ^ c) & a) ^ c, d, a, k[5], 12, 20, 1200080426);
        c = R(((a ^ b) & d) ^ b, c, d, k[6], 17, 15, -1473231341);
        b = R(((d ^ a) & c) ^ a, b, c, k[7], 22, 10, -45705983);
        a = R(((c ^ d) & b) ^ d, a, b, k[8], 7, 25, 1770035416);
        d = R(((b ^ c) & a) ^ c, d, a, k[9], 12, 20, -1958414417);
        c = R(((a ^ b) & d) ^ b, c, d, k[10], 17, 15, -42063);
        b = R(((d ^ a) & c) ^ a, b, c, k[11], 22, 10, -1990404162);
        a = R(((c ^ d) & b) ^ d, a, b, k[12], 7, 25, 1804603682);
        d = R(((b ^ c) & a) ^ c, d, a, k[13], 12, 20, -40341101);
        c = R(((a ^ b) & d) ^ b, c, d, k[14], 17, 15, -1502002290);
        b = R(((d ^ a) & c) ^ a, b, c, k[15], 22, 10, 1236535329);

        a = R(((b ^ c) & d) ^ c, a, b, k[1], 5, 27, -165796510);
        d = R(((a ^ b) & c) ^ b, d, a, k[6], 9, 23, -1069501632);
        c = R(((d ^ a) & b) ^ a, c, d, k[11], 14, 18, 643717713);
        b = R(((c ^ d) & a) ^ d, b, c, k[0], 20, 12, -373897302);
        a = R(((b ^ c) & d) ^ c, a, b, k[5], 5, 27, -701558691);
        d = R(((a ^ b) & c) ^ b, d, a, k[10], 9, 23, 38016083);
        c = R(((d ^ a) & b) ^ a, c, d, k[15], 14, 18, -660478335);
        b = R(((c ^ d) & a) ^ d, b, c, k[4], 20, 12, -405537848);
        a = R(((b ^ c) & d) ^ c, a, b, k[9], 5, 27, 568446438);
        d = R(((a ^ b) & c) ^ b, d, a, k[14], 9, 23, -1019803690);
        c = R(((d ^ a) & b) ^ a, c, d, k[3], 14, 18, -187363961);
        b = R(((c ^ d) & a) ^ d, b, c, k[8], 20, 12, 1163531501);
        a = R(((b ^ c) & d) ^ c, a, b, k[13], 5, 27, -1444681467);
        d = R(((a ^ b) & c) ^ b, d, a, k[2], 9, 23, -51403784);
        c = R(((d ^ a) & b) ^ a, c, d, k[7], 14, 18, 1735328473);
        b = R(((c ^ d) & a) ^ d, b, c, k[12], 20, 12, -1926607734);

        bc = b ^ c;
        a = R(bc ^ d, a, b, k[5], 4, 28, -378558);
        d = R(bc ^ a, d, a, k[8], 11, 21, -2022574463);
        da = d ^ a;
        c = R(da ^ b, c, d, k[11], 16, 16, 1839030562);
        b = R(da ^ c, b, c, k[14], 23, 9, -35309556);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[1], 4, 28, -1530992060);
        d = R(bc ^ a, d, a, k[4], 11, 21, 1272893353);
        da = d ^ a;
        c = R(da ^ b, c, d, k[7], 16, 16, -155497632);
        b = R(da ^ c, b, c, k[10], 23, 9, -1094730640);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[13], 4, 28, 681279174);
        d = R(bc ^ a, d, a, k[0], 11, 21, -358537222);
        da = d ^ a;
        c = R(da ^ b, c, d, k[3], 16, 16, -722521979);
        b = R(da ^ c, b, c, k[6], 23, 9, 76029189);
        bc = b ^ c;
        a = R(bc ^ d, a, b, k[9], 4, 28, -640364487);
        d = R(bc ^ a, d, a, k[12], 11, 21, -421815835);
        da = d ^ a;
        c = R(da ^ b, c, d, k[15], 16, 16, 530742520);
        b = R(da ^ c, b, c, k[2], 23, 9, -995338651);

        a = R(c ^ (b | ~d), a, b, k[0], 6, 26, -198630844);
        d = R(b ^ (a | ~c), d, a, k[7], 10, 22, 1126891415);
        c = R(a ^ (d | ~b), c, d, k[14], 15, 17, -1416354905);
        b = R(d ^ (c | ~a), b, c, k[5], 21, 11, -57434055);
        a = R(c ^ (b | ~d), a, b, k[12], 6, 26, 1700485571);
        d = R(b ^ (a | ~c), d, a, k[3], 10, 22, -1894986606);
        c = R(a ^ (d | ~b), c, d, k[10], 15, 17, -1051523);
        b = R(d ^ (c | ~a), b, c, k[1], 21, 11, -2054922799);
        a = R(c ^ (b | ~d), a, b, k[8], 6, 26, 1873313359);
        d = R(b ^ (a | ~c), d, a, k[15], 10, 22, -30611744);
        c = R(a ^ (d | ~b), c, d, k[6], 15, 17, -1560198380);
        b = R(d ^ (c | ~a), b, c, k[13], 21, 11, 1309151649);
        a = R(c ^ (b | ~d), a, b, k[4], 6, 26, -145523070);
        d = R(b ^ (a | ~c), d, a, k[11], 10, 22, -1120210379);
        c = R(a ^ (d | ~b), c, d, k[2], 15, 17, 718787259);
        b = R(d ^ (c | ~a), b, c, k[9], 21, 11, -343485551);

        BUF[0] = a;
        BUF[1] = b;
        BUF[2] = c;
        BUF[3] = d;
    }

    g.md5 = g.md5 || md5;
}(window);

(function ($, scope) {

    function NextendCSS() {
        this.style = '';
    }

    NextendCSS.prototype.add = function (css) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    NextendCSS.prototype.deleteRule = function (selectorText) {
        var selectorText1 = selectorText.toLowerCase();
        var selectorText2 = selectorText1.replace('.', '\\.');
        for (var j = document.styleSheets.length - 1; j >= 0; j--) {
            var rules = this._getRulesArray(j);
            for (var i = 0; rules && i < rules.length; i++) {
                if (rules[i].selectorText) {
                    var lo = rules[i].selectorText.toLowerCase();
                    if ((lo == selectorText1) || (lo == selectorText2)) {
                        if (document.styleSheets[j].cssRules) {
                            document.styleSheets[j].deleteRule(i);
                        } else {
                            document.styleSheets[j].removeRule(i);
                        }
                    }
                }
            }
        }
        return (null);
    };

    NextendCSS.prototype._getRulesArray = function (i) {
        var crossrule = null;
        try {
            if (document.styleSheets[i].cssRules)
                crossrule = document.styleSheets[i].cssRules;
            else if (document.styleSheets[i].rules)
                crossrule = document.styleSheets[i].rules;
        } catch (e) {
        }
        return (crossrule);
    };

    window.nextend.css = new NextendCSS();

})(n2, window);

(function ($, scope, undefined) {

    function NextendImageHelper(parameters, openLightbox, openMultipleLightbox, openFoldersLightbox) {
        NextendImageHelper.prototype.openLightbox = openLightbox;
        NextendImageHelper.prototype.openMultipleLightbox = openMultipleLightbox;
        NextendImageHelper.prototype.openFoldersLightbox = openFoldersLightbox;
        nextend.imageHelper = this;
        this.parameters = $.extend({
            siteKeywords: [],
            imageUrls: [],
            wordpressUrl: '',
            placeholderImage: '',
            placeholderRepeatedImage: '',
            protocolRelative: 1
        }, parameters);
    }

    NextendImageHelper.prototype.protocolRelative = function (image) {
        if (this.parameters.protocolRelative) {
            return image.replace(/^http(s)?:\/\//, '//');
        }
        return image;
    }


    NextendImageHelper.prototype.make = function (image) {
        return this.dynamic(image);
    };

    NextendImageHelper.prototype.dynamic = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords,
            _image = this.protocolRelative(image);
        for (var i = 0; i < keywords.length; i++) {
            if (_image.indexOf(imageUrls[i]) === 0) {
                image = keywords[i] + _image.slice(imageUrls[i].length);
                break;
            }
        }
        return image;
    };

    NextendImageHelper.prototype.fixed = function (image) {
        var imageUrls = this.parameters.imageUrls,
            keywords = this.parameters.siteKeywords;
        for (var i = 0; i < keywords.length; i++) {
            if (image.indexOf(keywords[i]) === 0) {
                image = imageUrls[i] + image.slice(keywords[i].length);
				break;
            }
        }
        return image;
    };

    NextendImageHelper.prototype.openLightbox = function (callback) {

    };

    NextendImageHelper.prototype.openMultipleLightbox = function (callback) {
    };

    NextendImageHelper.prototype.openFoldersLightbox = function (callback) {
    };

    NextendImageHelper.prototype.getPlaceholder = function () {
        return this.fixed(this.parameters.placeholderImage);
    };

    NextendImageHelper.prototype.getRepeatedPlaceholder = function () {
        return this.fixed(this.parameters.placeholderRepeatedImage);
    };

    scope.NextendImageHelper = NextendImageHelper;

})(n2, window);
;
(function ($, scope) {

    var counter = 0;

    function NextendModal(panes, show, args) {
        this.inited = false;
        this.currentPane = null;
        this.customClass = '';
        this.$ = $(this);
        this.counter = counter++;

        this.panes = panes;

        if (show) {
            this.show(null, args);
        }

    }

    NextendModal.prototype.setCustomClass = function (customClass) {
        this.customClass = customClass;
    };

    NextendModal.prototype.lateInit = function () {
        if (!this.inited) {

            for (var k in this.panes) {
                this.panes[k] = $.extend({
                    customClass: '',
                    fit: false,
                    fitX: true,
                    overflow: 'hidden',
                    size: false,
                    back: false,
                    close: true,
                    controlsClass: '',
                    controls: [],
                    fn: {}
                }, this.panes[k]);
            }

            var stopClick = false;
            this.modal = $('<div class="n2-modal ' + this.customClass + '"/>').css('opacity', 0)
                .on('click', $.proxy(function (e) {
                    if (stopClick == false) {
                        if (!this.close.hasClass('n2-hidden') && $(e.target).closest('.n2-notification-center-modal').length == 0) {
                            this.hide(e);
                        }
                    }
                    stopClick = false;
                }, this));
            this.window = $('<div class="n2-modal-window n2-border-radius"/>')
                .on('click', function (e) {
                    stopClick = true;
                }).appendTo(this.modal);
            this.notificationStack = new NextendNotificationCenterStackModal(this.modal);

            var titleContainer = $('<div class="n2-modal-title n2-content-box-title-bg"/>')
                .appendTo(this.window);

            this.title = $('<div class="n2-h2 n2-ucf"/>').appendTo(titleContainer);
            this.back = $('<i class="n2-i n2-i-a-back"/>')
                .on('click', $.proxy(this.goBackButton, this))
                .appendTo(titleContainer);
            this.close = $('<i class="n2-i n2-i-a-deletes"/>')
                .on('click', $.proxy(this.hide, this))
                .appendTo(titleContainer);

            this.content = $('<div class="n2-modal-content"/>').appendTo(this.window);
            this.controls = $('<div class="n2-table n2-table-fixed n2-table-auto"/>');

            $('<div class="n2-modal-controls"/>')
                .append(this.controls)
                .appendTo(this.window);

            this.inited = true;
        }
    };

    NextendModal.prototype.show = function (paneId, args) {
        this.lateInit();
        this.notificationStack.enableStack();
        if (typeof paneId === 'undefined' || !paneId) {
            paneId = 'zero';
        }

        nextend.context.addWindow("modal");
        NextendEsc.add($.proxy(function () {
            if (!this.close.hasClass('n2-hidden')) {
                this.hide('esc');
                return true;
            }
            return false;
        }, this));

        this.loadPane(paneId, false, true, args);

        NextendTween.fromTo(this.modal, 0.3, {
            opacity: 0
        }, {
            opacity: 1,
            ease: 'easeOutCubic'
        }).play();
    };

    NextendModal.prototype.hide = function (e) {
        $(window).off('.n2-modal-' + this.counter);
        this.notificationStack.popStack();
        nextend.context.removeWindow();
        if (arguments.length > 0 && e != 'esc') {
            NextendEsc.pop();
        }
        this.apply('hide');
        this.apply('destroy');
        this.currentPane = null;
        this.modal.detach();

        $(document).off('keyup.n2-esc-modal');
    };

    NextendModal.prototype.destroy = function () {
        this.modal.remove();
    };

    NextendModal.prototype.loadPane = function (id, backward, isShow, args) {
        var end = $.proxy(function () {
            var pane = this.panes[id];
            this.currentPane = pane;

            if (pane.title !== false) {
                this.title.html(pane.title);
            }

            if (pane.back === false) {
                this.back.addClass('n2-hidden');
            } else {
                this.back.removeClass('n2-hidden');
            }

            if (pane.close === false) {
                this.close.addClass('n2-hidden');
            } else {
                this.close.removeClass('n2-hidden');
            }

            this.content.find('> *').detach();
            this.content.append(pane.content);


            var hasControls = false;
            var tr = $('<div class="n2-tr" />');
            var i = 0;
            for (; i < pane.controls.length; i++) {
                $('<div class="n2-td"/>')
                    .addClass('n2-modal-controls-' + i)
                    .html(pane.controls[i])
                    .appendTo(tr);
                hasControls = true;
            }

            tr.addClass('n2-modal-controls-' + i);
            this.controls.html(tr);
            this.controls.attr('class', 'n2-table n2-table-fixed n2-table-auto ' + pane.controlsClass);


            if (typeof isShow == 'undefined' || !isShow) {
                NextendTween.fromTo(this.window, 0.3, {
                    x: backward ? -2000 : 2000
                }, {
                    x: 0,
                    ease: 'easeOutCubic'
                }).play();
            }

            this.modal.appendTo('#n2-admin');

            if (pane.fit) {
                var $w = $(window),
                    margin = 40,
                    resize = $.proxy(function () {
                        var w = $w.width() - 2 * margin,
                            h = $w.height() - 2 * margin;

                        if (!pane.fitX) {
                            w = pane.size[0];
                        }
                        this.window.css({
                            width: w,
                            height: h,
                            marginLeft: w / -2,
                            marginTop: h / -2
                        });

                        this.content.css({
                            height: h - 80 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                            overflow: pane.overflow
                        });
                    }, this);
                resize();
                $w.on('resize.n2-modal-' + this.counter, resize);
            } else if (pane.size !== false) {
                this.window.css({
                    width: pane.size[0],
                    height: pane.size[1],
                    marginLeft: pane.size[0] / -2,
                    marginTop: pane.size[1] / -2
                });

                this.content.css({
                    height: pane.size[1] - 80 - (hasControls ? this.controls.parent().outerHeight(true) : 0),
                    overflow: pane.overflow
                });

            }

            this.apply('show', args);

        }, this);

        if (this.currentPane !== null) {
            this.apply('destroy');
            NextendTween.to(this.window, 0.3, {
                x: backward ? 2000 : -2000,
                onComplete: end,
                ease: 'easeOutCubic'
            }).play();
        } else {
            end();
        }

    };

    NextendModal.prototype.trigger = function (event, args) {
        this.$.trigger(event, args);
    };

    NextendModal.prototype.on = function (event, fn) {
        this.$.on(event, fn);
    };

    NextendModal.prototype.one = function (event, fn) {
        this.$.one(event, fn);
    };

    NextendModal.prototype.off = function (event, fn) {
        this.$.off(event, fn);
    };

    NextendModal.prototype.goBackButton = function () {
        var args = null;
        if (typeof this.goBackArgs !== null) {
            args = this.goBackArgs;
            this.goBackArgs = null;
        }
        this.goBack(args);
    };

    NextendModal.prototype.goBack = function (args) {
        if (this.apply('goBack', args)) {
            this.loadPane(this.currentPane.back, true, false, args);
        }
    };

    NextendModal.prototype.apply = function (event, args) {
        if (typeof this.currentPane.fn[event] !== 'undefined') {
            return this.currentPane.fn[event].apply(this, args);
        }
        return true;
    };

    NextendModal.prototype.createInput = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createInputUnit = function (label, id, unit) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"><div class="n2-text-unit n2-h5 n2-uc">' + unit + '</div></div></div></div></div>');
    };

    NextendModal.prototype.createInputSub = function (label, id, sub) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-text n2-border-radius"><div class="n2-text-sub-label n2-h5 n2-uc">' + sub + '</div><input type="text" id="' + id + '" value="" class="n2-h5" autocomplete="off" style="' + style + '"></div></div></div></div>');
    };

    NextendModal.prototype.createTextarea = function (label, id) {
        var style = '';
        if (arguments.length == 3) {
            style = arguments[2];
        }
        return $('<div class="n2-form-element-mixed"><div class="n2-mixed-group"><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-textarea n2-border-radius"><textarea id="' + id + '" class="n2-h5" autocomplete="off" style="resize:none;' + style + '"></textarea></div></div></div></div>');
    };


    NextendModal.prototype.createSelect = function (label, id, values) {
        var style = '';
        if (arguments.length == 4) {
            style = arguments[3];
        }
        $group = $('<div class="n2-form-element-mixed"><div class="n2-mixed-group "><div class="n2-mixed-label"><label for="' + id + '">' + label + '</label></div><div class="n2-mixed-element"><div class="n2-form-element-list" style=""><select id="' + id + '" autocomplete="off" style="' + style + '"></select></div></div></div></div>');
        $select = $group.find('select');

        for (var k in values) {
            $select.append('<option value="' + k + '">' + values[k] + '</option>');
        }
        $select.prop('selectedIndex', 0);

        return $group;
    };


    NextendModal.prototype.createHeading = function (title) {
        return $('<h3 class="n2-h3">' + title + '</h3>');
    };
    NextendModal.prototype.createSubHeading = function (title) {
        return $('<h3 class="n2-h4">' + title + '</h3>');
    };

    NextendModal.prototype.createCenteredHeading = function (title) {
        return $('<h3 class="n2-h3 n2-center">' + title + '</h3>');
    };
    NextendModal.prototype.createCenteredSubHeading = function (title) {
        return $('<h3 class="n2-h4 n2-center">' + title + '</h3>');
    };

    NextendModal.prototype.createResult = function () {
        return $('<div class="n2-result"></div>');
    };

    NextendModal.prototype.createTable = function (data, style) {
        var table = $('<table class="n2-table-fancy"/>');
        for (var j = 0; j < data.length; j++) {
            var tr = $('<tr />').appendTo(table);
            for (var i = 0; i < data[j].length; i++) {
                tr.append($('<td style="' + style[i] + '"/>').append(data[j][i]));
            }
        }
        return table;
    };

    NextendModal.prototype.createTableWrap = function () {
        return $('<div class="n2-table-fancy-wrap" style="overflow:auto;height:196px;" />');
    };

    NextendModal.prototype.createImageRadio = function (options) {

        var wrapper = $('<div class="n2-modal-radio" />'),
            input = $('<input type="hidden" value="' + options[0].key + '"/>').appendTo(wrapper);

        for (var i = 0; i < options.length; i++) {
            wrapper.append('<div class="n2-modal-radio-option" data-key="' + options[i].key + '" style="background-image: url(\'' + nextend.imageHelper.fixed(options[i].image) + '\')"><div class="n2-h4">' + options[i].name + '</div></div>')
        }

        var options = wrapper.find('.n2-modal-radio-option');
        options.eq(0).addClass('n2-active');

        options.on('click', function (e) {
            options.removeClass('n2-active');
            var option = $(e.currentTarget);
            option.addClass('n2-active');
            input.val(option.data('key'));
        });

        return wrapper;
    };

    scope.NextendModal = NextendModal;


    scope.NextendModalSetting = {
        show: function (title, url) {
            new NextendModal({
                zero: {
                    size: [
                        1300,
                        700
                    ],
                    title: title,
                    content: '<iframe src="' + url + '" width="1300" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
                }
            }, true);
        }
    };
    scope.NextendModalDocumentation = function (title, url) {
        new NextendModal({
            zero: {
                size: [
                    760,
                    700
                ],
                title: title,
                content: '<iframe src="' + url + '" width="760" height="640" frameborder="0" style="margin:0 -20px -20px -20px;"></iframe>'
            }
        }, true);
    };

    scope.NextendNewFullWindow = function (url, id) {
        var params = [
            'height=' + screen.height,
            'width=' + screen.width,
            'fullscreen=yes'
        ].join(',');

        var popup = window.open(url, id, params);
        popup.moveTo(0, 0);
        return popup;
    };

    function NextendSimpleModal(html, options) {
        this.$ = $(this);
        this.options = $.extend({
            'class': ''
        }, options);
        this.modal = $('<div class="n2-modal n2-modal-simple"/>').addClass(this.options.class).css({
            display: 'none'
        }).appendTo('#n2-admin');

        $('<i class="n2-i n2-i-a-deletes"/>')
            .on('click', $.proxy(this.hide, this))
            .appendTo(this.modal);

        this.window = $('<div class="n2-modal-window"/>')
            .on('click', function (e) {
                e.stopPropagation();
            })
            .appendTo(this.modal);
        this.notificationStack = new NextendNotificationCenterStackModal(this.modal);
        this.content = $(html).appendTo(this.window);
    };

    NextendSimpleModal.prototype.resize = function () {
        this.window.width(this.modal.width());
        this.window.height(this.modal.height());
    };

    NextendSimpleModal.prototype.show = function () {
        $('body').addClass('n2-modal-active');
        this.modal.css('display', 'block');
        this.resize();
        $(window).on('resize.n2-simple-modal', $.proxy(this.resize, this));
        this.notificationStack.enableStack();

        NextendEsc.add($.proxy(function () {
            this.hide('esc');
            return true;
        }, this));
    };

    NextendSimpleModal.prototype.hide = function (e) {
        this.notificationStack.popStack();
        if (arguments.length > 0 && e != 'esc') {
            NextendEsc.pop();
        }
        this.modal.css('display', 'none');
        $('body').removeClass('n2-modal-active');
        $(document).off('keyup.n2-esc-modal');
        $(window).off('.n2-simple-modal');
        this.modal.trigger('ModalHide');
    };

    scope.NextendSimpleModal = NextendSimpleModal;

    function NextendDeleteModal(identifier, instanceName, callback) {
        if ($.jStorage.get('n2-delete-' + identifier, false)) {
            callback();
            return true;
        }
        new NextendModal({
            zero: {
                size: [
                    500,
                    190
                ],
                title: n2_('Delete'),
                back: false,
                close: true,
                content: '',
                controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-grey n2-uc n2-h4">' + n2_('Cancel') + '</a>', '<div class="n2-button n2-button-with-actions n2-button-l n2-radius-s n2-button-red"><a href="#" class="n2-button-inner n2-uc n2-h4">' + n2_('Delete') + '</a><div class="n2-button-menu-open"><i class="n2-i n2-i-buttonarrow"></i><div class="n2-button-menu"><div class="n2-button-menu-inner n2-border-radius"><a href="#" class="n2-h4">' + n2_('Delete and never ask for confirmation again') + '</a></div></div></div></div>'],
                fn: {
                    show: function () {
                        this.createCenteredSubHeading(n2_('Are you sure you want to delete?')).appendTo(this.content);
                        this.controls.find('.n2-button-grey')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                this.hide(e);
                            }, this));
                        this.controls.find('.n2-button-red a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                callback();
                                this.hide(e);
                            }, this));

                        this.controls.find('.n2-button-red .n2-button-menu-inner a')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                $.jStorage.set('n2-delete-' + identifier, true);
                            }, this));

                        this.controls.find(".n2-button-menu-open").n2opener();

                    },
                    destroy: function () {
                        this.destroy();
                    }
                }
            }
        }, true);
        return false;
    };

    scope.NextendDeleteModal = NextendDeleteModal;

    function NextendDeleteModalLink(element, identifier, instanceName) {

        NextendDeleteModal(identifier, instanceName, function () {
            window.location.href = $(element).attr('href');
        });
        return false;
    };
    scope.NextendDeleteModalLink = NextendDeleteModalLink;

})
(n2, window);
;
(function ($, scope) {

    function NextendNotificationCenter() {
        this.stack = [];
        this.tween = null;

        nextend.ready($.proxy(function () {
            var mainTopBar = $('#n2-admin').find('.n2-main-top-bar');
            if (mainTopBar.length > 0) {
                var stack = new NextendNotificationCenterStack($('#n2-admin').find('.n2-main-top-bar'));
                stack.enableStack();
            } else {
                var stack = new NextendNotificationCenterStackModal($('#n2-admin'));
                stack.enableStack();
            }
        }, this));
    };


    NextendNotificationCenter.prototype.add = function (stack) {
        this.stack.push(stack);
    };

    NextendNotificationCenter.prototype.popStack = function () {
        this.stack.pop();
    };

    /**
     * @returns {NextendNotificationCenterStack}
     */
    NextendNotificationCenter.prototype.getCurrentStack = function () {
        return this.stack[this.stack.length - 1];
    };

    NextendNotificationCenter.prototype.success = function (message, parameters) {
        this.getCurrentStack().success(message, parameters);
    };

    NextendNotificationCenter.prototype.error = function (message, parameters) {
        this.getCurrentStack().error(message, parameters);
    };

    NextendNotificationCenter.prototype.notice = function (message, parameters) {
        this.getCurrentStack().notice(message, parameters);
    };

    window.nextend.notificationCenter = new NextendNotificationCenter();


    function NextendNotificationCenterStack(bar) {
        this.messages = [];
        this.isShow = false;
        this.importantOnly = 0;

        this.importantOnlyNode = $('<div class="n2-notification-important n2-h5 ' + (this.importantOnly ? 'n2-active' : '') + '"><span>' + n2_('Show only errors') + '</span><div class="n2-checkbox n2-light"><i class="n2-i n2-i-tick"></i></div></div>')
            .on('click', $.proxy(this.changeImportant, this));
        $.jStorage.listenKeyChange('ss-important-only', $.proxy(this.importantOnlyChanged, this));
        this.importantOnlyChanged();

        this._init(bar);
        this.emptyMessage = $('<div class="n2-notification-empty n2-h4">' + n2_('There are no messages to display.') + '</div>');
    }

    NextendNotificationCenterStack.prototype._init = function (bar) {

        this.showButton = bar.find('.n2-notification-button')
            .on('click', $.proxy(this.hideOrShow, this));

        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-normal n2-button-s n2-button-blue n2-radius-s n2-h5 n2-uc n2-notification-clear">' + n2_('Got it!') + '</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);


        this.container = this.messageContainer = $('<div class="n2-notification-center n2-border-radius-br n2-border-radius-bl"></div>')
            .append(settings)
            .appendTo(bar);
    };

    NextendNotificationCenterStack.prototype.enableStack = function () {
        nextend.notificationCenter.add(this);
    };

    NextendNotificationCenterStack.prototype.popStack = function () {
        nextend.notificationCenter.popStack();
    };

    NextendNotificationCenterStack.prototype.hideOrShow = function (e) {
        e.preventDefault();
        if (this.isShow) {
            this.hide()
        } else {
            this.show();
        }
    };

    NextendNotificationCenterStack.prototype.show = function () {
        if (!this.isShow) {
            this.isShow = true;

            if (this.messages.length == 0) {
                this.showEmptyMessage();
            }

            if (this.showButton) {
                this.showButton.addClass('n2-active');
            }
            this.container.addClass('n2-active');

            this.container.css('display', 'block');

            this._animateShow();
        }
    };

    NextendNotificationCenterStack.prototype.hide = function () {
        if (this.isShow) {
            if (this.showButton) {
                this.showButton.removeClass('n2-active');
            }
            this.container.removeClass('n2-active');

            this._animateHide();

            this.container.css('display', 'none');

            this.isShow = false;
        }
    };

    NextendNotificationCenterStack.prototype._animateShow = function () {
        if (this.tween) {
            this.tween.pause();
        }
        this.tween = NextendTween.fromTo(this.container, 0.4, {
            opacity: 0
        }, {
            opacity: 1
        }).play();
    };

    NextendNotificationCenterStack.prototype._animateHide = function () {
        if (this.tween) {
            this.tween.pause();
        }
    };

    NextendNotificationCenterStack.prototype.success = function (message, parameters) {
        this._message('success', n2_('success'), message, parameters);
    };

    NextendNotificationCenterStack.prototype.error = function (message, parameters) {
        this._message('error', n2_('error'), message, parameters);
    };

    NextendNotificationCenterStack.prototype.notice = function (message, parameters) {
        this._message('notice', n2_('notice'), message, parameters);
    };

    NextendNotificationCenterStack.prototype._message = function (type, label, message, parameters) {

        this.hideEmptyMessage();

        parameters = $.extend({
            timeout: false,
            remove: false
        }, parameters);

        var messageNode = $('<div></div>');

        if (parameters.timeout) {
            setTimeout($.proxy(function () {
                this.hideMessage(messageNode, parameters.remove);
            }, this), parameters.timeout * 1000);
        }

        messageNode
            .addClass('n2-table n2-table-fixed n2-h3 n2-border-radius n2-notification-message n2-notification-message-' + type)
            .append($('<div class="n2-tr"></div>')
                .append('<div class="n2-td n2-first"><i class="n2-i n2-i-n-' + type + '"/></div>')
                .append('<div class="n2-td n2-message"><h4 class="n2-h4 n2-uc">' + label + '</h4><p class="n2-h4">' + message + '</p></div>'))
            .prependTo(this.messageContainer);

        this.messages.push(messageNode);
        if (this.messages.length > 3) {
            this.messages.shift().remove();
        }

        if (!this.importantOnly || type == 'error' || type == 'notice') {
            this.show();
        }
        return messageNode;
    };

    NextendNotificationCenterStack.prototype.hideMessage = function (message, remove) {
        if (remove) {
            this.deleteMessage(message);
        } else {
            this.hide();
        }
    };

    NextendNotificationCenterStack.prototype.deleteMessage = function (message) {
        var index = $.inArray(message, this.messages);
        if (index > -1) {
            this.messages.splice(index, 1);
            message.remove();
        }
        if (this.messages.length == 0) {
            this.hide();
        }
    };
    NextendNotificationCenterStack.prototype.clear = function () {
        for (var i = this.messages.length - 1; i >= 0; i--) {
            this.messages.pop().remove();
        }

        this.showEmptyMessage();

        this.hide();
    };
    NextendNotificationCenterStack.prototype.changeImportant = function () {
        if (this.importantOnly) {
            $.jStorage.set('ss-important-only', 0);
        } else {
            $.jStorage.set('ss-important-only', 1);
        }
    };

    NextendNotificationCenterStack.prototype.importantOnlyChanged = function () {
        this.importantOnly = parseInt($.jStorage.get('ss-important-only', 0));
        if (this.importantOnly) {
            this.importantOnlyNode.addClass('n2-active');
        } else {
            this.importantOnlyNode.removeClass('n2-active');
        }
    };

    NextendNotificationCenterStack.prototype.showEmptyMessage = function () {
        this.emptyMessage.prependTo(this.container);
    };

    NextendNotificationCenterStack.prototype.hideEmptyMessage = function () {
        this.emptyMessage.detach();
    };

    scope.NextendNotificationCenterStack = NextendNotificationCenterStack;


    function NextendNotificationCenterStackModal() {
        NextendNotificationCenterStack.prototype.constructor.apply(this, arguments);
    }

    NextendNotificationCenterStackModal.prototype = Object.create(NextendNotificationCenterStack.prototype);
    NextendNotificationCenterStackModal.prototype.constructor = NextendNotificationCenterStackModal;


    NextendNotificationCenterStackModal.prototype._init = function (bar) {
        var settings = $('<div class="n2-notification-settings"></div>')
            .append($('<div class="n2-button n2-button-normal n2-button-s n2-button-blue n2-radius-s n2-h5 n2-uc n2-notification-clear">Got it!</div>').on('click', $.proxy(this.clear, this)))
            .append(this.importantOnlyNode);

        this.messageContainer = $('<div class="n2-notification-center n2-border-radius"></div>')
            .append(settings);
        this.container = $('<div class="n2-notification-center-modal"></div>')
            .append(this.messageContainer)
            .appendTo(bar);
    };

    NextendNotificationCenterStackModal.prototype.show = function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
        NextendEsc.add($.proxy(function () {
            this.clear();
            return false;
        }, this));

        NextendNotificationCenterStack.prototype.show.apply(this, arguments);
    };

    NextendNotificationCenterStackModal.prototype.hide = function () {
        NextendEsc.pop();

        NextendNotificationCenterStack.prototype.hide.apply(this, arguments);
    };

    NextendNotificationCenterStackModal.prototype._animateShow = function () {

    };

    NextendNotificationCenterStackModal.prototype._animateHide = function () {

    };

    scope.NextendNotificationCenterStackModal = NextendNotificationCenterStackModal;

})(n2, window);
// Spectrum Colorpicker v1.0.9
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    var tinycolor = null;
    var defaultOpts = {

            // Events
            beforeShow: noop,
            move: noop,
            change: noop,
            show: noop,
            hide: noop,

            // Options
            color: false,
            flat: false,
            showInput: false,
            showButtons: true,
            clickoutFiresChange: false,
            showInitial: false,
            showPalette: false,
            showPaletteOnly: false,
            showSelectionPalette: true,
            localStorageKey: false,
            maxSelectionSize: 7,
            cancelText: "cancel",
            chooseText: "choose",
            preferredFormat: false,
            className: "",
            showAlpha: false,
            theme: "n2-sp-light",
            palette: ['fff', '000'],
            selectionPalette: [],
            disabled: false
        },
        spectrums = [],
        IE = !!/msie/i.exec(window.navigator.userAgent),
        rgbaSupport = (function () {
            function contains(str, substr) {
                return !!~('' + str).indexOf(substr);
            }

            var elem = document.createElement('div');
            var style = elem.style;
            style.cssText = 'background-color:rgba(0,0,0,.5)';
            return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
        })(),
        replaceInput = [
            "<div class='n2-sp-replacer'>",
            "<div class='n2-sp-preview'><div class='n2-sp-preview-inner'></div></div>",
            "<div class='n2-sp-dd'>&#9650;</div>",
            "</div>"
        ].join(''),
        markup = (function () {

            // IE does not support gradients with multiple stops, so we need to simulate
            //  that for the rainbow slider with 8 divs that each have a single gradient
            var gradientFix = "";
            if (IE) {
                for (var i = 1; i <= 6; i++) {
                    gradientFix += "<div class='n2-sp-" + i + "'></div>";
                }
            }

            return [
                "<div class='n2-sp-container'>",
                "<div class='n2-sp-palette-container'>",
                "<div class='n2-sp-palette n2-sp-thumb n2-sp-cf'></div>",
                "</div>",
                "<div class='n2-sp-picker-container'>",
                "<div class='n2-sp-top n2-sp-cf'>",
                "<div class='n2-sp-fill'></div>",
                "<div class='n2-sp-top-inner'>",
                "<div class='n2-sp-color'>",
                "<div class='n2-sp-sat'>",
                "<div class='n2-sp-val'>",
                "<div class='n2-sp-dragger'></div>",
                "</div>",
                "</div>",
                "</div>",
                "<div class='n2-sp-hue'>",
                "<div class='n2-sp-slider'></div>",
                gradientFix,
                "</div>",
                "</div>",
                "<div class='n2-sp-alpha'><div class='n2-sp-alpha-inner'><div class='n2-sp-alpha-handle'></div></div></div>",
                "</div>",
                "<div class='n2-sp-input-container n2-sp-cf'>",
                "<input class='n2-sp-input' type='text' spellcheck='false'  />",
                "</div>",
                "<div class='n2-sp-initial n2-sp-thumb n2-sp-cf'></div>",
                "<div class='n2-sp-button-container n2-sp-cf'>",
                "<a class='n2-sp-cancel' href='#'></a>",
                "<button class='n2-sp-choose'></button>",
                "</div>",
                "</div>",
                "</div>"
            ].join("");
        })();

    function paletteTemplate(p, color, className) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var tiny = tinycolor(p[i]);
            var c = tiny.toHsl().l < 0.5 ? "n2-sp-thumb-el n2-sp-thumb-dark" : "n2-sp-thumb-el n2-sp-thumb-light";
            c += (tinycolor.equals(color, p[i])) ? " n2-sp-thumb-active" : "";

            var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
            html.push('<span title="' + tiny.toRgbString() + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="n2-sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
        }
        return "<div class='n2-sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = opts.palette.slice(0),
            paletteArray = $.isArray(palette[0]) ? palette : [palette],
            selectionPalette = opts.selectionPalette.slice(0),
            draggingClass = "n2-sp-dragging";


        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".n2-sp-color"),
            dragHelper = container.find(".n2-sp-dragger"),
            slider = container.find(".n2-sp-hue"),
            slideHelper = container.find(".n2-sp-slider"),
            alphaSliderInner = container.find(".n2-sp-alpha-inner"),
            alphaSlider = container.find(".n2-sp-alpha"),
            alphaSlideHelper = container.find(".n2-sp-alpha-handle"),
            textInput = container.find(".n2-sp-input"),
            paletteContainer = container.find(".n2-sp-palette"),
            initialColorContainer = container.find(".n2-sp-initial"),
            cancelButton = container.find(".n2-sp-cancel"),
            chooseButton = container.find(".n2-sp-choose"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !flat,
            replacer = null,
            offsetElement = null,
            previewElement = null,
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange;

        container.on('mousedown', function (e) {
            nextend.context.setMouseDownArea('colorpicker', e);
        });


        function applyOptions(noReflow) {

            container.toggleClass("n2-sp-flat", flat);
            container.toggleClass("n2-sp-input-disabled", !opts.showInput);
            container.toggleClass("n2-sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("n2-sp-buttons-disabled", !opts.showButtons || flat);
            container.toggleClass("n2-sp-palette-disabled", !opts.showPalette);
            container.toggleClass("n2-sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("n2-sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className);

            if (typeof noReflow === 'undefined') {
                reflow();
            }
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            var customReplace = boundElement.parent().find('.n2-sp-replacer');
            if (customReplace.length) {
                replacer = customReplace;
            } else {
                replacer = (shouldReplace) ? $(replaceInput).addClass(theme) : $([]);

                if (shouldReplace) {
                    //boundElement.hide().after(replacer);
                    boundElement.parent().after(replacer);
                }
            }
            offsetElement = (shouldReplace) ? replacer : boundElement;
            previewElement = replacer.find(".n2-sp-preview-inner");

            applyOptions(true);

            if (flat) {
                boundElement.parent().after(container).hide();
            }
            else {
                $(body).append(container.hide());
            }

            if (localStorageKey && window.localStorage) {

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) {
                }
            }

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if (boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) {
                if (e.keyCode == 13) {
                    setFromTextInput();
                }
            });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            });

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY) {
                currentSaturation = parseFloat(dragX / dragWidth);
                currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                move();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    updateOriginalInput(true);
                    move();
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".n2-sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".n2-sp-thumb-el:nth-child(1)", paletteEvent, {ignore: true}, palletElementClick);
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var colorRgb = tinycolor(color).toRgbString();
                if ($.inArray(colorRgb, selectionPalette) === -1) {
                    selectionPalette.push(colorRgb);
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch (e) {
                    }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            var p = selectionPalette;
            var paletteLookup = {};
            var rgb;

            if (opts.showPalette) {

                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }

                for (i = 0; i < p.length; i++) {
                    rgb = tinycolor(p[i]).toRgbString();

                    if (!paletteLookup.hasOwnProperty(rgb)) {
                        unique.push(p[i]);
                        paletteLookup[rgb] = true;
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "n2-sp-palette-row n2-sp-palette-row-" + i);
            });

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "n2-sp-palette-row n2-sp-palette-row-selection"));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "n2-sp-palette-row-initial"));
            }
        }

        function dragStart() {
            if (dragHeight === 0 || dragWidth === 0 || slideHeight === 0) {
                reflow();
            }
            container.addClass(draggingClass);
        }

        function dragStop() {
            container.removeClass(draggingClass);
        }

        function setFromTextInput() {
            var tiny = tinycolor(textInput.val());
            if (tiny.ok) {
                set(tiny);
            }
            else {
                textInput.addClass("n2-sp-validation-error");
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            if (visible) {
                reflow();
                return;
            }
            if (callbacks.beforeShow(get()) === false) return;

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("n2-sp-active");
            container.show();

            if (opts.showPalette) {
                drawPalette();
            }
            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) {
                return;
            }

            // Return if hiding is unnecessary
            if (!visible || flat) {
                return;
            }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("n2-sp-active");
            container.hide();

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                return;
            }

            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();

            currentHue = newHsv.h;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            currentAlpha = newHsv.a;

            updateUI();

            if (!ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get() {
            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            });
        }

        function isValid() {
            return !textInput.hasClass("n2-sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
        }

        function updateUI() {

            textInput.removeClass("n2-sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor({h: currentHue, s: "1.0", v: "1.0"});
            dragger.css("background-color", '#' + flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1) {
                if (format === "hex" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get(),
                realHex = realColor.toHexString(),
                realRgb = realColor.toRgbString();


            // Update the replaced elements background color (with actual selected color)
            if (rgbaSupport || realColor.alpha === 1) {
                previewElement.css("background-color", realRgb);
            }
            else {
                previewElement.css("background-color", "transparent");
                previewElement.css("filter", realColor.toFilter());
            }

            if (opts.showAlpha) {
                var rgb = realColor.toRgb();
                rgb.a = 0;
                var realAlpha = tinycolor(rgb).toRgbString();
                var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                if (IE) {
                    alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({gradientType: 1}, realHex));
                }
                else {
                    alphaSliderInner.css("background", "-webkit-" + gradient);
                    alphaSliderInner.css("background", "-moz-" + gradient);
                    alphaSliderInner.css("background", "-ms-" + gradient);
                    alphaSliderInner.css("background", gradient);
                }
            }


            // Update the text entry input as it changes happen
            if (opts.showInput) {
                if (currentAlpha < 1) {
                    if (format === "hex" || format === "name") {
                        format = "rgb";
                    }
                }
                textInput.val(realColor.toString(format));
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight,
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight,
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });

            var alphaX = currentAlpha * alphaWidth;
            alphaSlideHelper.css({
                "left": alphaX - (alphaSlideHelperWidth / 2)
            });

            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
        }

        function updateOriginalInput(fireCallback) {
            var color = get();

            if (isInput) {
                boundElement.val(color.toString(currentPreferredFormat)).change();
            }

            //var hasChanged = !tinycolor.equals(color, colorOnShow);
            var hasChanged = 1;

            colorOnShow = color;

            // Update the selection palette with the current color
            addColorToSelectionPalette(color);
            if (fireCallback && hasChanged) {
                callbacks.change(color);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.offset(getOffset(container, offsetElement.parent()));
            }

            updateHelperLocations();
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("n2-sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("n2-sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
     * checkOffset - get the offset below/above and left/right element depending on screen position
     * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
     */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight + 3;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
                Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
                Math.abs(dpHeight + inputHeight + 6 - extraY) : extraY));

        return offset;
    }

    /**
     * noop - do nothing
     */
    function noop() {

    }

    /**
     * stopPropagation - makes the code only doing this a little easier to read in line
     */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
     * Create a function bound to a given object
     * Thanks to underscore.js
     */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
     * Lightweight drag helper.  Handles containment within the element, so that
     * when dragging, the x is within [0,element.width] and y is within [0,element.height]
     */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () {
            };
        onstart = onstart || function () {
            };
        onstop = onstop || function () {
            };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = false;

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents[(hasTouch ? "touchmove" : "mousemove")] = move;
        duringDragEvents[(hasTouch ? "touchend" : "mouseup")] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("n2-sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("n2-sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind(hasTouch ? "touchstart" : "mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }


    /**
     * Define a jQuery plugin
     */
    var dataID = "spectrum.id";
    $.fn.n2spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {

                    var method = spect[opts];
                    if (!method) {
                        throw new Error("Spectrum: no such method: '" + opts + "'");
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.n2spectrum("destroy").each(function () {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.n2spectrum.load = true;
    $.fn.n2spectrum.loadOpts = {};
    $.fn.n2spectrum.draggable = draggable;
    $.fn.n2spectrum.defaults = defaultOpts;

    $.n2spectrum = {};
    $.n2spectrum.localization = {};
    $.n2spectrum.palettes = {};

    $.fn.n2spectrum.processNativeColorInputs = function () {
        var colorInput = $("<input type='color' value='!' />")[0];
        var supportsColor = colorInput.type === "color" && colorInput.value != "!";

        if (!supportsColor) {
            $("input[type=color]").n2spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor.js - <https://github.com/bgrins/TinyColor> - 2011 Brian Grinstead - v0.5

    (function (window) {

        var trimLeft = /^[\s,#]+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            math = Math,
            mathRound = math.round,
            mathMin = math.min,
            mathMax = math.max,
            mathRandom = math.random,
            parseFloat = window.parseFloat;

        tinycolor = function (color, opts) {

            // If input is already a tinycolor, return itself
            if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
                return color;
            }

            var rgb = inputToRGB(color);
            var r = rgb.r, g = rgb.g, b = rgb.b, a = parseFloat(rgb.a), format = rgb.format;

            return {
                ok: rgb.ok,
                format: format,
                _tc_id: tinyCounter++,
                alpha: a,
                toHsv: function () {
                    var hsv = rgbToHsv(r, g, b);
                    return {h: hsv.h, s: hsv.s, v: hsv.v, a: a};
                },
                toHsvString: function () {
                    var hsv = rgbToHsv(r, g, b);
                    var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                    return (a == 1) ?
                    "hsv(" + h + ", " + s + "%, " + v + "%)" :
                    "hsva(" + h + ", " + s + "%, " + v + "%, " + a + ")";
                },
                toHsl: function () {
                    var hsl = rgbToHsl(r, g, b);
                    return {h: hsl.h, s: hsl.s, l: hsl.l, a: a};
                },
                toHslString: function () {
                    var hsl = rgbToHsl(r, g, b);
                    var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                    return (a == 1) ?
                    "hsl(" + h + ", " + s + "%, " + l + "%)" :
                    "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
                },
                toHex: function () {
                    return rgbToHex(r, g, b);
                },
                toHexString: function (force6Char) {
                    return rgbToHex(r, g, b, force6Char);
                },
                toHexString8: function () {
                    return rgbToHex(r, g, b, true) + pad2(mathRound(a * 255).toString(16));
                },
                toRgb: function () {
                    return {r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a};
                },
                toRgbString: function () {
                    return (a == 1) ?
                    "rgb(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                    "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + a + ")";
                },
                toName: function () {
                    return hexNames[rgbToHex(r, g, b)] || false;
                },
                toFilter: function (opts, secondColor) {

                    var hex = rgbToHex(r, g, b, true);
                    var secondHex = hex;
                    var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                    var secondAlphaHex = alphaHex;
                    var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex = s.toHex();
                        secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
                },
                toString: function (format) {
                    format = format || this.format;
                    var formattedString = false;
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "hex") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex6") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "hex8") {
                        formattedString = this.toHexString8();
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString(true);
                }
            };
        }

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function (color) {

            if (typeof color == "object") {
                for (var i in color) {
                    if (color[i] === 1) {
                        color[i] = "1.0";
                    }
                }
            }

            return tinycolor(color);

        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = {r: 0, g: 0, b: 0};
            var a = 1;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = "rgb";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                    rgb = hslToRgb(color.h, color.s, color.l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            rgb.r = mathMin(255, mathMax(rgb.r, 0));
            rgb.g = mathMin(255, mathMax(rgb.g, 0));
            rgb.b = mathMin(255, mathMax(rgb.b, 0));


            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1.
            // If it was supposed to be 128, this was already taken care of in the conversion function
            if (rgb.r < 1) {
                rgb.r = mathRound(rgb.r);
            }
            if (rgb.g < 1) {
                rgb.g = mathRound(rgb.g);
            }
            if (rgb.b < 1) {
                rgb.b = mathRound(rgb.b);
            }

            return {
                ok: ok,
                format: (color && color.format) || format,
                r: rgb.r,
                g: rgb.g,
                b: rgb.b,
                a: a
            };
        }


        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b) {
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }

                h /= 6;
            }

            return {h: h, s: s, l: l};
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            if (s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max == min) {
                h = 0; // achromatic
            }
            else {
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {h: h, s: s, v: v};
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hsvToRgb(h, s, v) {
            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return {r: r * 255, g: g * 255, b: b * 255};
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, force6Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (!force6Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `equals`
        // Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) {
                return false;
            }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };
        tinycolor.random = function () {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>


        tinycolor.desaturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s -= ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.saturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s += ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.greyscale = function (color) {
            return tinycolor.desaturate(color, 100);
        };
        tinycolor.lighten = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l += ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.darken = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l -= ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.complement = function (color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 0.5) % 1;
            return tinycolor(hsl);
        };


        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        tinycolor.triad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 120) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 240) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.tetrad = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 90) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 180) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 270) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.splitcomplement = function (color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h * 360;
            return [
                tinycolor(color),
                tinycolor({h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.analogous = function (color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            hsl.h *= 360;

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results;) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        };
        tinycolor.monochromatic = function (color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        };
        tinycolor.readable = function (color1, color2) {
            var a = tinycolor(color1).toRgb(), b = tinycolor(color2).toRgb();
            return (
                    (b.r - a.r) * (b.r - a.r) +
                    (b.g - a.g) * (b.g - a.g) +
                    (b.b - a.b) * (b.b - a.b)
                ) > 0x28A4;
        };

        // Big List of Colors
        // ---------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = {};
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) {
                n = "100%";
            }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = n * (max / 100);
            }

            // Handle floating point rounding errors
            if (math.abs(n - max) < 0.000001) {
                return 1;
            }
            else if (n >= 1) {
                return (n % max) / parseFloat(max);
            }
            return n;
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

        // Parse an integer into hex
        function parseHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        var matchers = (function () {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return {r: 0, g: 0, b: 0, a: 0};
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return {r: match[1], g: match[2], b: match[3]};
            }
            if ((match = matchers.rgba.exec(color))) {
                return {r: match[1], g: match[2], b: match[3], a: match[4]};
            }
            if ((match = matchers.hsl.exec(color))) {
                return {h: match[1], s: match[2], l: match[3]};
            }
            if ((match = matchers.hsla.exec(color))) {
                return {h: match[1], s: match[2], l: match[3], a: match[4]};
            }
            if ((match = matchers.hsv.exec(color))) {
                return {h: match[1], s: match[2], v: match[3]};
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex8.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    a: parseHex(match[4]) / 255,
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseHex(match[1] + '' + match[1]),
                    g: parseHex(match[2] + '' + match[2]),
                    b: parseHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        // Everything is ready, expose to window
        //tinycolor;

    })(this);

    $(function () {
        if ($.fn.n2spectrum.load) {
            $.fn.n2spectrum.processNativeColorInputs();
        }
    });

})(window, n2);

(function ($, scope) {

    function NextendExpertMode(app, allowed) {
        this.app = 'system';
        this.key = 'IsExpert';
        this.isExpert = 0;

        this.style = $('<div style="display: none;"></div>').appendTo('body');

        if (!allowed) {
            this.switches = $();
            this.disable(false);
        } else {

            this.switches = $('.n2-expert-switch')
                .on({
                    mousedown: $.proxy(nextend.context.setMouseDownArea, nextend.context, 'expertClicked'),
                    click: $.proxy(this.switchExpert, this, true)
                });

            this.load();
            if (!this.isExpert) {
                this.disable(false);
            }

            $.jStorage.listenKeyChange(this.app + this.key, $.proxy(this.load, this));
        }
    };

    NextendExpertMode.prototype.load = function () {
        var isExpert = parseInt($.jStorage.get(this.app + this.key, 0));
        if (isExpert != this.isExpert) {
            this.switchExpert(false, false);
        }
    };

    NextendExpertMode.prototype.set = function (value, needSet) {
        this.isExpert = value;
        if (needSet) {
            $.jStorage.set(this.app + this.key, value);
        }
    };

    NextendExpertMode.prototype.switchExpert = function (needSet, e) {
        if (e) {
            e.preventDefault();
        }
        if (!this.isExpert) {
            this.enable(needSet);
        } else {
            this.disable(needSet);
        }
    };

    NextendExpertMode.prototype.measureElement = function () {
        var el = null,
            scrollTop = $(window).scrollTop(),
            cutoff = scrollTop + 62,
            cutoffBottom = scrollTop + $(window).height() - 100;
        $('.n2-content-area > .n2-heading-bar,.n2-content-area > .n2-form-tab ,#n2-admin .n2-content-area form > .n2-form > .n2-form-tab').each(function () {
            var $el = $(this);
            if ($el.offset().top > cutoff) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            } else if ($el.offset().top + $el.height() > cutoffBottom) {
                if (!$el.hasClass('n2-heading-bar')) {
                    el = $el;
                }
                return false;
            }
        });
        this.measuredElement = el;
    };

    NextendExpertMode.prototype.scrollToMeasured = function () {

        if (this.measuredElement !== null) {
            while (this.measuredElement.length && !this.measuredElement.is(':VISIBLE')) {
                this.measuredElement = this.measuredElement.prev();
            }
            if (this.measuredElement.length != 0) {
                $('html,body').scrollTop(this.measuredElement.offset().top - 102);
            }
        }
    };

    NextendExpertMode.prototype.enable = function (needSet) {
        this.measureElement();
        this.changeStyle('');
        this.set(1, needSet);
        this.switches.addClass('n2-active');
        $('html').addClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    NextendExpertMode.prototype.disable = function (needSet) {
        this.measureElement();
        this.changeStyle('.n2-expert{display: none !important;}');
        this.set(0, needSet);
        this.switches.removeClass('n2-active');
        $('html').removeClass('n2-in-expert');

        if (needSet) {
            this.scrollToMeasured();
        }
    };

    NextendExpertMode.prototype.changeStyle = function (style) {
        this.style.html('<style type="text/css">' + style + '</style>');
    };

    scope.NextendExpertMode = NextendExpertMode

})(n2, window);
/*!
 * jQuery Mousewheel 3.1.12
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

(function (factory) {
    factory(n2);
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
            ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ($.event.fixHooks) {
        for (var i = toFix.length; i;) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function () {
            if (this.addEventListener) {
                for (var i = toBind.length; i;) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function () {
            if (this.removeEventListener) {
                for (var i = toBind.length; i;) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function (elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function (elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function (fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function (fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            offsetX = 0,
            offsetY = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ('detail'      in orgEvent) {
            deltaY = orgEvent.detail * -1;
        }
        if ('wheelDelta'  in orgEvent) {
            deltaY = orgEvent.wheelDelta;
        }
        if ('wheelDeltaY' in orgEvent) {
            deltaY = orgEvent.wheelDeltaY;
        }
        if ('wheelDeltaX' in orgEvent) {
            deltaX = orgEvent.wheelDeltaX * -1;
        }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ('axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ('deltaY' in orgEvent) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if ('deltaX' in orgEvent) {
            deltaX = orgEvent.deltaX;
            if (deltaY === 0) {
                delta = deltaX * -1;
            }
        }

        // No change actually happened, no reason to go any further
        if (deltaY === 0 && deltaX === 0) {
            return;
        }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if (orgEvent.deltaMode === 1) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if (orgEvent.deltaMode === 2) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

        if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
            // Divide all the things by 40!
            delta /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
        deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
        deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if (special.settings.normalizeOffset && this.getBoundingClientRect) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) {
            clearTimeout(nullLowestDeltaTimeout);
        }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

;
(function ($, scope) {
    var _registered = false;

    function registerBeforeUnload() {
        if (!_registered) {
            $(window).on('beforeunload', function (e) {
                if (nextend.askToSave && _registered + 180000 < $.now()) {
                    var data = {
                        changed: false
                    };
                    $(window).triggerHandler('n2-before-unload', data);

                    if (data.changed) {
                        var confirmationMessage = n2_('The changes you made will be lost if you navigate away from this page.');

                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                }
            });
            _registered = $.now();
        }
    }

    function NextendForm(id, url, values) {
        this.form = $('#' + id)
            .on('saved', $.proxy(this.onSaved, this))
            .data('form', this);

        this.onSaved();

        this.url = url;

        this.values = values;

        // Special fix for Joomla 1.6, 1.7 & 2.5. Speedy save!
        if (typeof document.formvalidator !== "undefined") {
            document.formvalidator.isValid = function () {
                return true;
            };
        }

        $(window).on('n2-before-unload', $.proxy(this.onBeforeUnload, this));
        registerBeforeUnload();

        $('input, textarea').on('keyup', function (e) {
            if (e.which == 27) {
                e.target.blur();
                e.stopPropagation();
            }
        });
    };

    NextendForm.prototype.onBeforeUnload = function (e, data) {
        if (!data.changed && this.isChanged()) {
            data.changed = true;
        }
    };

    NextendForm.prototype.isChanged = function () {
        this.form.triggerHandler('checkChanged');
        if (this.serialized != this.form.serialize()) {
            return true;
        }
        return false;
    };


    NextendForm.prototype.onSaved = function () {
        this.serialized = this.form.serialize();
    };

    NextendForm.submit = function (query) {
        nextend.askToSave = false;
        setTimeout(function () {
            n2(query).submit();
        }, 300);
        return false;
    };

    scope.NextendForm = NextendForm;

    $(window).ready(function () {
        $('input[data-disabled]').on('focus', function () {
            this.blur();
        });
    });


})(n2, window);
N2Require('FormElement', [], [], function ($, scope, undefined) {

    function FormElement() {
        this.connectedField = null;
        this.element.data('field', this);
    };

    FormElement.prototype.triggerOutsideChange = function () {
        this.element.triggerHandler('outsideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    FormElement.prototype.triggerInsideChange = function () {
        this.element.triggerHandler('insideChange', this);
        this.element.triggerHandler('nextendChange', this);
    };

    FormElement.prototype.focus = function (shouldOpen) {
        if (this.connectedField) {
            this.connectedField.focus(shouldOpen);
        }
    };

    return FormElement;

});

N2Require('FormElementText', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementText(id) {
        this.element = $('#' + id).on({
            focus: $.proxy(this._focus, this),
            blur: $.proxy(this._blur, this),
            change: $.proxy(this.change, this)
        });

        this.tagName = this.element.prop('tagName');

        this.parent = this.element.parent();

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementText.prototype = Object.create(scope.FormElement.prototype);
    FormElementText.prototype.constructor = FormElementText;


    FormElementText.prototype._focus = function () {
        this.parent.addClass('focus');

        if (this.tagName != 'TEXTAREA') {
            this.element.on('keypress.n2-text', $.proxy(function (e) {
                if (e.which == 13) {
                    this.element.off('keypress.n2-text');
                    this.element.trigger('blur');
                }
            }, this));
        }
    };

    FormElementText.prototype._blur = function () {
        this.parent.removeClass('focus');
    };

    FormElementText.prototype.change = function () {

        this.triggerOutsideChange();
    };

    FormElementText.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementText.prototype.focus = function (shouldOpen) {
        if (this.connectedField) {
            this.connectedField.focus(shouldOpen);
        } else if (shouldOpen) {
            this.element.focus().select();
        }
    };

    return FormElementText;
});
N2Require('FormElementAutocompleteSimple', [], [], function ($, scope, undefined) {
    
    function FormElementAutocompleteSimple(id, values) {
        this.element = $('#' + id).data('autocomplete', this);
        this.element.nextendAutocomplete({
            appendTo: 'body',
            minLength: 0,
            position: {
                my: "center top",
                at: "center bottom",
                collision: 'flip'
            },
            source: function (request, response) {
                response(values);
            },
            select: function (event, ui) {
                $(this).val(ui.item.value).trigger('change');
                return false;
            }
        }).click(function () {
            $(this).nextendAutocomplete("search", "");
        });
    };

    return FormElementAutocompleteSimple;
});
N2Require('FormElementAutocompleteSlider', [], [], function ($, scope, undefined) {

    function FormElementAutocompleteSlider(id, properties) {
        this.localChange = false;
        this.element = $('#' + id).data('autocomplete', this);
        var $parent = this.element.parent().on({
            'mouseenter.n2slider': $.proxy(this.startSlider, this, properties)
        });
        var $units = $parent.siblings('.n2-form-element-units').find('> input');
        if (properties.units && $units.length) {
            var units = properties.units;
            $units.on('nextendChange', $.proxy(function () {
                properties.min = units[$units.val() + 'min'];
                properties.max = units[$units.val() + 'max'];
                if (this.slider) {
                    this.slider.slider("option", "min", properties.min);
                    this.slider.slider("option", "max", properties.max);
                }
            }, this));
        }
    };

    FormElementAutocompleteSlider.prototype.startSlider = function (properties, e) {
        this.element.parent().off('.n2slider');
        if (!this.slider) {
            this.slider = $('<div></div>')
                .appendTo($('<div class="n2-ui-slider-container"></div>').insertAfter(this.element))
                .removeAttr('slide').prop('slide', false).slider($.extend({
                    start: $.proxy(function () {
                        this.element.parent().addClass('n2-active');
                    }, this),
                    stop: $.proxy(function () {
                        this.element.parent().removeClass('n2-active');
                    }, this),
                    slide: $.proxy(function (e, ui) {
                        this.localChange = true;
                        this.element.val(ui.value).trigger('change');
                        this.localChange = false;
                    }, this)
                }, properties));

            if (typeof this.slider[0].slide !== 'undefined') {
                this.slider[0].slide = null;
            }

            this.element.on('nextendChange', $.proxy(function () {
                if (!this.localChange) {
                    var val = this.element.val();
                    if (val == parseFloat(val)) {
                        this.slider.slider('value', parseFloat(this.element.val()));
                    }
                }
            }, this));
        }
        this.slider.slider('value', parseFloat(this.element.val()));
    }

    return FormElementAutocompleteSlider;
});
N2Require('FormElementAutocomplete', [], [], function ($, scope, undefined) {

    function FormElementAutocomplete(id, tags) {
        this.tags = tags;
        this.element = $('#' + id).data('autocomplete', this);
        this.element.on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB && $(this).nextendAutocomplete("instance").menu.active) {
                event.preventDefault();
            }
        }).nextendAutocomplete({
            minLength: 0,
            position: {
                my: "left top-2",
                of: this.element.parent(),
                collision: 'flip'
            },
            source: $.proxy(function (request, response) {
                var terms = request.term.split(/,/),
                    filtered = [];

                $.each(this.tags, function (key, value) {
                    if (-1 === terms.indexOf(value)) {
                        filtered.push(value);
                    }
                });
                response(filtered);
            }, this),
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                var terms = this.value.split(/,/);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(",");
                $(this).trigger('change').nextendAutocomplete("search");
                return false;
            }
        }).click(function () {
            $(this).nextendAutocomplete("search");
        });

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };

    FormElementAutocomplete.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.val('').trigger('change');
    };

    FormElementAutocomplete.prototype.setTags = function (tags) {
        this.tags = tags;
    };

    return FormElementAutocomplete;

});
N2Require('BasicCSSFont', ['BasicCSSSkeleton'], [], function ($, scope, undefined) {
    function BasicCSSFont() {
        this._singular = 'font';
        this._prular = 'fonts';
        scope.BasicCSSSkeleton.prototype.constructor.apply(this, arguments);

        this.form = {
            afont: $('#layerfamily'),
            color: $('#layercolor'),
            size: $('#layersize'),
            bold: $('#layerweight'),
            weight: $('#layerweight'),
            lineheight: $('#layerlineheight'),
            align: $('#layertextalign').on('nextendChange', $.proxy(function (e) {
                if (!this.manager.underActivate && !this.manager.inPresetList) {
                    switch ($(e.currentTarget).val()) {
                        case 'left':
                        case 'justify':
                            nextend.smartSlider.canvasManager.mainContainer.getSelectedLayer().setProperty('align', 'left', 'layer');
                            break;
                        case 'right':
                            nextend.smartSlider.canvasManager.mainContainer.getSelectedLayer().setProperty('align', 'right', 'layer');
                            break;
                        default:
                            nextend.smartSlider.canvasManager.mainContainer.getSelectedLayer().setProperty('align', 'center', 'layer');
                            break;
                    }
                }
            }, this)),
            underline: $('#layerdecoration'),
            italic: $('#layerdecoration')

        }

        this.loaded();
    }

    BasicCSSFont.prototype = Object.create(scope.BasicCSSSkeleton.prototype);
    BasicCSSFont.prototype.constructor = BasicCSSFont;

    BasicCSSFont.prototype._transformsize = function (value) {
        return value.split('||').join('|*|');
    }

    BasicCSSFont.prototype._setsize = function (tab, value) {
        tab.size = value.replace('|*|', '||');
    }

    BasicCSSFont.prototype._transformweight = function (value) {
        return parseInt(value);
    }

    BasicCSSFont.prototype._setweight = function (tab, value) {
        tab.weight = parseInt(value);
    }

    BasicCSSFont.prototype._transformunderline = function (value) {
        return [
            this.value[this.activeTab].italic == 1 ? 'italic' : '',
            value == 1 ? 'underline' : ''
        ].join('||');
    }

    BasicCSSFont.prototype._setunderline = function (tab, value) {
        var values = value.split('||');
        tab.underline = (values[1] == 'underline' ? 1 : 0);
    }

    BasicCSSFont.prototype._transformitalic = function (value) {
        return [
            value == 1 ? 'italic' : '',
            this.value[this.activeTab].underline == 1 ? 'underline' : ''
        ].join('||');
    }

    BasicCSSFont.prototype._setitalic = function (tab, value) {
        var values = value.split('||');
        tab.italic = (values[0] == 'italic' ? 1 : 0);
    }

    return BasicCSSFont;
});
N2Require('BasicCSSSkeleton', [], [], function ($, scope, undefined) {
    function BasicCSSSkeleton(manager) {
        this.hasVisuals = false;
        this.isInsideChange = false;
        this.isReload = false;
        this.manager = manager;
        this.$container = manager.$container.find('#n2-tab-basiccss' + this._singular);
        this.$visuals = this.$container.find('.n2-css-name');
        this.$visualsLabel = this.$visuals.find('.n2-css-name-label');
        this.$visualsList = this.$visuals.find('.n2-css-name-list');
        this.$tabsContainer = this.$container.find('.n2-css-tab');
        this.$reset = this.$container.find('.n2-css-tab-reset').on('click', $.proxy(function (e) {
            this.value[this.activeTab] = {};
            this._lazySave(e);
            this.activateTab(this.activeTab);
        }, this));
        this.$more = this.$container.find('.n2-basiccss-more').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.visuals[this.activeVisual].field.show(e);
        }, this));

        this.activeVisual = 0;
        this.activeTab = 0;
        this.tabs = [];
    }

    BasicCSSSkeleton.prototype.loaded = function () {
        for (var k in this.form) {
            this.form[k].on({
                nextendChange: $.proxy(this.changeValue, this, k)
            });
        }
    }

    BasicCSSSkeleton.prototype.changeValue = function (name, e) {
        if (!this.isReload) {
            if (typeof this['_set' + name] == 'function') {
                this['_set' + name](this.value[this.activeTab], this.form[name].val());
            } else {
                this.value[this.activeTab][name] = this.form[name].val();
            }

            this._lazySave(e);
        }
    }

    BasicCSSSkeleton.prototype._lazySave = NextendDeBounce(function (e) {
        this.isInsideChange = true;
        var value = this.getBase64();
        this.visuals[this.activeVisual].field.save(e, value);
        this.visuals[this.activeVisual].value = value;
        this.isInsideChange = false;
    }, 50);

    BasicCSSSkeleton.prototype.save = function (data) {
        this.isInsideChange = true;
        for (var k in data) {
            this.visualsByName[k].field.save({}, data[k]);
            this.visualsByName[k].value = data[k];
        }
        this.isInsideChange = false;
    };

    BasicCSSSkeleton.prototype.getBase64 = function () {
        return Base64.encode(JSON.stringify({
            name: n2_('Static'),
            data: this.value
        }));
    };

    BasicCSSSkeleton.prototype.load = function (values, visuals) {
        this.hasVisuals = visuals.length > 0;
        this.$container.toggleClass('n2-css-has-' + this._singular, this.hasVisuals);
        if (this.hasVisuals) {
            this.visuals = [];
            this.visualsByName = {};

            this.$visualsList.html('');

            this.$visuals.toggleClass('n2-multiple', visuals.length > 1);
            for (var i = 0; i < visuals.length; i++) {
                var visual = visuals[i];
                this.visualsByName[visual.name] = {
                    value: values[visual.name],
                    mode: visual.mode,
                    field: visual.field
                }

                visual.field.element
                    .off('.basiccss')
                    .on('outsideChange.basiccss', $.proxy(this.loadSingleValue, this, i, visual.name));
                this.visuals.push(this.visualsByName[visual.name]);

                $('<span>' + visual.field.getLabel() + '</span>').on('click', $.proxy(function (i, e) {
                    this.activateVisual(i);
                    this.activateTab(0);
                }, this, i)).appendTo(this.$visualsList);
            }

            this.activateVisual(0);

            this.activateTab(0);
        }
    }

    BasicCSSSkeleton.prototype.loadSingleValue = function (i, k, e) {
        if (!this.isInsideChange) {
            this.visuals[i].value = this.visuals[i].field.element.val();
            if (this.activeVisual == i) {
                this.activateVisual(i);
                this.activateTab(this.activeTab);
            }
        }
    }

    BasicCSSSkeleton.prototype.activateVisual = function (index) {
        this.activeVisual = index;

        this.$visualsLabel.html(this.visuals[index].field.getLabel());

        nextend[this._singular + 'Manager'].getDataFromController(this.visuals[index].value, {previewMode: this.visuals[index].mode}, $.proxy(function (value, tabs) {
            this.value = value;
            this.setTabs(tabs);
        }, this));
    }

    BasicCSSSkeleton.prototype.activateTab = function (index) {
        this.isReload = true;
        this.activeTab = index;
        this.$container.toggleClass('n2-css-show-reset', index != 0);
        var value = (index == 0 ? this.value[index] : $.extend({}, this.value[0], this.value[index]));
        for (var k in value) {
            if (typeof this.form[k] !== 'undefined') {
                if (typeof this['_transform' + k] == 'function') {
                    this.form[k].data('field').insideChange(this['_transform' + k](value[k]));
                } else {
                    this.form[k].data('field').insideChange(value[k]);
                }
            }
        }

        this.$tabs.removeClass('n2-active').eq(index).addClass('n2-active');
        this.isReload = false;
    }

    BasicCSSSkeleton.prototype.setTabs = function (tabs) {
        this.tabs = tabs;
        this.$tabsContainer.html('');

        for (var i = 0; i < tabs.length; i++) {
            $('<span>' + tabs[i] + '</span>').on('click', $.proxy(function (i, e) {
                this.activateTab(i);
            }, this, i)).appendTo(this.$tabsContainer);
        }
        this.$tabs = this.$tabsContainer.find('span');
    }

    BasicCSSSkeleton.prototype.serialize = function () {
        if (this.hasVisuals) {
            var serialized = {};
            for (var k in this.visualsByName) {
                serialized[k] = this.visualsByName[k].value;
            }
            return serialized;
        }
        return {};
    }

    BasicCSSSkeleton.prototype.unSerialize = function (serialized) {
        for (var k in serialized) {
            this.visualsByName[k].field.save({}, serialized[k]);
            this.visualsByName[k].value = serialized[k];
        }
    }

    return BasicCSSSkeleton;
});
N2Require('BasicCSSStyle', ['BasicCSSSkeleton'], [], function ($, scope, undefined) {
    function BasicCSSStyle() {
        this._singular = 'style';
        this._prular = 'styles';
        scope.BasicCSSSkeleton.prototype.constructor.apply(this, arguments);


        this.form = {
            backgroundcolor: $('#layerbackgroundcolor'),
            opacity: $('#layeropacity'),
            padding: $('#layerpadding'),
            border: $('#layerborder'),
            borderradius: $('#layerborderradius')
        }

        this.loaded();
    }

    BasicCSSStyle.prototype = Object.create(scope.BasicCSSSkeleton.prototype);
    BasicCSSStyle.prototype.constructor = BasicCSSStyle;

    return BasicCSSStyle;
});
N2Require('BasicCSS', [], [], function ($, scope, undefined) {

    function BasicCSS(id, ajaxUrl) {
        this.underActivate = false;
        this.inPresetList = false;
        this.$container = $('#' + id);
        this.ajaxUrl = ajaxUrl;

        this.throttleSetTimeout = null;
        this.throttleExitTimeout = null;

        this.storage = {};

        this.assets = {
            font: new scope.BasicCSSFont(this),
            style: new scope.BasicCSSStyle(this)
        }


        this.$preset = $('<div id="n2-tab-basiccsspreset"><div class="n2-editor-header n2-h2 n2-uc"><span class="n2-css-name n2-css-name-label">' + n2_('Preset') + '</span></div></div>').prependTo(this.$container);


        $('<div class="n2-ss-editor-window-notice n2-ss-responsive-helper n2-h5">'+n2_(window.n2_printf('NOTE: Layer design changes apply to each device. Watch <a href="%s" target="_blank">video tutorial</a> to learn responsive tools.',"https://www.youtube.com/watch?v=yGpVsrzwt1U&index=4&list=PLSawiBnEUNfvzcI3pBHs4iKcbtMCQU0dB"))+'</div>').prependTo(this.$container);

        var presetRightButtons = $('<div class="n2-ss-button-container"></div>').insertAfter(this.$preset.find('.n2-css-name'));
        $('<a class="n2-button n2-button-icon n2-button-s n2-radius-s n2-button-darker n2-h5 n2-uc" href="#" data-n2tip="'+n2_('Reset design to default')+'"><i class="n2-i n2-i-reset2"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                this.exitPresetList(this.defs, e);
            }, this)).appendTo(presetRightButtons);

        $('<a class="n2-basiccss-save n2-button n2-button-icon n2-button-s n2-radius-s n2-button-darker n2-h5 n2-uc" href="#" data-n2tip="'+n2_('Save design as new preset')+'"><i class="n2-i n2-i-save"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                this.saveAsNew();
            }, this)).appendTo(presetRightButtons);


        this.$presets = $('<div id="n2-tab-basiccsspresets"></div>').appendTo(this.$container);


        $('<a class="n2-basiccss-choose n2-button n2-button-icon n2-button-s n2-radius-s n2-button-green n2-h5 n2-uc" data-n2tip="'+n2_('Load design')+'" href="#"><i class="n2-i n2-i-addlayer2"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();

                this.showList();
            }, this))
            .appendTo(presetRightButtons);

        $('<a class="n2-basiccss-back n2-button n2-button-icon n2-button-s n2-radius-s n2-button-grey n2-h5 n2-uc" href="#"><i class="n2-i n2-i-closewindow"></i></a>')
            .on('click', $.proxy(function (e) {
                e.preventDefault();
                this.exitPresetList(false, e);
            }, this))
            .appendTo(presetRightButtons);

        nextend.basicCSS = this;
    }

    BasicCSS.prototype.showList = function () {
        this.inPresetList = true;
        this.lastState = this.serialize();

        $.when(this.loadType()).done($.proxy(function (data) {
            this.$presets.append(this.storage[this.type]);

            this.$container.addClass('n2-basiccss-show-preset-list');
        }, this));


        this.$presets.on('mouseleave', $.proxy(function () {
            this.throttledUnSerialize(this.lastState);
        }, this));
    }

    BasicCSS.prototype.activate = function (type, values, structure) {

        if (this.inPresetList) {
            this.exitPresetList(false);
        }

        this.underActivate = true;
        if (this.type && this.type !== type && typeof this.storage[this.type] !== 'undefined') {
            this.storage[this.type].detach();
        }

        var hasVisuals = false;
        this.defs = {
            font: [],
            style: []
        };
        this.type = type;
        for (var k in this.assets) {
            for (var i = 0; i < structure[k].length; i++) {
                this.defs[k][structure[k][i].name] = structure[k][i].def;
            }
            this.assets[k].load(values, structure[k]);
            hasVisuals = hasVisuals || this.assets[k].hasVisuals;
        }
        $('#n2-ss-layer-window').toggleClass('n2-ss-has-design-option', hasVisuals);
        if (!hasVisuals) {
            if ($('#n2-ss-layer-window .n2-sidebar-tab-switcher .n2-td[data-tab="style"]').hasClass('n2-active')) {
                $('#n2-ss-layer-window .n2-sidebar-tab-switcher .n2-td[data-tab="item"]').trigger('click');
            }
        }
        this.underActivate = false;
    }

    BasicCSS.prototype.deActivate = function () {

        if (this.inPresetList) {
            this.exitPresetList(false);
        }
    }

    BasicCSS.prototype.serialize = function () {
        var serialized = {};
        for (var k in this.assets) {
            serialized[k] = this.assets[k].serialize();
        }
        return serialized;
    }

    BasicCSS.prototype.unSerialize = function (serialized) {
        for (var k in this.assets) {
            this.assets[k].unSerialize(serialized[k]);
        }
    }

    BasicCSS.prototype.throttledUnSerialize = function (serialized) {
        this._addThrottledRenderTimeout($.proxy(this.unSerialize, this, serialized));
    };

    BasicCSS.prototype.saveAsNew = function (name) {
        if (typeof this.saveAsModal == 'undefined') {
            var that = this;
            this.saveAsModal = new NextendModal({
                zero: {
                    size: [
                        500,
                        220
                    ],
                    title: n2_('Save as'),
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Save as new') + '</a>'],
                    fn: {
                        show: function () {

                            var button = this.controls.find('.n2-button'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createInput(n2_('Name'), 'n2-visual-name', 'width: 446px;')),
                                nameField = this.content.find('#n2-visual-name').focus();

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var name = nameField.val();
                                if (name == '') {
                                    nextend.notificationCenter.error(n2_('Please fill the name field!'));
                                } else {
                                    NextendAjaxHelper.ajax({
                                        type: "POST",
                                        url: NextendAjaxHelper.makeAjaxUrl(that.ajaxUrl, {
                                            nextendaction: 'addVisual'
                                        }),
                                        data: {
                                            type: that.type,
                                            value: Base64.encode(JSON.stringify({
                                                name: name,
                                                data: that.serialize()
                                            }))
                                        },
                                        dataType: 'json'
                                    })
                                        .done($.proxy(function (response) {

                                            $.when(that.loadType()).done(function () {
                                                that.addVisual(response.data.visual).prependTo(that.storage[that.type]);
                                            });
                                            this.hide(e);
                                        }, this));
                                }
                            }, this));
                        }
                    }
                }
            }, false);
        }
        this.saveAsModal.show();
    };

    BasicCSS.prototype.loadType = function () {
        if (typeof this.storage[this.type] === 'undefined') {
            var deferred = $.Deferred(),
                parseVisuals = $.proxy(function (visuals) {
                    this.storage[this.type] = $('<ul class="n2-list n2-h4"></ul>');
                    for (var i = 0; i < visuals.length; i++) {
                        this.addVisual(visuals[i]);
                    }
                    deferred.resolve();
                }, this);
            if (typeof window[this.type] === 'undefined') {
                this.storage[this.type] = deferred;
                NextendAjaxHelper.ajax({
                    type: "POST",
                    url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'loadVisuals'
                    }),
                    data: {
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    parseVisuals(response.data.visuals);
                }, this));
            } else {
                parseVisuals(window[this.type]);
            }
        }
        return this.storage[this.type];
    }

    /**
     * loadType must be called for the actual type to be able to add visual!!!
     * @param visual
     * @returns {*}
     */
    BasicCSS.prototype.addVisual = function (visual) {

        var decoded = visual.value;
        if (decoded[0] != '{') {
            decoded = Base64.decode(decoded)
        }

        var value = JSON.parse(decoded),
            row = $('<li><a href="#">' + value.name + '</a></li>').on({
                mouseenter: $.proxy(function (value, e) {
                    this.throttledUnSerialize(value.data);
                }, this, value),
                click: $.proxy(function (data, e) {
                    e.preventDefault();
                    this.exitPresetList(data, e);
                }, this, value.data)
            }).appendTo(this.storage[this.type]);

        if (visual.id > 10000) {
            var actions = $('<span class="n2-actions"></span>').appendTo(row);

            $('<div class="n2-button n2-button-icon n2-button-s" data-n2tip="Overwrite preset"><i class="n2-i n2-i-save n2-i-grey-opacity"></i></div>').on('click', $.proxy(function (visualID, name, e) {
                e.stopPropagation();
                NextendAjaxHelper.ajax({
                    type: "POST",
                    url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'changeVisual'
                    }),
                    data: {
                        visualId: visualID,
                        value: Base64.encode(JSON.stringify({
                            name: name,
                            data: this.lastState
                        })),
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    row.replaceWith(this.addVisual(response.data.visual));
                }, this));
            }, this, visual.id, value.name)).appendTo(actions);

            $('<div class="n2-button n2-button-icon n2-button-s"><i class="n2-i n2-i-delete n2-i-grey-opacity"></i></div>').on('click', $.proxy(function (visualID, e) {
                e.preventDefault();
                e.stopPropagation();
                NextendAjaxHelper.ajax({
                    type: "POST",
                    url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                        nextendaction: 'deleteVisual'
                    }),
                    data: {
                        visualId: visualID,
                        type: this.type
                    },
                    dataType: 'json'
                }).done($.proxy(function (response) {
                    row.remove();
                }, this));
            }, this, visual.id)).appendTo(actions);

            nextend.tooltip.add(actions);
        }
        return row;
    }

    BasicCSS.prototype.exitPresetList = function (data, e) {
        if (this.throttleSetTimeout) {
            clearTimeout(this.throttleSetTimeout);
        }

        this.$presets.off('mouseleave');

        if (data) {
            this.inPresetList = false;
            this.unSerialize(data);
        } else {
            this.unSerialize(this.lastState);
        }
        this.$container.removeClass('n2-basiccss-show-preset-list');
        this.inPresetList = false;

    };

    BasicCSS.prototype._addThrottledRenderTimeout = function (cb) {
        if (this.throttleSetTimeout) {
            clearTimeout(this.throttleSetTimeout);
        }

        this.throttleSetTimeout = setTimeout(cb, 100);
    }

    BasicCSS.prototype._addThrottledExitTimeout = function (cb) {
        if (this.throttleExitTimeout) {
            clearTimeout(this.throttleExitTimeout);
        }

        this.throttleExitTimeout = setTimeout(cb, 100);
    }

    return BasicCSS;

});
N2Require('FormElementCheckbox', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementCheckbox(id, values) {
        this.separator = '||';

        this.element = $('#' + id);

        this.values = values;

        this.checkboxes = this.element.parent().find('.n2-checkbox-option');

        this.states = this.element.val().split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof this.states[i] === 'undefined' || this.states[i] != this.values[i]) {
                this.states[i] = '';
            }

            this.checkboxes.eq(i).on('click', $.proxy(this.switchCheckbox, this, i));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementCheckbox.prototype = Object.create(scope.FormElement.prototype);
    FormElementCheckbox.prototype.constructor = FormElementCheckbox;


    FormElementCheckbox.prototype.switchCheckbox = function (i) {
        if (this.states[i] == this.values[i]) {
            this.states[i] = '';
            this.setSelected(i, 0);
        } else {
            this.states[i] = this.values[i];
            this.setSelected(i, 1);
        }
        this.element.val(this.states.join(this.separator));

        this.triggerOutsideChange();
    };

    FormElementCheckbox.prototype.insideChange = function (values) {

        var states = values.split(this.separator);

        for (var i = 0; i < this.checkboxes.length; i++) {
            if (typeof states[i] === 'undefined' || states[i] != this.values[i]) {
                this.states[i] = '';
                this.setSelected(i, 0);
            } else {
                this.states[i] = this.values[i];
                this.setSelected(i, 1);
            }

        }

        this.element.val(this.states.join(this.separator));

        this.triggerInsideChange();
    };

    FormElementCheckbox.prototype.setSelected = function (i, state) {
        if (state) {
            this.checkboxes.eq(i)
                .addClass('n2-active');
        } else {
            this.checkboxes.eq(i)
                .removeClass('n2-active');
        }
    };


    return FormElementCheckbox;

});
N2Require('FormElementColor', ['FormElement'], [], function ($, scope, undefined) {
    function FormElementColor(id, alpha) {

        this.element = $('#' + id);

        if (alpha == 1) {
            this.alpha = true;
        } else {
            this.alpha = false;
        }
        this.element.off('change')
            .n2spectrum({
                showAlpha: this.alpha,
                preferredFormat: (this.alpha == 1 ? "hex8" : "hex6"),
                showInput: false,
                showButtons: false,
                move: $.proxy(this.onMove, this),
                showSelectionPalette: true,
                showPalette: true,
                maxSelectionSize: 6,
                localStorageKey: 'color',
                palette: [
                    ['000000', '55aa39', '357cbd', 'bb4a28', '8757b2', '000000CC'],
                    ['81898d', '5cba3c', '4594e1', 'd85935', '9e74c2', '00000080'],
                    ['ced3d5', '27ae60', '01add3', 'e79d19', 'e264af', 'FFFFFFCC'],
                    ['ffffff', '2ecc71', '00c1c4', 'ecc31f', 'ec87c0', 'FFFFFF80']
                ]
            })
            .on('change', $.proxy(this.onChange, this));

        this.text = this.element.data('field');

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementColor.prototype = Object.create(scope.FormElement.prototype);
    FormElementColor.prototype.constructor = FormElementColor;

    FormElementColor.prototype.onMove = function () {
        this.element.val(this.getCurrent());
        this.triggerOutsideChange();
    };

    FormElementColor.prototype.onChange = function (e) {
        var current = this.getCurrent(),
            value = this.element.val();
        if (current != value) {
            this.element.n2spectrum("set", value);

            this.triggerInsideChange();
            this.triggerOutsideChange();
        }
        e.stopImmediatePropagation();
    };

    FormElementColor.prototype.insideChange = function (value) {
        this.element.val(value);
        this.element.n2spectrum("set", value);

        this.triggerInsideChange();
    };

    FormElementColor.prototype.getCurrent = function () {
        if (this.alpha) {
            return this.element.n2spectrum("get").toHexString8();
        }
        return this.element.n2spectrum("get").toHexString(true);
    };

    return FormElementColor;

});
N2Require('FormElementDevice', ['FormElementOnoff'], [], function ($, scope, undefined) {

    function FormElementDevice(id) {
        scope.FormElementOnoff.prototype.constructor.apply(this, arguments);
    };

    FormElementDevice.prototype = Object.create(scope.FormElementOnoff.prototype);
    FormElementDevice.prototype.constructor = FormElementDevice;

    FormElementDevice.prototype.detach = function () {
        this.onoff.detach();
    }

    FormElementDevice.prototype.setSelected = function (state) {
        if (state) {
            this.onoff.addClass('n2-active');
        } else {
            this.onoff.removeClass('n2-active');
        }
    };

    return FormElementDevice;
});
N2Require('FormElementDevices', ['FormElementDevice'], [], function ($, scope, undefined) {

    function FormElementDevices(id, values) {

        this.$el = $('#' + id).data('field', this);
        this.fields = {};
        for (var i = 0; i < values.length; i++) {
            this.fields[values[i]] = new scope.FormElementDevice(id + '-' + values[i]);
        }
    };

    FormElementDevices.prototype.setAvailableDevices = function (devices) {
        for (var k in devices) {
            var field = this.fields[k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()];
            if (!devices[k]) {
                field.detach();
            }
        }
        this.$el.children().first().addClass('n2-first');
        this.$el.children().last().addClass('n2-last');
    }

    return FormElementDevices;
});
N2Require('FormElementEnabled', [], [], function ($, scope, undefined) {

    function FormElementEnabled(id, selector) {
        this.element = $('#' + id).on('nextendChange', $.proxy(this.onChange, this));
        this.hide = this.element.closest('tr').nextAll().add(selector);
        this.onChange();
    }

    FormElementEnabled.prototype.onChange = function () {
        var value = parseInt(this.element.val());

        if (value) {
            this.hide.css('display', '');
        } else {
            this.hide.css('display', 'none');
        }

    };

    return FormElementEnabled;
});

N2Require('FormElementFolders', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementFolders(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        this.editButton = $('#' + id + '_edit')
            .on('click', $.proxy(this.edit, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementFolders.prototype = Object.create(scope.FormElement.prototype);
    FormElementFolders.prototype.constructor = FormElementFolders;

    FormElementFolders.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementFolders.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementFolders.prototype.open = function (e) {
        e.preventDefault();
        nextend.imageHelper.openFoldersLightbox($.proxy(this.val, this));
    };

    return FormElementFolders;
});
N2Require('FormElementFont', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementFont(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.fontManager.$.on('visualDelete', $.proxy(this.fontDeleted, this));

        this.updateName(this.element.val());

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementFont.prototype = Object.create(scope.FormElement.prototype);
    FormElementFont.prototype.constructor = FormElementFont;


    FormElementFont.prototype.getLabel = function () {
        return this.parameters.label;
    }

    FormElementFont.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.style != '') {
            nextend.fontManager.setConnectedStyle(this.parameters.style);
        }
        if (this.parameters.style2 != '') {
            nextend.fontManager.setConnectedStyle2(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.fontManager.changeSetById(this.defaultSetId);
        }
        nextend.fontManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    FormElementFont.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementFont.prototype.save = function (e, value) {

        nextend.fontManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    FormElementFont.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    FormElementFont.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    FormElementFont.prototype.updateName = function (value) {
        $.when(nextend.fontManager.getVisual(value))
            .done($.proxy(function (font) {
                this.name.val(font.name);
            }, this));
    };
    FormElementFont.prototype.fontDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };

    FormElementFont.prototype.renderFont = function () {
        var font = this.element.val();
        nextend.fontManager.addVisualUsage(this.parameters.previewmode, font, '');
        return nextend.fontManager.getClass(font, this.parameters.previewmode);
    };

    return FormElementFont;
});
N2Require('FormElementIcon2Manager', ['FormElement'], [], function ($, scope, undefined) {
    function FormElementIcon2Manager(id) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_edit').on('click', $.proxy(this.openModal, this));

        this.preview = this.element.parent().find('.n2-form-element-preview').on('click', $.proxy(this.openModal, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));


        scope.FormElement.prototype.constructor.apply(this, arguments);

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };


    FormElementIcon2Manager.prototype = Object.create(scope.FormElement.prototype);
    FormElementIcon2Manager.prototype.constructor = FormElementIcon2Manager;

    FormElementIcon2Manager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementIcon2Manager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementIcon2Manager.prototype.openModal = function (e) {
        if (e) e.preventDefault();
        scope.Icons.showModal($.proxy(this.setIcon, this));
    };

    FormElementIcon2Manager.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementIcon2Manager.prototype.setIcon = function (value) {
        this.val(value);
    };

    FormElementIcon2Manager.prototype.makePreview = function () {
        var iconData = scope.Icons.render(this.element.val());
        if (iconData) {
            this.preview.html('<i class="n2i ' + iconData.class + '">' + iconData.ligature + '</i>');
        } else {
            this.preview.html('');
        }
    };

    FormElementIcon2Manager.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.openModal();
        }
    };


    return FormElementIcon2Manager;
});
N2Require('FormElementIconManager', ['FormElement'], [], function ($, scope, undefined) {
    var modal = null,
        callback = function () {
        };

    function getIconModal() {
        if (!modal) {
            var content = '';

            modal = new NextendModal({
                zero: {
                    size: [
                        1200,
                        600
                    ],
                    title: 'Icons',
                    back: false,
                    close: true,
                    content: content,
                    fn: {
                        show: function () {

                            var icons = this.content.find('.n2-icon');
                            icons.on('click', $.proxy(function (e) {
                                var node = $(e.currentTarget).clone(),
                                    svg = node.find('svg');

                                if (svg[0].hasChildNodes()) {
                                    var children = svg[0].childNodes;
                                    for (var i = 0; i < children.length; i++) {
                                        children[i].setAttribute("data-style", "{style}");
                                    }
                                }
                                callback(node.html());
                                this.hide(e);
                            }, this));
                        }
                    }
                }
            }, false);
            modal.setCustomClass('n2-icons-modal');
        }
        return modal;
    }

    function FormElementIconManager(id) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_edit').on('click', $.proxy(this.openModal, this));

        this.preview = this.element.parent().find('img').on('click', $.proxy(this.openModal, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));


        scope.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementIconManager.prototype = Object.create(scope.FormElement.prototype);
    FormElementIconManager.prototype.constructor = FormElementIconManager;

    FormElementIconManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    FormElementIconManager.prototype.openModal = function (e) {
        if (e) e.preventDefault();
        callback = $.proxy(this.setIcon, this);
        getIconModal().show();
    };

    FormElementIconManager.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementIconManager.prototype.setIcon = function (svg) {
        this.val(svg);
    };

    FormElementIconManager.prototype.makePreview = function () {
        this.preview.attr('src', 'data:image/svg+xml;base64,' + Base64.encode(this.element.val()));
    };

    FormElementIconManager.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.openModal();
        }
    };

    function LZWDecompress(compressed) {
        "use strict";
        // Build the dictionary.
        var i,
            dictionary = [],
            w,
            result,
            k,
            entry = "",
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }

        w = String.fromCharCode(compressed[0]);
        result = w;
        for (i = 1; i < compressed.length; i += 1) {
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }

            result += entry;

            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);

            w = entry;
        }
        return result;
    }

    return FormElementIconManager;


});
N2Require('FormElementImage', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementImage(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');
        this.field.connectedField = this;

        this.parameters = parameters;

        this.preview = $('#' + id + '_preview')
            .on('click', $.proxy(this.open, this));

        this.element.on('nextendChange', $.proxy(this.makePreview, this));

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };


    FormElementImage.prototype = Object.create(scope.FormElement.prototype);
    FormElementImage.prototype.constructor = FormElementImage;

    FormElementImage.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementImage.prototype.val = function (value, meta) {
        var meta = $.extend({alt: false}, meta);
        if (meta.alt && meta.alt != '' && this.parameters.alt && this.parameters.alt != '') {
            $('#' + this.parameters.alt).val(meta.alt).trigger('change');
        }
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementImage.prototype.makePreview = function () {
        var image = this.element.val();
        if (image.substr(0, 1) == '{') {
            this.preview.css('background-image', '');
        } else {
            this.preview.css('background-image', 'url(' + nextend.imageHelper.fixed(image) + ')');
        }
    };

    FormElementImage.prototype.open = function (e) {
        if (e) {
            e.preventDefault();
        }
        nextend.imageHelper.openLightbox($.proxy(this.val, this));
    };

    FormElementImage.prototype.edit = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var imageSrc = nextend.imageHelper.fixed(this.element.val()),
            image = $('<img src="' + imageSrc + '" />');

        if (imageSrc.substr(0, 2) == '//') {
            imageSrc = location.protocol + imageSrc;
        }

        window.nextend.getFeatherEditor().done($.proxy(function () {
            nextend.featherEditor.launch({
                image: image.get(0),
                hiresUrl: imageSrc,
                onSave: $.proxy(this.aviarySave, this),
                onSaveHiRes: $.proxy(this.aviarySave, this)
            });
        }, this));
    };

    FormElementImage.prototype.aviarySave = function (id, src) {

        NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(window.nextend.featherEditor.ajaxUrl, {
                nextendaction: 'saveImage'
            }),
            data: {
                aviaryUrl: src
            },
            dataType: 'json'
        })
            .done($.proxy(function (response) {
                this.val(nextend.imageHelper.make(response.data.image));
                nextend.featherEditor.close();
            }, this));
    };

    FormElementImage.prototype.focus = function (shouldOpen) {
        if (shouldOpen) {
            this.open();
        }
    };

    return FormElementImage;
});
N2Require('FormElementImageManager', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementImageManager(id, parameters) {
        this.element = $('#' + id);
        $('#' + id + '_manage').on('click', $.proxy(this.show, this));

        this.parameters = parameters;
        this.imageField = this.element.data('field');

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementImageManager.prototype = Object.create(scope.FormElement.prototype);
    FormElementImageManager.prototype.constructor = FormElementImageManager;


    FormElementImageManager.prototype.show = function (e) {
        e.preventDefault();
        nextend.imageManager.show(this.element.val(), $.proxy(this.save, this));
    };

    FormElementImageManager.prototype.save = function () {

    };

    FormElementImageManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.triggerInsideChange();
    };

    return FormElementImageManager;

});
N2Require('FormElementList', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementList(id, multiple) {

        this.separator = '||';

        this.element = $('#' + id).on('change', $.proxy(this.onHiddenChange, this));

        this.select = $('#' + id + '_select').on('change', $.proxy(this.onChange, this));

        this.multiple = multiple;

        scope.FormElement.prototype.constructor.apply(this, arguments);
    }


    FormElementList.prototype = Object.create(scope.FormElement.prototype);
    FormElementList.prototype.constructor = FormElementList;

    FormElementList.prototype.onHiddenChange = function () {
        var value = this.element.val();
        if (value && value != this.select.val()) {
            this.insideChange(value);
        }
    };

    FormElementList.prototype.onChange = function () {
        var value = this.select.val();
        if (value !== null && typeof value === 'object') {
            value = value.join(this.separator);
        }
        this.element.val(value);

        this.triggerOutsideChange();
    };

    FormElementList.prototype.insideChange = function (value) {
        if (typeof value === 'object') {
            this.select.val(value.split(this.separator));
        } else {
            this.select.val(value);
        }
        this.element.val(value);
        this.select.val(value);

        this.triggerInsideChange();
    };

    return FormElementList;

});

N2Require('FormElementMarginPadding', ['FormElementMixed'], [], function ($, scope, undefined) {

    function FormElementMarginPadding(id, elements, separator) {
        this.linkedValues = false;

        scope.FormElementMixed.prototype.constructor.apply(this, arguments);

        this.$field = this.element.parent();

        this.$field.find('.n2-text-sub-label').on('click', $.proxy(function (e) {
            e.preventDefault();
            this.linkedValues = !this.linkedValues;

            this.$field.toggleClass('n2-values-linked', this.linkedValues);

            if (this.linkedValues) {
                this.elements[0].trigger('change');
            }
        }, this));
    };


    FormElementMarginPadding.prototype = Object.create(scope.FormElementMixed.prototype);
    FormElementMarginPadding.prototype.constructor = FormElementMarginPadding;

    FormElementMarginPadding.prototype.onFieldChange = function () {
        if (this.linkedValues) {
            var value = this.elements[0].val();
            for (var i = 1; i < 4; i++) {
                this.elements[i].data('field').insideChange(value);
            }
        }

        this.element.val(this.getValue());
        this.triggerOutsideChange();
    }

    FormElementMarginPadding.prototype.insideChange = function (value) {
        scope.FormElementMixed.prototype.insideChange.apply(this, arguments);

        this.linkedValues = true;
        var value = this.elements[0].val();
        for (var i = 1; i < 4; i++) {
            if (value != this.elements[i].val()) {
                this.linkedValues = false;
                break;
            }
        }

        this.$field.toggleClass('n2-values-linked', this.linkedValues);
    };

    return FormElementMarginPadding;
});




N2Require('FormElementMirror', [], [], function ($, scope, undefined) {

    function FormElementMirror(id) {
        this.element = $('#' + id).on('nextendChange', $.proxy(this.onChange, this));
        this.tr = this.element.closest('tr').nextAll();
        this.onChange();
    }

    FormElementMirror.prototype.onChange = function () {
        var value = parseInt(this.element.val());

        if (value) {
            this.tr.css('display', 'none');
        } else {
            this.tr.css('display', '');
        }

    };

    return FormElementMirror;

});

N2Require('FormElementMixed', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementMixed(id, elements, separator) {

        this.element = $('#' + id);

        this.elements = [];
        for (var i = 0; i < elements.length; i++) {
            this.elements.push($('#' + elements[i])
                .on('outsideChange', $.proxy(this.onFieldChange, this)));
        }

        this.separator = separator;

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementMixed.prototype = Object.create(scope.FormElement.prototype);
    FormElementMixed.prototype.constructor = FormElementMixed;


    FormElementMixed.prototype.onFieldChange = function () {
        this.element.val(this.getValue());

        this.triggerOutsideChange();
    };

    FormElementMixed.prototype.insideChange = function (value) {
        this.element.val(value);

        var values = value.split(this.separator);

        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].data('field').insideChange(values[i]);
        }

        this.triggerInsideChange();
    };

    FormElementMixed.prototype.getValue = function () {
        var values = [];
        for (var i = 0; i < this.elements.length; i++) {
            values.push(this.elements[i].val());
        }

        return values.join(this.separator);
    };

    return FormElementMixed;

});
N2Require('FormElementNumber', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementNumber(id, min, max, units) {
        this.min = min;
        this.max = max;

        this.element = $('#' + id).on({
            focus: $.proxy(this._focus, this),
            blur: $.proxy(this.blur, this),
            change: $.proxy(this.change, this)
        });
        this.parent = this.element.parent();

        var $units = this.parent.siblings('.n2-form-element-units').find('> input');
        if (units && $units.length) {
            $units.on('nextendChange', $.proxy(function () {
                this.min = units[$units.val() + 'min'];
                this.max = units[$units.val() + 'max'];
            }, this));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementNumber.prototype = Object.create(scope.FormElement.prototype);
    FormElementNumber.prototype.constructor = FormElementNumber;


    FormElementNumber.prototype._focus = function () {
        this.parent.addClass('focus');

        this.element.on('keypress.n2-text', $.proxy(function (e) {
            if (e.which == 13) {
                this.element.off('keypress.n2-text');
                this.element.trigger('blur');
            }
        }, this));
    };

    FormElementNumber.prototype.blur = function () {
        this.parent.removeClass('focus');
    };

    FormElementNumber.prototype.change = function () {
        var validated = this.validate(this.element.val());
        if (validated === true) {
            this.triggerOutsideChange();
        } else {
            this.element.val(validated).trigger('change');
        }
    };

    FormElementNumber.prototype.insideChange = function (value) {
        var validated = this.validate(value);
        if (validated === true) {
            this.element.val(value);
        } else {
            this.element.val(validated);
        }

        this.triggerInsideChange();
    };

    FormElementNumber.prototype.validate = function (value) {
        var validatedValue = parseFloat(value);
        if (isNaN(validatedValue)) {
            validatedValue = 0;
        }
        validatedValue = Math.max(this.min, Math.min(this.max, validatedValue));
        if (validatedValue != value) {
            return validatedValue;
        }
        return true;
    };

    return FormElementNumber;
});
N2Require('FormElementOnoff', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementOnoff(id) {
        this.element = $('#' + id);

        this.onoff = this.element.parent()
            .on('click', $.proxy(this.switch, this));

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementOnoff.prototype = Object.create(scope.FormElement.prototype);
    FormElementOnoff.prototype.constructor = FormElementOnoff;


    FormElementOnoff.prototype.switch = function () {
        var value = parseInt(this.element.val());
        if (value) {
            value = 0;
        } else {
            value = 1;
        }
        this.element.val(value);
        this.setSelected(value);

        this.triggerOutsideChange();
    };

    FormElementOnoff.prototype.insideChange = function (value) {
        value = parseInt(value);
        this.element.val(value);
        this.setSelected(value);

        this.triggerInsideChange();
    };

    FormElementOnoff.prototype.setSelected = function (state) {
        if (state) {
            this.onoff.addClass('n2-onoff-on');
        } else {
            this.onoff.removeClass('n2-onoff-on');
        }
    };

    return FormElementOnoff;

});

N2Require('FormElementRadio', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementRadio(id, values) {
        this.element = $('#' + id);

        this.values = values;

        this.parent = this.element.parent();

        this.options = this.parent.find('.n2-radio-option');

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.click, this));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementRadio.prototype = Object.create(scope.FormElement.prototype);
    FormElementRadio.prototype.constructor = FormElementRadio;

    FormElementRadio.prototype.click = function (e) {
        this.changeSelectedIndex(this.options.index(e.currentTarget));
    };

    FormElementRadio.prototype.changeSelectedIndex = function (index) {
        var value = this.values[index];

        this.element.val(value);

        this.setSelected(index);

        this.triggerOutsideChange();
    };

    FormElementRadio.prototype.insideChange = function (value, option) {
        var index = $.inArray(value, this.values);
        if (index == '-1') {
            index = this.partialSearch(value);
        }

        if (index == '-1' && typeof option !== 'undefined') {
            index = this.addOption(value, option);
        }

        if (index != '-1') {
            this.element.val(this.values[index]);
            this.setSelected(index);

            this.triggerInsideChange();
        } else {
            // It will reset the state if the preferred value not available
            this.options.eq(0).trigger('click');
        }
    };

    FormElementRadio.prototype.setSelected = function (index) {
        this.options.removeClass('n2-active');
        this.options.eq(index).addClass('n2-active');
    };

    FormElementRadio.prototype.partialSearch = function (text) {
        text = text.replace(/^.*[\\\/]/, '');
        for (var i = 0; i < this.values.length; i++) {
            if (this.values[i].indexOf(text) != -1) return i;
        }
        return -1;
    };

    FormElementRadio.prototype.addOption = function (value, option) {
        var i = this.values.push(value) - 1;
        option.appendTo(this.parent)
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };

    FormElementRadio.prototype.addTabOption = function (value, label) {
        var i = this.values.push(value) - 1;
        var option = $('<div class="n2-radio-option n2-h4 n2-last">' + label + '</div>')
            .insertAfter(this.options.last().removeClass('n2-last'))
            .on('click', $.proxy(this.click, this));
        this.options = this.options.add(option);
        return i;
    };
    FormElementRadio.prototype.removeTabOption = function (value) {
        var i = $.inArray(value, this.values);
        var option = this.options.eq(i);
        this.options = this.options.not(option);
        option.remove();
        if (i == 0) {
            this.options.eq(0).addClass('n2-first');
        }
        if (i == this.options.length) {
            this.options.eq(this.options.length - 1).addClass('n2-last');
        }

        this.values.splice(i, 1);
    };

    FormElementRadio.prototype.moveTab = function (originalIndex, targetIndex) {

    };

    return FormElementRadio;

});
N2Require('FormElementRichText', ['FormElementText'], [], function ($, scope, undefined) {

    function FormElementRichText(id) {

        scope.FormElementText.prototype.constructor.apply(this, arguments);

        this.parent.find('.n2-textarea-rich-bold').on('click', $.proxy(this.bold, this));
        this.parent.find('.n2-textarea-rich-italic').on('click', $.proxy(this.italic, this));
        this.parent.find('.n2-textarea-rich-link').on('click', $.proxy(this.link, this));

    };


    FormElementRichText.prototype = Object.create(scope.FormElementText.prototype);
    FormElementRichText.prototype.constructor = FormElementRichText;


    FormElementRichText.prototype.bold = function () {
        this.wrapText('<b>', '</b>');
    };

    FormElementRichText.prototype.italic = function () {
        this.wrapText('<i>', '</i>');
    };

    FormElementRichText.prototype.link = function () {
        this.wrapText('<a href="">', '</a>');
    };

    FormElementRichText.prototype.list = function () {
        this.wrapText('', "\n<ul>\n<li>#1 Item</li>\n<li>#2 Item</li>\n</ul>\n");
    };


    FormElementRichText.prototype.wrapText = function (openTag, closeTag) {
        var textArea = this.element;
        var len = textArea.val().length;
        var start = textArea[0].selectionStart;
        var end = textArea[0].selectionEnd;
        var selectedText = textArea.val().substring(start, end);
        var replacement = openTag + selectedText + closeTag;
        textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, len));
        this.triggerOutsideChange();
        this.element.focus();
    };

    return FormElementRichText;
});
N2Require('FormElementSkin', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementSkin(id, preId, skins, fixedMode) {
        this.element = $('#' + id);

        this.preId = preId;

        this.skins = skins;

        this.list = this.element.data('field');

        this.fixedMode = fixedMode;

        this.firstOption = this.list.select.find('option').eq(0);

        this.originalText = this.firstOption.text();

        this.element.on('nextendChange', $.proxy(this.onSkinSelect, this));

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementSkin.prototype = Object.create(scope.FormElement.prototype);
    FormElementSkin.prototype.constructor = FormElementSkin;


    FormElementSkin.prototype.onSkinSelect = function () {
        var skin = this.element.val();
        if (skin != '0') {
            skin = this.skins[skin];
            for (var k in skin) {
                if (skin.hasOwnProperty(k)) {
                    var el = $('#' + this.preId + k);
                    if (el.length) {
                        var field = el.data('field');
                        field.insideChange(skin[k]);
                    }
                }
            }

            if (!this.fixedMode) {
                this.changeFirstOptionText(n2_('Done'));
                this.list.insideChange('0');
                setTimeout($.proxy(this.changeFirstOptionText, this, this.originalText), 3000);
            }

        }
    };

    FormElementSkin.prototype.changeFirstOptionText = function (text) {
        this.firstOption.text(text);
    };

    FormElementSkin.prototype.insideChange = function (value) {
        this.element.val(value);
        this.list.select.val(value);
    };

    return FormElementSkin;
});

N2Require('FormElementStyle', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementStyle(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.defaultSetId = parameters.set;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        nextend.styleManager.$.on('visualDelete', $.proxy(this.styleDeleted, this));

        this.updateName(this.element.val());
        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementStyle.prototype = Object.create(scope.FormElement.prototype);
    FormElementStyle.prototype.constructor = FormElementStyle;

    FormElementStyle.prototype.getLabel = function () {
        return this.parameters.label;
    }

    FormElementStyle.prototype.show = function (e) {
        e.preventDefault();
        if (this.parameters.font != '') {
            nextend.styleManager.setConnectedFont(this.parameters.font);
        }
        if (this.parameters.font2 != '') {
            nextend.styleManager.setConnectedFont2(this.parameters.font2);
        }
        if (this.parameters.style2 != '') {
            nextend.styleManager.setConnectedStyle(this.parameters.style2);
        }
        if (this.defaultSetId) {
            nextend.styleManager.changeSetById(this.defaultSetId);
        }
        nextend.styleManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: this.parameters.previewmode,
            previewHTML: this.parameters.preview
        });
    };

    FormElementStyle.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    FormElementStyle.prototype.save = function (e, value) {

        nextend.styleManager.addVisualUsage(this.parameters.previewmode, value, window.nextend.pre);

        this.val(value);
    };

    FormElementStyle.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    FormElementStyle.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    FormElementStyle.prototype.updateName = function (value) {
        $.when(nextend.styleManager.getVisual(value))
            .done($.proxy(function (style) {
                this.name.val(style.name);
            }, this));
    };
    FormElementStyle.prototype.styleDeleted = function (e, id) {
        if (id == this.element.val()) {
            this.insideChange('');
        }
    };
    FormElementStyle.prototype.renderStyle = function () {
        var style = this.element.val();
        nextend.styleManager.addVisualUsage(this.parameters.previewmode, style, '');
        return nextend.styleManager.getClass(style, this.parameters.previewmode);
    };

    return FormElementStyle;

});
N2Require('FormElementSubform', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementSubform(id, target, tab, originalValue) {
        this.id = id;

        this.element = $('#' + id);

        this.target = $('#' + target);

        this.tab = tab;

        this.originalValue = originalValue;

        this.form = this.element.closest('form').data('form');

        this.list = this.element.data('field');

        this.element.on('nextendChange', $.proxy(this.loadSubform, this));

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };


    FormElementSubform.prototype = Object.create(scope.FormElement.prototype);
    FormElementSubform.prototype.constructor = FormElementSubform;

    FormElementSubform.prototype.loadSubform = function () {
        var value = this.element.val();
        if (value == 'disabled') {
            this.target.html('');
        } else {
            var values = [];
            if (value == this.originalValue) {
                values = this.form.values;
            }

            var data = {
                id: this.id,
                values: values,
                tab: this.tab,
                value: value
            };

            NextendAjaxHelper.ajax({
                type: "POST",
                url: NextendAjaxHelper.makeAjaxUrl(this.form.url),
                data: data,
                dataType: 'json'
            }).done($.proxy(this.load, this));
        }
    };

    FormElementSubform.prototype.load = function (response) {
        this.target.html(response.data.html);
        eval(response.data.scripts);

        nextend.tooltip.add(this.target);
    };

    return FormElementSubform;
});

N2Require('FormElementSubformImage', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementSubformImage(id, options) {

        this.element = $('#' + id);

        this.options = $('#' + options).find('.n2-subform-image-option');

        this.subform = this.element.data('field');

        this.active = this.getIndex(this.options.filter('.n2-active').get(0));

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.selectOption, this));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementSubformImage.prototype = Object.create(scope.FormElement.prototype);
    FormElementSubformImage.prototype.constructor = FormElementSubformImage;


    FormElementSubformImage.prototype.selectOption = function (e) {
        var index = this.getIndex(e.currentTarget);
        if (index != this.active) {

            this.options.eq(index).addClass('n2-active');
            this.options.eq(this.active).removeClass('n2-active');

            this.active = index;

            var value = this.subform.list.select.find('option').eq(index).val();
            this.subform.list.insideChange(value);
        }
    };

    FormElementSubformImage.prototype.getIndex = function (option) {
        return $.inArray(option, this.options);
    };

    return FormElementSubformImage;
});
N2Require('FormElementSwitcher', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementSwitcher(id, values) {

        this.element = $('#' + id);

        this.options = this.element.parent().find('.n2-switcher-unit');

        this.active = this.options.index(this.options.filter('.n2-active'));

        this.values = values;

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.switch, this, i));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementSwitcher.prototype = Object.create(scope.FormElement.prototype);
    FormElementSwitcher.prototype.constructor = FormElementSwitcher;


    FormElementSwitcher.prototype.switch = function (i, e) {
        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerOutsideChange();
    };

    FormElementSwitcher.prototype.insideChange = function (value) {
        var i = $.inArray(value, this.values);

        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerInsideChange();
    };

    FormElementSwitcher.prototype.setSelected = function (i) {
        this.options.eq(this.active).removeClass('n2-active');
        this.options.eq(i).addClass('n2-active');
        this.active = i;
    };

    return FormElementSwitcher;
});

N2Require('FormElementUnits', ['FormElement'], [], function ($, scope, undefined) {

    function FormElementUnits(id, values) {

        this.element = $('#' + id);

        this.options = this.element.parent().find('.n2-element-unit');
        this.currentUnit = this.element.parent().find('.n2-element-current-unit');

        this.values = values;

        for (var i = 0; i < this.options.length; i++) {
            this.options.eq(i).on('click', $.proxy(this.switch, this, i));
        }

        scope.FormElement.prototype.constructor.apply(this, arguments);
    };

    FormElementUnits.prototype = Object.create(scope.FormElement.prototype);
    FormElementUnits.prototype.constructor = FormElementUnits;


    FormElementUnits.prototype.switch = function (i, e) {
        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerOutsideChange();
    };

    FormElementUnits.prototype.insideChange = function (value) {
        var i = $.inArray(value, this.values);

        this.element.val(this.values[i]);
        this.setSelected(i);

        this.triggerInsideChange();
    };

    FormElementUnits.prototype.setSelected = function (i) {
        this.currentUnit.html(this.options.eq(i).html());
    };

    return FormElementUnits;
});

N2Require('FormElementUrl', ['FormElement'], [], function ($, scope, undefined) {

    var ajaxUrl = '',
        modal = null,
        cache = {},
        callback = function (url) {
        },
        lastValue = '';

    function FormElementUrl(id, parameters) {
        this.element = $('#' + id);

        this.field = this.element.data('field');

        this.parameters = parameters;

        ajaxUrl = this.parameters.url;

        this.button = $('#' + id + '_button').on('click', $.proxy(this.open, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));
    };

    FormElementUrl.prototype = Object.create(scope.FormElement.prototype);
    FormElementUrl.prototype.constructor = FormElementUrl;

    FormElementUrl.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('#');
    };

    FormElementUrl.prototype.val = function (value) {
        this.element.val(value);
        this.triggerOutsideChange();
    };

    FormElementUrl.prototype.open = function (e) {
        e.preventDefault();
        callback = $.proxy(this.insert, this);
        lastValue = this.element.val();
        this.getModal().show();
    };

    FormElementUrl.prototype.insert = function (url) {
        this.val(url);
    };

    FormElementUrl.prototype.getModal = function () {
        if (!modal) {
            var getLinks = function (search) {
                if (typeof cache[search] == 'undefined') {
                    cache[search] = $.ajax({
                        type: "POST",
                        url: NextendAjaxHelper.makeAjaxUrl(ajaxUrl),
                        data: {
                            keyword: search
                        },
                        dataType: 'json'
                    });
                }
                return cache[search];
            };

            var parameters = this.parameters;

            var lightbox = {
                    size: [
                        500,
                        590
                    ],
                    title: n2_('Lightbox'),
                    back: 'zero',
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: ['<a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">' + n2_('Insert') + '</a>'],
                    fn: {
                        show: function () {
                            var button = this.controls.find('.n2-button'),
                                chooseImages = $('<a href="#" class="n2-button n2-button-normal n2-button-m n2-radius-s n2-button-green n2-uc n2-h5" style="float:right; margin-right: 20px;">' + n2_('Choose images') + '</a>'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                }).append(this.createTextarea(n2_('Content list') + " - " + n2_('One per line'), 'n2-link-resource', 'width: 446px;height: 100px;')).append(chooseImages).append(this.createInputUnit(n2_('Autoplay duration'), 'n2-link-autoplay', 'ms', 'width: 40px;')),
                                resourceField = this.content.find('#n2-link-resource').focus(),
                                autoplayField = this.content.find('#n2-link-autoplay').val(0);

                            chooseImages.on('click', function (e) {
                                e.preventDefault();
                                nextend.imageHelper.openMultipleLightbox(function (images) {
                                    var value = resourceField.val().replace(/\n$/, '');

                                    for (var i = 0; i < images.length; i++) {
                                        value += "\n" + images[i].image;
                                    }
                                    resourceField.val(value.replace(/^\n/, ''));
                                });
                            });

                            var matches = lastValue.match(/lightbox\[(.*?)\]/);
                            if (matches && matches.length == 2) {
                                var parts = matches[1].split(',');
                                if (parseInt(parts[parts.length - 1]) > 0) {
                                    autoplayField.val(parseInt(parts[parts.length - 1]));
                                    parts.pop();
                                }
                                resourceField.val(parts.join("\n"));
                            }

                            this.content.append(this.createHeading(n2_('Examples')));
                            this.createTable([
                                [n2_('Image'), 'https://smartslider3.com/image.jpg'],
                                ['YouTube', 'https://www.youtube.com/watch?v=lsq09izc1H4'],
                                ['Vimeo', 'https://vimeo.com/144598279'],
                                ['Iframe', 'https://smartslider3.com']
                            ], ['', '']).appendTo(this.content);

                            button.on('click', $.proxy(function (e) {
                                e.preventDefault();
                                var link = resourceField.val();
                                if (link != '') {
                                    var autoplay = '';
                                    if (autoplayField.val() > 0) {
                                        autoplay = ',' + autoplayField.val();
                                    }
                                    callback('lightbox[' + link.replace(/,/g, '&#44;').split("\n").filter(Boolean).join(',') + autoplay + ']');
                                }
                                this.hide(e);
                            }, this));
                        }
                    }
                },
                links = {
                    size: [
                        600,
                        500
                    ],
                    title: n2_('Link'),
                    back: 'zero',
                    close: true,
                    content: '<div class="n2-form"></div>',
                    fn: {
                        show: function () {

                            this.content.find('.n2-form').append(this.createInput(n2_('Keyword'), 'n2-links-keyword', 'width:546px;'));
                            var search = $('#n2-links-keyword'),
                                heading = this.createHeading('').appendTo(this.content),
                                result = this.createResult().appendTo(this.content),
                                searchString = '';

                            search.on('keyup', $.proxy(function () {
                                searchString = search.val();
                                getLinks(searchString).done($.proxy(function (r) {
                                    if (search.val() == searchString) {
                                        var links = r.data;
                                        if (searchString == '') {
                                            heading.html(n2_('No search term specified. Showing recent items.'));
                                        } else {
                                            heading.html(n2_printf(n2_('Showing items match for "%s"'), searchString));
                                        }

                                        var data = [],
                                            modal = this;
                                        for (var i = 0; i < links.length; i++) {
                                            data.push([links[i].title, links[i].info, $('<div class="n2-button n2-button-normal n2-button-xs n2-radius-s n2-button-green n2-uc n2-h5">' + n2_('Select') + '</div>')
                                                .on('click', {permalink: links[i].link}, function (e) {
                                                    callback(e.data.permalink);
                                                    modal.hide();
                                                })]);
                                        }
                                        result.html('');
                                        this.createTable(data, ['width:100%;', '', '']).appendTo(this.createTableWrap().appendTo(result));
                                    }
                                }, this));
                            }, this))
                                .trigger('keyup').focus();

                            this.content.append('<hr style="margin: 0 -20px;"/>');
                            var external = $('<div class="n2-input-button"><input placeholder="External url" type="text" id="external-url" name="external-url" value="" /><a href="#" class="n2-button n2-button-normal n2-button-l n2-radius-s n2-button-green n2-uc n2-h4">Insert</a></div>')
                                    .css({
                                        display: 'block',
                                        textAlign: 'center'
                                    })
                                    .appendTo(this.content),
                                externalInput = external.find('input').val(lastValue);

                            external.find('.n2-button').on('click', function (e) {
                                e.preventDefault();
                                callback(externalInput.val());
                                modal.hide();
                            });
                        }
                    }
                };
            links.back = false;
            modal = new NextendModal({
                zero: links
            }, false);
        
            modal.setCustomClass('n2-url-modal');
        }
        return modal;
    };

    return FormElementUrl;

});
var fixto = (function ($, window, document) {

    // Start Computed Style. Please do not modify this module here. Modify it from its own repo. See address below.

    /*! Computed Style - v0.1.0 - 2012-07-19
     * https://github.com/bbarakaci/computed-style
     * Copyright (c) 2012 Burak Barakaci; Licensed MIT */
    var computedStyle = (function () {
        var computedStyle = {
            getAll: function (element) {
                return document.defaultView.getComputedStyle(element);
            },
            get: function (element, name) {
                return this.getAll(element)[name];
            },
            toFloat: function (value) {
                return parseFloat(value, 10) || 0;
            },
            getFloat: function (element, name) {
                return this.toFloat(this.get(element, name));
            },
            _getAllCurrentStyle: function (element) {
                return element.currentStyle;
            }
        };

        if (document.documentElement.currentStyle) {
            computedStyle.getAll = computedStyle._getAllCurrentStyle;
        }

        return computedStyle;

    }());

    // End Computed Style. Modify whatever you want to.

    var mimicNode = (function () {
        /*
         Class Mimic Node
         Dependency : Computed Style
         Tries to mimick a dom node taking his styles, dimensions. May go to his repo if gets mature.
         */

        function MimicNode(element) {
            this.element = element;
            this.replacer = document.createElement('div');
            this.replacer.style.visibility = 'hidden';
            this.hide();
            element.parentNode.insertBefore(this.replacer, element);
        }

        MimicNode.prototype = {
            replace: function () {
                var rst = this.replacer.style;
                var styles = computedStyle.getAll(this.element);

                // rst.width = computedStyle.width(this.element) + 'px';
                // rst.height = this.element.offsetHeight + 'px';

                // Setting offsetWidth
                rst.width = this._width();
                rst.height = this._height();

                // Adobt margins
                rst.marginTop = styles.marginTop;
                rst.marginBottom = styles.marginBottom;
                rst.marginLeft = styles.marginLeft;
                rst.marginRight = styles.marginRight;

                // Adopt positioning
                rst.cssFloat = styles.cssFloat;
                rst.styleFloat = styles.styleFloat; //ie8;
                rst.position = styles.position;
                rst.top = styles.top;
                rst.right = styles.right;
                rst.bottom = styles.bottom;
                rst.left = styles.left;
                // rst.borderStyle = styles.borderStyle;

                rst.display = styles.display;

            },

            hide: function () {
                this.replacer.style.display = 'none';
            },

            _width: function () {
                return this.element.getBoundingClientRect().width + 'px';
            },

            _widthOffset: function () {
                return this.element.offsetWidth + 'px';
            },

            _height: function () {
                return this.element.getBoundingClientRect().height + 'px';
            },

            _heightOffset: function () {
                return this.element.offsetHeight + 'px';
            },

            destroy: function () {
                $(this.replacer).remove();

                // set properties to null to break references
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        this[prop] = null;
                    }
                }
            }
        };

        var bcr = document.documentElement.getBoundingClientRect();
        if (!bcr.width) {
            MimicNode.prototype._width = MimicNode.prototype._widthOffset;
            MimicNode.prototype._height = MimicNode.prototype._heightOffset;
        }

        return {
            MimicNode: MimicNode,
            computedStyle: computedStyle
        };
    }());

    // Class handles vendor prefixes
    function Prefix() {
        // Cached vendor will be stored when it is detected
        this._vendor = null;

        //this._dummy = document.createElement('div');
    }

    Prefix.prototype = {

        _vendors: {
            webkit: {cssPrefix: '-webkit-', jsPrefix: 'Webkit'},
            moz: {cssPrefix: '-moz-', jsPrefix: 'Moz'},
            ms: {cssPrefix: '-ms-', jsPrefix: 'ms'},
            opera: {cssPrefix: '-o-', jsPrefix: 'O'}
        },

        _prefixJsProperty: function (vendor, prop) {
            return vendor.jsPrefix + prop[0].toUpperCase() + prop.substr(1);
        },

        _prefixValue: function (vendor, value) {
            return vendor.cssPrefix + value;
        },

        _valueSupported: function (prop, value, dummy) {
            // IE8 will throw Illegal Argument when you attempt to set a not supported value.
            try {
                dummy.style[prop] = value;
                return dummy.style[prop] === value;
            }
            catch (er) {
                return false;
            }
        },

        /**
         * Returns true if the property is supported
         * @param {string} prop Property name
         * @returns {boolean}
         */
        propertySupported: function (prop) {
            // Supported property will return either inine style value or an empty string.
            // Undefined means property is not supported.
            return document.documentElement.style[prop] !== undefined;
        },

        /**
         * Returns prefixed property name for js usage
         * @param {string} prop Property name
         * @returns {string|null}
         */
        getJsProperty: function (prop) {
            // Try native property name first.
            if (this.propertySupported(prop)) {
                return prop;
            }

            // Prefix it if we know the vendor already
            if (this._vendor) {
                return this._prefixJsProperty(this._vendor, prop);
            }

            // We don't know the vendor, try all the possibilities
            var prefixed;
            for (var vendor in this._vendors) {
                prefixed = this._prefixJsProperty(this._vendors[vendor], prop);
                if (this.propertySupported(prefixed)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixed;
                }
            }

            // Nothing worked
            return null;
        },

        /**
         * Returns supported css value for css property. Could be used to check support or get prefixed value string.
         * @param {string} prop Property
         * @param {string} value Value name
         * @returns {string|null}
         */
        getCssValue: function (prop, value) {
            // Create dummy element to test value
            var dummy = document.createElement('div');

            // Get supported property name
            var jsProperty = this.getJsProperty(prop);

            // Try unprefixed value 
            if (this._valueSupported(jsProperty, value, dummy)) {
                return value;
            }

            var prefixedValue;

            // If we know the vendor already try prefixed value
            if (this._vendor) {
                prefixedValue = this._prefixValue(this._vendor, value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    return prefixedValue;
                }
            }

            // Try all vendors
            for (var vendor in this._vendors) {
                prefixedValue = this._prefixValue(this._vendors[vendor], value);
                if (this._valueSupported(jsProperty, prefixedValue, dummy)) {
                    // Vendor detected. Cache it.
                    this._vendor = this._vendors[vendor];
                    return prefixedValue;
                }
            }
            // No support for value
            return null;
        }
    };

    var prefix = new Prefix();

    // We will need this frequently. Lets have it as a global until we encapsulate properly.
    var transformJsProperty = prefix.getJsProperty('transform');

    // Will hold if browser creates a positioning context for fixed elements.
    var fixedPositioningContext;

    // Checks if browser creates a positioning context for fixed elements.
    // Transform rule will create a positioning context on browsers who follow the spec.
    // Ie for example will fix it according to documentElement
    // TODO: Other css rules also effects. perspective creates at chrome but not in firefox. transform-style preserve3d effects.
    function checkFixedPositioningContextSupport() {
        var support = false;
        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
            return false;
        }
        var parent = document.createElement('div');
        var child = document.createElement('div');
        parent.appendChild(child);
        parent.style[transformJsProperty] = 'translate(0)';
        // Make sure there is space on top of parent
        parent.style.marginTop = '10px';
        parent.style.visibility = 'hidden';
        child.style.position = 'fixed';
        child.style.top = 0;
        document.body.appendChild(parent);
        var rect = child.getBoundingClientRect();
        // If offset top is greater than 0 meand transformed element created a positioning context.
        if (rect.top > 0) {
            support = true;
        }
        // Remove dummy content
        document.body.removeChild(parent);
        return support;
    }

    // It will return null if position sticky is not supported
    var nativeStickyValue = prefix.getCssValue('position', 'sticky');

    // It will return null if position fixed is not supported
    var fixedPositionValue = prefix.getCssValue('position', 'fixed');

    // Dirty business
    var ie = navigator.appName === 'Microsoft Internet Explorer';
    var ieversion;

    if (ie) {
        ieversion = parseFloat(navigator.appVersion.split("MSIE")[1]);
    }

    function FixTo(child, parent, options) {
        this.child = child;
        this._$child = $(child);
        this.parent = parent;
        this.options = {
            className: 'fixto-fixed',
            top: 0
        };
        this._setOptions(options);
    }

    FixTo.prototype = {
        // Returns the total outerHeight of the elements passed to mind option. Will return 0 if none.
        _mindtop: function () {
            var top = 0;
            if (this._$mind) {
                var el;
                var rect;
                var height;
                for (var i = 0, l = this._$mind.length; i < l; i++) {
                    el = this._$mind[i];
                    rect = el.getBoundingClientRect();
                    if (rect.height) {
                        top += rect.height;
                    }
                    else {
                        var styles = computedStyle.getAll(el);
                        top += el.offsetHeight + computedStyle.toFloat(styles.marginTop) + computedStyle.toFloat(styles.marginBottom);
                    }
                }
            }
            return top;
        },

        // Public method to stop the behaviour of this instance.        
        stop: function () {
            this._stop();
            this._running = false;
        },

        // Public method starts the behaviour of this instance.
        start: function () {

            // Start only if it is not running not to attach event listeners multiple times.
            if (!this._running) {
                this._start();
                this._running = true;
            }
        },

        //Public method to destroy fixto behaviour
        destroy: function () {
            this.stop();

            this._destroy();

            // Remove jquery data from the element
            this._$child.removeData('fixto-instance');

            // set properties to null to break references
            for (var prop in this) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = null;
                }
            }
        },

        _setOptions: function (options) {
            $.extend(this.options, options);
            if (this.options.mind) {
                this._$mind = $(this.options.mind);
            }
            if (this.options.zIndex) {
                this.child.style.zIndex = this.options.zIndex;
            }
        },

        setOptions: function (options) {
            this._setOptions(options);
            this.refresh();
        },

        // Methods could be implemented by subclasses

        _stop: function () {

        },

        _start: function () {

        },

        _destroy: function () {

        },

        refresh: function () {

        }
    };

    // Class FixToContainer
    function FixToContainer(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this._replacer = new mimicNode.MimicNode(child);
        this._ghostNode = this._replacer.replacer;

        this._saveStyles();

        this._saveViewportHeight();

        // Create anonymous functions and keep references to register and unregister events.
        this._proxied_onscroll = this._bind(this._onscroll, this);
        this._proxied_onresize = this._bind(this._onresize, this);

        this.start();
    }

    FixToContainer.prototype = new FixTo();

    $.extend(FixToContainer.prototype, {

        // Returns an anonymous function that will call the given function in the given context
        _bind: function (fn, context) {
            return function () {
                return fn.call(context);
            };
        },

        // at ie8 maybe only in vm window resize event fires everytime an element is resized.
        _toresize: ieversion === 8 ? document.documentElement : window,

        _onscroll: function _onscroll() {
            this._scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            this._parentBottom = (this.parent.offsetHeight + this._fullOffset('offsetTop', this.parent)) - computedStyle.getFloat(this.parent, 'paddingBottom');
            if (!this.fixed) {

                var childStyles = computedStyle.getAll(this.child);

                if (
                    this._scrollTop < this._parentBottom &&
                    this._scrollTop > (this._fullOffset('offsetTop', this.child) - this.options.top - this._mindtop()) &&
                    this._viewportHeight > (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginTop) + computedStyle.toFloat(childStyles.marginBottom))
                ) {

                    this._fix();
                    this._adjust();
                }
            } else {
                if (this._scrollTop > this._parentBottom || this._scrollTop < (this._fullOffset('offsetTop', this._ghostNode) - this.options.top - this._mindtop())) {
                    this._unfix();
                    return;
                }
                this._adjust();
            }
        },

        _adjust: function _adjust() {
            var top = 0;
            var mindTop = this._mindtop();
            var diff = 0;
            var childStyles = computedStyle.getAll(this.child);
            var context = null;

            if (fixedPositioningContext) {
                // Get positioning context.
                context = this._getContext();
                if (context) {
                    // There is a positioning context. Top should be according to the context.
                    top = Math.abs(context.getBoundingClientRect().top);
                }
            }

            diff = (this._parentBottom - this._scrollTop) - (this.child.offsetHeight + computedStyle.toFloat(childStyles.marginBottom) + mindTop + this.options.top);

            if (diff > 0) {
                diff = 0;
            }

            this.child.style.top = (diff + mindTop + top + this.options.top) - computedStyle.toFloat(childStyles.marginTop) + 'px';
        },

        // Calculate cumulative offset of the element.
        // Optionally according to context
        _fullOffset: function _fullOffset(offsetName, elm, context) {
            var offset = elm[offsetName];
            var offsetParent = elm.offsetParent;

            // Add offset of the ascendent tree until we reach to the document root or to the given context
            while (offsetParent !== null && offsetParent !== context) {
                offset = offset + offsetParent[offsetName];
                offsetParent = offsetParent.offsetParent;
            }

            return offset;
        },

        // Get positioning context of the element.
        // We know that the closest parent that a transform rule applied will create a positioning context.
        _getContext: function () {
            var parent;
            var element = this.child;
            var context = null;
            var styles;

            // Climb up the treee until reaching the context
            while (!context) {
                parent = element.parentNode;
                if (parent === document.documentElement) {
                    return null;
                }

                styles = computedStyle.getAll(parent);
                // Element has a transform rule
                if (styles[transformJsProperty] !== 'none') {
                    context = parent;
                    break;
                }
                element = parent;
            }
            return context;
        },

        _fix: function _fix() {
            var child = this.child;
            var childStyle = child.style;
            var childStyles = computedStyle.getAll(child);
            var left = child.getBoundingClientRect().left;
            var width = childStyles.width;

            this._saveStyles();

            if (document.documentElement.currentStyle) {
                // Function for ie<9. When hasLayout is not triggered in ie7, he will report currentStyle as auto, clientWidth as 0. Thus using offsetWidth.
                // Opera also falls here 
                width = (child.offsetWidth) - (computedStyle.toFloat(childStyles.paddingLeft) + computedStyle.toFloat(childStyles.paddingRight) + computedStyle.toFloat(childStyles.borderLeftWidth) + computedStyle.toFloat(childStyles.borderRightWidth)) + 'px';
            }

            // Ie still fixes the container according to the viewport.
            if (fixedPositioningContext) {
                var context = this._getContext();
                if (context) {
                    // There is a positioning context. Left should be according to the context.
                    left = child.getBoundingClientRect().left - context.getBoundingClientRect().left;
                }
            }

            this._replacer.replace();

            childStyle.left = (left - computedStyle.toFloat(childStyles.marginLeft)) + 'px';
            childStyle.width = width;

            childStyle.position = 'fixed';
            childStyle.top = this._mindtop() + this.options.top - computedStyle.toFloat(childStyles.marginTop) + 'px';
            this._$child.addClass(this.options.className);
            this.fixed = true;
        },

        _unfix: function _unfix() {
            var childStyle = this.child.style;
            this._replacer.hide();
            childStyle.position = this._childOriginalPosition;
            childStyle.top = this._childOriginalTop;
            childStyle.width = this._childOriginalWidth;
            childStyle.left = this._childOriginalLeft;
            this._$child.removeClass(this.options.className);
            this.fixed = false;
        },

        _saveStyles: function () {
            var childStyle = this.child.style;
            this._childOriginalPosition = childStyle.position;
            this._childOriginalTop = childStyle.top;
            this._childOriginalWidth = childStyle.width;
            this._childOriginalLeft = childStyle.left;
        },

        _onresize: function () {
            this.refresh();
        },

        _saveViewportHeight: function () {
            // ie8 doesn't support innerHeight
            this._viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        },

        _stop: function () {
            // Unfix the container immediately.
            this._unfix();
            // remove event listeners
            $(window).unbind('scroll', this._proxied_onscroll);
            $(this._toresize).unbind('resize', this._proxied_onresize);
        },

        _start: function () {
            // Trigger onscroll to have the effect immediately.
            this._onscroll();

            // Attach event listeners
            $(window).bind('scroll', this._proxied_onscroll);
            $(this._toresize).bind('resize', this._proxied_onresize);
        },

        _destroy: function () {
            // Destroy mimic node instance
            this._replacer.destroy();
        },

        refresh: function () {
            this._saveViewportHeight();
            this._unfix();
            this._onscroll();
        }
    });

    function NativeSticky(child, parent, options) {
        FixTo.call(this, child, parent, options);
        this.start();
    }

    NativeSticky.prototype = new FixTo();

    $.extend(NativeSticky.prototype, {
        _start: function () {

            var childStyles = computedStyle.getAll(this.child);

            this._childOriginalPosition = childStyles.position;
            this._childOriginalTop = childStyles.top;

            this.child.style.position = nativeStickyValue;
            this.refresh();
        },

        _stop: function () {
            this.child.style.position = this._childOriginalPosition;
            this.child.style.top = this._childOriginalTop;
        },

        refresh: function () {
            this.child.style.top = this._mindtop() + this.options.top + 'px';
        }
    });


    var fixTo = function fixTo(childElement, parentElement, options) {
        var _nativeStickyValue = nativeStickyValue;
        if (_nativeStickyValue == '-webkit-sticky' && $(parentElement).css('display') == 'table-cell') {
            _nativeStickyValue = false;
        }

        if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
            _nativeStickyValue = false;
        }

        if ((_nativeStickyValue && !options) || (_nativeStickyValue && options && options.useNativeSticky !== false)) {
            // Position sticky supported and user did not disabled the usage of it.
            return new NativeSticky(childElement, parentElement, options);
        }
        else if (fixedPositionValue) {
            // Position fixed supported

            if (fixedPositioningContext === undefined) {
                // We don't know yet if browser creates fixed positioning contexts. Check it.
                fixedPositioningContext = checkFixedPositioningContextSupport();
            }

            return new FixToContainer(childElement, parentElement, options);
        }
        else {
            return 'Neither fixed nor sticky positioning supported';
        }
    };

    /*
     No support for ie lt 8
     */

    if (ieversion < 8) {
        fixTo = function () {
            return 'not supported';
        };
    }

    // Let it be a jQuery Plugin
    $.fn.fixTo = function (targetSelector, options) {

        var $targets = $(targetSelector);

        var i = 0;
        return this.each(function () {

            // Check the data of the element.
            var instance = $(this).data('fixto-instance');

            // If the element is not bound to an instance, create the instance and save it to elements data.
            if (!instance) {
                $(this).data('fixto-instance', fixTo(this, $targets[i], options));
            }
            else {
                // If we already have the instance here, expect that targetSelector parameter will be a string
                // equal to a public methods name. Run the method on the instance without checking if
                // it exists or it is a public method or not. Cause nasty errors when necessary.
                var method = targetSelector;
                instance[method].call(instance, options);
            }
            i++;
        });
    };

    /*
     Expose
     */

    return {
        FixToContainer: FixToContainer,
        fixTo: fixTo,
        computedStyle: computedStyle,
        mimicNode: mimicNode
    };


}(n2, window, document));
/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Author: Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under Unlicense:
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/* global ActiveXObject: false */
/* jshint browser: true */

(function() {
    'use strict';

    var
    /* jStorage version */
        JSTORAGE_VERSION = '0.4.12',

    /* detect a dollar object or create one if not found */
        $ = window.n2 || window.$ || (window.$ = {}),

    /* check for a JSON handling support */
        JSON = {
            parse: window.JSON && (window.JSON.parse || window.JSON.decode) ||
                String.prototype.evalJSON && function(str) {
                    return String(str).evalJSON();
                } ||
                $.parseJSON ||
                $.evalJSON,
            stringify: Object.toJSON ||
                window.JSON && (window.JSON.stringify || window.JSON.encode) ||
                $.toJSON
        };

    // Break if no JSON support was found
    if (typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
        throw new Error('No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page');
    }

    var
    /* This is the object, that holds the cached values */
        _storage = {
            __jstorage_meta: {
                CRC32: {}
            }
        },

    /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {
            jStorage: '{}'
        },

    /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,

    /* How much space does the storage take */
        _storage_size = 0,

    /* which backend is currently used */
        _backend = false,

    /* onchange observers */
        _observers = {},

    /* timeout to wait after onchange event */
        _observer_timeout = false,

    /* last update time */
        _observer_update = 0,

    /* pubsub observers */
        _pubsub_observers = {},

    /* skip published items older than current timestamp */
        _pubsub_last = +new Date(),

    /* Next check for TTL */
        _ttl_timeout,

        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set('key', xmlNode);        // IS OK
         *   $.jStorage.set('key', {xml: xmlNode}); // NOT OK
         */
            _XMLService = {

            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function(elm) {
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== 'HTML' : false;
            },

            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function(xmlNode) {
                if (!this.isXML(xmlNode)) {
                    return false;
                }
                try { // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                } catch (E1) {
                    try { // IE
                        return xmlNode.xml;
                    } catch (E2) {}
                }
                return false;
            },

            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function(xmlString) {
                var dom_parser = ('DOMParser' in window && (new DOMParser()).parseFromString) ||
                        (window.ActiveXObject && function(_xmlString) {
                            var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                            xml_doc.async = 'false';
                            xml_doc.loadXML(_xmlString);
                            return xml_doc;
                        }),
                    resultXML;
                if (!dom_parser) {
                    return false;
                }
                resultXML = dom_parser.call('DOMParser' in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML) ? resultXML : false;
            }
        };


    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     */
    function _init() {
        /* Check if browser supports localStorage */
        var localStorageReallyWorks = false;
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                localStorageReallyWorks = true;
                window.localStorage.removeItem('_tmptest');
            } catch (BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

        if (localStorageReallyWorks) {
            try {
                if (window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = 'localStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E3) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports globalStorage */
        else if ('globalStorage' in window) {
            try {
                if (window.globalStorage) {
                    if (window.location.hostname == 'localhost') {
                        _storage_service = window.globalStorage['localhost.localdomain'];
                    } else {
                        _storage_service = window.globalStorage[window.location.hostname];
                    }
                    _backend = 'globalStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E4) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
        /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if (_storage_elm.addBehavior) {

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                try {
                    _storage_elm.load('jStorage');
                } catch (E) {
                    // try to reset cache
                    _storage_elm.setAttribute('jStorage', '{}');
                    _storage_elm.save('jStorage');
                    _storage_elm.load('jStorage');
                }

                var data = '{}';
                try {
                    data = _storage_elm.getAttribute('jStorage');
                } catch (E5) {}

                try {
                    _observer_update = _storage_elm.getAttribute('jStorage_update');
                } catch (E6) {}

                _storage_service.jStorage = data;
                _backend = 'userDataBehavior';
            } else {
                _storage_elm = null;
                return;
            }
        }

        // Load data from storage
        _load_storage();

        // remove dead keys
        _handleTTL();

        // start listening for changes
        _setupObserver();

        // initialize publish-subscribe service
        _handlePubSub();

        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        var data = '{}';

        if (_backend == 'userDataBehavior') {
            _storage_elm.load('jStorage');

            try {
                data = _storage_elm.getAttribute('jStorage');
            } catch (E5) {}

            try {
                _observer_update = _storage_elm.getAttribute('jStorage_update');
            } catch (E6) {}

            _storage_service.jStorage = data;
        }

        _load_storage();

        // remove dead keys
        _handleTTL();

        _handlePubSub();
    }

    /**
     * Sets up a storage change observer
     */
    function _setupObserver() {
        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            if ('addEventListener' in window) {
                window.addEventListener('storage', _storageObserver, false);
            } else {
                document.attachEvent('onstorage', _storageObserver);
            }
        } else if (_backend == 'userDataBehavior') {
            setInterval(_storageObserver, 1000);
        }
    }

    /**
     * Fired on any kind of data change, needs to check if anything has
     * really been changed
     */
    function _storageObserver() {
        var updateTime;
        // cumulate change notifications with timeout
        clearTimeout(_observer_timeout);
        _observer_timeout = setTimeout(function() {

            if (_backend == 'localStorage' || _backend == 'globalStorage') {
                updateTime = _storage_service.jStorage_update;
            } else if (_backend == 'userDataBehavior') {
                _storage_elm.load('jStorage');
                try {
                    updateTime = _storage_elm.getAttribute('jStorage_update');
                } catch (E5) {}
            }

            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }

        }, 25);
    }

    /**
     * Reloads the data and checks if any keys are changed
     */
    function _checkUpdatedKeys() {
        var oldCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32)),
            newCrc32List;

        _reloadData();
        newCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));

        var key,
            updated = [],
            removed = [];

        for (key in oldCrc32List) {
            if (oldCrc32List.hasOwnProperty(key)) {
                if (!newCrc32List[key]) {
                    removed.push(key);
                    continue;
                }
                if (oldCrc32List[key] != newCrc32List[key] && String(oldCrc32List[key]).substr(0, 2) == '2.') {
                    updated.push(key);
                }
            }
        }

        for (key in newCrc32List) {
            if (newCrc32List.hasOwnProperty(key)) {
                if (!oldCrc32List[key]) {
                    updated.push(key);
                }
            }
        }

        _fireObservers(updated, 'updated');
        _fireObservers(removed, 'deleted');
    }

    /**
     * Fires observers for updated keys
     *
     * @param {Array|String} keys Array of key names or a key
     * @param {String} action What happened with the value (updated, deleted, flushed)
     */
    function _fireObservers(keys, action) {
        keys = [].concat(keys || []);

        var i, j, len, jlen;

        if (action == 'flushed') {
            keys = [];
            for (var key in _observers) {
                if (_observers.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            action = 'deleted';
        }
        for (i = 0, len = keys.length; i < len; i++) {
            if (_observers[keys[i]]) {
                for (j = 0, jlen = _observers[keys[i]].length; j < jlen; j++) {
                    _observers[keys[i]][j](keys[i], action);
                }
            }
            if (_observers['*']) {
                for (j = 0, jlen = _observers['*'].length; j < jlen; j++) {
                    _observers['*'][j](keys[i], action);
                }
            }
        }
    }

    /**
     * Publishes key change to listeners
     */
    function _publishChange() {
        var updateTime = (+new Date()).toString();

        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            try {
                _storage_service.jStorage_update = updateTime;
            } catch (E8) {
                // safari private mode has been enabled after the jStorage initialization
                _backend = false;
            }
        } else if (_backend == 'userDataBehavior') {
            _storage_elm.setAttribute('jStorage_update', updateTime);
            _storage_elm.save('jStorage');
        }

        _storageObserver();
    }

    /**
     * Loads the data from the storage based on the supported mechanism
     */
    function _load_storage() {
        /* if jStorage string is retrieved, then decode it */
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (E6) {
                _storage_service.jStorage = '{}';
            }
        } else {
            _storage_service.jStorage = '{}';
        }
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;

        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * This functions provides the 'save' mechanism to store the jStorage object
     */
    function _save() {
        _dropOldEvents(); // remove expired events
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            // If userData is used as the storage engine, additional
            if (_storage_elm) {
                _storage_elm.setAttribute('jStorage', _storage_service.jStorage);
                _storage_elm.save('jStorage');
            }
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (E7) { /* probably cache is full, nothing is saved this way*/ }
    }

    /**
     * Function checks if a key is set and is string or numberic
     *
     * @param {String} key Key name
     */
    function _checkKey(key) {
        if (typeof key != 'string' && typeof key != 'number') {
            throw new TypeError('Key name must be string or numeric');
        }
        if (key == '__jstorage_meta') {
            throw new TypeError('Reserved key name');
        }
        return true;
    }

    /**
     * Removes expired keys
     */
    function _handleTTL() {
        var curtime, i, TTL, CRC32, nextExpire = Infinity,
            changed = false,
            deleted = [];

        clearTimeout(_ttl_timeout);

        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != 'object') {
            // nothing to do here
            return;
        }

        curtime = +new Date();
        TTL = _storage.__jstorage_meta.TTL;

        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    changed = true;
                    deleted.push(i);
                } else if (TTL[i] < nextExpire) {
                    nextExpire = TTL[i];
                }
            }
        }

        // set next check
        if (nextExpire != Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // save changes
        if (changed) {
            _save();
            _publishChange();
            _fireObservers(deleted, 'deleted');
        }
    }

    /**
     * Checks if there's any events on hold to be fired to listeners
     */
    function _handlePubSub() {
        var i, len;
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm,
            _pubsubCurrent = _pubsub_last,
            needFired = [];

        for (i = len = _storage.__jstorage_meta.PubSub.length - 1; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                needFired.unshift(pubelm);
            }
        }

        for (i = needFired.length - 1; i >= 0; i--) {
            _fireSubscribers(needFired[i][1], needFired[i][2]);
        }

        _pubsub_last = _pubsubCurrent;
    }

    /**
     * Fires all subscriber listeners for a pubsub channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload data to deliver
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            for (var i = 0, len = _pubsub_observers[channel].length; i < len; i++) {
                // send immutable data that can't be modified by listeners
                try {
                    _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
                } catch (E) {}
            }
        }
    }

    /**
     * Remove old events from the publish stream (at least 2sec old)
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }

        var retire = +new Date() - 2000;

        for (var i = 0, len = _storage.__jstorage_meta.PubSub.length; i < len; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= retire) {
                // deleteCount is needed for IE6
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }

        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }

    }

    /**
     * Publish payload to a channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload to send to the subscribers
     */
    function _publish(channel, payload) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            _storage.__jstorage_meta.PubSub = [];
        }

        _storage.__jstorage_meta.PubSub.unshift([+new Date(), channel, payload]);

        _save();
        _publishChange();
    }


    /**
     * JS Implementation of MurmurHash2
     *
     *  SOURCE: https://github.com/garycourt/murmurhash-js (MIT licensed)
     *
     * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} str ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                    ((str.charCodeAt(++i) & 0xff) << 8) |
                    ((str.charCodeAt(++i) & 0xff) << 16) |
                    ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
            /* falls through */
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
            /* falls through */
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: JSTORAGE_VERSION,

        /**
         * Sets a key's value.
         *
         * @param {String} key Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @param {Object} [options] - possible options to use
         * @param {Number} [options.TTL] - optional TTL value, in milliseconds
         * @return {Mixed} the used value
         */
        set: function(key, value, options) {
            _checkKey(key);

            options = options || {};

            // undefined values are deleted automatically
            if (typeof value == 'undefined') {
                this.deleteKey(key);
                return value;
            }

            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else if (typeof value == 'function') {
                return undefined; // functions can't be saved!
            } else if (value && typeof value == 'object') {
                // clone the object before saving to _storage tree
                value = JSON.parse(JSON.stringify(value));
            }

            _storage[key] = value;

            _storage.__jstorage_meta.CRC32[key] = '2.' + murmurhash2_32_gc(JSON.stringify(value), 0x9747b28c);

            this.setTTL(key, options.TTL || 0); // also handles saving and _publishChange

            _fireObservers(key, 'updated');
            return value;
        },

        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @return {Mixed} the key value, default value or null
         */
        get: function(key, def) {
            _checkKey(key);
            if (key in _storage) {
                if (_storage[key] && typeof _storage[key] == 'object' && _storage[key]._is_xml) {
                    return _XMLService.decode(_storage[key].xml);
                } else {
                    return _storage[key];
                }
            }
            return typeof(def) == 'undefined' ? null : def;
        },

        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @return {Boolean} true if key existed or false if it didn't
         */
        deleteKey: function(key) {
            _checkKey(key);
            if (key in _storage) {
                delete _storage[key];
                // remove from TTL list
                if (typeof _storage.__jstorage_meta.TTL == 'object' &&
                    key in _storage.__jstorage_meta.TTL) {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                delete _storage.__jstorage_meta.CRC32[key];

                _save();
                _publishChange();
                _fireObservers(key, 'deleted');
                return true;
            }
            return false;
        },

        /**
         * Sets a TTL for a key, or remove it if ttl value is 0 or below
         *
         * @param {String} key - key to set the TTL for
         * @param {Number} ttl - TTL timeout in milliseconds
         * @return {Boolean} true if key existed or false if it didn't
         */
        setTTL: function(key, ttl) {
            var curtime = +new Date();
            _checkKey(key);
            ttl = Number(ttl) || 0;
            if (key in _storage) {

                if (!_storage.__jstorage_meta.TTL) {
                    _storage.__jstorage_meta.TTL = {};
                }

                // Set TTL value for the key
                if (ttl > 0) {
                    _storage.__jstorage_meta.TTL[key] = curtime + ttl;
                } else {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                _save();

                _handleTTL();

                _publishChange();
                return true;
            }
            return false;
        },

        /**
         * Gets remaining TTL (in milliseconds) for a key or 0 when no TTL has been set
         *
         * @param {String} key Key to check
         * @return {Number} Remaining TTL in milliseconds
         */
        getTTL: function(key) {
            var curtime = +new Date(),
                ttl;
            _checkKey(key);
            if (key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
                ttl = _storage.__jstorage_meta.TTL[key] - curtime;
                return ttl || 0;
            }
            return 0;
        },

        /**
         * Deletes everything in cache.
         *
         * @return {Boolean} Always true
         */
        flush: function() {
            _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            };
            _save();
            _publishChange();
            _fireObservers(null, 'flushed');
            return true;
        },

        /**
         * Returns a read-only copy of _storage
         *
         * @return {Object} Read-only copy of _storage
         */
        storageObj: function() {
            function F() {}
            F.prototype = _storage;
            return new F();
        },

        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         *
         * @return {Array} Used keys
         */
        index: function() {
            var index = [],
                i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != '__jstorage_meta') {
                    index.push(i);
                }
            }
            return index;
        },

        /**
         * How much space in bytes does the storage take?
         *
         * @return {Number} Storage size in chars (not the same as in bytes,
         *                  since some chars may take several bytes)
         */
        storageSize: function() {
            return _storage_size;
        },

        /**
         * Which backend is currently in use?
         *
         * @return {String} Backend name
         */
        currentBackend: function() {
            return _backend;
        },

        /**
         * Test if storage is available
         *
         * @return {Boolean} True if storage can be used
         */
        storageAvailable: function() {
            return !!_backend;
        },

        /**
         * Register change listeners
         *
         * @param {String} key Key name
         * @param {Function} callback Function to run when the key changes
         */
        listenKeyChange: function(key, callback) {
            _checkKey(key);
            if (!_observers[key]) {
                _observers[key] = [];
            }
            _observers[key].push(callback);
        },

        /**
         * Remove change listeners
         *
         * @param {String} key Key name to unregister listeners against
         * @param {Function} [callback] If set, unregister the callback, if not - unregister all
         */
        stopListening: function(key, callback) {
            _checkKey(key);

            if (!_observers[key]) {
                return;
            }

            if (!callback) {
                delete _observers[key];
                return;
            }

            for (var i = _observers[key].length - 1; i >= 0; i--) {
                if (_observers[key][i] == callback) {
                    _observers[key].splice(i, 1);
                }
            }
        },

        /**
         * Subscribe to a Publish/Subscribe event stream
         *
         * @param {String} channel Channel name
         * @param {Function} callback Function to run when the something is published to the channel
         */
        subscribe: function(channel, callback) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }
            if (!_pubsub_observers[channel]) {
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(callback);
        },

        /**
         * Publish data to an event stream
         *
         * @param {String} channel Channel name
         * @param {Mixed} payload Payload to deliver
         */
        publish: function(channel, payload) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }

            _publish(channel, payload);
        },

        /**
         * Reloads the data from browser storage
         */
        reInit: function() {
            _reloadData();
        },

        /**
         * Removes reference from global objects and saves it as jStorage
         *
         * @param {Boolean} option if needed to save object as simple 'jStorage' in windows context
         */
        noConflict: function(saveInGlobal) {
            delete window.$.jStorage;

            if (saveInGlobal) {
                window.jStorage = this;
            }

            return this;
        }
    };

    // Initialize jStorage
    _init();

})();
/**
 * @preserve jQuery DateTimePicker plugin v2.4.1
 * @homepage http://xdsoft.net/jqplugins/datetimepicker/
 * (c) 2014, Chupurnov Valeriy.
 */
/*global document,window,jQuery,setTimeout,clearTimeout*/

(function(jQuery){
    var module, define;
(function ($) {
    'use strict';
    var default_options  = {
        i18n: {
            ar: { // Arabic
                months: [
                    "كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
                ],
                dayOfWeek: [
                    "ن", "ث", "ع", "خ", "ج", "س", "ح"
                ]
            },
            ro: { // Romanian
                months: [
                    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
                ],
                dayOfWeek: [
                    "l", "ma", "mi", "j", "v", "s", "d"
                ]
            },
            id: { // Indonesian
                months: [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
                ]
            },
            bg: { // Bulgarian
                months: [
                    "Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
                ],
                dayOfWeek: [
                    "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            fa: { // Persian/Farsi
                months: [
                    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
                ],
                dayOfWeek: [
                    'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
                ]
            },
            ru: { // Russian
                months: [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ],
                dayOfWeek: [
                    "Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
                ]
            },
            uk: { // Ukrainian
                months: [
                    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
                ],
                dayOfWeek: [
                    "Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"
                ]
            },
            en: { // English
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            el: { // Ελληνικά
                months: [
                    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"
                ],
                dayOfWeek: [
                    "Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"
                ]
            },
            de: { // German
                months: [
                    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                ],
                dayOfWeek: [
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
                ]
            },
            nl: { // Dutch
                months: [
                    "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"
                ],
                dayOfWeek: [
                    "zo", "ma", "di", "wo", "do", "vr", "za"
                ]
            },
            tr: { // Turkish
                months: [
                    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ],
                dayOfWeek: [
                    "Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"
                ]
            },
            fr: { //French
                months: [
                    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ],
                dayOfWeek: [
                    "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
                ]
            },
            es: { // Spanish
                months: [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"
                ]
            },
            th: { // Thai
                months: [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ],
                dayOfWeek: [
                    'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
                ]
            },
            pl: { // Polish
                months: [
                    "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
                ],
                dayOfWeek: [
                    "nd", "pn", "wt", "śr", "cz", "pt", "sb"
                ]
            },
            pt: { // Portuguese
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"
                ]
            },
            ch: { // Simplified Chinese
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            se: { // Swedish
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September",  "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            kr: { // Korean
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            it: { // Italian
                months: [
                    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"
                ]
            },
            da: { // Dansk
                months: [
                    "January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            no: { // Norwegian
                months: [
                    "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"
                ],
                dayOfWeek: [
                    "Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"
                ]
            },
            ja: { // Japanese
                months: [
                    "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
                ],
                dayOfWeek: [
                    "日", "月", "火", "水", "木", "金", "土"
                ]
            },
            vi: { // Vietnamese
                months: [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                ],
                dayOfWeek: [
                    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
                ]
            },
            sl: { // Slovenščina
                months: [
                    "Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"
                ]
            },
            cs: { // Čeština
                months: [
                    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Út", "St", "Čt", "Pá", "So"
                ]
            },
            hu: { // Hungarian
                months: [
                    "Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"
                ]
            },
            az: { //Azerbaijanian (Azeri)
                months: [
                    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
                ],
                dayOfWeek: [
                    "B", "Be", "Ça", "Ç", "Ca", "C", "Ş"
                ]
            },
            bs: { //Bosanski
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ca: { //Català
                months: [
                    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
                ],
                dayOfWeek: [
                    "Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"
                ]
            },
            'en-GB': { //English (British)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            et: { //"Eesti"
                months: [
                    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"
                ],
                dayOfWeek: [
                    "P", "E", "T", "K", "N", "R", "L"
                ]
            },
            eu: { //Euskara
                months: [
                    "Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"
                ],
                dayOfWeek: [
                    "Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."
                ]
            },
            fi: { //Finnish (Suomi)
                months: [
                    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
                ],
                dayOfWeek: [
                    "Su", "Ma", "Ti", "Ke", "To", "Pe", "La"
                ]
            },
            gl: { //Galego
                months: [
                    "Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"
                ],
                dayOfWeek: [
                    "Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"
                ]
            },
            hr: { //Hrvatski
                months: [
                    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"
                ]
            },
            ko: { //Korean (한국어)
                months: [
                    "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"
                ],
                dayOfWeek: [
                    "일", "월", "화", "수", "목", "금", "토"
                ]
            },
            lt: { //Lithuanian (lietuvių)
                months: [
                    "Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"
                ],
                dayOfWeek: [
                    "Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"
                ]
            },
            lv: { //Latvian (Latviešu)
                months: [
                    "Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"
                ],
                dayOfWeek: [
                    "Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"
                ]
            },
            mk: { //Macedonian (Македонски)
                months: [
                    "јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"
                ],
                dayOfWeek: [
                    "нед", "пон", "вто", "сре", "чет", "пет", "саб"
                ]
            },
            mn: { //Mongolian (Монгол)
                months: [
                    "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
                ],
                dayOfWeek: [
                    "Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"
                ]
            },
            'pt-BR': { //Português(Brasil)
                months: [
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ],
                dayOfWeek: [
                    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
                ]
            },
            sk: { //Slovenčina
                months: [
                    "Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"
                ],
                dayOfWeek: [
                    "Ne", "Po", "Ut", "St", "Št", "Pi", "So"
                ]
            },
            sq: { //Albanian (Shqip)
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ],
                dayOfWeek: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
                ]
            },
            'sr-YU': { //Serbian (Srpski)
                months: [
                    "Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
                ],
                dayOfWeek: [
                    "Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"
                ]
            },
            sr: { //Serbian Cyrillic (Српски)
                months: [
                    "јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"
                ],
                dayOfWeek: [
                    "нед", "пон", "уто", "сре", "чет", "пет", "суб"
                ]
            },
            sv: { //Svenska
                months: [
                    "Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"
                ],
                dayOfWeek: [
                    "Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"
                ]
            },
            'zh-TW': { //Traditional Chinese (繁體中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            zh: { //Simplified Chinese (简体中文)
                months: [
                    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
                ],
                dayOfWeek: [
                    "日", "一", "二", "三", "四", "五", "六"
                ]
            },
            he: { //Hebrew (עברית)
                months: [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                ],
                dayOfWeek: [
                    'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'שבת'
                ]
            }
        },
        value: '',
        lang: 'en',

        format:	'Y/m/d H:i',
        formatTime:	'H:i',
        formatDate:	'Y/m/d',

        startDate:	false, // new Date(), '1986/12/08', '-1970/01/05','-1970/01/05',
        step: 60,
        monthChangeSpinner: true,

        closeOnDateSelect: false,
        closeOnWithoutClick: true,
        closeOnInputClick: true,

        timepicker: true,
        datepicker: true,
        weeks: false,

        defaultTime: false,	// use formatTime format (ex. '10:00' for formatTime:	'H:i')
        defaultDate: false,	// use formatDate format (ex new Date() or '1986/12/08' or '-1970/01/05' or '-1970/01/05')

        minDate: false,
        maxDate: false,
        minTime: false,
        maxTime: false,

        allowTimes: [],
        opened: false,
        initTime: true,
        inline: false,
        theme: '',

        onSelectDate: function () {},
        onSelectTime: function () {},
        onChangeMonth: function () {},
        onChangeYear: function () {},
        onChangeDateTime: function () {},
        onShow: function () {},
        onClose: function () {},
        onGenerate: function () {},

        withoutCopyright: true,
        inverseButton: false,
        hours12: false,
        next:	'xdsoft_next',
        prev : 'xdsoft_prev',
        dayOfWeekStart: 0,
        parentID: 'body',
        timeHeightInTimePicker: 25,
        timepickerScrollbar: true,
        todayButton: true,
        defaultSelect: true,

        scrollMonth: true,
        scrollTime: true,
        scrollInput: true,

        lazyInit: false,
        mask: false,
        validateOnBlur: true,
        allowBlank: true,
        yearStart: 1950,
        yearEnd: 2050,
        style: '',
        id: '',
        fixed: false,
        roundTime: 'round', // ceil, floor
        className: '',
        weekends: [],
        disabledDates : [],
        yearOffset: 0,
        beforeShowDay: null,

        enterLikeTab: true
    };
    // fix for ie8
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            var i, j;
            for (i = (start || 0), j = this.length; i < j; i += 1) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    Date.prototype.countDaysInMonth = function () {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    };
    $.fn.xdsoftScroller = function (percent) {
        return this.each(function () {
            var timeboxparent = $(this),
                pointerEventToXY = function (e) {
                    var out = {x: 0, y: 0},
                        touch;
                    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                        touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        out.x = touch.clientX;
                        out.y = touch.clientY;
                    } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
                        out.x = e.clientX;
                        out.y = e.clientY;
                    }
                    return out;
                },
                move = 0,
                timebox,
                parentHeight,
                height,
                scrollbar,
                scroller,
                maximumOffset = 100,
                start = false,
                startY = 0,
                startTop = 0,
                h1 = 0,
                touchStart = false,
                startTopScroll = 0,
                calcOffset = function () {};
            if (percent === 'hide') {
                timeboxparent.find('.xdsoft_scrollbar').hide();
                return;
            }
            if (!$(this).hasClass('xdsoft_scroller_box')) {
                timebox = timeboxparent.children().eq(0);
                parentHeight = timeboxparent[0].clientHeight;
                height = timebox[0].offsetHeight;
                scrollbar = $('<div class="xdsoft_scrollbar"></div>');
                scroller = $('<div class="xdsoft_scroller"></div>');
                scrollbar.append(scroller);

                timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
                calcOffset = function calcOffset(event) {
                    var offset = pointerEventToXY(event).y - startY + startTopScroll;
                    if (offset < 0) {
                        offset = 0;
                    }
                    if (offset + scroller[0].offsetHeight > h1) {
                        offset = h1 - scroller[0].offsetHeight;
                    }
                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
                };

                scroller
                    .on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
                        }

                        startY = pointerEventToXY(event).y;
                        startTopScroll = parseInt(scroller.css('margin-top'), 10);
                        h1 = scrollbar[0].offsetHeight;

                        if (event.type === 'mousedown') {
                            if (document) {
                                $(document.body).addClass('xdsoft_noselect');
                            }
                            $([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
                                $([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
                                    .off('mousemove.xdsoft_scroller', calcOffset)
                                    .removeClass('xdsoft_noselect');
                            });
                            $(document.body).on('mousemove.xdsoft_scroller', calcOffset);
                        } else {
                            touchStart = true;
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    })
                    .on('touchmove', function (event) {
                        if (touchStart) {
                            event.preventDefault();
                            calcOffset(event);
                        }
                    })
                    .on('touchend touchcancel', function (event) {
                        touchStart =  false;
                        startTopScroll = 0;
                    });

                timeboxparent
                    .on('scroll_element.xdsoft_scroller', function (event, percentage) {
                        if (!parentHeight) {
                            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
                        }
                        percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

                        scroller.css('margin-top', maximumOffset * percentage);

                        setTimeout(function () {
                            timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
                        }, 10);
                    })
                    .on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
                        var percent, sh;
                        parentHeight = timeboxparent[0].clientHeight;
                        height = timebox[0].offsetHeight;
                        percent = parentHeight / height;
                        sh = percent * scrollbar[0].offsetHeight;
                        if (percent > 1) {
                            scroller.hide();
                        } else {
                            scroller.show();
                            scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
                            maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
                            if (noTriggerScroll !== true) {
                                timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
                            }
                        }
                    });

                timeboxparent.on('mousewheel', function (event) {
                    var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

                    top = top - (event.deltaY * 20);
                    if (top < 0) {
                        top = 0;
                    }

                    timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
                    event.stopPropagation();
                    return false;
                });

                timeboxparent.on('touchstart', function (event) {
                    start = pointerEventToXY(event);
                    startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
                });

                timeboxparent.on('touchmove', function (event) {
                    if (start) {
                        event.preventDefault();
                        var coord = pointerEventToXY(event);
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
                    }
                });

                timeboxparent.on('touchend touchcancel', function (event) {
                    start = false;
                    startTop = 0;
                });
            }
            timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
        });
    };

    $.fn.datetimepicker = function (opt) {
        var KEY0 = 48,
            KEY9 = 57,
            _KEY0 = 96,
            _KEY9 = 105,
            CTRLKEY = 17,
            DEL = 46,
            ENTER = 13,
            ESC = 27,
            BACKSPACE = 8,
            ARROWLEFT = 37,
            ARROWUP = 38,
            ARROWRIGHT = 39,
            ARROWDOWN = 40,
            TAB = 9,
            F5 = 116,
            AKEY = 65,
            CKEY = 67,
            VKEY = 86,
            ZKEY = 90,
            YKEY = 89,
            ctrlDown	=	false,
            options = ($.isPlainObject(opt) || !opt) ? $.extend(true, {}, default_options, opt) : $.extend(true, {}, default_options),

            lazyInitTimer = 0,
            createDateTimePicker,
            destroyDateTimePicker,

            lazyInit = function (input) {
                if(typeof options.i18n[options.lang] === 'undefined'){
                    options.lang = 'en';
                }
                input
                    .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function initOnActionCallback(event) {
                        if (input.is(':disabled') || input.data('xdsoft_datetimepicker')) {
                            return;
                        }
                        clearTimeout(lazyInitTimer);
                        lazyInitTimer = setTimeout(function () {

                            if (!input.data('xdsoft_datetimepicker')) {
                                createDateTimePicker(input);
                            }
                            input
                                .off('open.xdsoft focusin.xdsoft mousedown.xdsoft', initOnActionCallback)
                                .trigger('open.xdsoft');
                        }, 100);
                    });
            };

        createDateTimePicker = function (input) {
            var datetimepicker = $('<div ' + (options.id ? 'id="' + options.id + '"' : '') + ' ' + (options.style ? 'style="' + options.style + '"' : '') + ' class="xdsoft_datetimepicker xdsoft_' + options.theme + ' xdsoft_noselect ' + (options.weeks ? ' xdsoft_showweeks' : '') + options.className + '"></div>'),
                xdsoft_copyright = $('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),
                datepicker = $('<div class="xdsoft_datepicker active"></div>'),
                mounth_picker = $('<div class="xdsoft_mounthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button>' +
                '<div class="xdsoft_label xdsoft_month"><span></span><i></i></div>' +
                '<div class="xdsoft_label xdsoft_year"><span></span><i></i></div>' +
                '<button type="button" class="xdsoft_next"></button></div>'),
                calendar = $('<div class="xdsoft_calendar"></div>'),
                timepicker = $('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),
                timeboxparent = timepicker.find('.xdsoft_time_box').eq(0),
                timebox = $('<div class="xdsoft_time_variant"></div>'),
            /*scrollbar = $('<div class="xdsoft_scrollbar"></div>'),
             scroller = $('<div class="xdsoft_scroller"></div>'),*/
                monthselect = $('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),
                yearselect = $('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),
                triggerAfterOpen = false,
                XDSoft_datetime,
            //scroll_element,
                xchangeTimer,
                timerclick,
                current_time_index,
                setPos,
                timer = 0,
                timer1 = 0,
                _xdsoft_datetime;

            mounth_picker
                .find('.xdsoft_month span')
                .after(monthselect);
            mounth_picker
                .find('.xdsoft_year span')
                .after(yearselect);

            mounth_picker
                .find('.xdsoft_month,.xdsoft_year')
                .on('mousedown.xdsoft', function (event) {
                    var select = $(this).find('.xdsoft_select').eq(0),
                        val = 0,
                        top = 0,
                        visible = select.is(':visible'),
                        items,
                        i;

                    mounth_picker
                        .find('.xdsoft_select')
                        .hide();
                    if (_xdsoft_datetime.currentTime) {
                        val = _xdsoft_datetime.currentTime[$(this).hasClass('xdsoft_month') ? 'getMonth' : 'getFullYear']();
                    }

                    select[visible ? 'hide' : 'show']();
                    for (items = select.find('div.xdsoft_option'), i = 0; i < items.length; i += 1) {
                        if (items.eq(i).data('value') === val) {
                            break;
                        } else {
                            top += items[0].offsetHeight;
                        }
                    }

                    select.xdsoftScroller(top / (select.children()[0].offsetHeight - (select[0].clientHeight)));
                    event.stopPropagation();
                    return false;
                });

            mounth_picker
                .find('.xdsoft_select')
                .xdsoftScroller()
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                })
                .on('mousedown.xdsoft', '.xdsoft_option', function (event) {
                    var year = _xdsoft_datetime.currentTime.getFullYear();
                    if (_xdsoft_datetime && _xdsoft_datetime.currentTime) {
                        _xdsoft_datetime.currentTime[$(this).parent().parent().hasClass('xdsoft_monthselect') ? 'setMonth' : 'setFullYear']($(this).data('value'));
                    }

                    $(this).parent().parent().hide();

                    datetimepicker.trigger('xchange.xdsoft');
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _xdsoft_datetime.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                });

            datetimepicker.setOptions = function (_options) {
                options = $.extend(true, {}, options, _options);

                if (_options.allowTimes && $.isArray(_options.allowTimes) && _options.allowTimes.length) {
                    options.allowTimes = $.extend(true, [], _options.allowTimes);
                }

                if (_options.weekends && $.isArray(_options.weekends) && _options.weekends.length) {
                    options.weekends = $.extend(true, [], _options.weekends);
                }

                if (_options.disabledDates && $.isArray(_options.disabledDates) && _options.disabledDates.length) {
                    options.disabledDates = $.extend(true, [], _options.disabledDates);
                }

                if ((options.open || options.opened) && (!options.inline)) {
                    input.trigger('open.xdsoft');
                }

                if (options.inline) {
                    triggerAfterOpen = true;
                    datetimepicker.addClass('xdsoft_inline');
                    input.after(datetimepicker).hide();
                }

                if (options.inverseButton) {
                    options.next = 'xdsoft_prev';
                    options.prev = 'xdsoft_next';
                }

                if (options.datepicker) {
                    datepicker.addClass('active');
                } else {
                    datepicker.removeClass('active');
                }

                if (options.timepicker) {
                    timepicker.addClass('active');
                } else {
                    timepicker.removeClass('active');
                }

                if (options.value) {
                    if (input && input.val) {
                        input.val(options.value);
                    }
                    _xdsoft_datetime.setCurrentTime(options.value);
                }

                if (isNaN(options.dayOfWeekStart)) {
                    options.dayOfWeekStart = 0;
                } else {
                    options.dayOfWeekStart = parseInt(options.dayOfWeekStart, 10) % 7;
                }

                if (!options.timepickerScrollbar) {
                    timeboxparent.xdsoftScroller('hide');
                }

                if (options.minDate && /^-(.*)$/.test(options.minDate)) {
                    options.minDate = _xdsoft_datetime.strToDateTime(options.minDate).dateFormat(options.formatDate);
                }

                if (options.maxDate &&  /^\+(.*)$/.test(options.maxDate)) {
                    options.maxDate = _xdsoft_datetime.strToDateTime(options.maxDate).dateFormat(options.formatDate);
                }

                mounth_picker
                    .find('.xdsoft_today_button')
                    .css('visibility', !options.todayButton ? 'hidden' : 'visible');

                if (options.mask) {
                    var e,
                        getCaretPos = function (input) {
                            try {
                                if (document.selection && document.selection.createRange) {
                                    var range = document.selection.createRange();
                                    return range.getBookmark().charCodeAt(2) - 2;
                                }
                                if (input.setSelectionRange) {
                                    return input.selectionStart;
                                }
                            } catch (e) {
                                return 0;
                            }
                        },
                        setCaretPos = function (node, pos) {
                            node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;
                            if (!node) {
                                return false;
                            }
                            if (node.createTextRange) {
                                var textRange = node.createTextRange();
                                textRange.collapse(true);
                                textRange.moveEnd('character', pos);
                                textRange.moveStart('character', pos);
                                textRange.select();
                                return true;
                            }
                            if (node.setSelectionRange) {
                                node.setSelectionRange(pos, pos);
                                return true;
                            }
                            return false;
                        },
                        isValidValue = function (mask, value) {
                            var reg = mask
                                .replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, '\\$1')
                                .replace(/_/g, '{digit+}')
                                .replace(/([0-9]{1})/g, '{digit$1}')
                                .replace(/\{digit([0-9]{1})\}/g, '[0-$1_]{1}')
                                .replace(/\{digit[\+]\}/g, '[0-9_]{1}');
                            return (new RegExp(reg)).test(value);
                        };
                    input.off('keydown.xdsoft');

                    if (options.mask === true) {
                        options.mask = options.format
                            .replace(/Y/g, '9999')
                            .replace(/F/g, '9999')
                            .replace(/m/g, '19')
                            .replace(/d/g, '39')
                            .replace(/H/g, '29')
                            .replace(/i/g, '59')
                            .replace(/s/g, '59');
                    }

                    if ($.type(options.mask) === 'string') {
                        if (!isValidValue(options.mask, input.val())) {
                            input.val(options.mask.replace(/[0-9]/g, '_'));
                        }

                        input.on('keydown.xdsoft', function (event) {
                            var val = this.value,
                                key = event.which,
                                pos,
                                digit;

                            if (((key >= KEY0 && key <= KEY9) || (key >= _KEY0 && key <= _KEY9)) || (key === BACKSPACE || key === DEL)) {
                                pos = getCaretPos(this);
                                digit = (key !== BACKSPACE && key !== DEL) ? String.fromCharCode((_KEY0 <= key && key <= _KEY9) ? key - KEY0 : key) : '_';

                                if ((key === BACKSPACE || key === DEL) && pos) {
                                    pos -= 1;
                                    digit = '_';
                                }

                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                val = val.substr(0, pos) + digit + val.substr(pos + 1);
                                if ($.trim(val) === '') {
                                    val = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    if (pos === options.mask.length) {
                                        event.preventDefault();
                                        return false;
                                    }
                                }

                                pos += (key === BACKSPACE || key === DEL) ? 0 : 1;
                                while (/[^0-9_]/.test(options.mask.substr(pos, 1)) && pos < options.mask.length && pos > 0) {
                                    pos += (key === BACKSPACE || key === DEL) ? -1 : 1;
                                }

                                if (isValidValue(options.mask, val)) {
                                    this.value = val;
                                    setCaretPos(this, pos);
                                } else if ($.trim(val) === '') {
                                    this.value = options.mask.replace(/[0-9]/g, '_');
                                } else {
                                    input.trigger('error_input.xdsoft');
                                }
                            } else {
                                if (([AKEY, CKEY, VKEY, ZKEY, YKEY].indexOf(key) !== -1 && ctrlDown) || [ESC, ARROWUP, ARROWDOWN, ARROWLEFT, ARROWRIGHT, F5, CTRLKEY, TAB, ENTER].indexOf(key) !== -1) {
                                    return true;
                                }
                            }

                            event.preventDefault();
                            return false;
                        });
                    }
                }
                if (options.validateOnBlur) {
                    input
                        .off('blur.xdsoft')
                        .on('blur.xdsoft', function () {
                            if (options.allowBlank && !$.trim($(this).val()).length) {
                                $(this).val(null);
                                datetimepicker.data('xdsoft_datetime').empty();
                            } else if (!Date.parseDate($(this).val(), options.format)) {
                                $(this).val((_xdsoft_datetime.now()).dateFormat(options.format));
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            } else {
                                datetimepicker.data('xdsoft_datetime').setCurrentTime($(this).val());
                            }
                            datetimepicker.trigger('changedatetime.xdsoft');
                        });
                }
                options.dayOfWeekStartPrev = (options.dayOfWeekStart === 0) ? 6 : options.dayOfWeekStart - 1;

                datetimepicker
                    .trigger('xchange.xdsoft')
                    .trigger('afterOpen.xdsoft');
            };

            datetimepicker
                .data('options', options)
                .on('mousedown.xdsoft', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    yearselect.hide();
                    monthselect.hide();
                    return false;
                });

            //scroll_element = timepicker.find('.xdsoft_time_box');
            timeboxparent.append(timebox);
            timeboxparent.xdsoftScroller();

            datetimepicker.on('afterOpen.xdsoft', function () {
                timeboxparent.xdsoftScroller();
            });

            datetimepicker
                .append(datepicker)
                .append(timepicker);

            if (options.withoutCopyright !== true) {
                datetimepicker
                    .append(xdsoft_copyright);
            }

            datepicker
                .append(mounth_picker)
                .append(calendar);

            $(options.parentID)
                .append(datetimepicker);

            XDSoft_datetime = function () {
                var _this = this;
                _this.now = function (norecursion) {
                    var d = new Date(),
                        date,
                        time;

                    if (!norecursion && options.defaultDate) {
                        date = _this.strToDate(options.defaultDate);
                        d.setFullYear(date.getFullYear());
                        d.setMonth(date.getMonth());
                        d.setDate(date.getDate());
                    }

                    if (options.yearOffset) {
                        d.setFullYear(d.getFullYear() + options.yearOffset);
                    }

                    if (!norecursion && options.defaultTime) {
                        time = _this.strtotime(options.defaultTime);
                        d.setHours(time.getHours());
                        d.setMinutes(time.getMinutes());
                    }

                    return d;
                };

                _this.isValidDate = function (d) {
                    if (Object.prototype.toString.call(d) !== "[object Date]") {
                        return false;
                    }
                    return !isNaN(d.getTime());
                };

                _this.setCurrentTime = function (dTime) {
                    _this.currentTime = (typeof dTime === 'string') ? _this.strToDateTime(dTime) : _this.isValidDate(dTime) ? dTime : _this.now();
                    datetimepicker.trigger('xchange.xdsoft');
                };

                _this.empty = function () {
                    _this.currentTime = null;
                };

                _this.getCurrentTime = function (dTime) {
                    return _this.currentTime;
                };

                _this.nextMonth = function () {
                    var month = _this.currentTime.getMonth() + 1,
                        year;
                    if (month === 12) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() + 1);
                        month = 0;
                    }

                    year = _this.currentTime.getFullYear();

                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);

                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    if (year !== _this.currentTime.getFullYear() && $.isFunction(options.onChangeYear)) {
                        options.onChangeYear.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }

                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.prevMonth = function () {
                    var month = _this.currentTime.getMonth() - 1;
                    if (month === -1) {
                        _this.currentTime.setFullYear(_this.currentTime.getFullYear() - 1);
                        month = 11;
                    }
                    _this.currentTime.setDate(
                        Math.min(
                            new Date(_this.currentTime.getFullYear(), month + 1, 0).getDate(),
                            _this.currentTime.getDate()
                        )
                    );
                    _this.currentTime.setMonth(month);
                    if (options.onChangeMonth && $.isFunction(options.onChangeMonth)) {
                        options.onChangeMonth.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    datetimepicker.trigger('xchange.xdsoft');
                    return month;
                };

                _this.getWeekOfYear = function (datetime) {
                    var onejan = new Date(datetime.getFullYear(), 0, 1);
                    return Math.ceil((((datetime - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                };

                _this.strToDateTime = function (sDateTime) {
                    var tmpDate = [], timeOffset, currentTime;

                    if (sDateTime && sDateTime instanceof Date && _this.isValidDate(sDateTime)) {
                        return sDateTime;
                    }

                    tmpDate = /^(\+|\-)(.*)$/.exec(sDateTime);
                    if (tmpDate) {
                        tmpDate[2] = Date.parseDate(tmpDate[2], options.formatDate);
                    }
                    if (tmpDate  && tmpDate[2]) {
                        timeOffset = tmpDate[2].getTime() - (tmpDate[2].getTimezoneOffset()) * 60000;
                        currentTime = new Date((_xdsoft_datetime.now()).getTime() + parseInt(tmpDate[1] + '1', 10) * timeOffset);
                    } else {
                        currentTime = sDateTime ? Date.parseDate(sDateTime, options.format) : _this.now();
                    }

                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now();
                    }

                    return currentTime;
                };

                _this.strToDate = function (sDate) {
                    if (sDate && sDate instanceof Date && _this.isValidDate(sDate)) {
                        return sDate;
                    }

                    var currentTime = sDate ? Date.parseDate(sDate, options.formatDate) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.strtotime = function (sTime) {
                    if (sTime && sTime instanceof Date && _this.isValidDate(sTime)) {
                        return sTime;
                    }
                    var currentTime = sTime ? Date.parseDate(sTime, options.formatTime) : _this.now(true);
                    if (!_this.isValidDate(currentTime)) {
                        currentTime = _this.now(true);
                    }
                    return currentTime;
                };

                _this.str = function () {
                    return _this.currentTime.dateFormat(options.format);
                };
                _this.currentTime = this.now();
            };

            _xdsoft_datetime = new XDSoft_datetime();

            mounth_picker
                .find('.xdsoft_today_button')
                .on('mousedown.xdsoft', function () {
                    datetimepicker.data('changed', true);
                    _xdsoft_datetime.setCurrentTime(0);
                    datetimepicker.trigger('afterOpen.xdsoft');
                }).on('dblclick.xdsoft', function () {
                    input.val(_xdsoft_datetime.str());
                    datetimepicker.trigger('close.xdsoft');
                });
            mounth_picker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false;

                    (function arguments_callee1(v) {
                        var month =  _xdsoft_datetime.currentTime.getMonth();
                        if ($this.hasClass(options.next)) {
                            _xdsoft_datetime.nextMonth();
                        } else if ($this.hasClass(options.prev)) {
                            _xdsoft_datetime.prevMonth();
                        }
                        if (options.monthChangeSpinner) {
                            if (!stop) {
                                timer = setTimeout(arguments_callee1, v || 100);
                            }
                        }
                    }(500));

                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee2() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window]).off('mouseup.xdsoft', arguments_callee2);
                    });
                });

            timepicker
                .find('.xdsoft_prev,.xdsoft_next')
                .on('mousedown.xdsoft', function () {
                    var $this = $(this),
                        timer = 0,
                        stop = false,
                        period = 110;
                    (function arguments_callee4(v) {
                        var pheight = timeboxparent[0].clientHeight,
                            height = timebox[0].offsetHeight,
                            top = Math.abs(parseInt(timebox.css('marginTop'), 10));
                        if ($this.hasClass(options.next) && (height - pheight) - options.timeHeightInTimePicker >= top) {
                            timebox.css('marginTop', '-' + (top + options.timeHeightInTimePicker) + 'px');
                        } else if ($this.hasClass(options.prev) && top - options.timeHeightInTimePicker >= 0) {
                            timebox.css('marginTop', '-' + (top - options.timeHeightInTimePicker) + 'px');
                        }
                        timeboxparent.trigger('scroll_element.xdsoft_scroller', [Math.abs(parseInt(timebox.css('marginTop'), 10) / (height - pheight))]);
                        period = (period > 10) ? 10 : period - 10;
                        if (!stop) {
                            timer = setTimeout(arguments_callee4, v || period);
                        }
                    }(500));
                    $([document.body, window]).on('mouseup.xdsoft', function arguments_callee5() {
                        clearTimeout(timer);
                        stop = true;
                        $([document.body, window])
                            .off('mouseup.xdsoft', arguments_callee5);
                    });
                });

            xchangeTimer = 0;
            // base handler - generating a calendar and timepicker
            datetimepicker
                .on('xchange.xdsoft', function (event) {
                    clearTimeout(xchangeTimer);
                    xchangeTimer = setTimeout(function () {
                        var table =	'',
                            start = new Date(_xdsoft_datetime.currentTime.getFullYear(), _xdsoft_datetime.currentTime.getMonth(), 1, 12, 0, 0),
                            i = 0,
                            j,
                            today = _xdsoft_datetime.now(),
                            maxDate = false,
                            minDate = false,
                            d,
                            y,
                            m,
                            w,
                            classes = [],
                            customDateSettings,
                            newRow = true,
                            time = '',
                            h = '',
                            line_time;

                        while (start.getDay() !== options.dayOfWeekStart) {
                            start.setDate(start.getDate() - 1);
                        }

                        table += '<table><thead><tr>';

                        if (options.weeks) {
                            table += '<th></th>';
                        }

                        for (j = 0; j < 7; j += 1) {
                            table += '<th>' + options.i18n[options.lang].dayOfWeek[(j + options.dayOfWeekStart) % 7] + '</th>';
                        }

                        table += '</tr></thead>';
                        table += '<tbody>';

                        if (options.maxDate !== false) {
                            maxDate = _xdsoft_datetime.strToDate(options.maxDate);
                            maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999);
                        }

                        if (options.minDate !== false) {
                            minDate = _xdsoft_datetime.strToDate(options.minDate);
                            minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                        }

                        while (i < _xdsoft_datetime.currentTime.countDaysInMonth() || start.getDay() !== options.dayOfWeekStart || _xdsoft_datetime.currentTime.getMonth() === start.getMonth()) {
                            classes = [];
                            i += 1;

                            d = start.getDate();
                            y = start.getFullYear();
                            m = start.getMonth();
                            w = _xdsoft_datetime.getWeekOfYear(start);

                            classes.push('xdsoft_date');

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay.call)) {
                                customDateSettings = options.beforeShowDay.call(datetimepicker, start);
                            } else {
                                customDateSettings = null;
                            }

                            if ((maxDate !== false && start > maxDate) || (minDate !== false && start < minDate) || (customDateSettings && customDateSettings[0] === false)) {
                                classes.push('xdsoft_disabled');
                            } else if (options.disabledDates.indexOf(start.dateFormat(options.formatDate)) !== -1) {
                                classes.push('xdsoft_disabled');
                            }

                            if (customDateSettings && customDateSettings[1] !== "") {
                                classes.push(customDateSettings[1]);
                            }

                            if (_xdsoft_datetime.currentTime.getMonth() !== m) {
                                classes.push('xdsoft_other_month');
                            }

                            if ((options.defaultSelect || datetimepicker.data('changed')) && _xdsoft_datetime.currentTime.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_current');
                            }

                            if (today.dateFormat(options.formatDate) === start.dateFormat(options.formatDate)) {
                                classes.push('xdsoft_today');
                            }

                            if (start.getDay() === 0 || start.getDay() === 6 || ~options.weekends.indexOf(start.dateFormat(options.formatDate))) {
                                classes.push('xdsoft_weekend');
                            }

                            if (options.beforeShowDay && $.isFunction(options.beforeShowDay)) {
                                classes.push(options.beforeShowDay(start));
                            }

                            if (newRow) {
                                table += '<tr>';
                                newRow = false;
                                if (options.weeks) {
                                    table += '<th>' + w + '</th>';
                                }
                            }

                            table += '<td data-date="' + d + '" data-month="' + m + '" data-year="' + y + '"' + ' class="xdsoft_date xdsoft_day_of_week' + start.getDay() + ' ' + classes.join(' ') + '">' +
                            '<div>' + d + '</div>' +
                            '</td>';

                            if (start.getDay() === options.dayOfWeekStartPrev) {
                                table += '</tr>';
                                newRow = true;
                            }

                            start.setDate(d + 1);
                        }
                        table += '</tbody></table>';

                        calendar.html(table);

                        mounth_picker.find('.xdsoft_label span').eq(0).text(options.i18n[options.lang].months[_xdsoft_datetime.currentTime.getMonth()]);
                        mounth_picker.find('.xdsoft_label span').eq(1).text(_xdsoft_datetime.currentTime.getFullYear());

                        // generate timebox
                        time = '';
                        h = '';
                        m = '';
                        line_time = function line_time(h, m) {
                            var now = _xdsoft_datetime.now();
                            now.setHours(h);
                            h = parseInt(now.getHours(), 10);
                            now.setMinutes(m);
                            m = parseInt(now.getMinutes(), 10);
                            var optionDateTime = new Date(_xdsoft_datetime.currentTime)
                            optionDateTime.setHours(h);
                            optionDateTime.setMinutes(m);
                            classes = [];
                            if((options.minDateTime !== false && options.minDateTime > optionDateTime) || (options.maxTime !== false && _xdsoft_datetime.strtotime(options.maxTime).getTime() < now.getTime()) || (options.minTime !== false && _xdsoft_datetime.strtotime(options.minTime).getTime() > now.getTime())) {
                                classes.push('xdsoft_disabled');
                            }
                            if ((options.initTime || options.defaultSelect || datetimepicker.data('changed')) && parseInt(_xdsoft_datetime.currentTime.getHours(), 10) === parseInt(h, 10) && (options.step > 59 || Math[options.roundTime](_xdsoft_datetime.currentTime.getMinutes() / options.step) * options.step === parseInt(m, 10))) {
                                if (options.defaultSelect || datetimepicker.data('changed')) {
                                    classes.push('xdsoft_current');
                                } else if (options.initTime) {
                                    classes.push('xdsoft_init_time');
                                }
                            }
                            if (parseInt(today.getHours(), 10) === parseInt(h, 10) && parseInt(today.getMinutes(), 10) === parseInt(m, 10)) {
                                classes.push('xdsoft_today');
                            }
                            time += '<div class="xdsoft_time ' + classes.join(' ') + '" data-hour="' + h + '" data-minute="' + m + '">' + now.dateFormat(options.formatTime) + '</div>';
                        };

                        if (!options.allowTimes || !$.isArray(options.allowTimes) || !options.allowTimes.length) {
                            for (i = 0, j = 0; i < (options.hours12 ? 12 : 24); i += 1) {
                                for (j = 0; j < 60; j += options.step) {
                                    h = (i < 10 ? '0' : '') + i;
                                    m = (j < 10 ? '0' : '') + j;
                                    line_time(h, m);
                                }
                            }
                        } else {
                            for (i = 0; i < options.allowTimes.length; i += 1) {
                                h = _xdsoft_datetime.strtotime(options.allowTimes[i]).getHours();
                                m = _xdsoft_datetime.strtotime(options.allowTimes[i]).getMinutes();
                                line_time(h, m);
                            }
                        }

                        timebox.html(time);

                        opt = '';
                        i = 0;

                        for (i = parseInt(options.yearStart, 10) + options.yearOffset; i <= parseInt(options.yearEnd, 10) + options.yearOffset; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getFullYear() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + i + '</div>';
                        }
                        yearselect.children().eq(0)
                            .html(opt);

                        for (i = 0, opt = ''; i <= 11; i += 1) {
                            opt += '<div class="xdsoft_option ' + (_xdsoft_datetime.currentTime.getMonth() === i ? 'xdsoft_current' : '') + '" data-value="' + i + '">' + options.i18n[options.lang].months[i] + '</div>';
                        }
                        monthselect.children().eq(0).html(opt);
                        $(datetimepicker)
                            .trigger('generate.xdsoft');
                    }, 10);
                    event.stopPropagation();
                })
                .on('afterOpen.xdsoft', function () {
                    if (options.timepicker) {
                        var classType, pheight, height, top;
                        if (timebox.find('.xdsoft_current').length) {
                            classType = '.xdsoft_current';
                        } else if (timebox.find('.xdsoft_init_time').length) {
                            classType = '.xdsoft_init_time';
                        }
                        if (classType) {
                            pheight = timeboxparent[0].clientHeight;
                            height = timebox[0].offsetHeight;
                            top = timebox.find(classType).index() * options.timeHeightInTimePicker + 1;
                            if ((height - pheight) < top) {
                                top = height - pheight;
                            }
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [parseInt(top, 10) / (height - pheight)]);
                        } else {
                            timeboxparent.trigger('scroll_element.xdsoft_scroller', [0]);
                        }
                    }
                });

            timerclick = 0;
            calendar
                .on('click.xdsoft', 'td', function (xdevent) {
                    xdevent.stopPropagation();  // Prevents closing of Pop-ups, Modals and Flyouts in Bootstrap
                    timerclick += 1;
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }

                    currentTime.setDate(1);
                    currentTime.setFullYear($this.data('year'));
                    currentTime.setMonth($this.data('month'));
                    currentTime.setDate($this.data('date'));

                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    input.val(_xdsoft_datetime.str());
                    if ((timerclick > 1 || (options.closeOnDateSelect === true || (options.closeOnDateSelect === 0 && !options.timepicker))) && !options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectDate &&	$.isFunction(options.onSelectDate)) {
                        options.onSelectDate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }

                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                    setTimeout(function () {
                        timerclick = 0;
                    }, 200);
                });

            timebox
                .on('click.xdsoft', 'div', function (xdevent) {
                    xdevent.stopPropagation();
                    var $this = $(this),
                        currentTime = _xdsoft_datetime.currentTime;

                    if (currentTime === undefined || currentTime === null) {
                        _xdsoft_datetime.currentTime = _xdsoft_datetime.now();
                        currentTime = _xdsoft_datetime.currentTime;
                    }

                    if ($this.hasClass('xdsoft_disabled')) {
                        return false;
                    }
                    currentTime.setHours($this.data('hour'));
                    currentTime.setMinutes($this.data('minute'));
                    datetimepicker.trigger('select.xdsoft', [currentTime]);

                    datetimepicker.data('input').val(_xdsoft_datetime.str());
                    if (!options.inline) {
                        datetimepicker.trigger('close.xdsoft');
                    }

                    if (options.onSelectTime && $.isFunction(options.onSelectTime)) {
                        options.onSelectTime.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), xdevent);
                    }
                    datetimepicker.data('changed', true);
                    datetimepicker.trigger('xchange.xdsoft');
                    datetimepicker.trigger('changedatetime.xdsoft');
                });


            datepicker
                .on('mousewheel.xdsoft', function (event) {
                    if (!options.scrollMonth) {
                        return true;
                    }
                    if (event.deltaY < 0) {
                        _xdsoft_datetime.nextMonth();
                    } else {
                        _xdsoft_datetime.prevMonth();
                    }
                    return false;
                });

            input
                .on('mousewheel.xdsoft', function (event) {
                    if (!options.scrollInput) {
                        return true;
                    }
                    if (!options.datepicker && options.timepicker) {
                        current_time_index = timebox.find('.xdsoft_current').length ? timebox.find('.xdsoft_current').eq(0).index() : 0;
                        if (current_time_index + event.deltaY >= 0 && current_time_index + event.deltaY < timebox.children().length) {
                            current_time_index += event.deltaY;
                        }
                        if (timebox.children().eq(current_time_index).length) {
                            timebox.children().eq(current_time_index).trigger('mousedown');
                        }
                        return false;
                    }
                    if (options.datepicker && !options.timepicker) {
                        datepicker.trigger(event, [event.deltaY, event.deltaX, event.deltaY]);
                        if (input.val) {
                            input.val(_xdsoft_datetime.str());
                        }
                        datetimepicker.trigger('changedatetime.xdsoft');
                        return false;
                    }
                });

            datetimepicker
                .on('changedatetime.xdsoft', function (event) {
                    if (options.onChangeDateTime && $.isFunction(options.onChangeDateTime)) {
                        var $input = datetimepicker.data('input');
                        options.onChangeDateTime.call(datetimepicker, _xdsoft_datetime.currentTime, $input, event);
                        delete options.value;
                        $input.trigger('change');
                    }
                })
                .on('generate.xdsoft', function () {
                    if (options.onGenerate && $.isFunction(options.onGenerate)) {
                        options.onGenerate.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'));
                    }
                    if (triggerAfterOpen) {
                        datetimepicker.trigger('afterOpen.xdsoft');
                        triggerAfterOpen = false;
                    }
                })
                .on('click.xdsoft', function (xdevent) {
                    xdevent.stopPropagation();
                });

            current_time_index = 0;

            setPos = function () {
                var offset = datetimepicker.data('input').offset(), top = offset.top + datetimepicker.data('input')[0].offsetHeight - 1, left = offset.left, position = "absolute";
                if (options.fixed) {
                    top -= $(window).scrollTop();
                    left -= $(window).scrollLeft();
                    position = "fixed";
                } else {
                    if (top + datetimepicker[0].offsetHeight > $(window).height() + $(window).scrollTop()) {
                        top = offset.top - datetimepicker[0].offsetHeight + 1;
                    }
                    if (top < 0) {
                        top = 0;
                    }
                    if (left + datetimepicker[0].offsetWidth > $(window).width()) {
                        left = $(window).width() - datetimepicker[0].offsetWidth;
                    }
                }
                datetimepicker.css({
                    left: left,
                    top: top,
                    position: position
                });
            };
            datetimepicker
                .on('open.xdsoft', function (event) {
                    var onShow = true;
                    if (options.onShow && $.isFunction(options.onShow)) {
                        onShow = options.onShow.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onShow !== false) {
                        datetimepicker.show();
                        setPos();
                        $(window)
                            .off('resize.xdsoft', setPos)
                            .on('resize.xdsoft', setPos);

                        if (options.closeOnWithoutClick) {
                            $([document.body, window]).on('mousedown.xdsoft', function arguments_callee6() {
                                datetimepicker.trigger('close.xdsoft');
                                $([document.body, window]).off('mousedown.xdsoft', arguments_callee6);
                            });
                        }
                    }
                })
                .on('close.xdsoft', function (event) {
                    var onClose = true;
                    mounth_picker
                        .find('.xdsoft_month,.xdsoft_year')
                        .find('.xdsoft_select')
                        .hide();
                    if (options.onClose && $.isFunction(options.onClose)) {
                        onClose = options.onClose.call(datetimepicker, _xdsoft_datetime.currentTime, datetimepicker.data('input'), event);
                    }
                    if (onClose !== false && !options.opened && !options.inline) {
                        datetimepicker.hide();
                    }
                    event.stopPropagation();
                })
                .on('toggle.xdsoft', function (event) {
                    if (datetimepicker.is(':visible')) {
                        datetimepicker.trigger('close.xdsoft');
                    } else {
                        datetimepicker.trigger('open.xdsoft');
                    }
                })
                .data('input', input);

            timer = 0;
            timer1 = 0;

            datetimepicker.data('xdsoft_datetime', _xdsoft_datetime);
            datetimepicker.setOptions(options);

            function getCurrentValue() {

                var ct = false, time;

                if (options.startDate) {
                    ct = _xdsoft_datetime.strToDate(options.startDate);
                } else {
                    ct = options.value || ((input && input.val && input.val()) ? input.val() : '');
                    if (ct) {
                        ct = _xdsoft_datetime.strToDateTime(ct);
                    } else if (options.defaultDate) {
                        ct = _xdsoft_datetime.strToDate(options.defaultDate);
                        if (options.defaultTime) {
                            time = _xdsoft_datetime.strtotime(options.defaultTime);
                            ct.setHours(time.getHours());
                            ct.setMinutes(time.getMinutes());
                        }
                    }
                }

                if (ct && _xdsoft_datetime.isValidDate(ct)) {
                    datetimepicker.data('changed', true);
                } else {
                    ct = '';
                }

                return ct || 0;
            }

            _xdsoft_datetime.setCurrentTime(getCurrentValue());

            input
                .data('xdsoft_datetimepicker', datetimepicker)
                .on('open.xdsoft focusin.xdsoft mousedown.xdsoft', function (event) {
                    if (input.is(':disabled') || (input.data('xdsoft_datetimepicker').is(':visible') && options.closeOnInputClick)) {
                        return;
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        if (input.is(':disabled')) {
                            return;
                        }

                        triggerAfterOpen = true;
                        _xdsoft_datetime.setCurrentTime(getCurrentValue());

                        datetimepicker.trigger('open.xdsoft');
                    }, 100);
                })
                .on('keydown.xdsoft', function (event) {
                    var val = this.value, elementSelector,
                        key = event.which;
                    if ([ENTER].indexOf(key) !== -1 && options.enterLikeTab) {
                        elementSelector = $("input:visible,textarea:visible");
                        datetimepicker.trigger('close.xdsoft');
                        elementSelector.eq(elementSelector.index(this) + 1).focus();
                        return false;
                    }
                    if ([TAB].indexOf(key) !== -1) {
                        datetimepicker.trigger('close.xdsoft');
                        return true;
                    }
                });
        };
        destroyDateTimePicker = function (input) {
            var datetimepicker = input.data('xdsoft_datetimepicker');
            if (datetimepicker) {
                datetimepicker.data('xdsoft_datetime', null);
                datetimepicker.remove();
                input
                    .data('xdsoft_datetimepicker', null)
                    .off('.xdsoft');
                $(window).off('resize.xdsoft');
                $([window, document.body]).off('mousedown.xdsoft');
                if (input.unmousewheel) {
                    input.unmousewheel();
                }
            }
        };
        $(document)
            .off('keydown.xdsoftctrl keyup.xdsoftctrl')
            .on('keydown.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = true;
                }
            })
            .on('keyup.xdsoftctrl', function (e) {
                if (e.keyCode === CTRLKEY) {
                    ctrlDown = false;
                }
            });
        return this.each(function () {
            var datetimepicker = $(this).data('xdsoft_datetimepicker');
            if (datetimepicker) {
                if ($.type(opt) === 'string') {
                    switch (opt) {
                        case 'show':
                            $(this).select().focus();
                            datetimepicker.trigger('open.xdsoft');
                            break;
                        case 'hide':
                            datetimepicker.trigger('close.xdsoft');
                            break;
                        case 'toggle':
                            datetimepicker.trigger('toggle.xdsoft');
                            break;
                        case 'destroy':
                            destroyDateTimePicker($(this));
                            break;
                        case 'reset':
                            this.value = this.defaultValue;
                            if (!this.value || !datetimepicker.data('xdsoft_datetime').isValidDate(Date.parseDate(this.value, options.format))) {
                                datetimepicker.data('changed', false);
                            }
                            datetimepicker.data('xdsoft_datetime').setCurrentTime(this.value);
                            break;
                    }
                } else {
                    datetimepicker
                        .setOptions(opt);
                }
                return 0;
            }
            if ($.type(opt) !== 'string') {
                if (!options.lazyInit || options.open || options.inline) {
                    createDateTimePicker($(this));
                } else {
                    lazyInit($(this));
                }
            }
        });
    };
    $.fn.datetimepicker.defaults = default_options;
}(jQuery));
(function () {
    /*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
     * Licensed under the MIT License (LICENSE.txt).
     *
     * Version: 3.1.12
     *
     * Requires: jQuery 1.2.2+
     */
    !function(a){"function"==typeof define&&define.amd?define(["jQuery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});

// Parse and Format Library
//http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/
    /*
     * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
     *
     * This program is free software; you can redistribute it and/or modify it
     * under the terms of the GNU Lesser General Public License as published by the
     * Free Software Foundation, version 2.1.
     *
     * This program is distributed in the hope that it will be useful, but WITHOUT
     * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
     * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
     * details.
     */
    Date.parseFunctions={count:0};Date.parseRegexes=[];Date.formatFunctions={count:0};Date.prototype.dateFormat=function(b){if(b=="unixtime"){return parseInt(this.getTime()/1000);}if(Date.formatFunctions[b]==null){Date.createNewFormat(b);}var a=Date.formatFunctions[b];return this[a]();};Date.createNewFormat=function(format){var funcName="format"+Date.formatFunctions.count++;Date.formatFunctions[format]=funcName;var code="Date.prototype."+funcName+" = function() {return ";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;code+="'"+String.escape(ch)+"' + ";}else{code+=Date.getFormatCode(ch);}}}eval(code.substring(0,code.length-3)+";}");};Date.getFormatCode=function(a){switch(a){case"d":return"String.leftPad(this.getDate(), 2, '0') + ";case"D":return"Date.dayNames[this.getDay()].substring(0, 3) + ";case"j":return"this.getDate() + ";case"l":return"Date.dayNames[this.getDay()] + ";case"S":return"this.getSuffix() + ";case"w":return"this.getDay() + ";case"z":return"this.getDayOfYear() + ";case"W":return"this.getWeekOfYear() + ";case"F":return"Date.monthNames[this.getMonth()] + ";case"m":return"String.leftPad(this.getMonth() + 1, 2, '0') + ";case"M":return"Date.monthNames[this.getMonth()].substring(0, 3) + ";case"n":return"(this.getMonth() + 1) + ";case"t":return"this.getDaysInMonth() + ";case"L":return"(this.isLeapYear() ? 1 : 0) + ";case"Y":return"this.getFullYear() + ";case"y":return"('' + this.getFullYear()).substring(2, 4) + ";case"a":return"(this.getHours() < 12 ? 'am' : 'pm') + ";case"A":return"(this.getHours() < 12 ? 'AM' : 'PM') + ";case"g":return"((this.getHours() %12) ? this.getHours() % 12 : 12) + ";case"G":return"this.getHours() + ";case"h":return"String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";case"H":return"String.leftPad(this.getHours(), 2, '0') + ";case"i":return"String.leftPad(this.getMinutes(), 2, '0') + ";case"s":return"String.leftPad(this.getSeconds(), 2, '0') + ";case"O":return"this.getGMTOffset() + ";case"T":return"this.getTimezone() + ";case"Z":return"(this.getTimezoneOffset() * -60) + ";default:return"'"+String.escape(a)+"' + ";}};Date.parseDate=function(a,c){if(c=="unixtime"){return new Date(!isNaN(parseInt(a))?parseInt(a)*1000:0);}if(Date.parseFunctions[c]==null){Date.createParser(c);}var b=Date.parseFunctions[c];return Date[b](a);};Date.createParser=function(format){var funcName="parse"+Date.parseFunctions.count++;var regexNum=Date.parseRegexes.length;var currentGroup=1;Date.parseFunctions[format]=funcName;var code="Date."+funcName+" = function(input) {\nvar y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, z = -1;\nvar d = new Date();\ny = d.getFullYear();\nm = d.getMonth();\nd = d.getDate();\nvar results = input.match(Date.parseRegexes["+regexNum+"]);\nif (results && results.length > 0) {";var regex="";var special=false;var ch="";for(var i=0;i<format.length;++i){ch=format.charAt(i);if(!special&&ch=="\\"){special=true;}else{if(special){special=false;regex+=String.escape(ch);}else{obj=Date.formatCodeToRegex(ch,currentGroup);currentGroup+=obj.g;regex+=obj.s;if(obj.g&&obj.c){code+=obj.c;}}}}code+="if (y > 0 && z > 0){\nvar doyDate = new Date(y,0);\ndoyDate.setDate(z);\nm = doyDate.getMonth();\nd = doyDate.getDate();\n}";code+="if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n{return new Date(y, m, d, h, i, s);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n{return new Date(y, m, d, h, i);}\nelse if (y > 0 && m >= 0 && d > 0 && h >= 0)\n{return new Date(y, m, d, h);}\nelse if (y > 0 && m >= 0 && d > 0)\n{return new Date(y, m, d);}\nelse if (y > 0 && m >= 0)\n{return new Date(y, m);}\nelse if (y > 0)\n{return new Date(y);}\n}return null;}";Date.parseRegexes[regexNum]=new RegExp("^"+regex+"$");eval(code);};Date.formatCodeToRegex=function(b,a){switch(b){case"D":return{g:0,c:null,s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"};case"j":case"d":return{g:1,c:"d = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"l":return{g:0,c:null,s:"(?:"+Date.dayNames.join("|")+")"};case"S":return{g:0,c:null,s:"(?:st|nd|rd|th)"};case"w":return{g:0,c:null,s:"\\d"};case"z":return{g:1,c:"z = parseInt(results["+a+"], 10);\n",s:"(\\d{1,3})"};case"W":return{g:0,c:null,s:"(?:\\d{2})"};case"F":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"].substring(0, 3)], 10);\n",s:"("+Date.monthNames.join("|")+")"};case"M":return{g:1,c:"m = parseInt(Date.monthNumbers[results["+a+"]], 10);\n",s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"};case"n":case"m":return{g:1,c:"m = parseInt(results["+a+"], 10) - 1;\n",s:"(\\d{1,2})"};case"t":return{g:0,c:null,s:"\\d{1,2}"};case"L":return{g:0,c:null,s:"(?:1|0)"};case"Y":return{g:1,c:"y = parseInt(results["+a+"], 10);\n",s:"(\\d{4})"};case"y":return{g:1,c:"var ty = parseInt(results["+a+"], 10);\ny = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",s:"(\\d{1,2})"};case"a":return{g:1,c:"if (results["+a+"] == 'am') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(am|pm)"};case"A":return{g:1,c:"if (results["+a+"] == 'AM') {\nif (h == 12) { h = 0; }\n} else { if (h < 12) { h += 12; }}",s:"(AM|PM)"};case"g":case"G":case"h":case"H":return{g:1,c:"h = parseInt(results["+a+"], 10);\n",s:"(\\d{1,2})"};case"i":return{g:1,c:"i = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"s":return{g:1,c:"s = parseInt(results["+a+"], 10);\n",s:"(\\d{2})"};case"O":return{g:0,c:null,s:"[+-]\\d{4}"};case"T":return{g:0,c:null,s:"[A-Z]{3}"};case"Z":return{g:0,c:null,s:"[+-]\\d{1,5}"};default:return{g:0,c:null,s:String.escape(b)};}};Date.prototype.getTimezone=function(){return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/,"$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/,"$1$2$3");};Date.prototype.getGMTOffset=function(){return(this.getTimezoneOffset()>0?"-":"+")+String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset())/60),2,"0")+String.leftPad(Math.abs(this.getTimezoneOffset())%60,2,"0");};Date.prototype.getDayOfYear=function(){var a=0;Date.daysInMonth[1]=this.isLeapYear()?29:28;for(var b=0;b<this.getMonth();++b){a+=Date.daysInMonth[b];}return a+this.getDate();};Date.prototype.getWeekOfYear=function(){var b=this.getDayOfYear()+(4-this.getDay());var a=new Date(this.getFullYear(),0,1);var c=(7-a.getDay()+4);return String.leftPad(Math.ceil((b-c)/7)+1,2,"0");};Date.prototype.isLeapYear=function(){var a=this.getFullYear();return((a&3)==0&&(a%100||(a%400==0&&a)));};Date.prototype.getFirstDayOfMonth=function(){var a=(this.getDay()-(this.getDate()-1))%7;return(a<0)?(a+7):a;};Date.prototype.getLastDayOfMonth=function(){var a=(this.getDay()+(Date.daysInMonth[this.getMonth()]-this.getDate()))%7;return(a<0)?(a+7):a;};Date.prototype.getDaysInMonth=function(){Date.daysInMonth[1]=this.isLeapYear()?29:28;return Date.daysInMonth[this.getMonth()];};Date.prototype.getSuffix=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};String.escape=function(a){return a.replace(/('|\\)/g,"\\$1");};String.leftPad=function(d,b,c){var a=new String(d);if(c==null){c=" ";}while(a.length<b){a=c+a;}return a;};Date.daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];Date.monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];Date.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];Date.y2kYear=50;Date.monthNumbers={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};Date.patterns={ISO8601LongPattern:"Y-m-d H:i:s",ISO8601ShortPattern:"Y-m-d",ShortDatePattern:"n/j/Y",LongDatePattern:"l, F d, Y",FullDateTimePattern:"l, F d, Y g:i:s A",MonthDayPattern:"F d",ShortTimePattern:"g:i A",LongTimePattern:"g:i:s A",SortableDateTimePattern:"Y-m-d\\TH:i:s",UniversalSortableDateTimePattern:"Y-m-d H:i:sO",YearMonthPattern:"F, Y"};
}());
})(n2);
;
(function (factory) {
    factory(n2);
}
(function ($) {
    "use strict";

    var pluginName = "tinyscrollbar", defaults =
        {
            axis: 'y'    // Vertical or horizontal scrollbar? ( x || y ).
            , wheel: true   // Enable or disable the mousewheel;
            , wheelSpeed: 40     // How many pixels must the mouswheel scroll at a time.
            , wheelLock: true   // Lock default scrolling window when there is no more content.
            , scrollInvert: false  // Enable invert style scrolling
            , trackSize: false  // Set the size of the scrollbar to auto or a fixed number.
            , thumbSize: false  // Set the size of the thumb to auto or a fixed number
        }
        ;

    function Plugin($container, options) {
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        var self = this, $viewport = $container.find(".viewport"), $overview = $container.find(".overview"), $scrollbar = $container.find(".scrollbar"), $track = $scrollbar.find(".track"), $thumb = $scrollbar.find(".thumb"), mousePosition = 0, isHorizontal = this.options.axis === 'x', hasTouchEvents = false, wheelEvent = ("onwheel" in document || document.documentMode >= 9) ? "wheel" :
                (document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"), sizeLabel = isHorizontal ? "width" : "height", posiLabel = isHorizontal ? (nextend.isRTL() ? "right" : "left") : "top"
            ;

        this.contentPosition = 0;
        this.viewportSize = 0;
        this.contentSize = 0;
        this.contentRatio = 0;
        this.trackSize = 0;
        this.trackRatio = 0;
        this.thumbSize = 0;
        this.thumbPosition = 0;

        function initialize() {
            self.update();
            setEvents();

            return self;
        }

        this.update = function (scrollTo) {
            var sizeLabelCap = sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1).toLowerCase();
            this.viewportSize = $viewport[0]['offset' + sizeLabelCap];
            this.contentSize = $overview.width();
            this.contentRatio = this.viewportSize / this.contentSize;
            this.trackSize = $scrollbar.parent().width() || this.viewportSize;
            this.thumbSize = Math.min(this.trackSize, Math.max(0, (this.options.thumbSize || (this.trackSize * this.contentRatio))));
            this.trackRatio = this.options.thumbSize ? (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize) : (this.contentSize / this.trackSize);
            mousePosition = $track.offset().top;

            $container.toggleClass("n2-scroll-disable", this.contentRatio >= 1);
            $scrollbar.toggleClass("disable", this.contentRatio >= 1);
            switch (scrollTo) {
                case "bottom":
                    this.contentPosition = this.contentSize - this.viewportSize;
                    break;

                case "relative":
                    this.contentPosition = Math.min(Math.max(this.contentSize - this.viewportSize, 0), Math.max(0, this.contentPosition));
                    break;

                default:
                    this.contentPosition = parseInt(scrollTo, 10) || 0;
            }

            setSize();

            $container.trigger('scrollUpdate');

            return self;
        };

        function setSize() {
            $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
            $overview.css(posiLabel, -self.contentPosition);
            $scrollbar.css(sizeLabel, self.trackSize);
            $track.css(sizeLabel, self.trackSize);
            $thumb.css(sizeLabel, self.thumbSize);
        }

        function setEvents() {
            if (hasTouchEvents) {
                $viewport[0].ontouchstart = function (event) {
                    if (1 === event.touches.length) {
                        event.stopPropagation();

                        start(event.touches[0]);
                    }
                };
            }
            else {
                $thumb.bind("mousedown", start);
                $track.bind("mousedown", drag);
            }

            $(window).resize(function () {
                self.update("relative");
            });

            if (self.options.wheel) {
                $container.on('mousewheel', wheel);
            }
        }

        function start(event) {
            $("body").addClass("noSelect");

            mousePosition = isHorizontal ? event.pageX : event.pageY;
            self.thumbPosition = parseInt($thumb.css(posiLabel), 10) || 0;

            if (hasTouchEvents) {
                document.ontouchmove = function (event) {
                    event.preventDefault();
                    drag(event.touches[0]);
                };
                document.ontouchend = end;
            }
            else {
                $(document).bind("mousemove", drag);
                $(document).bind("mouseup", end);
                $thumb.bind("mouseup", end);
            }
        }

        function wheel(event) {
            if (self.contentRatio < 1) {
                var evntObj = event,
                    deltaDir = "delta" + self.options.axis.toUpperCase(),
                    wheelSpeedDelta = evntObj.deltaY;

                self.contentPosition -= wheelSpeedDelta * self.options.wheelSpeed;
                self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));

                $container.trigger("move");

                $thumb.css(posiLabel, self.contentPosition / self.trackRatio);
                $overview.css(posiLabel, -self.contentPosition);

                if (self.options.wheelLock || (self.contentPosition !== (self.contentSize - self.viewportSize) && self.contentPosition !== 0)) {
                    evntObj = $.event.fix(evntObj);
                    evntObj.preventDefault();
                }
            }
        }
        this.wheel = wheel;

        function drag(event) {
            if (self.contentRatio < 1) {
                var mousePositionNew = isHorizontal ? event.pageX : event.pageY,
                    thumbPositionDelta = mousePositionNew - mousePosition;

                if (self.options.scrollInvert && hasTouchEvents) {
                    thumbPositionDelta = mousePosition - mousePositionNew;
                }

                if (nextend.isRTL()) {
                    thumbPositionDelta *= -1;
                }

                var thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta));
                self.contentPosition = thumbPositionNew * self.trackRatio;

                $container.trigger("move");

                $thumb.css(posiLabel, thumbPositionNew);
                $overview.css(posiLabel, -self.contentPosition);
            }
        }

        function end() {
            $("body").removeClass("noSelect");
            $(document).unbind("mousemove", drag);
            $(document).unbind("mouseup", end);
            $thumb.unbind("mouseup", end);
            document.ontouchmove = document.ontouchend = null;
        }

        return initialize();
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });
    };
}));

/**
 * jquery.unique-element-id.js
 *
 * A simple jQuery plugin to get a unique ID for
 * any HTML element
 *
 * Usage:
 *    $('some_element_selector').uid();
 *
 * by Jamie Rumbelow <jamie@jamierumbelow.net>
 * http://jamieonsoftware.com
 * Copyright (c)2011 Jamie Rumbelow
 *
 * Licensed under the MIT license (http://www.opensource.org/licenses/MIT)
 */

(function ($) {
    /**
     * Generate a new unqiue ID
     */
    function generateUniqueId() {

        // Return a unique ID
        return "n" + Math.floor((1 + Math.random()) * 0x1000000000000)
                .toString(16);
    }

    /**
     * Get a unique ID for an element, ensuring that the
     * element has an id="" attribute
     */
    $.fn.uid = function () {
        var id = null;
        do {
            id = generateUniqueId();
        } while ($('#' + id).length > 0)
        return id;
    };
})(n2);
(function (smartSlider, $, scope, undefined) {

    function NextendAdminSinglePane(tab, mainPane) {
        this.loadDefaults();

        this.topOffset = $('#wpadminbar, .navbar-fixed-top').height();

        this.tab = tab;
        this.mainPane = mainPane;
    }

    NextendAdminSinglePane.prototype.loadDefaults = function () {
        this.ratio = 1;
        this.excludedHeight = 0;
    };

    NextendAdminSinglePane.prototype.lateInit = function () {
        this.calibrate();

        $(window).on('resize', $.proxy(this.resize, this));
        $(window).one('load', $.proxy(this.calibrate, this));
    };

    NextendAdminSinglePane.prototype.calibrate = function () {
        this.excludedHeight = this.getExcludedHeight();
        this.resize();
    };

    NextendAdminSinglePane.prototype.getExcludedHeight = function () {
        return 0;
    };

    NextendAdminSinglePane.prototype.resize = function () {
        this.targetHeight = window.innerHeight - this.topOffset - this.excludedHeight;
        this.changeRatio(this.ratio);
    };

    NextendAdminSinglePane.prototype.changeRatio = function (ratio) {
        this.mainPane.height(this.targetHeight);
    };

    scope.NextendAdminSinglePane = NextendAdminSinglePane;

    function NextendAdminVerticalPane(tab, mainPane, bottomPane) {

        NextendAdminSinglePane.prototype.constructor.apply(this, arguments);

        if (this.key) {
            this.ratio = $.jStorage.get(this.key, this.ratio);
        }

        this.bottomPane = bottomPane;
    }

    NextendAdminVerticalPane.prototype = Object.create(NextendAdminSinglePane.prototype);
    NextendAdminVerticalPane.prototype.constructor = NextendAdminVerticalPane;

    NextendAdminVerticalPane.prototype.loadDefaults = function () {

        NextendAdminSinglePane.prototype.loadDefaults.apply(this, arguments);

        this.key = false;
        this.ratio = 0.5;
        this.originalRatio = 0.5;
    };

    NextendAdminVerticalPane.prototype.lateInit = function () {

        NextendAdminSinglePane.prototype.lateInit.apply(this, arguments);

        this.tab.find(".n2-sidebar-pane-sizer").draggable({
            axis: 'y',
            scroll: false,
            start: $.proxy(this.start, this),
            drag: $.proxy(this.drag, this)
        });
    };

    NextendAdminVerticalPane.prototype.start = function (event, ui) {
        this.originalRatio = this.ratio;
    };

    NextendAdminVerticalPane.prototype.drag = function (event, ui) {
        var ratio = this.originalRatio + ui.position.top / this.targetHeight;


        if (ratio < 0.1) {
            ratio = 0.1;
            ui.position.top = (ratio - this.originalRatio) * this.targetHeight;
        } else if (ratio > 0.9) {
            ratio = 0.9;
            ui.position.top = (ratio - this.originalRatio) * this.targetHeight;
        }

        this.changeRatio(ratio);

        ui.position.top = 0;
    };

    NextendAdminVerticalPane.prototype.changeRatio = function (ratio) {
        var h = parseInt(this.targetHeight * this.ratio);
        this.mainPane.height(h);
        this.bottomPane.height(this.targetHeight - h - 1);
        this.ratio = ratio;
        if (this.key) {
            $.jStorage.set(this.key, ratio);
        }
    };

    scope.NextendAdminVerticalPane = NextendAdminVerticalPane;

})(nextend.smartSlider, n2, window);