/*!
 * Detectizr v2.1.0
 * http://barisaydinoglu.github.com/Detectizr/
 *
 * Written by Baris Aydinoglu (http://baris.aydinoglu.info) - Copyright 2012
 * Released under the MIT license
 *
 * Date: 2015-01-03
 */
window.Detectizr = (function(window, navigator, document, undefined) {
	var Detectizr = {},
		Modernizr = window.Modernizr,
		deviceTypes = ["tv", "tablet", "mobile", "desktop"],
		options = {
			// option for enabling HTML classes of all features (not only the true features) to be added
			addAllFeaturesAsClass: false,
			// option for enabling detection of device
			detectDevice: true,
			// option for enabling detection of device model
			detectDeviceModel: true,
			// option for enabling detection of screen size
			detectScreen: true,
			// option for enabling detection of operating system type and version
			detectOS: true,
			// option for enabling detection of browser type and version
			detectBrowser: true,
			// option for enabling detection of common browser plugins
			detectPlugins: true
		},
		plugins2detect = [{
			name: "adobereader",
			substrs: ["Adobe", "Acrobat"],
			// AcroPDF.PDF is used by version 7 and later
			// PDF.PdfCtrl is used by version 6 and earlier
			progIds: ["AcroPDF.PDF", "PDF.PDFCtrl.5"]
		}, {
			name: "flash",
			substrs: ["Shockwave Flash"],
			progIds: ["ShockwaveFlash.ShockwaveFlash.1"]
		}, {
			name: "wmplayer",
			substrs: ["Windows Media"],
			progIds: ["wmplayer.ocx"]
		}, {
			name: "silverlight",
			substrs: ["Silverlight"],
			progIds: ["AgControl.AgControl"]
		}, {
			name: "quicktime",
			substrs: ["QuickTime"],
			progIds: ["QuickTime.QuickTime"]
		}],
		rclass = /[\t\r\n]/g,
		docElement = document.documentElement,
		resizeTimeoutId,
		oldOrientation;

	// Create Global "extend" method, so Detectizr does not need jQuery.extend
	function extend(obj, extObj) {
		var a, b, i;
		if (arguments.length > 2) {
			for (a = 1, b = arguments.length; a < b; a += 1) {
				extend(obj, arguments[a]);
			}
		} else {
			for (i in extObj) {
				if (extObj.hasOwnProperty(i)) {
					obj[i] = extObj[i];
				}
			}
		}
		return obj;
	}

	// simplified and localized indexOf method as one parameter fixed as useragent
	function is(key) {
		return Detectizr.browser.userAgent.indexOf(key) > -1;
	}

	// simplified and localized regex test method as one parameter fixed as useragent
	function test(regex) {
		return regex.test(Detectizr.browser.userAgent);
	}

	// simplified and localized regex exec method as one parameter fixed as useragent
	function exec(regex) {
		return regex.exec(Detectizr.browser.userAgent);
	}

	// localized string trim method
	function trim(value) {
		return value.replace(/^\s+|\s+$/g, "");
	}

	// convert string to camelcase
	function toCamel(string) {
		if (string === null || string === undefined) {
			return "";
		}
		return String(string).replace(/((\s|\-|\.)+[a-z0-9])/g, function($1) {
			return $1.toUpperCase().replace(/(\s|\-|\.)/g, "");
		});
	}

	// removeClass function inspired from jQuery.removeClass
	function removeClass(element, value) {
		var class2remove = value || "",
			cur = element.nodeType === 1 && (element.className ? (" " + element.className + " ").replace(rclass, " ") : "");
		if (cur) {
			while (cur.indexOf(" " + class2remove + " ") >= 0) {
				cur = cur.replace(" " + class2remove + " ", " ");
			}
			element.className = value ? trim(cur) : "";
		}
	}

	// add version test to Modernizr
	function addVersionTest(version, major, minor) {
		if (!!version) {
			version = toCamel(version);
			if (!!major) {
				major = toCamel(major);
				addConditionalTest(version + major, true);
				if (!!minor) {
					addConditionalTest(version + major + "_" + minor, true);
				}
			}
		}
	}

	// add test to Modernizr based on a condition
	function addConditionalTest(feature, test) {
		if (!!feature && !!Modernizr) {
			if (options.addAllFeaturesAsClass) {
				Modernizr.addTest(feature, test);
			} else {
				test = typeof test === "function" ? test() : test;
				if (test) {
					Modernizr.addTest(feature, true);
				} else {
					delete Modernizr[feature];
					removeClass(docElement, feature);
				}
			}
		}
	}

	// set version based on versionFull
	function setVersion(versionType, versionFull) {
		versionType.version = versionFull;
		var versionArray = versionFull.split(".");
		if (versionArray.length > 0) {
			versionArray = versionArray.reverse();
			versionType.major = versionArray.pop();
			if (versionArray.length > 0) {
				versionType.minor = versionArray.pop();
				if (versionArray.length > 0) {
					versionArray = versionArray.reverse();
					versionType.patch = versionArray.join(".");
				} else {
					versionType.patch = "0";
				}
			} else {
				versionType.minor = "0";
			}
		} else {
			versionType.major = "0";
		}
	}

	function checkOrientation() {
		//timeout wrapper points with doResizeCode as callback
		window.clearTimeout(resizeTimeoutId);
		resizeTimeoutId = window.setTimeout(function() {
			oldOrientation = Detectizr.device.orientation;
			//wrapper for height/width check
			if (window.innerHeight > window.innerWidth) {
				Detectizr.device.orientation = "portrait";
			} else {
				Detectizr.device.orientation = "landscape";
			}
			addConditionalTest(Detectizr.device.orientation, true);
			if (oldOrientation !== Detectizr.device.orientation) {
				addConditionalTest(oldOrientation, false);
			}
		}, 10);
	}

	function detectPlugin(substrs) {
		var plugins = navigator.plugins,
			plugin, haystack, pluginFoundText, j, k;
		for (j = plugins.length - 1; j >= 0; j--) {
			plugin = plugins[j];
			haystack = plugin.name + plugin.description;
			pluginFoundText = 0;
			for (k = substrs.length; k >= 0; k--) {
				if (haystack.indexOf(substrs[k]) !== -1) {
					pluginFoundText += 1;
				}
			}
			if (pluginFoundText === substrs.length) {
				return true;
			}
		}
		return false;
	}

	function detectObject(progIds) {
		var j;
		for (j = progIds.length - 1; j >= 0; j--) {
			try {
				new ActiveXObject(progIds[j]);
			} catch (e) {
				// Ignore
			}
		}
		return false;
	}

	function detect(opt) {
		var i, j, device, os, browser, plugin2detect, pluginFound;

		options = extend({}, options, opt || {});

		/** Device detection **/
		if (options.detectDevice) {
			Detectizr.device = {
				type: "",
				model: "",
				orientation: ""
			};
			device = Detectizr.device;
			if (test(/googletv|smarttv|smart-tv|internet.tv|netcast|nettv|appletv|boxee|kylo|roku|dlnadoc|roku|pov_tv|hbbtv|ce\-html/)) {
				// Check if user agent is a smart tv
				device.type = deviceTypes[0];
				device.model = "smartTv";
			} else if (test(/xbox|playstation.3|wii/)) {
				// Check if user agent is a game console
				device.type = deviceTypes[0];
				device.model = "gameConsole";
			} else if (test(/ip(a|ro)d/)) {
				// Check if user agent is a iPad
				device.type = deviceTypes[1];
				device.model = "ipad";
			} else if ((test(/tablet/) && !test(/rx-34/)) || test(/folio/)) {
				// Check if user agent is a Tablet
				device.type = deviceTypes[1];
				device.model = String(exec(/playbook/) || "");
			} else if (test(/linux/) && test(/android/) && !test(/fennec|mobi|htc.magic|htcX06ht|nexus.one|sc-02b|fone.945/)) {
				// Check if user agent is an Android Tablet
				device.type = deviceTypes[1];
				device.model = "android";
			} else if (test(/kindle/) || (test(/mac.os/) && test(/silk/))) {
				// Check if user agent is a Kindle or Kindle Fire
				device.type = deviceTypes[1];
				device.model = "kindle";
			} else if (test(/gt-p10|sc-01c|shw-m180s|sgh-t849|sch-i800|shw-m180l|sph-p100|sgh-i987|zt180|htc(.flyer|\_flyer)|sprint.atp51|viewpad7|pandigital(sprnova|nova)|ideos.s7|dell.streak.7|advent.vega|a101it|a70bht|mid7015|next2|nook/) || (test(/mb511/) && test(/rutem/))) {
				// Check if user agent is a pre Android 3.0 Tablet
				device.type = deviceTypes[1];
				device.model = "android";
			} else if (test(/bb10/)) {
				// Check if user agent is a BB10 device
				device.type = deviceTypes[1];
				device.model = "blackberry";
			} else {
				// Check if user agent is one of common mobile types
				device.model = exec(/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec|j2me/);
				if (device.model !== null) {
					device.type = deviceTypes[2];
					device.model = String(device.model);
				} else {
					device.model = "";
					if (test(/bolt|fennec|iris|maemo|minimo|mobi|mowser|netfront|novarra|prism|rx-34|skyfire|tear|xv6875|xv6975|google.wireless.transcoder/)) {
						// Check if user agent is unique Mobile User Agent
						device.type = deviceTypes[2];
					} else if (test(/opera/) && test(/windows.nt.5/) && test(/htc|xda|mini|vario|samsung\-gt\-i8000|samsung\-sgh\-i9/)) {
						// Check if user agent is an odd Opera User Agent - http://goo.gl/nK90K
						device.type = deviceTypes[2];
					} else if ((test(/windows.(nt|xp|me|9)/) && !test(/phone/)) || test(/win(9|.9|nt)/) || test(/\(windows 8\)/)) {
						// Check if user agent is Windows Desktop, "(Windows 8)" Chrome extra exception
						device.type = deviceTypes[3];
					} else if (test(/macintosh|powerpc/) && !test(/silk/)) {
						// Check if agent is Mac Desktop
						device.type = deviceTypes[3];
						device.model = "mac";
					} else if (test(/linux/) && test(/x11/)) {
						// Check if user agent is a Linux Desktop
						device.type = deviceTypes[3];
					} else if (test(/solaris|sunos|bsd/)) {
						// Check if user agent is a Solaris, SunOS, BSD Desktop
						device.type = deviceTypes[3];
					} else if (test(/cros/)) {
						// Check if user agent is a Chromebook
						device.type = deviceTypes[3];
					} else if (test(/bot|crawler|spider|yahoo|ia_archiver|covario-ids|findlinks|dataparksearch|larbin|mediapartners-google|ng-search|snappy|teoma|jeeves|tineye/) && !test(/mobile/)) {
						// Check if user agent is a Desktop BOT/Crawler/Spider
						device.type = deviceTypes[3];
						device.model = "crawler";
					} else {
						// Otherwise assume it is a Mobile Device
						device.type = deviceTypes[2];
					}
				}
			}
			for (i = 0, j = deviceTypes.length; i < j; i += 1) {
				addConditionalTest(deviceTypes[i], (device.type === deviceTypes[i]));
			}
			if (options.detectDeviceModel) {
				addConditionalTest(toCamel(device.model), true);
			}
		}

		/** Screen detection **/
		if (options.detectScreen) {
			device.screen = {};
			if (!!Modernizr && !!Modernizr.mq) {
				if (Modernizr.mq("only screen and (max-width: 240px)")) {
					device.screen.size = "veryVerySmall";
					addConditionalTest("veryVerySmallScreen", true);
				} else if (Modernizr.mq("only screen and (max-width: 320px)")) {
					device.screen.size = "verySmall";
					addConditionalTest("verySmallScreen", true);
				} else if (Modernizr.mq("only screen and (max-width: 480px)")) {
					device.screen.size = "small";
					addConditionalTest("smallScreen", true);
				}
				if (device.type === deviceTypes[1] || device.type === deviceTypes[2]) {
					if (Modernizr.mq("only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)")) {
						device.screen.resolution = "high";
						addConditionalTest("highresolution", true);
					}
				}
			}
			if (device.type === deviceTypes[1] || device.type === deviceTypes[2]) {
				window.onresize = function(event) {
					checkOrientation(event);
				};
				checkOrientation();
			} else {
				device.orientation = "landscape";
				addConditionalTest(device.orientation, true);
			}
		}

		/** OS detection **/
		if (options.detectOS) {
			Detectizr.os = {};
			os = Detectizr.os;
			if (device.model !== "") {
				if (device.model === "ipad" || device.model === "iphone" || device.model === "ipod") {
					os.name = "ios";
					setVersion(os, (test(/os\s([\d_]+)/) ? RegExp.$1 : "").replace(/_/g, "."));
				} else if (device.model === "android") {
					os.name = "android";
					setVersion(os, (test(/android\s([\d\.]+)/) ? RegExp.$1 : ""));
				} else if (device.model === "blackberry") {
					os.name = "blackberry";
					setVersion(os, (test(/version\/([^\s]+)/) ? RegExp.$1 : ""));
				} else if (device.model === "playbook") {
					os.name = "blackberry";
					setVersion(os, (test(/os ([^\s]+)/) ? RegExp.$1.replace(";", "") : ""));
				}
			}
			if (!os.name) {
				if (is("win") || is("16bit")) {
					os.name = "windows";
					if (is("windows nt 6.3")) {
						setVersion(os, "8.1");
					} else if (is("windows nt 6.2") || test(/\(windows 8\)/)) { //windows 8 chrome mac fix
						setVersion(os, "8");
					} else if (is("windows nt 6.1")) {
						setVersion(os, "7");
					} else if (is("windows nt 6.0")) {
						setVersion(os, "vista");
					} else if (is("windows nt 5.2") || is("windows nt 5.1") || is("windows xp")) {
						setVersion(os, "xp");
					} else if (is("windows nt 5.0") || is("windows 2000")) {
						setVersion(os, "2k");
					} else if (is("winnt") || is("windows nt")) {
						setVersion(os, "nt");
					} else if (is("win98") || is("windows 98")) {
						setVersion(os, "98");
					} else if (is("win95") || is("windows 95")) {
						setVersion(os, "95");
					}
				} else if (is("mac") || is("darwin")) {
					os.name = "mac os";
					if (is("68k") || is("68000")) {
						setVersion(os, "68k");
					} else if (is("ppc") || is("powerpc")) {
						setVersion(os, "ppc");
					} else if (is("os x")) {
						setVersion(os, (test(/os\sx\s([\d_]+)/) ? RegExp.$1 : "os x").replace(/_/g, "."));
					}
				} else if (is("webtv")) {
					os.name = "webtv";
				} else if (is("x11") || is("inux")) {
					os.name = "linux";
				} else if (is("sunos")) {
					os.name = "sun";
				} else if (is("irix")) {
					os.name = "irix";
				} else if (is("freebsd")) {
					os.name = "freebsd";
				} else if (is("bsd")) {
					os.name = "bsd";
				}
			}
			if (!!os.name) {
				addConditionalTest(os.name, true);
				if (!!os.major) {
					addVersionTest(os.name, os.major);
					if (!!os.minor) {
						addVersionTest(os.name, os.major, os.minor);
					}
				}
			}
			if (test(/\sx64|\sx86|\swin64|\swow64|\samd64/)) {
				os.addressRegisterSize = "64bit";
			} else {
				os.addressRegisterSize = "32bit";
			}
			addConditionalTest(os.addressRegisterSize, true);
		}

		/** Browser detection **/
		if (options.detectBrowser) {
			browser = Detectizr.browser;
			if (!test(/opera|webtv/) && (test(/msie\s([\d\w\.]+)/) || is("trident"))) {
				browser.engine = "trident";
				browser.name = "ie";
				if (!window.addEventListener && document.documentMode && document.documentMode === 7) {
					setVersion(browser, "8.compat");
				} else if (test(/trident.*rv[ :](\d+)\./)) {
					setVersion(browser, RegExp.$1);
				} else {
					setVersion(browser, (test(/trident\/4\.0/) ? "8" : RegExp.$1));
				}
			} else if (is("firefox")) {
				browser.engine = "gecko";
				browser.name = "firefox";
				setVersion(browser, (test(/firefox\/([\d\w\.]+)/) ? RegExp.$1 : ""));
			} else if (is("gecko/")) {
				browser.engine = "gecko";
			} else if (is("opera")) {
				browser.name = "opera";
				browser.engine = "presto";
				setVersion(browser, (test(/version\/([\d\.]+)/) ? RegExp.$1 : (test(/opera(\s|\/)([\d\.]+)/) ? RegExp.$2 : "")));
			} else if (is("konqueror")) {
				browser.name = "konqueror";
			} else if (is("chrome")) {
				browser.engine = "webkit";
				browser.name = "chrome";
				setVersion(browser, (test(/chrome\/([\d\.]+)/) ? RegExp.$1 : ""));
			} else if (is("iron")) {
				browser.engine = "webkit";
				browser.name = "iron";
			} else if (is("crios")) {
				browser.name = "chrome";
				browser.engine = "webkit";
				setVersion(browser, (test(/crios\/([\d\.]+)/) ? RegExp.$1 : ""));
			} else if (is("applewebkit/")) {
				browser.name = "safari";
				browser.engine = "webkit";
				setVersion(browser, (test(/version\/([\d\.]+)/) ? RegExp.$1 : ""));
			} else if (is("mozilla/")) {
				browser.engine = "gecko";
			}
			if (!!browser.name) {
				addConditionalTest(browser.name, true);
				if (!!browser.major) {
					addVersionTest(browser.name, browser.major);
					if (!!browser.minor) {
						addVersionTest(browser.name, browser.major, browser.minor);
					}
				}
			}
			addConditionalTest(browser.engine, true);

			// Browser Language
			browser.language = navigator.userLanguage || navigator.language;
			addConditionalTest(browser.language, true);
		}

		/** Plugin detection **/
		if (options.detectPlugins) {
			browser.plugins = [];
			for (i = plugins2detect.length - 1; i >= 0; i--) {
				plugin2detect = plugins2detect[i];
				pluginFound = false;
				if (window.ActiveXObject) {
					pluginFound = detectObject(plugin2detect.progIds);
				} else if (navigator.plugins) {
					pluginFound = detectPlugin(plugin2detect.substrs);
				}
				if (pluginFound) {
					browser.plugins.push(plugin2detect.name);
					addConditionalTest(plugin2detect.name, true);
				}
			}
			if (navigator.javaEnabled()) {
				browser.plugins.push("java");
				addConditionalTest("java", true);
			}
		}
	}
	Detectizr.detect = function(settings) {
		return detect(settings);
	};
	Detectizr.init = function() {
		if (Detectizr !== undefined) {
			Detectizr.browser = {
				userAgent: (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
			};
			Detectizr.detect();
		}
	};
	Detectizr.init();

	return Detectizr;
}(this, this.navigator, this.document));

/*!
 * jQuery JavaScript Library v1.11.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:19Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var deletedIds = [];

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.11.3",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( support.ownLast ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.unique( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !(--remaining) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed, false );
		window.removeEventListener( "load", completed, false );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};


var strundefined = typeof undefined;



// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownLast = i !== "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery(function() {
	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {
		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== strundefined ) {
		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {
			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
});




(function() {
	var div = document.createElement( "div" );

	// Execute the test only if not already executed in another module.
	if (support.deleteExpando == null) {
		// Support: IE<9
		support.deleteExpando = true;
		try {
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
})();


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( elem ) {
	var noData = jQuery.noData[ (elem.nodeName + " ").toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute("classid") === noData;
};


var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,
		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[0],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each(function() {
				jQuery.data( this, key, value );
			}) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};



// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[0], key ) : emptyGet;
};
var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	// Minified: var a,b,c
	var input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		fragment = document.createDocumentFragment();

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );
	div.innerHTML = "<input type='radio' checked='checked' name='t'/>";

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	support.noCloneEvent = true;
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Execute the test only if not already executed in another module.
	if (support.deleteExpando == null) {
		// Support: IE<9
		support.deleteExpando = true;
		try {
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
	}
})();


(function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)
	for ( i in { submit: true, change: true, focusin: true }) {
		eventName = "on" + i;

		if ( !(support[ i + "Bubbles" ] = eventName in window) ) {
			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i + "Bubbles" ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
})();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!support.noCloneEvent || !support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = (rtagName.exec( elem ) || [ "", "" ])[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ (rtagName.exec( value ) || [ "", "" ])[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[i], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optmization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}


(function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {
			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== strundefined ) {
			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =
				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

})();
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );



var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			var condition = conditionFn();

			if ( condition == null ) {
				// The test was not ready at this point; screw the hook this time
				// but check again when needed next time.
				return;
			}

			if ( condition ) {
				// Hook not needed (or it's not possible to use it due to missing dependency),
				// remove it.
				// Since there are no other hooks for marginRight, remove the whole object.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.

			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	// Minified: var b,c,d,e,f,g, h,i
	var div, style, a, pixelPositionVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal;

	// Setup
	div = document.createElement( "div" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];
	style = a && a.style;

	// Finish early in limited (non-browser) environments
	if ( !style ) {
		return;
	}

	style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = style.boxSizing === "" || style.MozBoxSizing === "" ||
		style.WebkitBoxSizing === "";

	jQuery.extend(support, {
		reliableHiddenOffsets: function() {
			if ( reliableHiddenOffsetsVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {
			if ( boxSizingReliableVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		// Support: Android 2.3
		reliableMarginRight: function() {
			if ( reliableMarginRightVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		}
	});

	function computeStyleTests() {
		// Minified: var b,c,d,j
		var div, body, container, contents;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {
			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = false;
		reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			pixelPositionVal = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			boxSizingReliableVal =
				( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Support: Android 2.3
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =
				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents, null ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		contents = div.getElementsByTagName( "td" );
		contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
		reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
		if ( reliableHiddenOffsetsVal ) {
			contents[ 0 ].style.display = "";
			contents[ 1 ].style.display = "none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
		}

		body.removeChild( container );
	}

})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,

	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	// Minified: var a,b,c,d,e
	var input, div, select, a, opt;

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName("a")[ 0 ];

	// First batch of tests.
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute("style") );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute("href") === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement("form").enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
})();


var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) >= 0 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;
					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// Retrieve booleans specially
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {

	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
		function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		} :
		function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return (ret = elem.getAttributeNode( name )) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	});
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						-1;
			}
		}
	}
});

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {
	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

// Support: Safari, IE9+
// mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {
	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {
		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	}) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
		(!support.reliableHiddenOffsets() &&
			((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?
	// Support: IE6+
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		return !this.isLocal &&

			// Support: IE7-8
			// oldIE XHR does not support non-RFC2616 methods (#13240)
			// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
			// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
			// Although this check for six methods instead of eight
			// since IE also does not support "trace" and "connect"
			/^(get|post|head|put|delete|options)$/i.test( this.type ) &&

			createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	});
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( options ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open( options.type, options.url, options.async, options.username, options.password );

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch( e ) {
									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;
								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					if ( !options.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};





var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray("auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

function generateCode() {
    codeContainer.textContent = source.innerHTML
}

function generateFile() {
    var t = "data:image/svg+xml;utf8," + encodeURIComponent(source.innerHTML);
    downloadButton.setAttribute("href", t)
}

function getAngle(t) {
    "semiCircle" == typeOfCircle && gaps === !1 ? angle = 180 / t : "fullCircle" == typeOfCircle && gaps === !1 && (angle = 360 / t), "semiCircle" == typeOfCircle && gaps === !0 ? angle = 180 / t - 180 / t / gap : "fullCircle" == typeOfCircle && gaps === !0 && (angle = 360 / t - 360 / t / gap)
}

function getPizzaCoordinates(t, e, i) {
    var n = i.x,
        r = i.y,
        s = -t * Math.PI / 180,
        a = n + e * Math.cos(s),
        o = r + e * Math.sin(s);
    pizzaCoordinates.x = a, pizzaCoordinates.y = o
}

function getCutCoordinates(t, e, i) {
    var n = i.x,
        r = i.y,
        s = -t * Math.PI / 180,
        a = n + e * Math.cos(s),
        o = r + e * Math.sin(s);
    pieCoordinates.x = a, pieCoordinates.y = o
}

function isOdd(t) {
    return t % 2
}

function rotateItems(t) {
    for (var e = svg.querySelectorAll(".item"), i, n, r, s = 0; s < e.length; s++) {
        var a = e[s];
        gaps === !1 && (r = -angle * s), gaps === !0 && "semiCircle" == typeOfCircle && (i = nbOfSlices * (180 / nbOfSlices / gap), n = i / (nbOfSlices - 1), r = -s * (angle + n)), gaps === !0 && "fullCircle" == typeOfCircle && (i = nbOfSlices * (360 / nbOfSlices / gap), n = i / nbOfSlices, r = -s * (angle + n));
        var o = a.getBBox();
        a.setAttribute("transform", "rotate(" + r + " " + t.x + " " + t.y + ")"), TweenLite.set(a, {
            rotation: r,
            transformOrigin: t.x - o.x + "px " + (t.y - o.y) + "px"
        }), a.removeAttribute("style")
    }
}

function drawPizzaSectors(t, e) {
    for (var i = 0; nbOfSlices > i; i++) {
        var n = document.createElementNS(svgns, "a");
        n.setAttribute("class", "item"), n.setAttribute("id", "item-" + (i + 1)), n.setAttribute("role", "link"), n.setAttribute("tabindex", "0"), n.setAttributeNS(xlinkns, "xlink:href", ""), n.setAttributeNS(xlinkns, "xlink:title", ""), n.setAttributeNS(xlinkns, "target", "_parent");
        var r = document.createElementNS(svgns, "path");
        r.setAttribute("fill", "none"), r.setAttribute("stroke", "#111"), r.setAttribute("stroke-width", "1"), r.setAttribute("class", "sector"), r.setAttribute("d", "M" + t.x + "," + t.y + " l" + e + ",0 A" + e + "," + e + " 0 0,0 " + pizzaCoordinates.x + "," + pizzaCoordinates.y + " z"), n.appendChild(r), itemsContainer.appendChild(document.createTextNode("        ")), itemsContainer.appendChild(n), itemsContainer.appendChild(document.createTextNode("\n"))
    }
}

function drawCutSectors(t, e, i) {
    for (var n = 0; nbOfSlices > n; n++) {
        var r = document.createElementNS(svgns, "a");
        var l = arrMenu1[n][2];

        r.setAttribute("class", "item"), r.setAttribute("id", "item-" + (n + 1)), r.setAttribute("data-index", n), r.setAttribute("role", "link"), r.setAttribute("tabindex", "0"), r.setAttributeNS(xlinkns, "xlink:href", l), r.setAttributeNS(xlinkns, "xlink:title", "title1");
        r.onmouseenter = function(t) {
            var itemIndex = this.getAttribute("data-index");
            var imgSrc = arrMenu1[itemIndex][1];

            img.setAttributeNS(xlinkns, "xlink:href", imgSrc);
        }
        r.ontouchstart = function(t) {
            var itemIndex = this.getAttribute("data-index");
            var imgSrc = arrMenu1[itemIndex][1];

            img.setAttributeNS(xlinkns, "xlink:href", imgSrc);
        }
        r.onclick = function(t) {
            nbOfSlices = parseInt(Math.random() * (8 - 3) + 3);
            init();
        };
        var s = document.createElementNS(svgns, "path");
        s.setAttribute("fill", "none"), s.setAttribute("stroke", "#111"), s.setAttribute("d", "M" + (t.x + i) + "," + t.y + " l" + (e - i) + ",0 A" + e + "," + e + " 0 0,0 " + pizzaCoordinates.x + "," + pizzaCoordinates.y + " l" + -(pizzaCoordinates.x - pieCoordinates.x) + "," + (-pizzaCoordinates.y + pieCoordinates.y) + " A" + i + "," + i + " 0 0,1 " + (t.x + i) + "," + t.y), s.setAttribute("class", "sector"), r.appendChild(s), itemsContainer.appendChild(document.createTextNode("        ")), itemsContainer.appendChild(r), itemsContainer.appendChild(document.createTextNode("\n"))
    }
}

function clearCanvas() {
    for (var t = svg.querySelectorAll(".item"), e = 0; e < t.length; e++) {
        var i = t[e],
            n = i.parentNode;
        n.removeChild(i)
    }
    for (var r = svg.querySelectorAll(".icon"), e = 0; e < r.length; e++) {
        var s = r[e],
            n = s.parentNode;
        n.removeChild(s)
    }
    itemsContainer.textContent = "", symbolsContainer.textContent = ""
}

function triggerControlHandler() {
    circle.setAttribute("r", this.value), generateFile()
}

function gapControlHandler() {
    gap = this.value, init()
}

function smallRadiusControlHandler() {
    menuSmallRadius = parseInt(this.value), init()
}

function iconPosControlHandler() {
    iconPos = this.value, init()
}

function iconSizeControlHandler() {
    iconWidth = this.value, iconHeight = this.value, init()
}

function enableGapControl() {
    gapControl.disabled = !1
}

function disableGapControl() {
    gapControl.disabled = !0
}

function enableRadiusControl() {
    smallRadiusControl.disabled = !1
}

function disableRadiusControl() {
    smallRadiusControl.disabled = !0
}

function addIcons() {
    var t = document.querySelectorAll(".item"),
        e = document.createElementNS(svgns, "path");
    e.setAttribute("d", "M" + pizzaCoordinates.x + "," + pizzaCoordinates.y + " L" + 2 * menuRadius + "," + menuRadius);
    for (var i = e.getTotalLength(), n = 0; n < t.length; n++) {
        var r = t[n];
        var e = document.createElementNS(svgns, "path");
        e.setAttribute("d", "M" + pizzaCoordinates.x + "," + pizzaCoordinates.y + " L" + 2 * menuRadius + "," + menuRadius), e.setAttribute("stroke", "#ddd");
        var s = {};
        angle > 90 ? (s.x = pizzaCoordinates.x + (2 * menuRadius - pizzaCoordinates.x) / 2 + 50, s.y = pizzaCoordinates.y + (menuRadius - pizzaCoordinates.y) / 2 - 50) : (s.x = pizzaCoordinates.x + (2 * menuRadius - pizzaCoordinates.x) / 2, s.y = pizzaCoordinates.y + (menuRadius - pizzaCoordinates.y) / 2);
        var a = document.createElementNS(svgns, "circle");
        a.setAttribute("cx", s.x), a.setAttribute("cy", s.y), a.setAttribute("r", "5");
        var o = document.createElementNS(svgns, "path");
        o.setAttribute("d", "M" + menuCenter.x + "," + menuCenter.y + " L" + s.x + "," + s.y), o.setAttribute("stroke", "orange");
        var l = o.getPointAtLength(iconPos),
            h = document.createElementNS(svgns, "circle");
        h.setAttribute("cx", l.x), h.setAttribute("cy", l.y), h.setAttribute("r", "5");
        var u = document.createElementNS(svgns, "use");
        u.setAttributeNS(xlinkns, "xlink:href", "#icon-" + (n + 1)), u.setAttribute("width", iconWidth), u.setAttribute("height", iconHeight), u.setAttribute("x", l.x - u.getAttribute("width") / 2), u.setAttribute("y", l.y - u.getAttribute("height") / 2), u.setAttribute("transform", "rotate(" + (90 - angle + angle / 2) + " " + l.x + " " + l.y + ")"), r.appendChild(u);
        var c = document.createElementNS(svgns, "symbol");
        c.setAttribute("class", "icon icon-"), c.setAttribute("id", "icon-" + (n + 1)), c.setAttribute("viewBox", "0 0 " + iconWidth + " " + iconHeight);

        img.setAttribute("width", "200"), img.setAttribute("height", "200"), img.setAttribute("x", "150"),img.setAttribute("y", "150"), img.setAttributeNS(xlinkns, "xlink:href", "logo.png");
        svg.appendChild(img);

        //var f = document.createElementNS(svgns, "rect");
        //f.setAttribute("fill", "none"), f.setAttribute("stroke", "#111"), f.setAttribute("stroke-width", "1"), f.setAttribute("width", "100%"), f.setAttribute("height", "100%");
        var p = document.createElementNS(svgns, "text");
        p.setAttribute("fill", "#222"), p.setAttribute("x", "50%"), p.setAttribute("y", "10%"), p.setAttribute("dy", ".3em"), p.setAttribute("text-anchor", "middle"), p.setAttribute("font-size", "1.2em"), p.textContent = arrMenu1[n][0];//n + 1;
        var d = document.createComment("Replace the contents of this symbol with the content of your icon");
        c.appendChild(d), c.appendChild(p), symbolsContainer.appendChild(document.createTextNode("    ")), symbolsContainer.appendChild(c), symbolsContainer.appendChild(document.createTextNode("\n\n"))
    }
}

function init() {
    clearCanvas(), iconPosControl.setAttribute("max", .85 * menuRadius), iconPosControl.setAttribute("value", .68 * menuRadius), gaps ? (enableGapControl(), gapControl.setAttribute("max", angle), gapControl.setAttribute("min", nbOfSlices - 1)) : gaps || disableGapControl(), getAngle(nbOfSlices), getPizzaCoordinates(angle, menuRadius, menuCenter), "pizza" == menuStyle ? (drawPizzaSectors(menuCenter, menuRadius), disableRadiusControl()) : "pie" == menuStyle && (getCutCoordinates(angle, menuSmallRadius, menuCenter), drawCutSectors(menuCenter, menuRadius, menuSmallRadius), enableRadiusControl()), rotateItems(menuCenter), addIcons(), generateCode(), generateFile()
}

function makeSpinnable(t) {
    CSSPlugin.useSVGTransformAttr = !0, TweenLite.set(svg, {
        rotation: 0,
        transformOrigin: "50% 50%"
    }), Draggable.create(svg, {
        type: "rotation",
        throwProps: !0,
        dragClickables: !0,
        onThrowComplete: function() {
            generateCode(), generateFile()
        }
    })
}
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("TweenMax", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function(t, e, i) {
        var n = function(t) {
                var e = [],
                    i = t.length,
                    n;
                for (n = 0; n !== i; e.push(t[n++]));
                return e
            }, r = function(t, e, n) {
                i.call(this, t, e, n), this._cycle = 0, this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._dirty = !0, this.render = r.prototype.render
            }, s = 1e-10,
            a = i._internals,
            o = a.isSelector,
            l = a.isArray,
            h = r.prototype = i.to({}, .1, {}),
            u = [];
        r.version = "1.15.2", h.constructor = r, h.kill()._gc = !1, r.killTweensOf = r.killDelayedCallsTo = i.killTweensOf, r.getTweensOf = i.getTweensOf, r.lagSmoothing = i.lagSmoothing, r.ticker = i.ticker, r.render = i.render, h.invalidate = function() {
            return this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._uncache(!0), i.prototype.invalidate.call(this)
        }, h.updateTo = function(t, e) {
            var n = this.ratio,
                r = this.vars.immediateRender || t.immediateRender,
                s;
            e && this._startTime < this._timeline._time && (this._startTime = this._timeline._time, this._uncache(!1), this._gc ? this._enabled(!0, !1) : this._timeline.insert(this, this._startTime - this._delay));
            for (s in t) this.vars[s] = t[s];
            if (this._initted || r)
                if (e) this._initted = !1, r && this.render(0, !0, !0);
                else if (this._gc && this._enabled(!0, !1), this._notifyPluginsOfEnabled && this._firstPT && i._onPluginEvent("_onDisable", this), this._time / this._duration > .998) {
                    var a = this._time;
                    this.render(0, !0, !1), this._initted = !1, this.render(a, !0, !1)
                } else if (this._time > 0 || r) {
                    this._initted = !1, this._init();
                    for (var o = 1 / (1 - n), l = this._firstPT, h; l;) h = l.s + l.c, l.c *= o, l.s = h - l.c, l = l._next
                }
            return this
        }, h.render = function(t, e, i) {
            this._initted || 0 === this._duration && this.vars.repeat && this.invalidate();
            var n = this._dirty ? this.totalDuration() : this._totalDuration,
                r = this._time,
                o = this._totalTime,
                l = this._cycle,
                h = this._duration,
                c = this._rawPrevTime,
                f, p, d, g, m, _, v, y, x;
            if (t >= n ? (this._totalTime = n, this._cycle = this._repeat, this._yoyo && 0 !== (1 & this._cycle) ? (this._time = 0, this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0) : (this._time = h, this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1), this._reversed || (f = !0, p = "onComplete"), 0 === h && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0), (0 === t || 0 > c || c === s) && c !== t && (i = !0, c > s && (p = "onReverseComplete")), this._rawPrevTime = y = !e || t || c === t ? t : s)) : 1e-7 > t ? (this._totalTime = this._time = this._cycle = 0, this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0, (0 !== o || 0 === h && c > 0 && c !== s) && (p = "onReverseComplete", f = this._reversed), 0 > t && (this._active = !1, 0 === h && (this._initted || !this.vars.lazy || i) && (c >= 0 && (i = !0), this._rawPrevTime = y = !e || t || c === t ? t : s)), this._initted || (i = !0)) : (this._totalTime = this._time = t, 0 !== this._repeat && (g = h + this._repeatDelay, this._cycle = this._totalTime / g >> 0, 0 !== this._cycle && this._cycle === this._totalTime / g && this._cycle--, this._time = this._totalTime - this._cycle * g, this._yoyo && 0 !== (1 & this._cycle) && (this._time = h - this._time), this._time > h ? this._time = h : this._time < 0 && (this._time = 0)), this._easeType ? (m = this._time / h, _ = this._easeType, v = this._easePower, (1 === _ || 3 === _ && m >= .5) && (m = 1 - m), 3 === _ && (m *= 2), 1 === v ? m *= m : 2 === v ? m *= m * m : 3 === v ? m *= m * m * m : 4 === v && (m *= m * m * m * m), this.ratio = 1 === _ ? 1 - m : 2 === _ ? m : this._time / h < .5 ? m / 2 : 1 - m / 2) : this.ratio = this._ease.getRatio(this._time / h)), r === this._time && !i && l === this._cycle) return void(o !== this._totalTime && this._onUpdate && (e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || u)));
            if (!this._initted) {
                if (this._init(), !this._initted || this._gc) return;
                if (!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration)) return this._time = r, this._totalTime = o, this._rawPrevTime = c, this._cycle = l, a.lazyTweens.push(this), void(this._lazy = [t, e]);
                this._time && !f ? this.ratio = this._ease.getRatio(this._time / h) : f && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
            }
            for (this._lazy !== !1 && (this._lazy = !1), this._active || !this._paused && this._time !== r && t >= 0 && (this._active = !0), 0 === o && (2 === this._initted && t > 0 && this._init(), this._startAt && (t >= 0 ? this._startAt.render(t, e, i) : p || (p = "_dummyGS")), this.vars.onStart && (0 !== this._totalTime || 0 === h) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || u))), d = this._firstPT; d;) d.f ? d.t[d.p](d.c * this.ratio + d.s) : d.t[d.p] = d.c * this.ratio + d.s, d = d._next;
            this._onUpdate && (0 > t && this._startAt && this._startTime && this._startAt.render(t, e, i), e || (this._totalTime !== o || f) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || u)), this._cycle !== l && (e || this._gc || this.vars.onRepeat && this.vars.onRepeat.apply(this.vars.onRepeatScope || this, this.vars.onRepeatParams || u)), p && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && this._startTime && this._startAt.render(t, e, i), f && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[p] && this.vars[p].apply(this.vars[p + "Scope"] || this, this.vars[p + "Params"] || u), 0 === h && this._rawPrevTime === s && y !== s && (this._rawPrevTime = 0))
        }, r.to = function(t, e, i) {
            return new r(t, e, i)
        }, r.from = function(t, e, i) {
            return i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new r(t, e, i)
        }, r.fromTo = function(t, e, i, n) {
            return n.startAt = i, n.immediateRender = 0 != n.immediateRender && 0 != i.immediateRender, new r(t, e, n)
        }, r.staggerTo = r.allTo = function(t, e, s, a, h, c, f) {
            a = a || 0;
            var p = s.delay || 0,
                d = [],
                g = function() {
                    s.onComplete && s.onComplete.apply(s.onCompleteScope || this, arguments), h.apply(f || this, c || u)
                }, m, _, v, y;
            for (l(t) || ("string" == typeof t && (t = i.selector(t) || t), o(t) && (t = n(t))), t = t || [], 0 > a && (t = n(t), t.reverse(), a *= -1), m = t.length - 1, v = 0; m >= v; v++) {
                _ = {};
                for (y in s) _[y] = s[y];
                _.delay = p, v === m && h && (_.onComplete = g), d[v] = new r(t[v], e, _), p += a
            }
            return d
        }, r.staggerFrom = r.allFrom = function(t, e, i, n, s, a, o) {
            return i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, r.staggerTo(t, e, i, n, s, a, o)
        }, r.staggerFromTo = r.allFromTo = function(t, e, i, n, s, a, o, l) {
            return n.startAt = i, n.immediateRender = 0 != n.immediateRender && 0 != i.immediateRender, r.staggerTo(t, e, n, s, a, o, l)
        }, r.delayedCall = function(t, e, i, n, s) {
            return new r(e, 0, {
                delay: t,
                onComplete: e,
                onCompleteParams: i,
                onCompleteScope: n,
                onReverseComplete: e,
                onReverseCompleteParams: i,
                onReverseCompleteScope: n,
                immediateRender: !1,
                useFrames: s,
                overwrite: 0
            })
        }, r.set = function(t, e) {
            return new r(t, 0, e)
        }, r.isTweening = function(t) {
            return i.getTweensOf(t, !0).length > 0
        };
        var c = function(t, e) {
            for (var n = [], r = 0, s = t._first; s;) s instanceof i ? n[r++] = s : (e && (n[r++] = s), n = n.concat(c(s, e)), r = n.length), s = s._next;
            return n
        }, f = r.getAllTweens = function(e) {
            return c(t._rootTimeline, e).concat(c(t._rootFramesTimeline, e))
        };
        r.killAll = function(t, i, n, r) {
            null == i && (i = !0), null == n && (n = !0);
            var s = f(0 != r),
                a = s.length,
                o = i && n && r,
                l, h, u;
            for (u = 0; a > u; u++) h = s[u], (o || h instanceof e || (l = h.target === h.vars.onComplete) && n || i && !l) && (t ? h.totalTime(h._reversed ? 0 : h.totalDuration()) : h._enabled(!1, !1))
        }, r.killChildTweensOf = function(t, e) {
            if (null != t) {
                var s = a.tweenLookup,
                    h, u, c, f, p;
                if ("string" == typeof t && (t = i.selector(t) || t), o(t) && (t = n(t)), l(t))
                    for (f = t.length; --f > -1;) r.killChildTweensOf(t[f], e);
                else {
                    h = [];
                    for (c in s)
                        for (u = s[c].target.parentNode; u;) u === t && (h = h.concat(s[c].tweens)), u = u.parentNode;
                    for (p = h.length, f = 0; p > f; f++) e && h[f].totalTime(h[f].totalDuration()), h[f]._enabled(!1, !1)
                }
            }
        };
        var p = function(t, i, n, r) {
            i = i !== !1, n = n !== !1, r = r !== !1;
            for (var s = f(r), a = i && n && r, o = s.length, l, h; --o > -1;) h = s[o], (a || h instanceof e || (l = h.target === h.vars.onComplete) && n || i && !l) && h.paused(t)
        };
        return r.pauseAll = function(t, e, i) {
            p(!0, t, e, i)
        }, r.resumeAll = function(t, e, i) {
            p(!1, t, e, i)
        }, r.globalTimeScale = function(e) {
            var n = t._rootTimeline,
                r = i.ticker.time;
            return arguments.length ? (e = e || s, n._startTime = r - (r - n._startTime) * n._timeScale / e, n = t._rootFramesTimeline, r = i.ticker.frame, n._startTime = r - (r - n._startTime) * n._timeScale / e, n._timeScale = t._rootTimeline._timeScale = e, e) : n._timeScale
        }, h.progress = function(t) {
            return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - t : t) + this._cycle * (this._duration + this._repeatDelay), !1) : this._time / this.duration()
        }, h.totalProgress = function(t) {
            return arguments.length ? this.totalTime(this.totalDuration() * t, !1) : this._totalTime / this.totalDuration()
        }, h.time = function(t, e) {
            return arguments.length ? (this._dirty && this.totalDuration(), t > this._duration && (t = this._duration), this._yoyo && 0 !== (1 & this._cycle) ? t = this._duration - t + this._cycle * (this._duration + this._repeatDelay) : 0 !== this._repeat && (t += this._cycle * (this._duration + this._repeatDelay)), this.totalTime(t, e)) : this._time
        }, h.duration = function(e) {
            return arguments.length ? t.prototype.duration.call(this, e) : this._duration
        }, h.totalDuration = function(t) {
            return arguments.length ? -1 === this._repeat ? this : this.duration((t - this._repeat * this._repeatDelay) / (this._repeat + 1)) : (this._dirty && (this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat, this._dirty = !1), this._totalDuration)
        }, h.repeat = function(t) {
            return arguments.length ? (this._repeat = t, this._uncache(!0)) : this._repeat
        }, h.repeatDelay = function(t) {
            return arguments.length ? (this._repeatDelay = t, this._uncache(!0)) : this._repeatDelay
        }, h.yoyo = function(t) {
            return arguments.length ? (this._yoyo = t, this) : this._yoyo
        }, r
    }, !0), _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function(t, e, i) {
        var n = function(t) {
                e.call(this, t), this._labels = {}, this.autoRemoveChildren = this.vars.autoRemoveChildren === !0, this.smoothChildTiming = this.vars.smoothChildTiming === !0, this._sortChildren = !0, this._onUpdate = this.vars.onUpdate;
                var i = this.vars,
                    n, r;
                for (r in i) n = i[r], l(n) && -1 !== n.join("").indexOf("{self}") && (i[r] = this._swapSelfInParams(n));
                l(i.tweens) && this.add(i.tweens, 0, i.align, i.stagger)
            }, r = 1e-10,
            s = i._internals,
            a = n._internals = {}, o = s.isSelector,
            l = s.isArray,
            h = s.lazyTweens,
            u = s.lazyRender,
            c = [],
            f = _gsScope._gsDefine.globals,
            p = function(t) {
                var e = {}, i;
                for (i in t) e[i] = t[i];
                return e
            }, d = a.pauseCallback = function(t, e, i, n) {
                var r = t._timeline,
                    s = r._totalTime;
                (e || !this._forcingPlayhead) && (r.pause(t._startTime), e && e.apply(n || r, i || c), this._forcingPlayhead && r.seek(s))
            }, g = function(t) {
                var e = [],
                    i = t.length,
                    n;
                for (n = 0; n !== i; e.push(t[n++]));
                return e
            }, m = n.prototype = new e;
        return n.version = "1.15.2", m.constructor = n, m.kill()._gc = m._forcingPlayhead = !1, m.to = function(t, e, n, r) {
            var s = n.repeat && f.TweenMax || i;
            return e ? this.add(new s(t, e, n), r) : this.set(t, n, r)
        }, m.from = function(t, e, n, r) {
            return this.add((n.repeat && f.TweenMax || i).from(t, e, n), r)
        }, m.fromTo = function(t, e, n, r, s) {
            var a = r.repeat && f.TweenMax || i;
            return e ? this.add(a.fromTo(t, e, n, r), s) : this.set(t, r, s)
        }, m.staggerTo = function(t, e, r, s, a, l, h, u) {
            var c = new n({
                    onComplete: l,
                    onCompleteParams: h,
                    onCompleteScope: u,
                    smoothChildTiming: this.smoothChildTiming
                }),
                f;
            for ("string" == typeof t && (t = i.selector(t) || t), t = t || [], o(t) && (t = g(t)), s = s || 0, 0 > s && (t = g(t), t.reverse(), s *= -1), f = 0; f < t.length; f++) r.startAt && (r.startAt = p(r.startAt)), c.to(t[f], e, p(r), f * s);
            return this.add(c, a)
        }, m.staggerFrom = function(t, e, i, n, r, s, a, o) {
            return i.immediateRender = 0 != i.immediateRender, i.runBackwards = !0, this.staggerTo(t, e, i, n, r, s, a, o)
        }, m.staggerFromTo = function(t, e, i, n, r, s, a, o, l) {
            return n.startAt = i, n.immediateRender = 0 != n.immediateRender && 0 != i.immediateRender, this.staggerTo(t, e, n, r, s, a, o, l)
        }, m.call = function(t, e, n, r) {
            return this.add(i.delayedCall(0, t, e, n), r)
        }, m.set = function(t, e, n) {
            return n = this._parseTimeOrLabel(n, 0, !0), null == e.immediateRender && (e.immediateRender = n === this._time && !this._paused), this.add(new i(t, 0, e), n)
        }, n.exportRoot = function(t, e) {
            t = t || {}, null == t.smoothChildTiming && (t.smoothChildTiming = !0);
            var r = new n(t),
                s = r._timeline,
                a, o;
            for (null == e && (e = !0), s._remove(r, !0), r._startTime = 0, r._rawPrevTime = r._time = r._totalTime = s._time, a = s._first; a;) o = a._next, e && a instanceof i && a.target === a.vars.onComplete || r.add(a, a._startTime - a._delay), a = o;
            return s.add(r, 0), r
        }, m.add = function(r, s, a, o) {
            var h, u, c, f, p, d;
            if ("number" != typeof s && (s = this._parseTimeOrLabel(s, 0, !0, r)), !(r instanceof t)) {
                if (r instanceof Array || r && r.push && l(r)) {
                    for (a = a || "normal", o = o || 0, h = s, u = r.length, c = 0; u > c; c++) l(f = r[c]) && (f = new n({
                        tweens: f
                    })), this.add(f, h), "string" != typeof f && "function" != typeof f && ("sequence" === a ? h = f._startTime + f.totalDuration() / f._timeScale : "start" === a && (f._startTime -= f.delay())), h += o;
                    return this._uncache(!0)
                }
                if ("string" == typeof r) return this.addLabel(r, s);
                if ("function" != typeof r) throw "Cannot add " + r + " into the timeline; it is not a tween, timeline, function, or string.";
                r = i.delayedCall(0, r)
            }
            if (e.prototype.add.call(this, r, s), (this._gc || this._time === this._duration) && !this._paused && this._duration < this.duration())
                for (p = this, d = p.rawTime() > r._startTime; p._timeline;) d && p._timeline.smoothChildTiming ? p.totalTime(p._totalTime, !0) : p._gc && p._enabled(!0, !1), p = p._timeline;
            return this
        }, m.remove = function(e) {
            if (e instanceof t) return this._remove(e, !1);
            if (e instanceof Array || e && e.push && l(e)) {
                for (var i = e.length; --i > -1;) this.remove(e[i]);
                return this
            }
            return "string" == typeof e ? this.removeLabel(e) : this.kill(null, e)
        }, m._remove = function(t, i) {
            e.prototype._remove.call(this, t, i);
            var n = this._last;
            return n ? this._time > n._startTime + n._totalDuration / n._timeScale && (this._time = this.duration(), this._totalTime = this._totalDuration) : this._time = this._totalTime = this._duration = this._totalDuration = 0, this
        }, m.append = function(t, e) {
            return this.add(t, this._parseTimeOrLabel(null, e, !0, t))
        }, m.insert = m.insertMultiple = function(t, e, i, n) {
            return this.add(t, e || 0, i, n)
        }, m.appendMultiple = function(t, e, i, n) {
            return this.add(t, this._parseTimeOrLabel(null, e, !0, t), i, n)
        }, m.addLabel = function(t, e) {
            return this._labels[t] = this._parseTimeOrLabel(e), this
        }, m.addPause = function(t, e, n, r) {
            var s = i.delayedCall(0, d, ["{self}", e, n, r], this);
            return s.data = "isPause", this.add(s, t)
        }, m.removeLabel = function(t) {
            return delete this._labels[t], this
        }, m.getLabelTime = function(t) {
            return null != this._labels[t] ? this._labels[t] : -1
        }, m._parseTimeOrLabel = function(e, i, n, r) {
            var s;
            if (r instanceof t && r.timeline === this) this.remove(r);
            else if (r && (r instanceof Array || r.push && l(r)))
                for (s = r.length; --s > -1;) r[s] instanceof t && r[s].timeline === this && this.remove(r[s]);
            if ("string" == typeof i) return this._parseTimeOrLabel(i, n && "number" == typeof e && null == this._labels[i] ? e - this.duration() : 0, n);
            if (i = i || 0, "string" != typeof e || !isNaN(e) && null == this._labels[e]) null == e && (e = this.duration());
            else {
                if (s = e.indexOf("="), -1 === s) return null == this._labels[e] ? n ? this._labels[e] = this.duration() + i : i : this._labels[e] + i;
                i = parseInt(e.charAt(s - 1) + "1", 10) * Number(e.substr(s + 1)), e = s > 1 ? this._parseTimeOrLabel(e.substr(0, s - 1), 0, n) : this.duration()
            }
            return Number(e) + i
        }, m.seek = function(t, e) {
            return this.totalTime("number" == typeof t ? t : this._parseTimeOrLabel(t), e !== !1)
        }, m.stop = function() {
            return this.paused(!0)
        }, m.gotoAndPlay = function(t, e) {
            return this.play(t, e)
        }, m.gotoAndStop = function(t, e) {
            return this.pause(t, e)
        }, m.render = function(t, e, i) {
            this._gc && this._enabled(!0, !1);
            var n = this._dirty ? this.totalDuration() : this._totalDuration,
                s = this._time,
                a = this._startTime,
                o = this._timeScale,
                l = this._paused,
                f, p, d, g, m;
            if (t >= n ? (this._totalTime = this._time = n, this._reversed || this._hasPausedChild() || (p = !0, g = "onComplete", 0 === this._duration && (0 === t || this._rawPrevTime < 0 || this._rawPrevTime === r) && this._rawPrevTime !== t && this._first && (m = !0, this._rawPrevTime > r && (g = "onReverseComplete"))), this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t ? t : r, t = n + 1e-4) : 1e-7 > t ? (this._totalTime = this._time = 0, (0 !== s || 0 === this._duration && this._rawPrevTime !== r && (this._rawPrevTime > 0 || 0 > t && this._rawPrevTime >= 0)) && (g = "onReverseComplete", p = this._reversed), 0 > t ? (this._active = !1, this._rawPrevTime >= 0 && this._first && (m = !0), this._rawPrevTime = t) : (this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t ? t : r, t = 0, this._initted || (m = !0))) : this._totalTime = this._time = this._rawPrevTime = t, this._time !== s && this._first || i || m) {
                if (this._initted || (this._initted = !0), this._active || !this._paused && this._time !== s && t > 0 && (this._active = !0), 0 === s && this.vars.onStart && 0 !== this._time && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || c)), this._time >= s)
                    for (f = this._first; f && (d = f._next, !this._paused || l);)(f._active || f._startTime <= this._time && !f._paused && !f._gc) && (f._reversed ? f.render((f._dirty ? f.totalDuration() : f._totalDuration) - (t - f._startTime) * f._timeScale, e, i) : f.render((t - f._startTime) * f._timeScale, e, i)), f = d;
                else
                    for (f = this._last; f && (d = f._prev, !this._paused || l);)(f._active || f._startTime <= s && !f._paused && !f._gc) && (f._reversed ? f.render((f._dirty ? f.totalDuration() : f._totalDuration) - (t - f._startTime) * f._timeScale, e, i) : f.render((t - f._startTime) * f._timeScale, e, i)), f = d;
                this._onUpdate && (e || (h.length && u(), this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || c))), g && (this._gc || (a === this._startTime || o !== this._timeScale) && (0 === this._time || n >= this.totalDuration()) && (p && (h.length && u(), this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[g] && this.vars[g].apply(this.vars[g + "Scope"] || this, this.vars[g + "Params"] || c)))
            }
        }, m._hasPausedChild = function() {
            for (var t = this._first; t;) {
                if (t._paused || t instanceof n && t._hasPausedChild()) return !0;
                t = t._next
            }
            return !1
        }, m.getChildren = function(t, e, n, r) {
            r = r || -9999999999;
            for (var s = [], a = this._first, o = 0; a;) a._startTime < r || (a instanceof i ? e !== !1 && (s[o++] = a) : (n !== !1 && (s[o++] = a), t !== !1 && (s = s.concat(a.getChildren(!0, e, n)), o = s.length))), a = a._next;
            return s
        }, m.getTweensOf = function(t, e) {
            var n = this._gc,
                r = [],
                s = 0,
                a, o;
            for (n && this._enabled(!0, !0), a = i.getTweensOf(t), o = a.length; --o > -1;)(a[o].timeline === this || e && this._contains(a[o])) && (r[s++] = a[o]);
            return n && this._enabled(!1, !0), r
        }, m.recent = function() {
            return this._recent
        }, m._contains = function(t) {
            for (var e = t.timeline; e;) {
                if (e === this) return !0;
                e = e.timeline
            }
            return !1
        }, m.shiftChildren = function(t, e, i) {
            i = i || 0;
            for (var n = this._first, r = this._labels, s; n;) n._startTime >= i && (n._startTime += t), n = n._next;
            if (e)
                for (s in r) r[s] >= i && (r[s] += t);
            return this._uncache(!0)
        }, m._kill = function(t, e) {
            if (!t && !e) return this._enabled(!1, !1);
            for (var i = e ? this.getTweensOf(e) : this.getChildren(!0, !0, !1), n = i.length, r = !1; --n > -1;) i[n]._kill(t, e) && (r = !0);
            return r
        }, m.clear = function(t) {
            var e = this.getChildren(!1, !0, !0),
                i = e.length;
            for (this._time = this._totalTime = 0; --i > -1;) e[i]._enabled(!1, !1);
            return t !== !1 && (this._labels = {}), this._uncache(!0)
        }, m.invalidate = function() {
            for (var e = this._first; e;) e.invalidate(), e = e._next;
            return t.prototype.invalidate.call(this)
        }, m._enabled = function(t, i) {
            if (t === this._gc)
                for (var n = this._first; n;) n._enabled(t, !0), n = n._next;
            return e.prototype._enabled.call(this, t, i)
        }, m.totalTime = function(e, i, n) {
            this._forcingPlayhead = !0;
            var r = t.prototype.totalTime.apply(this, arguments);
            return this._forcingPlayhead = !1, r
        }, m.duration = function(t) {
            return arguments.length ? (0 !== this.duration() && 0 !== t && this.timeScale(this._duration / t), this) : (this._dirty && this.totalDuration(), this._duration)
        }, m.totalDuration = function(t) {
            if (!arguments.length) {
                if (this._dirty) {
                    for (var e = 0, i = this._last, n = 999999999999, r, s; i;) r = i._prev, i._dirty && i.totalDuration(), i._startTime > n && this._sortChildren && !i._paused ? this.add(i, i._startTime - i._delay) : n = i._startTime, i._startTime < 0 && !i._paused && (e -= i._startTime, this._timeline.smoothChildTiming && (this._startTime += i._startTime / this._timeScale), this.shiftChildren(-i._startTime, !1, -9999999999), n = 0), s = i._startTime + i._totalDuration / i._timeScale, s > e && (e = s), i = r;
                    this._duration = this._totalDuration = e, this._dirty = !1
                }
                return this._totalDuration
            }
            return 0 !== this.totalDuration() && 0 !== t && this.timeScale(this._totalDuration / t), this
        }, m.usesFrames = function() {
            for (var e = this._timeline; e._timeline;) e = e._timeline;
            return e === t._rootFramesTimeline
        }, m.rawTime = function() {
            return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale
        }, n
    }, !0), _gsScope._gsDefine("TimelineMax", ["TimelineLite", "TweenLite", "easing.Ease"], function(t, e, i) {
        var n = function(e) {
                t.call(this, e), this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._cycle = 0, this._yoyo = this.vars.yoyo === !0, this._dirty = !0
            }, r = 1e-10,
            s = [],
            a = e._internals,
            o = a.lazyTweens,
            l = a.lazyRender,
            h = new i(null, null, 1, 0),
            u = n.prototype = new t;
        return u.constructor = n, u.kill()._gc = !1, n.version = "1.15.2", u.invalidate = function() {
            return this._yoyo = this.vars.yoyo === !0, this._repeat = this.vars.repeat || 0, this._repeatDelay = this.vars.repeatDelay || 0, this._uncache(!0), t.prototype.invalidate.call(this)
        }, u.addCallback = function(t, i, n, r) {
            return this.add(e.delayedCall(0, t, n, r), i)
        }, u.removeCallback = function(t, e) {
            if (t)
                if (null == e) this._kill(null, t);
                else
                    for (var i = this.getTweensOf(t, !1), n = i.length, r = this._parseTimeOrLabel(e); --n > -1;) i[n]._startTime === r && i[n]._enabled(!1, !1);
            return this
        }, u.removePause = function(e) {
            return this.removeCallback(t._internals.pauseCallback, e)
        }, u.tweenTo = function(t, i) {
            i = i || {};
            var n = {
                ease: h,
                useFrames: this.usesFrames(),
                immediateRender: !1
            }, r, a, o;
            for (a in i) n[a] = i[a];
            return n.time = this._parseTimeOrLabel(t), r = Math.abs(Number(n.time) - this._time) / this._timeScale || .001, o = new e(this, r, n), n.onStart = function() {
                o.target.paused(!0), o.vars.time !== o.target.time() && r === o.duration() && o.duration(Math.abs(o.vars.time - o.target.time()) / o.target._timeScale), i.onStart && i.onStart.apply(i.onStartScope || o, i.onStartParams || s)
            }, o
        }, u.tweenFromTo = function(t, e, i) {
            i = i || {}, t = this._parseTimeOrLabel(t), i.startAt = {
                onComplete: this.seek,
                onCompleteParams: [t],
                onCompleteScope: this
            }, i.immediateRender = i.immediateRender !== !1;
            var n = this.tweenTo(e, i);
            return n.duration(Math.abs(n.vars.time - t) / this._timeScale || .001)
        }, u.render = function(t, e, i) {
            this._gc && this._enabled(!0, !1);
            var n = this._dirty ? this.totalDuration() : this._totalDuration,
                a = this._duration,
                h = this._time,
                u = this._totalTime,
                c = this._startTime,
                f = this._timeScale,
                p = this._rawPrevTime,
                d = this._paused,
                g = this._cycle,
                m, _, v, y, x, b;
            if (t >= n ? (this._locked || (this._totalTime = n, this._cycle = this._repeat), this._reversed || this._hasPausedChild() || (_ = !0, y = "onComplete", 0 === this._duration && (0 === t || 0 > p || p === r) && p !== t && this._first && (x = !0, p > r && (y = "onReverseComplete"))), this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t ? t : r, this._yoyo && 0 !== (1 & this._cycle) ? this._time = t = 0 : (this._time = a, t = a + 1e-4)) : 1e-7 > t ? (this._locked || (this._totalTime = this._cycle = 0), this._time = 0, (0 !== h || 0 === a && p !== r && (p > 0 || 0 > t && p >= 0) && !this._locked) && (y = "onReverseComplete", _ = this._reversed), 0 > t ? (this._active = !1, p >= 0 && this._first && (x = !0), this._rawPrevTime = t) : (this._rawPrevTime = a || !e || t || this._rawPrevTime === t ? t : r, t = 0, this._initted || (x = !0))) : (0 === a && 0 > p && (x = !0), this._time = this._rawPrevTime = t, this._locked || (this._totalTime = t, 0 !== this._repeat && (b = a + this._repeatDelay, this._cycle = this._totalTime / b >> 0, 0 !== this._cycle && this._cycle === this._totalTime / b && this._cycle--, this._time = this._totalTime - this._cycle * b, this._yoyo && 0 !== (1 & this._cycle) && (this._time = a - this._time), this._time > a ? (this._time = a, t = a + 1e-4) : this._time < 0 ? this._time = t = 0 : t = this._time))), this._cycle !== g && !this._locked) {
                var w = this._yoyo && 0 !== (1 & g),
                    T = w === (this._yoyo && 0 !== (1 & this._cycle)),
                    S = this._totalTime,
                    C = this._cycle,
                    k = this._rawPrevTime,
                    P = this._time;
                if (this._totalTime = g * a, this._cycle < g ? w = !w : this._totalTime += a, this._time = h, this._rawPrevTime = 0 === a ? p - 1e-4 : p, this._cycle = g, this._locked = !0, h = w ? 0 : a, this.render(h, e, 0 === a), e || this._gc || this.vars.onRepeat && this.vars.onRepeat.apply(this.vars.onRepeatScope || this, this.vars.onRepeatParams || s), T && (h = w ? a + 1e-4 : -1e-4, this.render(h, !0, !1)), this._locked = !1, this._paused && !d) return;
                this._time = P, this._totalTime = S, this._cycle = C, this._rawPrevTime = k
            }
            if (!(this._time !== h && this._first || i || x)) return void(u !== this._totalTime && this._onUpdate && (e || this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || s)));
            if (this._initted || (this._initted = !0), this._active || !this._paused && this._totalTime !== u && t > 0 && (this._active = !0), 0 === u && this.vars.onStart && 0 !== this._totalTime && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || s)), this._time >= h)
                for (m = this._first; m && (v = m._next, !this._paused || d);)(m._active || m._startTime <= this._time && !m._paused && !m._gc) && (m._reversed ? m.render((m._dirty ? m.totalDuration() : m._totalDuration) - (t - m._startTime) * m._timeScale, e, i) : m.render((t - m._startTime) * m._timeScale, e, i)), m = v;
            else
                for (m = this._last; m && (v = m._prev, !this._paused || d);)(m._active || m._startTime <= h && !m._paused && !m._gc) && (m._reversed ? m.render((m._dirty ? m.totalDuration() : m._totalDuration) - (t - m._startTime) * m._timeScale, e, i) : m.render((t - m._startTime) * m._timeScale, e, i)), m = v;
            this._onUpdate && (e || (o.length && l(), this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || s))), y && (this._locked || this._gc || (c === this._startTime || f !== this._timeScale) && (0 === this._time || n >= this.totalDuration()) && (_ && (o.length && l(), this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[y] && this.vars[y].apply(this.vars[y + "Scope"] || this, this.vars[y + "Params"] || s)))
        }, u.getActive = function(t, e, i) {
            null == t && (t = !0), null == e && (e = !0), null == i && (i = !1);
            var n = [],
                r = this.getChildren(t, e, i),
                s = 0,
                a = r.length,
                o, l;
            for (o = 0; a > o; o++) l = r[o], l.isActive() && (n[s++] = l);
            return n
        }, u.getLabelAfter = function(t) {
            t || 0 !== t && (t = this._time);
            var e = this.getLabelsArray(),
                i = e.length,
                n;
            for (n = 0; i > n; n++)
                if (e[n].time > t) return e[n].name;
            return null
        }, u.getLabelBefore = function(t) {
            null == t && (t = this._time);
            for (var e = this.getLabelsArray(), i = e.length; --i > -1;)
                if (e[i].time < t) return e[i].name;
            return null
        }, u.getLabelsArray = function() {
            var t = [],
                e = 0,
                i;
            for (i in this._labels) t[e++] = {
                time: this._labels[i],
                name: i
            };
            return t.sort(function(t, e) {
                return t.time - e.time
            }), t
        }, u.progress = function(t, e) {
            return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - t : t) + this._cycle * (this._duration + this._repeatDelay), e) : this._time / this.duration()
        }, u.totalProgress = function(t, e) {
            return arguments.length ? this.totalTime(this.totalDuration() * t, e) : this._totalTime / this.totalDuration()
        }, u.totalDuration = function(e) {
            return arguments.length ? -1 === this._repeat ? this : this.duration((e - this._repeat * this._repeatDelay) / (this._repeat + 1)) : (this._dirty && (t.prototype.totalDuration.call(this), this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat), this._totalDuration)
        }, u.time = function(t, e) {
            return arguments.length ? (this._dirty && this.totalDuration(), t > this._duration && (t = this._duration), this._yoyo && 0 !== (1 & this._cycle) ? t = this._duration - t + this._cycle * (this._duration + this._repeatDelay) : 0 !== this._repeat && (t += this._cycle * (this._duration + this._repeatDelay)), this.totalTime(t, e)) : this._time
        }, u.repeat = function(t) {
            return arguments.length ? (this._repeat = t, this._uncache(!0)) : this._repeat
        }, u.repeatDelay = function(t) {
            return arguments.length ? (this._repeatDelay = t, this._uncache(!0)) : this._repeatDelay
        }, u.yoyo = function(t) {
            return arguments.length ? (this._yoyo = t, this) : this._yoyo
        }, u.currentLabel = function(t) {
            return arguments.length ? this.seek(t, !0) : this.getLabelBefore(this._time + 1e-8)
        }, n
    }, !0),
        function() {
            var t = 180 / Math.PI,
                e = [],
                i = [],
                n = [],
                r = {}, s = _gsScope._gsDefine.globals,
                a = function(t, e, i, n) {
                    this.a = t, this.b = e, this.c = i, this.d = n, this.da = n - t, this.ca = i - t, this.ba = e - t
                }, o = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
                l = function(t, e, i, n) {
                    var r = {
                            a: t
                        }, s = {}, a = {}, o = {
                            c: n
                        }, l = (t + e) / 2,
                        h = (e + i) / 2,
                        u = (i + n) / 2,
                        c = (l + h) / 2,
                        f = (h + u) / 2,
                        p = (f - c) / 8;
                    return r.b = l + (t - l) / 4, s.b = c + p, r.c = s.a = (r.b + s.b) / 2, s.c = a.a = (c + f) / 2, a.b = f - p, o.b = u + (n - u) / 4, a.c = o.a = (a.b + o.b) / 2, [r, s, a, o]
                }, h = function(t, r, s, a, o) {
                    var h = t.length - 1,
                        u = 0,
                        c = t[0].a,
                        f, p, d, g, m, _, v, y, x, b, w, T, S;
                    for (f = 0; h > f; f++) m = t[u], p = m.a, d = m.d, g = t[u + 1].d, o ? (w = e[f], T = i[f], S = (T + w) * r * .25 / (a ? .5 : n[f] || .5), _ = d - (d - p) * (a ? .5 * r : 0 !== w ? S / w : 0), v = d + (g - d) * (a ? .5 * r : 0 !== T ? S / T : 0), y = d - (_ + ((v - _) * (3 * w / (w + T) + .5) / 4 || 0))) : (_ = d - (d - p) * r * .5, v = d + (g - d) * r * .5, y = d - (_ + v) / 2), _ += y, v += y, m.c = x = _, m.b = 0 !== f ? c : c = m.a + .6 * (m.c - m.a), m.da = d - p, m.ca = x - p, m.ba = c - p, s ? (b = l(p, c, x, d), t.splice(u, 1, b[0], b[1], b[2], b[3]), u += 4) : u++, c = v;
                    m = t[u], m.b = c, m.c = c + .4 * (m.d - c), m.da = m.d - m.a, m.ca = m.c - m.a, m.ba = c - m.a, s && (b = l(m.a, c, m.c, m.d), t.splice(u, 1, b[0], b[1], b[2], b[3]))
                }, u = function(t, n, r, s) {
                    var o = [],
                        l, h, u, c, f, p;
                    if (s)
                        for (t = [s].concat(t), h = t.length; --h > -1;) "string" == typeof(p = t[h][n]) && "=" === p.charAt(1) && (t[h][n] = s[n] + Number(p.charAt(0) + p.substr(2)));
                    if (l = t.length - 2, 0 > l) return o[0] = new a(t[0][n], 0, 0, t[-1 > l ? 0 : 1][n]), o;
                    for (h = 0; l > h; h++) u = t[h][n], c = t[h + 1][n], o[h] = new a(u, 0, 0, c), r && (f = t[h + 2][n], e[h] = (e[h] || 0) + (c - u) * (c - u), i[h] = (i[h] || 0) + (f - c) * (f - c));
                    return o[h] = new a(t[h][n], 0, 0, t[h + 1][n]), o
                }, c = function(t, s, a, l, c, f) {
                    var p = {}, d = [],
                        g = f || t[0],
                        m, _, v, y, x, b, w, T;
                    c = "string" == typeof c ? "," + c + "," : o, null == s && (s = 1);
                    for (_ in t[0]) d.push(_);
                    if (t.length > 1) {
                        for (T = t[t.length - 1], w = !0, m = d.length; --m > -1;)
                            if (_ = d[m], Math.abs(g[_] - T[_]) > .05) {
                                w = !1;
                                break
                            }
                        w && (t = t.concat(), f && t.unshift(f), t.push(t[1]), f = t[t.length - 3])
                    }
                    for (e.length = i.length = n.length = 0, m = d.length; --m > -1;) _ = d[m], r[_] = -1 !== c.indexOf("," + _ + ","), p[_] = u(t, _, r[_], f);
                    for (m = e.length; --m > -1;) e[m] = Math.sqrt(e[m]), i[m] = Math.sqrt(i[m]);
                    if (!l) {
                        for (m = d.length; --m > -1;)
                            if (r[_])
                                for (v = p[d[m]], b = v.length - 1, y = 0; b > y; y++) x = v[y + 1].da / i[y] + v[y].da / e[y], n[y] = (n[y] || 0) + x * x;
                        for (m = n.length; --m > -1;) n[m] = Math.sqrt(n[m])
                    }
                    for (m = d.length, y = a ? 4 : 1; --m > -1;) _ = d[m], v = p[_], h(v, s, a, l, r[_]), w && (v.splice(0, y), v.splice(v.length - y, y));
                    return p
                }, f = function(t, e, i) {
                    e = e || "soft";
                    var n = {}, r = "cubic" === e ? 3 : 2,
                        s = "soft" === e,
                        o = [],
                        l, h, u, c, f, p, d, g, m, _, v;
                    if (s && i && (t = [i].concat(t)), null == t || t.length < r + 1) throw "invalid Bezier data";
                    for (m in t[0]) o.push(m);
                    for (p = o.length; --p > -1;) {
                        for (m = o[p], n[m] = f = [], _ = 0, g = t.length, d = 0; g > d; d++) l = null == i ? t[d][m] : "string" == typeof(v = t[d][m]) && "=" === v.charAt(1) ? i[m] + Number(v.charAt(0) + v.substr(2)) : Number(v), s && d > 1 && g - 1 > d && (f[_++] = (l + f[_ - 2]) / 2), f[_++] = l;
                        for (g = _ - r + 1, _ = 0, d = 0; g > d; d += r) l = f[d], h = f[d + 1], u = f[d + 2], c = 2 === r ? 0 : f[d + 3], f[_++] = v = 3 === r ? new a(l, h, u, c) : new a(l, (2 * h + l) / 3, (2 * h + u) / 3, u);
                        f.length = _
                    }
                    return n
                }, p = function(t, e, i) {
                    for (var n = 1 / i, r = t.length, s, a, o, l, h, u, c, f, p, d, g; --r > -1;)
                        for (d = t[r], o = d.a, l = d.d - o, h = d.c - o, u = d.b - o, s = a = 0, f = 1; i >= f; f++) c = n * f, p = 1 - c, s = a - (a = (c * c * l + 3 * p * (c * h + p * u)) * c), g = r * i + f - 1, e[g] = (e[g] || 0) + s * s
                }, d = function(t, e) {
                    e = e >> 0 || 6;
                    var i = [],
                        n = [],
                        r = 0,
                        s = 0,
                        a = e - 1,
                        o = [],
                        l = [],
                        h, u, c, f;
                    for (h in t) p(t[h], i, e);
                    for (c = i.length, u = 0; c > u; u++) r += Math.sqrt(i[u]), f = u % e, l[f] = r, f === a && (s += r, f = u / e >> 0, o[f] = l, n[f] = s, r = 0, l = []);
                    return {
                        length: s,
                        lengths: n,
                        segments: o
                    }
                }, g = _gsScope._gsDefine.plugin({
                    propName: "bezier",
                    priority: -1,
                    version: "1.3.4",
                    API: 2,
                    global: !0,
                    init: function(t, e, i) {
                        this._target = t, e instanceof Array && (e = {
                            values: e
                        }), this._func = {}, this._round = {}, this._props = [], this._timeRes = null == e.timeResolution ? 6 : parseInt(e.timeResolution, 10);
                        var n = e.values || [],
                            r = {}, s = n[0],
                            a = e.autoRotate || i.vars.orientToBezier,
                            o, l, h, u, p;
                        this._autoRotate = a ? a instanceof Array ? a : [
                            ["x", "y", "rotation", a === !0 ? 0 : Number(a) || 0]
                        ] : null;
                        for (o in s) this._props.push(o);
                        for (h = this._props.length; --h > -1;) o = this._props[h], this._overwriteProps.push(o), l = this._func[o] = "function" == typeof t[o], r[o] = l ? t[o.indexOf("set") || "function" != typeof t["get" + o.substr(3)] ? o : "get" + o.substr(3)]() : parseFloat(t[o]), p || r[o] !== n[0][o] && (p = r);
                        if (this._beziers = "cubic" !== e.type && "quadratic" !== e.type && "soft" !== e.type ? c(n, isNaN(e.curviness) ? 1 : e.curviness, !1, "thruBasic" === e.type, e.correlate, p) : f(n, e.type, r), this._segCount = this._beziers[o].length, this._timeRes) {
                            var g = d(this._beziers, this._timeRes);
                            this._length = g.length, this._lengths = g.lengths, this._segments = g.segments, this._l1 = this._li = this._s1 = this._si = 0, this._l2 = this._lengths[0], this._curSeg = this._segments[0], this._s2 = this._curSeg[0], this._prec = 1 / this._curSeg.length
                        }
                        if (a = this._autoRotate)
                            for (this._initialRotations = [], a[0] instanceof Array || (this._autoRotate = a = [a]), h = a.length; --h > -1;) {
                                for (u = 0; 3 > u; u++) o = a[h][u], this._func[o] = "function" == typeof t[o] ? t[o.indexOf("set") || "function" != typeof t["get" + o.substr(3)] ? o : "get" + o.substr(3)] : !1;
                                o = a[h][2], this._initialRotations[h] = this._func[o] ? this._func[o].call(this._target) : this._target[o]
                            }
                        return this._startRatio = i.vars.runBackwards ? 1 : 0, !0
                    },
                    set: function(e) {
                        var i = this._segCount,
                            n = this._func,
                            r = this._target,
                            s = e !== this._startRatio,
                            a, o, l, h, u, c, f, p, d, g;
                        if (this._timeRes) {
                            if (d = this._lengths, g = this._curSeg, e *= this._length, l = this._li, e > this._l2 && i - 1 > l) {
                                for (p = i - 1; p > l && (this._l2 = d[++l]) <= e;);
                                this._l1 = d[l - 1], this._li = l, this._curSeg = g = this._segments[l], this._s2 = g[this._s1 = this._si = 0]
                            } else if (e < this._l1 && l > 0) {
                                for (; l > 0 && (this._l1 = d[--l]) >= e;);
                                0 === l && e < this._l1 ? this._l1 = 0 : l++, this._l2 = d[l], this._li = l, this._curSeg = g = this._segments[l], this._s1 = g[(this._si = g.length - 1) - 1] || 0, this._s2 = g[this._si]
                            }
                            if (a = l, e -= this._l1, l = this._si, e > this._s2 && l < g.length - 1) {
                                for (p = g.length - 1; p > l && (this._s2 = g[++l]) <= e;);
                                this._s1 = g[l - 1], this._si = l
                            } else if (e < this._s1 && l > 0) {
                                for (; l > 0 && (this._s1 = g[--l]) >= e;);
                                0 === l && e < this._s1 ? this._s1 = 0 : l++, this._s2 = g[l], this._si = l
                            }
                            c = (l + (e - this._s1) / (this._s2 - this._s1)) * this._prec
                        } else a = 0 > e ? 0 : e >= 1 ? i - 1 : i * e >> 0, c = (e - a * (1 / i)) * i;
                        for (o = 1 - c, l = this._props.length; --l > -1;) h = this._props[l], u = this._beziers[h][a], f = (c * c * u.da + 3 * o * (c * u.ca + o * u.ba)) * c + u.a, this._round[h] && (f = Math.round(f)), n[h] ? r[h](f) : r[h] = f;
                        if (this._autoRotate) {
                            var m = this._autoRotate,
                                _, v, y, x, b, w, T;
                            for (l = m.length; --l > -1;) h = m[l][2], w = m[l][3] || 0, T = m[l][4] === !0 ? 1 : t, u = this._beziers[m[l][0]], _ = this._beziers[m[l][1]], u && _ && (u = u[a], _ = _[a], v = u.a + (u.b - u.a) * c, x = u.b + (u.c - u.b) * c, v += (x - v) * c, x += (u.c + (u.d - u.c) * c - x) * c, y = _.a + (_.b - _.a) * c, b = _.b + (_.c - _.b) * c, y += (b - y) * c, b += (_.c + (_.d - _.c) * c - b) * c, f = s ? Math.atan2(b - y, x - v) * T + w : this._initialRotations[l], n[h] ? r[h](f) : r[h] = f)
                        }
                    }
                }),
                m = g.prototype;
            g.bezierThrough = c, g.cubicToQuadratic = l, g._autoCSS = !0, g.quadraticToCubic = function(t, e, i) {
                return new a(t, (2 * e + t) / 3, (2 * e + i) / 3, i)
            }, g._cssRegister = function() {
                var t = s.CSSPlugin;
                if (t) {
                    var e = t._internals,
                        i = e._parseToProxy,
                        n = e._setPluginRatio,
                        r = e.CSSPropTween;
                    e._registerComplexSpecialProp("bezier", {
                        parser: function(t, e, s, a, o, l) {
                            e instanceof Array && (e = {
                                values: e
                            }), l = new g;
                            var h = e.values,
                                u = h.length - 1,
                                c = [],
                                f = {}, p, d, m;
                            if (0 > u) return o;
                            for (p = 0; u >= p; p++) m = i(t, h[p], a, o, l, u !== p), c[p] = m.end;
                            for (d in e) f[d] = e[d];
                            return f.values = c, o = new r(t, "bezier", 0, 0, m.pt, 2), o.data = m, o.plugin = l, o.setRatio = n, 0 === f.autoRotate && (f.autoRotate = !0), !f.autoRotate || f.autoRotate instanceof Array || (p = f.autoRotate === !0 ? 0 : Number(f.autoRotate), f.autoRotate = null != m.end.left ? [
                                ["left", "top", "rotation", p, !1]
                            ] : null != m.end.x ? [
                                ["x", "y", "rotation", p, !1]
                            ] : !1), f.autoRotate && (a._transform || a._enableTransforms(!1), m.autoRotate = a._target._gsTransform), l._onInitTween(m.proxy, f, a._tween), o
                        }
                    })
                }
            }, m._roundProps = function(t, e) {
                for (var i = this._overwriteProps, n = i.length; --n > -1;)(t[i[n]] || t.bezier || t.bezierThrough) && (this._round[i[n]] = e)
            }, m._kill = function(t) {
                var e = this._props,
                    i, n;
                for (i in this._beziers)
                    if (i in t)
                        for (delete this._beziers[i], delete this._func[i], n = e.length; --n > -1;) e[n] === i && e.splice(n, 1);
                return this._super._kill.call(this, t)
            }
        }(), _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function(t, e) {
        var i = function() {
                t.call(this, "css"), this._overwriteProps.length = 0, this.setRatio = i.prototype.setRatio
            }, n = _gsScope._gsDefine.globals,
            r, s, a, o, l = {}, h = i.prototype = new t("css");
        h.constructor = i, i.version = "1.15.2", i.API = 2, i.defaultTransformPerspective = 0, i.defaultSkewType = "compensated", h = "px", i.suffixMap = {
            top: h,
            right: h,
            bottom: h,
            left: h,
            width: h,
            height: h,
            fontSize: h,
            padding: h,
            margin: h,
            perspective: h,
            lineHeight: ""
        };
        var u = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
            c = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
            f = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
            p = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
            d = /(?:\d|\-|\+|=|#|\.)*/g,
            g = /opacity *= *([^)]*)/i,
            m = /opacity:([^;]*)/i,
            _ = /alpha\(opacity *=.+?\)/i,
            v = /^(rgb|hsl)/,
            y = /([A-Z])/g,
            x = /-([a-z])/gi,
            b = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
            w = function(t, e) {
                return e.toUpperCase()
            }, T = /(?:Left|Right|Width)/i,
            S = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
            C = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
            k = /,(?=[^\)]*(?:\(|$))/gi,
            P = Math.PI / 180,
            A = 180 / Math.PI,
            R = {}, O = document,
            M = function(t) {
                return O.createElementNS ? O.createElementNS("http://www.w3.org/1999/xhtml", t) : O.createElement(t)
            }, N = M("div"),
            L = M("img"),
            I = i._internals = {
                _specialProps: l
            }, D = navigator.userAgent,
            z, E, H, B, F, X, j = function() {
                var t = D.indexOf("Android"),
                    e = M("a");
                return H = -1 !== D.indexOf("Safari") && -1 === D.indexOf("Chrome") && (-1 === t || Number(D.substr(t + 8, 1)) > 3), F = H && Number(D.substr(D.indexOf("Version/") + 8, 1)) < 6, B = -1 !== D.indexOf("Firefox"), (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(D) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(D)) && (X = parseFloat(RegExp.$1)), e ? (e.style.cssText = "top:1px;opacity:.55;", /^0.55/.test(e.style.opacity)) : !1
            }(),
            Y = function(t) {
                return g.test("string" == typeof t ? t : (t.currentStyle ? t.currentStyle.filter : t.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1
            }, V = function(t) {
                window.console && console.log(t)
            }, q = "",
            U = "",
            K = function(t, e) {
                e = e || N;
                var i = e.style,
                    n, r;
                if (void 0 !== i[t]) return t;
                for (t = t.charAt(0).toUpperCase() + t.substr(1), n = ["O", "Moz", "ms", "Ms", "Webkit"], r = 5; --r > -1 && void 0 === i[n[r] + t];);
                return r >= 0 ? (U = 3 === r ? "ms" : n[r], q = "-" + U.toLowerCase() + "-", U + t) : null
            }, J = O.defaultView ? O.defaultView.getComputedStyle : function() {}, G = i.getStyle = function(t, e, i, n, r) {
                var s;
                return j || "opacity" !== e ? (!n && t.style[e] ? s = t.style[e] : (i = i || J(t)) ? s = i[e] || i.getPropertyValue(e) || i.getPropertyValue(e.replace(y, "-$1").toLowerCase()) : t.currentStyle && (s = t.currentStyle[e]), null == r || s && "none" !== s && "auto" !== s && "auto auto" !== s ? s : r) : Y(t)
            }, W = I.convertToPixels = function(t, n, r, s, a) {
                if ("px" === s || !s) return r;
                if ("auto" === s || !r) return 0;
                var o = T.test(n),
                    l = t,
                    h = N.style,
                    u = 0 > r,
                    c, f, p;
                if (u && (r = -r), "%" === s && -1 !== n.indexOf("border")) c = r / 100 * (o ? t.clientWidth : t.clientHeight);
                else {
                    if (h.cssText = "border:0 solid red;position:" + G(t, "position") + ";line-height:0;", "%" !== s && l.appendChild) h[o ? "borderLeftWidth" : "borderTopWidth"] = r + s;
                    else {
                        if (l = t.parentNode || O.body, f = l._gsCache, p = e.ticker.frame, f && o && f.time === p) return f.width * r / 100;
                        h[o ? "width" : "height"] = r + s
                    }
                    l.appendChild(N), c = parseFloat(N[o ? "offsetWidth" : "offsetHeight"]), l.removeChild(N), o && "%" === s && i.cacheWidths !== !1 && (f = l._gsCache = l._gsCache || {}, f.time = p, f.width = c / r * 100), 0 !== c || a || (c = W(t, n, r, s, !0))
                }
                return u ? -c : c
            }, Q = I.calculateOffset = function(t, e, i) {
                if ("absolute" !== G(t, "position", i)) return 0;
                var n = "left" === e ? "Left" : "Top",
                    r = G(t, "margin" + n, i);
                return t["offset" + n] - (W(t, e, parseFloat(r), r.replace(d, "")) || 0)
            }, Z = function(t, e) {
                var i = {}, n, r, s;
                if (e = e || J(t, null))
                    if (n = e.length)
                        for (; --n > -1;) s = e[n], (-1 === s.indexOf("-transform") || Ce === s) && (i[s.replace(x, w)] = e.getPropertyValue(s));
                    else
                        for (n in e)(-1 === n.indexOf("Transform") || Se === n) && (i[n] = e[n]);
                else if (e = t.currentStyle || t.style)
                    for (n in e) "string" == typeof n && void 0 === i[n] && (i[n.replace(x, w)] = e[n]);
                return j || (i.opacity = Y(t)), r = De(t, e, !1), i.rotation = r.rotation, i.skewX = r.skewX, i.scaleX = r.scaleX, i.scaleY = r.scaleY, i.x = r.x, i.y = r.y, Pe && (i.z = r.z, i.rotationX = r.rotationX, i.rotationY = r.rotationY, i.scaleZ = r.scaleZ), i.filters && delete i.filters, i
            }, te = function(t, e, i, n, r) {
                var s = {}, a = t.style,
                    o, l, h;
                for (l in i) "cssText" !== l && "length" !== l && isNaN(l) && (e[l] !== (o = i[l]) || r && r[l]) && -1 === l.indexOf("Origin") && ("number" == typeof o || "string" == typeof o) && (s[l] = "auto" !== o || "left" !== l && "top" !== l ? "" !== o && "auto" !== o && "none" !== o || "string" != typeof e[l] || "" === e[l].replace(p, "") ? o : 0 : Q(t, l), void 0 !== a[l] && (h = new ge(a, l, a[l], h)));
                if (n)
                    for (l in n) "className" !== l && (s[l] = n[l]);
                return {
                    difs: s,
                    firstMPT: h
                }
            }, ee = {
                width: ["Left", "Right"],
                height: ["Top", "Bottom"]
            }, ie = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
            ne = function(t, e, i) {
                var n = parseFloat("width" === e ? t.offsetWidth : t.offsetHeight),
                    r = ee[e],
                    s = r.length;
                for (i = i || J(t, null); --s > -1;) n -= parseFloat(G(t, "padding" + r[s], i, !0)) || 0, n -= parseFloat(G(t, "border" + r[s] + "Width", i, !0)) || 0;
                return n
            }, re = function(t, e) {
                (null == t || "" === t || "auto" === t || "auto auto" === t) && (t = "0 0");
                var i = t.split(" "),
                    n = -1 !== t.indexOf("left") ? "0%" : -1 !== t.indexOf("right") ? "100%" : i[0],
                    r = -1 !== t.indexOf("top") ? "0%" : -1 !== t.indexOf("bottom") ? "100%" : i[1];
                return null == r ? r = "center" === n ? "50%" : "0" : "center" === r && (r = "50%"), ("center" === n || isNaN(parseFloat(n)) && -1 === (n + "").indexOf("=")) && (n = "50%"), e && (e.oxp = -1 !== n.indexOf("%"), e.oyp = -1 !== r.indexOf("%"), e.oxr = "=" === n.charAt(1), e.oyr = "=" === r.charAt(1), e.ox = parseFloat(n.replace(p, "")), e.oy = parseFloat(r.replace(p, ""))), n + " " + r + (i.length > 2 ? " " + i[2] : "")
            }, se = function(t, e) {
                return "string" == typeof t && "=" === t.charAt(1) ? parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)) : parseFloat(t) - parseFloat(e)
            }, ae = function(t, e) {
                return null == t ? e : "string" == typeof t && "=" === t.charAt(1) ? parseInt(t.charAt(0) + "1", 10) * parseFloat(t.substr(2)) + e : parseFloat(t)
            }, oe = function(t, e, i, n) {
                var r = 1e-6,
                    s, a, o, l, h;
                return null == t ? l = e : "number" == typeof t ? l = t : (s = 360, a = t.split("_"), h = "=" === t.charAt(1), o = (h ? parseInt(t.charAt(0) + "1", 10) * parseFloat(a[0].substr(2)) : parseFloat(a[0])) * (-1 === t.indexOf("rad") ? 1 : A) - (h ? 0 : e), a.length && (n && (n[i] = e + o), -1 !== t.indexOf("short") && (o %= s, o !== o % (s / 2) && (o = 0 > o ? o + s : o - s)), -1 !== t.indexOf("_cw") && 0 > o ? o = (o + 9999999999 * s) % s - (o / s | 0) * s : -1 !== t.indexOf("ccw") && o > 0 && (o = (o - 9999999999 * s) % s - (o / s | 0) * s)), l = e + o), r > l && l > -r && (l = 0), l
            }, le = {
                aqua: [0, 255, 255],
                lime: [0, 255, 0],
                silver: [192, 192, 192],
                black: [0, 0, 0],
                maroon: [128, 0, 0],
                teal: [0, 128, 128],
                blue: [0, 0, 255],
                navy: [0, 0, 128],
                white: [255, 255, 255],
                fuchsia: [255, 0, 255],
                olive: [128, 128, 0],
                yellow: [255, 255, 0],
                orange: [255, 165, 0],
                gray: [128, 128, 128],
                purple: [128, 0, 128],
                green: [0, 128, 0],
                red: [255, 0, 0],
                pink: [255, 192, 203],
                cyan: [0, 255, 255],
                transparent: [255, 255, 255, 0]
            }, he = function(t, e, i) {
                return t = 0 > t ? t + 1 : t > 1 ? t - 1 : t, 255 * (1 > 6 * t ? e + (i - e) * t * 6 : .5 > t ? i : 2 > 3 * t ? e + (i - e) * (2 / 3 - t) * 6 : e) + .5 | 0
            }, ue = i.parseColor = function(t) {
                var e, i, n, r, s, a;
                return t && "" !== t ? "number" == typeof t ? [t >> 16, t >> 8 & 255, 255 & t] : ("," === t.charAt(t.length - 1) && (t = t.substr(0, t.length - 1)), le[t] ? le[t] : "#" === t.charAt(0) ? (4 === t.length && (e = t.charAt(1), i = t.charAt(2), n = t.charAt(3), t = "#" + e + e + i + i + n + n), t = parseInt(t.substr(1), 16), [t >> 16, t >> 8 & 255, 255 & t]) : "hsl" === t.substr(0, 3) ? (t = t.match(u), r = Number(t[0]) % 360 / 360, s = Number(t[1]) / 100, a = Number(t[2]) / 100, i = .5 >= a ? a * (s + 1) : a + s - a * s, e = 2 * a - i, t.length > 3 && (t[3] = Number(t[3])), t[0] = he(r + 1 / 3, e, i), t[1] = he(r, e, i), t[2] = he(r - 1 / 3, e, i), t) : (t = t.match(u) || le.transparent, t[0] = Number(t[0]), t[1] = Number(t[1]), t[2] = Number(t[2]), t.length > 3 && (t[3] = Number(t[3])), t)) : le.black
            }, ce = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";
        for (h in le) ce += "|" + h + "\\b";
        ce = new RegExp(ce + ")", "gi");
        var fe = function(t, e, i, n) {
            if (null == t) return function(t) {
                return t
            };
            var r = e ? (t.match(ce) || [""])[0] : "",
                s = t.split(r).join("").match(f) || [],
                a = t.substr(0, t.indexOf(s[0])),
                o = ")" === t.charAt(t.length - 1) ? ")" : "",
                l = -1 !== t.indexOf(" ") ? " " : ",",
                h = s.length,
                c = h > 0 ? s[0].replace(u, "") : "",
                p;
            return h ? p = e ? function(t) {
                var e, u, d, g;
                if ("number" == typeof t) t += c;
                else if (n && k.test(t)) {
                    for (g = t.replace(k, "|").split("|"), d = 0; d < g.length; d++) g[d] = p(g[d]);
                    return g.join(",")
                }
                if (e = (t.match(ce) || [r])[0], u = t.split(e).join("").match(f) || [], d = u.length, h > d--)
                    for (; ++d < h;) u[d] = i ? u[(d - 1) / 2 | 0] : s[d];
                return a + u.join(l) + l + e + o + (-1 !== t.indexOf("inset") ? " inset" : "")
            } : function(t) {
                var e, r, u;
                if ("number" == typeof t) t += c;
                else if (n && k.test(t)) {
                    for (r = t.replace(k, "|").split("|"), u = 0; u < r.length; u++) r[u] = p(r[u]);
                    return r.join(",")
                }
                if (e = t.match(f) || [], u = e.length, h > u--)
                    for (; ++u < h;) e[u] = i ? e[(u - 1) / 2 | 0] : s[u];
                return a + e.join(l) + o
            } : function(t) {
                return t
            }
        }, pe = function(t) {
            return t = t.split(","),
                function(e, i, n, r, s, a, o) {
                    var l = (i + "").split(" "),
                        h;
                    for (o = {}, h = 0; 4 > h; h++) o[t[h]] = l[h] = l[h] || l[(h - 1) / 2 >> 0];
                    return r.parse(e, o, s, a)
                }
        }, de = I._setPluginRatio = function(t) {
            this.plugin.setRatio(t);
            for (var e = this.data, i = e.proxy, n = e.firstMPT, r = 1e-6, s, a, o, l; n;) s = i[n.v], n.r ? s = Math.round(s) : r > s && s > -r && (s = 0), n.t[n.p] = s, n = n._next;
            if (e.autoRotate && (e.autoRotate.rotation = i.rotation), 1 === t)
                for (n = e.firstMPT; n;) {
                    if (a = n.t, a.type) {
                        if (1 === a.type) {
                            for (l = a.xs0 + a.s + a.xs1, o = 1; o < a.l; o++) l += a["xn" + o] + a["xs" + (o + 1)];
                            a.e = l
                        }
                    } else a.e = a.s + a.xs0;
                    n = n._next
                }
        }, ge = function(t, e, i, n, r) {
            this.t = t, this.p = e, this.v = i, this.r = r, n && (n._prev = this, this._next = n)
        }, me = I._parseToProxy = function(t, e, i, n, r, s) {
            var a = n,
                o = {}, l = {}, h = i._transform,
                u = R,
                c, f, p, d, g;
            for (i._transform = null, R = e, n = g = i.parse(t, e, n, r), R = u, s && (i._transform = h, a && (a._prev = null, a._prev && (a._prev._next = null))); n && n !== a;) {
                if (n.type <= 1 && (f = n.p, l[f] = n.s + n.c, o[f] = n.s, s || (d = new ge(n, "s", f, d, n.r), n.c = 0), 1 === n.type))
                    for (c = n.l; --c > 0;) p = "xn" + c, f = n.p + "_" + p, l[f] = n.data[p], o[f] = n[p], s || (d = new ge(n, p, f, d, n.rxp[p]));
                n = n._next
            }
            return {
                proxy: o,
                end: l,
                firstMPT: d,
                pt: g
            }
        }, _e = I.CSSPropTween = function(t, e, i, n, s, a, l, h, u, c, f) {
            this.t = t, this.p = e, this.s = i, this.c = n, this.n = l || e, t instanceof _e || o.push(this.n), this.r = h, this.type = a || 0, u && (this.pr = u, r = !0), this.b = void 0 === c ? i : c, this.e = void 0 === f ? i + n : f, s && (this._next = s, s._prev = this)
        }, ve = i.parseComplex = function(t, e, i, n, r, s, a, o, l, h) {
            i = i || s || "", a = new _e(t, e, 0, 0, a, h ? 2 : 1, null, !1, o, i, n), n += "";
            var f = i.split(", ").join(",").split(" "),
                p = n.split(", ").join(",").split(" "),
                d = f.length,
                g = z !== !1,
                m, _, y, x, b, w, T, S, C, P, A, R;
            for ((-1 !== n.indexOf(",") || -1 !== i.indexOf(",")) && (f = f.join(" ").replace(k, ", ").split(" "), p = p.join(" ").replace(k, ", ").split(" "), d = f.length), d !== p.length && (f = (s || "").split(" "), d = f.length), a.plugin = l, a.setRatio = h, m = 0; d > m; m++)
                if (x = f[m], b = p[m], S = parseFloat(x), S || 0 === S) a.appendXtra("", S, se(b, S), b.replace(c, ""), g && -1 !== b.indexOf("px"), !0);
                else if (r && ("#" === x.charAt(0) || le[x] || v.test(x))) R = "," === b.charAt(b.length - 1) ? ")," : ")", x = ue(x), b = ue(b), C = x.length + b.length > 6, C && !j && 0 === b[3] ? (a["xs" + a.l] += a.l ? " transparent" : "transparent", a.e = a.e.split(p[m]).join("transparent")) : (j || (C = !1), a.appendXtra(C ? "rgba(" : "rgb(", x[0], b[0] - x[0], ",", !0, !0).appendXtra("", x[1], b[1] - x[1], ",", !0).appendXtra("", x[2], b[2] - x[2], C ? "," : R, !0), C && (x = x.length < 4 ? 1 : x[3], a.appendXtra("", x, (b.length < 4 ? 1 : b[3]) - x, R, !1)));
                else if (w = x.match(u)) {
                    if (T = b.match(c), !T || T.length !== w.length) return a;
                    for (y = 0, _ = 0; _ < w.length; _++) A = w[_], P = x.indexOf(A, y), a.appendXtra(x.substr(y, P - y), Number(A), se(T[_], A), "", g && "px" === x.substr(P + A.length, 2), 0 === _), y = P + A.length;
                    a["xs" + a.l] += x.substr(y)
                } else a["xs" + a.l] += a.l ? " " + x : x; if (-1 !== n.indexOf("=") && a.data) {
                for (R = a.xs0 + a.data.s, m = 1; m < a.l; m++) R += a["xs" + m] + a.data["xn" + m];
                a.e = R + a["xs" + m]
            }
            return a.l || (a.type = -1, a.xs0 = a.e), a.xfirst || a
        }, ye = 9;
        for (h = _e.prototype, h.l = h.pr = 0; --ye > 0;) h["xn" + ye] = 0, h["xs" + ye] = "";
        h.xs0 = "", h._next = h._prev = h.xfirst = h.data = h.plugin = h.setRatio = h.rxp = null, h.appendXtra = function(t, e, i, n, r, s) {
            var a = this,
                o = a.l;
            return a["xs" + o] += s && o ? " " + t : t || "", i || 0 === o || a.plugin ? (a.l++, a.type = a.setRatio ? 2 : 1, a["xs" + a.l] = n || "", o > 0 ? (a.data["xn" + o] = e + i, a.rxp["xn" + o] = r, a["xn" + o] = e, a.plugin || (a.xfirst = new _e(a, "xn" + o, e, i, a.xfirst || a, 0, a.n, r, a.pr), a.xfirst.xs0 = 0), a) : (a.data = {
                s: e + i
            }, a.rxp = {}, a.s = e, a.c = i, a.r = r, a)) : (a["xs" + o] += e + (n || ""), a)
        };
        var xe = function(t, e) {
            e = e || {}, this.p = e.prefix ? K(t) || t : t, l[t] = l[this.p] = this, this.format = e.formatter || fe(e.defaultValue, e.color, e.collapsible, e.multi), e.parser && (this.parse = e.parser), this.clrs = e.color, this.multi = e.multi, this.keyword = e.keyword, this.dflt = e.defaultValue, this.pr = e.priority || 0
        }, be = I._registerComplexSpecialProp = function(t, e, i) {
            "object" != typeof e && (e = {
                parser: i
            });
            var n = t.split(","),
                r = e.defaultValue,
                s, a;
            for (i = i || [r], s = 0; s < n.length; s++) e.prefix = 0 === s && e.prefix, e.defaultValue = i[s] || r, a = new xe(n[s], e)
        }, we = function(t) {
            if (!l[t]) {
                var e = t.charAt(0).toUpperCase() + t.substr(1) + "Plugin";
                be(t, {
                    parser: function(t, i, r, s, a, o, h) {
                        var u = n.com.greensock.plugins[e];
                        return u ? (u._cssRegister(), l[r].parse(t, i, r, s, a, o, h)) : (V("Error: " + e + " js file not loaded."), a)
                    }
                })
            }
        };
        h = xe.prototype, h.parseComplex = function(t, e, i, n, r, s) {
            var a = this.keyword,
                o, l, h, u, c, f;
            if (this.multi && (k.test(i) || k.test(e) ? (l = e.replace(k, "|").split("|"), h = i.replace(k, "|").split("|")) : a && (l = [e], h = [i])), h) {
                for (u = h.length > l.length ? h.length : l.length, o = 0; u > o; o++) e = l[o] = l[o] || this.dflt, i = h[o] = h[o] || this.dflt, a && (c = e.indexOf(a), f = i.indexOf(a), c !== f && (i = -1 === f ? h : l, i[o] += " " + a));
                e = l.join(", "), i = h.join(", ")
            }
            return ve(t, this.p, e, i, this.clrs, this.dflt, n, this.pr, r, s)
        }, h.parse = function(t, e, i, n, r, s, o) {
            return this.parseComplex(t.style, this.format(G(t, this.p, a, !1, this.dflt)), this.format(e), r, s)
        }, i.registerSpecialProp = function(t, e, i) {
            be(t, {
                parser: function(t, n, r, s, a, o, l) {
                    var h = new _e(t, r, 0, 0, a, 2, r, !1, i);
                    return h.plugin = o, h.setRatio = e(t, n, s._tween, r), h
                },
                priority: i
            })
        };
        var Te = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
            Se = K("transform"),
            Ce = q + "transform",
            ke = K("transformOrigin"),
            Pe = null !== K("perspective"),
            Ae = I.Transform = function() {
                this.perspective = parseFloat(i.defaultTransformPerspective) || 0, this.force3D = i.defaultForce3D !== !1 && Pe ? i.defaultForce3D || "auto" : !1
            }, Re = window.SVGElement,
            Oe, Me = function(t, e, i) {
                var n = O.createElementNS("http://www.w3.org/2000/svg", t),
                    r = /([a-z])([A-Z])/g,
                    s;
                for (s in i) n.setAttributeNS(null, s.replace(r, "$1-$2").toLowerCase(), i[s]);
                return e.appendChild(n), n
            }, Ne = O.documentElement,
            Le = function() {
                var t = X || /Android/i.test(D) && !window.chrome,
                    e, i, n;
                return O.createElementNS && !t && (e = Me("svg", Ne), i = Me("rect", e, {
                    width: 100,
                    height: 50,
                    x: 100
                }), n = i.getBoundingClientRect().width, i.style[ke] = "50% 50%", i.style[Se] = "scaleX(0.5)", t = n === i.getBoundingClientRect().width && !(B && Pe), Ne.removeChild(e)), t
            }(),
            Ie = function(t, e, i, n) {
                var r, s;
                n && (s = n.split(" ")).length || (r = t.getBBox(), e = re(e).split(" "), s = [(-1 !== e[0].indexOf("%") ? parseFloat(e[0]) / 100 * r.width : parseFloat(e[0])) + r.x, (-1 !== e[1].indexOf("%") ? parseFloat(e[1]) / 100 * r.height : parseFloat(e[1])) + r.y]), i.xOrigin = parseFloat(s[0]), i.yOrigin = parseFloat(s[1]), t.setAttribute("data-svg-origin", s.join(" "))
            }, De = I.getTransform = function(t, e, n, r) {
                if (t._gsTransform && n && !r) return t._gsTransform;
                var s = n ? t._gsTransform || new Ae : new Ae,
                    o = s.scaleX < 0,
                    l = 2e-5,
                    h = 1e5,
                    u = Pe ? parseFloat(G(t, ke, e, !1, "0 0 0").split(" ")[2]) || s.zOrigin || 0 : 0,
                    c = parseFloat(i.defaultTransformPerspective) || 0,
                    f, p, d, g, m, _, v, y, x, b;
                if (Se ? p = G(t, Ce, e) : t.currentStyle && (p = t.currentStyle.filter.match(S), p = p && 4 === p.length ? [p[0].substr(4), Number(p[2].substr(4)), Number(p[1].substr(4)), p[3].substr(4), s.x || 0, s.y || 0].join(",") : ""), f = !p || "none" === p || "matrix(1, 0, 0, 1, 0, 0)" === p, s.svg = !! (Re && "function" == typeof t.getBBox && t.getCTM && (!t.parentNode || t.parentNode.getBBox && t.parentNode.getCTM)), s.svg && (Ie(t, G(t, ke, a, !1, "50% 50%") + "", s, t.getAttribute("data-svg-origin")), Oe = i.useSVGTransformAttr || Le, d = t.getAttribute("transform"), f && d && -1 !== d.indexOf("matrix") && (p = d, f = 0)), !f) {
                    for (d = (p || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [], g = d.length; --g > -1;) m = Number(d[g]), d[g] = (_ = m - (m |= 0)) ? (_ * h + (0 > _ ? -.5 : .5) | 0) / h + m : m;
                    if (16 === d.length) {
                        var w = d[0],
                            T = d[1],
                            C = d[2],
                            k = d[3],
                            P = d[4],
                            R = d[5],
                            O = d[6],
                            M = d[7],
                            N = d[8],
                            L = d[9],
                            I = d[10],
                            D = d[12],
                            z = d[13],
                            E = d[14],
                            H = d[11],
                            B = Math.atan2(O, I),
                            F, X, j, Y, V, q;
                        s.zOrigin && (E = -s.zOrigin, D = N * E - d[12], z = L * E - d[13], E = I * E + s.zOrigin - d[14]), s.rotationX = B * A, B && (V = Math.cos(-B), q = Math.sin(-B), F = P * V + N * q, X = R * V + L * q, j = O * V + I * q, N = P * -q + N * V, L = R * -q + L * V, I = O * -q + I * V, H = M * -q + H * V, P = F, R = X, O = j), B = Math.atan2(N, I), s.rotationY = B * A, B && (V = Math.cos(-B), q = Math.sin(-B), F = w * V - N * q, X = T * V - L * q, j = C * V - I * q, L = T * q + L * V, I = C * q + I * V, H = k * q + H * V, w = F, T = X, C = j), B = Math.atan2(T, w), s.rotation = B * A, B && (V = Math.cos(-B), q = Math.sin(-B), w = w * V + P * q, X = T * V + R * q, R = T * -q + R * V, O = C * -q + O * V, T = X), s.rotationX && Math.abs(s.rotationX) + Math.abs(s.rotation) > 359.9 && (s.rotationX = s.rotation = 0, s.rotationY += 180), s.scaleX = (Math.sqrt(w * w + T * T) * h + .5 | 0) / h, s.scaleY = (Math.sqrt(R * R + L * L) * h + .5 | 0) / h, s.scaleZ = (Math.sqrt(O * O + I * I) * h + .5 | 0) / h, s.skewX = 0, s.perspective = H ? 1 / (0 > H ? -H : H) : 0, s.x = D, s.y = z, s.z = E, s.svg && (s.x -= s.xOrigin - (s.xOrigin * w - s.yOrigin * P), s.y -= s.yOrigin - (s.yOrigin * T - s.xOrigin * R))
                    } else if (!(Pe && !r && d.length && s.x === d[4] && s.y === d[5] && (s.rotationX || s.rotationY) || void 0 !== s.x && "none" === G(t, "display", e))) {
                        var U = d.length >= 6,
                            K = U ? d[0] : 1,
                            J = d[1] || 0,
                            W = d[2] || 0,
                            Q = U ? d[3] : 1;
                        s.x = d[4] || 0, s.y = d[5] || 0, v = Math.sqrt(K * K + J * J), y = Math.sqrt(Q * Q + W * W), x = K || J ? Math.atan2(J, K) * A : s.rotation || 0, b = W || Q ? Math.atan2(W, Q) * A + x : s.skewX || 0, Math.abs(b) > 90 && Math.abs(b) < 270 && (o ? (v *= -1, b += 0 >= x ? 180 : -180, x += 0 >= x ? 180 : -180) : (y *= -1, b += 0 >= b ? 180 : -180)), s.scaleX = v, s.scaleY = y, s.rotation = x, s.skewX = b, Pe && (s.rotationX = s.rotationY = s.z = 0, s.perspective = c, s.scaleZ = 1), s.svg && (s.x -= s.xOrigin - (s.xOrigin * K - s.yOrigin * J), s.y -= s.yOrigin - (s.yOrigin * Q - s.xOrigin * W))
                    }
                    s.zOrigin = u;
                    for (g in s) s[g] < l && s[g] > -l && (s[g] = 0)
                }
                return n && (t._gsTransform = s), s
            }, ze = function(t) {
                var e = this.data,
                    i = -e.rotation * P,
                    n = i + e.skewX * P,
                    r = 1e5,
                    s = (Math.cos(i) * e.scaleX * r | 0) / r,
                    a = (Math.sin(i) * e.scaleX * r | 0) / r,
                    o = (Math.sin(n) * -e.scaleY * r | 0) / r,
                    l = (Math.cos(n) * e.scaleY * r | 0) / r,
                    h = this.t.style,
                    u = this.t.currentStyle,
                    c, f;
                if (u) {
                    f = a, a = -o, o = -f, c = u.filter, h.filter = "";
                    var p = this.t.offsetWidth,
                        m = this.t.offsetHeight,
                        _ = "absolute" !== u.position,
                        v = "progid:DXImageTransform.Microsoft.Matrix(M11=" + s + ", M12=" + a + ", M21=" + o + ", M22=" + l,
                        y = e.x + p * e.xPercent / 100,
                        x = e.y + m * e.yPercent / 100,
                        b, w;
                    if (null != e.ox && (b = (e.oxp ? p * e.ox * .01 : e.ox) - p / 2, w = (e.oyp ? m * e.oy * .01 : e.oy) - m / 2, y += b - (b * s + w * a), x += w - (b * o + w * l)), _ ? (b = p / 2, w = m / 2, v += ", Dx=" + (b - (b * s + w * a) + y) + ", Dy=" + (w - (b * o + w * l) + x) + ")") : v += ", sizingMethod='auto expand')", h.filter = -1 !== c.indexOf("DXImageTransform.Microsoft.Matrix(") ? c.replace(C, v) : v + " " + c, (0 === t || 1 === t) && 1 === s && 0 === a && 0 === o && 1 === l && (_ && -1 === v.indexOf("Dx=0, Dy=0") || g.test(c) && 100 !== parseFloat(RegExp.$1) || -1 === c.indexOf("gradient(" && c.indexOf("Alpha")) && h.removeAttribute("filter")), !_) {
                        var T = 8 > X ? 1 : -1,
                            S, k, A;
                        for (b = e.ieOffsetX || 0, w = e.ieOffsetY || 0, e.ieOffsetX = Math.round((p - ((0 > s ? -s : s) * p + (0 > a ? -a : a) * m)) / 2 + y), e.ieOffsetY = Math.round((m - ((0 > l ? -l : l) * m + (0 > o ? -o : o) * p)) / 2 + x), ye = 0; 4 > ye; ye++) k = ie[ye], S = u[k], f = -1 !== S.indexOf("px") ? parseFloat(S) : W(this.t, k, parseFloat(S), S.replace(d, "")) || 0, A = f !== e[k] ? 2 > ye ? -e.ieOffsetX : -e.ieOffsetY : 2 > ye ? b - e.ieOffsetX : w - e.ieOffsetY, h[k] = (e[k] = Math.round(f - A * (0 === ye || 2 === ye ? 1 : T))) + "px"
                    }
                }
            }, Ee = I.set3DTransformRatio = function(t) {
                var e = this.data,
                    i = this.t.style,
                    n = e.rotation * P,
                    r = e.scaleX,
                    s = e.scaleY,
                    a = e.scaleZ,
                    o = e.x,
                    l = e.y,
                    h = e.z,
                    u = e.perspective,
                    c, f, p, d, g, m, _, v, y, x, b, w, T, S, C, k, A, R, O, M, N;
                if (!(1 !== t && 0 !== t && e.force3D || e.force3D === !0 || e.rotationY || e.rotationX || 1 !== a || u || h || this.tween._totalTime !== this.tween._totalDuration && this.tween._totalTime)) return void He.call(this, t);
                if (B && (S = 1e-4, S > r && r > -S && (r = a = 2e-5), S > s && s > -S && (s = a = 2e-5), !u || e.z || e.rotationX || e.rotationY || (u = 0)), n || e.skewX) C = c = Math.cos(n), k = d = Math.sin(n), e.skewX && (n -= e.skewX * P, C = Math.cos(n), k = Math.sin(n), "simple" === e.skewType && (A = Math.tan(e.skewX * P), A = Math.sqrt(1 + A * A), C *= A, k *= A)), f = -k, g = C;
                else {
                    if (!(e.rotationY || e.rotationX || 1 !== a || u || e.svg)) return void(i[Se] = (e.xPercent || e.yPercent ? "translate(" + e.xPercent + "%," + e.yPercent + "%) translate3d(" : "translate3d(") + o + "px," + l + "px," + h + "px)" + (1 !== r || 1 !== s ? " scale(" + r + "," + s + ")" : ""));
                    c = g = 1, f = d = 0
                }
                y = 1, p = m = _ = v = x = b = 0, w = u ? -1 / u : 0, T = e.zOrigin, S = 1e-6, M = ",", N = "0", n = e.rotationY * P, n && (C = Math.cos(n), k = Math.sin(n), _ = -k, x = w * -k, p = c * k, m = d * k, y = C, w *= C, c *= C, d *= C), n = e.rotationX * P, n && (C = Math.cos(n), k = Math.sin(n), A = f * C + p * k, R = g * C + m * k, v = y * k, b = w * k, p = f * -k + p * C, m = g * -k + m * C, y *= C, w *= C, f = A, g = R), 1 !== a && (p *= a, m *= a, y *= a, w *= a), 1 !== s && (f *= s, g *= s, v *= s, b *= s), 1 !== r && (c *= r, d *= r, _ *= r, x *= r), (T || e.svg) && (T && (o += p * -T, l += m * -T, h += y * -T + T), e.svg && (o += e.xOrigin - (e.xOrigin * c + e.yOrigin * f), l += e.yOrigin - (e.xOrigin * d + e.yOrigin * g)), S > o && o > -S && (o = N), S > l && l > -S && (l = N), S > h && h > -S && (h = 0)), O = e.xPercent || e.yPercent ? "translate(" + e.xPercent + "%," + e.yPercent + "%) matrix3d(" : "matrix3d(", O += (S > c && c > -S ? N : c) + M + (S > d && d > -S ? N : d) + M + (S > _ && _ > -S ? N : _), O += M + (S > x && x > -S ? N : x) + M + (S > f && f > -S ? N : f) + M + (S > g && g > -S ? N : g), e.rotationX || e.rotationY ? (O += M + (S > v && v > -S ? N : v) + M + (S > b && b > -S ? N : b) + M + (S > p && p > -S ? N : p), O += M + (S > m && m > -S ? N : m) + M + (S > y && y > -S ? N : y) + M + (S > w && w > -S ? N : w) + M) : O += ",0,0,0,0,1,0,", O += o + M + l + M + h + M + (u ? 1 + -h / u : 1) + ")", i[Se] = O
            }, He = I.set2DTransformRatio = function(t) {
                var e = this.data,
                    i = this.t,
                    n = i.style,
                    r = e.x,
                    s = e.y,
                    a, o, l, h, u, c, f, p, d, g, m, _;
                return !(e.rotationX || e.rotationY || e.z || e.force3D === !0 || "auto" === e.force3D && 1 !== t && 0 !== t) || e.svg && Oe || !Pe ? (h = e.scaleX, u = e.scaleY, void(e.rotation || e.skewX || e.svg ? (a = e.rotation * P, o = e.skewX * P, l = 1e5, c = Math.cos(a) * h, f = Math.sin(a) * h, p = Math.sin(a - o) * -u, d = Math.cos(a - o) * u, o && "simple" === e.skewType && (_ = Math.tan(o), _ = Math.sqrt(1 + _ * _), p *= _, d *= _), e.svg && (r += e.xOrigin - (e.xOrigin * c + e.yOrigin * p), s += e.yOrigin - (e.xOrigin * f + e.yOrigin * d), m = 1e-6, m > r && r > -m && (r = 0), m > s && s > -m && (s = 0)), g = (c * l | 0) / l + "," + (f * l | 0) / l + "," + (p * l | 0) / l + "," + (d * l | 0) / l + "," + r + "," + s + ")", e.svg && Oe ? i.setAttribute("transform", "matrix(" + g) : n[Se] = (e.xPercent || e.yPercent ? "translate(" + e.xPercent + "%," + e.yPercent + "%) matrix(" : "matrix(") + g) : n[Se] = (e.xPercent || e.yPercent ? "translate(" + e.xPercent + "%," + e.yPercent + "%) matrix(" : "matrix(") + h + ",0,0," + u + "," + r + "," + s + ")")) : (this.setRatio = Ee, void Ee.call(this, t))
            };
        h = Ae.prototype, h.x = h.y = h.z = h.skewX = h.skewY = h.rotation = h.rotationX = h.rotationY = h.zOrigin = h.xPercent = h.yPercent = 0, h.scaleX = h.scaleY = h.scaleZ = 1, be("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigintransformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent", {
            parser: function(t, e, n, r, s, o, l) {
                if (r._lastParsedTransform === l) return s;
                r._lastParsedTransform = l;
                var h = r._transform = De(t, a, !0, l.parseTransform),
                    u = t.style,
                    c = 1e-6,
                    f = Te.length,
                    p = l,
                    d = {}, g, m, _, v, y, x, b;
                if ("string" == typeof p.transform && Se) _ = N.style, _[Se] = p.transform, _.display = "block", _.position = "absolute", O.body.appendChild(N), g = De(N, null, !1), O.body.removeChild(N);
                else if ("object" == typeof p) {
                    if (g = {
                        scaleX: ae(null != p.scaleX ? p.scaleX : p.scale, h.scaleX),
                        scaleY: ae(null != p.scaleY ? p.scaleY : p.scale, h.scaleY),
                        scaleZ: ae(p.scaleZ, h.scaleZ),
                        x: ae(p.x, h.x),
                        y: ae(p.y, h.y),
                        z: ae(p.z, h.z),
                        xPercent: ae(p.xPercent, h.xPercent),
                        yPercent: ae(p.yPercent, h.yPercent),
                        perspective: ae(p.transformPerspective, h.perspective)
                    }, b = p.directionalRotation, null != b)
                        if ("object" == typeof b)
                            for (_ in b) p[_] = b[_];
                        else p.rotation = b;
                    "string" == typeof p.x && -1 !== p.x.indexOf("%") && (g.x = 0, g.xPercent = ae(p.x, h.xPercent)), "string" == typeof p.y && -1 !== p.y.indexOf("%") && (g.y = 0, g.yPercent = ae(p.y, h.yPercent)), g.rotation = oe("rotation" in p ? p.rotation : "shortRotation" in p ? p.shortRotation + "_short" : "rotationZ" in p ? p.rotationZ : h.rotation, h.rotation, "rotation", d), Pe && (g.rotationX = oe("rotationX" in p ? p.rotationX : "shortRotationX" in p ? p.shortRotationX + "_short" : h.rotationX || 0, h.rotationX, "rotationX", d), g.rotationY = oe("rotationY" in p ? p.rotationY : "shortRotationY" in p ? p.shortRotationY + "_short" : h.rotationY || 0, h.rotationY, "rotationY", d)), g.skewX = null == p.skewX ? h.skewX : oe(p.skewX, h.skewX), g.skewY = null == p.skewY ? h.skewY : oe(p.skewY, h.skewY), (m = g.skewY - h.skewY) && (g.skewX += m, g.rotation += m)
                }
                for (Pe && null != p.force3D && (h.force3D = p.force3D, x = !0), h.skewType = p.skewType || h.skewType || i.defaultSkewType, y = h.force3D || h.z || h.rotationX || h.rotationY || g.z || g.rotationX || g.rotationY || g.perspective, y || null == p.scale || (g.scaleZ = 1); --f > -1;) n = Te[f], v = g[n] - h[n], (v > c || -c > v || null != p[n] || null != R[n]) && (x = !0, s = new _e(h, n, h[n], v, s), n in d && (s.e = d[n]), s.xs0 = 0, s.plugin = o, r._overwriteProps.push(s.n));
                return v = p.transformOrigin, h.svg && (v || p.svgOrigin) && (Ie(t, re(v), g, p.svgOrigin), s = new _e(h, "xOrigin", h.xOrigin, g.xOrigin - h.xOrigin, s, -1, "transformOrigin"), s.b = h.xOrigin, s.e = s.xs0 = g.xOrigin, s = new _e(h, "yOrigin", h.yOrigin, g.yOrigin - h.yOrigin, s, -1, "transformOrigin"), s.b = h.yOrigin, s.e = s.xs0 = g.yOrigin, v = "0px 0px"), (v || Pe && y && h.zOrigin) && (Se ? (x = !0, n = ke, v = (v || G(t, n, a, !1, "50% 50%")) + "", s = new _e(u, n, 0, 0, s, -1, "transformOrigin"), s.b = u[n], s.plugin = o, Pe ? (_ = h.zOrigin, v = v.split(" "), h.zOrigin = (v.length > 2 && (0 === _ || "0px" !== v[2]) ? parseFloat(v[2]) : _) || 0, s.xs0 = s.e = v[0] + " " + (v[1] || "50%") + " 0px", s = new _e(h, "zOrigin", 0, 0, s, -1, s.n), s.b = _, s.xs0 = s.e = h.zOrigin) : s.xs0 = s.e = v) : re(v + "", h)), x && (r._transformType = h.svg && Oe || !y && 3 !== this._transformType ? 2 : 3), s
            },
            prefix: !0
        }), be("boxShadow", {
            defaultValue: "0px 0px 0px 0px #999",
            prefix: !0,
            color: !0,
            multi: !0,
            keyword: "inset"
        }), be("borderRadius", {
            defaultValue: "0px",
            parser: function(t, e, i, n, r, o) {
                e = this.format(e);
                var l = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
                    h = t.style,
                    u, c, f, p, d, g, m, _, v, y, x, b, w, T, S, C;
                for (v = parseFloat(t.offsetWidth), y = parseFloat(t.offsetHeight), u = e.split(" "), c = 0; c < l.length; c++) this.p.indexOf("border") && (l[c] = K(l[c])), d = p = G(t, l[c], a, !1, "0px"), -1 !== d.indexOf(" ") && (p = d.split(" "), d = p[0], p = p[1]), g = f = u[c], m = parseFloat(d), b = d.substr((m + "").length), w = "=" === g.charAt(1), w ? (_ = parseInt(g.charAt(0) + "1", 10), g = g.substr(2), _ *= parseFloat(g), x = g.substr((_ + "").length - (0 > _ ? 1 : 0)) || "") : (_ = parseFloat(g), x = g.substr((_ + "").length)), "" === x && (x = s[i] || b), x !== b && (T = W(t, "borderLeft", m, b), S = W(t, "borderTop", m, b), "%" === x ? (d = T / v * 100 + "%", p = S / y * 100 + "%") : "em" === x ? (C = W(t, "borderLeft", 1, "em"), d = T / C + "em", p = S / C + "em") : (d = T + "px", p = S + "px"), w && (g = parseFloat(d) + _ + x, f = parseFloat(p) + _ + x)), r = ve(h, l[c], d + " " + p, g + " " + f, !1, "0px", r);
                return r
            },
            prefix: !0,
            formatter: fe("0px 0px 0px 0px", !1, !0)
        }), be("backgroundPosition", {
            defaultValue: "0 0",
            parser: function(t, e, i, n, r, s) {
                var o = "background-position",
                    l = a || J(t, null),
                    h = this.format((l ? X ? l.getPropertyValue(o + "-x") + " " + l.getPropertyValue(o + "-y") : l.getPropertyValue(o) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"),
                    u = this.format(e),
                    c, f, p, d, g, m;
                if (-1 !== h.indexOf("%") != (-1 !== u.indexOf("%")) && (m = G(t, "backgroundImage").replace(b, ""), m && "none" !== m)) {
                    for (c = h.split(" "), f = u.split(" "), L.setAttribute("src", m), p = 2; --p > -1;) h = c[p], d = -1 !== h.indexOf("%"), d !== (-1 !== f[p].indexOf("%")) && (g = 0 === p ? t.offsetWidth - L.width : t.offsetHeight - L.height, c[p] = d ? parseFloat(h) / 100 * g + "px" : parseFloat(h) / g * 100 + "%");
                    h = c.join(" ")
                }
                return this.parseComplex(t.style, h, u, r, s)
            },
            formatter: re
        }), be("backgroundSize", {
            defaultValue: "0 0",
            formatter: re
        }), be("perspective", {
            defaultValue: "0px",
            prefix: !0
        }), be("perspectiveOrigin", {
            defaultValue: "50% 50%",
            prefix: !0
        }), be("transformStyle", {
            prefix: !0
        }), be("backfaceVisibility", {
            prefix: !0
        }), be("userSelect", {
            prefix: !0
        }), be("margin", {
            parser: pe("marginTop,marginRight,marginBottom,marginLeft")
        }), be("padding", {
            parser: pe("paddingTop,paddingRight,paddingBottom,paddingLeft")
        }), be("clip", {
            defaultValue: "rect(0px,0px,0px,0px)",
            parser: function(t, e, i, n, r, s) {
                var o, l, h;
                return 9 > X ? (l = t.currentStyle, h = 8 > X ? " " : ",", o = "rect(" + l.clipTop + h + l.clipRight + h + l.clipBottom + h + l.clipLeft + ")", e = this.format(e).split(",").join(h)) : (o = this.format(G(t, this.p, a, !1, this.dflt)), e = this.format(e)), this.parseComplex(t.style, o, e, r, s)
            }
        }), be("textShadow", {
            defaultValue: "0px 0px 0px #999",
            color: !0,
            multi: !0
        }), be("autoRound,strictUnits", {
            parser: function(t, e, i, n, r) {
                return r
            }
        }), be("border", {
            defaultValue: "0px solid #000",
            parser: function(t, e, i, n, r, s) {
                return this.parseComplex(t.style, this.format(G(t, "borderTopWidth", a, !1, "0px") + " " + G(t, "borderTopStyle", a, !1, "solid") + " " + G(t, "borderTopColor", a, !1, "#000")), this.format(e), r, s)
            },
            color: !0,
            formatter: function(t) {
                var e = t.split(" ");
                return e[0] + " " + (e[1] || "solid") + " " + (t.match(ce) || ["#000"])[0]
            }
        }), be("borderWidth", {
            parser: pe("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
        }), be("float,cssFloat,styleFloat", {
            parser: function(t, e, i, n, r, s) {
                var a = t.style,
                    o = "cssFloat" in a ? "cssFloat" : "styleFloat";
                return new _e(a, o, 0, 0, r, -1, i, !1, 0, a[o], e)
            }
        });
        var Be = function(t) {
            var e = this.t,
                i = e.filter || G(this.data, "filter") || "",
                n = this.s + this.c * t | 0,
                r;
            100 === n && (-1 === i.indexOf("atrix(") && -1 === i.indexOf("radient(") && -1 === i.indexOf("oader(") ? (e.removeAttribute("filter"), r = !G(this.data, "filter")) : (e.filter = i.replace(_, ""), r = !0)), r || (this.xn1 && (e.filter = i = i || "alpha(opacity=" + n + ")"), -1 === i.indexOf("pacity") ? 0 === n && this.xn1 || (e.filter = i + " alpha(opacity=" + n + ")") : e.filter = i.replace(g, "opacity=" + n))
        };
        be("opacity,alpha,autoAlpha", {
            defaultValue: "1",
            parser: function(t, e, i, n, r, s) {
                var o = parseFloat(G(t, "opacity", a, !1, "1")),
                    l = t.style,
                    h = "autoAlpha" === i;
                return "string" == typeof e && "=" === e.charAt(1) && (e = ("-" === e.charAt(0) ? -1 : 1) * parseFloat(e.substr(2)) + o), h && 1 === o && "hidden" === G(t, "visibility", a) && 0 !== e && (o = 0), j ? r = new _e(l, "opacity", o, e - o, r) : (r = new _e(l, "opacity", 100 * o, 100 * (e - o), r), r.xn1 = h ? 1 : 0, l.zoom = 1, r.type = 2, r.b = "alpha(opacity=" + r.s + ")", r.e = "alpha(opacity=" + (r.s + r.c) + ")", r.data = t, r.plugin = s, r.setRatio = Be), h && (r = new _e(l, "visibility", 0, 0, r, -1, null, !1, 0, 0 !== o ? "inherit" : "hidden", 0 === e ? "hidden" : "inherit"), r.xs0 = "inherit", n._overwriteProps.push(r.n), n._overwriteProps.push(i)), r
            }
        });
        var Fe = function(t, e) {
            e && (t.removeProperty ? (("ms" === e.substr(0, 2) || "webkit" === e.substr(0, 6)) && (e = "-" + e), t.removeProperty(e.replace(y, "-$1").toLowerCase())) : t.removeAttribute(e))
        }, Xe = function(t) {
            if (this.t._gsClassPT = this, 1 === t || 0 === t) {
                this.t.setAttribute("class", 0 === t ? this.b : this.e);
                for (var e = this.data, i = this.t.style; e;) e.v ? i[e.p] = e.v : Fe(i, e.p), e = e._next;
                1 === t && this.t._gsClassPT === this && (this.t._gsClassPT = null)
            } else this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e)
        };
        be("className", {
            parser: function(t, e, i, n, s, o, l) {
                var h = t.getAttribute("class") || "",
                    u = t.style.cssText,
                    c, f, p, d, g;
                if (s = n._classNamePT = new _e(t, i, 0, 0, s, 2), s.setRatio = Xe, s.pr = -11, r = !0, s.b = h, f = Z(t, a), p = t._gsClassPT) {
                    for (d = {}, g = p.data; g;) d[g.p] = 1, g = g._next;
                    p.setRatio(1)
                }
                return t._gsClassPT = s, s.e = "=" !== e.charAt(1) ? e : h.replace(new RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ("+" === e.charAt(0) ? " " + e.substr(2) : ""), n._tween._duration && (t.setAttribute("class", s.e), c = te(t, f, Z(t), l, d), t.setAttribute("class", h), s.data = c.firstMPT, t.style.cssText = u, s = s.xfirst = n.parse(t, c.difs, s, o)), s
            }
        });
        var je = function(t) {
            if ((1 === t || 0 === t) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data) {
                var e = this.t.style,
                    i = l.transform.parse,
                    n, r, s, a;
                if ("all" === this.e) e.cssText = "", a = !0;
                else
                    for (n = this.e.split(" ").join("").split(","), s = n.length; --s > -1;) r = n[s], l[r] && (l[r].parse === i ? a = !0 : r = "transformOrigin" === r ? ke : l[r].p), Fe(e, r);
                a && (Fe(e, Se), this.t._gsTransform && delete this.t._gsTransform)
            }
        };
        for (be("clearProps", {
            parser: function(t, e, i, n, s) {
                return s = new _e(t, i, 0, 0, s, 2), s.setRatio = je, s.e = e, s.pr = -10, s.data = n._tween, r = !0, s
            }
        }), h = "bezier,throwProps,physicsProps,physics2D".split(","), ye = h.length; ye--;) we(h[ye]);
        h = i.prototype, h._firstPT = h._lastParsedTransform = h._transform = null, h._onInitTween = function(t, e, n) {
            if (!t.nodeType) return !1;
            this._target = t, this._tween = n, this._vars = e, z = e.autoRound, r = !1, s = e.suffixMap || i.suffixMap, a = J(t, ""), o = this._overwriteProps;
            var l = t.style,
                h, u, c, f, p, d, g, _, v;
            if (E && "" === l.zIndex && (h = G(t, "zIndex", a), ("auto" === h || "" === h) && this._addLazySet(l, "zIndex", 0)), "string" == typeof e && (f = l.cssText, h = Z(t, a), l.cssText = f + ";" + e, h = te(t, h, Z(t)).difs, !j && m.test(e) && (h.opacity = parseFloat(RegExp.$1)), e = h, l.cssText = f), this._firstPT = u = this.parse(t, e, null), this._transformType) {
                for (v = 3 === this._transformType, Se ? H && (E = !0, "" === l.zIndex && (g = G(t, "zIndex", a), ("auto" === g || "" === g) && this._addLazySet(l, "zIndex", 0)), F && this._addLazySet(l, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (v ? "visible" : "hidden"))) : l.zoom = 1, c = u; c && c._next;) c = c._next;
                _ = new _e(t, "transform", 0, 0, null, 2), this._linkCSSP(_, null, c), _.setRatio = v && Pe ? Ee : Se ? He : ze, _.data = this._transform || De(t, a, !0), _.tween = n, o.pop()
            }
            if (r) {
                for (; u;) {
                    for (d = u._next, c = f; c && c.pr > u.pr;) c = c._next;
                    (u._prev = c ? c._prev : p) ? u._prev._next = u : f = u, (u._next = c) ? c._prev = u : p = u, u = d
                }
                this._firstPT = f
            }
            return !0
        }, h.parse = function(t, e, i, n) {
            var r = t.style,
                o, h, u, c, f, p, g, m, _, y;
            for (o in e) p = e[o], h = l[o], h ? i = h.parse(t, p, o, this, i, n, e) : (f = G(t, o, a) + "", _ = "string" == typeof p, "color" === o || "fill" === o || "stroke" === o || -1 !== o.indexOf("Color") || _ && v.test(p) ? (_ || (p = ue(p), p = (p.length > 3 ? "rgba(" : "rgb(") + p.join(",") + ")"), i = ve(r, o, f, p, !0, "transparent", i, 0, n)) : !_ || -1 === p.indexOf(" ") && -1 === p.indexOf(",") ? (u = parseFloat(f), g = u || 0 === u ? f.substr((u + "").length) : "", ("" === f || "auto" === f) && ("width" === o || "height" === o ? (u = ne(t, o, a), g = "px") : "left" === o || "top" === o ? (u = Q(t, o, a), g = "px") : (u = "opacity" !== o ? 0 : 1, g = "")), y = _ && "=" === p.charAt(1), y ? (c = parseInt(p.charAt(0) + "1", 10), p = p.substr(2), c *= parseFloat(p), m = p.replace(d, "")) : (c = parseFloat(p), m = _ ? p.replace(d, "") : ""), "" === m && (m = o in s ? s[o] : g), p = c || 0 === c ? (y ? c + u : c) + m : e[o], g !== m && "" !== m && (c || 0 === c) && u && (u = W(t, o, u, g), "%" === m ? (u /= W(t, o, 100, "%") / 100, e.strictUnits !== !0 && (f = u + "%")) : "em" === m ? u /= W(t, o, 1, "em") : "px" !== m && (c = W(t, o, c, m), m = "px"), y && (c || 0 === c) && (p = c + u + m)), y && (c += u), !u && 0 !== u || !c && 0 !== c ? void 0 !== r[o] && (p || p + "" != "NaN" && null != p) ? (i = new _e(r, o, c || u || 0, 0, i, -1, o, !1, 0, f, p), i.xs0 = "none" !== p || "display" !== o && -1 === o.indexOf("Style") ? p : f) : V("invalid " + o + " tween value: " + e[o]) : (i = new _e(r, o, u, c - u, i, 0, o, z !== !1 && ("px" === m || "zIndex" === o), 0, f, p), i.xs0 = m)) : i = ve(r, o, f, p, !0, null, i, 0, n)), n && i && !i.plugin && (i.plugin = n);
            return i
        }, h.setRatio = function(t) {
            var e = this._firstPT,
                i = 1e-6,
                n, r, s;
            if (1 !== t || this._tween._time !== this._tween._duration && 0 !== this._tween._time)
                if (t || this._tween._time !== this._tween._duration && 0 !== this._tween._time || this._tween._rawPrevTime === -1e-6)
                    for (; e;) {
                        if (n = e.c * t + e.s, e.r ? n = Math.round(n) : i > n && n > -i && (n = 0), e.type)
                            if (1 === e.type)
                                if (s = e.l, 2 === s) e.t[e.p] = e.xs0 + n + e.xs1 + e.xn1 + e.xs2;
                                else if (3 === s) e.t[e.p] = e.xs0 + n + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3;
                                else if (4 === s) e.t[e.p] = e.xs0 + n + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4;
                                else if (5 === s) e.t[e.p] = e.xs0 + n + e.xs1 + e.xn1 + e.xs2 + e.xn2 + e.xs3 + e.xn3 + e.xs4 + e.xn4 + e.xs5;
                                else {
                                    for (r = e.xs0 + n + e.xs1, s = 1; s < e.l; s++) r += e["xn" + s] + e["xs" + (s + 1)];
                                    e.t[e.p] = r
                                } else -1 === e.type ? e.t[e.p] = e.xs0 : e.setRatio && e.setRatio(t);
                        else e.t[e.p] = n + e.xs0;
                        e = e._next
                    } else
                    for (; e;) 2 !== e.type ? e.t[e.p] = e.b : e.setRatio(t), e = e._next;
            else
                for (; e;) 2 !== e.type ? e.t[e.p] = e.e : e.setRatio(t), e = e._next
        }, h._enableTransforms = function(t) {
            this._transform = this._transform || De(this._target, a, !0), this._transformType = this._transform.svg && Oe || !t && 3 !== this._transformType ? 2 : 3
        };
        var Ye = function(t) {
            this.t[this.p] = this.e, this.data._linkCSSP(this, this._next, null, !0)
        };
        h._addLazySet = function(t, e, i) {
            var n = this._firstPT = new _e(t, e, 0, 0, this._firstPT, 2);
            n.e = i, n.setRatio = Ye, n.data = this
        }, h._linkCSSP = function(t, e, i, n) {
            return t && (e && (e._prev = t), t._next && (t._next._prev = t._prev), t._prev ? t._prev._next = t._next : this._firstPT === t && (this._firstPT = t._next, n = !0), i ? i._next = t : n || null !== this._firstPT || (this._firstPT = t), t._next = e, t._prev = i), t
        }, h._kill = function(e) {
            var i = e,
                n, r, s;
            if (e.autoAlpha || e.alpha) {
                i = {};
                for (r in e) i[r] = e[r];
                i.opacity = 1, i.autoAlpha && (i.visibility = 1)
            }
            return e.className && (n = this._classNamePT) && (s = n.xfirst, s && s._prev ? this._linkCSSP(s._prev, n._next, s._prev._prev) : s === this._firstPT && (this._firstPT = n._next), n._next && this._linkCSSP(n._next, n._next._next, s._prev), this._classNamePT = null), t.prototype._kill.call(this, i)
        };
        var Ve = function(t, e, i) {
            var n, r, s, a;
            if (t.slice)
                for (r = t.length; --r > -1;) Ve(t[r], e, i);
            else
                for (n = t.childNodes, r = n.length; --r > -1;) s = n[r], a = s.type, s.style && (e.push(Z(s)), i && i.push(s)), 1 !== a && 9 !== a && 11 !== a || !s.childNodes.length || Ve(s, e, i)
        };
        return i.cascadeTo = function(t, i, n) {
            var r = e.to(t, i, n),
                s = [r],
                a = [],
                o = [],
                l = [],
                h = e._internals.reservedProps,
                u, c, f, p;
            for (t = r._targets || r.target, Ve(t, a, l), r.render(i, !0, !0), Ve(t, o), r.render(0, !0, !0), r._enabled(!0), u = l.length; --u > -1;)
                if (c = te(l[u], a[u], o[u]), c.firstMPT) {
                    c = c.difs;
                    for (f in n) h[f] && (c[f] = n[f]);
                    p = {};
                    for (f in c) p[f] = a[u][f];
                    s.push(e.fromTo(l[u], i, p, c))
                }
            return s
        }, t.activate([i]), i
    }, !0),
        function() {
            var t = _gsScope._gsDefine.plugin({
                    propName: "roundProps",
                    priority: -1,
                    API: 2,
                    init: function(t, e, i) {
                        return this._tween = i, !0
                    }
                }),
                e = t.prototype;
            e._onInitAllProps = function() {
                for (var t = this._tween, e = t.vars.roundProps instanceof Array ? t.vars.roundProps : t.vars.roundProps.split(","), i = e.length, n = {}, r = t._propLookup.roundProps, s, a, o; --i > -1;) n[e[i]] = 1;
                for (i = e.length; --i > -1;)
                    for (s = e[i], a = t._firstPT; a;) o = a._next, a.pg ? a.t._roundProps(n, !0) : a.n === s && (this._add(a.t, s, a.s, a.c), o && (o._prev = a._prev), a._prev ? a._prev._next = o : t._firstPT === a && (t._firstPT = o), a._next = a._prev = null, t._propLookup[s] = r), a = o;
                return !1
            }, e._add = function(t, e, i, n) {
                this._addTween(t, e, i, i + n, e, !0), this._overwriteProps.push(e)
            }
        }(), _gsScope._gsDefine.plugin({
        propName: "attr",
        API: 2,
        version: "0.3.3",
        init: function(t, e, i) {
            var n, r, s;
            if ("function" != typeof t.setAttribute) return !1;
            this._target = t, this._proxy = {}, this._start = {}, this._end = {};
            for (n in e) this._start[n] = this._proxy[n] = r = t.getAttribute(n), s = this._addTween(this._proxy, n, parseFloat(r), e[n], n), this._end[n] = s ? s.s + s.c : e[n], this._overwriteProps.push(n);
            return !0
        },
        set: function(t) {
            this._super.setRatio.call(this, t);
            for (var e = this._overwriteProps, i = e.length, n = 1 === t ? this._end : t ? this._proxy : this._start, r; --i > -1;) r = e[i], this._target.setAttribute(r, n[r] + "")
        }
    }), _gsScope._gsDefine.plugin({
        propName: "directionalRotation",
        version: "0.2.1",
        API: 2,
        init: function(t, e, i) {
            "object" != typeof e && (e = {
                rotation: e
            }), this.finals = {};
            var n = e.useRadians === !0 ? 2 * Math.PI : 360,
                r = 1e-6,
                s, a, o, l, h, u;
            for (s in e) "useRadians" !== s && (u = (e[s] + "").split("_"), a = u[0], o = parseFloat("function" != typeof t[s] ? t[s] : t[s.indexOf("set") || "function" != typeof t["get" + s.substr(3)] ? s : "get" + s.substr(3)]()), l = this.finals[s] = "string" == typeof a && "=" === a.charAt(1) ? o + parseInt(a.charAt(0) + "1", 10) * Number(a.substr(2)) : Number(a) || 0, h = l - o, u.length && (a = u.join("_"), -1 !== a.indexOf("short") && (h %= n, h !== h % (n / 2) && (h = 0 > h ? h + n : h - n)), -1 !== a.indexOf("_cw") && 0 > h ? h = (h + 9999999999 * n) % n - (h / n | 0) * n : -1 !== a.indexOf("ccw") && h > 0 && (h = (h - 9999999999 * n) % n - (h / n | 0) * n)), (h > r || -r > h) && (this._addTween(t, s, o, o + h, s), this._overwriteProps.push(s)));
            return !0
        },
        set: function(t) {
            var e;
            if (1 !== t) this._super.setRatio.call(this, t);
            else
                for (e = this._firstPT; e;) e.f ? e.t[e.p](this.finals[e.p]) : e.t[e.p] = this.finals[e.p], e = e._next
        }
    })._autoCSS = !0, _gsScope._gsDefine("easing.Back", ["easing.Ease"], function(t) {
        var e = _gsScope.GreenSockGlobals || _gsScope,
            i = e.com.greensock,
            n = 2 * Math.PI,
            r = Math.PI / 2,
            s = i._class,
            a = function(e, i) {
                var n = s("easing." + e, function() {}, !0),
                    r = n.prototype = new t;
                return r.constructor = n, r.getRatio = i, n
            }, o = t.register || function() {}, l = function(t, e, i, n, r) {
                var a = s("easing." + t, {
                    easeOut: new e,
                    easeIn: new i,
                    easeInOut: new n
                }, !0);
                return o(a, t), a
            }, h = function(t, e, i) {
                this.t = t, this.v = e, i && (this.next = i, i.prev = this, this.c = i.v - e, this.gap = i.t - t)
            }, u = function(e, i) {
                var n = s("easing." + e, function(t) {
                        this._p1 = t || 0 === t ? t : 1.70158, this._p2 = 1.525 * this._p1
                    }, !0),
                    r = n.prototype = new t;
                return r.constructor = n, r.getRatio = i, r.config = function(t) {
                    return new n(t)
                }, n
            }, c = l("Back", u("BackOut", function(t) {
                return (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1
            }), u("BackIn", function(t) {
                return t * t * ((this._p1 + 1) * t - this._p1)
            }), u("BackInOut", function(t) {
                return (t *= 2) < 1 ? .5 * t * t * ((this._p2 + 1) * t - this._p2) : .5 * ((t -= 2) * t * ((this._p2 + 1) * t + this._p2) + 2)
            })),
            f = s("easing.SlowMo", function(t, e, i) {
                e = e || 0 === e ? e : .7, null == t ? t = .7 : t > 1 && (t = 1), this._p = 1 !== t ? e : 0, this._p1 = (1 - t) / 2, this._p2 = t, this._p3 = this._p1 + this._p2, this._calcEnd = i === !0
            }, !0),
            p = f.prototype = new t,
            d, g, m;
        return p.constructor = f, p.getRatio = function(t) {
            var e = t + (.5 - t) * this._p;
            return t < this._p1 ? this._calcEnd ? 1 - (t = 1 - t / this._p1) * t : e - (t = 1 - t / this._p1) * t * t * t * e : t > this._p3 ? this._calcEnd ? 1 - (t = (t - this._p3) / this._p1) * t : e + (t - e) * (t = (t - this._p3) / this._p1) * t * t * t : this._calcEnd ? 1 : e
        }, f.ease = new f(.7, .7), p.config = f.config = function(t, e, i) {
            return new f(t, e, i)
        }, d = s("easing.SteppedEase", function(t) {
            t = t || 1, this._p1 = 1 / t, this._p2 = t + 1
        }, !0), p = d.prototype = new t, p.constructor = d, p.getRatio = function(t) {
            return 0 > t ? t = 0 : t >= 1 && (t = .999999999), (this._p2 * t >> 0) * this._p1
        }, p.config = d.config = function(t) {
            return new d(t)
        }, g = s("easing.RoughEase", function(e) {
            e = e || {};
            for (var i = e.taper || "none", n = [], r = 0, s = 0 | (e.points || 20), a = s, o = e.randomize !== !1, l = e.clamp === !0, u = e.template instanceof t ? e.template : null, c = "number" == typeof e.strength ? .4 * e.strength : .4, f, p, d, g, m, _; --a > -1;) f = o ? Math.random() : 1 / s * a, p = u ? u.getRatio(f) : f, "none" === i ? d = c : "out" === i ? (g = 1 - f, d = g * g * c) : "in" === i ? d = f * f * c : .5 > f ? (g = 2 * f, d = g * g * .5 * c) : (g = 2 * (1 - f), d = g * g * .5 * c), o ? p += Math.random() * d - .5 * d : a % 2 ? p += .5 * d : p -= .5 * d, l && (p > 1 ? p = 1 : 0 > p && (p = 0)), n[r++] = {
                x: f,
                y: p
            };
            for (n.sort(function(t, e) {
                return t.x - e.x
            }), _ = new h(1, 1, null), a = s; --a > -1;) m = n[a], _ = new h(m.x, m.y, _);
            this._prev = new h(0, 0, 0 !== _.t ? _ : _.next)
        }, !0), p = g.prototype = new t, p.constructor = g, p.getRatio = function(t) {
            var e = this._prev;
            if (t > e.t) {
                for (; e.next && t >= e.t;) e = e.next;
                e = e.prev
            } else
                for (; e.prev && t <= e.t;) e = e.prev;
            return this._prev = e, e.v + (t - e.t) / e.gap * e.c
        }, p.config = function(t) {
            return new g(t)
        }, g.ease = new g, l("Bounce", a("BounceOut", function(t) {
            return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
        }), a("BounceIn", function(t) {
            return (t = 1 - t) < 1 / 2.75 ? 1 - 7.5625 * t * t : 2 / 2.75 > t ? 1 - (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? 1 - (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 1 - (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
        }), a("BounceInOut", function(t) {
            var e = .5 > t;
            return t = e ? 1 - 2 * t : 2 * t - 1, t = 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375, e ? .5 * (1 - t) : .5 * t + .5
        })), l("Circ", a("CircOut", function(t) {
            return Math.sqrt(1 - (t -= 1) * t)
        }), a("CircIn", function(t) {
            return -(Math.sqrt(1 - t * t) - 1)
        }), a("CircInOut", function(t) {
            return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
        })), m = function(e, i, r) {
            var a = s("easing." + e, function(t, e) {
                    this._p1 = t >= 1 ? t : 1, this._p2 = (e || r) / (1 > t ? t : 1), this._p3 = this._p2 / n * (Math.asin(1 / this._p1) || 0), this._p2 = n / this._p2
                }, !0),
                o = a.prototype = new t;
            return o.constructor = a, o.getRatio = i, o.config = function(t, e) {
                return new a(t, e)
            }, a
        }, l("Elastic", m("ElasticOut", function(t) {
            return this._p1 * Math.pow(2, -10 * t) * Math.sin((t - this._p3) * this._p2) + 1
        }, .3), m("ElasticIn", function(t) {
            return -(this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2))
        }, .3), m("ElasticInOut", function(t) {
            return (t *= 2) < 1 ? -.5 * this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2) : this._p1 * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2) * .5 + 1
        }, .45)), l("Expo", a("ExpoOut", function(t) {
            return 1 - Math.pow(2, -10 * t)
        }), a("ExpoIn", function(t) {
            return Math.pow(2, 10 * (t - 1)) - .001
        }), a("ExpoInOut", function(t) {
            return (t *= 2) < 1 ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * (t - 1)))
        })), l("Sine", a("SineOut", function(t) {
            return Math.sin(t * r)
        }), a("SineIn", function(t) {
            return -Math.cos(t * r) + 1
        }), a("SineInOut", function(t) {
            return -.5 * (Math.cos(Math.PI * t) - 1)
        })), s("easing.EaseLookup", {
            find: function(e) {
                return t.map[e]
            }
        }, !0), o(e.SlowMo, "SlowMo", "ease,"), o(g, "RoughEase", "ease,"), o(d, "SteppedEase", "ease,"), c
    }, !0)
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    function(t, e) {
        "use strict";
        var i = t.GreenSockGlobals = t.GreenSockGlobals || t;
        if (!i.TweenLite) {
            var n = function(t) {
                    var e = t.split("."),
                        n = i,
                        r;
                    for (r = 0; r < e.length; r++) n[e[r]] = n = n[e[r]] || {};
                    return n
                }, r = n("com.greensock"),
                s = 1e-10,
                a = function(t) {
                    var e = [],
                        i = t.length,
                        n;
                    for (n = 0; n !== i; e.push(t[n++]));
                    return e
                }, o = function() {}, l = function() {
                    var t = Object.prototype.toString,
                        e = t.call([]);
                    return function(i) {
                        return null != i && (i instanceof Array || "object" == typeof i && !! i.push && t.call(i) === e)
                    }
                }(),
                h, u, c, f, p, d = {}, g = function(r, s, a, o) {
                    this.sc = d[r] ? d[r].sc : [], d[r] = this, this.gsClass = null, this.func = a;
                    var l = [];
                    this.check = function(h) {
                        for (var u = s.length, c = u, f, p, m, _; --u > -1;)(f = d[s[u]] || new g(s[u], [])).gsClass ? (l[u] = f.gsClass, c--) : h && f.sc.push(this);
                        if (0 === c && a)
                            for (p = ("com.greensock." + r).split("."), m = p.pop(), _ = n(p.join("."))[m] = this.gsClass = a.apply(a, l), o && (i[m] = _, "function" == typeof define && define.amd ? define((t.GreenSockAMDPath ? t.GreenSockAMDPath + "/" : "") + r.split(".").pop(), [], function() {
                                return _
                            }) : r === e && "undefined" != typeof module && module.exports && (module.exports = _)), u = 0; u < this.sc.length; u++) this.sc[u].check()
                    }, this.check(!0)
                }, m = t._gsDefine = function(t, e, i, n) {
                    return new g(t, e, i, n)
                }, _ = r._class = function(t, e, i) {
                    return e = e || function() {}, m(t, [], function() {
                        return e
                    }, i), e
                };
            m.globals = i;
            var v = [0, 0, 1, 1],
                y = [],
                x = _("easing.Ease", function(t, e, i, n) {
                    this._func = t, this._type = i || 0, this._power = n || 0, this._params = e ? v.concat(e) : v
                }, !0),
                b = x.map = {}, w = x.register = function(t, e, i, n) {
                    for (var s = e.split(","), a = s.length, o = (i || "easeIn,easeOut,easeInOut").split(","), l, h, u, c; --a > -1;)
                        for (h = s[a], l = n ? _("easing." + h, null, !0) : r.easing[h] || {}, u = o.length; --u > -1;) c = o[u], b[h + "." + c] = b[c + h] = l[c] = t.getRatio ? t : t[c] || new t
                };
            for (c = x.prototype, c._calcEnd = !1, c.getRatio = function(t) {
                if (this._func) return this._params[0] = t, this._func.apply(null, this._params);
                var e = this._type,
                    i = this._power,
                    n = 1 === e ? 1 - t : 2 === e ? t : .5 > t ? 2 * t : 2 * (1 - t);
                return 1 === i ? n *= n : 2 === i ? n *= n * n : 3 === i ? n *= n * n * n : 4 === i && (n *= n * n * n * n), 1 === e ? 1 - n : 2 === e ? n : .5 > t ? n / 2 : 1 - n / 2
            }, h = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"], u = h.length; --u > -1;) c = h[u] + ",Power" + u, w(new x(null, null, 1, u), c, "easeOut", !0), w(new x(null, null, 2, u), c, "easeIn" + (0 === u ? ",easeNone" : "")), w(new x(null, null, 3, u), c, "easeInOut");
            b.linear = r.easing.Linear.easeIn, b.swing = r.easing.Quad.easeInOut;
            var T = _("events.EventDispatcher", function(t) {
                this._listeners = {}, this._eventTarget = t || this
            });
            c = T.prototype, c.addEventListener = function(t, e, i, n, r) {
                r = r || 0;
                var s = this._listeners[t],
                    a = 0,
                    o, l;
                for (null == s && (this._listeners[t] = s = []), l = s.length; --l > -1;) o = s[l], o.c === e && o.s === i ? s.splice(l, 1) : 0 === a && o.pr < r && (a = l + 1);
                s.splice(a, 0, {
                    c: e,
                    s: i,
                    up: n,
                    pr: r
                }), this !== f || p || f.wake()
            }, c.removeEventListener = function(t, e) {
                var i = this._listeners[t],
                    n;
                if (i)
                    for (n = i.length; --n > -1;)
                        if (i[n].c === e) return void i.splice(n, 1)
            }, c.dispatchEvent = function(t) {
                var e = this._listeners[t],
                    i, n, r;
                if (e)
                    for (i = e.length, n = this._eventTarget; --i > -1;) r = e[i], r && (r.up ? r.c.call(r.s || n, {
                        type: t,
                        target: n
                    }) : r.c.call(r.s || n))
            };
            var S = t.requestAnimationFrame,
                C = t.cancelAnimationFrame,
                k = Date.now || function() {
                    return (new Date).getTime()
                }, P = k();
            for (h = ["ms", "moz", "webkit", "o"], u = h.length; --u > -1 && !S;) S = t[h[u] + "RequestAnimationFrame"], C = t[h[u] + "CancelAnimationFrame"] || t[h[u] + "CancelRequestAnimationFrame"];
            _("Ticker", function(t, e) {
                var i = this,
                    n = k(),
                    r = e !== !1 && S,
                    a = 500,
                    l = 33,
                    h = "tick",
                    u, c, d, g, m, _ = function(t) {
                        var e = k() - P,
                            r, s;
                        e > a && (n += e - l), P += e, i.time = (P - n) / 1e3, r = i.time - m, (!u || r > 0 || t === !0) && (i.frame++, m += r + (r >= g ? .004 : g - r), s = !0), t !== !0 && (d = c(_)), s && i.dispatchEvent(h)
                    };
                T.call(i), i.time = i.frame = 0, i.tick = function() {
                    _(!0)
                }, i.lagSmoothing = function(t, e) {
                    a = t || 1 / s, l = Math.min(e, a, 0)
                }, i.sleep = function() {
                    null != d && (r && C ? C(d) : clearTimeout(d), c = o, d = null, i === f && (p = !1))
                }, i.wake = function() {
                    null !== d ? i.sleep() : i.frame > 10 && (P = k() - a + 5), c = 0 === u ? o : r && S ? S : function(t) {
                        return setTimeout(t, 1e3 * (m - i.time) + 1 | 0)
                    }, i === f && (p = !0), _(2)
                }, i.fps = function(t) {
                    return arguments.length ? (u = t, g = 1 / (u || 60), m = this.time + g, void i.wake()) : u
                }, i.useRAF = function(t) {
                    return arguments.length ? (i.sleep(), r = t, void i.fps(u)) : r
                }, i.fps(t), setTimeout(function() {
                    r && (!d || i.frame < 5) && i.useRAF(!1)
                }, 1500)
            }), c = r.Ticker.prototype = new r.events.EventDispatcher, c.constructor = r.Ticker;
            var A = _("core.Animation", function(t, e) {
                if (this.vars = e = e || {}, this._duration = this._totalDuration = t || 0, this._delay = Number(e.delay) || 0, this._timeScale = 1, this._active = e.immediateRender === !0, this.data = e.data, this._reversed = e.reversed === !0, Y) {
                    p || f.wake();
                    var i = this.vars.useFrames ? j : Y;
                    i.add(this, i._time), this.vars.paused && this.paused(!0)
                }
            });
            f = A.ticker = new r.Ticker, c = A.prototype, c._dirty = c._gc = c._initted = c._paused = !1, c._totalTime = c._time = 0, c._rawPrevTime = -1, c._next = c._last = c._onUpdate = c._timeline = c.timeline = null, c._paused = !1;
            var R = function() {
                p && k() - P > 2e3 && f.wake(), setTimeout(R, 2e3)
            };
            R(), c.play = function(t, e) {
                return null != t && this.seek(t, e), this.reversed(!1).paused(!1)
            }, c.pause = function(t, e) {
                return null != t && this.seek(t, e), this.paused(!0)
            }, c.resume = function(t, e) {
                return null != t && this.seek(t, e), this.paused(!1)
            }, c.seek = function(t, e) {
                return this.totalTime(Number(t), e !== !1)
            }, c.restart = function(t, e) {
                return this.reversed(!1).paused(!1).totalTime(t ? -this._delay : 0, e !== !1, !0)
            }, c.reverse = function(t, e) {
                return null != t && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1)
            }, c.render = function(t, e, i) {}, c.invalidate = function() {
                return this._time = this._totalTime = 0, this._initted = this._gc = !1, this._rawPrevTime = -1, (this._gc || !this.timeline) && this._enabled(!0), this
            }, c.isActive = function() {
                var t = this._timeline,
                    e = this._startTime,
                    i;
                return !t || !this._gc && !this._paused && t.isActive() && (i = t.rawTime()) >= e && i < e + this.totalDuration() / this._timeScale
            }, c._enabled = function(t, e) {
                return p || f.wake(), this._gc = !t, this._active = this.isActive(), e !== !0 && (t && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !t && this.timeline && this._timeline._remove(this, !0)), !1
            }, c._kill = function(t, e) {
                return this._enabled(!1, !1)
            }, c.kill = function(t, e) {
                return this._kill(t, e), this
            }, c._uncache = function(t) {
                for (var e = t ? this : this.timeline; e;) e._dirty = !0, e = e.timeline;
                return this
            }, c._swapSelfInParams = function(t) {
                for (var e = t.length, i = t.concat(); --e > -1;) "{self}" === t[e] && (i[e] = this);
                return i
            }, c.eventCallback = function(t, e, i, n) {
                if ("on" === (t || "").substr(0, 2)) {
                    var r = this.vars;
                    if (1 === arguments.length) return r[t];
                    null == e ? delete r[t] : (r[t] = e, r[t + "Params"] = l(i) && -1 !== i.join("").indexOf("{self}") ? this._swapSelfInParams(i) : i, r[t + "Scope"] = n), "onUpdate" === t && (this._onUpdate = e)
                }
                return this
            }, c.delay = function(t) {
                return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay), this._delay = t, this) : this._delay
            }, c.duration = function(t) {
                return arguments.length ? (this._duration = this._totalDuration = t, this._uncache(!0), this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0), this) : (this._dirty = !1, this._duration)
            }, c.totalDuration = function(t) {
                return this._dirty = !1, arguments.length ? this.duration(t) : this._totalDuration
            }, c.time = function(t, e) {
                return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(t > this._duration ? this._duration : t, e)) : this._time
            }, c.totalTime = function(t, e, i) {
                if (p || f.wake(), !arguments.length) return this._totalTime;
                if (this._timeline) {
                    if (0 > t && !i && (t += this.totalDuration()), this._timeline.smoothChildTiming) {
                        this._dirty && this.totalDuration();
                        var n = this._totalDuration,
                            r = this._timeline;
                        if (t > n && !i && (t = n), this._startTime = (this._paused ? this._pauseTime : r._time) - (this._reversed ? n - t : t) / this._timeScale, r._dirty || this._uncache(!1), r._timeline)
                            for (; r._timeline;) r._timeline._time !== (r._startTime + r._totalTime) / r._timeScale && r.totalTime(r._totalTime, !0), r = r._timeline
                    }
                    this._gc && this._enabled(!0, !1), (this._totalTime !== t || 0 === this._duration) && (this.render(t, e, !1), I.length && V())
                }
                return this
            }, c.progress = c.totalProgress = function(t, e) {
                return arguments.length ? this.totalTime(this.duration() * t, e) : this._time / this.duration()
            }, c.startTime = function(t) {
                return arguments.length ? (t !== this._startTime && (this._startTime = t, this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)), this) : this._startTime
            }, c.endTime = function(t) {
                return this._startTime + (0 != t ? this.totalDuration() : this.duration()) / this._timeScale
            }, c.timeScale = function(t) {
                if (!arguments.length) return this._timeScale;
                if (t = t || s, this._timeline && this._timeline.smoothChildTiming) {
                    var e = this._pauseTime,
                        i = e || 0 === e ? e : this._timeline.totalTime();
                    this._startTime = i - (i - this._startTime) * this._timeScale / t
                }
                return this._timeScale = t, this._uncache(!1)
            }, c.reversed = function(t) {
                return arguments.length ? (t != this._reversed && (this._reversed = t, this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)), this) : this._reversed
            }, c.paused = function(t) {
                if (!arguments.length) return this._paused;
                if (t != this._paused && this._timeline) {
                    p || t || f.wake();
                    var e = this._timeline,
                        i = e.rawTime(),
                        n = i - this._pauseTime;
                    !t && e.smoothChildTiming && (this._startTime += n, this._uncache(!1)), this._pauseTime = t ? i : null, this._paused = t, this._active = this.isActive(), !t && 0 !== n && this._initted && this.duration() && this.render(e.smoothChildTiming ? this._totalTime : (i - this._startTime) / this._timeScale, !0, !0)
                }
                return this._gc && !t && this._enabled(!0, !1), this
            };
            var O = _("core.SimpleTimeline", function(t) {
                A.call(this, 0, t), this.autoRemoveChildren = this.smoothChildTiming = !0
            });
            c = O.prototype = new A, c.constructor = O, c.kill()._gc = !1, c._first = c._last = c._recent = null, c._sortChildren = !1, c.add = c.insert = function(t, e, i, n) {
                var r, s;
                if (t._startTime = Number(e || 0) + t._delay, t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale), t.timeline && t.timeline._remove(t, !0), t.timeline = t._timeline = this, t._gc && t._enabled(!0, !0), r = this._last, this._sortChildren)
                    for (s = t._startTime; r && r._startTime > s;) r = r._prev;
                return r ? (t._next = r._next, r._next = t) : (t._next = this._first, this._first = t), t._next ? t._next._prev = t : this._last = t, t._prev = r, this._recent = t, this._timeline && this._uncache(!0), this
            }, c._remove = function(t, e) {
                return t.timeline === this && (e || t._enabled(!1, !0), t._prev ? t._prev._next = t._next : this._first === t && (this._first = t._next), t._next ? t._next._prev = t._prev : this._last === t && (this._last = t._prev), t._next = t._prev = t.timeline = null, t === this._recent && (this._recent = this._last), this._timeline && this._uncache(!0)), this
            }, c.render = function(t, e, i) {
                var n = this._first,
                    r;
                for (this._totalTime = this._time = this._rawPrevTime = t; n;) r = n._next, (n._active || t >= n._startTime && !n._paused) && (n._reversed ? n.render((n._dirty ? n.totalDuration() : n._totalDuration) - (t - n._startTime) * n._timeScale, e, i) : n.render((t - n._startTime) * n._timeScale, e, i)), n = r
            }, c.rawTime = function() {
                return p || f.wake(), this._totalTime
            };
            var M = _("TweenLite", function(e, i, n) {
                    if (A.call(this, i, n), this.render = M.prototype.render, null == e) throw "Cannot tween a null target.";
                    this.target = e = "string" != typeof e ? e : M.selector(e) || e;
                    var r = e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType),
                        o = this.vars.overwrite,
                        h, u, c;
                    if (this._overwrite = o = null == o ? X[M.defaultOverwrite] : "number" == typeof o ? o >> 0 : X[o], (r || e instanceof Array || e.push && l(e)) && "number" != typeof e[0])
                        for (this._targets = c = a(e), this._propLookup = [], this._siblings = [], h = 0; h < c.length; h++) u = c[h], u ? "string" != typeof u ? u.length && u !== t && u[0] && (u[0] === t || u[0].nodeType && u[0].style && !u.nodeType) ? (c.splice(h--, 1), this._targets = c = c.concat(a(u))) : (this._siblings[h] = q(u, this, !1), 1 === o && this._siblings[h].length > 1 && K(u, this, null, 1, this._siblings[h])) : (u = c[h--] = M.selector(u), "string" == typeof u && c.splice(h + 1, 1)) : c.splice(h--, 1);
                    else this._propLookup = {}, this._siblings = q(e, this, !1), 1 === o && this._siblings.length > 1 && K(e, this, null, 1, this._siblings);
                    (this.vars.immediateRender || 0 === i && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -s, this.render(-this._delay))
                }, !0),
                N = function(e) {
                    return e && e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType)
                }, L = function(t, e) {
                    var i = {}, n;
                    for (n in t) F[n] || n in e && "transform" !== n && "x" !== n && "y" !== n && "width" !== n && "height" !== n && "className" !== n && "border" !== n || !(!E[n] || E[n] && E[n]._autoCSS) || (i[n] = t[n], delete t[n]);
                    t.css = i
                };
            c = M.prototype = new A, c.constructor = M, c.kill()._gc = !1, c.ratio = 0, c._firstPT = c._targets = c._overwrittenProps = c._startAt = null, c._notifyPluginsOfEnabled = c._lazy = !1, M.version = "1.15.2", M.defaultEase = c._ease = new x(null, null, 1, 1), M.defaultOverwrite = "auto", M.ticker = f, M.autoSleep = !0, M.lagSmoothing = function(t, e) {
                f.lagSmoothing(t, e)
            }, M.selector = t.$ || t.jQuery || function(e) {
                var i = t.$ || t.jQuery;
                return i ? (M.selector = i, i(e)) : "undefined" == typeof document ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
            };
            var I = [],
                D = {}, z = M._internals = {
                    isArray: l,
                    isSelector: N,
                    lazyTweens: I
                }, E = M._plugins = {}, H = z.tweenLookup = {}, B = 0,
                F = z.reservedProps = {
                    ease: 1,
                    delay: 1,
                    overwrite: 1,
                    onComplete: 1,
                    onCompleteParams: 1,
                    onCompleteScope: 1,
                    useFrames: 1,
                    runBackwards: 1,
                    startAt: 1,
                    onUpdate: 1,
                    onUpdateParams: 1,
                    onUpdateScope: 1,
                    onStart: 1,
                    onStartParams: 1,
                    onStartScope: 1,
                    onReverseComplete: 1,
                    onReverseCompleteParams: 1,
                    onReverseCompleteScope: 1,
                    onRepeat: 1,
                    onRepeatParams: 1,
                    onRepeatScope: 1,
                    easeParams: 1,
                    yoyo: 1,
                    immediateRender: 1,
                    repeat: 1,
                    repeatDelay: 1,
                    data: 1,
                    paused: 1,
                    reversed: 1,
                    autoCSS: 1,
                    lazy: 1,
                    onOverwrite: 1
                }, X = {
                    none: 0,
                    all: 1,
                    auto: 2,
                    concurrent: 3,
                    allOnStart: 4,
                    preexisting: 5,
                    "true": 1,
                    "false": 0
                }, j = A._rootFramesTimeline = new O,
                Y = A._rootTimeline = new O,
                V = z.lazyRender = function() {
                    var t = I.length,
                        e;
                    for (D = {}; --t > -1;) e = I[t], e && e._lazy !== !1 && (e.render(e._lazy[0], e._lazy[1], !0), e._lazy = !1);
                    I.length = 0
                };
            Y._startTime = f.time, j._startTime = f.frame, Y._active = j._active = !0, setTimeout(V, 1), A._updateRoot = M.render = function() {
                var t, e, i;
                if (I.length && V(), Y.render((f.time - Y._startTime) * Y._timeScale, !1, !1), j.render((f.frame - j._startTime) * j._timeScale, !1, !1), I.length && V(), !(f.frame % 120)) {
                    for (i in H) {
                        for (e = H[i].tweens, t = e.length; --t > -1;) e[t]._gc && e.splice(t, 1);
                        0 === e.length && delete H[i]
                    }
                    if (i = Y._first, (!i || i._paused) && M.autoSleep && !j._first && 1 === f._listeners.tick.length) {
                        for (; i && i._paused;) i = i._next;
                        i || f.sleep()
                    }
                }
            }, f.addEventListener("tick", A._updateRoot);
            var q = function(t, e, i) {
                var n = t._gsTweenID,
                    r, s;
                if (H[n || (t._gsTweenID = n = "t" + B++)] || (H[n] = {
                    target: t,
                    tweens: []
                }), e && (r = H[n].tweens, r[s = r.length] = e, i))
                    for (; --s > -1;) r[s] === e && r.splice(s, 1);
                return H[n].tweens
            }, U = function(t, e, i, n) {
                var r = t.vars.onOverwrite,
                    s, a;
                return r && (s = r(t, e, i, n)), r = M.onOverwrite, r && (a = r(t, e, i, n)), s !== !1 && a !== !1
            }, K = function(t, e, i, n, r) {
                var a, o, l, h;
                if (1 === n || n >= 4) {
                    for (h = r.length, a = 0; h > a; a++)
                        if ((l = r[a]) !== e) l._gc || U(l, e) && l._enabled(!1, !1) && (o = !0);
                        else if (5 === n) break;
                    return o
                }
                var u = e._startTime + s,
                    c = [],
                    f = 0,
                    p = 0 === e._duration,
                    d;
                for (a = r.length; --a > -1;)(l = r[a]) === e || l._gc || l._paused || (l._timeline !== e._timeline ? (d = d || J(e, 0, p), 0 === J(l, d, p) && (c[f++] = l)) : l._startTime <= u && l._startTime + l.totalDuration() / l._timeScale > u && ((p || !l._initted) && u - l._startTime <= 2e-10 || (c[f++] = l)));
                for (a = f; --a > -1;)
                    if (l = c[a], 2 === n && l._kill(i, t, e) && (o = !0), 2 !== n || !l._firstPT && l._initted) {
                        if (2 !== n && !U(l, e)) continue;
                        l._enabled(!1, !1) && (o = !0)
                    }
                return o
            }, J = function(t, e, i) {
                for (var n = t._timeline, r = n._timeScale, a = t._startTime; n._timeline;) {
                    if (a += n._startTime, r *= n._timeScale, n._paused) return -100;
                    n = n._timeline
                }
                return a /= r, a > e ? a - e : i && a === e || !t._initted && 2 * s > a - e ? s : (a += t.totalDuration() / t._timeScale / r) > e + s ? 0 : a - e - s
            };
            c._init = function() {
                var t = this.vars,
                    e = this._overwrittenProps,
                    i = this._duration,
                    n = !! t.immediateRender,
                    r = t.ease,
                    s, a, o, l, h;
                if (t.startAt) {
                    this._startAt && (this._startAt.render(-1, !0), this._startAt.kill()), h = {};
                    for (l in t.startAt) h[l] = t.startAt[l];
                    if (h.overwrite = !1, h.immediateRender = !0, h.lazy = n && t.lazy !== !1, h.startAt = h.delay = null, this._startAt = M.to(this.target, 0, h), n)
                        if (this._time > 0) this._startAt = null;
                        else if (0 !== i) return
                } else if (t.runBackwards && 0 !== i)
                    if (this._startAt) this._startAt.render(-1, !0), this._startAt.kill(), this._startAt = null;
                    else {
                        0 !== this._time && (n = !1), o = {};
                        for (l in t) F[l] && "autoCSS" !== l || (o[l] = t[l]);
                        if (o.overwrite = 0, o.data = "isFromStart", o.lazy = n && t.lazy !== !1, o.immediateRender = n, this._startAt = M.to(this.target, 0, o), n) {
                            if (0 === this._time) return
                        } else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null)
                    }
                if (this._ease = r = r ? r instanceof x ? r : "function" == typeof r ? new x(r, t.easeParams) : b[r] || M.defaultEase : M.defaultEase, t.easeParams instanceof Array && r.config && (this._ease = r.config.apply(r, t.easeParams)), this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, this._targets)
                    for (s = this._targets.length; --s > -1;) this._initProps(this._targets[s], this._propLookup[s] = {}, this._siblings[s], e ? e[s] : null) && (a = !0);
                else a = this._initProps(this.target, this._propLookup, this._siblings, e); if (a && M._onPluginEvent("_onInitAllProps", this), e && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), t.runBackwards)
                    for (o = this._firstPT; o;) o.s += o.c, o.c = -o.c, o = o._next;
                this._onUpdate = t.onUpdate, this._initted = !0
            }, c._initProps = function(e, i, n, r) {
                var s, a, o, h, u, c;
                if (null == e) return !1;
                D[e._gsTweenID] && V(), this.vars.css || e.style && e !== t && e.nodeType && E.css && this.vars.autoCSS !== !1 && L(this.vars, e);
                for (s in this.vars) {
                    if (c = this.vars[s], F[s]) c && (c instanceof Array || c.push && l(c)) && -1 !== c.join("").indexOf("{self}") && (this.vars[s] = c = this._swapSelfInParams(c, this));
                    else if (E[s] && (h = new E[s])._onInitTween(e, this.vars[s], this)) {
                        for (this._firstPT = u = {
                            _next: this._firstPT,
                            t: h,
                            p: "setRatio",
                            s: 0,
                            c: 1,
                            f: !0,
                            n: s,
                            pg: !0,
                            pr: h._priority
                        }, a = h._overwriteProps.length; --a > -1;) i[h._overwriteProps[a]] = this._firstPT;
                        (h._priority || h._onInitAllProps) && (o = !0), (h._onDisable || h._onEnable) && (this._notifyPluginsOfEnabled = !0)
                    } else this._firstPT = i[s] = u = {
                        _next: this._firstPT,
                        t: e,
                        p: s,
                        f: "function" == typeof e[s],
                        n: s,
                        pg: !1,
                        pr: 0
                    }, u.s = u.f ? e[s.indexOf("set") || "function" != typeof e["get" + s.substr(3)] ? s : "get" + s.substr(3)]() : parseFloat(e[s]), u.c = "string" == typeof c && "=" === c.charAt(1) ? parseInt(c.charAt(0) + "1", 10) * Number(c.substr(2)) : Number(c) - u.s || 0;
                    u && u._next && (u._next._prev = u)
                }
                return r && this._kill(r, e) ? this._initProps(e, i, n, r) : this._overwrite > 1 && this._firstPT && n.length > 1 && K(e, this, i, this._overwrite, n) ? (this._kill(i, e), this._initProps(e, i, n, r)) : (this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (D[e._gsTweenID] = !0), o)
            }, c.render = function(t, e, i) {
                var n = this._time,
                    r = this._duration,
                    a = this._rawPrevTime,
                    o, l, h, u;
                if (t >= r) this._totalTime = this._time = r, this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1, this._reversed || (o = !0, l = "onComplete"), 0 === r && (this._initted || !this.vars.lazy || i) && (this._startTime === this._timeline._duration && (t = 0), (0 === t || 0 > a || a === s && "isPause" !== this.data) && a !== t && (i = !0, a > s && (l = "onReverseComplete")), this._rawPrevTime = u = !e || t || a === t ? t : s);
                else if (1e-7 > t) this._totalTime = this._time = 0, this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0, (0 !== n || 0 === r && a > 0 && a !== s) && (l = "onReverseComplete", o = this._reversed), 0 > t && (this._active = !1, 0 === r && (this._initted || !this.vars.lazy || i) && (a >= 0 && (a !== s || "isPause" !== this.data) && (i = !0), this._rawPrevTime = u = !e || t || a === t ? t : s)), this._initted || (i = !0);
                else if (this._totalTime = this._time = t, this._easeType) {
                    var c = t / r,
                        f = this._easeType,
                        p = this._easePower;
                    (1 === f || 3 === f && c >= .5) && (c = 1 - c), 3 === f && (c *= 2), 1 === p ? c *= c : 2 === p ? c *= c * c : 3 === p ? c *= c * c * c : 4 === p && (c *= c * c * c * c), this.ratio = 1 === f ? 1 - c : 2 === f ? c : .5 > t / r ? c / 2 : 1 - c / 2
                } else this.ratio = this._ease.getRatio(t / r); if (this._time !== n || i) {
                    if (!this._initted) {
                        if (this._init(), !this._initted || this._gc) return;
                        if (!i && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration)) return this._time = this._totalTime = n, this._rawPrevTime = a, I.push(this), void(this._lazy = [t, e]);
                        this._time && !o ? this.ratio = this._ease.getRatio(this._time / r) : o && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                    }
                    for (this._lazy !== !1 && (this._lazy = !1), this._active || !this._paused && this._time !== n && t >= 0 && (this._active = !0), 0 === n && (this._startAt && (t >= 0 ? this._startAt.render(t, e, i) : l || (l = "_dummyGS")), this.vars.onStart && (0 !== this._time || 0 === r) && (e || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || y))), h = this._firstPT; h;) h.f ? h.t[h.p](h.c * this.ratio + h.s) : h.t[h.p] = h.c * this.ratio + h.s, h = h._next;
                    this._onUpdate && (0 > t && this._startAt && t !== -1e-4 && this._startAt.render(t, e, i), e || (this._time !== n || o) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || y)), l && (!this._gc || i) && (0 > t && this._startAt && !this._onUpdate && t !== -1e-4 && this._startAt.render(t, e, i), o && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[l] && this.vars[l].apply(this.vars[l + "Scope"] || this, this.vars[l + "Params"] || y), 0 === r && this._rawPrevTime === s && u !== s && (this._rawPrevTime = 0))
                }
            }, c._kill = function(t, e, i) {
                if ("all" === t && (t = null), null == t && (null == e || e === this.target)) return this._lazy = !1, this._enabled(!1, !1);
                e = "string" != typeof e ? e || this._targets || this.target : M.selector(e) || e;
                var n, r, s, a, o, h, u, c, f;
                if ((l(e) || N(e)) && "number" != typeof e[0])
                    for (n = e.length; --n > -1;) this._kill(t, e[n]) && (h = !0);
                else {
                    if (this._targets) {
                        for (n = this._targets.length; --n > -1;)
                            if (e === this._targets[n]) {
                                o = this._propLookup[n] || {}, this._overwrittenProps = this._overwrittenProps || [], r = this._overwrittenProps[n] = t ? this._overwrittenProps[n] || {} : "all";
                                break
                            }
                    } else {
                        if (e !== this.target) return !1;
                        o = this._propLookup, r = this._overwrittenProps = t ? this._overwrittenProps || {} : "all"
                    } if (o) {
                        if (u = t || o, c = t !== r && "all" !== r && t !== o && ("object" != typeof t || !t._tempKill), i && (M.onOverwrite || this.vars.onOverwrite)) {
                            for (s in u) o[s] && (f || (f = []), f.push(s));
                            if (!U(this, i, e, f)) return !1
                        }
                        for (s in u)(a = o[s]) && (a.pg && a.t._kill(u) && (h = !0), a.pg && 0 !== a.t._overwriteProps.length || (a._prev ? a._prev._next = a._next : a === this._firstPT && (this._firstPT = a._next), a._next && (a._next._prev = a._prev), a._next = a._prev = null), delete o[s]), c && (r[s] = 1);
                        !this._firstPT && this._initted && this._enabled(!1, !1)
                    }
                }
                return h
            }, c.invalidate = function() {
                return this._notifyPluginsOfEnabled && M._onPluginEvent("_onDisable", this), this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null, this._notifyPluginsOfEnabled = this._active = this._lazy = !1, this._propLookup = this._targets ? {} : [], A.prototype.invalidate.call(this), this.vars.immediateRender && (this._time = -s, this.render(-this._delay)), this
            }, c._enabled = function(t, e) {
                if (p || f.wake(), t && this._gc) {
                    var i = this._targets,
                        n;
                    if (i)
                        for (n = i.length; --n > -1;) this._siblings[n] = q(i[n], this, !0);
                    else this._siblings = q(this.target, this, !0)
                }
                return A.prototype._enabled.call(this, t, e), this._notifyPluginsOfEnabled && this._firstPT ? M._onPluginEvent(t ? "_onEnable" : "_onDisable", this) : !1
            }, M.to = function(t, e, i) {
                return new M(t, e, i)
            }, M.from = function(t, e, i) {
                return i.runBackwards = !0, i.immediateRender = 0 != i.immediateRender, new M(t, e, i)
            }, M.fromTo = function(t, e, i, n) {
                return n.startAt = i, n.immediateRender = 0 != n.immediateRender && 0 != i.immediateRender, new M(t, e, n)
            }, M.delayedCall = function(t, e, i, n, r) {
                return new M(e, 0, {
                    delay: t,
                    onComplete: e,
                    onCompleteParams: i,
                    onCompleteScope: n,
                    onReverseComplete: e,
                    onReverseCompleteParams: i,
                    onReverseCompleteScope: n,
                    immediateRender: !1,
                    lazy: !1,
                    useFrames: r,
                    overwrite: 0
                })
            }, M.set = function(t, e) {
                return new M(t, 0, e)
            }, M.getTweensOf = function(t, e) {
                if (null == t) return [];
                t = "string" != typeof t ? t : M.selector(t) || t;
                var i, n, r, s;
                if ((l(t) || N(t)) && "number" != typeof t[0]) {
                    for (i = t.length, n = []; --i > -1;) n = n.concat(M.getTweensOf(t[i], e));
                    for (i = n.length; --i > -1;)
                        for (s = n[i], r = i; --r > -1;) s === n[r] && n.splice(i, 1)
                } else
                    for (n = q(t).concat(), i = n.length; --i > -1;)(n[i]._gc || e && !n[i].isActive()) && n.splice(i, 1);
                return n
            }, M.killTweensOf = M.killDelayedCallsTo = function(t, e, i) {
                "object" == typeof e && (i = e, e = !1);
                for (var n = M.getTweensOf(t, e), r = n.length; --r > -1;) n[r]._kill(i, t)
            };
            var G = _("plugins.TweenPlugin", function(t, e) {
                this._overwriteProps = (t || "").split(","), this._propName = this._overwriteProps[0], this._priority = e || 0, this._super = G.prototype
            }, !0);
            if (c = G.prototype, G.version = "1.10.1", G.API = 2, c._firstPT = null, c._addTween = function(t, e, i, n, r, s) {
                var a, o;
                return null != n && (a = "number" == typeof n || "=" !== n.charAt(1) ? Number(n) - i : parseInt(n.charAt(0) + "1", 10) * Number(n.substr(2))) ? (this._firstPT = o = {
                    _next: this._firstPT,
                    t: t,
                    p: e,
                    s: i,
                    c: a,
                    f: "function" == typeof t[e],
                    n: r || e,
                    r: s
                }, o._next && (o._next._prev = o), o) : void 0
            }, c.setRatio = function(t) {
                for (var e = this._firstPT, i = 1e-6, n; e;) n = e.c * t + e.s, e.r ? n = Math.round(n) : i > n && n > -i && (n = 0), e.f ? e.t[e.p](n) : e.t[e.p] = n, e = e._next
            }, c._kill = function(t) {
                var e = this._overwriteProps,
                    i = this._firstPT,
                    n;
                if (null != t[this._propName]) this._overwriteProps = [];
                else
                    for (n = e.length; --n > -1;) null != t[e[n]] && e.splice(n, 1);
                for (; i;) null != t[i.n] && (i._next && (i._next._prev = i._prev), i._prev ? (i._prev._next = i._next, i._prev = null) : this._firstPT === i && (this._firstPT = i._next)), i = i._next;
                return !1
            }, c._roundProps = function(t, e) {
                for (var i = this._firstPT; i;)(t[this._propName] || null != i.n && t[i.n.split(this._propName + "_").join("")]) && (i.r = e), i = i._next
            }, M._onPluginEvent = function(t, e) {
                var i = e._firstPT,
                    n, r, s, a, o;
                if ("_onInitAllProps" === t) {
                    for (; i;) {
                        for (o = i._next, r = s; r && r.pr > i.pr;) r = r._next;
                        (i._prev = r ? r._prev : a) ? i._prev._next = i : s = i, (i._next = r) ? r._prev = i : a = i, i = o
                    }
                    i = e._firstPT = s
                }
                for (; i;) i.pg && "function" == typeof i.t[t] && i.t[t]() && (n = !0), i = i._next;
                return n
            }, G.activate = function(t) {
                for (var e = t.length; --e > -1;) t[e].API === G.API && (E[(new t[e])._propName] = t[e]);
                return !0
            }, m.plugin = function(t) {
                if (!(t && t.propName && t.init && t.API)) throw "illegal plugin definition.";
                var e = t.propName,
                    i = t.priority || 0,
                    n = t.overwriteProps,
                    r = {
                        init: "_onInitTween",
                        set: "setRatio",
                        kill: "_kill",
                        round: "_roundProps",
                        initAll: "_onInitAllProps"
                    }, s = _("plugins." + e.charAt(0).toUpperCase() + e.substr(1) + "Plugin", function() {
                        G.call(this, e, i), this._overwriteProps = n || []
                    }, t.global === !0),
                    a = s.prototype = new G(e),
                    o;
                a.constructor = s, s.API = t.API;
                for (o in r) "function" == typeof t[o] && (a[r[o]] = t[o]);
                return s.version = t.version, G.activate([s]), s
            }, h = t._gsQueue) {
                for (u = 0; u < h.length; u++) h[u]();
                for (c in d) d[c].func || t.console.log("GSAP encountered missing dependency: com.greensock." + c)
            }
            p = !1
        }
    }("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenMax");
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("plugins.ThrowPropsPlugin", ["plugins.TweenPlugin", "TweenLite", "easing.Ease", "utils.VelocityTracker"], function(t, e, i, n) {
        var r, s, a, o, l = function() {
                t.call(this, "throwProps"), this._overwriteProps.length = 0
            }, h = 999999999999999,
            u = 1e-10,
            c = _gsScope._gsDefine.globals,
            f = !1,
            p = {
                x: 1,
                y: 1,
                z: 2,
                scale: 1,
                scaleX: 1,
                scaleY: 1,
                rotation: 1,
                rotationZ: 1,
                rotationX: 2,
                rotationY: 2,
                skewX: 1,
                skewY: 1,
                xPercent: 1,
                yPercent: 1
            }, d = function(t, e, i, n) {
                for (var r, s, a = e.length, o = 0, l = h; --a > -1;) r = e[a], s = r - t, 0 > s && (s = -s), l > s && r >= n && i >= r && (o = a, l = s);
                return e[o]
            }, g = function(t, e, i, n) {
                if ("auto" === t.end) return t;
                i = isNaN(i) ? h : i, n = isNaN(n) ? -h : n;
                var r = "function" == typeof t.end ? t.end(e) : t.end instanceof Array ? d(e, t.end, i, n) : Number(t.end);
                return r > i ? r = i : n > r && (r = n), {
                    max: r,
                    min: r,
                    unitFactor: t.unitFactor
                }
            }, m = function(t, e, i) {
                for (var n in e) void 0 === t[n] && n !== i && (t[n] = e[n]);
                return t
            }, _ = l.calculateChange = function(t, n, r, s) {
                null == s && (s = .05);
                var a = n instanceof i ? n : n ? new i(n) : e.defaultEase;
                return r * s * t / a.getRatio(s)
            }, v = l.calculateDuration = function(t, n, r, s, a) {
                a = a || .05;
                var o = s instanceof i ? s : s ? new i(s) : e.defaultEase;
                return Math.abs((n - t) * o.getRatio(a) / r / a)
            }, y = l.calculateTweenDuration = function(t, r, s, a, o, h) {
                if ("string" == typeof t && (t = e.selector(t)), !t) return 0;
                null == s && (s = 10), null == a && (a = .2), null == o && (o = 1), t.length && (t = t[0] || t);
                var c, p, d, y, x, b, w, T, S, C, k = 0,
                    P = 9999999999,
                    A = r.throwProps || r,
                    R = r.ease instanceof i ? r.ease : r.ease ? new i(r.ease) : e.defaultEase,
                    O = isNaN(A.checkpoint) ? .05 : Number(A.checkpoint),
                    M = isNaN(A.resistance) ? l.defaultResistance : Number(A.resistance);
                for (c in A) "resistance" !== c && "checkpoint" !== c && "preventOvershoot" !== c && (p = A[c], "object" != typeof p && (S = S || n.getByTarget(t), S && S.isTrackingProp(c) ? p = "number" == typeof p ? {
                    velocity: p
                } : {
                    velocity: S.getVelocity(c)
                } : (y = Number(p) || 0, d = y * M > 0 ? y / M : y / -M)), "object" == typeof p && (void 0 !== p.velocity && "number" == typeof p.velocity ? y = Number(p.velocity) || 0 : (S = S || n.getByTarget(t), y = S && S.isTrackingProp(c) ? S.getVelocity(c) : 0), x = isNaN(p.resistance) ? M : Number(p.resistance), d = y * x > 0 ? y / x : y / -x, b = "function" == typeof t[c] ? t[c.indexOf("set") || "function" != typeof t["get" + c.substr(3)] ? c : "get" + c.substr(3)]() : t[c] || 0, w = b + _(y, R, d, O), void 0 !== p.end && (p = g(p, w, p.max, p.min), (h || f) && (A[c] = m(p, A[c], "end"))), void 0 !== p.max && w > Number(p.max) + u ? (C = p.unitFactor || l.defaultUnitFactors[c] || 1, T = b > p.max && p.min !== p.max || y * C > -15 && 45 > y * C ? a + .1 * (s - a) : v(b, p.max, y, R, O), P > T + o && (P = T + o)) : void 0 !== p.min && Number(p.min) - u > w && (C = p.unitFactor || l.defaultUnitFactors[c] || 1, T = p.min > b && p.min !== p.max || y * C > -45 && 15 > y * C ? a + .1 * (s - a) : v(b, p.min, y, R, O), P > T + o && (P = T + o)), T > k && (k = T)), d > k && (k = d));
                return k > P && (k = P), k > s ? s : a > k ? a : k
            }, x = l.prototype = new t("throwProps");
        return x.constructor = l, l.version = "0.9.7", l.API = 2, l._autoCSS = !0, l.defaultResistance = 100, l.defaultUnitFactors = {
            time: 1e3,
            totalTime: 1e3
        }, l.track = function(t, e, i) {
            return n.track(t, e, i)
        }, l.untrack = function(t, e) {
            n.untrack(t, e)
        }, l.isTracking = function(t, e) {
            return n.isTracking(t, e)
        }, l.getVelocity = function(t, e) {
            var i = n.getByTarget(t);
            return i ? i.getVelocity(e) : 0 / 0
        }, l._cssRegister = function() {
            var t = c.com.greensock.plugins.CSSPlugin;
            if (t) {
                var e = t._internals,
                    i = e._parseToProxy,
                    a = e._setPluginRatio,
                    o = e.CSSPropTween;
                e._registerComplexSpecialProp("throwProps", {
                    parser: function(t, e, h, u, c, f) {
                        f = new l;
                        var d, g, m, _, v, y = {}, x = {}, b = {}, w = {}, T = {}, S = {};
                        s = {};
                        for (m in e) "resistance" !== m && "preventOvershoot" !== m && (g = e[m], "object" == typeof g ? (void 0 !== g.velocity && "number" == typeof g.velocity ? y[m] = Number(g.velocity) || 0 : (v = v || n.getByTarget(t), y[m] = v && v.isTrackingProp(m) ? v.getVelocity(m) : 0), void 0 !== g.end && (w[m] = g.end), void 0 !== g.min && (x[m] = g.min), void 0 !== g.max && (b[m] = g.max), g.preventOvershoot && (S[m] = !0), void 0 !== g.resistance && (d = !0, T[m] = g.resistance)) : "number" == typeof g ? y[m] = g : (v = v || n.getByTarget(t), y[m] = v && v.isTrackingProp(m) ? v.getVelocity(m) : g || 0), p[m] && u._enableTransforms(2 === p[m]));
                        _ = i(t, y, u, c, f), r = _.proxy, y = _.end;
                        for (m in r) s[m] = {
                            velocity: y[m],
                            min: x[m],
                            max: b[m],
                            end: w[m],
                            resistance: T[m],
                            preventOvershoot: S[m]
                        };
                        return null != e.resistance && (s.resistance = e.resistance), e.preventOvershoot && (s.preventOvershoot = !0), c = new o(t, "throwProps", 0, 0, _.pt, 2), c.plugin = f, c.setRatio = a, c.data = _, f._onInitTween(r, s, u._tween), c
                    }
                })
            }
        }, l.to = function(t, i, n, l, h) {
            i.throwProps || (i = {
                throwProps: i
            }), 0 === h && (i.throwProps.preventOvershoot = !0), f = !0;
            var u = new e(t, 1, i);
            return u.render(0, !0, !0), u.vars.css ? (u.duration(y(r, {
                throwProps: s,
                ease: i.ease
            }, n, l, h)), u._delay && !u.vars.immediateRender ? u.invalidate() : a._onInitTween(r, o, u), f = !1, u) : (u.kill(), u = new e(t, y(t, i, n, l, h), i), f = !1, u)
        }, x._onInitTween = function(t, e, i) {
            this.target = t, this._props = [], a = this, o = e;
            var r, s, l, h, u, c, p, d, v, y = i._ease,
                x = isNaN(e.checkpoint) ? .05 : Number(e.checkpoint),
                b = i._duration,
                w = e.preventOvershoot,
                T = 0;
            for (r in e)
                if ("resistance" !== r && "checkpoint" !== r && "preventOvershoot" !== r) {
                    if (s = e[r], "number" == typeof s) u = Number(s) || 0;
                    else if ("object" != typeof s || isNaN(s.velocity)) {
                        if (v = v || n.getByTarget(t), !v || !v.isTrackingProp(r)) throw "ERROR: No velocity was defined in the throwProps tween of " + t + " property: " + r;
                        u = v.getVelocity(r)
                    } else u = Number(s.velocity);
                    c = _(u, y, b, x), d = 0, h = "function" == typeof t[r], l = h ? t[r.indexOf("set") || "function" != typeof t["get" + r.substr(3)] ? r : "get" + r.substr(3)]() : t[r], "object" == typeof s && (p = l + c, void 0 !== s.end && (s = g(s, p, s.max, s.min), f && (e[r] = m(s, e[r], "end"))), void 0 !== s.max && p > Number(s.max) ? w || s.preventOvershoot ? c = s.max - l : d = s.max - l - c : void 0 !== s.min && Number(s.min) > p && (w || s.preventOvershoot ? c = s.min - l : d = s.min - l - c)), this._props[T++] = {
                        p: r,
                        s: l,
                        c1: c,
                        c2: d,
                        f: h,
                        r: !1
                    }, this._overwriteProps[T] = r
                }
            return !0
        }, x._kill = function(e) {
            for (var i = this._props.length; --i > -1;) null != e[this._props[i].p] && this._props.splice(i, 1);
            return t.prototype._kill.call(this, e)
        }, x._roundProps = function(t, e) {
            for (var i = this._props, n = i.length; --n > -1;)(t[i[n]] || t.throwProps) && (i[n].r = e)
        }, x.setRatio = function(t) {
            for (var e, i, n = this._props.length; --n > -1;) e = this._props[n], i = e.s + e.c1 * t + e.c2 * t * t, e.r && (i = Math.round(i)), e.f ? this.target[e.p](i) : this.target[e.p] = i
        }, t.activate([l]), l
    }, !0), _gsScope._gsDefine("utils.VelocityTracker", ["TweenLite"], function(t) {
        var e, i, n, r, s = /([A-Z])/g,
            a = {}, o = {
                x: 1,
                y: 1,
                z: 2,
                scale: 1,
                scaleX: 1,
                scaleY: 1,
                rotation: 1,
                rotationZ: 1,
                rotationX: 2,
                rotationY: 2,
                skewX: 1,
                skewY: 1,
                xPercent: 1,
                yPercent: 1
            }, l = document.defaultView ? document.defaultView.getComputedStyle : function() {}, h = function(t, e, i) {
                var n = (t._gsTransform || a)[e];
                return n || 0 === n ? n : (t.style[e] ? n = t.style[e] : (i = i || l(t, null)) ? n = i[e] || i.getPropertyValue(e) || i.getPropertyValue(e.replace(s, "-$1").toLowerCase()) : t.currentStyle && (n = t.currentStyle[e]), parseFloat(n) || 0)
            }, u = t.ticker,
            c = function(t, e, i) {
                this.p = t, this.f = e, this.v1 = this.v2 = 0, this.t1 = this.t2 = u.time, this.css = !1, this.type = "", this._prev = null, i && (this._next = i, i._prev = this)
            }, f = function() {
                var t, i, s = e,
                    a = u.time;
                if (a - n >= .03)
                    for (r = n, n = a; s;) {
                        for (i = s._firstVP; i;) t = i.css ? h(s.target, i.p) : i.f ? s.target[i.p]() : s.target[i.p], (t !== i.v1 || a - i.t1 > .15) && (i.v2 = i.v1, i.v1 = t, i.t2 = i.t1, i.t1 = a), i = i._next;
                        s = s._next
                    }
            }, p = function(t) {
                this._lookup = {}, this.target = t, this.elem = t.style && t.nodeType ? !0 : !1, i || (u.addEventListener("tick", f, null, !1, -100), n = r = u.time, i = !0), e && (this._next = e, e._prev = this), e = this
            }, d = p.getByTarget = function(t) {
                for (var i = e; i;) {
                    if (i.target === t) return i;
                    i = i._next
                }
            }, g = p.prototype;
        return g.addProp = function(e, i) {
            if (!this._lookup[e]) {
                var n = this.target,
                    r = "function" == typeof n[e],
                    s = r ? this._altProp(e) : e,
                    a = this._firstVP;
                this._firstVP = this._lookup[e] = this._lookup[s] = a = new c(s !== e && 0 === e.indexOf("set") ? s : e, r, a), a.css = this.elem && (void 0 !== this.target.style[a.p] || o[a.p]), a.css && o[a.p] && !n._gsTransform && t.set(n, {
                    x: "+=0"
                }), a.type = i || a.css && 0 === e.indexOf("rotation") ? "deg" : "", a.v1 = a.v2 = a.css ? h(n, a.p) : r ? n[a.p]() : n[a.p]
            }
        }, g.removeProp = function(t) {
            var e = this._lookup[t];
            e && (e._prev ? e._prev._next = e._next : e === this._firstVP && (this._firstVP = e._next), e._next && (e._next._prev = e._prev), this._lookup[t] = 0, e.f && (this._lookup[this._altProp(t)] = 0))
        }, g.isTrackingProp = function(t) {
            return this._lookup[t] instanceof c
        }, g.getVelocity = function(t) {
            var e, i, n, r = this._lookup[t],
                s = this.target;
            if (!r) throw "The velocity of " + t + " is not being tracked.";
            return e = r.css ? h(s, r.p) : r.f ? s[r.p]() : s[r.p], i = e - r.v2, ("rad" === r.type || "deg" === r.type) && (n = "rad" === r.type ? 2 * Math.PI : 360, i %= n, i !== i % (n / 2) && (i = 0 > i ? i + n : i - n)), i / (u.time - r.t2)
        }, g._altProp = function(t) {
            var e = t.substr(0, 3),
                i = ("get" === e ? "set" : "set" === e ? "get" : e) + t.substr(3);
            return "function" == typeof this.target[i] ? i : t
        }, p.getByTarget = function(i) {
            var n = e;
            for ("string" == typeof i && (i = t.selector(i)), i.length && i !== window && i[0] && i[0].style && !i.nodeType && (i = i[0]); n;) {
                if (n.target === i) return n;
                n = n._next
            }
        }, p.track = function(t, e, i) {
            var n = d(t),
                r = e.split(","),
                s = r.length;
            for (i = (i || "").split(","), n || (n = new p(t)); --s > -1;) n.addProp(r[s], i[s] || i[0]);
            return n
        }, p.untrack = function(t, i) {
            var n = d(t),
                r = (i || "").split(","),
                s = r.length;
            if (n) {
                for (; --s > -1;) n.removeProp(r[s]);
                n._firstVP && i || (n._prev ? n._prev._next = n._next : n === e && (e = n._next), n._next && (n._next._prev = n._prev))
            }
        }, p.isTracking = function(t, e) {
            var i = d(t);
            return i ? !e && i._firstVP ? !0 : i.isTrackingProp(e) : !1
        }, p
    }, !0)
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    function(t) {
        "use strict";
        var e = function() {
            return (_gsScope.GreenSockGlobals || _gsScope)[t]
        };
        "function" == typeof define && define.amd ? define(["TweenLite"], e) : "undefined" != typeof module && module.exports && (require("../TweenLite.js"), module.exports = e())
    }("ThrowPropsPlugin");
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function() {
    "use strict";
    _gsScope._gsDefine("utils.Draggable", ["events.EventDispatcher", "TweenLite"], function(t, e) {
        var i = {
                css: {}
            }, n = {
                css: {}
            }, r = {
                css: {}
            }, s = {
                css: {}
            }, a = _gsScope._gsDefine.globals,
            o = {}, l = document,
            h = l.documentElement || {}, u = [],
            c = function() {
                return !1
            }, f = 180 / Math.PI,
            p = 999999999999999,
            d = Date.now || function() {
                return (new Date).getTime()
            }, g = !l.addEventListener && l.all,
            m = [],
            _ = {}, v = 0,
            y = /^(?:a|input|textarea|button|select)$/i,
            x = 0,
            b, w, T = 0,
            S = function(t) {
                if ("string" == typeof t && (t = e.selector(t)), !t || t.nodeType) return [t];
                var i = [],
                    n = t.length,
                    r;
                for (r = 0; r !== n; i.push(t[r++]));
                return i
            }, C, k = function() {
                for (var t = m.length; --t > -1;) m[t]()
            }, P = function(t) {
                m.push(t), 1 === m.length && e.ticker.addEventListener("tick", k, this, !1, 1)
            }, A = function(t) {
                for (var i = m.length; --i > -1;) m[i] === t && m.splice(i, 1);
                e.to(R, 0, {
                    overwrite: "all",
                    delay: 15,
                    onComplete: R
                })
            }, R = function() {
                m.length || e.ticker.removeEventListener("tick", k)
            }, O = function(t, e) {
                var i;
                for (i in e) void 0 === t[i] && (t[i] = e[i]);
                return t
            }, M = function() {
                return null != window.pageYOffset ? window.pageYOffset : null != l.scrollTop ? l.scrollTop : h.scrollTop || l.body.scrollTop || 0
            }, N = function() {
                return null != window.pageXOffset ? window.pageXOffset : null != l.scrollLeft ? l.scrollLeft : h.scrollLeft || l.body.scrollLeft || 0
            }, L = function(t, e) {
                _e(t, "scroll", e), t.parentNode && t !== l.body && t !== h && L(t.parentNode, e)
            }, I = function(t, e) {
                ve(t, "scroll", e), t.parentNode && t !== l.body && t !== h && I(t.parentNode, e)
            }, D = function(t, e) {
                return t = t || window.event, o.pageX = t.clientX + l.body.scrollLeft + h.scrollLeft, o.pageY = t.clientY + l.body.scrollTop + h.scrollTop, e && (t.returnValue = !1), o
            }, z = function(t) {
                return t ? ("string" == typeof t && (t = e.selector(t)), t.length && t !== window && t[0] && t[0].style && !t.nodeType && (t = t[0]), t === window || t.nodeType && t.style ? t : null) : t
            }, E = function(t, e) {
                var i = t.style,
                    n, r, s;
                if (void 0 === i[e]) {
                    for (s = ["O", "Moz", "ms", "Ms", "Webkit"], r = 5, n = e.charAt(0).toUpperCase() + e.substr(1); --r > -1 && void 0 === i[s[r] + n];);
                    if (0 > r) return "";
                    b = 3 === r ? "ms" : s[r], e = b + n
                }
                return e
            }, H = function(t, e, i) {
                var n = t.style;
                n && (void 0 === n[e] && (e = E(t, e)), null == i ? n.removeProperty ? n.removeProperty(e.replace(/([A-Z])/g, "-$1").toLowerCase()) : n.removeAttribute(e) : void 0 !== n[e] && (n[e] = i))
            }, B = l.defaultView ? l.defaultView.getComputedStyle : c,
            F = /(?:Left|Right|Width)/i,
            X = /(?:\d|\-|\+|=|#|\.)*/g,
            j = function(t, e, i, n, r) {
                if ("px" === n || !n) return i;
                if ("auto" === n || !i) return 0;
                var s = F.test(e),
                    a = t,
                    o = K.style,
                    h = 0 > i,
                    u;
                return h && (i = -i), "%" === n && -1 !== e.indexOf("border") ? u = i / 100 * (s ? t.clientWidth : t.clientHeight) : (o.cssText = "border:0 solid red;position:" + V(t, "position", !0) + ";line-height:0;", "%" !== n && a.appendChild ? o[s ? "borderLeftWidth" : "borderTopWidth"] = i + n : (a = t.parentNode || l.body, o[s ? "width" : "height"] = i + n), a.appendChild(K), u = parseFloat(K[s ? "offsetWidth" : "offsetHeight"]), a.removeChild(K), 0 !== u || r || (u = j(t, e, i, n, !0))), h ? -u : u
            }, Y = function(t, e) {
                if ("absolute" !== V(t, "position", !0)) return 0;
                var i = "left" === e ? "Left" : "Top",
                    n = V(t, "margin" + i, !0);
                return t["offset" + i] - (j(t, e, parseFloat(n), n.replace(X, "")) || 0)
            }, V = function(t, e, i) {
                var n = (t._gsTransform || {})[e],
                    r;
                return n || 0 === n ? n : (t.style[e] ? n = t.style[e] : (r = B(t)) ? (n = r.getPropertyValue(e.replace(/([A-Z])/g, "-$1").toLowerCase()), n = n || r.length ? n : r[e]) : t.currentStyle && (n = t.currentStyle[e]), "auto" !== n || "top" !== e && "left" !== e || (n = Y(t, e)), i ? n : parseFloat(n) || 0)
            }, q = function(t, e, i) {
                var n = t.vars,
                    r = n[i],
                    s = t._listeners[e];
                "function" == typeof r && r.apply(n[i + "Scope"] || t, n[i + "Params"] || [t.pointerEvent]), s && t.dispatchEvent(e)
            }, U = function(t, e) {
                var i = z(t),
                    n, r, s;
                return i ? fe(i, e) : void 0 !== t.left ? (s = oe(e), {
                    left: t.left - s.x,
                    top: t.top - s.y,
                    width: t.width,
                    height: t.height
                }) : (r = t.min || t.minX || t.minRotation || 0, n = t.min || t.minY || 0, {
                    left: r,
                    top: n,
                    width: (t.max || t.maxX || t.maxRotation || 0) - r,
                    height: (t.max || t.maxY || 0) - n
                })
            }, K = l.createElement("div"),
            J = "" !== E(K, "perspective"),
            G = E(K, "transformOrigin").replace(/^ms/g, "Ms").replace(/([A-Z])/g, "-$1").toLowerCase(),
            W = E(K, "transform"),
            Q = W.replace(/^ms/g, "Ms").replace(/([A-Z])/g, "-$1").toLowerCase(),
            Z = {}, te = {}, ee, ie = function() {
                if (!g) {
                    var t = "http://www.w3.org/2000/svg",
                        e = l.createElementNS(t, "svg"),
                        i = l.createElementNS(t, "rect");
                    return i.setAttributeNS(null, "width", "10"), i.setAttributeNS(null, "height", "10"), e.appendChild(i), e
                }
            }(),
            ne = window.SVGElement,
            re = function(t) {
                return !!(ne && "function" == typeof t.getBBox && t.getCTM && (!t.parentNode || t.parentNode.getBBox && t.parentNode.getCTM))
            }, se = ["class", "viewBox", "width", "height", "xml:space"],
            ae = function(t) {
                if (!t.getBoundingClientRect || !t.parentNode) return {
                    offsetTop: 0,
                    offsetLeft: 0,
                    scaleX: 1,
                    scaleY: 1,
                    offsetParent: h
                };
                if (t._gsSVGData && t._gsSVGData.lastUpdate === e.ticker.frame) return t._gsSVGData;
                var i = t,
                    n = t.style.cssText,
                    r = t._gsSVGData = t._gsSVGData || {}, s, a, o, u, c, f;
                if ("svg" !== (t.nodeName + "").toLowerCase() && t.getBBox) {
                    for (i = t.parentNode, s = t.getBBox(); i && "svg" !== (i.nodeName + "").toLowerCase();) i = i.parentNode;
                    return r = ae(i), {
                        offsetTop: s.y * r.scaleY,
                        offsetLeft: s.x * r.scaleX,
                        scaleX: r.scaleX,
                        scaleY: r.scaleY,
                        offsetParent: i || h
                    }
                }
                for (; !i.offsetParent && i.parentNode;) i = i.parentNode;
                for (t.parentNode.insertBefore(ie, t), t.parentNode.removeChild(t), ie.style.cssText = n, ie.style[W] = "none", c = se.length; --c > -1;) f = t.getAttribute(se[c]), f ? ie.setAttribute(se[c], f) : ie.removeAttribute(se[c]);
                return s = ie.getBoundingClientRect(), u = ie.firstChild.getBoundingClientRect(), o = i.offsetParent, o ? (o === l.body && h && (o = h), a = o.getBoundingClientRect()) : a = {
                    top: -M(),
                    left: -N()
                }, ie.parentNode.insertBefore(t, ie), t.parentNode.removeChild(ie), r.scaleX = u.width / 10, r.scaleY = u.height / 10, r.offsetLeft = s.left - a.left, r.offsetTop = s.top - a.top, r.offsetParent = i.offsetParent || h, r.lastUpdate = e.ticker.frame, r
            }, oe = function(t, i) {
                if (i = i || {}, !t || t === h || !t.parentNode) return {
                    x: 0,
                    y: 0
                };
                var n = B(t),
                    r = G && n ? n.getPropertyValue(G) : "50% 50%",
                    s = r.split(" "),
                    a = -1 !== r.indexOf("left") ? "0%" : -1 !== r.indexOf("right") ? "100%" : s[0],
                    o = -1 !== r.indexOf("top") ? "0%" : -1 !== r.indexOf("bottom") ? "100%" : s[1];
                return ("center" === o || null == o) && (o = "50%"), ("center" === a || isNaN(parseFloat(a))) && (a = "50%"), t.getBBox && re(t) ? (t._gsTransform || (e.set(t, {
                    x: "+=0"
                }), void 0 === t._gsTransform.xOrigin && console.log("Draggable requires at least GSAP 1.15.0")), r = t.getBBox(), s = ae(t), i.x = (t._gsTransform.xOrigin - r.x) * s.scaleX, i.y = (t._gsTransform.yOrigin - r.y) * s.scaleY) : (i.x = -1 !== a.indexOf("%") ? t.offsetWidth * parseFloat(a) / 100 : parseFloat(a), i.y = -1 !== o.indexOf("%") ? t.offsetHeight * parseFloat(o) / 100 : parseFloat(o)), i
            }, le = function(t, e, i) {
                var n, r, s, a, o, u;
                return t !== window && t && t.parentNode ? (n = B(t), r = n ? n.getPropertyValue(Q) : t.currentStyle ? t.currentStyle[W] : "1,0,0,1,0,0", r = (r + "").match(/(?:\-|\b)[\d\-\.e]+\b/g) || [1, 0, 0, 1, 0, 0], r.length > 6 && (r = [r[0], r[1], r[4], r[5], r[12], r[13]]), e && (s = t.parentNode, u = t.getBBox && re(t) || void 0 === t.offsetLeft && "svg" === (t.nodeName + "").toLowerCase() ? ae(t) : t, a = u.offsetParent, o = s === h || s === l.body, void 0 === ee && l.body && W && (ee = function() {
                    var t = l.createElement("div"),
                        e = l.createElement("div"),
                        i, n;
                    return e.style.position = "absolute", l.body.appendChild(t), t.appendChild(e), i = e.offsetParent, t.style[W] = "rotate(1deg)", n = e.offsetParent === i, l.body.removeChild(t), n
                }()), r[4] = Number(r[4]) + e.x + (u.offsetLeft || 0) - i.x - (o ? 0 : s.scrollLeft) + (a ? parseInt(V(a, "borderLeftWidth"), 10) || 0 : 0), r[5] = Number(r[5]) + e.y + (u.offsetTop || 0) - i.y - (o ? 0 : s.scrollTop) + (a ? parseInt(V(a, "borderTopWidth"), 10) || 0 : 0), !s || s.offsetParent !== a || ee && "100100" !== le(s).join("") || (r[4] -= s.offsetLeft || 0, r[5] -= s.offsetTop || 0), s && "fixed" === V(t, "position", !0) && (r[4] += N(), r[5] += M())), r) : [1, 0, 0, 1, 0, 0]
            }, he = function(t, e) {
                if (!t || t === window || !t.parentNode) return [1, 0, 0, 1, 0, 0];
                for (var i = oe(t, Z), n = oe(t.parentNode, te), r = le(t, i, n), s, a, o, l, u, c, f, p;
                     (t = t.parentNode) && t.parentNode && t !== h;) i = n, n = oe(t.parentNode, i === Z ? te : Z), f = le(t, i, n), s = r[0], a = r[1], o = r[2], l = r[3], u = r[4], c = r[5], r[0] = s * f[0] + a * f[2], r[1] = s * f[1] + a * f[3], r[2] = o * f[0] + l * f[2], r[3] = o * f[1] + l * f[3], r[4] = u * f[0] + c * f[2] + f[4], r[5] = u * f[1] + c * f[3] + f[5];
                return e && (s = r[0], a = r[1], o = r[2], l = r[3], u = r[4], c = r[5], p = s * l - a * o, r[0] = l / p, r[1] = -a / p, r[2] = -o / p, r[3] = s / p, r[4] = (o * c - l * u) / p, r[5] = -(s * c - a * u) / p), r
            }, ue = function(t, e, i) {
                var n = he(t),
                    r = e.x,
                    s = e.y;
                return i = i === !0 ? e : i || {}, i.x = r * n[0] + s * n[2] + n[4], i.y = r * n[1] + s * n[3] + n[5], i
            }, ce = function(t, e, i) {
                var n = t.x * e[0] + t.y * e[2] + e[4],
                    r = t.x * e[1] + t.y * e[3] + e[5];
                return t.x = n * i[0] + r * i[2] + i[4], t.y = n * i[1] + r * i[3] + i[5], t
            }, fe = function(t, e) {
                var i, n, r, s, a, o, u, c, f, p, d;
                return t === window ? (s = M(), n = N(), r = n + (h.clientWidth || t.innerWidth || l.body.clientWidth || 0), a = s + ((t.innerHeight || 0) - 20 < h.clientHeight ? h.clientHeight : t.innerHeight || l.body.clientHeight || 0)) : (i = oe(t), n = -i.x, r = n + t.offsetWidth, s = -i.y, a = s + t.offsetHeight), t === e ? {
                    left: n,
                    top: s,
                    width: r - n,
                    height: a - s
                } : (o = he(t), u = he(e, !0), c = ce({
                    x: n,
                    y: s
                }, o, u), f = ce({
                    x: r,
                    y: s
                }, o, u), p = ce({
                    x: r,
                    y: a
                }, o, u), d = ce({
                    x: n,
                    y: a
                }, o, u), n = Math.min(c.x, f.x, p.x, d.x), s = Math.min(c.y, f.y, p.y, d.y), {
                    left: n,
                    top: s,
                    width: Math.max(c.x, f.x, p.x, d.x) - n,
                    height: Math.max(c.y, f.y, p.y, d.y) - s
                })
            }, pe = function(t) {
                return t.length && t[0] && (t[0].nodeType && t[0].style && !t.nodeType || t[0].length && t[0][0]) ? !0 : !1
            }, de = function(t) {
                var e = [],
                    i = t.length,
                    n, r, s;
                for (n = 0; i > n; n++)
                    if (r = t[n], pe(r))
                        for (s = r.length, s = 0; s < r.length; s++) e.push(r[s]);
                    else e.push(r);
                return e
            }, ge = "ontouchstart" in h && "orientation" in window,
            me = function(t) {
                for (var e = t.split(","), i = (void 0 !== K.onpointerdown ? "pointerdown,pointermove,pointerup,pointercancel" : void 0 !== K.onmspointerdown ? "MSPointerDown,MSPointerMove,MSPointerUp,MSPointerCancel" : t).split(","), n = {}, r = 8; --r > -1;) n[e[r]] = i[r], n[i[r]] = e[r];
                return n
            }("touchstart,touchmove,touchend,touchcancel"),
            _e = function(t, e, i) {
                t.addEventListener ? t.addEventListener(me[e] || e, i, !1) : t.attachEvent && t.attachEvent("on" + e, i)
            }, ve = function(t, e, i) {
                t.removeEventListener ? t.removeEventListener(me[e] || e, i) : t.detachEvent && t.detachEvent("on" + e, i)
            }, ye = function(t) {
                w = t.touches && x < t.touches.length, ve(t.target, "touchend", ye)
            }, xe = function(t) {
                w = t.touches && x < t.touches.length, _e(t.target, "touchend", ye)
            }, be = function(t, e, i, n, r, s) {
                var a = {}, o, l, h;
                if (e)
                    if (1 !== r && e instanceof Array) {
                        for (a.end = o = [], h = e.length, l = 0; h > l; l++) o[l] = e[l] * r;
                        i += 1.1, n -= 1.1
                    } else a.end = "function" == typeof e ? function(i) {
                        return e.call(t, i) * r
                    } : e;
                return (i || 0 === i) && (a.max = i), (n || 0 === n) && (a.min = n), s && (a.velocity = 0), a
            }, we = function(t) {
                var e;
                return t && t.getAttribute && "BODY" !== t.nodeName ? "true" === (e = t.getAttribute("data-clickable")) || "false" !== e && (t.onclick || y.test(t.nodeName + "") || "true" === t.getAttribute("contentEditable")) ? !0 : we(t.parentNode) : !1
            }, Te = function(t, e) {
                for (var i = t.length, n; --i > -1;) n = t[i], n.ondragstart = n.onselectstart = e ? null : c, H(n, "userSelect", e ? "text" : "none")
            }, Se, Ce = function() {
                var t = l.createElement("div"),
                    e = l.createElement("div"),
                    i = e.style,
                    n = l.body || K,
                    r;
                return i.display = "inline-block", i.position = "relative", t.style.cssText = e.innerHTML = "width:90px; height:40px; padding:10px; overflow:auto; visibility: hidden", t.appendChild(e), n.appendChild(t), Se = e.offsetHeight + 18 > t.scrollHeight, i.width = "100%", W || (i.paddingRight = "500px", r = t.scrollLeft = t.scrollWidth - t.clientWidth, i.left = "-90px", r = r !== t.scrollLeft), n.removeChild(t), r
            }(),
            ke = function(t, i) {
                t = z(t), i = i || {};
                var n = l.createElement("div"),
                    r = n.style,
                    s = t.firstChild,
                    a = 0,
                    o = 0,
                    h = t.scrollTop,
                    u = t.scrollLeft,
                    c = t.scrollWidth,
                    f = t.scrollHeight,
                    p = 0,
                    d = 0,
                    m = 0,
                    _, v, y, x, b, w;
                J && i.force3D !== !1 ? (b = "translate3d(", w = "px,0px)") : W && (b = "translate(", w = "px)"), this.scrollTop = function(t, e) {
                    return arguments.length ? void this.top(-t, e) : -this.top()
                }, this.scrollLeft = function(t, e) {
                    return arguments.length ? void this.left(-t, e) : -this.left()
                }, this.left = function(n, s) {
                    if (!arguments.length) return -(t.scrollLeft + o);
                    var l = t.scrollLeft - u,
                        h = o;
                    return (l > 2 || -2 > l) && !s ? (u = t.scrollLeft, e.killTweensOf(this, !0, {
                        left: 1,
                        scrollLeft: 1
                    }), this.left(-u), void(i.onKill && i.onKill())) : (n = -n, 0 > n ? (o = n - .5 | 0, n = 0) : n > d ? (o = n - d | 0, n = d) : o = 0, (o || h) && (b ? this._suspendTransforms || (r[W] = b + -o + "px," + -a + w) : r.left = -o + "px", Ce && o + p >= 0 && (r.paddingRight = o + p + "px")), t.scrollLeft = 0 | n, void(u = t.scrollLeft))
                }, this.top = function(n, s) {
                    if (!arguments.length) return -(t.scrollTop + a);
                    var l = t.scrollTop - h,
                        u = a;
                    return (l > 2 || -2 > l) && !s ? (h = t.scrollTop, e.killTweensOf(this, !0, {
                        top: 1,
                        scrollTop: 1
                    }), this.top(-h), void(i.onKill && i.onKill())) : (n = -n, 0 > n ? (a = n - .5 | 0, n = 0) : n > m ? (a = n - m | 0, n = m) : a = 0, (a || u) && (b ? this._suspendTransforms || (r[W] = b + -o + "px," + -a + w) : r.top = -a + "px"), t.scrollTop = 0 | n, void(h = t.scrollTop))
                }, this.maxScrollTop = function() {
                    return m
                }, this.maxScrollLeft = function() {
                    return d
                }, this.disable = function() {
                    for (s = n.firstChild; s;) x = s.nextSibling, t.appendChild(s), s = x;
                    t === n.parentNode && t.removeChild(n)
                }, this.enable = function() {
                    if (s = t.firstChild, s !== n) {
                        for (; s;) x = s.nextSibling, n.appendChild(s), s = x;
                        t.appendChild(n), this.calibrate()
                    }
                }, this.calibrate = function(e) {
                    var i = t.clientWidth === _,
                        s, l;
                    h = t.scrollTop, u = t.scrollLeft, (!i || t.clientHeight !== v || n.offsetHeight !== y || c !== t.scrollWidth || f !== t.scrollHeight || e) && ((a || o) && (s = this.left(), l = this.top(), this.left(-t.scrollLeft), this.top(-t.scrollTop)), (!i || e) && (r.display = "block", r.width = "auto", r.paddingRight = "0px", p = Math.max(0, t.scrollWidth - t.clientWidth), p && (p += V(t, "paddingLeft") + (Se ? V(t, "paddingRight") : 0))), r.display = "inline-block", r.position = "relative", r.overflow = "visible", r.verticalAlign = "top", r.width = "100%", r.paddingRight = p + "px", Se && (r.paddingBottom = V(t, "paddingBottom", !0)), g && (r.zoom = "1"), _ = t.clientWidth, v = t.clientHeight, c = t.scrollWidth, f = t.scrollHeight, d = t.scrollWidth - _, m = t.scrollHeight - v, y = n.offsetHeight, (s || l) && (this.left(s), this.top(l)))
                }, this.content = n, this.element = t, this._suspendTransforms = !1, this.enable()
            }, Pe = function(o, h) {
                t.call(this, o), o = z(o), C || (C = a.com.greensock.plugins.ThrowPropsPlugin), this.vars = h = h || {}, this.target = o, this.x = this.y = this.rotation = 0, this.dragResistance = parseFloat(h.dragResistance) || 0, this.edgeResistance = isNaN(h.edgeResistance) ? 1 : parseFloat(h.edgeResistance) || 0, this.lockAxis = h.lockAxis, this.autoScroll = h.autoScroll || 0, this.lockedAxis = null;
                var c = (h.type || (g ? "top,left" : "x,y")).toLowerCase(),
                    m = -1 !== c.indexOf("x") || -1 !== c.indexOf("y"),
                    y = -1 !== c.indexOf("rotation"),
                    b = y ? "rotation" : m ? "x" : "left",
                    k = m ? "y" : "top",
                    R = -1 !== c.indexOf("x") || -1 !== c.indexOf("left") || "scroll" === c,
                    M = -1 !== c.indexOf("y") || -1 !== c.indexOf("top") || "scroll" === c,
                    N = h.minimumMovement || 2,
                    E = this,
                    B = S(h.trigger || h.handle || o),
                    F = {}, X = 0,
                    j = h.clickableTest || we,
                    Y, K, J, G, W, Q, Z, te, ee, ie, ne, re, se, ae, oe, le, ce, fe, pe, de, ye, Se, Ce, Ae, Oe, Me, Ne, Le, Ie, De, ze = function(t) {
                        if (E.autoScroll && E.isDragging, fe) {
                            var i = E.x,
                                n = E.y,
                                r = 1e-6;
                            r > i && i > -r && (i = 0), r > n && n > -r && (n = 0), y ? (ae.rotation = E.rotation = E.x, e.set(o, se)) : K ? (M && K.top(n), R && K.left(i)) : m ? (M && (ae.y = n), R && (ae.x = i), e.set(o, se)) : (M && (o.style.top = n + "px"), R && (o.style.left = i + "px")), te && !t && q(E, "drag", "onDrag")
                        }
                        fe = !1
                    }, Ee = function(t, i) {
                        var n;
                        m ? (o._gsTransform || e.set(o, {
                            x: "+=0"
                        }), E.y = o._gsTransform.y, E.x = o._gsTransform.x) : y ? (o._gsTransform || e.set(o, {
                            x: "+=0"
                        }), E.x = E.rotation = o._gsTransform.rotation) : K ? (E.y = K.top(), E.x = K.left()) : (E.y = parseInt(o.style.top, 10) || 0, E.x = parseInt(o.style.left, 10) || 0), !de && !ye || i || (de && (n = de(E.x), n !== E.x && (E.x = n, y && (E.rotation = n), fe = !0)), ye && (n = ye(E.y), n !== E.y && (E.y = n, fe = !0)), fe && ze(!0)), h.onThrowUpdate && !t && h.onThrowUpdate.apply(h.onThrowUpdateScope || E, h.onThrowUpdateParams || u)
                    }, He = function() {
                        var t, e, i, n;
                        Z = !1, K ? (K.calibrate(), E.minX = ie = -K.maxScrollLeft(), E.minY = re = -K.maxScrollTop(), E.maxX = ee = E.maxY = ne = 0, Z = !0) : h.bounds && (t = U(h.bounds, o.parentNode), y ? (E.minX = ie = t.left, E.maxX = ee = t.left + t.width, E.minY = re = E.maxY = ne = 0) : void 0 !== h.bounds.maxX || void 0 !== h.bounds.maxY ? (t = h.bounds, E.minX = ie = t.minX, E.minY = re = t.minY, E.maxX = ee = t.maxX, E.maxY = ne = t.maxY) : (e = U(o, o.parentNode), E.minX = ie = V(o, b) + t.left - e.left, E.minY = re = V(o, k) + t.top - e.top, E.maxX = ee = ie + (t.width - e.width), E.maxY = ne = re + (t.height - e.height)), ie > ee && (E.minX = ee, E.maxX = ee = ie, ie = E.minX), re > ne && (E.minY = ne, E.maxY = ne = re, re = E.minY), y && (E.minRotation = ie, E.maxRotation = ee), Z = !0), h.liveSnap && (i = h.liveSnap === !0 ? h.snap || {} : h.liveSnap, n = i instanceof Array || "function" == typeof i, y ? (de = Ye(n ? i : i.rotation, ie, ee, 1), ye = null) : (R && (de = Ye(n ? i : i.x || i.left || i.scrollLeft, ie, ee, K ? -1 : 1)), M && (ye = Ye(n ? i : i.y || i.top || i.scrollTop, re, ne, K ? -1 : 1))))
                    }, Be = function(t, e) {
                        var i, n, r;
                        t && C ? (t === !0 && (i = h.snap || {}, n = i instanceof Array || "function" == typeof i, t = {
                            resistance: (h.throwResistance || h.resistance || 1e3) / (y ? 10 : 1)
                        }, y ? t.rotation = be(E, n ? i : i.rotation, ee, ie, 1, e) : (R && (t[b] = be(E, n ? i : i.x || i.left || i.scrollLeft, ee, ie, K ? -1 : 1, e || E.lockAxis && "x" === E.lockedAxis)), M && (t[k] = be(E, n ? i : i.y || i.top || i.scrollTop, ne, re, K ? -1 : 1, e || E.lockAxis && "y" === E.lockedAxis)))), E.tween = r = C.to(K || o, {
                            throwProps: t,
                            ease: h.ease || a.Power3.easeOut,
                            onComplete: h.onThrowComplete,
                            onCompleteParams: h.onThrowCompleteParams,
                            onCompleteScope: h.onThrowCompleteScope || E,
                            onUpdate: h.fastMode ? h.onThrowUpdate : Ee,
                            onUpdateParams: h.fastMode ? h.onThrowUpdateParams : null,
                            onUpdateScope: h.onThrowUpdateScope || E
                        }, isNaN(h.maxDuration) ? 2 : h.maxDuration, isNaN(h.minDuration) ? .5 : h.minDuration, isNaN(h.overshootTolerance) ? 1 - E.edgeResistance + .2 : h.overshootTolerance), h.fastMode || (K && (K._suspendTransforms = !0), r.render(r.duration(), !0, !0), Ee(!0, !0), E.endX = E.x, E.endY = E.y, y && (E.endRotation = E.x), r.play(0), Ee(!0, !0), K && (K._suspendTransforms = !1))) : Z && E.applyBounds()
                    }, Fe = function() {
                        Ae = he(o.parentNode, !0), Ae[1] || Ae[2] || 1 != Ae[0] || 1 != Ae[3] || 0 != Ae[4] || 0 != Ae[5] || (Ae = null)
                    }, Xe = function() {
                        var t = 1 - E.edgeResistance;
                        Fe(), K ? (He(), Q = K.top(), W = K.left()) : (je() ? (Ee(!0, !0), He()) : E.applyBounds(), y ? (ce = ue(o, {
                            x: 0,
                            y: 0
                        }), Ee(!0, !0), W = E.x, Q = E.y = Math.atan2(ce.y - G, J - ce.x) * f) : (Ne = o.parentNode ? o.parentNode.scrollTop || 0 : 0, Le = o.parentNode ? o.parentNode.scrollLeft || 0 : 0, Q = V(o, k), W = V(o, b))), Z && t && (W > ee ? W = ee + (W - ee) / t : ie > W && (W = ie - (ie - W) / t), y || (Q > ne ? Q = ne + (Q - ne) / t : re > Q && (Q = re - (re - Q) / t)))
                    }, je = function() {
                        return E.tween && E.tween.isActive()
                    }, Ye = function(t, e, i, n) {
                        return "function" == typeof t ? function(r) {
                            var s = E.isPressed ? 1 - E.edgeResistance : 1;
                            return t.call(E, r > i ? i + (r - i) * s : e > r ? e + (r - e) * s : r) * n
                        } : t instanceof Array ? function(n) {
                            for (var r = t.length, s = 0, a = p, o, l; --r > -1;) o = t[r], l = o - n, 0 > l && (l = -l), a > l && o >= e && i >= o && (s = r, a = l);
                            return t[s]
                        } : isNaN(t) ? function(t) {
                            return t
                        } : function() {
                            return t * n
                        }
                    }, Ve = function(t) {
                        var i, n;
                        if (!Y || E.isPressed || !t) return void console.log("returning onPressed");
                        if (Oe = je(), E.pointerEvent = t, me[t.type] ? (Ce = -1 !== t.type.indexOf("touch") ? t.currentTarget : l, _e(Ce, "touchend", Ke), _e(Ce, "touchmove", qe), _e(Ce, "touchcancel", Ke), _e(l, "touchstart", xe)) : (Ce = null, _e(l, "mousemove", qe)), _e(l, "mouseup", Ke), _e(t.target, "mouseup", Ke), Se = j.call(E, t.target) && !h.dragClickables) return _e(t.target, "change", Ke), q(E, "press", "onPress"), void Te(B, !0);
                        if (g ? t = D(t, !0) : !K || t.touches && t.touches.length > x + 1 || (t.preventDefault(), t.preventManipulation && t.preventManipulation()), t.changedTouches ? (t = oe = t.changedTouches[0], le = t.identifier) : t.pointerId ? le = t.pointerId : oe = null, x++, P(ze), G = E.pointerY = t.pageY, J = E.pointerX = t.pageX, Xe(), Ae && (i = J * Ae[0] + G * Ae[2] + Ae[4], G = J * Ae[1] + G * Ae[3] + Ae[5], J = i), E.tween && E.tween.kill(), e.killTweensOf(K || o, !0, F), K && e.killTweensOf(o, !0, {
                            scrollTo: 1
                        }), E.tween = E.lockedAxis = null, (h.zIndexBoost || !y && !K && h.zIndexBoost !== !1) && (o.style.zIndex = Pe.zIndex++), E.isPressed = !0, te = !(!h.onDrag && !E._listeners.drag), !y)
                            for (n = B.length; --n > -1;) H(B[n], "cursor", h.cursor || "move");
                        q(E, "press", "onPress")
                    }, qe = function(t) {
                        if (Y && !w && E.isPressed) {
                            g ? t = D(t, !0) : (t.preventDefault(), t.preventManipulation && t.preventManipulation()), E.pointerEvent = t;
                            var e = t.changedTouches,
                                i = 1 - E.dragResistance,
                                n = 1 - E.edgeResistance,
                                r, s, a, o, l, h, u, c, p;
                            if (e) {
                                if (t = e[0], t !== oe && t.identifier !== le) {
                                    for (l = e.length; --l > -1 && (t = e[l]).identifier !== le;);
                                    if (0 > l) return
                                }
                            } else if (t.pointerId && le && t.pointerId !== le) return;
                            u = E.pointerX = t.pageX, c = E.pointerY = t.pageY, y ? (o = Math.atan2(ce.y - t.pageY, t.pageX - ce.x) * f, h = E.y - o, E.y = o, h > 180 ? Q -= 360 : -180 > h && (Q += 360), a = W + (Q - o) * i) : (Ae && (p = u * Ae[0] + c * Ae[2] + Ae[4], c = u * Ae[1] + c * Ae[3] + Ae[5], u = p), s = c - G, r = u - J, N > s && s > -N && (s = 0), N > r && r > -N && (r = 0), E.lockAxis && (r || s) && ("y" === E.lockedAxis || !E.lockedAxis && Math.abs(r) > Math.abs(s) && R ? (s = 0, E.lockedAxis = "y") : M && (r = 0, E.lockedAxis = "x")), a = W + r * i, o = Q + s * i), de || ye ? (de && (a = de(a)), ye && (o = ye(o))) : Z && (a > ee ? a = ee + (a - ee) * n : ie > a && (a = ie + (a - ie) * n), y || (o > ne ? o = ne + (o - ne) * n : re > o && (o = re + (o - re) * n))), y || (a = Math.round(a), o = Math.round(o)), (E.x !== a || E.y !== o && !y) && (E.x = E.endX = a, y ? E.endRotation = a : E.y = E.endY = o, fe = !0, E.isDragging || (E.isDragging = !0, q(E, "dragstart", "onDragStart")))
                        }
                    }, Ue = function(t, e) {
                        var i = "x" === e ? "Width" : "Height",
                            n = "scroll" + i,
                            r = "client" + i,
                            s = l.body;
                        return t === window || t === l || t === s ? Math.max(l[n], s[n]) - (window["inner" + i] || Math.max(l[r], s[r])) : t[n] - t["offset" + i]
                    }, Ke = function(t, e) {
                        if (!(!Y || t && le && !e && t.pointerId && t.pointerId !== le)) {
                            E.isPressed = !1;
                            var i = t,
                                n = E.isDragging,
                                r, s, a;
                            if (Ce ? (ve(Ce, "touchend", Ke), ve(Ce, "touchmove", qe), ve(Ce, "touchcancel", Ke), ve(l, "touchstart", xe)) : ve(l, "mousemove", qe), ve(l, "mouseup", Ke), t && ve(t.target, "mouseup", Ke), fe = !1, Se) return t && ve(t.target, "change", Ke), Te(B, !1), q(E, "release", "onRelease"), q(E, "click", "onClick"), void(Se = !1);
                            if (A(ze), !y)
                                for (s = B.length; --s > -1;) H(B[s], "cursor", h.cursor || "move");
                            if (n && (X = T = d(), E.isDragging = !1), x--, t) {
                                if (g && (t = D(t, !1)), r = t.changedTouches, r && (t = r[0], t !== oe && t.identifier !== le)) {
                                    for (s = r.length; --s > -1 && (t = r[s]).identifier !== le;);
                                    if (0 > s) return
                                }
                                E.pointerEvent = i, E.pointerX = t.pageX, E.pointerY = t.pageY
                            }
                            return i && !n ? (Oe && (h.snap || h.bounds) && Be(h.throwProps), q(E, "release", "onRelease"), q(E, "click", "onClick"), i.target.click ? i.target.click() : l.createEvent && (a = l.createEvent("MouseEvents"), a.initEvent("click", !0, !0), i.target.dispatchEvent(a)), Me = d()) : (Be(h.throwProps), g || !i || !h.dragClickables && j.call(E, i.target) || !n || (i.preventDefault(), i.preventManipulation && i.preventManipulation()), q(E, "release", "onRelease")), n && q(E, "dragend", "onDragEnd"), !0
                        }
                    }, Je = function(t) {
                        if (E.isDragging) {
                            var e = Le - o.parentNode.scrollLeft,
                                i = Ne - o.parentNode.scrollTop;
                            (e || i) && (J += e, G += i, Le -= e, Ne -= i, E.x -= e, E.y -= i, fe = !0)
                        }
                    }, Ge = function(t) {
                        var e = d(),
                            i = 40 > e - Me;
                        (E.isPressed || 20 > e - X || i) && (t.preventDefault ? (t.preventDefault(), i && t.stopImmediatePropagation()) : t.returnValue = !1, t.preventManipulation && t.preventManipulation())
                    };
                pe = Pe.get(this.target), pe && pe.kill(), this.startDrag = function(t) {
                    Ve(t), E.isDragging || (E.isDragging = !0, q(E, "dragstart", "onDragStart"))
                }, this.drag = qe, this.endDrag = function(t) {
                    Ke(t, !0)
                }, this.timeSinceDrag = function() {
                    return E.isDragging ? 0 : (d() - X) / 1e3
                }, this.hitTest = function(t, e) {
                    return Pe.hitTest(E.target, t, e)
                }, this.getDirection = function(t, e) {
                    var i = "velocity" === t && C ? t : "object" != typeof t || y ? "start" : "element",
                        n, r, s, a, o, l;
                    return "element" === i && (o = Re(E.target), l = Re(t)), n = "start" === i ? E.x - W : "velocity" === i ? C.getVelocity(this.target, b) : o.left + o.width / 2 - (l.left + l.width / 2), y ? 0 > n ? "counter-clockwise" : "clockwise" : (e = e || 2, r = "start" === i ? E.y - Q : "velocity" === i ? C.getVelocity(this.target, k) : o.top + o.height / 2 - (l.top + l.height / 2), s = Math.abs(n / r), a = 1 / e > s ? "" : 0 > n ? "left" : "right", e > s && ("" !== a && (a += "-"), a += 0 > r ? "up" : "down"), a)
                }, this.applyBounds = function(t) {
                    var e, i;
                    return t && h.bounds !== t ? (h.bounds = t, E.update(!0)) : (Ee(!0), He(), Z && (e = E.x, i = E.y, Z && (e > ee ? e = ee : ie > e && (e = ie), i > ne ? i = ne : re > i && (i = re)), (E.x !== e || E.y !== i) && (E.x = E.endX = e, y ? E.endRotation = e : E.y = E.endY = i, fe = !0, ze())), E)
                }, this.update = function(t) {
                    var e = E.x,
                        i = E.y;
                    return Fe(), Je(), t ? E.applyBounds() : (fe && ze(), Ee(!0)), E.isPressed && (R && Math.abs(e - E.x) > .01 || M && Math.abs(i - E.y) > .01 && !y) && Xe(), E
                }, this.enable = function(t) {
                    var i, n, r;
                    if ("soft" !== t) {
                        for (n = B.length; --n > -1;) r = B[n], _e(r, "mousedown", Ve), _e(r, "touchstart", Ve), _e(r, "click", Ge), y || H(r, "cursor", h.cursor || "move"), H(r, "touchCallout", "none"), H(r, "touchAction", "none");
                        Te(B, !1)
                    }
                    return L(E.target, Je), Y = !0, C && "soft" !== t && C.track(K || o, m ? "x,y" : y ? "rotation" : "top,left"), K && K.enable(), o._gsDragID = i = "d" + v++, _[i] = this, K && (K.element._gsDragID = i), e.set(o, {
                        x: "+=0"
                    }), this.update(!0), E
                }, this.disable = function(t) {
                    var e = this.isDragging,
                        i, n;
                    if (!y)
                        for (i = B.length; --i > -1;) H(B[i], "cursor", null);
                    if ("soft" !== t) {
                        for (i = B.length; --i > -1;) n = B[i], H(n, "touchCallout", "default"), H(n, "MSTouchAction", "auto"), ve(n, "mousedown", Ve), ve(n, "touchstart", Ve), ve(n, "click", Ge);
                        Te(B, !0), Ce && (ve(Ce, "touchcancel", Ke), ve(Ce, "touchend", Ke), ve(Ce, "touchmove", qe)), ve(l, "mouseup", Ke), ve(l, "mousemove", qe)
                    }
                    return I(E.target, Je), Y = !1, C && "soft" !== t && C.untrack(K || o, m ? "x,y" : y ? "rotation" : "top,left"), K && K.disable(), A(ze), this.isDragging = this.isPressed = Se = !1, e && q(this, "dragend", "onDragEnd"), E
                }, this.enabled = function(t, e) {
                    return arguments.length ? t ? this.enable(e) : this.disable(e) : Y
                }, this.kill = function() {
                    return e.killTweensOf(K || o, !0, F), E.disable(), delete _[o._gsDragID], E
                }, -1 !== c.indexOf("scroll") && (K = this.scrollProxy = new ke(o, O({
                    onKill: function() {
                        E.isPressed && Ke(null)
                    }
                }, h)), o.style.overflowY = M && !ge ? "auto" : "hidden", o.style.overflowX = R && !ge ? "auto" : "hidden", o = K.content), h.force3D !== !1 && e.set(o, {
                    force3D: !0
                }), y ? F.rotation = 1 : (R && (F[b] = 1), M && (F[k] = 1)), y ? (se = s, ae = se.css, se.overwrite = !1) : m && (se = R && M ? i : R ? n : r, ae = se.css, se.overwrite = !1), this.enable()
            }, Ae = Pe.prototype = new t;
        Ae.constructor = Pe, Ae.pointerX = Ae.pointerY = 0, Ae.isDragging = Ae.isPressed = !1, Pe.version = "0.12.0", Pe.zIndex = 1e3, _e(l, "touchcancel", function() {}), _e(l, "contextmenu", function(t) {
            var e;
            for (e in _) _[e].isPressed && _[e].endDrag()
        }), Pe.create = function(t, i) {
            "string" == typeof t && (t = e.selector(t));
            for (var n = pe(t) ? de(t) : [t], r = n.length; --r > -1;) n[r] = new Pe(n[r], i);
            return n
        }, Pe.get = function(t) {
            return _[(z(t) || {})._gsDragID]
        }, Pe.timeSinceDrag = function() {
            return (d() - T) / 1e3
        };
        var Re = function(t, e) {
            var i = t.pageX !== e ? {
                left: t.pageX,
                top: t.pageY,
                right: t.pageX + 1,
                bottom: t.pageY + 1
            } : t.nodeType || t.left === e || t.top === e ? z(t).getBoundingClientRect() : t;
            return i.right === e && i.width !== e ? (i.right = i.left + i.width, i.bottom = i.top + i.height) : i.width === e && (i = {
                width: i.right - i.left,
                height: i.bottom - i.top,
                right: i.right,
                left: i.left,
                bottom: i.bottom,
                top: i.top
            }), i
        };
        return Pe.hitTest = function(t, e, i) {
            if (t === e) return !1;
            var n = Re(t),
                r = Re(e),
                s = r.left > n.right || r.right < n.left || r.top > n.bottom || r.bottom < n.top,
                a, o, l;
            return s || !i ? !s : (l = -1 !== (i + "").indexOf("%"), i = parseFloat(i) || 0, a = {
                left: Math.max(n.left, r.left),
                top: Math.max(n.top, r.top)
            }, a.width = Math.min(n.right, r.right) - a.left, a.height = Math.min(n.bottom, r.bottom) - a.top, a.width < 0 || a.height < 0 ? !1 : l ? (i *= .01, o = a.width * a.height, o >= n.width * n.height * i || o >= r.width * r.height * i) : a.width > i && a.height > i)
        }, Pe
    }, !0)
}), _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    function(t) {
        "use strict";
        var e = function() {
            return (_gsScope.GreenSockGlobals || _gsScope)[t]
        };
        "function" == typeof define && define.amd ? define(["TweenLite"], e) : "undefined" != typeof module && module.exports && (require("../TweenLite.js"), require("../plugins/CSSPlugin.js"), module.exports = e())
    }("Draggable");
var svg = document.getElementById("menu"),
    svgns = "http://www.w3.org/2000/svg",
    xlinkns = "http://www.w3.org/1999/xlink",
    symbolsContainer = svg.getElementById("symbolsContainer"),
    itemsContainer = svg.getElementById("itemsContainer"),
    trigger = svg.getElementById("trigger"),
    codeContainer = document.getElementById("codeContainer").querySelector("code"),
    source = document.getElementById("demo"),
    smallRadiusContainer = document.getElementById("smallRadiusSliderContainer"),
    smallRadiusControl = document.getElementById("smallRadiusControl"),
    triggerControl = document.getElementById("triggerControl"),
    iconPosControl = document.getElementById("iconPosControl"),
    iconSizeControl = document.getElementById("iconSizeControl"),
    gapControl = document.getElementById("gapControl"),
    circle = svg.querySelector("#trigger circle"),
    downloadButton = document.getElementById("download-button"),
    resetButton = document.getElementById("reset-button"),
    nb = document.getElementById("nb"),
    typePicker = document.getElementsByName("type"),
    stylePicker = document.getElementsByName("style"),
    gapOption = document.getElementById("gaps"),
    nbOfSlices = parseInt(nb.value),
    typeOfCircle = document.querySelector('input[name="type"]:checked').value,
    menuStyle = document.querySelector('input[name="style"]:checked').value,
    gaps = document.getElementById("gaps").checked,
    img = document.createElementNS(svgns, "image"),
    menuCenter = {
        x: 250,
        y: 250
    }, menuRadius = 250,
    menuSmallRadius = 150,
    iconPos;
iconPos = "pie" == menuStyle ? .75 * menuRadius : .68 * menuRadius;
var iconWidth = 40,
    iconHeight = 40,
    angle, pizzaCoordinates = {}, pieCoordinates = {}, gap = 10;
typePicker[0].onclick = function() {
    typeOfCircle = this.value, init()
}, typePicker[1].onclick = function() {
    typeOfCircle = this.value, init()
}, stylePicker[0].onclick = function() {
    menuStyle = this.value, init()
}, stylePicker[1].onclick = function() {
    menuStyle = this.value, init()
}, nb.onchange = function() {
    this.value < 3 && (this.value = 3), this.value > 12 && (this.value = 12), nbOfSlices = parseInt(this.value), codeContainer.textContent = source.innerHTML, init()
}, gapOption.onclick = function() {
    gaps = this.checked, init()
}, smallRadiusControl.addEventListener("change", smallRadiusControlHandler, !1), smallRadiusControl.addEventListener("input", smallRadiusControlHandler, !1), triggerControl.addEventListener("change", triggerControlHandler, !1), triggerControl.addEventListener("input", triggerControlHandler, !1), iconPosControl.addEventListener("change", iconPosControlHandler, !1), iconPosControl.addEventListener("input", iconPosControlHandler, !1), iconSizeControl.addEventListener("change", iconSizeControlHandler, !1), iconSizeControl.addEventListener("input", iconSizeControlHandler, !1), gapControl.addEventListener("change", gapControlHandler, !1), gapControl.addEventListener("input", gapControlHandler, !1), resetButton.onclick = function() {
    nbOfSlices = 4, gaps = !1, gap = 10, gapControl.value = 10, circle.setAttribute("r", "100"), triggerControl.value = 100, menuStyle = "pizza", typeOfCircle = "fullCircle", iconPos = .68 * menuRadius, iconPosControl.value = .68 * menuRadius, iconWidth = 40, iconHeight = 40, iconSizeControl.value = 40, nb.value = nbOfSlices, typePicker[0].checked = !0, typePicker[1].checked && (typePicker[1].checked = !1, typePicker[1].removeAttribute("checked")), stylePicker[0].checked = !0, stylePicker[1].checked && (stylePicker[1].checked = !1, stylePicker[1].removeAttribute("checked")), gapOption.checked = !1, gapControl.setAttribute("value", "10"), gapControl.value = 10, smallRadiusControl.setAttribute("value", "125"), smallRadiusControl.value = 125, TweenLite.set(svg, {
        rotation: 0,
        transformOrigin: "50% 50%"
    }), init()
}, downloadButton.addEventListener("click", function(t) {
    var e = source.innerHTML;
    navigator.msSaveBlob && (t.preventDefault(), navigator.msSaveBlob(new Blob([e], {
        type: "image/svg+xml"
    }), "svg-circular-menu.svg"))
}), init(), makeSpinnable(), ! function(t) {
    var e, i, n = "0.4.2",
        r = "hasOwnProperty",
        s = /[\.\/]/,
        a = /\s*,\s*/,
        o = "*",
        l = function(t, e) {
            return t - e
        }, h = {
            n: {}
        }, u = function() {
            for (var t = 0, e = this.length; e > t; t++)
                if ("undefined" != typeof this[t]) return this[t]
        }, c = function() {
            for (var t = this.length; --t;)
                if ("undefined" != typeof this[t]) return this[t]
        }, f = function(t, n) {
            t = String(t);
            var r, s = i,
                a = Array.prototype.slice.call(arguments, 2),
                o = f.listeners(t),
                h = 0,
                p = [],
                d = {}, g = [],
                m = e;
            g.firstDefined = u, g.lastDefined = c, e = t, i = 0;
            for (var _ = 0, v = o.length; v > _; _++) "zIndex" in o[_] && (p.push(o[_].zIndex), o[_].zIndex < 0 && (d[o[_].zIndex] = o[_]));
            for (p.sort(l); p[h] < 0;)
                if (r = d[p[h++]], g.push(r.apply(n, a)), i) return i = s, g;
            for (_ = 0; v > _; _++)
                if (r = o[_], "zIndex" in r)
                    if (r.zIndex == p[h]) {
                        if (g.push(r.apply(n, a)), i) break;
                        do
                            if (h++, r = d[p[h]], r && g.push(r.apply(n, a)), i) break; while (r)
                    } else d[r.zIndex] = r;
                else if (g.push(r.apply(n, a)), i) break;
            return i = s, e = m, g
        };
    f._events = h, f.listeners = function(t) {
        var e, i, n, r, a, l, u, c, f = t.split(s),
            p = h,
            d = [p],
            g = [];
        for (r = 0, a = f.length; a > r; r++) {
            for (c = [], l = 0, u = d.length; u > l; l++)
                for (p = d[l].n, i = [p[f[r]], p[o]], n = 2; n--;) e = i[n], e && (c.push(e), g = g.concat(e.f || []));
            d = c
        }
        return g
    }, f.on = function(t, e) {
        if (t = String(t), "function" != typeof e) return function() {};
        for (var i = t.split(a), n = 0, r = i.length; r > n; n++)! function(t) {
            for (var i, n = t.split(s), r = h, a = 0, o = n.length; o > a; a++) r = r.n, r = r.hasOwnProperty(n[a]) && r[n[a]] || (r[n[a]] = {
                n: {}
            });
            for (r.f = r.f || [], a = 0, o = r.f.length; o > a; a++)
                if (r.f[a] == e) {
                    i = !0;
                    break
                }!i && r.f.push(e)
        }(i[n]);
        return function(t) {
            +t == +t && (e.zIndex = +t)
        }
    }, f.f = function(t) {
        var e = [].slice.call(arguments, 1);
        return function() {
            f.apply(null, [t, null].concat(e).concat([].slice.call(arguments, 0)))
        }
    }, f.stop = function() {
        i = 1
    }, f.nt = function(t) {
        return t ? new RegExp("(?:\\.|\\/|^)" + t + "(?:\\.|\\/|$)").test(e) : e
    }, f.nts = function() {
        return e.split(s)
    }, f.off = f.unbind = function(t, e) {
        if (!t) return void(f._events = h = {
            n: {}
        });
        var i = t.split(a);
        if (i.length > 1)
            for (var n = 0, l = i.length; l > n; n++) f.off(i[n], e);
        else {
            i = t.split(s);
            var u, c, p, n, l, d, g, m = [h];
            for (n = 0, l = i.length; l > n; n++)
                for (d = 0; d < m.length; d += p.length - 2) {
                    if (p = [d, 1], u = m[d].n, i[n] != o) u[i[n]] && p.push(u[i[n]]);
                    else
                        for (c in u) u[r](c) && p.push(u[c]);
                    m.splice.apply(m, p)
                }
            for (n = 0, l = m.length; l > n; n++)
                for (u = m[n]; u.n;) {
                    if (e) {
                        if (u.f) {
                            for (d = 0, g = u.f.length; g > d; d++)
                                if (u.f[d] == e) {
                                    u.f.splice(d, 1);
                                    break
                                }!u.f.length && delete u.f
                        }
                        for (c in u.n)
                            if (u.n[r](c) && u.n[c].f) {
                                var _ = u.n[c].f;
                                for (d = 0, g = _.length; g > d; d++)
                                    if (_[d] == e) {
                                        _.splice(d, 1);
                                        break
                                    }!_.length && delete u.n[c].f
                            }
                    } else {
                        delete u.f;
                        for (c in u.n) u.n[r](c) && u.n[c].f && delete u.n[c].f
                    }
                    u = u.n
                }
        }
    }, f.once = function(t, e) {
        var i = function() {
            return f.unbind(t, i), e.apply(this, arguments)
        };
        return f.on(t, i)
    }, f.version = n, f.toString = function() {
        return "You are running Eve " + n
    }, "undefined" != typeof module && module.exports ? module.exports = f : "function" == typeof define && define.amd ? define("eve", [], function() {
        return f
    }) : t.eve = f
}(this),
    function(t, e) {
        "function" == typeof define && define.amd ? define(["eve"], function(i) {
            return e(t, i)
        }) : e(t, t.eve)
    }(this, function(t, e) {
        var i = function(e) {
                var i = {}, n = t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || t.msRequestAnimationFrame || function(t) {
                        setTimeout(t, 16)
                    }, r = Array.isArray || function(t) {
                        return t instanceof Array || "[object Array]" == Object.prototype.toString.call(t)
                    }, s = 0,
                    a = "M" + (+new Date).toString(36),
                    o = function() {
                        return a + (s++).toString(36)
                    }, l = Date.now || function() {
                        return +new Date
                    }, h = function(t) {
                        var e = this;
                        if (null == t) return e.s;
                        var i = e.s - t;
                        e.b += e.dur * i, e.B += e.dur * i, e.s = t
                    }, u = function(t) {
                        var e = this;
                        return null == t ? e.spd : void(e.spd = t)
                    }, c = function(t) {
                        var e = this;
                        return null == t ? e.dur : (e.s = e.s * t / e.dur, void(e.dur = t))
                    }, f = function() {
                        var t = this;
                        delete i[t.id], t.update(), e("mina.stop." + t.id, t)
                    }, p = function() {
                        var t = this;
                        t.pdif || (delete i[t.id], t.update(), t.pdif = t.get() - t.b)
                    }, d = function() {
                        var t = this;
                        t.pdif && (t.b = t.get() - t.pdif, delete t.pdif, i[t.id] = t)
                    }, g = function() {
                        var t, e = this;
                        if (r(e.start)) {
                            t = [];
                            for (var i = 0, n = e.start.length; n > i; i++) t[i] = +e.start[i] + (e.end[i] - e.start[i]) * e.easing(e.s)
                        } else t = +e.start + (e.end - e.start) * e.easing(e.s);
                        e.set(t)
                    }, m = function() {
                        var t = 0;
                        for (var r in i)
                            if (i.hasOwnProperty(r)) {
                                var s = i[r],
                                    a = s.get();
                                t++, s.s = (a - s.b) / (s.dur / s.spd), s.s >= 1 && (delete i[r], s.s = 1, t--, function(t) {
                                    setTimeout(function() {
                                        e("mina.finish." + t.id, t)
                                    })
                                }(s)), s.update()
                            }
                        t && n(m)
                    }, _ = function(t, e, r, s, a, l, v) {
                        var y = {
                            id: o(),
                            start: t,
                            end: e,
                            b: r,
                            s: 0,
                            dur: s - r,
                            spd: 1,
                            get: a,
                            set: l,
                            easing: v || _.linear,
                            status: h,
                            speed: u,
                            duration: c,
                            stop: f,
                            pause: p,
                            resume: d,
                            update: g
                        };
                        i[y.id] = y;
                        var x, b = 0;
                        for (x in i)
                            if (i.hasOwnProperty(x) && (b++, 2 == b)) break;
                        return 1 == b && n(m), y
                    };
                return _.time = l, _.getById = function(t) {
                    return i[t] || null
                }, _.linear = function(t) {
                    return t
                }, _.easeout = function(t) {
                    return Math.pow(t, 1.7)
                }, _.easein = function(t) {
                    return Math.pow(t, .48)
                }, _.easeinout = function(t) {
                    if (1 == t) return 1;
                    if (0 == t) return 0;
                    var e = .48 - t / 1.04,
                        i = Math.sqrt(.1734 + e * e),
                        n = i - e,
                        r = Math.pow(Math.abs(n), 1 / 3) * (0 > n ? -1 : 1),
                        s = -i - e,
                        a = Math.pow(Math.abs(s), 1 / 3) * (0 > s ? -1 : 1),
                        o = r + a + .5;
                    return 3 * (1 - o) * o * o + o * o * o
                }, _.backin = function(t) {
                    if (1 == t) return 1;
                    var e = 1.70158;
                    return t * t * ((e + 1) * t - e)
                }, _.backout = function(t) {
                    if (0 == t) return 0;
                    t -= 1;
                    var e = 1.70158;
                    return t * t * ((e + 1) * t + e) + 1
                }, _.elastic = function(t) {
                    return t == !! t ? t : Math.pow(2, -10 * t) * Math.sin(2 * (t - .075) * Math.PI / .3) + 1
                }, _.bounce = function(t) {
                    var e, i = 7.5625,
                        n = 2.75;
                    return 1 / n > t ? e = i * t * t : 2 / n > t ? (t -= 1.5 / n, e = i * t * t + .75) : 2.5 / n > t ? (t -= 2.25 / n, e = i * t * t + .9375) : (t -= 2.625 / n, e = i * t * t + .984375), e
                }, t.mina = _, _
            }("undefined" == typeof e ? function() {} : e),
            n = function() {
                function n(t, e) {
                    if (t) {
                        if (t.tagName) return S(t);
                        if (s(t, "array") && n.set) return n.set.apply(n, t);
                        if (t instanceof x) return t;
                        if (null == e) return t = C.doc.querySelector(t), S(t)
                    }
                    return t = null == t ? "100%" : t, e = null == e ? "100%" : e, new T(t, e)
                }

                function r(t, e) {
                    if (e) {
                        if ("#text" == t && (t = C.doc.createTextNode(e.text || "")), "string" == typeof t && (t = r(t)), "string" == typeof e) return "xlink:" == e.substring(0, 6) ? t.getAttributeNS(J, e.substring(6)) : "xml:" == e.substring(0, 4) ? t.getAttributeNS(G, e.substring(4)) : t.getAttribute(e);
                        for (var i in e)
                            if (e[k](i)) {
                                var n = P(e[i]);
                                n ? "xlink:" == i.substring(0, 6) ? t.setAttributeNS(J, i.substring(6), n) : "xml:" == i.substring(0, 4) ? t.setAttributeNS(G, i.substring(4), n) : t.setAttribute(i, n) : t.removeAttribute(i)
                            }
                    } else t = C.doc.createElementNS(G, t);
                    return t
                }

                function s(t, e) {
                    return e = P.prototype.toLowerCase.call(e), "finite" == e ? isFinite(t) : "array" == e && (t instanceof Array || Array.isArray && Array.isArray(t)) ? !0 : "null" == e && null === t || e == typeof t && null !== t || "object" == e && t === Object(t) || E.call(t).slice(8, -1).toLowerCase() == e
                }

                function a(t) {
                    if ("function" == typeof t || Object(t) !== t) return t;
                    var e = new t.constructor;
                    for (var i in t) t[k](i) && (e[i] = a(t[i]));
                    return e
                }

                function o(t, e) {
                    for (var i = 0, n = t.length; n > i; i++)
                        if (t[i] === e) return t.push(t.splice(i, 1)[0])
                }

                function l(t, e, i) {
                    function n() {
                        var r = Array.prototype.slice.call(arguments, 0),
                            s = r.join("␀"),
                            a = n.cache = n.cache || {}, l = n.count = n.count || [];
                        return a[k](s) ? (o(l, s), i ? i(a[s]) : a[s]) : (l.length >= 1e3 && delete a[l.shift()], l.push(s), a[s] = t.apply(e, r), i ? i(a[s]) : a[s])
                    }
                    return n
                }

                function h(t, e, i, n, r, s) {
                    if (null == r) {
                        var a = t - i,
                            o = e - n;
                        return a || o ? (180 + 180 * O.atan2(-o, -a) / I + 360) % 360 : 0
                    }
                    return h(t, e, r, s) - h(i, n, r, s)
                }

                function u(t) {
                    return t % 360 * I / 180
                }

                function c(t) {
                    return 180 * t / I % 360
                }

                function f(t) {
                    var e = [];
                    return t = t.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, function(t, i, n) {
                        return n = n.split(/\s*,\s*|\s+/), "rotate" == i && 1 == n.length && n.push(0, 0), "scale" == i && (n.length > 2 ? n = n.slice(0, 2) : 2 == n.length && n.push(0, 0), 1 == n.length && n.push(n[0], 0, 0)), e.push("skewX" == i ? ["m", 1, 0, O.tan(u(n[0])), 1, 0, 0] : "skewY" == i ? ["m", 1, O.tan(u(n[0])), 0, 1, 0, 0] : [i.charAt(0)].concat(n)), t
                    }), e
                }

                function p(t, e) {
                    var i = re(t),
                        r = new n.Matrix;
                    if (i)
                        for (var s = 0, a = i.length; a > s; s++) {
                            var o, l, h, u, c, f = i[s],
                                p = f.length,
                                d = P(f[0]).toLowerCase(),
                                g = f[0] != d,
                                m = g ? r.invert() : 0;
                            "t" == d && 2 == p ? r.translate(f[1], 0) : "t" == d && 3 == p ? g ? (o = m.x(0, 0), l = m.y(0, 0), h = m.x(f[1], f[2]), u = m.y(f[1], f[2]), r.translate(h - o, u - l)) : r.translate(f[1], f[2]) : "r" == d ? 2 == p ? (c = c || e, r.rotate(f[1], c.x + c.width / 2, c.y + c.height / 2)) : 4 == p && (g ? (h = m.x(f[2], f[3]), u = m.y(f[2], f[3]), r.rotate(f[1], h, u)) : r.rotate(f[1], f[2], f[3])) : "s" == d ? 2 == p || 3 == p ? (c = c || e, r.scale(f[1], f[p - 1], c.x + c.width / 2, c.y + c.height / 2)) : 4 == p ? g ? (h = m.x(f[2], f[3]), u = m.y(f[2], f[3]), r.scale(f[1], f[1], h, u)) : r.scale(f[1], f[1], f[2], f[3]) : 5 == p && (g ? (h = m.x(f[3], f[4]), u = m.y(f[3], f[4]), r.scale(f[1], f[2], h, u)) : r.scale(f[1], f[2], f[3], f[4])) : "m" == d && 7 == p && r.add(f[1], f[2], f[3], f[4], f[5], f[6])
                        }
                    return r
                }

                function d(t, e) {
                    if (null == e) {
                        var i = !0;
                        if (e = t.node.getAttribute("linearGradient" == t.type || "radialGradient" == t.type ? "gradientTransform" : "pattern" == t.type ? "patternTransform" : "transform"), !e) return new n.Matrix;
                        e = f(e)
                    } else e = n._.rgTransform.test(e) ? P(e).replace(/\.{3}|\u2026/g, t._.transform || D) : f(e), s(e, "array") && (e = n.path ? n.path.toString.call(e) : P(e)), t._.transform = e;
                    var r = p(e, t.getBBox(1));
                    return i ? r : void(t.matrix = r)
                }

                function m(t) {
                    var e = t.node.ownerSVGElement && S(t.node.ownerSVGElement) || t.node.parentNode && S(t.node.parentNode) || n.select("svg") || n(0, 0),
                        i = e.select("defs"),
                        r = null == i ? !1 : i.node;
                    return r || (r = w("defs", e.node).node), r
                }

                function _(t) {
                    return t.node.ownerSVGElement && S(t.node.ownerSVGElement) || n.select("svg")
                }

                function v(t, e, i) {
                    function n(t) {
                        if (null == t) return D;
                        if (t == +t) return t;
                        r(h, {
                            width: t
                        });
                        try {
                            return h.getBBox().width
                        } catch (e) {
                            return 0
                        }
                    }

                    function s(t) {
                        if (null == t) return D;
                        if (t == +t) return t;
                        r(h, {
                            height: t
                        });
                        try {
                            return h.getBBox().height
                        } catch (e) {
                            return 0
                        }
                    }

                    function a(n, r) {
                        null == e ? l[n] = r(t.attr(n) || 0) : n == e && (l = r(null == i ? t.attr(n) || 0 : i))
                    }
                    var o = _(t).node,
                        l = {}, h = o.querySelector(".svg---mgr");
                    switch (h || (h = r("rect"), r(h, {
                        x: -9e9,
                        y: -9e9,
                        width: 10,
                        height: 10,
                        "class": "svg---mgr",
                        fill: "none"
                    }), o.appendChild(h)), t.type) {
                        case "rect":
                            a("rx", n), a("ry", s);
                        case "image":
                            a("width", n), a("height", s);
                        case "text":
                            a("x", n), a("y", s);
                            break;
                        case "circle":
                            a("cx", n), a("cy", s), a("r", n);
                            break;
                        case "ellipse":
                            a("cx", n), a("cy", s), a("rx", n), a("ry", s);
                            break;
                        case "line":
                            a("x1", n), a("x2", n), a("y1", s), a("y2", s);
                            break;
                        case "marker":
                            a("refX", n), a("markerWidth", n), a("refY", s), a("markerHeight", s);
                            break;
                        case "radialGradient":
                            a("fx", n), a("fy", s);
                            break;
                        case "tspan":
                            a("dx", n), a("dy", s);
                            break;
                        default:
                            a(e, n)
                    }
                    return o.removeChild(h), l
                }

                function y(t) {
                    s(t, "array") || (t = Array.prototype.slice.call(arguments, 0));
                    for (var e = 0, i = 0, n = this.node; this[e];) delete this[e++];
                    for (e = 0; e < t.length; e++) "set" == t[e].type ? t[e].forEach(function(t) {
                        n.appendChild(t.node)
                    }) : n.appendChild(t[e].node);
                    var r = n.childNodes;
                    for (e = 0; e < r.length; e++) this[i++] = S(r[e]);
                    return this
                }

                function x(t) {
                    if (t.snap in W) return W[t.snap];
                    var e, i = this.id = K();
                    try {
                        e = t.ownerSVGElement
                    } catch (n) {}
                    if (this.node = t, e && (this.paper = new T(e)), this.type = t.tagName, this.anims = {}, this._ = {
                        transform: []
                    }, t.snap = i, W[i] = this, "g" == this.type && (this.add = y), this.type in {
                        g: 1,
                        mask: 1,
                        pattern: 1
                    })
                        for (var r in T.prototype) T.prototype[k](r) && (this[r] = T.prototype[r])
                }

                function b(t) {
                    this.node = t
                }

                function w(t, e) {
                    var i = r(t);
                    e.appendChild(i);
                    var n = S(i);
                    return n
                }

                function T(t, e) {
                    var i, n, s, a = T.prototype;
                    if (t && "svg" == t.tagName) {
                        if (t.snap in W) return W[t.snap];
                        var o = t.ownerDocument;
                        i = new x(t), n = t.getElementsByTagName("desc")[0], s = t.getElementsByTagName("defs")[0], n || (n = r("desc"), n.appendChild(o.createTextNode("Created with Snap")), i.node.appendChild(n)), s || (s = r("defs"), i.node.appendChild(s)), i.defs = s;
                        for (var l in a) a[k](l) && (i[l] = a[l]);
                        i.paper = i.root = i
                    } else i = w("svg", C.doc.body), r(i.node, {
                        height: e,
                        version: 1.1,
                        width: t,
                        xmlns: G
                    });
                    return i
                }

                function S(t) {
                    return t ? t instanceof x || t instanceof b ? t : t.tagName && "svg" == t.tagName.toLowerCase() ? new T(t) : t.tagName && "object" == t.tagName.toLowerCase() && "image/svg+xml" == t.type ? new T(t.contentDocument.getElementsByTagName("svg")[0]) : new x(t) : t
                }
                n.version = "0.3.0", n.toString = function() {
                    return "Snap v" + this.version
                }, n._ = {};
                var C = {
                    win: t,
                    doc: t.document
                };
                n._.glob = C;
                var k = "hasOwnProperty",
                    P = String,
                    A = parseFloat,
                    R = parseInt,
                    O = Math,
                    M = O.max,
                    N = O.min,
                    L = O.abs,
                    I = (O.pow, O.PI),
                    D = (O.round, ""),
                    z = " ",
                    E = Object.prototype.toString,
                    H = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
                    B = "    \n\f\r   ᠎             　\u2028\u2029",
                    F = (n._.separator = new RegExp("[," + B + "]+"), new RegExp("[" + B + "]", "g"), new RegExp("[" + B + "]*,[" + B + "]*")),
                    X = {
                        hs: 1,
                        rg: 1
                    }, j = new RegExp("([a-z])[" + B + ",]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[" + B + "]*,?[" + B + "]*)+)", "ig"),
                    Y = new RegExp("([rstm])[" + B + ",]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[" + B + "]*,?[" + B + "]*)+)", "ig"),
                    V = new RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[" + B + "]*,?[" + B + "]*", "ig"),
                    q = 0,
                    U = "S" + (+new Date).toString(36),
                    K = function() {
                        return U + (q++).toString(36)
                    }, J = "http://www.w3.org/1999/xlink",
                    G = "http://www.w3.org/2000/svg",
                    W = {}, Q = n.url = function(t) {
                        return "url('#" + t + "')"
                    };
                n._.$ = r, n._.id = K, n.format = function() {
                    var t = /\{([^\}]+)\}/g,
                        e = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
                        i = function(t, i, n) {
                            var r = n;
                            return i.replace(e, function(t, e, i, n, s) {
                                e = e || n, r && (e in r && (r = r[e]), "function" == typeof r && s && (r = r()))
                            }), r = (null == r || r == n ? t : r) + ""
                        };
                    return function(e, n) {
                        return P(e).replace(t, function(t, e) {
                            return i(t, e, n)
                        })
                    }
                }(), n._.clone = a, n._.cacher = l, n.rad = u, n.deg = c, n.angle = h, n.is = s, n.snapTo = function(t, e, i) {
                    if (i = s(i, "finite") ? i : 10, s(t, "array")) {
                        for (var n = t.length; n--;)
                            if (L(t[n] - e) <= i) return t[n]
                    } else {
                        t = +t;
                        var r = e % t;
                        if (i > r) return e - r;
                        if (r > t - i) return e - r + t
                    }
                    return e
                }, n.getRGB = l(function(t) {
                    if (!t || (t = P(t)).indexOf("-") + 1) return {
                        r: -1,
                        g: -1,
                        b: -1,
                        hex: "none",
                        error: 1,
                        toString: ee
                    };
                    if ("none" == t) return {
                        r: -1,
                        g: -1,
                        b: -1,
                        hex: "none",
                        toString: ee
                    };
                    if (!(X[k](t.toLowerCase().substring(0, 2)) || "#" == t.charAt()) && (t = $(t)), !t) return {
                        r: -1,
                        g: -1,
                        b: -1,
                        hex: "none",
                        error: 1,
                        toString: ee
                    };
                    var e, i, r, a, o, l, h = t.match(H);
                    return h ? (h[2] && (r = R(h[2].substring(5), 16), i = R(h[2].substring(3, 5), 16), e = R(h[2].substring(1, 3), 16)), h[3] && (r = R((o = h[3].charAt(3)) + o, 16), i = R((o = h[3].charAt(2)) + o, 16), e = R((o = h[3].charAt(1)) + o, 16)), h[4] && (l = h[4].split(F), e = A(l[0]), "%" == l[0].slice(-1) && (e *= 2.55), i = A(l[1]), "%" == l[1].slice(-1) && (i *= 2.55), r = A(l[2]), "%" == l[2].slice(-1) && (r *= 2.55), "rgba" == h[1].toLowerCase().slice(0, 4) && (a = A(l[3])), l[3] && "%" == l[3].slice(-1) && (a /= 100)), h[5] ? (l = h[5].split(F), e = A(l[0]), "%" == l[0].slice(-1) && (e /= 100), i = A(l[1]), "%" == l[1].slice(-1) && (i /= 100), r = A(l[2]), "%" == l[2].slice(-1) && (r /= 100), ("deg" == l[0].slice(-3) || "°" == l[0].slice(-1)) && (e /= 360), "hsba" == h[1].toLowerCase().slice(0, 4) && (a = A(l[3])), l[3] && "%" == l[3].slice(-1) && (a /= 100), n.hsb2rgb(e, i, r, a)) : h[6] ? (l = h[6].split(F), e = A(l[0]), "%" == l[0].slice(-1) && (e /= 100), i = A(l[1]), "%" == l[1].slice(-1) && (i /= 100), r = A(l[2]), "%" == l[2].slice(-1) && (r /= 100), ("deg" == l[0].slice(-3) || "°" == l[0].slice(-1)) && (e /= 360), "hsla" == h[1].toLowerCase().slice(0, 4) && (a = A(l[3])), l[3] && "%" == l[3].slice(-1) && (a /= 100), n.hsl2rgb(e, i, r, a)) : (e = N(O.round(e), 255), i = N(O.round(i), 255), r = N(O.round(r), 255), a = N(M(a, 0), 1), h = {
                        r: e,
                        g: i,
                        b: r,
                        toString: ee
                    }, h.hex = "#" + (16777216 | r | i << 8 | e << 16).toString(16).slice(1), h.opacity = s(a, "finite") ? a : 1, h)) : {
                        r: -1,
                        g: -1,
                        b: -1,
                        hex: "none",
                        error: 1,
                        toString: ee
                    }
                }, n), n.hsb = l(function(t, e, i) {
                    return n.hsb2rgb(t, e, i).hex
                }), n.hsl = l(function(t, e, i) {
                    return n.hsl2rgb(t, e, i).hex
                }), n.rgb = l(function(t, e, i, n) {
                    if (s(n, "finite")) {
                        var r = O.round;
                        return "rgba(" + [r(t), r(e), r(i), +n.toFixed(2)] + ")"
                    }
                    return "#" + (16777216 | i | e << 8 | t << 16).toString(16).slice(1)
                });
                var $ = function(t) {
                    var e = C.doc.getElementsByTagName("head")[0] || C.doc.getElementsByTagName("svg")[0],
                        i = "rgb(255, 0, 0)";
                    return ($ = l(function(t) {
                        if ("red" == t.toLowerCase()) return i;
                        e.style.color = i, e.style.color = t;
                        var n = C.doc.defaultView.getComputedStyle(e, D).getPropertyValue("color");
                        return n == i ? null : n
                    }))(t)
                }, Z = function() {
                    return "hsb(" + [this.h, this.s, this.b] + ")"
                }, te = function() {
                    return "hsl(" + [this.h, this.s, this.l] + ")"
                }, ee = function() {
                    return 1 == this.opacity || null == this.opacity ? this.hex : "rgba(" + [this.r, this.g, this.b, this.opacity] + ")"
                }, ie = function(t, e, i) {
                    if (null == e && s(t, "object") && "r" in t && "g" in t && "b" in t && (i = t.b, e = t.g, t = t.r), null == e && s(t, string)) {
                        var r = n.getRGB(t);
                        t = r.r, e = r.g, i = r.b
                    }
                    return (t > 1 || e > 1 || i > 1) && (t /= 255, e /= 255, i /= 255), [t, e, i]
                }, ne = function(t, e, i, r) {
                    t = O.round(255 * t), e = O.round(255 * e), i = O.round(255 * i);
                    var a = {
                        r: t,
                        g: e,
                        b: i,
                        opacity: s(r, "finite") ? r : 1,
                        hex: n.rgb(t, e, i),
                        toString: ee
                    };
                    return s(r, "finite") && (a.opacity = r), a
                };
                n.color = function(t) {
                    var e;
                    return s(t, "object") && "h" in t && "s" in t && "b" in t ? (e = n.hsb2rgb(t), t.r = e.r, t.g = e.g, t.b = e.b, t.opacity = 1, t.hex = e.hex) : s(t, "object") && "h" in t && "s" in t && "l" in t ? (e = n.hsl2rgb(t), t.r = e.r, t.g = e.g, t.b = e.b, t.opacity = 1, t.hex = e.hex) : (s(t, "string") && (t = n.getRGB(t)), s(t, "object") && "r" in t && "g" in t && "b" in t && !("error" in t) ? (e = n.rgb2hsl(t), t.h = e.h, t.s = e.s, t.l = e.l, e = n.rgb2hsb(t), t.v = e.b) : (t = {
                        hex: "none"
                    }, t.r = t.g = t.b = t.h = t.s = t.v = t.l = -1, t.error = 1)), t.toString = ee, t
                }, n.hsb2rgb = function(t, e, i, n) {
                    s(t, "object") && "h" in t && "s" in t && "b" in t && (i = t.b, e = t.s, t = t.h, n = t.o), t *= 360;
                    var r, a, o, l, h;
                    return t = t % 360 / 60, h = i * e, l = h * (1 - L(t % 2 - 1)), r = a = o = i - h, t = ~~t, r += [h, l, 0, 0, l, h][t], a += [l, h, h, l, 0, 0][t], o += [0, 0, l, h, h, l][t], ne(r, a, o, n)
                }, n.hsl2rgb = function(t, e, i, n) {
                    s(t, "object") && "h" in t && "s" in t && "l" in t && (i = t.l, e = t.s, t = t.h), (t > 1 || e > 1 || i > 1) && (t /= 360, e /= 100, i /= 100), t *= 360;
                    var r, a, o, l, h;
                    return t = t % 360 / 60, h = 2 * e * (.5 > i ? i : 1 - i), l = h * (1 - L(t % 2 - 1)), r = a = o = i - h / 2, t = ~~t, r += [h, l, 0, 0, l, h][t], a += [l, h, h, l, 0, 0][t], o += [0, 0, l, h, h, l][t], ne(r, a, o, n)
                }, n.rgb2hsb = function(t, e, i) {
                    i = ie(t, e, i), t = i[0], e = i[1], i = i[2];
                    var n, r, s, a;
                    return s = M(t, e, i), a = s - N(t, e, i), n = 0 == a ? null : s == t ? (e - i) / a : s == e ? (i - t) / a + 2 : (t - e) / a + 4, n = (n + 360) % 6 * 60 / 360, r = 0 == a ? 0 : a / s, {
                        h: n,
                        s: r,
                        b: s,
                        toString: Z
                    }
                }, n.rgb2hsl = function(t, e, i) {
                    i = ie(t, e, i), t = i[0], e = i[1], i = i[2];
                    var n, r, s, a, o, l;
                    return a = M(t, e, i), o = N(t, e, i), l = a - o, n = 0 == l ? null : a == t ? (e - i) / l : a == e ? (i - t) / l + 2 : (t - e) / l + 4, n = (n + 360) % 6 * 60 / 360, s = (a + o) / 2, r = 0 == l ? 0 : .5 > s ? l / (2 * s) : l / (2 - 2 * s), {
                        h: n,
                        s: r,
                        l: s,
                        toString: te
                    }
                }, n.parsePathString = function(t) {
                    if (!t) return null;
                    var e = n.path(t);
                    if (e.arr) return n.path.clone(e.arr);
                    var i = {
                        a: 7,
                        c: 6,
                        o: 2,
                        h: 1,
                        l: 2,
                        m: 2,
                        r: 4,
                        q: 4,
                        s: 4,
                        t: 2,
                        v: 1,
                        u: 3,
                        z: 0
                    }, r = [];
                    return s(t, "array") && s(t[0], "array") && (r = n.path.clone(t)), r.length || P(t).replace(j, function(t, e, n) {
                        var s = [],
                            a = e.toLowerCase();
                        if (n.replace(V, function(t, e) {
                            e && s.push(+e)
                        }), "m" == a && s.length > 2 && (r.push([e].concat(s.splice(0, 2))), a = "l", e = "m" == e ? "l" : "L"), "o" == a && 1 == s.length && r.push([e, s[0]]), "r" == a) r.push([e].concat(s));
                        else
                            for (; s.length >= i[a] && (r.push([e].concat(s.splice(0, i[a]))), i[a]););
                    }), r.toString = n.path.toString, e.arr = n.path.clone(r), r
                };
                var re = n.parseTransformString = function(t) {
                    if (!t) return null;
                    var e = [];
                    return s(t, "array") && s(t[0], "array") && (e = n.path.clone(t)), e.length || P(t).replace(Y, function(t, i, n) {
                        var r = [];
                        i.toLowerCase(), n.replace(V, function(t, e) {
                            e && r.push(+e)
                        }), e.push([i].concat(r))
                    }), e.toString = n.path.toString, e
                };
                n._.svgTransform2string = f, n._.rgTransform = new RegExp("^[a-z][" + B + "]*-?\\.?\\d", "i"), n._.transform2matrix = p, n._unit2px = v, C.doc.contains || C.doc.compareDocumentPosition ? function(t, e) {
                    var i = 9 == t.nodeType ? t.documentElement : t,
                        n = e && e.parentNode;
                    return t == n || !(!n || 1 != n.nodeType || !(i.contains ? i.contains(n) : t.compareDocumentPosition && 16 & t.compareDocumentPosition(n)))
                } : function(t, e) {
                    if (e)
                        for (; e;)
                            if (e = e.parentNode, e == t) return !0;
                    return !1
                }, n._.getSomeDefs = m, n._.getSomeSVG = _, n.select = function(t) {
                    return S(C.doc.querySelector(t))
                }, n.selectAll = function(t) {
                    for (var e = C.doc.querySelectorAll(t), i = (n.set || Array)(), r = 0; r < e.length; r++) i.push(S(e[r]));
                    return i
                }, setInterval(function() {
                    for (var t in W)
                        if (W[k](t)) {
                            var e = W[t],
                                i = e.node;
                            ("svg" != e.type && !i.ownerSVGElement || "svg" == e.type && (!i.parentNode || "ownerSVGElement" in i.parentNode && !i.ownerSVGElement)) && delete W[t]
                        }
                }, 1e4),
                    function(t) {
                        function a(t) {
                            function e(t, e) {
                                var i = r(t.node, e);
                                i = i && i.match(a), i = i && i[2], i && "#" == i.charAt() && (i = i.substring(1), i && (l[i] = (l[i] || []).concat(function(i) {
                                    var n = {};
                                    n[e] = Q(i), r(t.node, n)
                                })))
                            }

                            function i(t) {
                                var e = r(t.node, "xlink:href");
                                e && "#" == e.charAt() && (e = e.substring(1), e && (l[e] = (l[e] || []).concat(function(e) {
                                    t.attr("xlink:href", "#" + e)
                                })))
                            }
                            for (var n, s = t.selectAll("*"), a = /^\s*url\(("|'|)(.*)\1\)\s*$/, o = [], l = {}, h = 0, u = s.length; u > h; h++) {
                                n = s[h], e(n, "fill"), e(n, "stroke"), e(n, "filter"), e(n, "mask"), e(n, "clip-path"), i(n);
                                var c = r(n.node, "id");
                                c && (r(n.node, {
                                    id: n.id
                                }), o.push({
                                    old: c,
                                    id: n.id
                                }))
                            }
                            for (h = 0, u = o.length; u > h; h++) {
                                var f = l[o[h].old];
                                if (f)
                                    for (var p = 0, d = f.length; d > p; p++) f[p](o[h].id)
                            }
                        }

                        function o(t, e, i) {
                            return function(n) {
                                var r = n.slice(t, e);
                                return 1 == r.length && (r = r[0]), i ? i(r) : r
                            }
                        }

                        function l(t) {
                            return function() {
                                var e = t ? "<" + this.type : "",
                                    i = this.node.attributes,
                                    n = this.node.childNodes;
                                if (t)
                                    for (var r = 0, s = i.length; s > r; r++) e += " " + i[r].name + '="' + i[r].value.replace(/"/g, '\\"') + '"';
                                if (n.length) {
                                    for (t && (e += ">"), r = 0, s = n.length; s > r; r++) 3 == n[r].nodeType ? e += n[r].nodeValue : 1 == n[r].nodeType && (e += S(n[r]).toString());
                                    t && (e += "</" + this.type + ">")
                                } else t && (e += "/>");
                                return e
                            }
                        }
                        t.attr = function(t, i) {
                            var n = this;
                            if (n.node, !t) return n;
                            if (s(t, "string")) {
                                if (!(arguments.length > 1)) return e("snap.util.getattr." + t, n).firstDefined();
                                var r = {};
                                r[t] = i, t = r
                            }
                            for (var a in t) t[k](a) && e("snap.util.attr." + a, n, t[a]);
                            return n
                        }, t.getBBox = function(t) {
                            if (!n.Matrix || !n.path) return this.node.getBBox();
                            var e = this,
                                i = new n.Matrix;
                            if (e.removed) return n._.box();
                            for (;
                                "use" == e.type;)
                                if (t || (i = i.add(e.transform().localMatrix.translate(e.attr("x") || 0, e.attr("y") || 0))), e.original) e = e.original;
                                else {
                                    var r = e.attr("xlink:href");
                                    e = e.original = e.node.ownerDocument.getElementById(r.substring(r.indexOf("#") + 1))
                                }
                            var s = e._,
                                a = n.path.get[e.type] || n.path.get.deflt;
                            try {
                                return t ? (s.bboxwt = a ? n.path.getBBox(e.realPath = a(e)) : n._.box(e.node.getBBox()), n._.box(s.bboxwt)) : (e.realPath = a(e), e.matrix = e.transform().localMatrix, s.bbox = n.path.getBBox(n.path.map(e.realPath, i.add(e.matrix))), n._.box(s.bbox))
                            } catch (o) {
                                return n._.box()
                            }
                        };
                        var h = function() {
                            return this.string
                        };
                        t.transform = function(t) {
                            var e = this._;
                            if (null == t) {
                                for (var i, s = this, a = new n.Matrix(this.node.getCTM()), o = d(this), l = [o], u = new n.Matrix, c = o.toTransformString(), f = P(o) == P(this.matrix) ? P(e.transform) : c;
                                     "svg" != s.type && (s = s.parent());) l.push(d(s));
                                for (i = l.length; i--;) u.add(l[i]);
                                return {
                                    string: f,
                                    globalMatrix: a,
                                    totalMatrix: u,
                                    localMatrix: o,
                                    diffMatrix: a.clone().add(o.invert()),
                                    global: a.toTransformString(),
                                    total: u.toTransformString(),
                                    local: c,
                                    toString: h
                                }
                            }
                            return t instanceof n.Matrix ? this.matrix = t : d(this, t), this.node && ("linearGradient" == this.type || "radialGradient" == this.type ? r(this.node, {
                                gradientTransform: this.matrix
                            }) : "pattern" == this.type ? r(this.node, {
                                patternTransform: this.matrix
                            }) : r(this.node, {
                                transform: this.matrix
                            })), this
                        }, t.parent = function() {
                            return S(this.node.parentNode)
                        }, t.append = t.add = function(t) {
                            if (t) {
                                if ("set" == t.type) {
                                    var e = this;
                                    return t.forEach(function(t) {
                                        e.add(t)
                                    }), this
                                }
                                t = S(t), this.node.appendChild(t.node), t.paper = this.paper
                            }
                            return this
                        }, t.appendTo = function(t) {
                            return t && (t = S(t), t.append(this)), this
                        }, t.prepend = function(t) {
                            if (t) {
                                if ("set" == t.type) {
                                    var e, i = this;
                                    return t.forEach(function(t) {
                                        e ? e.after(t) : i.prepend(t), e = t
                                    }), this
                                }
                                t = S(t);
                                var n = t.parent();
                                this.node.insertBefore(t.node, this.node.firstChild), this.add && this.add(), t.paper = this.paper, this.parent() && this.parent().add(), n && n.add()
                            }
                            return this
                        }, t.prependTo = function(t) {
                            return t = S(t), t.prepend(this), this
                        }, t.before = function(t) {
                            if ("set" == t.type) {
                                var e = this;
                                return t.forEach(function(t) {
                                    var i = t.parent();
                                    e.node.parentNode.insertBefore(t.node, e.node), i && i.add()
                                }), this.parent().add(), this
                            }
                            t = S(t);
                            var i = t.parent();
                            return this.node.parentNode.insertBefore(t.node, this.node), this.parent() && this.parent().add(), i && i.add(), t.paper = this.paper, this
                        }, t.after = function(t) {
                            t = S(t);
                            var e = t.parent();
                            return this.node.nextSibling ? this.node.parentNode.insertBefore(t.node, this.node.nextSibling) : this.node.parentNode.appendChild(t.node), this.parent() && this.parent().add(), e && e.add(), t.paper = this.paper, this
                        }, t.insertBefore = function(t) {
                            t = S(t);
                            var e = this.parent();
                            return t.node.parentNode.insertBefore(this.node, t.node), this.paper = t.paper, e && e.add(), t.parent() && t.parent().add(), this
                        }, t.insertAfter = function(t) {
                            t = S(t);
                            var e = this.parent();
                            return t.node.parentNode.insertBefore(this.node, t.node.nextSibling), this.paper = t.paper, e && e.add(), t.parent() && t.parent().add(), this
                        }, t.remove = function() {
                            var t = this.parent();
                            return this.node.parentNode && this.node.parentNode.removeChild(this.node), delete this.paper, this.removed = !0, t && t.add(), this
                        }, t.select = function(t) {
                            return S(this.node.querySelector(t))
                        }, t.selectAll = function(t) {
                            for (var e = this.node.querySelectorAll(t), i = (n.set || Array)(), r = 0; r < e.length; r++) i.push(S(e[r]));
                            return i
                        }, t.asPX = function(t, e) {
                            return null == e && (e = this.attr(t)), +v(this, t, e)
                        }, t.use = function() {
                            var t, e = this.node.id;
                            return e || (e = this.id, r(this.node, {
                                id: e
                            })), t = "linearGradient" == this.type || "radialGradient" == this.type || "pattern" == this.type ? w(this.type, this.node.parentNode) : w("use", this.node.parentNode), r(t.node, {
                                "xlink:href": "#" + e
                            }), t.original = this, t
                        };
                        var u = /\S+/g;
                        t.addClass = function(t) {
                            var e, i, n, r, s = (t || "").match(u) || [],
                                a = this.node,
                                o = a.className.baseVal,
                                l = o.match(u) || [];
                            if (s.length) {
                                for (e = 0; n = s[e++];) i = l.indexOf(n), ~i || l.push(n);
                                r = l.join(" "), o != r && (a.className.baseVal = r)
                            }
                            return this
                        }, t.removeClass = function(t) {
                            var e, i, n, r, s = (t || "").match(u) || [],
                                a = this.node,
                                o = a.className.baseVal,
                                l = o.match(u) || [];
                            if (l.length) {
                                for (e = 0; n = s[e++];) i = l.indexOf(n), ~i && l.splice(i, 1);
                                r = l.join(" "), o != r && (a.className.baseVal = r)
                            }
                            return this
                        }, t.hasClass = function(t) {
                            var e = this.node,
                                i = e.className.baseVal,
                                n = i.match(u) || [];
                            return !!~n.indexOf(t)
                        }, t.toggleClass = function(t, e) {
                            if (null != e) return e ? this.addClass(t) : this.removeClass(t);
                            var i, n, r, s, a = (t || "").match(u) || [],
                                o = this.node,
                                l = o.className.baseVal,
                                h = l.match(u) || [];
                            for (i = 0; r = a[i++];) n = h.indexOf(r), ~n ? h.splice(n, 1) : h.push(r);
                            return s = h.join(" "), l != s && (o.className.baseVal = s), this
                        }, t.clone = function() {
                            var t = S(this.node.cloneNode(!0));
                            return r(t.node, "id") && r(t.node, {
                                id: t.id
                            }), a(t), t.insertAfter(this), t
                        }, t.toDefs = function() {
                            var t = m(this);
                            return t.appendChild(this.node), this
                        }, t.pattern = t.toPattern = function(t, e, i, n) {
                            var a = w("pattern", m(this));
                            return null == t && (t = this.getBBox()), s(t, "object") && "x" in t && (e = t.y, i = t.width, n = t.height, t = t.x), r(a.node, {
                                x: t,
                                y: e,
                                width: i,
                                height: n,
                                patternUnits: "userSpaceOnUse",
                                id: a.id,
                                viewBox: [t, e, i, n].join(" ")
                            }), a.node.appendChild(this.node), a
                        }, t.marker = function(t, e, i, n, a, o) {
                            var l = w("marker", m(this));
                            return null == t && (t = this.getBBox()), s(t, "object") && "x" in t && (e = t.y, i = t.width, n = t.height, a = t.refX || t.cx, o = t.refY || t.cy, t = t.x), r(l.node, {
                                viewBox: [t, e, i, n].join(z),
                                markerWidth: i,
                                markerHeight: n,
                                orient: "auto",
                                refX: a || 0,
                                refY: o || 0,
                                id: l.id
                            }), l.node.appendChild(this.node), l
                        };
                        var c = function(t, e, n, r) {
                            "function" != typeof n || n.length || (r = n, n = i.linear), this.attr = t, this.dur = e, n && (this.easing = n), r && (this.callback = r)
                        };
                        n._.Animation = c, n.animation = function(t, e, i, n) {
                            return new c(t, e, i, n)
                        }, t.inAnim = function() {
                            var t = this,
                                e = [];
                            for (var i in t.anims) t.anims[k](i) && ! function(t) {
                                e.push({
                                    anim: new c(t._attrs, t.dur, t.easing, t._callback),
                                    mina: t,
                                    curStatus: t.status(),
                                    status: function(e) {
                                        return t.status(e)
                                    },
                                    stop: function() {
                                        t.stop()
                                    }
                                })
                            }(t.anims[i]);
                            return e
                        }, n.animate = function(t, n, r, s, a, o) {
                            "function" != typeof a || a.length || (o = a, a = i.linear);
                            var l = i.time(),
                                h = i(t, n, l, l + s, i.time, r, a);
                            return o && e.once("mina.finish." + h.id, o), h
                        }, t.stop = function() {
                            for (var t = this.inAnim(), e = 0, i = t.length; i > e; e++) t[e].stop();
                            return this
                        }, t.animate = function(t, n, r, a) {
                            "function" != typeof r || r.length || (a = r, r = i.linear), t instanceof c && (a = t.callback, r = t.easing, n = r.dur, t = t.attr);
                            var l, h, u, f, p = [],
                                d = [],
                                g = {}, m = this;
                            for (var _ in t)
                                if (t[k](_)) {
                                    m.equal ? (f = m.equal(_, P(t[_])), l = f.from, h = f.to, u = f.f) : (l = +m.attr(_), h = +t[_]);
                                    var v = s(l, "array") ? l.length : 1;
                                    g[_] = o(p.length, p.length + v, u), p = p.concat(l), d = d.concat(h)
                                }
                            var y = i.time(),
                                x = i(p, d, y, y + n, i.time, function(t) {
                                    var e = {};
                                    for (var i in g) g[k](i) && (e[i] = g[i](t));
                                    m.attr(e)
                                }, r);
                            return m.anims[x.id] = x, x._attrs = t, x._callback = a, e("snap.animcreated." + m.id, x), e.once("mina.finish." + x.id, function() {
                                delete m.anims[x.id], a && a.call(m)
                            }), e.once("mina.stop." + x.id, function() {
                                delete m.anims[x.id]
                            }), m
                        };
                        var f = {};
                        t.data = function(t, i) {
                            var r = f[this.id] = f[this.id] || {};
                            if (0 == arguments.length) return e("snap.data.get." + this.id, this, r, null), r;
                            if (1 == arguments.length) {
                                if (n.is(t, "object")) {
                                    for (var s in t) t[k](s) && this.data(s, t[s]);
                                    return this
                                }
                                return e("snap.data.get." + this.id, this, r[t], t), r[t]
                            }
                            return r[t] = i, e("snap.data.set." + this.id, this, i, t), this
                        }, t.removeData = function(t) {
                            return null == t ? f[this.id] = {} : f[this.id] && delete f[this.id][t], this
                        }, t.outerSVG = t.toString = l(1), t.innerSVG = l()
                    }(x.prototype), n.parse = function(t) {
                    var e = C.doc.createDocumentFragment(),
                        i = !0,
                        n = C.doc.createElement("div");
                    if (t = P(t), t.match(/^\s*<\s*svg(?:\s|>)/) || (t = "<svg>" + t + "</svg>", i = !1), n.innerHTML = t, t = n.getElementsByTagName("svg")[0])
                        if (i) e = t;
                        else
                            for (; t.firstChild;) e.appendChild(t.firstChild);
                    return n.innerHTML = D, new b(e)
                }, b.prototype.select = x.prototype.select, b.prototype.selectAll = x.prototype.selectAll, n.fragment = function() {
                    for (var t = Array.prototype.slice.call(arguments, 0), e = C.doc.createDocumentFragment(), i = 0, r = t.length; r > i; i++) {
                        var s = t[i];
                        s.node && s.node.nodeType && e.appendChild(s.node), s.nodeType && e.appendChild(s), "string" == typeof s && e.appendChild(n.parse(s).node)
                    }
                    return new b(e)
                }, n._.make = w, n._.wrap = S, T.prototype.el = function(t, e) {
                    var i = w(t, this.node);
                    return e && i.attr(e), i
                }, e.on("snap.util.getattr", function() {
                    var t = e.nt();
                    t = t.substring(t.lastIndexOf(".") + 1);
                    var i = t.replace(/[A-Z]/g, function(t) {
                        return "-" + t.toLowerCase()
                    });
                    return se[k](i) ? this.node.ownerDocument.defaultView.getComputedStyle(this.node, null).getPropertyValue(i) : r(this.node, t)
                });
                var se = {
                    "alignment-baseline": 0,
                    "baseline-shift": 0,
                    clip: 0,
                    "clip-path": 0,
                    "clip-rule": 0,
                    color: 0,
                    "color-interpolation": 0,
                    "color-interpolation-filters": 0,
                    "color-profile": 0,
                    "color-rendering": 0,
                    cursor: 0,
                    direction: 0,
                    display: 0,
                    "dominant-baseline": 0,
                    "enable-background": 0,
                    fill: 0,
                    "fill-opacity": 0,
                    "fill-rule": 0,
                    filter: 0,
                    "flood-color": 0,
                    "flood-opacity": 0,
                    font: 0,
                    "font-family": 0,
                    "font-size": 0,
                    "font-size-adjust": 0,
                    "font-stretch": 0,
                    "font-style": 0,
                    "font-variant": 0,
                    "font-weight": 0,
                    "glyph-orientation-horizontal": 0,
                    "glyph-orientation-vertical": 0,
                    "image-rendering": 0,
                    kerning: 0,
                    "letter-spacing": 0,
                    "lighting-color": 0,
                    marker: 0,
                    "marker-end": 0,
                    "marker-mid": 0,
                    "marker-start": 0,
                    mask: 0,
                    opacity: 0,
                    overflow: 0,
                    "pointer-events": 0,
                    "shape-rendering": 0,
                    "stop-color": 0,
                    "stop-opacity": 0,
                    stroke: 0,
                    "stroke-dasharray": 0,
                    "stroke-dashoffset": 0,
                    "stroke-linecap": 0,
                    "stroke-linejoin": 0,
                    "stroke-miterlimit": 0,
                    "stroke-opacity": 0,
                    "stroke-width": 0,
                    "text-anchor": 0,
                    "text-decoration": 0,
                    "text-rendering": 0,
                    "unicode-bidi": 0,
                    visibility: 0,
                    "word-spacing": 0,
                    "writing-mode": 0
                };
                e.on("snap.util.attr", function(t) {
                    var i = e.nt(),
                        n = {};
                    i = i.substring(i.lastIndexOf(".") + 1), n[i] = t;
                    var s = i.replace(/-(\w)/gi, function(t, e) {
                            return e.toUpperCase()
                        }),
                        a = i.replace(/[A-Z]/g, function(t) {
                            return "-" + t.toLowerCase()
                        });
                    se[k](a) ? this.node.style[s] = null == t ? D : t : r(this.node, n)
                }),
                    function() {}(T.prototype), n.ajax = function(t, i, n, r) {
                    var a = new XMLHttpRequest,
                        o = K();
                    if (a) {
                        if (s(i, "function")) r = n, n = i, i = null;
                        else if (s(i, "object")) {
                            var l = [];
                            for (var h in i) i.hasOwnProperty(h) && l.push(encodeURIComponent(h) + "=" + encodeURIComponent(i[h]));
                            i = l.join("&")
                        }
                        return a.open(i ? "POST" : "GET", t, !0), i && (a.setRequestHeader("X-Requested-With", "XMLHttpRequest"), a.setRequestHeader("Content-type", "application/x-www-form-urlencoded")), n && (e.once("snap.ajax." + o + ".0", n), e.once("snap.ajax." + o + ".200", n), e.once("snap.ajax." + o + ".304", n)), a.onreadystatechange = function() {
                            4 == a.readyState && e("snap.ajax." + o + "." + a.status, r, a)
                        }, 4 == a.readyState ? a : (a.send(i), a)
                    }
                }, n.load = function(t, e, i) {
                    n.ajax(t, function(t) {
                        var r = n.parse(t.responseText);
                        i ? e.call(i, r) : e(r)
                    })
                };
                var ae = function(t) {
                    var e = t.getBoundingClientRect(),
                        i = t.ownerDocument,
                        n = i.body,
                        r = i.documentElement,
                        s = r.clientTop || n.clientTop || 0,
                        a = r.clientLeft || n.clientLeft || 0,
                        o = e.top + (g.win.pageYOffset || r.scrollTop || n.scrollTop) - s,
                        l = e.left + (g.win.pageXOffset || r.scrollLeft || n.scrollLeft) - a;
                    return {
                        y: o,
                        x: l
                    }
                };
                return n.getElementByPoint = function(t, e) {
                    var i = this,
                        n = (i.canvas, C.doc.elementFromPoint(t, e));
                    if (C.win.opera && "svg" == n.tagName) {
                        var r = ae(n),
                            s = n.createSVGRect();
                        s.x = t - r.x, s.y = e - r.y, s.width = s.height = 1;
                        var a = n.getIntersectionList(s, null);
                        a.length && (n = a[a.length - 1])
                    }
                    return n ? S(n) : null
                }, n.plugin = function(t) {
                    t(n, x, T, C, b)
                }, C.win.Snap = n, n
            }();
        return n.plugin(function(t) {
            function e(t, e, n, r, s, a) {
                return null == e && "[object SVGMatrix]" == i.call(t) ? (this.a = t.a, this.b = t.b, this.c = t.c, this.d = t.d, this.e = t.e, void(this.f = t.f)) : void(null != t ? (this.a = +t, this.b = +e, this.c = +n, this.d = +r, this.e = +s, this.f = +a) : (this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.e = 0, this.f = 0))
            }
            var i = Object.prototype.toString,
                n = String,
                r = Math,
                s = "";
            ! function(i) {
                function a(t) {
                    return t[0] * t[0] + t[1] * t[1]
                }

                function o(t) {
                    var e = r.sqrt(a(t));
                    t[0] && (t[0] /= e), t[1] && (t[1] /= e)
                }
                i.add = function(t, i, n, r, s, a) {
                    var o, l, h, u, c = [
                            [],
                            [],
                            []
                        ],
                        f = [
                            [this.a, this.c, this.e],
                            [this.b, this.d, this.f],
                            [0, 0, 1]
                        ],
                        p = [
                            [t, n, s],
                            [i, r, a],
                            [0, 0, 1]
                        ];
                    for (t && t instanceof e && (p = [
                        [t.a, t.c, t.e],
                        [t.b, t.d, t.f],
                        [0, 0, 1]
                    ]), o = 0; 3 > o; o++)
                        for (l = 0; 3 > l; l++) {
                            for (u = 0, h = 0; 3 > h; h++) u += f[o][h] * p[h][l];
                            c[o][l] = u
                        }
                    return this.a = c[0][0], this.b = c[1][0], this.c = c[0][1], this.d = c[1][1], this.e = c[0][2], this.f = c[1][2], this
                }, i.invert = function() {
                    var t = this,
                        i = t.a * t.d - t.b * t.c;
                    return new e(t.d / i, -t.b / i, -t.c / i, t.a / i, (t.c * t.f - t.d * t.e) / i, (t.b * t.e - t.a * t.f) / i)
                }, i.clone = function() {
                    return new e(this.a, this.b, this.c, this.d, this.e, this.f)
                }, i.translate = function(t, e) {
                    return this.add(1, 0, 0, 1, t, e)
                }, i.scale = function(t, e, i, n) {
                    return null == e && (e = t), (i || n) && this.add(1, 0, 0, 1, i, n), this.add(t, 0, 0, e, 0, 0), (i || n) && this.add(1, 0, 0, 1, -i, -n), this
                }, i.rotate = function(e, i, n) {
                    e = t.rad(e), i = i || 0, n = n || 0;
                    var s = +r.cos(e).toFixed(9),
                        a = +r.sin(e).toFixed(9);
                    return this.add(s, a, -a, s, i, n), this.add(1, 0, 0, 1, -i, -n)
                }, i.x = function(t, e) {
                    return t * this.a + e * this.c + this.e
                }, i.y = function(t, e) {
                    return t * this.b + e * this.d + this.f
                }, i.get = function(t) {
                    return +this[n.fromCharCode(97 + t)].toFixed(4)
                }, i.toString = function() {
                    return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")"
                }, i.offset = function() {
                    return [this.e.toFixed(4), this.f.toFixed(4)]
                }, i.determinant = function() {
                    return this.a * this.d - this.b * this.c
                }, i.split = function() {
                    var e = {};
                    e.dx = this.e, e.dy = this.f;
                    var i = [
                        [this.a, this.c],
                        [this.b, this.d]
                    ];
                    e.scalex = r.sqrt(a(i[0])), o(i[0]), e.shear = i[0][0] * i[1][0] + i[0][1] * i[1][1], i[1] = [i[1][0] - i[0][0] * e.shear, i[1][1] - i[0][1] * e.shear], e.scaley = r.sqrt(a(i[1])), o(i[1]), e.shear /= e.scaley, this.determinant() < 0 && (e.scalex = -e.scalex);
                    var n = -i[0][1],
                        s = i[1][1];
                    return 0 > s ? (e.rotate = t.deg(r.acos(s)), 0 > n && (e.rotate = 360 - e.rotate)) : e.rotate = t.deg(r.asin(n)), e.isSimple = !(+e.shear.toFixed(9) || e.scalex.toFixed(9) != e.scaley.toFixed(9) && e.rotate), e.isSuperSimple = !+e.shear.toFixed(9) && e.scalex.toFixed(9) == e.scaley.toFixed(9) && !e.rotate, e.noRotation = !+e.shear.toFixed(9) && !e.rotate, e
                }, i.toTransformString = function(t) {
                    var e = t || this.split();
                    return +e.shear.toFixed(9) ? "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)] : (e.scalex = +e.scalex.toFixed(4), e.scaley = +e.scaley.toFixed(4), e.rotate = +e.rotate.toFixed(4), (e.dx || e.dy ? "t" + [+e.dx.toFixed(4), +e.dy.toFixed(4)] : s) + (1 != e.scalex || 1 != e.scaley ? "s" + [e.scalex, e.scaley, 0, 0] : s) + (e.rotate ? "r" + [+e.rotate.toFixed(4), 0, 0] : s))
                }
            }(e.prototype), t.Matrix = e, t.matrix = function(t, i, n, r, s, a) {
                return new e(t, i, n, r, s, a)
            }
        }), n.plugin(function(t, i, n, r, s) {
            function a(n) {
                return function(r) {
                    if (e.stop(), r instanceof s && 1 == r.node.childNodes.length && ("radialGradient" == r.node.firstChild.tagName || "linearGradient" == r.node.firstChild.tagName || "pattern" == r.node.firstChild.tagName) && (r = r.node.firstChild, p(this).appendChild(r), r = c(r)), r instanceof i)
                        if ("radialGradient" == r.type || "linearGradient" == r.type || "pattern" == r.type) {
                            r.node.id || g(r.node, {
                                id: r.id
                            });
                            var a = m(r.node.id)
                        } else a = r.attr(n);
                    else if (a = t.color(r), a.error) {
                        var o = t(p(this).ownerSVGElement).gradient(r);
                        o ? (o.node.id || g(o.node, {
                            id: o.id
                        }), a = m(o.node.id)) : a = r
                    } else a = _(a);
                    var l = {};
                    l[n] = a, g(this.node, l), this.node.style[n] = y
                }
            }

            function o(t) {
                e.stop(), t == +t && (t += "px"), this.node.style.fontSize = t
            }

            function l(t) {
                for (var e = [], i = t.childNodes, n = 0, r = i.length; r > n; n++) {
                    var s = i[n];
                    3 == s.nodeType && e.push(s.nodeValue), "tspan" == s.tagName && e.push(1 == s.childNodes.length && 3 == s.firstChild.nodeType ? s.firstChild.nodeValue : l(s))
                }
                return e
            }

            function h() {
                return e.stop(), this.node.style.fontSize
            }
            var u = t._.make,
                c = t._.wrap,
                f = t.is,
                p = t._.getSomeDefs,
                d = /^url\(#?([^)]+)\)$/,
                g = t._.$,
                m = t.url,
                _ = String,
                v = t._.separator,
                y = "";
            e.on("snap.util.attr.mask", function(t) {
                if (t instanceof i || t instanceof s) {
                    if (e.stop(), t instanceof s && 1 == t.node.childNodes.length && (t = t.node.firstChild, p(this).appendChild(t), t = c(t)), "mask" == t.type) var n = t;
                    else n = u("mask", p(this)), n.node.appendChild(t.node);
                    !n.node.id && g(n.node, {
                        id: n.id
                    }), g(this.node, {
                        mask: m(n.id)
                    })
                }
            }),
                function(t) {
                    e.on("snap.util.attr.clip", t), e.on("snap.util.attr.clip-path", t), e.on("snap.util.attr.clipPath", t)
                }(function(t) {
                    if (t instanceof i || t instanceof s) {
                        if (e.stop(), "clipPath" == t.type) var n = t;
                        else n = u("clipPath", p(this)), n.node.appendChild(t.node), !n.node.id && g(n.node, {
                            id: n.id
                        });
                        g(this.node, {
                            "clip-path": m(n.id)
                        })
                    }
                }), e.on("snap.util.attr.fill", a("fill")), e.on("snap.util.attr.stroke", a("stroke"));
            var x = /^([lr])(?:\(([^)]*)\))?(.*)$/i;
            e.on("snap.util.grad.parse", function(t) {
                t = _(t);
                var e = t.match(x);
                if (!e) return null;
                var i = e[1],
                    n = e[2],
                    r = e[3];
                return n = n.split(/\s*,\s*/).map(function(t) {
                    return +t == t ? +t : t
                }), 1 == n.length && 0 == n[0] && (n = []), r = r.split("-"), r = r.map(function(t) {
                    t = t.split(":");
                    var e = {
                        color: t[0]
                    };
                    return t[1] && (e.offset = parseFloat(t[1])), e
                }), {
                    type: i,
                    params: n,
                    stops: r
                }
            }), e.on("snap.util.attr.d", function(i) {
                e.stop(), f(i, "array") && f(i[0], "array") && (i = t.path.toString.call(i)), i = _(i), i.match(/[ruo]/i) && (i = t.path.toAbsolute(i)), g(this.node, {
                    d: i
                })
            })(-1), e.on("snap.util.attr.#text", function(t) {
                e.stop(), t = _(t);
                for (var i = r.doc.createTextNode(t); this.node.firstChild;) this.node.removeChild(this.node.firstChild);
                this.node.appendChild(i)
            })(-1), e.on("snap.util.attr.path", function(t) {
                e.stop(), this.attr({
                    d: t
                })
            })(-1), e.on("snap.util.attr.class", function(t) {
                e.stop(), this.node.className.baseVal = t
            })(-1), e.on("snap.util.attr.viewBox", function(t) {
                var i;
                i = f(t, "object") && "x" in t ? [t.x, t.y, t.width, t.height].join(" ") : f(t, "array") ? t.join(" ") : t, g(this.node, {
                    viewBox: i
                }), e.stop()
            })(-1), e.on("snap.util.attr.transform", function(t) {
                this.transform(t), e.stop()
            })(-1), e.on("snap.util.attr.r", function(t) {
                "rect" == this.type && (e.stop(), g(this.node, {
                    rx: t,
                    ry: t
                }))
            })(-1), e.on("snap.util.attr.textpath", function(t) {
                if (e.stop(), "text" == this.type) {
                    var n, r, s;
                    if (!t && this.textPath) {
                        for (r = this.textPath; r.node.firstChild;) this.node.appendChild(r.node.firstChild);
                        return r.remove(), void delete this.textPath
                    }
                    if (f(t, "string")) {
                        var a = p(this),
                            o = c(a.parentNode).path(t);
                        a.appendChild(o.node), n = o.id, o.attr({
                            id: n
                        })
                    } else t = c(t), t instanceof i && (n = t.attr("id"), n || (n = t.id, t.attr({
                        id: n
                    }))); if (n)
                        if (r = this.textPath, s = this.node, r) r.attr({
                            "xlink:href": "#" + n
                        });
                        else {
                            for (r = g("textPath", {
                                "xlink:href": "#" + n
                            }); s.firstChild;) r.appendChild(s.firstChild);
                            s.appendChild(r), this.textPath = c(r)
                        }
                }
            })(-1), e.on("snap.util.attr.text", function(t) {
                if ("text" == this.type) {
                    for (var i = this.node, n = function(t) {
                        var e = g("tspan");
                        if (f(t, "array"))
                            for (var i = 0; i < t.length; i++) e.appendChild(n(t[i]));
                        else e.appendChild(r.doc.createTextNode(t));
                        return e.normalize && e.normalize(), e
                    }; i.firstChild;) i.removeChild(i.firstChild);
                    for (var s = n(t); s.firstChild;) i.appendChild(s.firstChild)
                }
                e.stop()
            })(-1), e.on("snap.util.attr.fontSize", o)(-1), e.on("snap.util.attr.font-size", o)(-1), e.on("snap.util.getattr.transform", function() {
                return e.stop(), this.transform()
            })(-1), e.on("snap.util.getattr.textpath", function() {
                return e.stop(), this.textPath
            })(-1),
                function() {
                    function i(i) {
                        return function() {
                            e.stop();
                            var n = r.doc.defaultView.getComputedStyle(this.node, null).getPropertyValue("marker-" + i);
                            return "none" == n ? n : t(r.doc.getElementById(n.match(d)[1]))
                        }
                    }

                    function n(t) {
                        return function(i) {
                            e.stop();
                            var n = "marker" + t.charAt(0).toUpperCase() + t.substring(1);
                            if ("" == i || !i) return void(this.node.style[n] = "none");
                            if ("marker" == i.type) {
                                var r = i.node.id;
                                return r || g(i.node, {
                                    id: i.id
                                }), void(this.node.style[n] = m(r))
                            }
                        }
                    }
                    e.on("snap.util.getattr.marker-end", i("end"))(-1), e.on("snap.util.getattr.markerEnd", i("end"))(-1), e.on("snap.util.getattr.marker-start", i("start"))(-1), e.on("snap.util.getattr.markerStart", i("start"))(-1), e.on("snap.util.getattr.marker-mid", i("mid"))(-1), e.on("snap.util.getattr.markerMid", i("mid"))(-1), e.on("snap.util.attr.marker-end", n("end"))(-1), e.on("snap.util.attr.markerEnd", n("end"))(-1), e.on("snap.util.attr.marker-start", n("start"))(-1), e.on("snap.util.attr.markerStart", n("start"))(-1), e.on("snap.util.attr.marker-mid", n("mid"))(-1), e.on("snap.util.attr.markerMid", n("mid"))(-1)
                }(), e.on("snap.util.getattr.r", function() {
                return "rect" == this.type && g(this.node, "rx") == g(this.node, "ry") ? (e.stop(), g(this.node, "rx")) : void 0
            })(-1), e.on("snap.util.getattr.text", function() {
                if ("text" == this.type || "tspan" == this.type) {
                    e.stop();
                    var t = l(this.node);
                    return 1 == t.length ? t[0] : t
                }
            })(-1), e.on("snap.util.getattr.#text", function() {
                return this.node.textContent
            })(-1), e.on("snap.util.getattr.viewBox", function() {
                e.stop();
                var i = g(this.node, "viewBox");
                return i ? (i = i.split(v), t._.box(+i[0], +i[1], +i[2], +i[3])) : void 0
            })(-1), e.on("snap.util.getattr.points", function() {
                var t = g(this.node, "points");
                return e.stop(), t ? t.split(v) : void 0
            })(-1), e.on("snap.util.getattr.path", function() {
                var t = g(this.node, "d");
                return e.stop(), t
            })(-1), e.on("snap.util.getattr.class", function() {
                return this.node.className.baseVal
            })(-1), e.on("snap.util.getattr.fontSize", h)(-1), e.on("snap.util.getattr.font-size", h)(-1)
        }), n.plugin(function() {
            function t(t) {
                return t
            }

            function i(t) {
                return function(e) {
                    return +e.toFixed(3) + t
                }
            }
            var n = {
                    "+": function(t, e) {
                        return t + e
                    },
                    "-": function(t, e) {
                        return t - e
                    },
                    "/": function(t, e) {
                        return t / e
                    },
                    "*": function(t, e) {
                        return t * e
                    }
                }, r = String,
                s = /[a-z]+$/i,
                a = /^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;
            e.on("snap.util.attr", function(t) {
                var i = r(t).match(a);
                if (i) {
                    var o = e.nt(),
                        l = o.substring(o.lastIndexOf(".") + 1),
                        h = this.attr(l),
                        u = {};
                    e.stop();
                    var c = i[3] || "",
                        f = h.match(s),
                        p = n[i[1]];
                    if (f && f == c ? t = p(parseFloat(h), +i[2]) : (h = this.asPX(l), t = p(this.asPX(l), this.asPX(l, i[2] + c))), isNaN(h) || isNaN(t)) return;
                    u[l] = t, this.attr(u)
                }
            })(-10), e.on("snap.util.equal", function(o, l) {
                var h = r(this.attr(o) || ""),
                    u = r(l).match(a);
                if (u) {
                    e.stop();
                    var c = u[3] || "",
                        f = h.match(s),
                        p = n[u[1]];
                    return f && f == c ? {
                        from: parseFloat(h),
                        to: p(parseFloat(h), +u[2]),
                        f: i(f)
                    } : (h = this.asPX(o), {
                        from: h,
                        to: p(h, this.asPX(o, u[2] + c)),
                        f: t
                    })
                }
            })(-10)
        }), n.plugin(function(t, i, n, r) {
            var s = n.prototype,
                a = t.is;
            s.rect = function(t, e, i, n, r, s) {
                var o;
                return null == s && (s = r), a(t, "object") && "[object Object]" == t ? o = t : null != t && (o = {
                    x: t,
                    y: e,
                    width: i,
                    height: n
                }, null != r && (o.rx = r, o.ry = s)), this.el("rect", o)
            }, s.circle = function(t, e, i) {
                var n;
                return a(t, "object") && "[object Object]" == t ? n = t : null != t && (n = {
                    cx: t,
                    cy: e,
                    r: i
                }), this.el("circle", n)
            };
            var o = function() {
                function t() {
                    this.parentNode.removeChild(this)
                }
                return function(e, i) {
                    var n = r.doc.createElement("img"),
                        s = r.doc.body;
                    n.style.cssText = "position:absolute;left:-9999em;top:-9999em", n.onload = function() {
                        i.call(n), n.onload = n.onerror = null, s.removeChild(n)
                    }, n.onerror = t, s.appendChild(n), n.src = e
                }
            }();
            s.image = function(e, i, n, r, s) {
                var l = this.el("image");
                if (a(e, "object") && "src" in e) l.attr(e);
                else if (null != e) {
                    var h = {
                        "xlink:href": e,
                        preserveAspectRatio: "none"
                    };
                    null != i && null != n && (h.x = i, h.y = n), null != r && null != s ? (h.width = r, h.height = s) : o(e, function() {
                        t._.$(l.node, {
                            width: this.offsetWidth,
                            height: this.offsetHeight
                        })
                    }), t._.$(l.node, h)
                }
                return l
            }, s.ellipse = function(t, e, i, n) {
                var r;
                return a(t, "object") && "[object Object]" == t ? r = t : null != t && (r = {
                    cx: t,
                    cy: e,
                    rx: i,
                    ry: n
                }), this.el("ellipse", r)
            }, s.path = function(t) {
                var e;
                return a(t, "object") && !a(t, "array") ? e = t : t && (e = {
                    d: t
                }), this.el("path", e)
            }, s.group = s.g = function(t) {
                var e = this.el("g");
                return 1 == arguments.length && t && !t.type ? e.attr(t) : arguments.length && e.add(Array.prototype.slice.call(arguments, 0)), e
            }, s.svg = function(t, e, i, n, r, s, o, l) {
                var h = {};
                return a(t, "object") && null == e ? h = t : (null != t && (h.x = t), null != e && (h.y = e), null != i && (h.width = i), null != n && (h.height = n), null != r && null != s && null != o && null != l && (h.viewBox = [r, s, o, l])), this.el("svg", h)
            }, s.mask = function(t) {
                var e = this.el("mask");
                return 1 == arguments.length && t && !t.type ? e.attr(t) : arguments.length && e.add(Array.prototype.slice.call(arguments, 0)), e
            }, s.ptrn = function(t, e, i, n, r, s, o, l) {
                if (a(t, "object")) var h = t;
                else arguments.length ? (h = {}, null != t && (h.x = t), null != e && (h.y = e), null != i && (h.width = i), null != n && (h.height = n), null != r && null != s && null != o && null != l && (h.viewBox = [r, s, o, l])) : h = {
                    patternUnits: "userSpaceOnUse"
                };
                return this.el("pattern", h)
            }, s.use = function(t) {
                return null != t ? (make("use", this.node), t instanceof i && (t.attr("id") || t.attr({
                    id: ID()
                }), t = t.attr("id")), this.el("use", {
                    "xlink:href": t
                })) : i.prototype.use.call(this)
            }, s.text = function(t, e, i) {
                var n = {};
                return a(t, "object") ? n = t : null != t && (n = {
                    x: t,
                    y: e,
                    text: i || ""
                }), this.el("text", n)
            }, s.line = function(t, e, i, n) {
                var r = {};
                return a(t, "object") ? r = t : null != t && (r = {
                    x1: t,
                    x2: i,
                    y1: e,
                    y2: n
                }), this.el("line", r)
            }, s.polyline = function(t) {
                arguments.length > 1 && (t = Array.prototype.slice.call(arguments, 0));
                var e = {};
                return a(t, "object") && !a(t, "array") ? e = t : null != t && (e = {
                    points: t
                }), this.el("polyline", e)
            }, s.polygon = function(t) {
                arguments.length > 1 && (t = Array.prototype.slice.call(arguments, 0));
                var e = {};
                return a(t, "object") && !a(t, "array") ? e = t : null != t && (e = {
                    points: t
                }), this.el("polygon", e)
            },
                function() {
                    function i() {
                        return this.selectAll("stop")
                    }

                    function n(e, i) {
                        var n = h("stop"),
                            r = {
                                offset: +i + "%"
                            };
                        return e = t.color(e), r["stop-color"] = e.hex, e.opacity < 1 && (r["stop-opacity"] = e.opacity), h(n, r), this.node.appendChild(n), this
                    }

                    function r() {
                        if ("linearGradient" == this.type) {
                            var e = h(this.node, "x1") || 0,
                                i = h(this.node, "x2") || 1,
                                n = h(this.node, "y1") || 0,
                                r = h(this.node, "y2") || 0;
                            return t._.box(e, n, math.abs(i - e), math.abs(r - n))
                        }
                        var s = this.node.cx || .5,
                            a = this.node.cy || .5,
                            o = this.node.r || 0;
                        return t._.box(s - o, a - o, 2 * o, 2 * o)
                    }

                    function a(t, i) {
                        function n(t, e) {
                            for (var i = (e - c) / (t - f), n = f; t > n; n++) a[n].offset = +(+c + i * (n - f)).toFixed(2);
                            f = t, c = e
                        }
                        var r, s = e("snap.util.grad.parse", null, i).firstDefined();
                        if (!s) return null;
                        s.params.unshift(t), r = "l" == s.type.toLowerCase() ? o.apply(0, s.params) : l.apply(0, s.params), s.type != s.type.toLowerCase() && h(r.node, {
                            gradientUnits: "userSpaceOnUse"
                        });
                        var a = s.stops,
                            u = a.length,
                            c = 0,
                            f = 0;
                        u--;
                        for (var p = 0; u > p; p++) "offset" in a[p] && n(p, a[p].offset);
                        for (a[u].offset = a[u].offset || 100, n(u, a[u].offset), p = 0; u >= p; p++) {
                            var d = a[p];
                            r.addStop(d.color, d.offset)
                        }
                        return r
                    }

                    function o(e, s, a, o, l) {
                        var u = t._.make("linearGradient", e);
                        return u.stops = i, u.addStop = n, u.getBBox = r, null != s && h(u.node, {
                            x1: s,
                            y1: a,
                            x2: o,
                            y2: l
                        }), u
                    }

                    function l(e, s, a, o, l, u) {
                        var c = t._.make("radialGradient", e);
                        return c.stops = i, c.addStop = n, c.getBBox = r, null != s && h(c.node, {
                            cx: s,
                            cy: a,
                            r: o
                        }), null != l && null != u && h(c.node, {
                            fx: l,
                            fy: u
                        }), c
                    }
                    var h = t._.$;
                    s.gradient = function(t) {
                        return a(this.defs, t)
                    }, s.gradientLinear = function(t, e, i, n) {
                        return o(this.defs, t, e, i, n)
                    }, s.gradientRadial = function(t, e, i, n, r) {
                        return l(this.defs, t, e, i, n, r)
                    }, s.toString = function() {
                        var e, i = this.node.ownerDocument,
                            n = i.createDocumentFragment(),
                            r = i.createElement("div"),
                            s = this.node.cloneNode(!0);
                        return n.appendChild(r), r.appendChild(s), t._.$(s, {
                            xmlns: "http://www.w3.org/2000/svg"
                        }), e = r.innerHTML, n.removeChild(n.firstChild), e
                    }, s.clear = function() {
                        for (var t, e = this.node.firstChild; e;) t = e.nextSibling, "defs" != e.tagName ? e.parentNode.removeChild(e) : s.clear.call({
                            node: e
                        }), e = t
                    }
                }()
        }), n.plugin(function(t, e) {
            function i(t) {
                var e = i.ps = i.ps || {};
                return e[t] ? e[t].sleep = 100 : e[t] = {
                    sleep: 100
                }, setTimeout(function() {
                    for (var i in e) e[z](i) && i != t && (e[i].sleep--, !e[i].sleep && delete e[i])
                }), e[t]
            }

            function n(t, e, i, n) {
                return null == t && (t = e = i = n = 0), null == e && (e = t.y, i = t.width, n = t.height, t = t.x), {
                    x: t,
                    y: e,
                    width: i,
                    w: i,
                    height: n,
                    h: n,
                    x2: t + i,
                    y2: e + n,
                    cx: t + i / 2,
                    cy: e + n / 2,
                    r1: B.min(i, n) / 2,
                    r2: B.max(i, n) / 2,
                    r0: B.sqrt(i * i + n * n) / 2,
                    path: w(t, e, i, n),
                    vb: [t, e, i, n].join(" ")
                }
            }

            function r() {
                return this.join(",").replace(E, "$1")
            }

            function s(t) {
                var e = D(t);
                return e.toString = r, e
            }

            function a(t, e, i, n, r, s, a, o, h) {
                return null == h ? p(t, e, i, n, r, s, a, o) : l(t, e, i, n, r, s, a, o, d(t, e, i, n, r, s, a, o, h))
            }

            function o(i, n) {
                function r(t) {
                    return +(+t).toFixed(3)
                }
                return t._.cacher(function(t, s, o) {
                    t instanceof e && (t = t.attr("d")), t = O(t);
                    for (var h, u, c, f, p, d = "", g = {}, m = 0, _ = 0, v = t.length; v > _; _++) {
                        if (c = t[_], "M" == c[0]) h = +c[1], u = +c[2];
                        else {
                            if (f = a(h, u, c[1], c[2], c[3], c[4], c[5], c[6]), m + f > s) {
                                if (n && !g.start) {
                                    if (p = a(h, u, c[1], c[2], c[3], c[4], c[5], c[6], s - m), d += ["C" + r(p.start.x), r(p.start.y), r(p.m.x), r(p.m.y), r(p.x), r(p.y)], o) return d;
                                    g.start = d, d = ["M" + r(p.x), r(p.y) + "C" + r(p.n.x), r(p.n.y), r(p.end.x), r(p.end.y), r(c[5]), r(c[6])].join(), m += f, h = +c[5], u = +c[6];
                                    continue
                                }
                                if (!i && !n) return p = a(h, u, c[1], c[2], c[3], c[4], c[5], c[6], s - m)
                            }
                            m += f, h = +c[5], u = +c[6]
                        }
                        d += c.shift() + c
                    }
                    return g.end = d, p = i ? m : n ? g : l(h, u, c[0], c[1], c[2], c[3], c[4], c[5], 1)
                }, null, t._.clone)
            }

            function l(t, e, i, n, r, s, a, o, l) {
                var h = 1 - l,
                    u = Y(h, 3),
                    c = Y(h, 2),
                    f = l * l,
                    p = f * l,
                    d = u * t + 3 * c * l * i + 3 * h * l * l * r + p * a,
                    g = u * e + 3 * c * l * n + 3 * h * l * l * s + p * o,
                    m = t + 2 * l * (i - t) + f * (r - 2 * i + t),
                    _ = e + 2 * l * (n - e) + f * (s - 2 * n + e),
                    v = i + 2 * l * (r - i) + f * (a - 2 * r + i),
                    y = n + 2 * l * (s - n) + f * (o - 2 * s + n),
                    x = h * t + l * i,
                    b = h * e + l * n,
                    w = h * r + l * a,
                    T = h * s + l * o,
                    S = 90 - 180 * B.atan2(m - v, _ - y) / F;
                return {
                    x: d,
                    y: g,
                    m: {
                        x: m,
                        y: _
                    },
                    n: {
                        x: v,
                        y: y
                    },
                    start: {
                        x: x,
                        y: b
                    },
                    end: {
                        x: w,
                        y: T
                    },
                    alpha: S
                }
            }

            function h(e, i, r, s, a, o, l, h) {
                t.is(e, "array") || (e = [e, i, r, s, a, o, l, h]);
                var u = R.apply(null, e);
                return n(u.min.x, u.min.y, u.max.x - u.min.x, u.max.y - u.min.y)
            }

            function u(t, e, i) {
                return e >= t.x && e <= t.x + t.width && i >= t.y && i <= t.y + t.height
            }

            function c(t, e) {
                return t = n(t), e = n(e), u(e, t.x, t.y) || u(e, t.x2, t.y) || u(e, t.x, t.y2) || u(e, t.x2, t.y2) || u(t, e.x, e.y) || u(t, e.x2, e.y) || u(t, e.x, e.y2) || u(t, e.x2, e.y2) || (t.x < e.x2 && t.x > e.x || e.x < t.x2 && e.x > t.x) && (t.y < e.y2 && t.y > e.y || e.y < t.y2 && e.y > t.y)
            }

            function f(t, e, i, n, r) {
                var s = -3 * e + 9 * i - 9 * n + 3 * r,
                    a = t * s + 6 * e - 12 * i + 6 * n;
                return t * a - 3 * e + 3 * i
            }

            function p(t, e, i, n, r, s, a, o, l) {
                null == l && (l = 1), l = l > 1 ? 1 : 0 > l ? 0 : l;
                for (var h = l / 2, u = 12, c = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816], p = [.2491, .2491, .2335, .2335, .2032, .2032, .1601, .1601, .1069, .1069, .0472, .0472], d = 0, g = 0; u > g; g++) {
                    var m = h * c[g] + h,
                        _ = f(m, t, i, r, a),
                        v = f(m, e, n, s, o),
                        y = _ * _ + v * v;
                    d += p[g] * B.sqrt(y)
                }
                return h * d
            }

            function d(t, e, i, n, r, s, a, o, l) {
                if (!(0 > l || p(t, e, i, n, r, s, a, o) < l)) {
                    var h, u = 1,
                        c = u / 2,
                        f = u - c,
                        d = .01;
                    for (h = p(t, e, i, n, r, s, a, o, f); V(h - l) > d;) c /= 2, f += (l > h ? 1 : -1) * c, h = p(t, e, i, n, r, s, a, o, f);
                    return f
                }
            }

            function g(t, e, i, n, r, s, a, o) {
                if (!(j(t, i) < X(r, a) || X(t, i) > j(r, a) || j(e, n) < X(s, o) || X(e, n) > j(s, o))) {
                    var l = (t * n - e * i) * (r - a) - (t - i) * (r * o - s * a),
                        h = (t * n - e * i) * (s - o) - (e - n) * (r * o - s * a),
                        u = (t - i) * (s - o) - (e - n) * (r - a);
                    if (u) {
                        var c = l / u,
                            f = h / u,
                            p = +c.toFixed(2),
                            d = +f.toFixed(2);
                        if (!(p < +X(t, i).toFixed(2) || p > +j(t, i).toFixed(2) || p < +X(r, a).toFixed(2) || p > +j(r, a).toFixed(2) || d < +X(e, n).toFixed(2) || d > +j(e, n).toFixed(2) || d < +X(s, o).toFixed(2) || d > +j(s, o).toFixed(2))) return {
                            x: c,
                            y: f
                        }
                    }
                }
            }

            function m(t, e, i) {
                var n = h(t),
                    r = h(e);
                if (!c(n, r)) return i ? 0 : [];
                for (var s = p.apply(0, t), a = p.apply(0, e), o = ~~ (s / 8), u = ~~ (a / 8), f = [], d = [], m = {}, _ = i ? 0 : [], v = 0; o + 1 > v; v++) {
                    var y = l.apply(0, t.concat(v / o));
                    f.push({
                        x: y.x,
                        y: y.y,
                        t: v / o
                    })
                }
                for (v = 0; u + 1 > v; v++) y = l.apply(0, e.concat(v / u)), d.push({
                    x: y.x,
                    y: y.y,
                    t: v / u
                });
                for (v = 0; o > v; v++)
                    for (var x = 0; u > x; x++) {
                        var b = f[v],
                            w = f[v + 1],
                            T = d[x],
                            S = d[x + 1],
                            C = V(w.x - b.x) < .001 ? "y" : "x",
                            k = V(S.x - T.x) < .001 ? "y" : "x",
                            P = g(b.x, b.y, w.x, w.y, T.x, T.y, S.x, S.y);
                        if (P) {
                            if (m[P.x.toFixed(4)] == P.y.toFixed(4)) continue;
                            m[P.x.toFixed(4)] = P.y.toFixed(4);
                            var A = b.t + V((P[C] - b[C]) / (w[C] - b[C])) * (w.t - b.t),
                                R = T.t + V((P[k] - T[k]) / (S[k] - T[k])) * (S.t - T.t);
                            A >= 0 && 1 >= A && R >= 0 && 1 >= R && (i ? _++ : _.push({
                                x: P.x,
                                y: P.y,
                                t1: A,
                                t2: R
                            }))
                        }
                    }
                return _
            }

            function _(t, e) {
                return y(t, e)
            }

            function v(t, e) {
                return y(t, e, 1)
            }

            function y(t, e, i) {
                t = O(t), e = O(e);
                for (var n, r, s, a, o, l, h, u, c, f, p = i ? 0 : [], d = 0, g = t.length; g > d; d++) {
                    var _ = t[d];
                    if ("M" == _[0]) n = o = _[1], r = l = _[2];
                    else {
                        "C" == _[0] ? (c = [n, r].concat(_.slice(1)), n = c[6], r = c[7]) : (c = [n, r, n, r, o, l, o, l], n = o, r = l);
                        for (var v = 0, y = e.length; y > v; v++) {
                            var x = e[v];
                            if ("M" == x[0]) s = h = x[1], a = u = x[2];
                            else {
                                "C" == x[0] ? (f = [s, a].concat(x.slice(1)), s = f[6], a = f[7]) : (f = [s, a, s, a, h, u, h, u], s = h, a = u);
                                var b = m(c, f, i);
                                if (i) p += b;
                                else {
                                    for (var w = 0, T = b.length; T > w; w++) b[w].segment1 = d, b[w].segment2 = v, b[w].bez1 = c, b[w].bez2 = f;
                                    p = p.concat(b)
                                }
                            }
                        }
                    }
                }
                return p
            }

            function x(t, e, i) {
                var n = b(t);
                return u(n, e, i) && y(t, [
                    ["M", e, i],
                    ["H", n.x2 + 10]
                ], 1) % 2 == 1
            }

            function b(t) {
                var e = i(t);
                if (e.bbox) return D(e.bbox);
                if (!t) return n();
                t = O(t);
                for (var r, s = 0, a = 0, o = [], l = [], h = 0, u = t.length; u > h; h++)
                    if (r = t[h], "M" == r[0]) s = r[1], a = r[2], o.push(s), l.push(a);
                    else {
                        var c = R(s, a, r[1], r[2], r[3], r[4], r[5], r[6]);
                        o = o.concat(c.min.x, c.max.x), l = l.concat(c.min.y, c.max.y), s = r[5], a = r[6]
                    }
                var f = X.apply(0, o),
                    p = X.apply(0, l),
                    d = j.apply(0, o),
                    g = j.apply(0, l),
                    m = n(f, p, d - f, g - p);
                return e.bbox = D(m), m
            }

            function w(t, e, i, n, s) {
                if (s) return [["M", +t + +s, e], ["l", i - 2 * s, 0], ["a", s, s, 0, 0, 1, s, s], ["l", 0, n - 2 * s], ["a", s, s, 0, 0, 1, -s, s], ["l", 2 * s - i, 0], ["a", s, s, 0, 0, 1, -s, -s], ["l", 0, 2 * s - n], ["a", s, s, 0, 0, 1, s, -s], ["z"]];
                var a = [
                    ["M", t, e],
                    ["l", i, 0],
                    ["l", 0, n],
                    ["l", -i, 0],
                    ["z"]
                ];
                return a.toString = r, a
            }

            function T(t, e, i, n, s) {
                if (null == s && null == n && (n = i), t = +t, e = +e, i = +i, n = +n, null != s) var a = Math.PI / 180,
                    o = t + i * Math.cos(-n * a), l = t + i * Math.cos(-s * a), h = e + i * Math.sin(-n * a), u = e + i * Math.sin(-s * a), c = [
                        ["M", o, h],
                        ["A", i, i, 0, +(s - n > 180), 0, l, u]
                    ];
                else c = [
                    ["M", t, e],
                    ["m", 0, -n],
                    ["a", i, n, 0, 1, 1, 0, 2 * n],
                    ["a", i, n, 0, 1, 1, 0, -2 * n],
                    ["z"]
                ];
                return c.toString = r, c
            }

            function S(e) {
                var n = i(e),
                    a = String.prototype.toLowerCase;
                if (n.rel) return s(n.rel);
                t.is(e, "array") && t.is(e && e[0], "array") || (e = t.parsePathString(e));
                var o = [],
                    l = 0,
                    h = 0,
                    u = 0,
                    c = 0,
                    f = 0;
                "M" == e[0][0] && (l = e[0][1], h = e[0][2], u = l, c = h, f++, o.push(["M", l, h]));
                for (var p = f, d = e.length; d > p; p++) {
                    var g = o[p] = [],
                        m = e[p];
                    if (m[0] != a.call(m[0])) switch (g[0] = a.call(m[0]), g[0]) {
                        case "a":
                            g[1] = m[1], g[2] = m[2], g[3] = m[3], g[4] = m[4], g[5] = m[5], g[6] = +(m[6] - l).toFixed(3), g[7] = +(m[7] - h).toFixed(3);
                            break;
                        case "v":
                            g[1] = +(m[1] - h).toFixed(3);
                            break;
                        case "m":
                            u = m[1], c = m[2];
                        default:
                            for (var _ = 1, v = m.length; v > _; _++) g[_] = +(m[_] - (_ % 2 ? l : h)).toFixed(3)
                    } else {
                        g = o[p] = [], "m" == m[0] && (u = m[1] + l, c = m[2] + h);
                        for (var y = 0, x = m.length; x > y; y++) o[p][y] = m[y]
                    }
                    var b = o[p].length;
                    switch (o[p][0]) {
                        case "z":
                            l = u, h = c;
                            break;
                        case "h":
                            l += +o[p][b - 1];
                            break;
                        case "v":
                            h += +o[p][b - 1];
                            break;
                        default:
                            l += +o[p][b - 2], h += +o[p][b - 1]
                    }
                }
                return o.toString = r, n.rel = s(o), o
            }

            function C(e) {
                var n = i(e);
                if (n.abs) return s(n.abs);
                if (I(e, "array") && I(e && e[0], "array") || (e = t.parsePathString(e)), !e || !e.length) return [["M", 0, 0]];
                var a, o = [],
                    l = 0,
                    h = 0,
                    u = 0,
                    c = 0,
                    f = 0;
                "M" == e[0][0] && (l = +e[0][1], h = +e[0][2], u = l, c = h, f++, o[0] = ["M", l, h]);
                for (var p, d, g = 3 == e.length && "M" == e[0][0] && "R" == e[1][0].toUpperCase() && "Z" == e[2][0].toUpperCase(), m = f, _ = e.length; _ > m; m++) {
                    if (o.push(p = []), d = e[m], a = d[0], a != a.toUpperCase()) switch (p[0] = a.toUpperCase(), p[0]) {
                        case "A":
                            p[1] = d[1], p[2] = d[2], p[3] = d[3], p[4] = d[4], p[5] = d[5], p[6] = +d[6] + l, p[7] = +d[7] + h;
                            break;
                        case "V":
                            p[1] = +d[1] + h;
                            break;
                        case "H":
                            p[1] = +d[1] + l;
                            break;
                        case "R":
                            for (var v = [l, h].concat(d.slice(1)), y = 2, x = v.length; x > y; y++) v[y] = +v[y] + l, v[++y] = +v[y] + h;
                            o.pop(), o = o.concat(N(v, g));
                            break;
                        case "O":
                            o.pop(), v = T(l, h, d[1], d[2]), v.push(v[0]), o = o.concat(v);
                            break;
                        case "U":
                            o.pop(), o = o.concat(T(l, h, d[1], d[2], d[3])), p = ["U"].concat(o[o.length - 1].slice(-2));
                            break;
                        case "M":
                            u = +d[1] + l, c = +d[2] + h;
                        default:
                            for (y = 1, x = d.length; x > y; y++) p[y] = +d[y] + (y % 2 ? l : h)
                    } else if ("R" == a) v = [l, h].concat(d.slice(1)), o.pop(), o = o.concat(N(v, g)), p = ["R"].concat(d.slice(-2));
                    else if ("O" == a) o.pop(), v = T(l, h, d[1], d[2]), v.push(v[0]), o = o.concat(v);
                    else if ("U" == a) o.pop(), o = o.concat(T(l, h, d[1], d[2], d[3])), p = ["U"].concat(o[o.length - 1].slice(-2));
                    else
                        for (var b = 0, w = d.length; w > b; b++) p[b] = d[b]; if (a = a.toUpperCase(), "O" != a) switch (p[0]) {
                        case "Z":
                            l = +u, h = +c;
                            break;
                        case "H":
                            l = p[1];
                            break;
                        case "V":
                            h = p[1];
                            break;
                        case "M":
                            u = p[p.length - 2], c = p[p.length - 1];
                        default:
                            l = p[p.length - 2], h = p[p.length - 1]
                    }
                }
                return o.toString = r, n.abs = s(o), o
            }

            function k(t, e, i, n) {
                return [t, e, i, n, i, n]
            }

            function P(t, e, i, n, r, s) {
                var a = 1 / 3,
                    o = 2 / 3;
                return [a * t + o * i, a * e + o * n, a * r + o * i, a * s + o * n, r, s]
            }

            function A(e, i, n, r, s, a, o, l, h, u) {
                var c, f = 120 * F / 180,
                    p = F / 180 * (+s || 0),
                    d = [],
                    g = t._.cacher(function(t, e, i) {
                        var n = t * B.cos(i) - e * B.sin(i),
                            r = t * B.sin(i) + e * B.cos(i);
                        return {
                            x: n,
                            y: r
                        }
                    });
                if (u) S = u[0], C = u[1], w = u[2], T = u[3];
                else {
                    c = g(e, i, -p), e = c.x, i = c.y, c = g(l, h, -p), l = c.x, h = c.y;
                    var m = (B.cos(F / 180 * s), B.sin(F / 180 * s), (e - l) / 2),
                        _ = (i - h) / 2,
                        v = m * m / (n * n) + _ * _ / (r * r);
                    v > 1 && (v = B.sqrt(v), n = v * n, r = v * r);
                    var y = n * n,
                        x = r * r,
                        b = (a == o ? -1 : 1) * B.sqrt(V((y * x - y * _ * _ - x * m * m) / (y * _ * _ + x * m * m))),
                        w = b * n * _ / r + (e + l) / 2,
                        T = b * -r * m / n + (i + h) / 2,
                        S = B.asin(((i - T) / r).toFixed(9)),
                        C = B.asin(((h - T) / r).toFixed(9));
                    S = w > e ? F - S : S, C = w > l ? F - C : C, 0 > S && (S = 2 * F + S), 0 > C && (C = 2 * F + C), o && S > C && (S -= 2 * F), !o && C > S && (C -= 2 * F)
                }
                var k = C - S;
                if (V(k) > f) {
                    var P = C,
                        R = l,
                        O = h;
                    C = S + f * (o && C > S ? 1 : -1), l = w + n * B.cos(C), h = T + r * B.sin(C), d = A(l, h, n, r, s, 0, o, R, O, [C, P, w, T])
                }
                k = C - S;
                var M = B.cos(S),
                    N = B.sin(S),
                    L = B.cos(C),
                    I = B.sin(C),
                    D = B.tan(k / 4),
                    z = 4 / 3 * n * D,
                    E = 4 / 3 * r * D,
                    H = [e, i],
                    X = [e + z * N, i - E * M],
                    j = [l + z * I, h - E * L],
                    Y = [l, h];
                if (X[0] = 2 * H[0] - X[0], X[1] = 2 * H[1] - X[1], u) return [X, j, Y].concat(d);
                d = [X, j, Y].concat(d).join().split(",");
                for (var q = [], U = 0, K = d.length; K > U; U++) q[U] = U % 2 ? g(d[U - 1], d[U], p).y : g(d[U], d[U + 1], p).x;
                return q
            }

            function R(t, e, i, n, r, s, a, o) {
                for (var l, h, u, c, f, p, d, g, m = [], _ = [
                    [],
                    []
                ], v = 0; 2 > v; ++v)
                    if (0 == v ? (h = 6 * t - 12 * i + 6 * r, l = -3 * t + 9 * i - 9 * r + 3 * a, u = 3 * i - 3 * t) : (h = 6 * e - 12 * n + 6 * s, l = -3 * e + 9 * n - 9 * s + 3 * o, u = 3 * n - 3 * e), V(l) < 1e-12) {
                        if (V(h) < 1e-12) continue;
                        c = -u / h, c > 0 && 1 > c && m.push(c)
                    } else d = h * h - 4 * u * l, g = B.sqrt(d), 0 > d || (f = (-h + g) / (2 * l), f > 0 && 1 > f && m.push(f), p = (-h - g) / (2 * l), p > 0 && 1 > p && m.push(p));
                for (var y, x = m.length, b = x; x--;) c = m[x], y = 1 - c, _[0][x] = y * y * y * t + 3 * y * y * c * i + 3 * y * c * c * r + c * c * c * a, _[1][x] = y * y * y * e + 3 * y * y * c * n + 3 * y * c * c * s + c * c * c * o;
                return _[0][b] = t, _[1][b] = e, _[0][b + 1] = a, _[1][b + 1] = o, _[0].length = _[1].length = b + 2, {
                    min: {
                        x: X.apply(0, _[0]),
                        y: X.apply(0, _[1])
                    },
                    max: {
                        x: j.apply(0, _[0]),
                        y: j.apply(0, _[1])
                    }
                }
            }

            function O(t, e) {
                var n = !e && i(t);
                if (!e && n.curve) return s(n.curve);
                for (var r = C(t), a = e && C(e), o = {
                    x: 0,
                    y: 0,
                    bx: 0,
                    by: 0,
                    X: 0,
                    Y: 0,
                    qx: null,
                    qy: null
                }, l = {
                    x: 0,
                    y: 0,
                    bx: 0,
                    by: 0,
                    X: 0,
                    Y: 0,
                    qx: null,
                    qy: null
                }, h = (function(t, e, i) {
                    var n, r;
                    if (!t) return ["C", e.x, e.y, e.x, e.y, e.x, e.y];
                    switch (!(t[0] in {
                        T: 1,
                        Q: 1
                    }) && (e.qx = e.qy = null), t[0]) {
                        case "M":
                            e.X = t[1], e.Y = t[2];
                            break;
                        case "A":
                            t = ["C"].concat(A.apply(0, [e.x, e.y].concat(t.slice(1))));
                            break;
                        case "S":
                            "C" == i || "S" == i ? (n = 2 * e.x - e.bx, r = 2 * e.y - e.by) : (n = e.x, r = e.y), t = ["C", n, r].concat(t.slice(1));
                            break;
                        case "T":
                            "Q" == i || "T" == i ? (e.qx = 2 * e.x - e.qx, e.qy = 2 * e.y - e.qy) : (e.qx = e.x, e.qy = e.y), t = ["C"].concat(P(e.x, e.y, e.qx, e.qy, t[1], t[2]));
                            break;
                        case "Q":
                            e.qx = t[1], e.qy = t[2], t = ["C"].concat(P(e.x, e.y, t[1], t[2], t[3], t[4]));
                            break;
                        case "L":
                            t = ["C"].concat(k(e.x, e.y, t[1], t[2]));
                            break;
                        case "H":
                            t = ["C"].concat(k(e.x, e.y, t[1], e.y));
                            break;
                        case "V":
                            t = ["C"].concat(k(e.x, e.y, e.x, t[1]));
                            break;
                        case "Z":
                            t = ["C"].concat(k(e.x, e.y, e.X, e.Y))
                    }
                    return t
                }), u = function(t, e) {
                    if (t[e].length > 7) {
                        t[e].shift();
                        for (var i = t[e]; i.length;) f[e] = "A", a && (p[e] = "A"), t.splice(e++, 0, ["C"].concat(i.splice(0, 6)));
                        t.splice(e, 1), _ = j(r.length, a && a.length || 0)
                    }
                }, c = function(t, e, i, n, s) {
                    t && e && "M" == t[s][0] && "M" != e[s][0] && (e.splice(s, 0, ["M", n.x, n.y]), i.bx = 0, i.by = 0, i.x = t[s][1], i.y = t[s][2], _ = j(r.length, a && a.length || 0))
                }, f = [], p = [], d = "", g = "", m = 0, _ = j(r.length, a && a.length || 0); _ > m; m++) {
                    r[m] && (d = r[m][0]), "C" != d && (f[m] = d, m && (g = f[m - 1])), r[m] = h(r[m], o, g), "A" != f[m] && "C" == d && (f[m] = "C"), u(r, m), a && (a[m] && (d = a[m][0]), "C" != d && (p[m] = d, m && (g = p[m - 1])), a[m] = h(a[m], l, g), "A" != p[m] && "C" == d && (p[m] = "C"), u(a, m)), c(r, a, o, l, m), c(a, r, l, o, m);
                    var v = r[m],
                        y = a && a[m],
                        x = v.length,
                        b = a && y.length;
                    o.x = v[x - 2], o.y = v[x - 1], o.bx = H(v[x - 4]) || o.x, o.by = H(v[x - 3]) || o.y, l.bx = a && (H(y[b - 4]) || l.x), l.by = a && (H(y[b - 3]) || l.y), l.x = a && y[b - 2], l.y = a && y[b - 1]
                }
                return a || (n.curve = s(r)), a ? [r, a] : r
            }

            function M(t, e) {
                if (!e) return t;
                var i, n, r, s, a, o, l;
                for (t = O(t), r = 0, a = t.length; a > r; r++)
                    for (l = t[r], s = 1, o = l.length; o > s; s += 2) i = e.x(l[s], l[s + 1]), n = e.y(l[s], l[s + 1]), l[s] = i, l[s + 1] = n;
                return t
            }

            function N(t, e) {
                for (var i = [], n = 0, r = t.length; r - 2 * !e > n; n += 2) {
                    var s = [{
                        x: +t[n - 2],
                        y: +t[n - 1]
                    }, {
                        x: +t[n],
                        y: +t[n + 1]
                    }, {
                        x: +t[n + 2],
                        y: +t[n + 3]
                    }, {
                        x: +t[n + 4],
                        y: +t[n + 5]
                    }];
                    e ? n ? r - 4 == n ? s[3] = {
                        x: +t[0],
                        y: +t[1]
                    } : r - 2 == n && (s[2] = {
                        x: +t[0],
                        y: +t[1]
                    }, s[3] = {
                        x: +t[2],
                        y: +t[3]
                    }) : s[0] = {
                        x: +t[r - 2],
                        y: +t[r - 1]
                    } : r - 4 == n ? s[3] = s[2] : n || (s[0] = {
                        x: +t[n],
                        y: +t[n + 1]
                    }), i.push(["C", (-s[0].x + 6 * s[1].x + s[2].x) / 6, (-s[0].y + 6 * s[1].y + s[2].y) / 6, (s[1].x + 6 * s[2].x - s[3].x) / 6, (s[1].y + 6 * s[2].y - s[3].y) / 6, s[2].x, s[2].y])
                }
                return i
            }
            var L = e.prototype,
                I = t.is,
                D = t._.clone,
                z = "hasOwnProperty",
                E = /,?([a-z]),?/gi,
                H = parseFloat,
                B = Math,
                F = B.PI,
                X = B.min,
                j = B.max,
                Y = B.pow,
                V = B.abs,
                q = o(1),
                U = o(),
                K = o(0, 1),
                J = t._unit2px,
                G = {
                    path: function(t) {
                        return t.attr("path")
                    },
                    circle: function(t) {
                        var e = J(t);
                        return T(e.cx, e.cy, e.r)
                    },
                    ellipse: function(t) {
                        var e = J(t);
                        return T(e.cx || 0, e.cy || 0, e.rx, e.ry)
                    },
                    rect: function(t) {
                        var e = J(t);
                        return w(e.x || 0, e.y || 0, e.width, e.height, e.rx, e.ry)
                    },
                    image: function(t) {
                        var e = J(t);
                        return w(e.x || 0, e.y || 0, e.width, e.height)
                    },
                    line: function(t) {
                        return "M" + [t.attr("x1") || 0, t.attr("y1") || 0, t.attr("x2"), t.attr("y2")]
                    },
                    polyline: function(t) {
                        return "M" + t.attr("points")
                    },
                    polygon: function(t) {
                        return "M" + t.attr("points") + "z"
                    },
                    deflt: function(t) {
                        var e = t.node.getBBox();
                        return w(e.x, e.y, e.width, e.height)
                    }
                };
            t.path = i, t.path.getTotalLength = q, t.path.getPointAtLength = U, t.path.getSubpath = function(t, e, i) {
                if (this.getTotalLength(t) - i < 1e-6) return K(t, e).end;
                var n = K(t, i, 1);
                return e ? K(n, e).end : n
            }, L.getTotalLength = function() {
                return this.node.getTotalLength ? this.node.getTotalLength() : void 0
            }, L.getPointAtLength = function(t) {
                return U(this.attr("d"), t)
            }, L.getSubpath = function(e, i) {
                return t.path.getSubpath(this.attr("d"), e, i)
            }, t._.box = n, t.path.findDotsAtSegment = l, t.path.bezierBBox = h, t.path.isPointInsideBBox = u, t.path.isBBoxIntersect = c, t.path.intersection = _, t.path.intersectionNumber = v, t.path.isPointInside = x, t.path.getBBox = b, t.path.get = G, t.path.toRelative = S, t.path.toAbsolute = C, t.path.toCubic = O, t.path.map = M, t.path.toString = r, t.path.clone = s
        }), n.plugin(function(t) {
            var n = Math.max,
                r = Math.min,
                s = function(t) {
                    if (this.items = [], this.bindings = {}, this.length = 0, this.type = "set", t)
                        for (var e = 0, i = t.length; i > e; e++) t[e] && (this[this.items.length] = this.items[this.items.length] = t[e], this.length++)
                }, a = s.prototype;
            a.push = function() {
                for (var t, e, i = 0, n = arguments.length; n > i; i++) t = arguments[i], t && (e = this.items.length, this[e] = this.items[e] = t, this.length++);
                return this
            }, a.pop = function() {
                return this.length && delete this[this.length--], this.items.pop()
            }, a.forEach = function(t, e) {
                for (var i = 0, n = this.items.length; n > i; i++)
                    if (t.call(e, this.items[i], i) === !1) return this;
                return this
            }, a.animate = function(n, r, s, a) {
                "function" != typeof s || s.length || (a = s, s = i.linear), n instanceof t._.Animation && (a = n.callback, s = n.easing, r = s.dur, n = n.attr);
                var o = arguments;
                if (t.is(n, "array") && t.is(o[o.length - 1], "array")) var l = !0;
                var h, u = function() {
                        h ? this.b = h : h = this.b
                    }, c = 0,
                    f = a && function() {
                        c++ == this.length && a.call(this)
                    };
                return this.forEach(function(t, i) {
                    e.once("snap.animcreated." + t.id, u), l ? o[i] && t.animate.apply(t, o[i]) : t.animate(n, r, s, f)
                })
            }, a.remove = function() {
                for (; this.length;) this.pop().remove();
                return this
            }, a.bind = function(t, e, i) {
                var n = {};
                if ("function" == typeof e) this.bindings[t] = e;
                else {
                    var r = i || t;
                    this.bindings[t] = function(t) {
                        n[r] = t, e.attr(n)
                    }
                }
                return this
            }, a.attr = function(t) {
                var e = {};
                for (var i in t) this.bindings[i] ? this.bindings[i](t[i]) : e[i] = t[i];
                for (var n = 0, r = this.items.length; r > n; n++) this.items[n].attr(e);
                return this
            }, a.clear = function() {
                for (; this.length;) this.pop()
            }, a.splice = function(t, e) {
                t = 0 > t ? n(this.length + t, 0) : t, e = n(0, r(this.length - t, e));
                var i, a = [],
                    o = [],
                    l = [];
                for (i = 2; i < arguments.length; i++) l.push(arguments[i]);
                for (i = 0; e > i; i++) o.push(this[t + i]);
                for (; i < this.length - t; i++) a.push(this[t + i]);
                var h = l.length;
                for (i = 0; i < h + a.length; i++) this.items[t + i] = this[t + i] = h > i ? l[i] : a[i - h];
                for (i = this.items.length = this.length -= e - h; this[i];) delete this[i++];
                return new s(o)
            }, a.exclude = function(t) {
                for (var e = 0, i = this.length; i > e; e++)
                    if (this[e] == t) return this.splice(e, 1), !0;
                return !1
            }, a.insertAfter = function(t) {
                for (var e = this.items.length; e--;) this.items[e].insertAfter(t);
                return this
            }, a.getBBox = function() {
                for (var t = [], e = [], i = [], s = [], a = this.items.length; a--;)
                    if (!this.items[a].removed) {
                        var o = this.items[a].getBBox();
                        t.push(o.x), e.push(o.y), i.push(o.x + o.width), s.push(o.y + o.height)
                    }
                return t = r.apply(0, t), e = r.apply(0, e), i = n.apply(0, i), s = n.apply(0, s), {
                    x: t,
                    y: e,
                    x2: i,
                    y2: s,
                    width: i - t,
                    height: s - e,
                    cx: t + (i - t) / 2,
                    cy: e + (s - e) / 2
                }
            }, a.clone = function(t) {
                t = new s;
                for (var e = 0, i = this.items.length; i > e; e++) t.push(this.items[e].clone());
                return t
            }, a.toString = function() {
                return "Snap‘s set"
            }, a.type = "set", t.set = function() {
                var t = new s;
                return arguments.length && t.push.apply(t, Array.prototype.slice.call(arguments, 0)), t
            }
        }), n.plugin(function(t, i) {
            function n(t) {
                var e = t[0];
                switch (e.toLowerCase()) {
                    case "t":
                        return [e, 0, 0];
                    case "m":
                        return [e, 1, 0, 0, 1, 0, 0];
                    case "r":
                        return 4 == t.length ? [e, 0, t[2], t[3]] : [e, 0];
                    case "s":
                        return 5 == t.length ? [e, 1, 1, t[3], t[4]] : 3 == t.length ? [e, 1, 1] : [e, 1]
                }
            }

            function r(e, i, r) {
                i = f(i).replace(/\.{3}|\u2026/g, e), e = t.parseTransformString(e) || [], i = t.parseTransformString(i) || [];
                for (var s, a, o, u, c = Math.max(e.length, i.length), p = [], d = [], g = 0; c > g; g++) {
                    if (o = e[g] || n(i[g]), u = i[g] || n(o), o[0] != u[0] || "r" == o[0].toLowerCase() && (o[2] != u[2] || o[3] != u[3]) || "s" == o[0].toLowerCase() && (o[3] != u[3] || o[4] != u[4])) {
                        e = t._.transform2matrix(e, r()), i = t._.transform2matrix(i, r()), p = [
                            ["m", e.a, e.b, e.c, e.d, e.e, e.f]
                        ], d = [
                            ["m", i.a, i.b, i.c, i.d, i.e, i.f]
                        ];
                        break
                    }
                    for (p[g] = [], d[g] = [], s = 0, a = Math.max(o.length, u.length); a > s; s++) s in o && (p[g][s] = o[s]), s in u && (d[g][s] = u[s])
                }
                return {
                    from: h(p),
                    to: h(d),
                    f: l(p)
                }
            }

            function s(t) {
                return t
            }

            function a(t) {
                return function(e) {
                    return +e.toFixed(3) + t
                }
            }

            function o(e) {
                return t.rgb(e[0], e[1], e[2])
            }

            function l(t) {
                var e, i, n, r, s, a, o = 0,
                    l = [];
                for (e = 0, i = t.length; i > e; e++) {
                    for (s = "[", a = ['"' + t[e][0] + '"'], n = 1, r = t[e].length; r > n; n++) a[n] = "val[" + o+++"]";
                    s += a + "]", l[e] = s
                }
                return Function("val", "return Snap.path.toString.call([" + l + "])")
            }

            function h(t) {
                for (var e = [], i = 0, n = t.length; n > i; i++)
                    for (var r = 1, s = t[i].length; s > r; r++) e.push(t[i][r]);
                return e
            }
            var u = {}, c = /[a-z]+$/i,
                f = String;
            u.stroke = u.fill = "colour", i.prototype.equal = function(t, i) {
                return e("snap.util.equal", this, t, i).firstDefined()
            }, e.on("snap.util.equal", function(e, i) {
                var n, p, d = f(this.attr(e) || ""),
                    g = this;
                if (d == +d && i == +i) return {
                    from: +d,
                    to: +i,
                    f: s
                };
                if ("colour" == u[e]) return n = t.color(d), p = t.color(i), {
                    from: [n.r, n.g, n.b, n.opacity],
                    to: [p.r, p.g, p.b, p.opacity],
                    f: o
                };
                if ("transform" == e || "gradientTransform" == e || "patternTransform" == e) return i instanceof t.Matrix && (i = i.toTransformString()), t._.rgTransform.test(i) || (i = t._.svgTransform2string(i)), r(d, i, function() {
                    return g.getBBox(1)
                });
                if ("d" == e || "path" == e) return n = t.path.toCubic(d, i), {
                    from: h(n[0]),
                    to: h(n[1]),
                    f: l(n[0])
                };
                if ("points" == e) return n = f(d).split(t._.separator), p = f(i).split(t._.separator), {
                    from: n,
                    to: p,
                    f: function(t) {
                        return t
                    }
                };
                aUnit = d.match(c);
                var m = f(i).match(c);
                return aUnit && aUnit == m ? {
                    from: parseFloat(d),
                    to: parseFloat(i),
                    f: a(aUnit)
                } : {
                    from: this.asPX(e),
                    to: this.asPX(e, i),
                    f: s
                }
            })
        }), n.plugin(function(t, i, n, r) {
            for (var s = i.prototype, a = "hasOwnProperty", o = ("createTouch" in r.doc), l = ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "touchstart", "touchmove", "touchend", "touchcancel"], h = {
                mousedown: "touchstart",
                mousemove: "touchmove",
                mouseup: "touchend"
            }, u = (function(t, e) {
                var i = "y" == t ? "scrollTop" : "scrollLeft",
                    n = e && e.node ? e.node.ownerDocument : r.doc;
                return n[i in n.documentElement ? "documentElement" : "body"][i]
            }), c = function() {
                this.returnValue = !1
            }, f = function() {
                return this.originalEvent.preventDefault()
            }, p = function() {
                this.cancelBubble = !0
            }, d = function() {
                return this.originalEvent.stopPropagation()
            }, g = function() {
                return r.doc.addEventListener ? function(t, e, i, n) {
                    var r = o && h[e] ? h[e] : e,
                        s = function(r) {
                            var s = u("y", n),
                                l = u("x", n);
                            if (o && h[a](e))
                                for (var c = 0, p = r.targetTouches && r.targetTouches.length; p > c; c++)
                                    if (r.targetTouches[c].target == t || t.contains(r.targetTouches[c].target)) {
                                        var g = r;
                                        r = r.targetTouches[c], r.originalEvent = g, r.preventDefault = f, r.stopPropagation = d;
                                        break
                                    }
                            var m = r.clientX + l,
                                _ = r.clientY + s;
                            return i.call(n, r, m, _)
                        };
                    return e !== r && t.addEventListener(e, s, !1), t.addEventListener(r, s, !1),
                        function() {
                            return e !== r && t.removeEventListener(e, s, !1), t.removeEventListener(r, s, !1), !0
                        }
                } : r.doc.attachEvent ? function(t, e, i, n) {
                    var r = function(t) {
                        t = t || n.node.ownerDocument.window.event;
                        var e = u("y", n),
                            r = u("x", n),
                            s = t.clientX + r,
                            a = t.clientY + e;
                        return t.preventDefault = t.preventDefault || c, t.stopPropagation = t.stopPropagation || p, i.call(n, t, s, a)
                    };
                    t.attachEvent("on" + e, r);
                    var s = function() {
                        return t.detachEvent("on" + e, r), !0
                    };
                    return s
                } : void 0
            }(), m = [], _ = function(t) {
                for (var i, n = t.clientX, r = t.clientY, s = u("y"), a = u("x"), l = m.length; l--;) {
                    if (i = m[l], o) {
                        for (var h, c = t.touches && t.touches.length; c--;)
                            if (h = t.touches[c], h.identifier == i.el._drag.id || i.el.node.contains(h.target)) {
                                n = h.clientX, r = h.clientY, (t.originalEvent ? t.originalEvent : t).preventDefault();
                                break
                            }
                    } else t.preventDefault();
                    var f = i.el.node;
                    f.nextSibling, f.parentNode, f.style.display, n += a, r += s, e("snap.drag.move." + i.el.id, i.move_scope || i.el, n - i.el._drag.x, r - i.el._drag.y, n, r, t)
                }
            }, v = function(i) {
                t.unmousemove(_).unmouseup(v);
                for (var n, r = m.length; r--;) n = m[r], n.el._drag = {}, e("snap.drag.end." + n.el.id, n.end_scope || n.start_scope || n.move_scope || n.el, i);
                m = []
            }, y = l.length; y--;)! function(e) {
                t[e] = s[e] = function(i, n) {
                    return t.is(i, "function") && (this.events = this.events || [], this.events.push({
                        name: e,
                        f: i,
                        unbind: g(this.node || document, e, i, n || this)
                    })), this
                }, t["un" + e] = s["un" + e] = function(t) {
                    for (var i = this.events || [], n = i.length; n--;)
                        if (i[n].name == e && (i[n].f == t || !t)) return i[n].unbind(), i.splice(n, 1), !i.length && delete this.events, this;
                    return this
                }
            }(l[y]);
            s.hover = function(t, e, i, n) {
                return this.mouseover(t, i).mouseout(e, n || i)
            }, s.unhover = function(t, e) {
                return this.unmouseover(t).unmouseout(e)
            };
            var x = [];
            s.drag = function(i, n, r, s, a, o) {
                function l(l, h, u) {
                    (l.originalEvent || l).preventDefault(), this._drag.x = h, this._drag.y = u, this._drag.id = l.identifier, !m.length && t.mousemove(_).mouseup(v), m.push({
                        el: this,
                        move_scope: s,
                        start_scope: a,
                        end_scope: o
                    }), n && e.on("snap.drag.start." + this.id, n), i && e.on("snap.drag.move." + this.id, i), r && e.on("snap.drag.end." + this.id, r), e("snap.drag.start." + this.id, a || s || this, h, u, l)
                }
                if (!arguments.length) {
                    var h;
                    return this.drag(function(t, e) {
                        this.attr({
                            transform: h + (h ? "T" : "t") + [t, e]
                        })
                    }, function() {
                        h = this.transform().local
                    })
                }
                return this._drag = {}, x.push({
                    el: this,
                    start: l
                }), this.mousedown(l), this
            }, s.undrag = function() {
                for (var i = x.length; i--;) x[i].el == this && (this.unmousedown(x[i].start), x.splice(i, 1), e.unbind("snap.drag.*." + this.id));
                return !x.length && t.unmousemove(_).unmouseup(v), this
            }
        }), n.plugin(function(t, i, n) {
            var r = (i.prototype, n.prototype),
                s = /^\s*url\((.+)\)/,
                a = String,
                o = t._.$;
            t.filter = {}, r.filter = function(e) {
                var n = this;
                "svg" != n.type && (n = n.paper);
                var r = t.parse(a(e)),
                    s = t._.id(),
                    l = (n.node.offsetWidth, n.node.offsetHeight, o("filter"));
                return o(l, {
                    id: s,
                    filterUnits: "userSpaceOnUse"
                }), l.appendChild(r.node), n.defs.appendChild(l), new i(l)
            }, e.on("snap.util.getattr.filter", function() {
                e.stop();
                var i = o(this.node, "filter");
                if (i) {
                    var n = a(i).match(s);
                    return n && t.select(n[1])
                }
            }), e.on("snap.util.attr.filter", function(n) {
                if (n instanceof i && "filter" == n.type) {
                    e.stop();
                    var r = n.node.id;
                    r || (o(n.node, {
                        id: n.id
                    }), r = n.id), o(this.node, {
                        filter: t.url(r)
                    })
                }
                n && "none" != n || (e.stop(), this.node.removeAttribute("filter"))
            }), t.filter.blur = function(e, i) {
                null == e && (e = 2);
                var n = null == i ? e : [e, i];
                return t.format('<feGaussianBlur stdDeviation="{def}"/>', {
                    def: n
                })
            }, t.filter.blur.toString = function() {
                return this()
            }, t.filter.shadow = function(e, i, n, r, s) {
                return "string" == typeof n && (r = n, s = r, n = 4), "string" != typeof r && (s = r, r = "#000"), r = r || "#000", null == n && (n = 4), null == s && (s = 1), null == e && (e = 0, i = 2), null == i && (i = e), r = t.color(r), t.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>', {
                    color: r,
                    dx: e,
                    dy: i,
                    blur: n,
                    opacity: s
                })
            }, t.filter.shadow.toString = function() {
                return this()
            }, t.filter.grayscale = function(e) {
                return null == e && (e = 1), t.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>', {
                    a: .2126 + .7874 * (1 - e),
                    b: .7152 - .7152 * (1 - e),
                    c: .0722 - .0722 * (1 - e),
                    d: .2126 - .2126 * (1 - e),
                    e: .7152 + .2848 * (1 - e),
                    f: .0722 - .0722 * (1 - e),
                    g: .2126 - .2126 * (1 - e),
                    h: .0722 + .9278 * (1 - e)
                })
            }, t.filter.grayscale.toString = function() {
                return this()
            }, t.filter.sepia = function(e) {
                return null == e && (e = 1), t.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>', {
                    a: .393 + .607 * (1 - e),
                    b: .769 - .769 * (1 - e),
                    c: .189 - .189 * (1 - e),
                    d: .349 - .349 * (1 - e),
                    e: .686 + .314 * (1 - e),
                    f: .168 - .168 * (1 - e),
                    g: .272 - .272 * (1 - e),
                    h: .534 - .534 * (1 - e),
                    i: .131 + .869 * (1 - e)
                })
            }, t.filter.sepia.toString = function() {
                return this()
            }, t.filter.saturate = function(e) {
                return null == e && (e = 1), t.format('<feColorMatrix type="saturate" values="{amount}"/>', {
                    amount: 1 - e
                })
            }, t.filter.saturate.toString = function() {
                return this()
            }, t.filter.hueRotate = function(e) {
                return e = e || 0, t.format('<feColorMatrix type="hueRotate" values="{angle}"/>', {
                    angle: e
                })
            }, t.filter.hueRotate.toString = function() {
                return this()
            }, t.filter.invert = function(e) {
                return null == e && (e = 1), t.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>', {
                    amount: e,
                    amount2: 1 - e
                })
            }, t.filter.invert.toString = function() {
                return this()
            }, t.filter.brightness = function(e) {
                return null == e && (e = 1), t.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>', {
                    amount: e
                })
            }, t.filter.brightness.toString = function() {
                return this()
            }, t.filter.contrast = function(e) {
                return null == e && (e = 1), t.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>', {
                    amount: e,
                    amount2: .5 - e / 2
                })
            }, t.filter.contrast.toString = function() {
                return this()
            }
        }), n
    }), eval(function(t, e, i, n, r, s) {
    if (r = function(t) {
        return (e > t ? "" : r(parseInt(t / e))) + ((t %= e) > 35 ? String.fromCharCode(t + 29) : t.toString(36))
    }, !"".replace(/^/, String)) {
        for (; i--;) s[r(i)] = n[i] || r(i);
        n = [
            function(t) {
                return s[t]
            }
        ], r = function() {
            return "\\w+"
        }, i = 1
    }
    for (; i--;) n[i] && (t = t.replace(new RegExp("\\b" + r(i) + "\\b", "g"), n[i]));
    return t
}('K M;I(M)1S 2U("2a\'t 4k M 4K 2g 3l 4G 4H");(6(){6 r(f,e){I(!M.1R(f))1S 3m("3s 15 4R");K a=f.1w;f=M(f.1m,t(f)+(e||""));I(a)f.1w={1m:a.1m,19:a.19?a.19.1a(0):N};H f}6 t(f){H(f.1J?"g":"")+(f.4s?"i":"")+(f.4p?"m":"")+(f.4v?"x":"")+(f.3n?"y":"")}6 B(f,e,a,b){K c=u.L,d,h,g;v=R;5K{O(;c--;){g=u[c];I(a&g.3r&&(!g.2p||g.2p.W(b))){g.2q.12=e;I((h=g.2q.X(f))&&h.P===e){d={3k:g.2b.W(b,h,a),1C:h};1N}}}}5v(i){1S i}5q{v=11}H d}6 p(f,e,a){I(3b.Z.1i)H f.1i(e,a);O(a=a||0;a<f.L;a++)I(f[a]===e)H a;H-1}M=6(f,e){K a=[],b=M.1B,c=0,d,h;I(M.1R(f)){I(e!==1d)1S 3m("2a\'t 5r 5I 5F 5B 5C 15 5E 5p");H r(f)}I(v)1S 2U("2a\'t W 3l M 59 5m 5g 5x 5i");e=e||"";O(d={2N:11,19:[],2K:6(g){H e.1i(g)>-1},3d:6(g){e+=g}};c<f.L;)I(h=B(f,c,b,d)){a.U(h.3k);c+=h.1C[0].L||1}Y I(h=n.X.W(z[b],f.1a(c))){a.U(h[0]);c+=h[0].L}Y{h=f.3a(c);I(h==="[")b=M.2I;Y I(h==="]")b=M.1B;a.U(h);c++}a=15(a.1K(""),n.Q.W(e,w,""));a.1w={1m:f,19:d.2N?d.19:N};H a};M.3v="1.5.0";M.2I=1;M.1B=2;K C=/\\$(?:(\\d\\d?|[$&`\'])|{([$\\w]+)})/g,w=/[^5h]+|([\\s\\S])(?=[\\s\\S]*\\1)/g,A=/^(?:[?*+]|{\\d+(?:,\\d*)?})\\??/,v=11,u=[],n={X:15.Z.X,1A:15.Z.1A,1C:1r.Z.1C,Q:1r.Z.Q,1e:1r.Z.1e},x=n.X.W(/()??/,"")[1]===1d,D=6(){K f=/^/g;n.1A.W(f,"");H!f.12}(),y=6(){K f=/x/g;n.Q.W("x",f,"");H!f.12}(),E=15.Z.3n!==1d,z={};z[M.2I]=/^(?:\\\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S]))/;z[M.1B]=/^(?:\\\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\\d*|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S])|\\(\\?[:=!]|[?*+]\\?|{\\d+(?:,\\d*)?}\\??)/;M.1h=6(f,e,a,b){u.U({2q:r(f,"g"+(E?"y":"")),2b:e,3r:a||M.1B,2p:b||N})};M.2n=6(f,e){K a=f+"/"+(e||"");H M.2n[a]||(M.2n[a]=M(f,e))};M.3c=6(f){H r(f,"g")};M.5l=6(f){H f.Q(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g,"\\\\$&")};M.5e=6(f,e,a,b){e=r(e,"g"+(b&&E?"y":""));e.12=a=a||0;f=e.X(f);H b?f&&f.P===a?f:N:f};M.3q=6(){M.1h=6(){1S 2U("2a\'t 55 1h 54 3q")}};M.1R=6(f){H 53.Z.1q.W(f)==="[2m 15]"};M.3p=6(f,e,a,b){O(K c=r(e,"g"),d=-1,h;h=c.X(f);){a.W(b,h,++d,f,c);c.12===h.P&&c.12++}I(e.1J)e.12=0};M.57=6(f,e){H 6 a(b,c){K d=e[c].1I?e[c]:{1I:e[c]},h=r(d.1I,"g"),g=[],i;O(i=0;i<b.L;i++)M.3p(b[i],h,6(k){g.U(d.3j?k[d.3j]||"":k[0])});H c===e.L-1||!g.L?g:a(g,c+1)}([f],0)};15.Z.1p=6(f,e){H J.X(e[0])};15.Z.W=6(f,e){H J.X(e)};15.Z.X=6(f){K e=n.X.1p(J,14),a;I(e){I(!x&&e.L>1&&p(e,"")>-1){a=15(J.1m,n.Q.W(t(J),"g",""));n.Q.W(f.1a(e.P),a,6(){O(K c=1;c<14.L-2;c++)I(14[c]===1d)e[c]=1d})}I(J.1w&&J.1w.19)O(K b=1;b<e.L;b++)I(a=J.1w.19[b-1])e[a]=e[b];!D&&J.1J&&!e[0].L&&J.12>e.P&&J.12--}H e};I(!D)15.Z.1A=6(f){(f=n.X.W(J,f))&&J.1J&&!f[0].L&&J.12>f.P&&J.12--;H!!f};1r.Z.1C=6(f){M.1R(f)||(f=15(f));I(f.1J){K e=n.1C.1p(J,14);f.12=0;H e}H f.X(J)};1r.Z.Q=6(f,e){K a=M.1R(f),b,c;I(a&&1j e.58()==="3f"&&e.1i("${")===-1&&y)H n.Q.1p(J,14);I(a){I(f.1w)b=f.1w.19}Y f+="";I(1j e==="6")c=n.Q.W(J,f,6(){I(b){14[0]=1f 1r(14[0]);O(K d=0;d<b.L;d++)I(b[d])14[0][b[d]]=14[d+1]}I(a&&f.1J)f.12=14[14.L-2]+14[0].L;H e.1p(N,14)});Y{c=J+"";c=n.Q.W(c,f,6(){K d=14;H n.Q.W(e,C,6(h,g,i){I(g)5b(g){24"$":H"$";24"&":H d[0];24"`":H d[d.L-1].1a(0,d[d.L-2]);24"\'":H d[d.L-1].1a(d[d.L-2]+d[0].L);5a:i="";g=+g;I(!g)H h;O(;g>d.L-3;){i=1r.Z.1a.W(g,-1)+i;g=1Q.3i(g/10)}H(g?d[g]||"":"$")+i}Y{g=+i;I(g<=d.L-3)H d[g];g=b?p(b,i):-1;H g>-1?d[g+1]:h}})})}I(a&&f.1J)f.12=0;H c};1r.Z.1e=6(f,e){I(!M.1R(f))H n.1e.1p(J,14);K a=J+"",b=[],c=0,d,h;I(e===1d||+e<0)e=5D;Y{e=1Q.3i(+e);I(!e)H[]}O(f=M.3c(f);d=f.X(a);){I(f.12>c){b.U(a.1a(c,d.P));d.L>1&&d.P<a.L&&3b.Z.U.1p(b,d.1a(1));h=d[0].L;c=f.12;I(b.L>=e)1N}f.12===d.P&&f.12++}I(c===a.L){I(!n.1A.W(f,"")||h)b.U("")}Y b.U(a.1a(c));H b.L>e?b.1a(0,e):b};M.1h(/\\(\\?#[^)]*\\)/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"});M.1h(/\\((?!\\?)/,6(){J.19.U(N);H"("});M.1h(/\\(\\?<([$\\w]+)>/,6(f){J.19.U(f[1]);J.2N=R;H"("});M.1h(/\\\\k<([\\w$]+)>/,6(f){K e=p(J.19,f[1]);H e>-1?"\\\\"+(e+1)+(3R(f.2S.3a(f.P+f[0].L))?"":"(?:)"):f[0]});M.1h(/\\[\\^?]/,6(f){H f[0]==="[]"?"\\\\b\\\\B":"[\\\\s\\\\S]"});M.1h(/^\\(\\?([5A]+)\\)/,6(f){J.3d(f[1]);H""});M.1h(/(?:\\s+|#.*)+/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"},M.1B,6(){H J.2K("x")});M.1h(/\\./,6(){H"[\\\\s\\\\S]"},M.1B,6(){H J.2K("s")})})();1j 2e!="1d"&&(2e.M=M);K 1v=6(){6 r(a,b){a.1l.1i(b)!=-1||(a.1l+=" "+b)}6 t(a){H a.1i("3e")==0?a:"3e"+a}6 B(a){H e.1Y.2A[t(a)]}6 p(a,b,c){I(a==N)H N;K d=c!=R?a.3G:[a.2G],h={"#":"1c",".":"1l"}[b.1o(0,1)]||"3h",g,i;g=h!="3h"?b.1o(1):b.5u();I((a[h]||"").1i(g)!=-1)H a;O(a=0;d&&a<d.L&&i==N;a++)i=p(d[a],b,c);H i}6 C(a,b){K c={},d;O(d 2g a)c[d]=a[d];O(d 2g b)c[d]=b[d];H c}6 w(a,b,c,d){6 h(g){g=g||1P.5y;I(!g.1F){g.1F=g.52;g.3N=6(){J.5w=11}}c.W(d||1P,g)}a.3g?a.3g("4U"+b,h):a.4y(b,h,11)}6 A(a,b){K c=e.1Y.2j,d=N;I(c==N){c={};O(K h 2g e.1U){K g=e.1U[h];d=g.4x;I(d!=N){g.1V=h.4w();O(g=0;g<d.L;g++)c[d[g]]=h}}e.1Y.2j=c}d=e.1U[c[a]];d==N&&b!=11&&1P.1X(e.13.1x.1X+(e.13.1x.3E+a));H d}6 v(a,b){O(K c=a.1e("\\n"),d=0;d<c.L;d++)c[d]=b(c[d],d);H c.1K("\\n")}6 u(a,b){I(a==N||a.L==0||a=="\\n")H a;a=a.Q(/</g,"&1y;");a=a.Q(/ {2,}/g,6(c){O(K d="",h=0;h<c.L-1;h++)d+=e.13.1W;H d+" "});I(b!=N)a=v(a,6(c){I(c.L==0)H"";K d="";c=c.Q(/^(&2s;| )+/,6(h){d=h;H""});I(c.L==0)H d;H d+\'<17 1g="\'+b+\'">\'+c+"</17>"});H a}6 n(a,b){a.1e("\\n");O(K c="",d=0;d<50;d++)c+="                    ";H a=v(a,6(h){I(h.1i("\\t")==-1)H h;O(K g=0;(g=h.1i("\\t"))!=-1;)h=h.1o(0,g)+c.1o(0,b-g%b)+h.1o(g+1,h.L);H h})}6 x(a){H a.Q(/^\\s+|\\s+$/g,"")}6 D(a,b){I(a.P<b.P)H-1;Y I(a.P>b.P)H 1;Y I(a.L<b.L)H-1;Y I(a.L>b.L)H 1;H 0}6 y(a,b){6 c(k){H k[0]}O(K d=N,h=[],g=b.2D?b.2D:c;(d=b.1I.X(a))!=N;){K i=g(d,b);I(1j i=="3f")i=[1f e.2L(i,d.P,b.23)];h=h.1O(i)}H h}6 E(a){K b=/(.*)((&1G;|&1y;).*)/;H a.Q(e.3A.3M,6(c){K d="",h=N;I(h=b.X(c)){c=h[1];d=h[2]}H\'<a 2h="\'+c+\'">\'+c+"</a>"+d})}6 z(){O(K a=1E.36("1k"),b=[],c=0;c<a.L;c++)a[c].3s=="20"&&b.U(a[c]);H b}6 f(a){a=a.1F;K b=p(a,".20",R);a=p(a,".3O",R);K c=1E.4i("3t");I(!(!a||!b||p(a,"3t"))){B(b.1c);r(b,"1m");O(K d=a.3G,h=[],g=0;g<d.L;g++)h.U(d[g].4z||d[g].4A);h=h.1K("\\r");c.39(1E.4D(h));a.39(c);c.2C();c.4C();w(c,"4u",6(){c.2G.4E(c);b.1l=b.1l.Q("1m","")})}}I(1j 3F!="1d"&&1j M=="1d")M=3F("M").M;K e={2v:{"1g-27":"","2i-1s":1,"2z-1s-2t":11,1M:N,1t:N,"42-45":R,"43-22":4,1u:R,16:R,"3V-17":R,2l:11,"41-40":R,2k:11,"1z-1k":11},13:{1W:"&2s;",2M:R,46:11,44:11,34:"4n",1x:{21:"4o 1m",2P:"?",1X:"1v\\n\\n",3E:"4r\'t 4t 1D O: ",4g:"4m 4B\'t 51 O 1z-1k 4F: ",37:\'<!4T 1z 4S "-//4V//3H 4W 1.0 4Z//4Y" "1Z://2y.3L.3K/4X/3I/3H/3I-4P.4J"><1z 4I="1Z://2y.3L.3K/4L/5L"><3J><4N 1Z-4M="5G-5M" 6K="2O/1z; 6J=6I-8" /><1t>6L 1v</1t></3J><3B 1L="25-6M:6Q,6P,6O,6N-6F;6y-2f:#6x;2f:#6w;25-22:6v;2O-3D:3C;"><T 1L="2O-3D:3C;3w-32:1.6z;"><T 1L="25-22:6A-6E;">1v</T><T 1L="25-22:.6C;3w-6B:6R;"><T>3v 3.0.76 (72 73 3x)</T><T><a 2h="1Z://3u.2w/1v" 1F="38" 1L="2f:#3y">1Z://3u.2w/1v</a></T><T>70 17 6U 71.</T><T>6T 6X-3x 6Y 6D.</T></T><T>6t 61 60 J 1k, 5Z <a 2h="6u://2y.62.2w/63-66/65?64=5X-5W&5P=5O" 1L="2f:#3y">5R</a> 5V <2R/>5U 5T 5S!</T></T></3B></1z>\'}},1Y:{2j:N,2A:{}},1U:{},3A:{6n:/\\/\\*[\\s\\S]*?\\*\\//2c,6m:/\\/\\/.*$/2c,6l:/#.*$/2c,6k:/"([^\\\\"\\n]|\\\\.)*"/g,6o:/\'([^\\\\\'\\n]|\\\\.)*\'/g,6p:1f M(\'"([^\\\\\\\\"]|\\\\\\\\.)*"\',"3z"),6s:1f M("\'([^\\\\\\\\\']|\\\\\\\\.)*\'","3z"),6q:/(&1y;|<)!--[\\s\\S]*?--(&1G;|>)/2c,3M:/\\w+:\\/\\/[\\w-.\\/?%&=:@;]*/g,6a:{18:/(&1y;|<)\\?=?/g,1b:/\\?(&1G;|>)/g},69:{18:/(&1y;|<)%=?/g,1b:/%(&1G;|>)/g},6d:{18:/(&1y;|<)\\s*1k.*?(&1G;|>)/2T,1b:/(&1y;|<)\\/\\s*1k\\s*(&1G;|>)/2T}},16:{1H:6(a){6 b(i,k){H e.16.2o(i,k,e.13.1x[k])}O(K c=\'<T 1g="16">\',d=e.16.2x,h=d.2X,g=0;g<h.L;g++)c+=(d[h[g]].1H||b)(a,h[g]);c+="</T>";H c},2o:6(a,b,c){H\'<2W><a 2h="#" 1g="6e 6h\'+b+" "+b+\'">\'+c+"</a></2W>"},2b:6(a){K b=a.1F,c=b.1l||"";b=B(p(b,".20",R).1c);K d=6(h){H(h=15(h+"6f(\\\\w+)").X(c))?h[1]:N}("6g");b&&d&&e.16.2x[d].2B(b);a.3N()},2x:{2X:["21","2P"],21:{1H:6(a){I(a.V("2l")!=R)H"";K b=a.V("1t");H e.16.2o(a,"21",b?b:e.13.1x.21)},2B:6(a){a=1E.6j(t(a.1c));a.1l=a.1l.Q("47","")}},2P:{2B:6(){K a="68=0";a+=", 18="+(31.30-33)/2+", 32="+(31.2Z-2Y)/2+", 30=33, 2Z=2Y";a=a.Q(/^,/,"");a=1P.6Z("","38",a);a.2C();K b=a.1E;b.6W(e.13.1x.37);b.6V();a.2C()}}}},35:6(a,b){K c;I(b)c=[b];Y{c=1E.36(e.13.34);O(K d=[],h=0;h<c.L;h++)d.U(c[h]);c=d}c=c;d=[];I(e.13.2M)c=c.1O(z());I(c.L===0)H d;O(h=0;h<c.L;h++){O(K g=c[h],i=a,k=c[h].1l,j=3W 0,l={},m=1f M("^\\\\[(?<2V>(.*?))\\\\]$"),s=1f M("(?<27>[\\\\w-]+)\\\\s*:\\\\s*(?<1T>[\\\\w-%#]+|\\\\[.*?\\\\]|\\".*?\\"|\'.*?\')\\\\s*;?","g");(j=s.X(k))!=N;){K o=j.1T.Q(/^[\'"]|[\'"]$/g,"");I(o!=N&&m.1A(o)){o=m.X(o);o=o.2V.L>0?o.2V.1e(/\\s*,\\s*/):[]}l[j.27]=o}g={1F:g,1n:C(i,l)};g.1n.1D!=N&&d.U(g)}H d},1M:6(a,b){K c=J.35(a,b),d=N,h=e.13;I(c.L!==0)O(K g=0;g<c.L;g++){b=c[g];K i=b.1F,k=b.1n,j=k.1D,l;I(j!=N){I(k["1z-1k"]=="R"||e.2v["1z-1k"]==R){d=1f e.4l(j);j="4O"}Y I(d=A(j))d=1f d;Y 6H;l=i.3X;I(h.2M){l=l;K m=x(l),s=11;I(m.1i("<![6G[")==0){m=m.4h(9);s=R}K o=m.L;I(m.1i("]]\\>")==o-3){m=m.4h(0,o-3);s=R}l=s?m:l}I((i.1t||"")!="")k.1t=i.1t;k.1D=j;d.2Q(k);b=d.2F(l);I((i.1c||"")!="")b.1c=i.1c;i.2G.74(b,i)}}},2E:6(a){w(1P,"4k",6(){e.1M(a)})}};e.2E=e.2E;e.1M=e.1M;e.2L=6(a,b,c){J.1T=a;J.P=b;J.L=a.L;J.23=c;J.1V=N};e.2L.Z.1q=6(){H J.1T};e.4l=6(a){6 b(j,l){O(K m=0;m<j.L;m++)j[m].P+=l}K c=A(a),d,h=1f e.1U.5Y,g=J,i="2F 1H 2Q".1e(" ");I(c!=N){d=1f c;O(K k=0;k<i.L;k++)(6(){K j=i[k];g[j]=6(){H h[j].1p(h,14)}})();d.28==N?1P.1X(e.13.1x.1X+(e.13.1x.4g+a)):h.2J.U({1I:d.28.17,2D:6(j){O(K l=j.17,m=[],s=d.2J,o=j.P+j.18.L,F=d.28,q,G=0;G<s.L;G++){q=y(l,s[G]);b(q,o);m=m.1O(q)}I(F.18!=N&&j.18!=N){q=y(j.18,F.18);b(q,j.P);m=m.1O(q)}I(F.1b!=N&&j.1b!=N){q=y(j.1b,F.1b);b(q,j.P+j[0].5Q(j.1b));m=m.1O(q)}O(j=0;j<m.L;j++)m[j].1V=c.1V;H m}})}};e.4j=6(){};e.4j.Z={V:6(a,b){K c=J.1n[a];c=c==N?b:c;K d={"R":R,"11":11}[c];H d==N?c:d},3Y:6(a){H 1E.4i(a)},4c:6(a,b){K c=[];I(a!=N)O(K d=0;d<a.L;d++)I(1j a[d]=="2m")c=c.1O(y(b,a[d]));H J.4e(c.6b(D))},4e:6(a){O(K b=0;b<a.L;b++)I(a[b]!==N)O(K c=a[b],d=c.P+c.L,h=b+1;h<a.L&&a[b]!==N;h++){K g=a[h];I(g!==N)I(g.P>d)1N;Y I(g.P==c.P&&g.L>c.L)a[b]=N;Y I(g.P>=c.P&&g.P<d)a[h]=N}H a},4d:6(a){K b=[],c=2u(J.V("2i-1s"));v(a,6(d,h){b.U(h+c)});H b},3U:6(a){K b=J.V("1M",[]);I(1j b!="2m"&&b.U==N)b=[b];a:{a=a.1q();K c=3W 0;O(c=c=1Q.6c(c||0,0);c<b.L;c++)I(b[c]==a){b=c;1N a}b=-1}H b!=-1},2r:6(a,b,c){a=["1s","6i"+b,"P"+a,"6r"+(b%2==0?1:2).1q()];J.3U(b)&&a.U("67");b==0&&a.U("1N");H\'<T 1g="\'+a.1K(" ")+\'">\'+c+"</T>"},3Q:6(a,b){K c="",d=a.1e("\\n").L,h=2u(J.V("2i-1s")),g=J.V("2z-1s-2t");I(g==R)g=(h+d-1).1q().L;Y I(3R(g)==R)g=0;O(K i=0;i<d;i++){K k=b?b[i]:h+i,j;I(k==0)j=e.13.1W;Y{j=g;O(K l=k.1q();l.L<j;)l="0"+l;j=l}a=j;c+=J.2r(i,k,a)}H c},49:6(a,b){a=x(a);K c=a.1e("\\n");J.V("2z-1s-2t");K d=2u(J.V("2i-1s"));a="";O(K h=J.V("1D"),g=0;g<c.L;g++){K i=c[g],k=/^(&2s;|\\s)+/.X(i),j=N,l=b?b[g]:d+g;I(k!=N){j=k[0].1q();i=i.1o(j.L);j=j.Q(" ",e.13.1W)}i=x(i);I(i.L==0)i=e.13.1W;a+=J.2r(g,l,(j!=N?\'<17 1g="\'+h+\' 5N">\'+j+"</17>":"")+i)}H a},4f:6(a){H a?"<4a>"+a+"</4a>":""},4b:6(a,b){6 c(l){H(l=l?l.1V||g:g)?l+" ":""}O(K d=0,h="",g=J.V("1D",""),i=0;i<b.L;i++){K k=b[i],j;I(!(k===N||k.L===0)){j=c(k);h+=u(a.1o(d,k.P-d),j+"48")+u(k.1T,j+k.23);d=k.P+k.L+(k.75||0)}}h+=u(a.1o(d),c()+"48");H h},1H:6(a){K b="",c=["20"],d;I(J.V("2k")==R)J.1n.16=J.1n.1u=11;1l="20";J.V("2l")==R&&c.U("47");I((1u=J.V("1u"))==11)c.U("6S");c.U(J.V("1g-27"));c.U(J.V("1D"));a=a.Q(/^[ ]*[\\n]+|[\\n]*[ ]*$/g,"").Q(/\\r/g," ");b=J.V("43-22");I(J.V("42-45")==R)a=n(a,b);Y{O(K h="",g=0;g<b;g++)h+=" ";a=a.Q(/\\t/g,h)}a=a;a:{b=a=a;h=/<2R\\s*\\/?>|&1y;2R\\s*\\/?&1G;/2T;I(e.13.46==R)b=b.Q(h,"\\n");I(e.13.44==R)b=b.Q(h,"");b=b.1e("\\n");h=/^\\s*/;g=4Q;O(K i=0;i<b.L&&g>0;i++){K k=b[i];I(x(k).L!=0){k=h.X(k);I(k==N){a=a;1N a}g=1Q.4q(k[0].L,g)}}I(g>0)O(i=0;i<b.L;i++)b[i]=b[i].1o(g);a=b.1K("\\n")}I(1u)d=J.4d(a);b=J.4c(J.2J,a);b=J.4b(a,b);b=J.49(b,d);I(J.V("41-40"))b=E(b);1j 2H!="1d"&&2H.3S&&2H.3S.1C(/5s/)&&c.U("5t");H b=\'<T 1c="\'+t(J.1c)+\'" 1g="\'+c.1K(" ")+\'">\'+(J.V("16")?e.16.1H(J):"")+\'<3Z 5z="0" 5H="0" 5J="0">\'+J.4f(J.V("1t"))+"<3T><3P>"+(1u?\'<2d 1g="1u">\'+J.3Q(a)+"</2d>":"")+\'<2d 1g="17"><T 1g="3O">\'+b+"</T></2d></3P></3T></3Z></T>"},2F:6(a){I(a===N)a="";J.17=a;K b=J.3Y("T");b.3X=J.1H(a);J.V("16")&&w(p(b,".16"),"5c",e.16.2b);J.V("3V-17")&&w(p(b,".17"),"56",f);H b},2Q:6(a){J.1c=""+1Q.5d(1Q.5n()*5k).1q();e.1Y.2A[t(J.1c)]=J;J.1n=C(e.2v,a||{});I(J.V("2k")==R)J.1n.16=J.1n.1u=11},5j:6(a){a=a.Q(/^\\s+|\\s+$/g,"").Q(/\\s+/g,"|");H"\\\\b(?:"+a+")\\\\b"},5f:6(a){J.28={18:{1I:a.18,23:"1k"},1b:{1I:a.1b,23:"1k"},17:1f M("(?<18>"+a.18.1m+")(?<17>.*?)(?<1b>"+a.1b.1m+")","5o")}}};H e}();1j 2e!="1d"&&(2e.1v=1v);', 62, 441, "||||||function|||||||||||||||||||||||||||||||||||||return|if|this|var|length|XRegExp|null|for|index|replace|true||div|push|getParam|call|exec|else|prototype||false|lastIndex|config|arguments|RegExp|toolbar|code|left|captureNames|slice|right|id|undefined|split|new|class|addToken|indexOf|typeof|script|className|source|params|substr|apply|toString|String|line|title|gutter|SyntaxHighlighter|_xregexp|strings|lt|html|test|OUTSIDE_CLASS|match|brush|document|target|gt|getHtml|regex|global|join|style|highlight|break|concat|window|Math|isRegExp|throw|value|brushes|brushName|space|alert|vars|http|syntaxhighlighter|expandSource|size|css|case|font|Fa|name|htmlScript|dA|can|handler|gm|td|exports|color|in|href|first|discoveredBrushes|light|collapse|object|cache|getButtonHtml|trigger|pattern|getLineHtml|nbsp|numbers|parseInt|defaults|com|items|www|pad|highlighters|execute|focus|func|all|getDiv|parentNode|navigator|INSIDE_CLASS|regexList|hasFlag|Match|useScriptTags|hasNamedCapture|text|help|init|br|input|gi|Error|values|span|list|250|height|width|screen|top|500|tagName|findElements|getElementsByTagName|aboutDialog|_blank|appendChild|charAt|Array|copyAsGlobal|setFlag|highlighter_|string|attachEvent|nodeName|floor|backref|output|the|TypeError|sticky|Za|iterate|freezeTokens|scope|type|textarea|alexgorbatchev|version|margin|2010|005896|gs|regexLib|body|center|align|noBrush|require|childNodes|DTD|xhtml1|head|org|w3|url|preventDefault|container|tr|getLineNumbersHtml|isNaN|userAgent|tbody|isLineHighlighted|quick|void|innerHTML|create|table|links|auto|smart|tab|stripBrs|tabs|bloggerMode|collapsed|plain|getCodeLinesHtml|caption|getMatchesHtml|findMatches|figureOutLineNumbers|removeNestedMatches|getTitleHtml|brushNotHtmlScript|substring|createElement|Highlighter|load|HtmlScript|Brush|pre|expand|multiline|min|Can|ignoreCase|find|blur|extended|toLowerCase|aliases|addEventListener|innerText|textContent|wasn|select|createTextNode|removeChild|option|same|frame|xmlns|dtd|twice|1999|equiv|meta|htmlscript|transitional|1E3|expected|PUBLIC|DOCTYPE|on|W3C|XHTML|TR|EN|Transitional||configured|srcElement|Object|after|run|dblclick|matchChain|valueOf|constructor|default|switch|click|round|execAt|forHtmlScript|token|gimy|functions|getKeywords|1E6|escape|within|random|sgi|another|finally|supply|MSIE|ie|toUpperCase|catch|returnValue|definition|event|border|imsx|constructing|one|Infinity|from|when|Content|cellpadding|flags|cellspacing|try|xhtml|Type|spaces|2930402|hosted_button_id|lastIndexOf|donate|active|development|keep|to|xclick|_s|Xml|please|like|you|paypal|cgi|cmd|webscr|bin|highlighted|scrollbars|aspScriptTags|phpScriptTags|sort|max|scriptScriptTags|toolbar_item|_|command|command_|number|getElementById|doubleQuotedString|singleLinePerlComments|singleLineCComments|multiLineCComments|singleQuotedString|multiLineDoubleQuotedString|xmlComments|alt|multiLineSingleQuotedString|If|https|1em|000|fff|background|5em|xx|bottom|75em|Gorbatchev|large|serif|CDATA|continue|utf|charset|content|About|family|sans|Helvetica|Arial|Geneva|3em|nogutter|Copyright|syntax|close|write|2004|Alex|open|JavaScript|highlighter|July|02|replaceChild|offset|83".split("|"), 0, {})),
    function() {
        function t() {
            function t(t) {
                return "\\b([a-z_]|)" + t.replace(/ /g, "(?=:)\\b|\\b([a-z_\\*]|\\*|)") + "(?=:)\\b"
            }

            function e(t) {
                return "\\b" + t.replace(/ /g, "(?!-)(?!:)\\b|\\b()") + ":\\b"
            }
            var i = "ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index",
                n = "above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow",
                r = "[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";
            this.regexList = [{
                regex: SyntaxHighlighter.regexLib.multiLineCComments,
                css: "comments"
            }, {
                regex: SyntaxHighlighter.regexLib.doubleQuotedString,
                css: "string"
            }, {
                regex: SyntaxHighlighter.regexLib.singleQuotedString,
                css: "string"
            }, {
                regex: /\#[a-fA-F0-9]{3,6}/g,
                css: "value"
            }, {
                regex: /(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,
                css: "value"
            }, {
                regex: /!important/g,
                css: "color3"
            }, {
                regex: new RegExp(t(i), "gm"),
                css: "keyword"
            }, {
                regex: new RegExp(e(n), "g"),
                css: "value"
            }, {
                regex: new RegExp(this.getKeywords(r), "g"),
                css: "color1"
            }], this.forHtmlScript({
                left: /(&lt;|<)\s*style.*?(&gt;|>)/gi,
                right: /(&lt;|<)\/\s*style\s*(&gt;|>)/gi
            })
        }
        "undefined" != typeof require ? SyntaxHighlighter = require("shCore").SyntaxHighlighter : null, t.prototype = new SyntaxHighlighter.Highlighter, t.aliases = ["css"], SyntaxHighlighter.brushes.CSS = t, "undefined" != typeof exports ? exports.Brush = t : null
    }(),
    function() {
        function t() {
            function t(t, e) {
                var i = SyntaxHighlighter.Match,
                    n = t[0],
                    r = new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)", "xg").exec(n),
                    s = [];
                if (null != t.attributes)
                    for (var a, o = new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)", "xg"); null != (a = o.exec(n));) s.push(new i(a.name, t.index + a.index, "color1")), s.push(new i(a.value, t.index + a.index + a[0].indexOf(a.value), "string"));
                return null != r && s.push(new i(r.name, t.index + r[0].indexOf(r.name), "keyword")), s
            }
            this.regexList = [{
                regex: new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)", "gm"),
                css: "color2"
            }, {
                regex: SyntaxHighlighter.regexLib.xmlComments,
                css: "comments"
            }, {
                regex: new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)", "sg"),
                func: t
            }]
        }
        "undefined" != typeof require ? SyntaxHighlighter = require("shCore").SyntaxHighlighter : null, t.prototype = new SyntaxHighlighter.Highlighter, t.aliases = ["xml", "xhtml", "xslt", "html"], SyntaxHighlighter.brushes.Xml = t, "undefined" != typeof exports ? exports.Brush = t : null
    }(),
    function() {
        function t() {
            var t = "break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with",
                e = SyntaxHighlighter.regexLib;
            this.regexList = [{
                regex: e.multiLineDoubleQuotedString,
                css: "string"
            }, {
                regex: e.multiLineSingleQuotedString,
                css: "string"
            }, {
                regex: e.singleLineCComments,
                css: "comments"
            }, {
                regex: e.multiLineCComments,
                css: "comments"
            }, {
                regex: /\s*#.*/gm,
                css: "preprocessor"
            }, {
                regex: new RegExp(this.getKeywords(t), "gm"),
                css: "keyword"
            }], this.forHtmlScript(e.scriptScriptTags)
        }
        "undefined" != typeof require ? SyntaxHighlighter = require("shCore").SyntaxHighlighter : null, t.prototype = new SyntaxHighlighter.Highlighter, t.aliases = ["js", "jscript", "javascript"], SyntaxHighlighter.brushes.JScript = t, "undefined" != typeof exports ? exports.Brush = t : null
    }(),
    function() {
        function t() {
            function t(t) {
                return "\\b([a-z_]|)" + t.replace(/ /g, "(?=:)\\b|\\b([a-z_\\*]|\\*|)") + "(?=:)\\b"
            }

            function e(t) {
                return "\\b" + t.replace(/ /g, "(?!-)(?!:)\\b|\\b()") + ":\\b"
            }
            var i = "ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index",
                n = "above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow",
                r = "[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif",
                s = "!important !default",
                a = "@import @extend @debug @warn @if @for @while @mixin @include",
                o = SyntaxHighlighter.regexLib;
            this.regexList = [{
                regex: o.multiLineCComments,
                css: "comments"
            }, {
                regex: o.singleLineCComments,
                css: "comments"
            }, {
                regex: o.doubleQuotedString,
                css: "string"
            }, {
                regex: o.singleQuotedString,
                css: "string"
            }, {
                regex: /\#[a-fA-F0-9]{3,6}/g,
                css: "value"
            }, {
                regex: /\b(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)\b/g,
                css: "value"
            }, {
                regex: /\$\w+/g,
                css: "variable"
            }, {
                regex: new RegExp(this.getKeywords(s), "g"),
                css: "color3"
            }, {
                regex: new RegExp(this.getKeywords(a), "g"),
                css: "preprocessor"
            }, {
                regex: new RegExp(t(i), "gm"),
                css: "keyword"
            }, {
                regex: new RegExp(e(n), "g"),
                css: "value"
            }, {
                regex: new RegExp(this.getKeywords(r), "g"),
                css: "color1"
            }]
        }
        "undefined" != typeof require ? SyntaxHighlighter = require("shCore").SyntaxHighlighter : null, t.prototype = new SyntaxHighlighter.Highlighter, t.aliases = ["sass", "scss"], SyntaxHighlighter.brushes.Sass = t, "undefined" != typeof exports ? exports.Brush = t : null
    }(), SyntaxHighlighter.all();
