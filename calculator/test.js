/**
 *	Notes/Issues:
 *	-------------------------
 *	- jQuery is a dependency. 
 *		-> Version detection and testing (for site-hosted jQuery) for compatibility
 *	
 *	- Need to be able to swap widget styles on the fly for the Add To Site button
 *		-> Add/Remove classes from #gpWrap div
 *		-> Condense all images into a sprite sheet
 *	- Separate CSS into layout and theme-specific styles
 *		-> This is to maintain sanity while checking the swap theme functionality
 *	- Removed custom buttom from Add To Site options, due to extra work necessary to accomodate feature
 *		-> can be added later
 *	- IE issues
 *		-> IE7/8 do not load the Image for the patriot theme
 *		-> IE7-9 do not support window.performance.now(); find an alternate solution
 **/

var GPWIDGET = (function(window, undefined) {
    var jqReady = false, // status of jQuery detection, we use this to avoid loading another jQuery script
            cssReady = false,
            embedScriptCode = document.getElementById('gpEmbedScript').outerHTML,
            proto = document.location.protocol, // http: or https:
            exports = [], // data to be collected from publisher site/user, to be sent to the server
            urls = {// required widget files
        baseWidgetUrl: proto + '',
        jqueryCdnUrl: proto + '//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js',
        arcFlashCss: proto + 'arc-flash.css',
        arcFlashMain: proto + 'arc-flash.js'
    };

    // loads JavaScript files, executes callback when loaded
    function loadJs(scriptSrc, callback) {
        var scriptTag = document.createElement('script'),
                entry = document.getElementsByTagName('script')[0];
        scriptTag.src = scriptSrc;
        scriptTag.async = true;
        entry.parentNode.insertBefore(scriptTag, entry);

        // when script is ready, call the callback; onreadystatechange is IE-specific
        scriptTag.onload = scriptTag.onreadystatechange = function() {
            var rdyState = scriptTag.readyState;
            console.log('Loaded: ' + scriptTag.src);

            if (!rdyState || /complete|loaded/.test(scriptTag.readyState)) {
                callback();
                // kills memory leaks in IE
                scriptTag.onload = null;
                scriptTag.onreadystatechange = null;
            }
        };
    }

    // Create a <link> element, give it the required attributes and href, then add to page.
    function loadCss(cssHref, callback) {
        var cssLink = document.createElement('link'),
                entry = document.getElementsByTagName('script')[0];
        cssLink.type = "text/css";
        cssLink.rel = "stylesheet";
        cssLink.href = cssHref;
        entry.parentNode.insertBefore(cssLink, entry);
        console.log('Loaded: ' + cssLink.href);
        callback(cssHref);
    }


    // Creates a DOM element with an initial CSS property
    // Injected CSS overrides this property, 
    // which we can use as a hacky method to detect when a stylesheet has been loaded
    // *NOTE* - alternatively, a <style> element with the same CSS rules can be created and injected,
    // 			this may be 
    function isCssReady(cssHref, callback) {
        var testElem = document.createElement('span'),
                entry = document.getElementsByTagName('script')[0],
                node,
                count = 0,
                value = '';

        testElem.id = 'gp-css-ready';  	// make sure this element is present in the stylesheet 
        testElem.style.color = '#fff'; // and that this property is overriden by a unique color with a !important
        entry.parentNode.insertBefore(testElem, entry);
        console.log('#' + testElem.id + ' has been created');

        (function poll() {
            console.log('poll #' + (++count));
            node = document.getElementById('gp-css-ready');

            if (window.getComputedStyle) {
                value = document.defaultView.getComputedStyle(testElem, null).getPropertyValue('color');
            } else if (node.currentStyle) {	// IE-specific  
                value = node.currentStyle.color;
            }
            console.log('#' + testElem.id + ' = color: ' + value);
            if (value && value === 'rgb(254, 220, 186)' || value.toLowerCase() === '#fedcba') {
                console.log('Stylesheet ' + cssHref + ' has been detected');
                //callback();
                return cssReady = true;
            } else {
                setTimeout(poll, 10);
            }
            return;
        }());

    }

    function testForJquery(callback) {
        var initTest = true;  // 1st test for jQuery
        (function poll() {
            if ('jQuery' in window) { // does the page have jQuery?
                (initTest) ? console.log('jQuery is on the page!') : console.log('jQuery is ready!');
                initTest = false;
                callback();
                jqReady = true;
                return;
            } else {
                if (initTest) {
                    console.log('jQuery isn\'t available, so load it!');
                    loadJs(urls.jqueryCdnUrl, function() {
                        return;
                    });
                    initTest = false;
                }
                console.log('wait for jQuery');
                setTimeout(poll, 10);
            }
        }());
    }

    return {
        getUrl: urls,
        getCssState: function() {
            console.log(cssReady);
        },
        getJqState: function() {
            console.log(jqReady)
        },
        init: function() {
            console.log('GPWIDGET initialize');
            testForJquery(GPWIDGET.start);
        },
        start: function() {
            console.log('GPWIDGET start');
            loadCss(urls.arcFlashCss, isCssReady);
            loadJs(urls.arcFlashMain, function() {

            });
        },
        test: function() {
            console.log(this.getJqState);
            console.log(this.getCssState);
        },
        embedCode: function() {
            return embedScriptCode;
        },
        addToExports: function(data) {
            exports.push(data);
        },
        logExports: function() {
            console.log(exports);
        }
    };

})(window);

GPWIDGET.init();
