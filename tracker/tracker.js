//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

;
(function() {
    var _global = this;

    // Unique ID creation requires a high quality random # generator.  We feature
    // detect to determine the best RNG source, normalizing to a function that
    // returns 128-bits of randomness, since that's what's usually required
    var _rng;

    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if (typeof(require) == 'function') {
        try {
            var _rb = require('crypto').randomBytes;
            _rng = _rb && function() {
                return _rb(16);
            };
        } catch (e) {
        }
    }

    if (!_rng && _global.crypto && crypto.getRandomValues) {
        // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
        //
        // Moderately fast, high quality
        var _rnds8 = new Uint8Array(16);
        _rng = function whatwgRNG() {
            crypto.getRandomValues(_rnds8);
            return _rnds8;
        };
    }

    if (!_rng) {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        var _rnds = new Array(16);
        _rng = function() {
            for (var i = 0, r; i < 16; i++) {
                if ((i & 0x03) === 0)
                    r = Math.random() * 0x100000000;
                _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }

            return _rnds;
        };
    }

    // Buffer class to use
    var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

    // Maps for number <-> hex string conversion
    var _byteToHex = [];
    var _hexToByte = {};
    for (var i = 0; i < 256; i++) {
        _byteToHex[i] = (i + 0x100).toString(16).substr(1);
        _hexToByte[_byteToHex[i]] = i;
    }

    // **`parse()` - Parse a UUID into it's component bytes**
    function parse(s, buf, offset) {
        var i = (buf && offset) || 0, ii = 0;

        buf = buf || [];
        s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
            if (ii < 16) { // Don't overflow!
                buf[i + ii++] = _hexToByte[oct];
            }
        });

        // Zero out remaining bytes if string was short
        while (ii < 16) {
            buf[i + ii++] = 0;
        }

        return buf;
    }

    // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
    function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return  bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] + '-' +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]];
    }

    // **`v1()` - Generate time-based UUID**
    //
    // Inspired by https://github.com/LiosK/UUID.js
    // and http://docs.python.org/library/uuid.html

    // random #'s we need to init node and clockseq
    var _seedBytes = _rng();

    // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
    var _nodeId = [
        _seedBytes[0] | 0x01,
        _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
    ];

    // Per 4.2.2, randomize (14 bit) clockseq
    var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

    // Previous uuid creation time
    var _lastMSecs = 0, _lastNSecs = 0;

    // See https://github.com/broofa/node-uuid for API details
    function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];

        options = options || {};

        var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

        // UUID timestamps are 100 nano-second units since the Gregorian epoch,
        // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
        // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
        // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
        var msecs = options.msecs != null ? options.msecs : new Date().getTime();

        // Per 4.2.1.2, use count of uuid's generated during the current clock
        // cycle to simulate higher resolution clock
        var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

        // Time since last uuid creation (in msecs)
        var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;

        // Per 4.2.1.2, Bump clockseq on clock regression
        if (dt < 0 && options.clockseq == null) {
            clockseq = clockseq + 1 & 0x3fff;
        }

        // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
        // time interval
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
            nsecs = 0;
        }

        // Per 4.2.1.2 Throw error if too many uuids are requested
        if (nsecs >= 10000) {
            throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
        }

        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;

        // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
        msecs += 12219292800000;

        // `time_low`
        var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;

        // `time_mid`
        var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;

        // `time_high_and_version`
        b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
        b[i++] = tmh >>> 16 & 0xff;

        // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
        b[i++] = clockseq >>> 8 | 0x80;

        // `clock_seq_low`
        b[i++] = clockseq & 0xff;

        // `node`
        var node = options.node || _nodeId;
        for (var n = 0; n < 6; n++) {
            b[i + n] = node[n];
        }

        return buf ? buf : unparse(b);
    }

    // **`v4()` - Generate random UUID**

    // See https://github.com/broofa/node-uuid for API details
    function v4(options, buf, offset) {
        // Deprecated - 'format' argument, as supported in v1.2
        var i = buf && offset || 0;

        if (typeof(options) == 'string') {
            buf = options == 'binary' ? new BufferClass(16) : null;
            options = null;
        }
        options = options || {};

        var rnds = options.random || (options.rng || _rng)();

        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        rnds[6] = (rnds[6] & 0x0f) | 0x40;
        rnds[8] = (rnds[8] & 0x3f) | 0x80;

        // Copy bytes to buffer, if provided
        if (buf) {
            for (var ii = 0; ii < 16; ii++) {
                buf[i + ii] = rnds[ii];
            }
        }

        return buf || unparse(rnds);
    }

    // Export public API
    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    uuid.parse = parse;
    uuid.unparse = unparse;
    uuid.BufferClass = BufferClass;

    if (typeof define === 'function' && define.amd) {
        // Publish as AMD module
        define(function() {
            return uuid;
        });
    } else if (typeof(module) != 'undefined' && module.exports) {
        // Publish as node.js module
        module.exports = uuid;
    } else {
        // Publish as global (in browsers)
        var _previousRoot = _global.uuid;

        // **`noConflict()` - (browser only) to reset global 'uuid' var**
        uuid.noConflict = function() {
            _global.uuid = _previousRoot;
            return uuid;
        };

        _global.uuid = uuid;
    }
}).call(this);
;
(function insite() {
    var hostServer = '//www.gpcontent.com/insite/eventAPI',
            winheight = (typeof innerHeight === 'number') ? window.innerHeight : document.body.clientHeight,
            winwidth = (typeof innerWidth === 'number') ? window.innerWidth : document.body.clientWidth,
            userLog,
            cookieName = 'insiteId',
            exdays = 365,
            sourceFk = 1,
            categoryFk = 1,
            eventTypeFk = 2000000,
            eventSubTypeFk = 4,
            pageReferrer = document.referrer || "",
            cookieHash;

    var bakeCookie = (function(value) {
        var action = {};
        action.set = function(value) {
            var exdate = new Date(),
                    // the hidden cookie identifier element
                    insiteInput = document.getElementsByName('insite_id');


            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = cookieName + "=" + c_value + "; path=/";
            // if visitor comes to leadfrom page without previously being on an insite.js page, 
            // hidden form field value will be empty at form submit.  
            // this code adds insiteId UUID to input 'insite_id' on form submission page
            if (insiteInput.length > 0 && insiteInput[0].value === '') {
                insiteInput[0].value = cookieHash;
            }

        };

        action.get = function() {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x === cookieName) {
                    return unescape(y);
                }
            }
        };
        return action;
    }());

    function getXMLHttpRequest() { // cross browser http... Bam!

        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest;
        } else {
            try {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0");
            } catch (ex) {
                return null;
            }
        }
    }

    function send_params(obj, delimiter, str) {
        delimiter = delimiter || '';
        str = str || '';

        // used to turn object to string for POST or GET
        for (var k in obj) {
            str += delimiter + k + '=' + obj[k];
            delimiter = '&';
        }
        return str;
    }

    function get_data(params) {
        var http = getXMLHttpRequest();
        var datasend = send_params(params);

        if ('withCredentials' in http) { // for modern browser CORS support
            http.open("GET", hostServer + '?' + datasend, true);
            //Send the proper header information along with the request
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.setRequestHeader("Content-length", datasend.length);
            http.onreadystatechange = function() { //Call a function when the state changes.
                if (http.readyState === 4 && http.status === 200) {
                    //return http.responseText;
                    console.log('hello from the server');
                    return 'hello';
                }
            };
        } else if (typeof XDomainRequest !== 'undefined') { // for IE 8 & 9 CORS support

            http = new XDomainRequest();
            http.open("GET", hostServer + '?' + datasend);
        } else {
            http = null;

        }


        // sends the user info to the server.
        http.send();
    }

    function post_data(params) {
        var http = getXMLHttpRequest();
        var datasend = send_params(params);

        if ('withCredentials' in http) { // for modern browser CORS support
            http.open("POST", hostServer, true);
            //Send the proper header information along with the request
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.onreadystatechange = function() {//Call a function when the state changes.
                if (http.readyState === 4 && http.status === 200) {
                    console.log('xhr', http.responseText);
                }
            };
            // CORS for IE7/8
        } else if (typeof XDomainRequest !== 'undefined') {
            http = new XDomainRequest();
            http.open("GET", hostServer + '?' + datasend);
            http.onload = function() {
                console.log('xdr', http.responseText);

            };

        } else {
            http = null;
        }

        http.send(datasend);
    }

    // cookie check and setup.
    if (bakeCookie.get() === undefined) {
        cookieHash = uuid.v1();
        bakeCookie.set(cookieHash);
    } else {
        cookieHash = bakeCookie.get();
        bakeCookie.set(cookieHash);
    }

    // user tracking info, sent to the server on every page. 
    userLog = {
        "pageHref": window.location.href,
        "pageTitle": encodeURIComponent(document.getElementsByTagName('title')[0].innerHTML),
        "windowHeight": winheight,
        "windowWidth": winwidth,
        "screenDisplayHeight": screen.height,
        "screenDisplayWidth": screen.width,
        "cookieHash": cookieHash,
//        "sourceFk": sourceFk,
//        "categoryFk": categoryFk,
//        "eventTypeFk": eventTypeFk,
//        "eventSubTypeFk": eventSubTypeFk,
        "pageReferrer": pageReferrer
    };

    console.log(userLog);
    post_data(userLog);

    if (document.getElementById('notes') !== null) {
        var dataInsert = document.getElementById('notes'),
                data = get_data(userLog);
        console.log('return from server ' + data);
        dataInsert.values = data;
    }

}());