(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],2:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((Math.random() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":3,"./lib/pad.js":4}],3:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":4}],4:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],5:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],6:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":20}],8:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],9:[function(require,module,exports){
!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || !1 === value) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],10:[function(require,module,exports){
module.exports = prettierBytes

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
  num = Number(num / Math.pow(1000, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],11:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],12:[function(require,module,exports){
// Generated by Babel
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encode = encode;
/* global: window */

var _window = window;
var btoa = _window.btoa;
function encode(data) {
  return btoa(unescape(encodeURIComponent(data)));
}

var isSupported = exports.isSupported = "btoa" in window;
},{}],13:[function(require,module,exports){
// Generated by Babel
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newRequest = newRequest;
exports.resolveUrl = resolveUrl;

var _resolveUrl = require("resolve-url");

var _resolveUrl2 = _interopRequireDefault(_resolveUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newRequest() {
  return new window.XMLHttpRequest();
} /* global window */


function resolveUrl(origin, link) {
  return (0, _resolveUrl2.default)(origin, link);
}
},{"resolve-url":11}],14:[function(require,module,exports){
// Generated by Babel
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSource = getSource;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSource = function () {
  function FileSource(file) {
    _classCallCheck(this, FileSource);

    this._file = file;
    this.size = file.size;
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end) {
      return this._file.slice(start, end);
    }
  }, {
    key: "close",
    value: function close() {}
  }]);

  return FileSource;
}();

function getSource(input) {
  // Since we emulate the Blob type in our tests (not all target browsers
  // support it), we cannot use `instanceof` for testing whether the input value
  // can be handled. Instead, we simply check is the slice() function and the
  // size property are available.
  if (typeof input.slice === "function" && typeof input.size !== "undefined") {
    return new FileSource(input);
  }

  throw new Error("source object may only be an instance of File or Blob in this environment");
}
},{}],15:[function(require,module,exports){
// Generated by Babel
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setItem = setItem;
exports.getItem = getItem;
exports.removeItem = removeItem;
/* global window, localStorage */

var hasStorage = false;
try {
  hasStorage = "localStorage" in window;

  // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)
  var key = "tusSupport";
  localStorage.setItem(key, localStorage.getItem(key));
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}

var canStoreURLs = exports.canStoreURLs = hasStorage;

function setItem(key, value) {
  if (!hasStorage) return;
  return localStorage.setItem(key, value);
}

function getItem(key) {
  if (!hasStorage) return;
  return localStorage.getItem(key);
}

function removeItem(key) {
  if (!hasStorage) return;
  return localStorage.removeItem(key);
}
},{}],16:[function(require,module,exports){
// Generated by Babel
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DetailedError = function (_Error) {
  _inherits(DetailedError, _Error);

  function DetailedError(error) {
    var causingErr = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var xhr = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, DetailedError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DetailedError).call(this, error.message));

    _this.originalRequest = xhr;
    _this.causingError = causingErr;

    var message = error.message;
    if (causingErr != null) {
      message += ", caused by " + causingErr.toString();
    }
    if (xhr != null) {
      message += ", originated from request (response code: " + xhr.status + ", response text: " + xhr.responseText + ")";
    }
    _this.message = message;
    return _this;
  }

  return DetailedError;
}(Error);

exports.default = DetailedError;
},{}],17:[function(require,module,exports){
// Generated by Babel
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fingerprint;
/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @return {String}
 */
function fingerprint(file, options) {
  return ["tus", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-");
}
},{}],18:[function(require,module,exports){
// Generated by Babel
"use strict";

var _upload = require("./upload");

var _upload2 = _interopRequireDefault(_upload);

var _storage = require("./node/storage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var defaultOptions = _upload2.default.defaultOptions;


if (typeof window !== "undefined") {
  // Browser environment using XMLHttpRequest
  var _window = window;
  var XMLHttpRequest = _window.XMLHttpRequest;
  var Blob = _window.Blob;


  var isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === "function";
} else {
  // Node.js environment using http module
  var isSupported = true;
}

// The usage of the commonjs exporting syntax instead of the new ECMAScript
// one is actually inteded and prevents weird behaviour if we are trying to
// import this module in another module using Babel.
module.exports = {
  Upload: _upload2.default,
  isSupported: isSupported,
  canStoreURLs: _storage.canStoreURLs,
  defaultOptions: defaultOptions
};
},{"./node/storage":15,"./upload":19}],19:[function(require,module,exports){
// Generated by Babel
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */


// We import the files used inside the Node environment which are rewritten
// for browsers using the rules defined in the package.json


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fingerprint = require("./fingerprint");

var _fingerprint2 = _interopRequireDefault(_fingerprint);

var _error = require("./error");

var _error2 = _interopRequireDefault(_error);

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

var _request = require("./node/request");

var _source = require("./node/source");

var _base = require("./node/base64");

var Base64 = _interopRequireWildcard(_base);

var _storage = require("./node/storage");

var Storage = _interopRequireWildcard(_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  endpoint: null,
  fingerprint: _fingerprint2.default,
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null,
  removeFingerprintOnSuccess: false
};

var Upload = function () {
  function Upload(file, options) {
    _classCallCheck(this, Upload);

    this.options = (0, _extend2.default)(true, {}, defaultOptions, options);

    // The underlying File/Blob object
    this.file = file;

    // The URL against which the file will be uploaded
    this.url = null;

    // The underlying XHR object for the current PATCH request
    this._xhr = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The offset used in the current PATCH request
    this._offset = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The file's size in bytes
    this._size = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The current count of attempts which have been made. Null indicates none.
    this._retryAttempt = 0;

    // The timeout's ID which is used to delay the next retry
    this._retryTimeout = null;

    // The offset of the remote upload before the latest attempt was started.
    this._offsetBeforeRetry = 0;
  }

  _createClass(Upload, [{
    key: "start",
    value: function start() {
      var _this = this;

      var file = this.file;

      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }

      if (!this.options.endpoint && !this.options.uploadUrl) {
        this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));
        return;
      }

      var source = this._source = (0, _source.getSource)(file, this.options.chunkSize);

      // Firstly, check if the caller has supplied a manual upload size or else
      // we will use the calculated size by the source object.
      if (this.options.uploadSize != null) {
        var size = +this.options.uploadSize;
        if (isNaN(size)) {
          throw new Error("tus: cannot convert `uploadSize` option into a number");
        }

        this._size = size;
      } else {
        var size = source.size;

        // The size property will be null if we cannot calculate the file's size,
        // for example if you handle a stream.
        if (size == null) {
          throw new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option");
        }

        this._size = size;
      }

      var retryDelays = this.options.retryDelays;
      if (retryDelays != null) {
        if (Object.prototype.toString.call(retryDelays) !== "[object Array]") {
          throw new Error("tus: the `retryDelays` option must either be an array or null");
        } else {
          (function () {
            var errorCallback = _this.options.onError;
            _this.options.onError = function (err) {
              // Restore the original error callback which may have been set.
              _this.options.onError = errorCallback;

              // We will reset the attempt counter if
              // - we were already able to connect to the server (offset != null) and
              // - we were able to upload a small chunk of data to the server
              var shouldResetDelays = _this._offset != null && _this._offset > _this._offsetBeforeRetry;
              if (shouldResetDelays) {
                _this._retryAttempt = 0;
              }

              var isOnline = true;
              if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
                isOnline = false;
              }

              // We only attempt a retry if
              // - we didn't exceed the maxium number of retries, yet, and
              // - this error was caused by a request or it's response and
              // - the error is not a client error (status 4xx) and
              // - the browser does not indicate that we are offline
              var shouldRetry = _this._retryAttempt < retryDelays.length && err.originalRequest != null && !inStatusCategory(err.originalRequest.status, 400) && isOnline;

              if (!shouldRetry) {
                _this._emitError(err);
                return;
              }

              var delay = retryDelays[_this._retryAttempt++];

              _this._offsetBeforeRetry = _this._offset;
              _this.options.uploadUrl = _this.url;

              _this._retryTimeout = setTimeout(function () {
                _this.start();
              }, delay);
            };
          })();
        }
      }

      // Reset the aborted flag when the upload is started or else the
      // _startUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }

      // Try to find the endpoint for the file in the storage
      if (this.options.resume) {
        this._fingerprint = this.options.fingerprint(file, this.options);
        var resumedUrl = Storage.getItem(this._fingerprint);

        if (resumedUrl != null) {
          this.url = resumedUrl;
          this._resumeUpload();
          return;
        }
      }

      // An upload has not started for the file yet, so we start a new one
      this._createUpload();
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this._xhr !== null) {
        this._xhr.abort();
        this._source.close();
        this._aborted = true;
      }

      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
    }
  }, {
    key: "_emitXhrError",
    value: function _emitXhrError(xhr, err, causingErr) {
      this._emitError(new _error2.default(err, causingErr, xhr));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      if (typeof this.options.onError === "function") {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess() {
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess();
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     * @param  {number} bytesSent  Number of bytes sent to the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === "function") {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param  {number} chunkSize  Size of the chunk that was accepted by the
     *                             server.
     * @param  {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === "function") {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /**
     * Set the headers used in the request and the withCredentials property
     * as defined in the options
     *
     * @param {XMLHttpRequest} xhr
     */

  }, {
    key: "_setupXHR",
    value: function _setupXHR(xhr) {
      this._xhr = xhr;

      xhr.setRequestHeader("Tus-Resumable", "1.0.0");
      var headers = this.options.headers;

      for (var name in headers) {
        xhr.setRequestHeader(name, headers[name]);
      }

      xhr.withCredentials = this.options.withCredentials;
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */

  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this2 = this;

      if (!this.options.endpoint) {
        this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));
        return;
      }

      var xhr = (0, _request.newRequest)();
      xhr.open("POST", this.options.endpoint, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this2._emitXhrError(xhr, new Error("tus: unexpected response while creating upload"));
          return;
        }

        var location = xhr.getResponseHeader("Location");
        if (location == null) {
          _this2._emitXhrError(xhr, new Error("tus: invalid or missing Location header"));
          return;
        }

        _this2.url = (0, _request.resolveUrl)(_this2.options.endpoint, location);

        if (_this2._size === 0) {
          // Nothing to upload and file was successfully created
          _this2._emitSuccess();
          _this2._source.close();
          return;
        }

        if (_this2.options.resume) {
          Storage.setItem(_this2._fingerprint, _this2.url);
        }

        _this2._offset = 0;
        _this2._startUpload();
      };

      xhr.onerror = function (err) {
        _this2._emitXhrError(xhr, new Error("tus: failed to create upload"), err);
      };

      this._setupXHR(xhr);
      xhr.setRequestHeader("Upload-Length", this._size);

      // Add metadata if values have been added
      var metadata = encodeMetadata(this.options.metadata);
      if (metadata !== "") {
        xhr.setRequestHeader("Upload-Metadata", metadata);
      }

      xhr.send(null);
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */

  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this3 = this;

      var xhr = (0, _request.newRequest)();
      xhr.open("HEAD", this.url, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          if (_this3.options.resume && inStatusCategory(xhr.status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            Storage.removeItem(_this3._fingerprint);
          }

          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (xhr.status === 423) {
            _this3._emitXhrError(xhr, new Error("tus: upload is currently locked; retry later"));
            return;
          }

          if (!_this3.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            _this3._emitXhrError(xhr, new Error("tus: unable to resume upload (new upload cannot be created without an endpoint)"));
            return;
          }

          // Try to create a new upload
          _this3.url = null;
          _this3._createUpload();
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this3._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        var length = parseInt(xhr.getResponseHeader("Upload-Length"), 10);
        if (isNaN(length)) {
          _this3._emitXhrError(xhr, new Error("tus: invalid or missing length value"));
          return;
        }

        // Upload has already been completed and we do not need to send additional
        // data to the server
        if (offset === length) {
          _this3._emitProgress(length, length);
          _this3._emitSuccess();
          return;
        }

        _this3._offset = offset;
        _this3._startUpload();
      };

      xhr.onerror = function (err) {
        _this3._emitXhrError(xhr, new Error("tus: failed to resume upload"), err);
      };

      this._setupXHR(xhr);
      xhr.send(null);
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */

  }, {
    key: "_startUpload",
    value: function _startUpload() {
      var _this4 = this;

      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }

      var xhr = (0, _request.newRequest)();

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        xhr.open("POST", this.url, true);
        xhr.setRequestHeader("X-HTTP-Method-Override", "PATCH");
      } else {
        xhr.open("PATCH", this.url, true);
      }

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this4._emitXhrError(xhr, new Error("tus: unexpected response while uploading chunk"));
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this4._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        _this4._emitProgress(offset, _this4._size);
        _this4._emitChunkComplete(offset - _this4._offset, offset, _this4._size);

        _this4._offset = offset;

        if (offset == _this4._size) {
          if (_this4.options.removeFingerprintOnSuccess && _this4.options.resume) {
            // Remove stored fingerprint and corresponding endpoint. This causes
            // new upload of the same file must be treated as a different file.
            Storage.removeItem(_this4._fingerprint);
          }

          // Yay, finally done :)
          _this4._emitSuccess();
          _this4._source.close();
          return;
        }

        _this4._startUpload();
      };

      xhr.onerror = function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this4._aborted) {
          return;
        }

        _this4._emitXhrError(xhr, new Error("tus: failed to upload chunk at offset " + _this4._offset), err);
      };

      // Test support for progress events before attaching an event listener
      if ("upload" in xhr) {
        xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }

          _this4._emitProgress(start + e.loaded, _this4._size);
        };
      }

      this._setupXHR(xhr);

      xhr.setRequestHeader("Upload-Offset", this._offset);
      xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

      var start = this._offset;
      var end = this._offset + this.options.chunkSize;

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if (end === Infinity || end > this._size) {
        end = this._size;
      }

      xhr.send(this._source.slice(start, end));

      // Emit an progress event when a new chunk begins being uploaded.
      this._emitProgress(this._offset, this._size);
    }
  }]);

  return Upload;
}();

function encodeMetadata(metadata) {
  if (!Base64.isSupported) {
    return "";
  }

  var encoded = [];

  for (var key in metadata) {
    encoded.push(key + " " + Base64.encode(metadata[key]));
  }

  return encoded.join(",");
}

/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}

Upload.defaultOptions = defaultOptions;

exports.default = Upload;
},{"./error":16,"./fingerprint":17,"./node/base64":12,"./node/request":13,"./node/source":14,"./node/storage":15,"extend":5}],20:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],21:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var preact = require('preact');
var findDOMElement = require('./../../utils/lib/findDOMElement');

/**
 * Defer a frequent call to the microtask queue.
 */
function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;
    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null;
        // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.
        return fn.apply(undefined, latestArgs);
      });
    }
    return calling;
  };
}

/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @return {array | string} files or success/fail message
 */
module.exports = function () {
  function Plugin(uppy, opts) {
    _classCallCheck(this, Plugin);

    this.uppy = uppy;
    this.opts = opts || {};

    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  Plugin.prototype.getPluginState = function getPluginState() {
    var _uppy$getState = this.uppy.getState(),
        plugins = _uppy$getState.plugins;

    return plugins[this.id];
  };

  Plugin.prototype.setPluginState = function setPluginState(update) {
    var _extends2;

    var _uppy$getState2 = this.uppy.getState(),
        plugins = _uppy$getState2.plugins;

    this.uppy.setState({
      plugins: _extends({}, plugins, (_extends2 = {}, _extends2[this.id] = update, _extends2))
    });
  };

  Plugin.prototype.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  };

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {String|Object} target
   *
   */

  Plugin.prototype.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;

    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true;

      // API for plugins that require a synchronous rerender.
      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);
      };
      this._updateUI = debounce(this.rerender);

      this.uppy.log('Installing ' + callerPluginName + ' to a DOM element');

      // clear everything inside the target container
      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);

      return this.el;
    }

    var targetPlugin = void 0;
    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target;
      // Find the target plugin instance.
      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      var targetPluginName = targetPlugin.id;
      this.uppy.log('Installing ' + callerPluginName + ' to ' + targetPluginName);
      this.el = targetPlugin.addTarget(plugin);
      return this.el;
    }

    this.uppy.log('Not installing ' + callerPluginName);
    throw new Error('Invalid target option given to ' + callerPluginName);
  };

  Plugin.prototype.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  Plugin.prototype.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  Plugin.prototype.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Plugin.prototype.install = function install() {};

  Plugin.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":35,"preact":9}],22:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Translator = require('./../../utils/lib/Translator');
var ee = require('namespace-emitter');
var cuid = require('cuid');
// const throttle = require('lodash.throttle')
var prettyBytes = require('prettier-bytes');
var match = require('mime-match');
var DefaultStore = require('./../../store-default');
var getFileType = require('./../../utils/lib/getFileType');
var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');
var generateFileID = require('./../../utils/lib/generateFileID');
var isObjectURL = require('./../../utils/lib/isObjectURL');
var getTimeStamp = require('./../../utils/lib/getTimeStamp');
var Plugin = require('./Plugin'); // Exported from here.

/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */

var Uppy = function () {
  /**
  * Instantiate Uppy
  * @param {object} opts — Uppy options
  */
  function Uppy(opts) {
    var _this = this;

    _classCallCheck(this, Uppy);

    var defaultLocale = {
      strings: {
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload:',
        uppyServerError: 'Connection with Uppy Server failed',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectXFiles: {
          0: 'Select %{smart_count} file',
          1: 'Select %{smart_count} files'
        },
        cancel: 'Cancel',
        logOut: 'Log out'

        // set default options
      } };var defaultOptions = {
      id: 'uppy',
      autoProceed: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      locale: defaultLocale,
      store: DefaultStore()

      // Merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);
    this.opts.restrictions = _extends({}, defaultOptions.restrictions, this.opts.restrictions);

    this.locale = _extends({}, defaultLocale, this.opts.locale);
    this.locale.strings = _extends({}, defaultLocale.strings, this.opts.locale.strings);

    // i18n
    this.translator = new Translator({ locale: this.locale });
    this.i18n = this.translator.translate.bind(this.translator);

    // Container for different types of plugins
    this.plugins = {};

    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this);
    this._calculateProgress = this._calculateProgress.bind(this);
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);

    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);

    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);

    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];

    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      capabilities: {
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });

    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this.emit('state-update', prevState, nextState, patch);
      _this.updateAll(nextState);
    });

    // for debugging and testing
    // this.updateNum = 0
    if (this.opts.debug && typeof window !== 'undefined') {
      window['uppyLog'] = '';
      window[this.opts.id] = this;
    }

    this._addListeners();
  }

  Uppy.prototype.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  Uppy.prototype.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  };

  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */

  Uppy.prototype.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  };

  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */

  Uppy.prototype.setState = function setState(patch) {
    this.store.setState(patch);
  };

  /**
   * Returns current state.
   * @return {object}
   */

  Uppy.prototype.getState = function getState() {
    return this.store.getState();
  };

  /**
  * Back compat for when uppy.state is used instead of uppy.getState().
  */

  /**
  * Shorthand to set state for a specific file.
  */
  Uppy.prototype.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error("Can\u2019t set state for " + fileID + ' (the file could have been removed)');
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  Uppy.prototype.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: false
    };
    var files = _extends({}, this.getState().files);
    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);
      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });

    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });

    // TODO Document on the website
    this.emit('reset-progress');
  };

  Uppy.prototype.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  Uppy.prototype.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);
    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  Uppy.prototype.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);
    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  Uppy.prototype.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  Uppy.prototype.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);
    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  Uppy.prototype.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);
    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });

    this.log('Adding metadata:');
    this.log(data);

    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  Uppy.prototype.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);
    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that’s not with us anymore: ', fileID);
      return;
    }
    var newMeta = _extends({}, updatedFiles[fileID].meta, data);
    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({ files: updatedFiles });
  };

  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */

  Uppy.prototype.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  };

  /**
   * Get all files in an array.
   */

  Uppy.prototype.getFiles = function getFiles() {
    var _getState = this.getState(),
        files = _getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  };

  /**
  * Check if minNumberOfFiles restriction is reached before uploading.
  *
  * @private
  */

  Uppy.prototype._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new Error('' + this.i18n('youHaveToAtLeastSelectX', { smart_count: minNumberOfFiles }));
    }
  };

  /**
  * Check if file passes a set of restrictions set in options: maxFileSize,
  * maxNumberOfFiles and allowedFileTypes.
  *
  * @param {object} file object to check
  * @private
  */

  Uppy.prototype._checkRestrictions = function _checkRestrictions(file) {
    var _opts$restrictions = this.opts.restrictions,
        maxFileSize = _opts$restrictions.maxFileSize,
        maxNumberOfFiles = _opts$restrictions.maxNumberOfFiles,
        allowedFileTypes = _opts$restrictions.allowedFileTypes;

    if (maxNumberOfFiles) {
      if (Object.keys(this.getState().files).length + 1 > maxNumberOfFiles) {
        throw new Error('' + this.i18n('youCanOnlyUploadX', { smart_count: maxNumberOfFiles }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.filter(function (type) {
        // if (!file.type) return false

        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type, type);
        }

        // otherwise this is likely an extension
        if (type[0] === '.') {
          if (file.extension === type.substr(1)) {
            return file.extension;
          }
        }
      }).length > 0;

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new Error(this.i18n('youCanOnlyUploadFileTypes') + ' ' + allowedFileTypesString);
      }
    }

    if (maxFileSize) {
      if (file.data.size > maxFileSize) {
        throw new Error(this.i18n('exceedsSize') + ' ' + prettyBytes(maxFileSize));
      }
    }
  };

  /**
  * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
  * try to guess file type in a clever way, check file against restrictions,
  * and start an upload if `autoProceed === true`.
  *
  * @param {object} file object to add
  */

  Uppy.prototype.addFile = function addFile(file) {
    var _this2 = this,
        _extends3;

    var _getState2 = this.getState(),
        files = _getState2.files;

    var onError = function onError(msg) {
      var err = (typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object' ? msg : new Error(msg);
      _this2.log(err.message);
      _this2.info(err.message, 'error', 5000);
      throw err;
    };

    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      this.log('Not adding file because onBeforeFileAdded returned false');
      return;
    }

    if ((typeof onBeforeFileAddedResult === 'undefined' ? 'undefined' : _typeof(onBeforeFileAddedResult)) === 'object' && onBeforeFileAddedResult) {
      // warning after the change in 0.24
      if (onBeforeFileAddedResult.then) {
        throw new TypeError('onBeforeFileAdded() returned a Promise, but this is no longer supported. It must be synchronous.');
      }
      file = onBeforeFileAddedResult;
    }

    var fileType = getFileType(file);
    var fileName = void 0;
    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }
    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;

    var fileID = generateFileID(file);

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType;

    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.data.size || 0,
        uploadComplete: false,
        uploadStarted: false
      },
      size: file.data.size || 0,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(newFile);
    } catch (err) {
      onError(err);
    }

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[fileID] = newFile, _extends3))
    });

    this.emit('file-added', newFile);
    this.log('Added file: ' + fileName + ', ' + fileID + ', mime type: ' + fileType);

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this2.scheduledAutoProceed = null;
        _this2.upload().catch(function (err) {
          console.error(err.stack || err.message || err);
        });
      }, 4);
    }
  };

  Uppy.prototype.removeFile = function removeFile(fileID) {
    var _this3 = this;

    var _getState3 = this.getState(),
        files = _getState3.files,
        currentUploads = _getState3.currentUploads;

    var updatedFiles = _extends({}, files);
    var removedFile = updatedFiles[fileID];
    delete updatedFiles[fileID];

    // Remove this file from its `currentUpload`.
    var updatedUploads = _extends({}, currentUploads);
    var removeUploads = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(function (uploadFileID) {
        return uploadFileID !== fileID;
      });
      // Remove the upload if no files are associated with it anymore.
      if (newFileIDs.length === 0) {
        removeUploads.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });

    this.setState({
      currentUploads: updatedUploads,
      files: updatedFiles
    });

    removeUploads.forEach(function (uploadID) {
      _this3._removeUpload(uploadID);
    });

    this._calculateTotalProgress();
    this.emit('file-removed', removedFile);
    this.log('File removed: ' + removedFile.id);

    // Clean up object URLs.
    if (removedFile.preview && isObjectURL(removedFile.preview)) {
      URL.revokeObjectURL(removedFile.preview);
    }

    this.log('Removed file: ' + fileID);
  };

  Uppy.prototype.pauseResume = function pauseResume(fileID) {
    if (this.getFile(fileID).uploadComplete) return;

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;

    this.setFileState(fileID, {
      isPaused: isPaused
    });

    this.emit('upload-pause', fileID, isPaused);

    return isPaused;
  };

  Uppy.prototype.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('pause-all');
  };

  Uppy.prototype.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });

    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({ files: updatedFiles });

    this.emit('resume-all');
  };

  Uppy.prototype.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);
    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });

    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });

    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.cancelAll = function cancelAll() {
    var _this4 = this;

    this.emit('cancel-all');

    // TODO Or should we just call removeFile on all files?

    var _getState4 = this.getState(),
        currentUploads = _getState4.currentUploads;

    var uploadIDs = Object.keys(currentUploads);

    uploadIDs.forEach(function (id) {
      _this4._removeUpload(id);
    });

    this.setState({
      files: {},
      totalProgress: 0,
      error: null
    });
  };

  Uppy.prototype.retryUpload = function retryUpload(fileID) {
    var updatedFiles = _extends({}, this.getState().files);
    var updatedFile = _extends({}, updatedFiles[fileID], { error: null, isPaused: false });
    updatedFiles[fileID] = updatedFile;
    this.setState({
      files: updatedFiles
    });

    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID]);
    return this._runUpload(uploadID);
  };

  Uppy.prototype.reset = function reset() {
    this.cancelAll();
  };

  Uppy.prototype._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log('Not setting progress for a file that has been removed: ' + file.id);
      return;
    }

    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: Math.floor((data.bytesUploaded / data.bytesTotal * 100).toFixed(2))
      })
    });

    this._calculateTotalProgress();
  };

  Uppy.prototype._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = _extends({}, this.getState().files);

    var inProgress = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadStarted;
    });
    var progressMax = inProgress.length * 100;
    var progressAll = 0;
    inProgress.forEach(function (file) {
      progressAll = progressAll + files[file].progress.percentage;
    });

    var totalProgress = progressMax === 0 ? 0 : Math.floor((progressAll * 100 / progressMax).toFixed(2));

    this.setState({
      totalProgress: totalProgress
    });
  };

  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */

  Uppy.prototype._addListeners = function _addListeners() {
    var _this5 = this;

    this.on('error', function (error) {
      _this5.setState({ error: error.message });
    });

    this.on('upload-error', function (file, error) {
      _this5.setFileState(file.id, { error: error.message });
      _this5.setState({ error: error.message });

      var message = _this5.i18n('failedToUpload', { file: file.name });
      if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error.message) {
        message = { message: message, details: error.message };
      }
      _this5.info(message, 'error', 5000);
    });

    this.on('upload', function () {
      _this5.setState({ error: null });
    });

    this.on('upload-started', function (file, upload) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });

    // upload progress events can occur frequently, especially when you have a good
    // connection to the remote server. Therefore, we are throtteling them to
    // prevent accessive function calls.
    // see also: https://github.com/tus/tus-js-client/commit/9940f27b2361fd7e10ba58b09b60d82422183bbb
    // const _throttledCalculateProgress = throttle(this._calculateProgress, 100, { leading: true, trailing: true })

    this.on('upload-progress', this._calculateProgress);

    this.on('upload-success', function (file, uploadResp, uploadURL) {
      var currentProgress = _this5.getFile(file.id).progress;
      _this5.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        uploadURL: uploadURL,
        isPaused: false
      });

      _this5._calculateTotalProgress();
    });

    this.on('preprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });

    this.on('preprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this5.setState({ files: files });
    });

    this.on('postprocess-progress', function (file, progress) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      _this5.setFileState(file.id, {
        progress: _extends({}, _this5.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });

    this.on('postprocess-complete', function (file) {
      if (!_this5.getFile(file.id)) {
        _this5.log('Not setting progress for a file that has been removed: ' + file.id);
        return;
      }
      var files = _extends({}, _this5.getState().files);
      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess;
      // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this5.setState({ files: files });
    });

    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this5._calculateTotalProgress();
    });

    // show informer if offline
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function () {
        return _this5.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this5.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this5.updateOnlineStatus();
      }, 3000);
    }
  };

  Uppy.prototype.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;
    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');
      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  Uppy.prototype.getID = function getID() {
    return this.opts.id;
  };

  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @return {Object} self for chaining
   */

  Uppy.prototype.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = 'Expected a plugin class, but got ' + (Plugin === null ? 'null' : typeof Plugin === 'undefined' ? 'undefined' : _typeof(Plugin)) + '.' + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    }

    // Instantiate
    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);
    if (existsPluginAlready) {
      var _msg = 'Already found a plugin named \'' + existsPluginAlready.id + '\'. ' + ('Tried to use: \'' + pluginId + '\'.\n') + 'Uppy plugins must have unique \'id\' options. See https://uppy.io/docs/plugins/#id.';
      throw new Error(_msg);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();

    return this;
  };

  /**
   * Find one Plugin by name.
   *
   * @param {string} name description
   * @return {object | boolean}
   */

  Uppy.prototype.getPlugin = function getPlugin(name) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      var pluginName = plugin.id;
      if (pluginName === name) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  };

  /**
   * Iterate through all `use`d plugins.
   *
   * @param {function} method that will be run on each plugin
   */

  Uppy.prototype.iteratePlugins = function iteratePlugins(method) {
    var _this6 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this6.plugins[pluginType].forEach(method);
    });
  };

  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */

  Uppy.prototype.removePlugin = function removePlugin(instance) {
    this.log('Removing plugin ' + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);
    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  };

  /**
   * Uninstall all plugins and close down this Uppy instance.
   */

  Uppy.prototype.close = function close() {
    var _this7 = this;

    this.log('Closing Uppy instance ' + this.opts.id + ': removing all files and uninstalling plugins');

    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this7.removePlugin(plugin);
    });
  };

  /**
  * Set info message in `state.info`, so that UI plugins like `Informer`
  * can display the message.
  *
  * @param {string | object} message Message to be displayed by the informer
  * @param {string} [type]
  * @param {number} [duration]
  */

  Uppy.prototype.info = function info(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;

    var isComplexMessage = (typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object';

    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });

    this.emit('info-visible');

    clearTimeout(this.infoTimeoutID);
    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    }

    // hide the informer after `duration` milliseconds
    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  Uppy.prototype.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });
    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  };

  /**
   * Logs stuff to console, only if `debug` is set to true. Silent in production.
   *
   * @param {String|Object} msg to log
   * @param {String} [type] optional `error` or `warning`
   */

  Uppy.prototype.log = function log(msg, type) {
    if (!this.opts.debug) {
      return;
    }

    var message = '[Uppy] [' + getTimeStamp() + '] ' + msg;

    window['uppyLog'] = window['uppyLog'] + '\n' + 'DEBUG LOG: ' + msg;

    if (type === 'error') {
      console.error(message);
      return;
    }

    if (type === 'warning') {
      console.warn(message);
      return;
    }

    if (msg === '' + msg) {
      console.log(message);
    } else {
      message = '[Uppy] [' + getTimeStamp() + ']';
      console.log(message);
      console.dir(msg);
    }
  };

  /**
   * Obsolete, event listeners are now added in the constructor.
   */

  Uppy.prototype.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  };

  /**
   * Restore an upload by its ID.
   */

  Uppy.prototype.restore = function restore(uploadID) {
    this.log('Core: attempting to restore upload "' + uploadID + '"');

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);
      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  };

  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @return {string} ID of this upload.
   */

  Uppy.prototype._createUpload = function _createUpload(fileIDs) {
    var _extends4;

    var uploadID = cuid();

    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });

    this.setState({
      currentUploads: _extends({}, this.getState().currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });

    return uploadID;
  };

  Uppy.prototype._getUpload = function _getUpload(uploadID) {
    return this.getState().currentUploads[uploadID];
  };

  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */

  Uppy.prototype.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log('Not setting result for an upload that has been removed: ' + uploadID);
      return;
    }
    var currentUploads = this.getState().currentUploads;
    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });
    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  };

  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */

  Uppy.prototype._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);
    delete currentUploads[uploadID];

    this.setState({
      currentUploads: currentUploads
    });
  };

  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */

  Uppy.prototype._runUpload = function _runUpload(uploadID) {
    var _this8 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var fileIDs = uploadData.fileIDs;
    var restoreStep = uploadData.step;

    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _getState5 = _this8.getState(),
            currentUploads = _getState5.currentUploads;

        var currentUpload = _extends({}, currentUploads[uploadID], {
          step: step
        });
        _this8.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = currentUpload, _extends6))
        });
        // TODO give this the `currentUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters
        return fn(fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    });

    // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.
    lastStep.catch(function (err) {
      _this8.emit('error', err, uploadID);

      _this8._removeUpload(uploadID);
    });

    return lastStep.then(function () {
      var files = fileIDs.map(function (fileID) {
        return _this8.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return file && !file.error;
      });
      var failed = files.filter(function (file) {
        return file && file.error;
      });
      _this8.addResultData(uploadID, { successful: successful, failed: failed, uploadID: uploadID });

      var _getState6 = _this8.getState(),
          currentUploads = _getState6.currentUploads;

      if (!currentUploads[uploadID]) {
        _this8.log('Not setting result for an upload that has been removed: ' + uploadID);
        return;
      }

      var result = currentUploads[uploadID].result;
      _this8.emit('complete', result);

      _this8._removeUpload(uploadID);

      return result;
    });
  };

  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @return {Promise}
   */

  Uppy.prototype.upload = function upload() {
    var _this9 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && (typeof onBeforeUploadResult === 'undefined' ? 'undefined' : _typeof(onBeforeUploadResult)) === 'object') {
      // warning after the change in 0.24
      if (onBeforeUploadResult.then) {
        throw new TypeError('onBeforeUpload() returned a Promise, but this is no longer supported. It must be synchronous.');
      }

      files = onBeforeUploadResult;
    }

    return Promise.resolve().then(function () {
      return _this9._checkMinNumberOfFiles(files);
    }).then(function () {
      var _getState7 = _this9.getState(),
          currentUploads = _getState7.currentUploads;
      // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);

      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this9.getFile(fileID);
        // if the file hasn't started uploading and hasn't already been assigned to an upload..
        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this9._createUpload(waitingFileIDs);
      return _this9._runUpload(uploadID);
    }).catch(function (err) {
      var message = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.message : err;
      var details = (typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err.details : null;
      _this9.log(message + ' ' + details);
      _this9.info({ message: message, details: details }, 'error', 4000);
      return Promise.reject((typeof err === 'undefined' ? 'undefined' : _typeof(err)) === 'object' ? err : new Error(err));
    });
  };

  _createClass(Uppy, [{
    key: 'state',
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

module.exports = function (opts) {
  return new Uppy(opts);
};

// Expose class constructor.
module.exports.Uppy = Uppy;
module.exports.Plugin = Plugin;

},{"./../../store-default":31,"./../../utils/lib/Translator":33,"./../../utils/lib/generateFileID":36,"./../../utils/lib/getFileNameAndExtension":38,"./../../utils/lib/getFileType":39,"./../../utils/lib/getTimeStamp":42,"./../../utils/lib/isObjectURL":44,"./Plugin":21,"cuid":2,"mime-match":7,"namespace-emitter":8,"prettier-bytes":10}],23:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var toArray = require('./../../utils/lib/toArray');
var Translator = require('./../../utils/lib/Translator');

var _require2 = require('preact'),
    h = _require2.h;

module.exports = function (_Plugin) {
  _inherits(FileInput, _Plugin);

  function FileInput(uppy, opts) {
    _classCallCheck(this, FileInput);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'FileInput';
    _this.title = 'File Input';
    _this.type = 'acquirer';

    var defaultLocale = {
      strings: {
        chooseFiles: 'Choose files'

        // Default options
      } };var defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]',
      locale: defaultLocale

      // Merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.locale = _extends({}, defaultLocale, _this.opts.locale);
    _this.locale.strings = _extends({}, defaultLocale.strings, _this.opts.locale.strings);

    // i18n
    _this.translator = new Translator({ locale: _this.locale });
    _this.i18n = _this.translator.translate.bind(_this.translator);

    _this.render = _this.render.bind(_this);
    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  FileInput.prototype.handleInputChange = function handleInputChange(ev) {
    var _this2 = this;

    this.uppy.log('[FileInput] Something selected through input...');

    var files = toArray(ev.target.files);

    files.forEach(function (file) {
      try {
        _this2.uppy.addFile({
          source: _this2.id,
          name: file.name,
          type: file.type,
          data: file
        });
      } catch (err) {
        // Nothing, restriction errors handled in Core
      }
    });
  };

  FileInput.prototype.handleClick = function handleClick(ev) {
    this.input.click();
  };

  FileInput.prototype.render = function render(state) {
    var _this3 = this;

    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    var hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };

    var restrictions = this.uppy.opts.restrictions;

    // empty value="" on file input, so that the input is cleared after a file is selected,
    // because Uppy will be handling the upload and so we can select same file
    // after removing — otherwise browser thinks it’s already selected
    return h('div', { 'class': 'uppy-Root uppy-FileInput-container' }, h('input', { 'class': 'uppy-FileInput-input',
      style: this.opts.pretty && hiddenInputStyle,
      type: 'file',
      name: this.opts.inputName,
      onchange: this.handleInputChange,
      multiple: restrictions.maxNumberOfFiles !== 1,
      accept: restrictions.allowedFileTypes,
      ref: function ref(input) {
        _this3.input = input;
      },
      value: '' }), this.opts.pretty && h('button', { 'class': 'uppy-FileInput-btn', type: 'button', onclick: this.handleClick }, this.i18n('chooseFiles')));
  };

  FileInput.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  FileInput.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return FileInput;
}(Plugin);

},{"./../../core":22,"./../../utils/lib/Translator":33,"./../../utils/lib/toArray":50,"preact":9}],24:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var RequestClient = require('./RequestClient');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = function (_RequestClient) {
  _inherits(Provider, _RequestClient);

  function Provider(uppy, opts) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, _RequestClient.call(this, uppy, opts));

    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.tokenKey = 'uppy-server-' + _this.id + '-auth-token';
    return _this;
  }

  // @todo(i.olarewaju) consider whether or not this method should be exposed
  Provider.prototype.setAuthToken = function setAuthToken(token) {
    // @todo(i.olarewaju) add fallback for OOM storage
    localStorage.setItem(this.tokenKey, token);
  };

  Provider.prototype.checkAuth = function checkAuth() {
    return this.get(this.id + '/authorized').then(function (payload) {
      return payload.authenticated;
    });
  };

  Provider.prototype.authUrl = function authUrl() {
    return this.hostname + '/' + this.id + '/connect';
  };

  Provider.prototype.fileUrl = function fileUrl(id) {
    return this.hostname + '/' + this.id + '/get/' + id;
  };

  Provider.prototype.list = function list(directory) {
    return this.get(this.id + '/list/' + (directory || ''));
  };

  Provider.prototype.logout = function logout() {
    var _this2 = this;

    var redirect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.href;

    return this.get(this.id + '/logout?redirect=' + redirect).then(function (res) {
      localStorage.removeItem(_this2.tokenKey);
      return res;
    });
  };

  Provider.initPlugin = function initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];
    if (defaultOpts) {
      plugin.opts = _extends({}, defaultOpts, opts);
    }
    if (opts.serverPattern) {
      var pattern = opts.serverPattern;
      // validate serverPattern param
      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(plugin.id + ': the option "serverPattern" must be one of string, Array, RegExp');
      }
      plugin.opts.serverPattern = pattern;
    } else {
      // does not start with https://
      if (/^(?!https?:\/\/).*$/.test(opts.serverUrl)) {
        plugin.opts.serverPattern = location.protocol + '//' + opts.serverUrl.replace(/^\/\//, '');
      } else {
        plugin.opts.serverPattern = opts.serverUrl;
      }
    }
  };

  _createClass(Provider, [{
    key: 'defaultHeaders',
    get: function get() {
      return _extends({}, _RequestClient.prototype.defaultHeaders, { 'uppy-auth-token': localStorage.getItem(this.tokenKey) });
    }
  }]);

  return Provider;
}(RequestClient);

},{"./RequestClient":25}],25:[function(require,module,exports){
'use strict';

// Remove the trailing slash so we can always safely append /xyz.

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = function () {
  function RequestClient(uppy, opts) {
    _classCallCheck(this, RequestClient);

    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
  }

  RequestClient.prototype.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var uppyServer = state.uppyServer || {};
    var host = this.opts.serverUrl;
    var headers = response.headers;
    // Store the self-identified domain name for the uppy-server we just hit.
    if (headers.has('i-am') && headers.get('i-am') !== uppyServer[host]) {
      var _extends2;

      this.uppy.setState({
        uppyServer: _extends({}, uppyServer, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }
    return response;
  };

  RequestClient.prototype._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }
    return this.hostname + '/' + url;
  };

  RequestClient.prototype.get = function get(path) {
    var _this = this;

    return fetch(this._getUrl(path), {
      method: 'get',
      headers: this.headers
    })
    // @todo validate response status before calling json
    .then(this.onReceiveResponse).then(function (res) {
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not get ' + _this._getUrl(path) + '. ' + err);
    });
  };

  RequestClient.prototype.post = function post(path, data) {
    var _this2 = this;

    return fetch(this._getUrl(path), {
      method: 'post',
      headers: this.headers,
      body: JSON.stringify(data)
    }).then(this.onReceiveResponse).then(function (res) {
      if (res.status < 200 || res.status > 300) {
        throw new Error('Could not post ' + _this2._getUrl(path) + '. ' + res.statusText);
      }
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not post ' + _this2._getUrl(path) + '. ' + err);
    });
  };

  RequestClient.prototype.delete = function _delete(path, data) {
    var _this3 = this;

    return fetch(this.hostname + '/' + path, {
      method: 'delete',
      headers: this.headers,
      body: data ? JSON.stringify(data) : null
    }).then(this.onReceiveResponse)
    // @todo validate response status before calling json
    .then(function (res) {
      return res.json();
    }).catch(function (err) {
      throw new Error('Could not delete ' + _this3._getUrl(path) + '. ' + err);
    });
  };

  _createClass(RequestClient, [{
    key: 'hostname',
    get: function get() {
      var _uppy$getState = this.uppy.getState(),
          uppyServer = _uppy$getState.uppyServer;

      var host = this.opts.serverUrl;
      return stripSlash(uppyServer && uppyServer[host] ? uppyServer[host] : host);
    }
  }, {
    key: 'defaultHeaders',
    get: function get() {
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }, {
    key: 'headers',
    get: function get() {
      return _extends({}, this.defaultHeaders, this.opts.serverHeaders || {});
    }
  }]);

  return RequestClient;
}();

},{}],26:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var ee = require('namespace-emitter');

module.exports = function () {
  function UppySocket(opts) {
    var _this = this;

    _classCallCheck(this, UppySocket);

    this.queued = [];
    this.isOpen = false;
    this.socket = new WebSocket(opts.target);
    this.emitter = ee();

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this.queued.length > 0 && _this.isOpen) {
        var first = _this.queued[0];
        _this.send(first.action, first.payload);
        _this.queued = _this.queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this._handleMessage = this._handleMessage.bind(this);

    this.socket.onmessage = this._handleMessage;

    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);
  }

  UppySocket.prototype.close = function close() {
    return this.socket.close();
  };

  UppySocket.prototype.send = function send(action, payload) {
    // attach uuid

    if (!this.isOpen) {
      this.queued.push({ action: action, payload: payload });
      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  UppySocket.prototype.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  UppySocket.prototype.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  UppySocket.prototype.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  UppySocket.prototype._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":8}],27:[function(require,module,exports){
'use-strict';
/**
 * Manages communications with Uppy Server
 */

var RequestClient = require('./RequestClient');
var Provider = require('./Provider');
var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":24,"./RequestClient":25,"./Socket":26}],28:[function(require,module,exports){
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var throttle = require('lodash.throttle');
var classNames = require('classnames');
var statusBarStates = require('./StatusBarStates');

var _require = require('preact'),
    h = _require.h;

function calculateProcessingProgress(files) {
  // Collect pre or postprocessing progress states.
  var progresses = [];
  Object.keys(files).forEach(function (fileID) {
    var progress = files[fileID].progress;

    if (progress.preprocess) {
      progresses.push(progress.preprocess);
    }
    if (progress.postprocess) {
      progresses.push(progress.postprocess);
    }
  });

  // In the future we should probably do this differently. For now we'll take the
  // mode and message from the first file…
  var _progresses$ = progresses[0],
      mode = _progresses$.mode,
      message = _progresses$.message;

  var value = progresses.filter(isDeterminate).reduce(function (total, progress, index, all) {
    return total + progress.value / all.length;
  }, 0);
  function isDeterminate(progress) {
    return progress.mode === 'determinate';
  }

  return {
    mode: mode,
    message: message,
    value: value
  };
}

function togglePauseResume(props) {
  if (props.isAllComplete) return;

  if (!props.resumableUploads) {
    return props.cancelAll();
  }

  if (props.isAllPaused) {
    return props.resumeAll();
  }

  return props.pauseAll();
}

module.exports = function (props) {
  props = props || {};

  var uploadState = props.uploadState;

  var progressValue = props.totalProgress;
  var progressMode = void 0;
  var progressBarContent = void 0;

  if (uploadState === statusBarStates.STATE_PREPROCESSING || uploadState === statusBarStates.STATE_POSTPROCESSING) {
    var progress = calculateProcessingProgress(props.files);
    progressMode = progress.mode;
    if (progressMode === 'determinate') {
      progressValue = progress.value * 100;
    }

    progressBarContent = ProgressBarProcessing(progress);
  } else if (uploadState === statusBarStates.STATE_COMPLETE) {
    progressBarContent = ProgressBarComplete(props);
  } else if (uploadState === statusBarStates.STATE_UPLOADING) {
    progressBarContent = ProgressBarUploading(props);
  } else if (uploadState === statusBarStates.STATE_ERROR) {
    progressValue = undefined;
    progressBarContent = ProgressBarError(props);
  }

  var width = typeof progressValue === 'number' ? progressValue : 100;
  var isHidden = uploadState === statusBarStates.STATE_WAITING && props.hideUploadButton || uploadState === statusBarStates.STATE_WAITING && !props.newFiles > 0 || uploadState === statusBarStates.STATE_COMPLETE && props.hideAfterFinish;

  var progressClassNames = 'uppy-StatusBar-progress\n                           ' + (progressMode ? 'is-' + progressMode : '');

  var statusBarClassNames = classNames('uppy', 'uppy-StatusBar', 'is-' + uploadState, { 'uppy-StatusBar--detailedProgress': props.showProgressDetails });

  return h('div', { 'class': statusBarClassNames, 'aria-hidden': isHidden }, h('div', { 'class': progressClassNames,
    style: { width: width + '%' },
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': progressValue }), progressBarContent, h('div', { 'class': 'uppy-StatusBar-actions' }, props.newFiles && !props.hideUploadButton ? h(UploadBtn, _extends({}, props, { uploadState: uploadState })) : null, props.error && !props.hideRetryButton ? h(RetryBtn, props) : null, !props.hidePauseResumeCancelButtons && uploadState !== statusBarStates.STATE_WAITING && uploadState !== statusBarStates.STATE_COMPLETE ? h(CancelBtn, props) : null));
};

var UploadBtn = function UploadBtn(props) {
  var uploadBtnClassNames = classNames('uppy-u-reset', 'uppy-c-btn', 'uppy-StatusBar-actionBtn', 'uppy-StatusBar-actionBtn--upload', { 'uppy-c-btn-primary': props.uploadState === statusBarStates.STATE_WAITING });

  return h('button', { type: 'button',
    'class': uploadBtnClassNames,
    'aria-label': props.i18n('uploadXFiles', { smart_count: props.newFiles }),
    onclick: props.startUpload }, props.newFiles && props.uploadStarted ? props.i18n('uploadXNewFiles', { smart_count: props.newFiles }) : props.i18n('uploadXFiles', { smart_count: props.newFiles }));
};

var RetryBtn = function RetryBtn(props) {
  return h('button', { type: 'button',
    'class': 'uppy-u-reset uppy-c-btn uppy-StatusBar-actionBtn uppy-StatusBar-actionBtn--retry',
    'aria-label': props.i18n('retryUpload'),
    onclick: props.retryAll }, props.i18n('retry'));
};

var CancelBtn = function CancelBtn(props) {
  return h('button', { type: 'button',
    'class': 'uppy-u-reset uppy-c-btn uppy-StatusBar-actionBtn uppy-StatusBar-actionBtn--cancel',
    'aria-label': props.i18n('cancel'),
    onclick: props.cancelAll }, props.i18n('cancel'));
};

var PauseResumeButtons = function PauseResumeButtons(props) {
  var resumableUploads = props.resumableUploads,
      isAllPaused = props.isAllPaused,
      i18n = props.i18n;

  var title = resumableUploads ? isAllPaused ? i18n('resumeUpload') : i18n('pauseUpload') : i18n('cancelUpload');

  return h('button', { title: title, 'class': 'uppy-u-reset uppy-StatusBar-statusIndicator', type: 'button', onclick: function onclick() {
      return togglePauseResume(props);
    } }, resumableUploads ? isAllPaused ? h('svg', { 'aria-hidden': 'true', 'class': 'UppyIcon', width: '15', height: '17', viewBox: '0 0 11 13' }, h('path', { d: 'M1.26 12.534a.67.67 0 0 1-.674.012.67.67 0 0 1-.336-.583v-11C.25.724.38.5.586.382a.658.658 0 0 1 .673.012l9.165 5.5a.66.66 0 0 1 .325.57.66.66 0 0 1-.325.573l-9.166 5.5z' })) : h('svg', { 'aria-hidden': 'true', 'class': 'UppyIcon', width: '16', height: '17', viewBox: '0 0 12 13' }, h('path', { d: 'M4.888.81v11.38c0 .446-.324.81-.722.81H2.722C2.324 13 2 12.636 2 12.19V.81c0-.446.324-.81.722-.81h1.444c.398 0 .722.364.722.81zM9.888.81v11.38c0 .446-.324.81-.722.81H7.722C7.324 13 7 12.636 7 12.19V.81c0-.446.324-.81.722-.81h1.444c.398 0 .722.364.722.81z' })) : h('svg', { 'aria-hidden': 'true', 'class': 'UppyIcon', width: '16px', height: '16px', viewBox: '0 0 19 19' }, h('path', { d: 'M17.318 17.232L9.94 9.854 9.586 9.5l-.354.354-7.378 7.378h.707l-.62-.62v.706L9.318 9.94l.354-.354-.354-.354L1.94 1.854v.707l.62-.62h-.706l7.378 7.378.354.354.354-.354 7.378-7.378h-.707l.622.62v-.706L9.854 9.232l-.354.354.354.354 7.378 7.378.708-.707-7.38-7.378v.708l7.38-7.38.353-.353-.353-.353-.622-.622-.353-.353-.354.352-7.378 7.38h.708L2.56 1.23 2.208.88l-.353.353-.622.62-.353.355.352.353 7.38 7.38v-.708l-7.38 7.38-.353.353.352.353.622.622.353.353.354-.353 7.38-7.38h-.708l7.38 7.38z' })));
};

var ProgressBarProcessing = function ProgressBarProcessing(props) {
  var value = Math.round(props.value * 100);

  return h('div', { 'class': 'uppy-StatusBar-content' }, props.mode === 'determinate' ? value + '% \xB7 ' : '', props.message);
};

var progressDetails = function progressDetails(props) {
  return h('span', { 'class': 'uppy-StatusBar-statusSecondary' }, props.inProgress > 1 && props.i18n('filesUploadedOfTotal', { complete: props.complete, smart_count: props.inProgress }) + ' \xB7 ', props.i18n('dataUploadedOfTotal', { complete: props.totalUploadedSize, total: props.totalSize }) + ' \xB7 ', props.i18n('xTimeLeft', { time: props.totalETA }));
};

var ThrottledProgressDetails = throttle(progressDetails, 500, { leading: true, trailing: true });

var ProgressBarUploading = function ProgressBarUploading(props) {
  if (!props.isUploadStarted || props.isAllComplete) {
    return null;
  }

  var title = props.isAllPaused ? props.i18n('paused') : props.i18n('uploading');

  return h('div', { 'class': 'uppy-StatusBar-content', 'aria-label': title, title: title }, !props.hidePauseResumeCancelButtons && h(PauseResumeButtons, props), h('div', { 'class': 'uppy-StatusBar-status' }, h('span', { 'class': 'uppy-StatusBar-statusPrimary' }, title, ': ', props.totalProgress, '%'), h('br', null), !props.isAllPaused && h(ThrottledProgressDetails, props)));
};

var ProgressBarComplete = function ProgressBarComplete(_ref) {
  var totalProgress = _ref.totalProgress,
      i18n = _ref.i18n;

  return h('div', { 'class': 'uppy-StatusBar-content', role: 'status', title: i18n('complete') }, h('svg', { 'aria-hidden': 'true', 'class': 'uppy-StatusBar-statusIndicator UppyIcon', width: '18', height: '17', viewBox: '0 0 23 17' }, h('path', { d: 'M8.944 17L0 7.865l2.555-2.61 6.39 6.525L20.41 0 23 2.645z' })), i18n('complete'));
};

var ProgressBarError = function ProgressBarError(_ref2) {
  var error = _ref2.error,
      retryAll = _ref2.retryAll,
      hideRetryButton = _ref2.hideRetryButton,
      i18n = _ref2.i18n;

  return h('div', { 'class': 'uppy-StatusBar-content', role: 'alert' }, h('strong', { 'class': 'uppy-StatusBar-contentPadding' }, i18n('uploadFailed'), '.'), !hideRetryButton && h('span', { 'class': 'uppy-StatusBar-contentPadding' }, i18n('pleasePressRetry')), h('span', { 'class': 'uppy-StatusBar-details',
    'aria-label': error,
    'data-microtip-position': 'top',
    'data-microtip-size': 'large',
    role: 'tooltip' }, '?'));
};

},{"./StatusBarStates":29,"classnames":1,"lodash.throttle":6,"preact":9}],29:[function(require,module,exports){
module.exports = {
  'STATE_ERROR': 'error',
  'STATE_WAITING': 'waiting',
  'STATE_PREPROCESSING': 'preprocessing',
  'STATE_UPLOADING': 'uploading',
  'STATE_POSTPROCESSING': 'postprocessing',
  'STATE_COMPLETE': 'complete'
};

},{}],30:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var Translator = require('./../../utils/lib/Translator');
var StatusBarUI = require('./StatusBar');
var statusBarStates = require('./StatusBarStates');
var getSpeed = require('./../../utils/lib/getSpeed');
var getBytesRemaining = require('./../../utils/lib/getBytesRemaining');
var prettyETA = require('./../../utils/lib/prettyETA');
var prettyBytes = require('prettier-bytes');

/**
 * StatusBar: renders a status bar with upload/pause/resume/cancel/retry buttons,
 * progress percentage and time remaining.
 */
module.exports = function (_Plugin) {
  _inherits(StatusBar, _Plugin);

  function StatusBar(uppy, opts) {
    _classCallCheck(this, StatusBar);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = _this.opts.id || 'StatusBar';
    _this.title = 'StatusBar';
    _this.type = 'progressindicator';

    var defaultLocale = {
      strings: {
        uploading: 'Uploading',
        complete: 'Complete',
        uploadFailed: 'Upload failed',
        pleasePressRetry: 'Please press Retry to upload again',
        paused: 'Paused',
        error: 'Error',
        retry: 'Retry',
        cancel: 'Cancel',
        pressToRetry: 'Press to retry',
        retryUpload: 'Retry upload',
        resumeUpload: 'Resume upload',
        cancelUpload: 'Cancel upload',
        pauseUpload: 'Pause upload',
        filesUploadedOfTotal: {
          0: '%{complete} of %{smart_count} file uploaded',
          1: '%{complete} of %{smart_count} files uploaded'
        },
        dataUploadedOfTotal: '%{complete} of %{total}',
        xTimeLeft: '%{time} left',
        uploadXFiles: {
          0: 'Upload %{smart_count} file',
          1: 'Upload %{smart_count} files'
        },
        uploadXNewFiles: {
          0: 'Upload +%{smart_count} file',
          1: 'Upload +%{smart_count} files'
        }

        // set default options
      } };var defaultOptions = {
      target: 'body',
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeCancelButtons: false,
      showProgressDetails: false,
      locale: defaultLocale,
      hideAfterFinish: true

      // merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    _this.locale = _extends({}, defaultLocale, _this.opts.locale);
    _this.locale.strings = _extends({}, defaultLocale.strings, _this.opts.locale.strings);

    _this.translator = new Translator({ locale: _this.locale });
    _this.i18n = _this.translator.translate.bind(_this.translator);

    _this.startUpload = _this.startUpload.bind(_this);
    _this.render = _this.render.bind(_this);
    _this.install = _this.install.bind(_this);
    return _this;
  }

  StatusBar.prototype.getTotalSpeed = function getTotalSpeed(files) {
    var totalSpeed = 0;
    files.forEach(function (file) {
      totalSpeed = totalSpeed + getSpeed(file.progress);
    });
    return totalSpeed;
  };

  StatusBar.prototype.getTotalETA = function getTotalETA(files) {
    var totalSpeed = this.getTotalSpeed(files);
    if (totalSpeed === 0) {
      return 0;
    }

    var totalBytesRemaining = files.reduce(function (total, file) {
      return total + getBytesRemaining(file.progress);
    }, 0);

    return Math.round(totalBytesRemaining / totalSpeed * 10) / 10;
  };

  StatusBar.prototype.startUpload = function startUpload() {
    var _this2 = this;

    return this.uppy.upload().catch(function (err) {
      _this2.uppy.log(err.stack || err.message || err);
      // Ignore
    });
  };

  StatusBar.prototype.getUploadingState = function getUploadingState(isAllErrored, isAllComplete, files) {
    if (isAllErrored) {
      return statusBarStates.STATE_ERROR;
    }

    if (isAllComplete) {
      return statusBarStates.STATE_COMPLETE;
    }

    var state = statusBarStates.STATE_WAITING;
    var fileIDs = Object.keys(files);
    for (var i = 0; i < fileIDs.length; i++) {
      var progress = files[fileIDs[i]].progress;
      // If ANY files are being uploaded right now, show the uploading state.
      if (progress.uploadStarted && !progress.uploadComplete) {
        return statusBarStates.STATE_UPLOADING;
      }
      // If files are being preprocessed AND postprocessed at this time, we show the
      // preprocess state. If any files are being uploaded we show uploading.
      if (progress.preprocess && state !== statusBarStates.STATE_UPLOADING) {
        state = statusBarStates.STATE_PREPROCESSING;
      }
      // If NO files are being preprocessed or uploaded right now, but some files are
      // being postprocessed, show the postprocess state.
      if (progress.postprocess && state !== statusBarStates.STATE_UPLOADING && state !== statusBarStates.STATE_PREPROCESSING) {
        state = statusBarStates.STATE_POSTPROCESSING;
      }
    }
    return state;
  };

  StatusBar.prototype.render = function render(state) {
    var files = state.files;

    var uploadStartedFiles = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadStarted;
    });
    var newFiles = Object.keys(files).filter(function (file) {
      return !files[file].progress.uploadStarted && !files[file].progress.preprocess && !files[file].progress.postprocess;
    });
    var completeFiles = Object.keys(files).filter(function (file) {
      return files[file].progress.uploadComplete;
    });
    var erroredFiles = Object.keys(files).filter(function (file) {
      return files[file].error;
    });
    var inProgressFiles = Object.keys(files).filter(function (file) {
      return !files[file].progress.uploadComplete && files[file].progress.uploadStarted && !files[file].isPaused;
    });
    var processingFiles = Object.keys(files).filter(function (file) {
      return files[file].progress.preprocess || files[file].progress.postprocess;
    });

    var inProgressFilesArray = inProgressFiles.map(function (file) {
      return files[file];
    });

    var totalSpeed = prettyBytes(this.getTotalSpeed(inProgressFilesArray));
    var totalETA = prettyETA(this.getTotalETA(inProgressFilesArray));

    // total size and uploaded size
    var totalSize = 0;
    var totalUploadedSize = 0;
    inProgressFilesArray.forEach(function (file) {
      totalSize = totalSize + (file.progress.bytesTotal || 0);
      totalUploadedSize = totalUploadedSize + (file.progress.bytesUploaded || 0);
    });
    totalSize = prettyBytes(totalSize);
    totalUploadedSize = prettyBytes(totalUploadedSize);

    var isUploadStarted = uploadStartedFiles.length > 0;

    var isAllComplete = state.totalProgress === 100 && completeFiles.length === Object.keys(files).length && processingFiles.length === 0;

    var isAllErrored = isUploadStarted && erroredFiles.length === uploadStartedFiles.length;

    var isAllPaused = inProgressFiles.length === 0 && !isAllComplete && !isAllErrored && uploadStartedFiles.length > 0;

    var resumableUploads = state.capabilities.resumableUploads || false;

    return StatusBarUI({
      error: state.error,
      uploadState: this.getUploadingState(isAllErrored, isAllComplete, state.files || {}),
      totalProgress: state.totalProgress,
      totalSize: totalSize,
      totalUploadedSize: totalUploadedSize,
      uploadStarted: uploadStartedFiles.length,
      isAllComplete: isAllComplete,
      isAllPaused: isAllPaused,
      isAllErrored: isAllErrored,
      isUploadStarted: isUploadStarted,
      complete: completeFiles.length,
      newFiles: newFiles.length,
      inProgress: inProgressFiles.length,
      totalSpeed: totalSpeed,
      totalETA: totalETA,
      files: state.files,
      i18n: this.i18n,
      pauseAll: this.uppy.pauseAll,
      resumeAll: this.uppy.resumeAll,
      retryAll: this.uppy.retryAll,
      cancelAll: this.uppy.cancelAll,
      startUpload: this.startUpload,
      resumableUploads: resumableUploads,
      showProgressDetails: this.opts.showProgressDetails,
      hideUploadButton: this.opts.hideUploadButton,
      hideRetryButton: this.opts.hideRetryButton,
      hidePauseResumeCancelButtons: this.opts.hidePauseResumeCancelButtons,
      hideAfterFinish: this.opts.hideAfterFinish
    });
  };

  StatusBar.prototype.install = function install() {
    var target = this.opts.target;
    if (target) {
      this.mount(target, this);
    }
  };

  StatusBar.prototype.uninstall = function uninstall() {
    this.unmount();
  };

  return StatusBar;
}(Plugin);

},{"./../../core":22,"./../../utils/lib/Translator":33,"./../../utils/lib/getBytesRemaining":37,"./../../utils/lib/getSpeed":41,"./../../utils/lib/prettyETA":47,"./StatusBar":28,"./StatusBarStates":29,"prettier-bytes":10}],31:[function(require,module,exports){
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore = function () {
  function DefaultStore() {
    _classCallCheck(this, DefaultStore);

    this.state = {};
    this.callbacks = [];
  }

  DefaultStore.prototype.getState = function getState() {
    return this.state;
  };

  DefaultStore.prototype.setState = function setState(patch) {
    var prevState = _extends({}, this.state);
    var nextState = _extends({}, this.state, patch);

    this.state = nextState;
    this._publish(prevState, nextState, patch);
  };

  DefaultStore.prototype.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  DefaultStore.prototype._publish = function _publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(undefined, args);
    });
  };

  return DefaultStore;
}();

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{}],32:[function(require,module,exports){
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var tus = require('tus-js-client');

var _require2 = require('./../../server-utils'),
    Provider = _require2.Provider,
    RequestClient = _require2.RequestClient,
    Socket = _require2.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');
var getSocketHost = require('./../../utils/lib/getSocketHost');
var settle = require('./../../utils/lib/settle');
var limitPromises = require('./../../utils/lib/limitPromises');

// Extracted from https://github.com/tus/tus-js-client/blob/master/lib/upload.js#L13
// excepted we removed 'fingerprint' key to avoid adding more dependencies
var tusDefaultOptions = {
  endpoint: '',
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null

  /**
   * Create a wrapper around an event emitter with a `remove` method to remove
   * all events that were added using the wrapped emitter.
   */
};function createEventTracker(emitter) {
  var events = [];
  return {
    on: function on(event, fn) {
      events.push([event, fn]);
      return emitter.on(event, fn);
    },
    remove: function remove() {
      events.forEach(function (_ref) {
        var event = _ref[0],
            fn = _ref[1];

        emitter.off(event, fn);
      });
    }
  };
}

/**
 * Tus resumable file uploader
 *
 */
module.exports = function (_Plugin) {
  _inherits(Tus, _Plugin);

  function Tus(uppy, opts) {
    _classCallCheck(this, Tus);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.type = 'uploader';
    _this.id = 'Tus';
    _this.title = 'Tus';

    // set default options
    var defaultOptions = {
      resume: true,
      autoRetry: true,
      useFastRemoteRetry: true,
      limit: 0,
      retryDelays: [0, 1000, 3000, 5000]

      // merge default options with the ones set by user
    };_this.opts = _extends({}, defaultOptions, opts);

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (typeof _this.opts.limit === 'number' && _this.opts.limit !== 0) {
      _this.limitUploads = limitPromises(_this.opts.limit);
    } else {
      _this.limitUploads = function (fn) {
        return fn;
      };
    }

    _this.uploaders = Object.create(null);
    _this.uploaderEvents = Object.create(null);
    _this.uploaderSockets = Object.create(null);

    _this.handleResetProgress = _this.handleResetProgress.bind(_this);
    _this.handleUpload = _this.handleUpload.bind(_this);
    return _this;
  }

  Tus.prototype.handleResetProgress = function handleResetProgress() {
    var files = _extends({}, this.uppy.getState().files);
    Object.keys(files).forEach(function (fileID) {
      // Only clone the file object if it has a Tus `uploadUrl` attached.
      if (files[fileID].tus && files[fileID].tus.uploadUrl) {
        var tusState = _extends({}, files[fileID].tus);
        delete tusState.uploadUrl;
        files[fileID] = _extends({}, files[fileID], { tus: tusState });
      }
    });

    this.uppy.setState({ files: files });
  };

  /**
   * Clean up all references for a file's upload: the tus.Upload instance,
   * any events related to the file, and the uppy-server WebSocket connection.
   */

  Tus.prototype.resetUploaderReferences = function resetUploaderReferences(fileID) {
    if (this.uploaders[fileID]) {
      this.uploaders[fileID].abort();
      this.uploaders[fileID] = null;
    }
    if (this.uploaderEvents[fileID]) {
      this.uploaderEvents[fileID].remove();
      this.uploaderEvents[fileID] = null;
    }
    if (this.uploaderSockets[fileID]) {
      this.uploaderSockets[fileID].close();
      this.uploaderSockets[fileID] = null;
    }
  };

  /**
   * Create a new Tus upload
   *
   * @param {object} file for use with upload
   * @param {integer} current file in a queue
   * @param {integer} total number of files in a queue
   * @returns {Promise}
   */

  Tus.prototype.upload = function upload(file, current, total) {
    var _this2 = this;

    this.resetUploaderReferences(file.id);

    // Create a new tus upload
    return new Promise(function (resolve, reject) {
      var optsTus = _extends({}, tusDefaultOptions, _this2.opts,
      // Install file-specific upload overrides.
      file.tus || {});

      optsTus.onError = function (err) {
        _this2.uppy.log(err);
        _this2.uppy.emit('upload-error', file, err);
        err.message = 'Failed because: ' + err.message;

        _this2.resetUploaderReferences(file.id);
        reject(err);
      };

      optsTus.onProgress = function (bytesUploaded, bytesTotal) {
        _this2.onReceiveUploadUrl(file, upload.url);
        _this2.uppy.emit('upload-progress', file, {
          uploader: _this2,
          bytesUploaded: bytesUploaded,
          bytesTotal: bytesTotal
        });
      };

      optsTus.onSuccess = function () {
        _this2.uppy.emit('upload-success', file, upload, upload.url);

        if (upload.url) {
          _this2.uppy.log('Download ' + upload.file.name + ' from ' + upload.url);
        }

        _this2.resetUploaderReferences(file.id);
        resolve(upload);
      };

      var copyProp = function copyProp(obj, srcProp, destProp) {
        if (Object.prototype.hasOwnProperty.call(obj, srcProp) && !Object.prototype.hasOwnProperty.call(obj, destProp)) {
          obj[destProp] = obj[srcProp];
        }
      };

      // tusd uses metadata fields 'filetype' and 'filename'
      var meta = _extends({}, file.meta);
      copyProp(meta, 'type', 'filetype');
      copyProp(meta, 'name', 'filename');
      optsTus.metadata = meta;

      var upload = new tus.Upload(file.data, optsTus);
      _this2.uploaders[file.id] = upload;
      _this2.uploaderEvents[file.id] = createEventTracker(_this2.uppy);

      _this2.onFileRemove(file.id, function (targetFileID) {
        _this2.resetUploaderReferences(file.id);
        resolve('upload ' + targetFileID + ' was removed');
      });

      _this2.onPause(file.id, function (isPaused) {
        if (isPaused) {
          upload.abort();
        } else {
          upload.start();
        }
      });

      _this2.onPauseAll(file.id, function () {
        upload.abort();
      });

      _this2.onCancelAll(file.id, function () {
        _this2.resetUploaderReferences(file.id);
      });

      _this2.onResumeAll(file.id, function () {
        if (file.error) {
          upload.abort();
        }
        upload.start();
      });

      if (!file.isPaused) {
        upload.start();
      }
    });
  };

  Tus.prototype.uploadRemote = function uploadRemote(file, current, total) {
    var _this3 = this;

    this.resetUploaderReferences(file.id);

    var opts = _extends({}, this.opts,
    // Install file-specific upload overrides.
    file.tus || {});

    return new Promise(function (resolve, reject) {
      _this3.uppy.log(file.remote.url);
      if (file.serverToken) {
        return _this3.connectToServerSocket(file).then(function () {
          return resolve();
        }).catch(reject);
      }

      _this3.uppy.emit('upload-started', file);
      var Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      var client = new Client(_this3.uppy, file.remote.providerOptions);
      client.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        uploadUrl: opts.uploadUrl,
        protocol: 'tus',
        size: file.data.size,
        metadata: file.meta
      })).then(function (res) {
        _this3.uppy.setFileState(file.id, { serverToken: res.token });
        file = _this3.uppy.getFile(file.id);
        return file;
      }).then(function (file) {
        return _this3.connectToServerSocket(file);
      }).then(function () {
        resolve();
      }).catch(function (err) {
        reject(new Error(err));
      });
    });
  };

  Tus.prototype.connectToServerSocket = function connectToServerSocket(file) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var token = file.serverToken;
      var host = getSocketHost(file.remote.serverUrl);
      var socket = new Socket({ target: host + '/api/' + token });
      _this4.uploaderSockets[file.id] = socket;
      _this4.uploaderEvents[file.id] = createEventTracker(_this4.uppy);

      _this4.onFileRemove(file.id, function () {
        socket.send('pause', {});
        resolve('upload ' + file.id + ' was removed');
      });

      _this4.onPause(file.id, function (isPaused) {
        isPaused ? socket.send('pause', {}) : socket.send('resume', {});
      });

      _this4.onPauseAll(file.id, function () {
        return socket.send('pause', {});
      });

      _this4.onCancelAll(file.id, function () {
        return socket.send('pause', {});
      });

      _this4.onResumeAll(file.id, function () {
        if (file.error) {
          socket.send('pause', {});
        }
        socket.send('resume', {});
      });

      _this4.onRetry(file.id, function () {
        socket.send('pause', {});
        socket.send('resume', {});
      });

      _this4.onRetryAll(file.id, function () {
        socket.send('pause', {});
        socket.send('resume', {});
      });

      if (file.isPaused) {
        socket.send('pause', {});
      }

      socket.on('progress', function (progressData) {
        return emitSocketProgress(_this4, progressData, file);
      });

      socket.on('error', function (errData) {
        var message = errData.error.message;

        var error = _extends(new Error(message), { cause: errData.error });

        // If the remote retry optimisation should not be used,
        // close the socket—this will tell uppy-server to clear state and delete the file.
        if (!_this4.opts.useFastRemoteRetry) {
          _this4.resetUploaderReferences(file.id);
          // Remove the serverToken so that a new one will be created for the retry.
          _this4.uppy.setFileState(file.id, {
            serverToken: null
          });
        }

        _this4.uppy.emit('upload-error', file, error);
        reject(error);
      });

      socket.on('success', function (data) {
        _this4.uppy.emit('upload-success', file, data, data.url);
        _this4.resetUploaderReferences(file.id);
        resolve();
      });
    });
  };

  Tus.prototype.onReceiveUploadUrl = function onReceiveUploadUrl(file, uploadURL) {
    var currentFile = this.uppy.getFile(file.id);
    if (!currentFile) return;
    // Only do the update if we didn't have an upload URL yet,
    // or resume: false in options
    if ((!currentFile.tus || currentFile.tus.uploadUrl !== uploadURL) && this.opts.resume) {
      this.uppy.log('[Tus] Storing upload url');
      this.uppy.setFileState(currentFile.id, {
        tus: _extends({}, currentFile.tus, {
          uploadUrl: uploadURL
        })
      });
    }
  };

  Tus.prototype.onFileRemove = function onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', function (file) {
      if (fileID === file.id) cb(file.id);
    });
  };

  Tus.prototype.onPause = function onPause(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-pause', function (targetFileID, isPaused) {
      if (fileID === targetFileID) {
        // const isPaused = this.uppy.pauseResume(fileID)
        cb(isPaused);
      }
    });
  };

  Tus.prototype.onRetry = function onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', function (targetFileID) {
      if (fileID === targetFileID) {
        cb();
      }
    });
  };

  Tus.prototype.onRetryAll = function onRetryAll(fileID, cb) {
    var _this5 = this;

    this.uploaderEvents[fileID].on('retry-all', function (filesToRetry) {
      if (!_this5.uppy.getFile(fileID)) return;
      cb();
    });
  };

  Tus.prototype.onPauseAll = function onPauseAll(fileID, cb) {
    var _this6 = this;

    this.uploaderEvents[fileID].on('pause-all', function () {
      if (!_this6.uppy.getFile(fileID)) return;
      cb();
    });
  };

  Tus.prototype.onCancelAll = function onCancelAll(fileID, cb) {
    var _this7 = this;

    this.uploaderEvents[fileID].on('cancel-all', function () {
      if (!_this7.uppy.getFile(fileID)) return;
      cb();
    });
  };

  Tus.prototype.onResumeAll = function onResumeAll(fileID, cb) {
    var _this8 = this;

    this.uploaderEvents[fileID].on('resume-all', function () {
      if (!_this8.uppy.getFile(fileID)) return;
      cb();
    });
  };

  Tus.prototype.uploadFiles = function uploadFiles(files) {
    var _this9 = this;

    var actions = files.map(function (file, i) {
      var current = parseInt(i, 10) + 1;
      var total = files.length;

      if (file.error) {
        return function () {
          return Promise.reject(new Error(file.error));
        };
      } else if (file.isRemote) {
        // We emit upload-started here, so that it's also emitted for files
        // that have to wait due to the `limit` option.
        _this9.uppy.emit('upload-started', file);
        return _this9.uploadRemote.bind(_this9, file, current, total);
      } else {
        _this9.uppy.emit('upload-started', file);
        return _this9.upload.bind(_this9, file, current, total);
      }
    });

    var promises = actions.map(function (action) {
      var limitedAction = _this9.limitUploads(action);
      return limitedAction();
    });

    return settle(promises);
  };

  Tus.prototype.handleUpload = function handleUpload(fileIDs) {
    var _this10 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('Tus: no files to upload!');
      return Promise.resolve();
    }

    this.uppy.log('Tus is uploading...');
    var filesToUpload = fileIDs.map(function (fileID) {
      return _this10.uppy.getFile(fileID);
    });

    return this.uploadFiles(filesToUpload).then(function () {
      return null;
    });
  };

  Tus.prototype.install = function install() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: true
      })
    });
    this.uppy.addUploader(this.handleUpload);

    this.uppy.on('reset-progress', this.handleResetProgress);

    if (this.opts.autoRetry) {
      this.uppy.on('back-online', this.uppy.retryAll);
    }
  };

  Tus.prototype.uninstall = function uninstall() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: false
      })
    });
    this.uppy.removeUploader(this.handleUpload);

    if (this.opts.autoRetry) {
      this.uppy.off('back-online', this.uppy.retryAll);
    }
  };

  return Tus;
}(Plugin);

},{"./../../core":22,"./../../server-utils":27,"./../../utils/lib/emitSocketProgress":34,"./../../utils/lib/getSocketHost":40,"./../../utils/lib/limitPromises":45,"./../../utils/lib/settle":49,"tus-js-client":18}],33:[function(require,module,exports){
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 *
 * @param {object} opts
 */
module.exports = function () {
  function Translator(opts) {
    _classCallCheck(this, Translator);

    var defaultOptions = {
      locale: {
        strings: {},
        pluralize: function pluralize(n) {
          if (n === 1) {
            return 0;
          }
          return 1;
        }
      }
    };

    this.opts = _extends({}, defaultOptions, opts);
    this.locale = _extends({}, defaultOptions.locale, opts.locale);
  }

  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @return {string} interpolated
   */

  Translator.prototype.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;

    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          }

          // Interlace with the `replacement` value
          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  };

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @return {string} translated (and interpolated)
   */

  Translator.prototype.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  };

  /**
   * Get a translation and return the translated and interpolated parts as an array.
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @return {Array} The translated and interpolated parts, in order.
   */

  Translator.prototype.translateArray = function translateArray(key, options) {
    if (options && typeof options.smart_count !== 'undefined') {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.opts.locale.strings[key][plural], options);
    }

    return this.interpolate(this.opts.locale.strings[key], options);
  };

  return Translator;
}();

},{}],34:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log('Upload progress: ' + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, { leading: true, trailing: true });

},{"lodash.throttle":6}],35:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var isDOMElement = require('./isDOMElement');

/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @return {Node|null}
 */
module.exports = function findDOMElement(element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }

  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' && isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":43}],36:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {Object} file
 * @return {String} the fileID
 *
 */
module.exports = function generateFileID(file) {
  // filter is needed to not join empty values with `-`
  return ['uppy', file.name ? file.name.toLowerCase().replace(/[^A-Z0-9]/ig, '') : '', file.type, file.data.size, file.data.lastModified].filter(function (val) {
    return val;
  }).join('-');
};

},{}],37:[function(require,module,exports){
module.exports = function getBytesRemaining(fileProgress) {
  return fileProgress.bytesTotal - fileProgress.bytesUploaded;
};

},{}],38:[function(require,module,exports){
/**
* Takes a full filename string and returns an object {name, extension}
*
* @param {string} fullFileName
* @return {object} {name, extension}
*/
module.exports = function getFileNameAndExtension(fullFileName) {
  var re = /(?:\.([^.]+))?$/;
  var fileExt = re.exec(fullFileName)[1];
  var fileName = fullFileName.replace('.' + fileExt, '');
  return {
    name: fileName,
    extension: fileExt
  };
};

},{}],39:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');
var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;

  if (file.isRemote) {
    // some remote providers do not support file types
    return file.type ? file.type : mimeTypes[fileExtension];
  }

  // check if mime type is set in the file object
  if (file.type) {
    return file.type;
  }

  // see if we can map extension to a mime type
  if (fileExtension && mimeTypes[fileExtension]) {
    return mimeTypes[fileExtension];
  }

  // if all fails, well, return empty
  return null;
};

},{"./getFileNameAndExtension":38,"./mimeTypes":46}],40:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/;
  var host = regex.exec(url)[1];
  var socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws';

  return socketProtocol + '://' + host;
};

},{}],41:[function(require,module,exports){
module.exports = function getSpeed(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;

  var timeElapsed = new Date() - fileProgress.uploadStarted;
  var uploadSpeed = fileProgress.bytesUploaded / (timeElapsed / 1000);
  return uploadSpeed;
};

},{}],42:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
*/
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};

/**
 * Adds zero to strings shorter than two characters
*/
function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],43:[function(require,module,exports){
var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],44:[function(require,module,exports){
/**
 * Check if a URL string is an object URL from `URL.createObjectURL`.
 *
 * @param {string} url
 * @return {boolean}
 */
module.exports = function isObjectURL(url) {
  return url.indexOf('blob:') === 0;
};

},{}],45:[function(require,module,exports){
/**
 * Limit the amount of simultaneously pending Promises.
 * Returns a function that, when passed a function `fn`,
 * will make sure that at most `limit` calls to `fn` are pending.
 *
 * @param {number} limit
 * @return {function()}
 */
module.exports = function limitPromises(limit) {
  var pending = 0;
  var queue = [];
  return function (fn) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var call = function call() {
        pending++;
        var promise = fn.apply(undefined, args);
        promise.then(onfinish, onfinish);
        return promise;
      };

      if (pending >= limit) {
        return new Promise(function (resolve, reject) {
          queue.push(function () {
            call().then(resolve, reject);
          });
        });
      }
      return call();
    };
  };
  function onfinish() {
    pending--;
    var next = queue.shift();
    if (next) next();
  }
};

},{}],46:[function(require,module,exports){
module.exports = {
  'md': 'text/markdown',
  'markdown': 'text/markdown',
  'mp4': 'video/mp4',
  'mp3': 'audio/mp3',
  'svg': 'image/svg+xml',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'yaml': 'text/yaml',
  'yml': 'text/yaml',
  'csv': 'text/csv',
  'avi': 'video/x-msvideo',
  'mks': 'video/x-matroska',
  'mkv': 'video/x-matroska',
  'mov': 'video/quicktime',
  'doc': 'application/msword',
  'docm': 'application/vnd.ms-word.document.macroenabled.12',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'dot': 'application/msword',
  'dotm': 'application/vnd.ms-word.template.macroenabled.12',
  'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'xla': 'application/vnd.ms-excel',
  'xlam': 'application/vnd.ms-excel.addin.macroenabled.12',
  'xlc': 'application/vnd.ms-excel',
  'xlf': 'application/x-xliff+xml',
  'xlm': 'application/vnd.ms-excel',
  'xls': 'application/vnd.ms-excel',
  'xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlt': 'application/vnd.ms-excel',
  'xltm': 'application/vnd.ms-excel.template.macroenabled.12',
  'xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'xlw': 'application/vnd.ms-excel'
};

},{}],47:[function(require,module,exports){
var secondsToTime = require('./secondsToTime');

module.exports = function prettyETA(seconds) {
  var time = secondsToTime(seconds);

  // Only display hours and minutes if they are greater than 0 but always
  // display minutes if hours is being displayed
  // Display a leading zero if the there is a preceding unit: 1m 05s, but 5s
  var hoursStr = time.hours ? time.hours + 'h ' : '';
  var minutesVal = time.hours ? ('0' + time.minutes).substr(-2) : time.minutes;
  var minutesStr = minutesVal ? minutesVal + 'm ' : '';
  var secondsVal = minutesVal ? ('0' + time.seconds).substr(-2) : time.seconds;
  var secondsStr = secondsVal + 's';

  return '' + hoursStr + minutesStr + secondsStr;
};

},{"./secondsToTime":48}],48:[function(require,module,exports){
module.exports = function secondsToTime(rawSeconds) {
  var hours = Math.floor(rawSeconds / 3600) % 24;
  var minutes = Math.floor(rawSeconds / 60) % 60;
  var seconds = Math.floor(rawSeconds % 60);

  return { hours: hours, minutes: minutes, seconds: seconds };
};

},{}],49:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];
  function resolved(value) {
    resolutions.push(value);
  }
  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));

  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],50:[function(require,module,exports){
/**
 * Converts list into array
*/
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],51:[function(require,module,exports){
var Uppy = require('./../../../../packages/@uppy/core');
var FileInput = require('./../../../../packages/@uppy/file-input');
var StatusBar = require('./../../../../packages/@uppy/status-bar');
var Tus = require('./../../../../packages/@uppy/tus');

var uppyOne = new Uppy({ debug: true });
uppyOne.use(FileInput, { target: '.UppyInput', pretty: false }).use(Tus, { endpoint: '//master.tus.io/files/' }).use(StatusBar, { target: '.UppyInput-Progress', hideUploadButton: true });

},{"./../../../../packages/@uppy/core":22,"./../../../../packages/@uppy/file-input":23,"./../../../../packages/@uppy/status-bar":30,"./../../../../packages/@uppy/tus":32}]},{},[51])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL2ZpbmdlcnByaW50LmJyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9saWIvcGFkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJldHRpZXItYnl0ZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcmVzb2x2ZS11cmwvcmVzb2x2ZS11cmwuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvYmFzZTY0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL3JlcXVlc3QuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvc291cmNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL3N0b3JhZ2UuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Vycm9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9maW5nZXJwcmludC5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L3VwbG9hZC5qcyIsIi4uL25vZGVfbW9kdWxlcy93aWxkY2FyZC9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvbGliL1BsdWdpbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvbGliL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvZmlsZS1pbnB1dC9saWIvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zZXJ2ZXItdXRpbHMvbGliL1Byb3ZpZGVyLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc2VydmVyLXV0aWxzL2xpYi9SZXF1ZXN0Q2xpZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc2VydmVyLXV0aWxzL2xpYi9Tb2NrZXQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zZXJ2ZXItdXRpbHMvbGliL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9saWIvU3RhdHVzQmFyLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9saWIvU3RhdHVzQmFyU3RhdGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9saWIvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L2xpYi9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3R1cy9saWIvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvVHJhbnNsYXRvci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9lbWl0U29ja2V0UHJvZ3Jlc3MuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZmluZERPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZ2VuZXJhdGVGaWxlSUQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZ2V0Qnl0ZXNSZW1haW5pbmcuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24uanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZ2V0RmlsZVR5cGUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvZ2V0U29ja2V0SG9zdC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZXRTcGVlZC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9nZXRUaW1lU3RhbXAuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvaXNET01FbGVtZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL2lzT2JqZWN0VVJMLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL2xpbWl0UHJvbWlzZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9saWIvbWltZVR5cGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL3ByZXR0eUVUQS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi9zZWNvbmRzVG9UaW1lLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvbGliL3NldHRsZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL2xpYi90b0FycmF5LmpzIiwic3JjL2V4YW1wbGVzL3N0YXR1c2Jhci9hcHAuZXM2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNybEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LEdBQVQsQ0FBYSxVQUFVLE9BQVYsRUFBbUI7QUFDckQsV0FBTyxRQUFRLElBQVIsQ0FBYSxRQUFiLEVBQXVCLFFBQXZCLENBQVA7QUFDRCxHQUZzQixDQUFaLENBQVg7O0FBSUEsU0FBTyxLQUFLLElBQUwsQ0FBVSxZQUFZO0FBQzNCLFdBQU87QUFDTCxrQkFBWSxXQURQO0FBRUwsY0FBUTtBQUZILEtBQVA7QUFJRCxHQUxNLENBQVA7QUFNRCxDQXBCRDs7O0FDQUE7OztBQUdBLE9BQU8sT0FBUCxHQUFpQixTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUI7QUFDdEMsU0FBTyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsUUFBUSxFQUFuQyxFQUF1QyxDQUF2QyxDQUFQO0FBQ0QsQ0FGRDs7O0FDSEEsSUFBTSxPQUFPLFFBQVEsWUFBUixDQUFiO0FBQ0EsSUFBTSxZQUFZLFFBQVEsa0JBQVIsQ0FBbEI7QUFDQSxJQUFNLFlBQVksUUFBUSxrQkFBUixDQUFsQjtBQUNBLElBQU0sTUFBTSxRQUFRLFdBQVIsQ0FBWjs7QUFFQSxJQUFNLFVBQVUsSUFBSSxJQUFKLENBQVMsRUFBQyxPQUFPLElBQVIsRUFBVCxDQUFoQjtBQUNBLFFBQ0csR0FESCxDQUNPLFNBRFAsRUFDa0IsRUFBRSxRQUFRLFlBQVYsRUFBd0IsUUFBUSxLQUFoQyxFQURsQixFQUVHLEdBRkgsQ0FFTyxHQUZQLEVBRVksRUFBRSxVQUFVLHdCQUFaLEVBRlosRUFHRyxHQUhILENBR08sU0FIUCxFQUdrQixFQUFFLFFBQVEscUJBQVYsRUFBaUMsa0JBQWtCLElBQW5ELEVBSGxCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyohXG4gIENvcHlyaWdodCAoYykgMjAxNyBKZWQgV2F0c29uLlxuICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHNlZVxuICBodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG4qL1xuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGhhc093biA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXHRcdHZhciBjbGFzc2VzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoYXJnVHlwZSA9PT0gJ3N0cmluZycgfHwgYXJnVHlwZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGFyZyk7XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSAmJiBhcmcubGVuZ3RoKSB7XG5cdFx0XHRcdHZhciBpbm5lciA9IGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblx0XHRcdFx0aWYgKGlubmVyKSB7XG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGlubmVyKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhcmdUeXBlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG5cdFx0XHRcdFx0aWYgKGhhc093bi5jYWxsKGFyZywga2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0Y2xhc3NOYW1lcy5kZWZhdWx0ID0gY2xhc3NOYW1lcztcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIHJlZ2lzdGVyIGFzICdjbGFzc25hbWVzJywgY29uc2lzdGVudCB3aXRoIG5wbSBwYWNrYWdlIG5hbWVcblx0XHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmNsYXNzTmFtZXMgPSBjbGFzc05hbWVzO1xuXHR9XG59KCkpO1xuIiwiLyoqXG4gKiBjdWlkLmpzXG4gKiBDb2xsaXNpb24tcmVzaXN0YW50IFVJRCBnZW5lcmF0b3IgZm9yIGJyb3dzZXJzIGFuZCBub2RlLlxuICogU2VxdWVudGlhbCBmb3IgZmFzdCBkYiBsb29rdXBzIGFuZCByZWNlbmN5IHNvcnRpbmcuXG4gKiBTYWZlIGZvciBlbGVtZW50IElEcyBhbmQgc2VydmVyLXNpZGUgbG9va3Vwcy5cbiAqXG4gKiBFeHRyYWN0ZWQgZnJvbSBDTENUUlxuICpcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxudmFyIGZpbmdlcnByaW50ID0gcmVxdWlyZSgnLi9saWIvZmluZ2VycHJpbnQuanMnKTtcbnZhciBwYWQgPSByZXF1aXJlKCcuL2xpYi9wYWQuanMnKTtcblxudmFyIGMgPSAwLFxuICBibG9ja1NpemUgPSA0LFxuICBiYXNlID0gMzYsXG4gIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKTtcblxuZnVuY3Rpb24gcmFuZG9tQmxvY2sgKCkge1xuICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbn1cblxuZnVuY3Rpb24gc2FmZUNvdW50ZXIgKCkge1xuICBjID0gYyA8IGRpc2NyZXRlVmFsdWVzID8gYyA6IDA7XG4gIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICByZXR1cm4gYyAtIDE7XG59XG5cbmZ1bmN0aW9uIGN1aWQgKCkge1xuICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgLy8gdGltZXN0YW1wXG4gICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKSxcblxuICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLFxuXG4gICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgcmV0dXJuIGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbn1cblxuY3VpZC5zbHVnID0gZnVuY3Rpb24gc2x1ZyAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCksXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLnNsaWNlKDAsIDEpICtcbiAgICAgIGZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufTtcblxuY3VpZC5maW5nZXJwcmludCA9IGZpbmdlcnByaW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGN1aWQ7XG4iLCJ2YXIgcGFkID0gcmVxdWlyZSgnLi9wYWQuanMnKTtcblxudmFyIGVudiA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogc2VsZjtcbnZhciBnbG9iYWxDb3VudCA9IE9iamVjdC5rZXlzKGVudikubGVuZ3RoO1xudmFyIG1pbWVUeXBlc0xlbmd0aCA9IG5hdmlnYXRvci5taW1lVHlwZXMgPyBuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aCA6IDA7XG52YXIgY2xpZW50SWQgPSBwYWQoKG1pbWVUeXBlc0xlbmd0aCArXG4gIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICBnbG9iYWxDb3VudC50b1N0cmluZygzNiksIDQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmdlcnByaW50ICgpIHtcbiAgcmV0dXJuIGNsaWVudElkO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFkIChudW0sIHNpemUpIHtcbiAgdmFyIHMgPSAnMDAwMDAwMDAwJyArIG51bTtcbiAgcmV0dXJuIHMuc3Vic3RyKHMubGVuZ3RoIC0gc2l6ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgeyAvKiovIH1cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZTtcblx0dmFyIHRhcmdldCA9IGFyZ3VtZW50c1swXTtcblx0dmFyIGkgPSAxO1xuXHR2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblx0dmFyIGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH1cblx0aWYgKHRhcmdldCA9PSBudWxsIHx8ICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJ2YXIgd2lsZGNhcmQgPSByZXF1aXJlKCd3aWxkY2FyZCcpO1xudmFyIHJlTWltZVBhcnRTcGxpdCA9IC9bXFwvXFwrXFwuXS87XG5cbi8qKlxuICAjIG1pbWUtbWF0Y2hcblxuICBBIHNpbXBsZSBmdW5jdGlvbiB0byBjaGVja2VyIHdoZXRoZXIgYSB0YXJnZXQgbWltZSB0eXBlIG1hdGNoZXMgYSBtaW1lLXR5cGVcbiAgcGF0dGVybiAoZS5nLiBpbWFnZS9qcGVnIG1hdGNoZXMgaW1hZ2UvanBlZyBPUiBpbWFnZS8qKS5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgcGF0dGVybikge1xuICBmdW5jdGlvbiB0ZXN0KHBhdHRlcm4pIHtcbiAgICB2YXIgcmVzdWx0ID0gd2lsZGNhcmQocGF0dGVybiwgdGFyZ2V0LCByZU1pbWVQYXJ0U3BsaXQpO1xuXG4gICAgLy8gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIHZhbGlkIG1pbWUgdHlwZSAoc2hvdWxkIGhhdmUgdHdvIHBhcnRzKVxuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+PSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhdHRlcm4gPyB0ZXN0KHBhdHRlcm4uc3BsaXQoJzsnKVswXSkgOiB0ZXN0O1xufTtcbiIsIi8qKlxuKiBDcmVhdGUgYW4gZXZlbnQgZW1pdHRlciB3aXRoIG5hbWVzcGFjZXNcbiogQG5hbWUgY3JlYXRlTmFtZXNwYWNlRW1pdHRlclxuKiBAZXhhbXBsZVxuKiB2YXIgZW1pdHRlciA9IHJlcXVpcmUoJy4vaW5kZXgnKSgpXG4qXG4qIGVtaXR0ZXIub24oJyonLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2FsbCBldmVudHMgZW1pdHRlZCcsIHRoaXMuZXZlbnQpXG4qIH0pXG4qXG4qIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2V4YW1wbGUgZXZlbnQgZW1pdHRlZCcpXG4qIH0pXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyICgpIHtcbiAgdmFyIGVtaXR0ZXIgPSB7fVxuICB2YXIgX2ZucyA9IGVtaXR0ZXIuX2ZucyA9IHt9XG5cbiAgLyoqXG4gICogRW1pdCBhbiBldmVudC4gT3B0aW9uYWxseSBuYW1lc3BhY2UgdGhlIGV2ZW50LiBIYW5kbGVycyBhcmUgZmlyZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZCB3aXRoIGV4YWN0IG1hdGNoZXMgdGFraW5nIHByZWNlZGVuY2UuIFNlcGFyYXRlIHRoZSBuYW1lc3BhY2UgYW5kIGV2ZW50IHdpdGggYSBgOmBcbiAgKiBAbmFtZSBlbWl0XG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IOKAkyB0aGUgbmFtZSBvZiB0aGUgZXZlbnQsIHdpdGggb3B0aW9uYWwgbmFtZXNwYWNlXG4gICogQHBhcmFtIHsuLi4qfSBkYXRhIOKAkyB1cCB0byA2IGFyZ3VtZW50cyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGxpc3RlbmVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLmVtaXQoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGVtbzp0ZXN0JylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RhdGEnLCB7IGV4YW1wbGU6IHRydWV9LCAnYSBzdHJpbmcnLCAxKVxuICAqL1xuICBlbWl0dGVyLmVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNikge1xuICAgIHZhciB0b0VtaXQgPSBnZXRMaXN0ZW5lcnMoZXZlbnQpXG5cbiAgICBpZiAodG9FbWl0Lmxlbmd0aCkge1xuICAgICAgZW1pdEFsbChldmVudCwgdG9FbWl0LCBbYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNl0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyLlxuICAqIEBuYW1lIG9uXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub24gPSBmdW5jdGlvbiBvbiAoZXZlbnQsIGZuKSB7XG4gICAgaWYgKCFfZm5zW2V2ZW50XSkge1xuICAgICAgX2Zuc1tldmVudF0gPSBbXVxuICAgIH1cblxuICAgIF9mbnNbZXZlbnRdLnB1c2goZm4pXG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBmaXJlcyBvbmNlLlxuICAqIEBuYW1lIG9uY2VcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbmNlKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbmNlKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGV2ZW50LCBmbikge1xuICAgIGZ1bmN0aW9uIG9uZSAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBlbWl0dGVyLm9mZihldmVudCwgb25lKVxuICAgIH1cbiAgICB0aGlzLm9uKGV2ZW50LCBvbmUpXG4gIH1cblxuICAvKipcbiAgKiBTdG9wIGxpc3RlbmluZyB0byBhbiBldmVudC4gU3RvcCBhbGwgbGlzdGVuZXJzIG9uIGFuIGV2ZW50IGJ5IG9ubHkgcGFzc2luZyB0aGUgZXZlbnQgbmFtZS4gU3RvcCBhIHNpbmdsZSBsaXN0ZW5lciBieSBwYXNzaW5nIHRoYXQgZXZlbnQgaGFuZGxlciBhcyBhIGNhbGxiYWNrLlxuICAqIFlvdSBtdXN0IGJlIGV4cGxpY2l0IGFib3V0IHdoYXQgd2lsbCBiZSB1bnN1YnNjcmliZWQ6IGBlbWl0dGVyLm9mZignZGVtbycpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vJylgIGxpc3RlbmVyLFxuICAqIGBlbWl0dGVyLm9mZignZGVtbzpleGFtcGxlJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW86ZXhhbXBsZScpYCBsaXN0ZW5lclxuICAqIEBuYW1lIG9mZlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl0g4oCTIHRoZSBzcGVjaWZpYyBoYW5kbGVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9mZignZXhhbXBsZScpXG4gICogZW1pdHRlci5vZmYoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vZmYgPSBmdW5jdGlvbiBvZmYgKGV2ZW50LCBmbikge1xuICAgIHZhciBrZWVwID0gW11cblxuICAgIGlmIChldmVudCAmJiBmbikge1xuICAgICAgdmFyIGZucyA9IHRoaXMuX2Zuc1tldmVudF1cbiAgICAgIHZhciBpID0gMFxuICAgICAgdmFyIGwgPSBmbnMgPyBmbnMubGVuZ3RoIDogMFxuXG4gICAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGZuc1tpXSAhPT0gZm4pIHtcbiAgICAgICAgICBrZWVwLnB1c2goZm5zW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAga2VlcC5sZW5ndGggPyB0aGlzLl9mbnNbZXZlbnRdID0ga2VlcCA6IGRlbGV0ZSB0aGlzLl9mbnNbZXZlbnRdXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaXN0ZW5lcnMgKGUpIHtcbiAgICB2YXIgb3V0ID0gX2Zuc1tlXSA/IF9mbnNbZV0gOiBbXVxuICAgIHZhciBpZHggPSBlLmluZGV4T2YoJzonKVxuICAgIHZhciBhcmdzID0gKGlkeCA9PT0gLTEpID8gW2VdIDogW2Uuc3Vic3RyaW5nKDAsIGlkeCksIGUuc3Vic3RyaW5nKGlkeCArIDEpXVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhfZm5zKVxuICAgIHZhciBpID0gMFxuICAgIHZhciBsID0ga2V5cy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIGlmIChrZXkgPT09ICcqJykge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAyICYmIGFyZ3NbMF0gPT09IGtleSkge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0QWxsIChlLCBmbnMsIGFyZ3MpIHtcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGZucy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFmbnNbaV0pIGJyZWFrXG4gICAgICBmbnNbaV0uZXZlbnQgPSBlXG4gICAgICBmbnNbaV0uYXBwbHkoZm5zW2ldLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbWl0dGVyXG59XG4iLCIhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIFZOb2RlKCkge31cbiAgICBmdW5jdGlvbiBoKG5vZGVOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBsYXN0U2ltcGxlLCBjaGlsZCwgc2ltcGxlLCBpLCBjaGlsZHJlbiA9IEVNUFRZX0NISUxEUkVOO1xuICAgICAgICBmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMgJiYgbnVsbCAhPSBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgJiYgdm9pZCAwICE9PSBjaGlsZC5wb3ApIGZvciAoaSA9IGNoaWxkLmxlbmd0aDsgaS0tOyApIHN0YWNrLnB1c2goY2hpbGRbaV0pOyBlbHNlIHtcbiAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2ltcGxlID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygbm9kZU5hbWUpIGlmIChudWxsID09IGNoaWxkKSBjaGlsZCA9ICcnOyBlbHNlIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gU3RyaW5nKGNoaWxkKTsgZWxzZSBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGNoaWxkKSBzaW1wbGUgPSAhMTtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7IGVsc2UgaWYgKGNoaWxkcmVuID09PSBFTVBUWV9DSElMRFJFTikgY2hpbGRyZW4gPSBbIGNoaWxkIF07IGVsc2UgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBsYXN0U2ltcGxlID0gc2ltcGxlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gbmV3IFZOb2RlKCk7XG4gICAgICAgIHAubm9kZU5hbWUgPSBub2RlTmFtZTtcbiAgICAgICAgcC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICBwLmF0dHJpYnV0ZXMgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzO1xuICAgICAgICBwLmtleSA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXMua2V5O1xuICAgICAgICBpZiAodm9pZCAwICE9PSBvcHRpb25zLnZub2RlKSBvcHRpb25zLnZub2RlKHApO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iaiwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykgb2JqW2ldID0gcHJvcHNbaV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lRWxlbWVudCh2bm9kZSwgcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGgodm5vZGUubm9kZU5hbWUsIGV4dGVuZChleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2QgJiYgKGNvbXBvbmVudC5fX2QgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IGRlZmVyKShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChvbGQpIG9sZChudWxsKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmICExID09PSBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgITEgPT09IHZhbHVlKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbms6Py8sICcnKSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIHZhbHVlKSBpZiAobnMpIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKTsgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5vZGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgZnVuY3Rpb24gZXZlbnRQcm94eShlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbFtlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJNb3VudCkgb3B0aW9ucy5hZnRlck1vdW50KGMpO1xuICAgICAgICAgICAgaWYgKGMuY29tcG9uZW50RGlkTW91bnQpIGMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBwYXJlbnQsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgaWYgKCFkaWZmTGV2ZWwrKykge1xuICAgICAgICAgICAgaXNTdmdNb2RlID0gbnVsbCAhPSBwYXJlbnQgJiYgdm9pZCAwICE9PSBwYXJlbnQub3duZXJTVkdFbGVtZW50O1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gbnVsbCAhPSBkb20gJiYgISgnX19wcmVhY3RhdHRyXycgaW4gZG9tKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpO1xuICAgICAgICBpZiAocGFyZW50ICYmIHJldC5wYXJlbnROb2RlICE9PSBwYXJlbnQpIHBhcmVudC5hcHBlbmRDaGlsZChyZXQpO1xuICAgICAgICBpZiAoIS0tZGlmZkxldmVsKSB7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSAhMTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Um9vdCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICB2YXIgb3V0ID0gZG9tLCBwcmV2U3ZnTW9kZSA9IGlzU3ZnTW9kZTtcbiAgICAgICAgaWYgKG51bGwgPT0gdm5vZGUgfHwgJ2Jvb2xlYW4nID09IHR5cGVvZiB2bm9kZSkgdm5vZGUgPSAnJztcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSB8fCAnbnVtYmVyJyA9PSB0eXBlb2Ygdm5vZGUpIHtcbiAgICAgICAgICAgIGlmIChkb20gJiYgdm9pZCAwICE9PSBkb20uc3BsaXRUZXh0ICYmIGRvbS5wYXJlbnROb2RlICYmICghZG9tLl9jb21wb25lbnQgfHwgY29tcG9uZW50Um9vdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkgZG9tLm5vZGVWYWx1ZSA9IHZub2RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dC5fX3ByZWFjdGF0dHJfID0gITA7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIHZhciB2bm9kZU5hbWUgPSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHZub2RlTmFtZSkgcmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgaXNTdmdNb2RlID0gJ3N2ZycgPT09IHZub2RlTmFtZSA/ICEwIDogJ2ZvcmVpZ25PYmplY3QnID09PSB2bm9kZU5hbWUgPyAhMSA6IGlzU3ZnTW9kZTtcbiAgICAgICAgdm5vZGVOYW1lID0gU3RyaW5nKHZub2RlTmFtZSk7XG4gICAgICAgIGlmICghZG9tIHx8ICFpc05hbWVkTm9kZShkb20sIHZub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIG91dCA9IGNyZWF0ZU5vZGUodm5vZGVOYW1lLCBpc1N2Z01vZGUpO1xuICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkgb3V0LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZjID0gb3V0LmZpcnN0Q2hpbGQsIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8sIHZjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAobnVsbCA9PSBwcm9wcykge1xuICAgICAgICAgICAgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IG91dC5hdHRyaWJ1dGVzLCBpID0gYS5sZW5ndGg7IGktLTsgKSBwcm9wc1thW2ldLm5hbWVdID0gYVtpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWh5ZHJhdGluZyAmJiB2Y2hpbGRyZW4gJiYgMSA9PT0gdmNoaWxkcmVuLmxlbmd0aCAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmNoaWxkcmVuWzBdICYmIG51bGwgIT0gZmMgJiYgdm9pZCAwICE9PSBmYy5zcGxpdFRleHQgJiYgbnVsbCA9PSBmYy5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGZjLm5vZGVWYWx1ZSAhPSB2Y2hpbGRyZW5bMF0pIGZjLm5vZGVWYWx1ZSA9IHZjaGlsZHJlblswXTtcbiAgICAgICAgfSBlbHNlIGlmICh2Y2hpbGRyZW4gJiYgdmNoaWxkcmVuLmxlbmd0aCB8fCBudWxsICE9IGZjKSBpbm5lckRpZmZOb2RlKG91dCwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaHlkcmF0aW5nIHx8IG51bGwgIT0gcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwpO1xuICAgICAgICBkaWZmQXR0cmlidXRlcyhvdXQsIHZub2RlLmF0dHJpYnV0ZXMsIHByb3BzKTtcbiAgICAgICAgaXNTdmdNb2RlID0gcHJldlN2Z01vZGU7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlubmVyRGlmZk5vZGUoZG9tLCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBpc0h5ZHJhdGluZykge1xuICAgICAgICB2YXIgaiwgYywgZiwgdmNoaWxkLCBjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbiA9IGRvbS5jaGlsZE5vZGVzLCBjaGlsZHJlbiA9IFtdLCBrZXllZCA9IHt9LCBrZXllZExlbiA9IDAsIG1pbiA9IDAsIGxlbiA9IG9yaWdpbmFsQ2hpbGRyZW4ubGVuZ3RoLCBjaGlsZHJlbkxlbiA9IDAsIHZsZW4gPSB2Y2hpbGRyZW4gPyB2Y2hpbGRyZW4ubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKDAgIT09IGxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIF9jaGlsZCA9IG9yaWdpbmFsQ2hpbGRyZW5baV0sIHByb3BzID0gX2NoaWxkLl9fcHJlYWN0YXR0cl8sIGtleSA9IHZsZW4gJiYgcHJvcHMgPyBfY2hpbGQuX2NvbXBvbmVudCA/IF9jaGlsZC5fY29tcG9uZW50Ll9fayA6IHByb3BzLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBrZXllZExlbisrO1xuICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSBfY2hpbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BzIHx8ICh2b2lkIDAgIT09IF9jaGlsZC5zcGxpdFRleHQgPyBpc0h5ZHJhdGluZyA/IF9jaGlsZC5ub2RlVmFsdWUudHJpbSgpIDogITAgOiBpc0h5ZHJhdGluZykpIGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0gX2NoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGlmICgwICE9PSB2bGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IHZsZW47IGkrKykge1xuICAgICAgICAgICAgdmNoaWxkID0gdmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGtleSA9IHZjaGlsZC5rZXk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ZWRMZW4gJiYgdm9pZCAwICE9PSBrZXllZFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkID0ga2V5ZWRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRMZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGlsZCAmJiBtaW4gPCBjaGlsZHJlbkxlbikgZm9yIChqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykgaWYgKHZvaWQgMCAhPT0gY2hpbGRyZW5bal0gJiYgaXNTYW1lTm9kZVR5cGUoYyA9IGNoaWxkcmVuW2pdLCB2Y2hpbGQsIGlzSHlkcmF0aW5nKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkID0gYztcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltqXSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBtaW4pIG1pbisrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBmID0gb3JpZ2luYWxDaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCAhPT0gZG9tICYmIGNoaWxkICE9PSBmKSBpZiAobnVsbCA9PSBmKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCA9PT0gZi5uZXh0U2libGluZykgcmVtb3ZlTm9kZShmKTsgZWxzZSBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBmKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmICh2b2lkIDAgIT09IGtleWVkW2ldKSByZWNvbGxlY3ROb2RlVHJlZShrZXllZFtpXSwgITEpO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSBpZiAodm9pZCAwICE9PSAoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkpIHJlY29sbGVjdE5vZGVUcmVlKGNoaWxkLCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHVubW91bnRPbmx5KSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSBub2RlLl9jb21wb25lbnQ7XG4gICAgICAgIGlmIChjb21wb25lbnQpIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBub2RlLl9fcHJlYWN0YXR0cl8gJiYgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZikgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGlmICghMSA9PT0gdW5tb3VudE9ubHkgfHwgbnVsbCA9PSBub2RlLl9fcHJlYWN0YXR0cl8pIHJlbW92ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShub2RlLCAhMCk7XG4gICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICgoIWF0dHJzIHx8IG51bGwgPT0gYXR0cnNbbmFtZV0pICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBmb3IgKG5hbWUgaW4gYXR0cnMpIGlmICghKCdjaGlsZHJlbicgPT09IG5hbWUgfHwgJ2lubmVySFRNTCcgPT09IG5hbWUgfHwgbmFtZSBpbiBvbGQgJiYgYXR0cnNbbmFtZV0gPT09ICgndmFsdWUnID09PSBuYW1lIHx8ICdjaGVja2VkJyA9PT0gbmFtZSA/IGRvbVtuYW1lXSA6IG9sZFtuYW1lXSkpKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gYXR0cnNbbmFtZV0sIGlzU3ZnTW9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIChjb21wb25lbnRzW25hbWVdIHx8IChjb21wb25lbnRzW25hbWVdID0gW10pKS5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuICAgICAgICB2YXIgaW5zdCwgbGlzdCA9IGNvbXBvbmVudHNbQ3Rvci5uYW1lXTtcbiAgICAgICAgaWYgKEN0b3IucHJvdG90eXBlICYmIEN0b3IucHJvdG90eXBlLnJlbmRlcikge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluc3QuY29uc3RydWN0b3IgPSBDdG9yO1xuICAgICAgICAgICAgaW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdCkgZm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoOyBpLS07ICkgaWYgKGxpc3RbaV0uY29uc3RydWN0b3IgPT09IEN0b3IpIHtcbiAgICAgICAgICAgIGluc3QuX19iID0gbGlzdFtpXS5fX2I7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCBvcHRzLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yID0gcHJvcHMucmVmKSBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX2sgPSBwcm9wcy5rZXkpIGRlbGV0ZSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5iYXNlIHx8IG1vdW50QWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19jKSBjb21wb25lbnQuX19jID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19wKSBjb21wb25lbnQuX19wID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITE7XG4gICAgICAgICAgICBpZiAoMCAhPT0gb3B0cykgaWYgKDEgPT09IG9wdHMgfHwgITEgIT09IG9wdGlvbnMuc3luY0NvbXBvbmVudFVwZGF0ZXMgfHwgIWNvbXBvbmVudC5iYXNlKSByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCAxLCBtb3VudEFsbCk7IGVsc2UgZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IoY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBvcHRzLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIHZhciByZW5kZXJlZCwgaW5zdCwgY2Jhc2UsIHByb3BzID0gY29tcG9uZW50LnByb3BzLCBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSwgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LCBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50Ll9fcCB8fCBwcm9wcywgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5fX3MgfHwgc3RhdGUsIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5fX2MgfHwgY29udGV4dCwgaXNVcGRhdGUgPSBjb21wb25lbnQuYmFzZSwgbmV4dEJhc2UgPSBjb21wb25lbnQuX19iLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudCwgc2tpcCA9ICExO1xuICAgICAgICAgICAgaWYgKGlzVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJldmlvdXNQcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBwcmV2aW91c1N0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gcHJldmlvdXNDb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmICgyICE9PSBvcHRzICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUgJiYgITEgPT09IGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KSkgc2tpcCA9ICEwOyBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX19wID0gY29tcG9uZW50Ll9fcyA9IGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuX19iID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2QgPSAhMTtcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIHJlbmRlcmVkID0gY29tcG9uZW50LnJlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSBjb250ZXh0ID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29udGV4dCksIGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVW5tb3VudCwgYmFzZSwgY2hpbGRDb21wb25lbnQgPSByZW5kZXJlZCAmJiByZW5kZXJlZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdCAmJiBpbnN0LmNvbnN0cnVjdG9yID09PSBjaGlsZENvbXBvbmVudCAmJiBjaGlsZFByb3BzLmtleSA9PSBpbnN0Ll9faykgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMSwgY29udGV4dCwgITEpOyBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuX2NvbXBvbmVudCA9IGluc3QgPSBjcmVhdGVDb21wb25lbnQoY2hpbGRDb21wb25lbnQsIGNoaWxkUHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX2IgPSBpbnN0Ll9fYiB8fCBuZXh0QmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX191ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMCwgY29udGV4dCwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGluc3QuYmFzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYmFzZSA9IGluaXRpYWxCYXNlO1xuICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIGNiYXNlID0gY29tcG9uZW50Ll9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgfHwgMSA9PT0gb3B0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBkaWZmKGNiYXNlLCByZW5kZXJlZCwgY29udGV4dCwgbW91bnRBbGwgfHwgIWlzVXBkYXRlLCBpbml0aWFsQmFzZSAmJiBpbml0aWFsQmFzZS5wYXJlbnROb2RlLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlICYmIGJhc2UgIT09IGluaXRpYWxCYXNlICYmIGluc3QgIT09IGluaXRpYWxDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVBhcmVudCA9IGluaXRpYWxCYXNlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXJlbnQucmVwbGFjZUNoaWxkKGJhc2UsIGluaXRpYWxCYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9Vbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSB1bm1vdW50Q29tcG9uZW50KHRvVW5tb3VudCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlICYmICFpc0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsIHQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0ID0gdC5fX3UpIChjb21wb25lbnRSZWYgPSB0KS5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50ID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9IGNvbXBvbmVudFJlZi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzVXBkYXRlIHx8IG1vdW50QWxsKSBtb3VudHMudW5zaGlmdChjb21wb25lbnQpOyBlbHNlIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUsIHByZXZpb3VzQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJVcGRhdGUpIG9wdGlvbnMuYWZ0ZXJVcGRhdGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IGNvbXBvbmVudC5fX2gpIHdoaWxlIChjb21wb25lbnQuX19oLmxlbmd0aCkgY29tcG9uZW50Ll9faC5wb3AoKS5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX191KSkgaXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoYyAmJiBpc093bmVyICYmICghbW91bnRBbGwgfHwgYy5fY29tcG9uZW50KSkge1xuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDMsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudCAmJiAhaXNEaXJlY3RPd25lcikge1xuICAgICAgICAgICAgICAgIHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGRvbSA9IG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoZG9tICYmICFjLl9fYikge1xuICAgICAgICAgICAgICAgIGMuX19iID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20sICExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGJhc2UgPSBjb21wb25lbnQuYmFzZTtcbiAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyKTsgZWxzZSBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2UuX19wcmVhY3RhdHRyXyAmJiBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKSBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fYiA9IGJhc2U7XG4gICAgICAgICAgICByZW1vdmVOb2RlKGJhc2UpO1xuICAgICAgICAgICAgY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4oYmFzZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IobnVsbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY29udGV4dCkge1xuICAgICAgICB0aGlzLl9fZCA9ICEwO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRpZmYobWVyZ2UsIHZub2RlLCB7fSwgITEsIHBhcmVudCwgITEpO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBzdGFjayA9IFtdO1xuICAgIHZhciBFTVBUWV9DSElMRFJFTiA9IFtdO1xuICAgIHZhciBkZWZlciA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIFByb21pc2UgPyBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpIDogc2V0VGltZW91dDtcbiAgICB2YXIgSVNfTk9OX0RJTUVOU0lPTkFMID0gL2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkL2k7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vdW50cyA9IFtdO1xuICAgIHZhciBkaWZmTGV2ZWwgPSAwO1xuICAgIHZhciBpc1N2Z01vZGUgPSAhMTtcbiAgICB2YXIgaHlkcmF0aW5nID0gITE7XG4gICAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgICBleHRlbmQoQ29tcG9uZW50LnByb3RvdHlwZSwge1xuICAgICAgICBzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX19zKSB0aGlzLl9fcyA9IGV4dGVuZCh7fSwgcyk7XG4gICAgICAgICAgICBleHRlbmQocywgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RhdGUgPyBzdGF0ZShzLCB0aGlzLnByb3BzKSA6IHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgZW5xdWV1ZVJlbmRlcih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudCh0aGlzLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHt9XG4gICAgfSk7XG4gICAgdmFyIHByZWFjdCA9IHtcbiAgICAgICAgaDogaCxcbiAgICAgICAgY3JlYXRlRWxlbWVudDogaCxcbiAgICAgICAgY2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG4gICAgICAgIENvbXBvbmVudDogQ29tcG9uZW50LFxuICAgICAgICByZW5kZXI6IHJlbmRlcixcbiAgICAgICAgcmVyZW5kZXI6IHJlcmVuZGVyLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG1vZHVsZSkgbW9kdWxlLmV4cG9ydHMgPSBwcmVhY3Q7IGVsc2Ugc2VsZi5wcmVhY3QgPSBwcmVhY3Q7XG59KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSBwcmV0dGllckJ5dGVzXG5cbmZ1bmN0aW9uIHByZXR0aWVyQnl0ZXMgKG51bSkge1xuICBpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgaXNOYU4obnVtKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyLCBnb3QgJyArIHR5cGVvZiBudW0pXG4gIH1cblxuICB2YXIgbmVnID0gbnVtIDwgMFxuICB2YXIgdW5pdHMgPSBbJ0InLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXVxuXG4gIGlmIChuZWcpIHtcbiAgICBudW0gPSAtbnVtXG4gIH1cblxuICBpZiAobnVtIDwgMSkge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJ1xuICB9XG5cbiAgdmFyIGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAwMCkpLCB1bml0cy5sZW5ndGggLSAxKVxuICBudW0gPSBOdW1iZXIobnVtIC8gTWF0aC5wb3coMTAwMCwgZXhwb25lbnQpKVxuICB2YXIgdW5pdCA9IHVuaXRzW2V4cG9uZW50XVxuXG4gIGlmIChudW0gPj0gMTAgfHwgbnVtICUgMSA9PT0gMCkge1xuICAgIC8vIERvIG5vdCBzaG93IGRlY2ltYWxzIHdoZW4gdGhlIG51bWJlciBpcyB0d28tZGlnaXQsIG9yIGlmIHRoZSBudW1iZXIgaGFzIG5vXG4gICAgLy8gZGVjaW1hbCBjb21wb25lbnQuXG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgwKSArICcgJyArIHVuaXRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDEpICsgJyAnICsgdW5pdFxuICB9XG59XG4iLCIvLyBDb3B5cmlnaHQgMjAxNCBTaW1vbiBMeWRlbGxcclxuLy8gWDExICjigJxNSVTigJ0pIExpY2Vuc2VkLiAoU2VlIExJQ0VOU0UuKVxyXG5cclxudm9pZCAoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZhY3RvcnkpXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcclxuICB9IGVsc2Uge1xyXG4gICAgcm9vdC5yZXNvbHZlVXJsID0gZmFjdG9yeSgpXHJcbiAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uKCkge1xyXG5cclxuICBmdW5jdGlvbiByZXNvbHZlVXJsKC8qIC4uLnVybHMgKi8pIHtcclxuICAgIHZhciBudW1VcmxzID0gYXJndW1lbnRzLmxlbmd0aFxyXG5cclxuICAgIGlmIChudW1VcmxzID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInJlc29sdmVVcmwgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50OyBnb3Qgbm9uZS5cIilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYmFzZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiYXNlXCIpXHJcbiAgICBiYXNlLmhyZWYgPSBhcmd1bWVudHNbMF1cclxuXHJcbiAgICBpZiAobnVtVXJscyA9PT0gMSkge1xyXG4gICAgICByZXR1cm4gYmFzZS5ocmVmXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF1cclxuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKGJhc2UsIGhlYWQuZmlyc3RDaGlsZClcclxuXHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXHJcbiAgICB2YXIgcmVzb2x2ZWRcclxuXHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbnVtVXJsczsgaW5kZXgrKykge1xyXG4gICAgICBhLmhyZWYgPSBhcmd1bWVudHNbaW5kZXhdXHJcbiAgICAgIHJlc29sdmVkID0gYS5ocmVmXHJcbiAgICAgIGJhc2UuaHJlZiA9IHJlc29sdmVkXHJcbiAgICB9XHJcblxyXG4gICAgaGVhZC5yZW1vdmVDaGlsZChiYXNlKVxyXG5cclxuICAgIHJldHVybiByZXNvbHZlZFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc29sdmVVcmxcclxuXHJcbn0pKTtcclxuIiwiLy8gR2VuZXJhdGVkIGJ5IEJhYmVsXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZW5jb2RlID0gZW5jb2RlO1xuLyogZ2xvYmFsOiB3aW5kb3cgKi9cblxudmFyIF93aW5kb3cgPSB3aW5kb3c7XG52YXIgYnRvYSA9IF93aW5kb3cuYnRvYTtcbmZ1bmN0aW9uIGVuY29kZShkYXRhKSB7XG4gIHJldHVybiBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChkYXRhKSkpO1xufVxuXG52YXIgaXNTdXBwb3J0ZWQgPSBleHBvcnRzLmlzU3VwcG9ydGVkID0gXCJidG9hXCIgaW4gd2luZG93OyIsIi8vIEdlbmVyYXRlZCBieSBCYWJlbFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLm5ld1JlcXVlc3QgPSBuZXdSZXF1ZXN0O1xuZXhwb3J0cy5yZXNvbHZlVXJsID0gcmVzb2x2ZVVybDtcblxudmFyIF9yZXNvbHZlVXJsID0gcmVxdWlyZShcInJlc29sdmUtdXJsXCIpO1xuXG52YXIgX3Jlc29sdmVVcmwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVzb2x2ZVVybCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIG5ld1JlcXVlc3QoKSB7XG4gIHJldHVybiBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG59IC8qIGdsb2JhbCB3aW5kb3cgKi9cblxuXG5mdW5jdGlvbiByZXNvbHZlVXJsKG9yaWdpbiwgbGluaykge1xuICByZXR1cm4gKDAsIF9yZXNvbHZlVXJsMi5kZWZhdWx0KShvcmlnaW4sIGxpbmspO1xufSIsIi8vIEdlbmVyYXRlZCBieSBCYWJlbFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldFNvdXJjZSA9IGdldFNvdXJjZTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEZpbGVTb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEZpbGVTb3VyY2UoZmlsZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWxlU291cmNlKTtcblxuICAgIHRoaXMuX2ZpbGUgPSBmaWxlO1xuICAgIHRoaXMuc2l6ZSA9IGZpbGUuc2l6ZTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhGaWxlU291cmNlLCBbe1xuICAgIGtleTogXCJzbGljZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlsZS5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2xvc2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7fVxuICB9XSk7XG5cbiAgcmV0dXJuIEZpbGVTb3VyY2U7XG59KCk7XG5cbmZ1bmN0aW9uIGdldFNvdXJjZShpbnB1dCkge1xuICAvLyBTaW5jZSB3ZSBlbXVsYXRlIHRoZSBCbG9iIHR5cGUgaW4gb3VyIHRlc3RzIChub3QgYWxsIHRhcmdldCBicm93c2Vyc1xuICAvLyBzdXBwb3J0IGl0KSwgd2UgY2Fubm90IHVzZSBgaW5zdGFuY2VvZmAgZm9yIHRlc3Rpbmcgd2hldGhlciB0aGUgaW5wdXQgdmFsdWVcbiAgLy8gY2FuIGJlIGhhbmRsZWQuIEluc3RlYWQsIHdlIHNpbXBseSBjaGVjayBpcyB0aGUgc2xpY2UoKSBmdW5jdGlvbiBhbmQgdGhlXG4gIC8vIHNpemUgcHJvcGVydHkgYXJlIGF2YWlsYWJsZS5cbiAgaWYgKHR5cGVvZiBpbnB1dC5zbGljZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBpbnB1dC5zaXplICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlU291cmNlKGlucHV0KTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcInNvdXJjZSBvYmplY3QgbWF5IG9ubHkgYmUgYW4gaW5zdGFuY2Ugb2YgRmlsZSBvciBCbG9iIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG59IiwiLy8gR2VuZXJhdGVkIGJ5IEJhYmVsXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc2V0SXRlbSA9IHNldEl0ZW07XG5leHBvcnRzLmdldEl0ZW0gPSBnZXRJdGVtO1xuZXhwb3J0cy5yZW1vdmVJdGVtID0gcmVtb3ZlSXRlbTtcbi8qIGdsb2JhbCB3aW5kb3csIGxvY2FsU3RvcmFnZSAqL1xuXG52YXIgaGFzU3RvcmFnZSA9IGZhbHNlO1xudHJ5IHtcbiAgaGFzU3RvcmFnZSA9IFwibG9jYWxTdG9yYWdlXCIgaW4gd2luZG93O1xuXG4gIC8vIEF0dGVtcHQgdG8gc3RvcmUgYW5kIHJlYWQgZW50cmllcyBmcm9tIHRoZSBsb2NhbCBzdG9yYWdlIHRvIGRldGVjdCBQcml2YXRlXG4gIC8vIE1vZGUgb24gU2FmYXJpIG9uIGlPUyAoc2VlICM0OSlcbiAgdmFyIGtleSA9IFwidHVzU3VwcG9ydFwiO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpO1xufSBjYXRjaCAoZSkge1xuICAvLyBJZiB3ZSB0cnkgdG8gYWNjZXNzIGxvY2FsU3RvcmFnZSBpbnNpZGUgYSBzYW5kYm94ZWQgaWZyYW1lLCBhIFNlY3VyaXR5RXJyb3JcbiAgLy8gaXMgdGhyb3duLiBXaGVuIGluIHByaXZhdGUgbW9kZSBvbiBpT1MgU2FmYXJpLCBhIFF1b3RhRXhjZWVkZWRFcnJvciBpc1xuICAvLyB0aHJvd24gKHNlZSAjNDkpXG4gIGlmIChlLmNvZGUgPT09IGUuU0VDVVJJVFlfRVJSIHx8IGUuY29kZSA9PT0gZS5RVU9UQV9FWENFRURFRF9FUlIpIHtcbiAgICBoYXNTdG9yYWdlID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG52YXIgY2FuU3RvcmVVUkxzID0gZXhwb3J0cy5jYW5TdG9yZVVSTHMgPSBoYXNTdG9yYWdlO1xuXG5mdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUpIHtcbiAgaWYgKCFoYXNTdG9yYWdlKSByZXR1cm47XG4gIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbShrZXkpIHtcbiAgaWYgKCFoYXNTdG9yYWdlKSByZXR1cm47XG4gIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJdGVtKGtleSkge1xuICBpZiAoIWhhc1N0b3JhZ2UpIHJldHVybjtcbiAgcmV0dXJuIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG59IiwiLy8gR2VuZXJhdGVkIGJ5IEJhYmVsXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgRGV0YWlsZWRFcnJvciA9IGZ1bmN0aW9uIChfRXJyb3IpIHtcbiAgX2luaGVyaXRzKERldGFpbGVkRXJyb3IsIF9FcnJvcik7XG5cbiAgZnVuY3Rpb24gRGV0YWlsZWRFcnJvcihlcnJvcikge1xuICAgIHZhciBjYXVzaW5nRXJyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgeGhyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1syXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEZXRhaWxlZEVycm9yKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIE9iamVjdC5nZXRQcm90b3R5cGVPZihEZXRhaWxlZEVycm9yKS5jYWxsKHRoaXMsIGVycm9yLm1lc3NhZ2UpKTtcblxuICAgIF90aGlzLm9yaWdpbmFsUmVxdWVzdCA9IHhocjtcbiAgICBfdGhpcy5jYXVzaW5nRXJyb3IgPSBjYXVzaW5nRXJyO1xuXG4gICAgdmFyIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIGlmIChjYXVzaW5nRXJyICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UgKz0gXCIsIGNhdXNlZCBieSBcIiArIGNhdXNpbmdFcnIudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHhociAhPSBudWxsKSB7XG4gICAgICBtZXNzYWdlICs9IFwiLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAocmVzcG9uc2UgY29kZTogXCIgKyB4aHIuc3RhdHVzICsgXCIsIHJlc3BvbnNlIHRleHQ6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiKVwiO1xuICAgIH1cbiAgICBfdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gRGV0YWlsZWRFcnJvcjtcbn0oRXJyb3IpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEZXRhaWxlZEVycm9yOyIsIi8vIEdlbmVyYXRlZCBieSBCYWJlbFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBmaW5nZXJwcmludDtcbi8qKlxuICogR2VuZXJhdGUgYSBmaW5nZXJwcmludCBmb3IgYSBmaWxlIHdoaWNoIHdpbGwgYmUgdXNlZCB0aGUgc3RvcmUgdGhlIGVuZHBvaW50XG4gKlxuICogQHBhcmFtIHtGaWxlfSBmaWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZpbmdlcnByaW50KGZpbGUsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIFtcInR1c1wiLCBmaWxlLm5hbWUsIGZpbGUudHlwZSwgZmlsZS5zaXplLCBmaWxlLmxhc3RNb2RpZmllZCwgb3B0aW9ucy5lbmRwb2ludF0uam9pbihcIi1cIik7XG59IiwiLy8gR2VuZXJhdGVkIGJ5IEJhYmVsXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIF91cGxvYWQgPSByZXF1aXJlKFwiLi91cGxvYWRcIik7XG5cbnZhciBfdXBsb2FkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3VwbG9hZCk7XG5cbnZhciBfc3RvcmFnZSA9IHJlcXVpcmUoXCIuL25vZGUvc3RvcmFnZVwiKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZ2xvYmFsIHdpbmRvdyAqL1xudmFyIGRlZmF1bHRPcHRpb25zID0gX3VwbG9hZDIuZGVmYXVsdC5kZWZhdWx0T3B0aW9ucztcblxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAvLyBCcm93c2VyIGVudmlyb25tZW50IHVzaW5nIFhNTEh0dHBSZXF1ZXN0XG4gIHZhciBfd2luZG93ID0gd2luZG93O1xuICB2YXIgWE1MSHR0cFJlcXVlc3QgPSBfd2luZG93LlhNTEh0dHBSZXF1ZXN0O1xuICB2YXIgQmxvYiA9IF93aW5kb3cuQmxvYjtcblxuXG4gIHZhciBpc1N1cHBvcnRlZCA9IFhNTEh0dHBSZXF1ZXN0ICYmIEJsb2IgJiYgdHlwZW9mIEJsb2IucHJvdG90eXBlLnNsaWNlID09PSBcImZ1bmN0aW9uXCI7XG59IGVsc2Uge1xuICAvLyBOb2RlLmpzIGVudmlyb25tZW50IHVzaW5nIGh0dHAgbW9kdWxlXG4gIHZhciBpc1N1cHBvcnRlZCA9IHRydWU7XG59XG5cbi8vIFRoZSB1c2FnZSBvZiB0aGUgY29tbW9uanMgZXhwb3J0aW5nIHN5bnRheCBpbnN0ZWFkIG9mIHRoZSBuZXcgRUNNQVNjcmlwdFxuLy8gb25lIGlzIGFjdHVhbGx5IGludGVkZWQgYW5kIHByZXZlbnRzIHdlaXJkIGJlaGF2aW91ciBpZiB3ZSBhcmUgdHJ5aW5nIHRvXG4vLyBpbXBvcnQgdGhpcyBtb2R1bGUgaW4gYW5vdGhlciBtb2R1bGUgdXNpbmcgQmFiZWwuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVXBsb2FkOiBfdXBsb2FkMi5kZWZhdWx0LFxuICBpc1N1cHBvcnRlZDogaXNTdXBwb3J0ZWQsXG4gIGNhblN0b3JlVVJMczogX3N0b3JhZ2UuY2FuU3RvcmVVUkxzLFxuICBkZWZhdWx0T3B0aW9uczogZGVmYXVsdE9wdGlvbnNcbn07IiwiLy8gR2VuZXJhdGVkIGJ5IEJhYmVsXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG5cbi8vIFdlIGltcG9ydCB0aGUgZmlsZXMgdXNlZCBpbnNpZGUgdGhlIE5vZGUgZW52aXJvbm1lbnQgd2hpY2ggYXJlIHJld3JpdHRlblxuLy8gZm9yIGJyb3dzZXJzIHVzaW5nIHRoZSBydWxlcyBkZWZpbmVkIGluIHRoZSBwYWNrYWdlLmpzb25cblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2ZpbmdlcnByaW50ID0gcmVxdWlyZShcIi4vZmluZ2VycHJpbnRcIik7XG5cbnZhciBfZmluZ2VycHJpbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmluZ2VycHJpbnQpO1xuXG52YXIgX2Vycm9yID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG5cbnZhciBfZXJyb3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXJyb3IpO1xuXG52YXIgX2V4dGVuZCA9IHJlcXVpcmUoXCJleHRlbmRcIik7XG5cbnZhciBfZXh0ZW5kMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2V4dGVuZCk7XG5cbnZhciBfcmVxdWVzdCA9IHJlcXVpcmUoXCIuL25vZGUvcmVxdWVzdFwiKTtcblxudmFyIF9zb3VyY2UgPSByZXF1aXJlKFwiLi9ub2RlL3NvdXJjZVwiKTtcblxudmFyIF9iYXNlID0gcmVxdWlyZShcIi4vbm9kZS9iYXNlNjRcIik7XG5cbnZhciBCYXNlNjQgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfYmFzZSk7XG5cbnZhciBfc3RvcmFnZSA9IHJlcXVpcmUoXCIuL25vZGUvc3RvcmFnZVwiKTtcblxudmFyIFN0b3JhZ2UgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfc3RvcmFnZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmouZGVmYXVsdCA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZW5kcG9pbnQ6IG51bGwsXG4gIGZpbmdlcnByaW50OiBfZmluZ2VycHJpbnQyLmRlZmF1bHQsXG4gIHJlc3VtZTogdHJ1ZSxcbiAgb25Qcm9ncmVzczogbnVsbCxcbiAgb25DaHVua0NvbXBsZXRlOiBudWxsLFxuICBvblN1Y2Nlc3M6IG51bGwsXG4gIG9uRXJyb3I6IG51bGwsXG4gIGhlYWRlcnM6IHt9LFxuICBjaHVua1NpemU6IEluZmluaXR5LFxuICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICB1cGxvYWRVcmw6IG51bGwsXG4gIHVwbG9hZFNpemU6IG51bGwsXG4gIG92ZXJyaWRlUGF0Y2hNZXRob2Q6IGZhbHNlLFxuICByZXRyeURlbGF5czogbnVsbCxcbiAgcmVtb3ZlRmluZ2VycHJpbnRPblN1Y2Nlc3M6IGZhbHNlXG59O1xuXG52YXIgVXBsb2FkID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBVcGxvYWQoZmlsZSwgb3B0aW9ucykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVcGxvYWQpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gKDAsIF9leHRlbmQyLmRlZmF1bHQpKHRydWUsIHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAvLyBUaGUgdW5kZXJseWluZyBGaWxlL0Jsb2Igb2JqZWN0XG4gICAgdGhpcy5maWxlID0gZmlsZTtcblxuICAgIC8vIFRoZSBVUkwgYWdhaW5zdCB3aGljaCB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkXG4gICAgdGhpcy51cmwgPSBudWxsO1xuXG4gICAgLy8gVGhlIHVuZGVybHlpbmcgWEhSIG9iamVjdCBmb3IgdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdFxuICAgIHRoaXMuX3hociA9IG51bGw7XG5cbiAgICAvLyBUaGUgZmluZ2VycGlucnQgZm9yIHRoZSBjdXJyZW50IGZpbGUgKHNldCBhZnRlciBzdGFydCgpKVxuICAgIHRoaXMuX2ZpbmdlcnByaW50ID0gbnVsbDtcblxuICAgIC8vIFRoZSBvZmZzZXQgdXNlZCBpbiB0aGUgY3VycmVudCBQQVRDSCByZXF1ZXN0XG4gICAgdGhpcy5fb2Zmc2V0ID0gbnVsbDtcblxuICAgIC8vIFRydWUgaWYgdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkXG4gICAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gVGhlIGZpbGUncyBzaXplIGluIGJ5dGVzXG4gICAgdGhpcy5fc2l6ZSA9IG51bGw7XG5cbiAgICAvLyBUaGUgU291cmNlIG9iamVjdCB3aGljaCB3aWxsIHdyYXAgYXJvdW5kIHRoZSBnaXZlbiBmaWxlIGFuZCBwcm92aWRlcyB1c1xuICAgIC8vIHdpdGggYSB1bmlmaWVkIGludGVyZmFjZSBmb3IgZ2V0dGluZyBpdHMgc2l6ZSBhbmQgc2xpY2UgY2h1bmtzIGZyb20gaXRzXG4gICAgLy8gY29udGVudCBhbGxvd2luZyB1cyB0byBlYXNpbHkgaGFuZGxlIEZpbGVzLCBCbG9icywgQnVmZmVycyBhbmQgU3RyZWFtcy5cbiAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuXG4gICAgLy8gVGhlIGN1cnJlbnQgY291bnQgb2YgYXR0ZW1wdHMgd2hpY2ggaGF2ZSBiZWVuIG1hZGUuIE51bGwgaW5kaWNhdGVzIG5vbmUuXG4gICAgdGhpcy5fcmV0cnlBdHRlbXB0ID0gMDtcblxuICAgIC8vIFRoZSB0aW1lb3V0J3MgSUQgd2hpY2ggaXMgdXNlZCB0byBkZWxheSB0aGUgbmV4dCByZXRyeVxuICAgIHRoaXMuX3JldHJ5VGltZW91dCA9IG51bGw7XG5cbiAgICAvLyBUaGUgb2Zmc2V0IG9mIHRoZSByZW1vdGUgdXBsb2FkIGJlZm9yZSB0aGUgbGF0ZXN0IGF0dGVtcHQgd2FzIHN0YXJ0ZWQuXG4gICAgdGhpcy5fb2Zmc2V0QmVmb3JlUmV0cnkgPSAwO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFVwbG9hZCwgW3tcbiAgICBrZXk6IFwic3RhcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZmlsZSA9IHRoaXMuZmlsZTtcblxuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IG5vIGZpbGUgb3Igc3RyZWFtIHRvIHVwbG9hZCBwcm92aWRlZFwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5kcG9pbnQgJiYgIXRoaXMub3B0aW9ucy51cGxvYWRVcmwpIHtcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogbmVpdGhlciBhbiBlbmRwb2ludCBvciBhbiB1cGxvYWQgVVJMIGlzIHByb3ZpZGVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc291cmNlID0gdGhpcy5fc291cmNlID0gKDAsIF9zb3VyY2UuZ2V0U291cmNlKShmaWxlLCB0aGlzLm9wdGlvbnMuY2h1bmtTaXplKTtcblxuICAgICAgLy8gRmlyc3RseSwgY2hlY2sgaWYgdGhlIGNhbGxlciBoYXMgc3VwcGxpZWQgYSBtYW51YWwgdXBsb2FkIHNpemUgb3IgZWxzZVxuICAgICAgLy8gd2Ugd2lsbCB1c2UgdGhlIGNhbGN1bGF0ZWQgc2l6ZSBieSB0aGUgc291cmNlIG9iamVjdC5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZSAhPSBudWxsKSB7XG4gICAgICAgIHZhciBzaXplID0gK3RoaXMub3B0aW9ucy51cGxvYWRTaXplO1xuICAgICAgICBpZiAoaXNOYU4oc2l6ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBjb252ZXJ0IGB1cGxvYWRTaXplYCBvcHRpb24gaW50byBhIG51bWJlclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNpemUgPSBzb3VyY2Uuc2l6ZTtcblxuICAgICAgICAvLyBUaGUgc2l6ZSBwcm9wZXJ0eSB3aWxsIGJlIG51bGwgaWYgd2UgY2Fubm90IGNhbGN1bGF0ZSB0aGUgZmlsZSdzIHNpemUsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGlmIHlvdSBoYW5kbGUgYSBzdHJlYW0uXG4gICAgICAgIGlmIChzaXplID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBhdXRvbWF0aWNhbGx5IGRlcml2ZSB1cGxvYWQncyBzaXplIGZyb20gaW5wdXQgYW5kIG11c3QgYmUgc3BlY2lmaWVkIG1hbnVhbGx5IHVzaW5nIHRoZSBgdXBsb2FkU2l6ZWAgb3B0aW9uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2l6ZSA9IHNpemU7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXRyeURlbGF5cyA9IHRoaXMub3B0aW9ucy5yZXRyeURlbGF5cztcbiAgICAgIGlmIChyZXRyeURlbGF5cyAhPSBudWxsKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmV0cnlEZWxheXMpICE9PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IHRoZSBgcmV0cnlEZWxheXNgIG9wdGlvbiBtdXN0IGVpdGhlciBiZSBhbiBhcnJheSBvciBudWxsXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3JDYWxsYmFjayA9IF90aGlzLm9wdGlvbnMub25FcnJvcjtcbiAgICAgICAgICAgIF90aGlzLm9wdGlvbnMub25FcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgZXJyb3IgY2FsbGJhY2sgd2hpY2ggbWF5IGhhdmUgYmVlbiBzZXQuXG4gICAgICAgICAgICAgIF90aGlzLm9wdGlvbnMub25FcnJvciA9IGVycm9yQ2FsbGJhY2s7XG5cbiAgICAgICAgICAgICAgLy8gV2Ugd2lsbCByZXNldCB0aGUgYXR0ZW1wdCBjb3VudGVyIGlmXG4gICAgICAgICAgICAgIC8vIC0gd2Ugd2VyZSBhbHJlYWR5IGFibGUgdG8gY29ubmVjdCB0byB0aGUgc2VydmVyIChvZmZzZXQgIT0gbnVsbCkgYW5kXG4gICAgICAgICAgICAgIC8vIC0gd2Ugd2VyZSBhYmxlIHRvIHVwbG9hZCBhIHNtYWxsIGNodW5rIG9mIGRhdGEgdG8gdGhlIHNlcnZlclxuICAgICAgICAgICAgICB2YXIgc2hvdWxkUmVzZXREZWxheXMgPSBfdGhpcy5fb2Zmc2V0ICE9IG51bGwgJiYgX3RoaXMuX29mZnNldCA+IF90aGlzLl9vZmZzZXRCZWZvcmVSZXRyeTtcbiAgICAgICAgICAgICAgaWYgKHNob3VsZFJlc2V0RGVsYXlzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3JldHJ5QXR0ZW1wdCA9IDA7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgaXNPbmxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcIm5hdmlnYXRvclwiIGluIHdpbmRvdyAmJiB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpc09ubGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gV2Ugb25seSBhdHRlbXB0IGEgcmV0cnkgaWZcbiAgICAgICAgICAgICAgLy8gLSB3ZSBkaWRuJ3QgZXhjZWVkIHRoZSBtYXhpdW0gbnVtYmVyIG9mIHJldHJpZXMsIHlldCwgYW5kXG4gICAgICAgICAgICAgIC8vIC0gdGhpcyBlcnJvciB3YXMgY2F1c2VkIGJ5IGEgcmVxdWVzdCBvciBpdCdzIHJlc3BvbnNlIGFuZFxuICAgICAgICAgICAgICAvLyAtIHRoZSBlcnJvciBpcyBub3QgYSBjbGllbnQgZXJyb3IgKHN0YXR1cyA0eHgpIGFuZFxuICAgICAgICAgICAgICAvLyAtIHRoZSBicm93c2VyIGRvZXMgbm90IGluZGljYXRlIHRoYXQgd2UgYXJlIG9mZmxpbmVcbiAgICAgICAgICAgICAgdmFyIHNob3VsZFJldHJ5ID0gX3RoaXMuX3JldHJ5QXR0ZW1wdCA8IHJldHJ5RGVsYXlzLmxlbmd0aCAmJiBlcnIub3JpZ2luYWxSZXF1ZXN0ICE9IG51bGwgJiYgIWluU3RhdHVzQ2F0ZWdvcnkoZXJyLm9yaWdpbmFsUmVxdWVzdC5zdGF0dXMsIDQwMCkgJiYgaXNPbmxpbmU7XG5cbiAgICAgICAgICAgICAgaWYgKCFzaG91bGRSZXRyeSkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgZGVsYXkgPSByZXRyeURlbGF5c1tfdGhpcy5fcmV0cnlBdHRlbXB0KytdO1xuXG4gICAgICAgICAgICAgIF90aGlzLl9vZmZzZXRCZWZvcmVSZXRyeSA9IF90aGlzLl9vZmZzZXQ7XG4gICAgICAgICAgICAgIF90aGlzLm9wdGlvbnMudXBsb2FkVXJsID0gX3RoaXMudXJsO1xuXG4gICAgICAgICAgICAgIF90aGlzLl9yZXRyeVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVzZXQgdGhlIGFib3J0ZWQgZmxhZyB3aGVuIHRoZSB1cGxvYWQgaXMgc3RhcnRlZCBvciBlbHNlIHRoZVxuICAgICAgLy8gX3N0YXJ0VXBsb2FkIHdpbGwgc3RvcCBiZWZvcmUgc2VuZGluZyBhIHJlcXVlc3QgaWYgdGhlIHVwbG9hZCBoYXMgYmVlblxuICAgICAgLy8gYWJvcnRlZCBwcmV2aW91c2x5LlxuICAgICAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAvLyBUaGUgdXBsb2FkIGhhZCBiZWVuIHN0YXJ0ZWQgcHJldmlvdXNseSBhbmQgd2Ugc2hvdWxkIHJldXNlIHRoaXMgVVJMLlxuICAgICAgaWYgKHRoaXMudXJsICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQSBVUkwgaGFzIG1hbnVhbGx5IGJlZW4gc3BlY2lmaWVkLCBzbyB3ZSB0cnkgdG8gcmVzdW1lXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZFVybCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMudXJsID0gdGhpcy5vcHRpb25zLnVwbG9hZFVybDtcbiAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVHJ5IHRvIGZpbmQgdGhlIGVuZHBvaW50IGZvciB0aGUgZmlsZSBpbiB0aGUgc3RvcmFnZVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUpIHtcbiAgICAgICAgdGhpcy5fZmluZ2VycHJpbnQgPSB0aGlzLm9wdGlvbnMuZmluZ2VycHJpbnQoZmlsZSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdmFyIHJlc3VtZWRVcmwgPSBTdG9yYWdlLmdldEl0ZW0odGhpcy5fZmluZ2VycHJpbnQpO1xuXG4gICAgICAgIGlmIChyZXN1bWVkVXJsICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnVybCA9IHJlc3VtZWRVcmw7XG4gICAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFuIHVwbG9hZCBoYXMgbm90IHN0YXJ0ZWQgZm9yIHRoZSBmaWxlIHlldCwgc28gd2Ugc3RhcnQgYSBuZXcgb25lXG4gICAgICB0aGlzLl9jcmVhdGVVcGxvYWQoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWJvcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWJvcnQoKSB7XG4gICAgICBpZiAodGhpcy5feGhyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3hoci5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZXRyeVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmV0cnlUaW1lb3V0KTtcbiAgICAgICAgdGhpcy5fcmV0cnlUaW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRYaHJFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZW1pdFhockVycm9yKHhociwgZXJyLCBjYXVzaW5nRXJyKSB7XG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IF9lcnJvcjIuZGVmYXVsdChlcnIsIGNhdXNpbmdFcnIsIHhocikpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfZW1pdEVycm9yXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9lbWl0RXJyb3IoZXJyKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uRXJyb3IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRTdWNjZXNzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9lbWl0U3VjY2VzcygpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vblN1Y2Nlc3MoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgbm90aWZpY2F0aW9uIHdoZW4gZGF0YSBoYXMgYmVlbiBzZW50IHRvIHRoZSBzZXJ2ZXIuIFRoaXNcbiAgICAgKiBkYXRhIG1heSBub3QgaGF2ZSBiZWVuIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIgeWV0LlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNTZW50ICBOdW1iZXIgb2YgYnl0ZXMgc2VudCB0byB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNUb3RhbCBUb3RhbCBudW1iZXIgb2YgYnl0ZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRQcm9ncmVzc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZW1pdFByb2dyZXNzKGJ5dGVzU2VudCwgYnl0ZXNUb3RhbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vblByb2dyZXNzKGJ5dGVzU2VudCwgYnl0ZXNUb3RhbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGEgY2h1bmsgb2YgZGF0YSBoYXMgYmVlbiBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgICAgKiBhbmQgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGNodW5rU2l6ZSAgU2l6ZSBvZiB0aGUgY2h1bmsgdGhhdCB3YXMgYWNjZXB0ZWQgYnkgdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzQWNjZXB0ZWQgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgaGF2ZSBiZWVuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBieXRlc1RvdGFsIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfZW1pdENodW5rQ29tcGxldGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRDaHVua0NvbXBsZXRlKGNodW5rU2l6ZSwgYnl0ZXNBY2NlcHRlZCwgYnl0ZXNUb3RhbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DaHVua0NvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uQ2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgaGVhZGVycyB1c2VkIGluIHRoZSByZXF1ZXN0IGFuZCB0aGUgd2l0aENyZWRlbnRpYWxzIHByb3BlcnR5XG4gICAgICogYXMgZGVmaW5lZCBpbiB0aGUgb3B0aW9uc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdH0geGhyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfc2V0dXBYSFJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwWEhSKHhocikge1xuICAgICAgdGhpcy5feGhyID0geGhyO1xuXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlR1cy1SZXN1bWFibGVcIiwgXCIxLjAuMFwiKTtcbiAgICAgIHZhciBoZWFkZXJzID0gdGhpcy5vcHRpb25zLmhlYWRlcnM7XG5cbiAgICAgIGZvciAodmFyIG5hbWUgaW4gaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgICAgIH1cblxuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRoaXMub3B0aW9ucy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IHVwbG9hZCB1c2luZyB0aGUgY3JlYXRpb24gZXh0ZW5zaW9uIGJ5IHNlbmRpbmcgYSBQT1NUXG4gICAgICogcmVxdWVzdCB0byB0aGUgZW5kcG9pbnQuIEFmdGVyIHN1Y2Nlc3NmdWwgY3JlYXRpb24gdGhlIGZpbGUgd2lsbCBiZVxuICAgICAqIHVwbG9hZGVkXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9jcmVhdGVVcGxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2NyZWF0ZVVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmRwb2ludCkge1xuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiB1bmFibGUgdG8gY3JlYXRlIHVwbG9hZCBiZWNhdXNlIG5vIGVuZHBvaW50IGlzIHByb3ZpZGVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gKDAsIF9yZXF1ZXN0Lm5ld1JlcXVlc3QpKCk7XG4gICAgICB4aHIub3BlbihcIlBPU1RcIiwgdGhpcy5vcHRpb25zLmVuZHBvaW50LCB0cnVlKTtcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgICBfdGhpczIuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSBjcmVhdGluZyB1cGxvYWRcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkxvY2F0aW9uXCIpO1xuICAgICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICAgIF90aGlzMi5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3NpbmcgTG9jYXRpb24gaGVhZGVyXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczIudXJsID0gKDAsIF9yZXF1ZXN0LnJlc29sdmVVcmwpKF90aGlzMi5vcHRpb25zLmVuZHBvaW50LCBsb2NhdGlvbik7XG5cbiAgICAgICAgaWYgKF90aGlzMi5fc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIC8vIE5vdGhpbmcgdG8gdXBsb2FkIGFuZCBmaWxlIHdhcyBzdWNjZXNzZnVsbHkgY3JlYXRlZFxuICAgICAgICAgIF90aGlzMi5fZW1pdFN1Y2Nlc3MoKTtcbiAgICAgICAgICBfdGhpczIuX3NvdXJjZS5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfdGhpczIub3B0aW9ucy5yZXN1bWUpIHtcbiAgICAgICAgICBTdG9yYWdlLnNldEl0ZW0oX3RoaXMyLl9maW5nZXJwcmludCwgX3RoaXMyLnVybCk7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczIuX29mZnNldCA9IDA7XG4gICAgICAgIF90aGlzMi5fc3RhcnRVcGxvYWQoKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICBfdGhpczIuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIGNyZWF0ZSB1cGxvYWRcIiksIGVycik7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9zZXR1cFhIUih4aHIpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJVcGxvYWQtTGVuZ3RoXCIsIHRoaXMuX3NpemUpO1xuXG4gICAgICAvLyBBZGQgbWV0YWRhdGEgaWYgdmFsdWVzIGhhdmUgYmVlbiBhZGRlZFxuICAgICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1NZXRhZGF0YVwiLCBtZXRhZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVHJ5IHRvIHJlc3VtZSBhbiBleGlzdGluZyB1cGxvYWQuIEZpcnN0IGEgSEVBRCByZXF1ZXN0IHdpbGwgYmUgc2VudFxuICAgICAqIHRvIHJldHJpZXZlIHRoZSBvZmZzZXQuIElmIHRoZSByZXF1ZXN0IGZhaWxzIGEgbmV3IHVwbG9hZCB3aWxsIGJlXG4gICAgICogY3JlYXRlZC4gSW4gdGhlIGNhc2Ugb2YgYSBzdWNjZXNzZnVsIHJlc3BvbnNlIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9yZXN1bWVVcGxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3Jlc3VtZVVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICB2YXIgeGhyID0gKDAsIF9yZXF1ZXN0Lm5ld1JlcXVlc3QpKCk7XG4gICAgICB4aHIub3BlbihcIkhFQURcIiwgdGhpcy51cmwsIHRydWUpO1xuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkoeGhyLnN0YXR1cywgMjAwKSkge1xuICAgICAgICAgIGlmIChfdGhpczMub3B0aW9ucy5yZXN1bWUgJiYgaW5TdGF0dXNDYXRlZ29yeSh4aHIuc3RhdHVzLCA0MDApKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgc3RvcmVkIGZpbmdlcnByaW50IGFuZCBjb3JyZXNwb25kaW5nIGVuZHBvaW50LFxuICAgICAgICAgICAgLy8gb24gY2xpZW50IGVycm9ycyBzaW5jZSB0aGUgZmlsZSBjYW4gbm90IGJlIGZvdW5kXG4gICAgICAgICAgICBTdG9yYWdlLnJlbW92ZUl0ZW0oX3RoaXMzLl9maW5nZXJwcmludCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIHVwbG9hZCBpcyBsb2NrZWQgKGluZGljYXRlZCBieSB0aGUgNDIzIExvY2tlZCBzdGF0dXMgY29kZSksIHdlXG4gICAgICAgICAgLy8gZW1pdCBhbiBlcnJvciBpbnN0ZWFkIG9mIGRpcmVjdGx5IHN0YXJ0aW5nIGEgbmV3IHVwbG9hZC4gVGhpcyB3YXkgdGhlXG4gICAgICAgICAgLy8gcmV0cnkgbG9naWMgY2FuIGNhdGNoIHRoZSBlcnJvciBhbmQgd2lsbCByZXRyeSB0aGUgdXBsb2FkLiBBbiB1cGxvYWRcbiAgICAgICAgICAvLyBpcyB1c3VhbGx5IGxvY2tlZCBmb3IgYSBzaG9ydCBwZXJpb2Qgb2YgdGltZSBhbmQgd2lsbCBiZSBhdmFpbGFibGVcbiAgICAgICAgICAvLyBhZnRlcndhcmRzLlxuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSA0MjMpIHtcbiAgICAgICAgICAgIF90aGlzMy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiB1cGxvYWQgaXMgY3VycmVudGx5IGxvY2tlZDsgcmV0cnkgbGF0ZXJcIikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghX3RoaXMzLm9wdGlvbnMuZW5kcG9pbnQpIHtcbiAgICAgICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIGEgbmV3IHVwbG9hZCBpZiBubyBlbmRwb2ludCBpcyBwcm92aWRlZC5cbiAgICAgICAgICAgIF90aGlzMy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiB1bmFibGUgdG8gcmVzdW1lIHVwbG9hZCAobmV3IHVwbG9hZCBjYW5ub3QgYmUgY3JlYXRlZCB3aXRob3V0IGFuIGVuZHBvaW50KVwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVHJ5IHRvIGNyZWF0ZSBhIG5ldyB1cGxvYWRcbiAgICAgICAgICBfdGhpczMudXJsID0gbnVsbDtcbiAgICAgICAgICBfdGhpczMuX2NyZWF0ZVVwbG9hZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIpLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihvZmZzZXQpKSB7XG4gICAgICAgICAgX3RoaXMzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtTGVuZ3RoXCIpLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihsZW5ndGgpKSB7XG4gICAgICAgICAgX3RoaXMzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBsZW5ndGggdmFsdWVcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwbG9hZCBoYXMgYWxyZWFkeSBiZWVuIGNvbXBsZXRlZCBhbmQgd2UgZG8gbm90IG5lZWQgdG8gc2VuZCBhZGRpdGlvbmFsXG4gICAgICAgIC8vIGRhdGEgdG8gdGhlIHNlcnZlclxuICAgICAgICBpZiAob2Zmc2V0ID09PSBsZW5ndGgpIHtcbiAgICAgICAgICBfdGhpczMuX2VtaXRQcm9ncmVzcyhsZW5ndGgsIGxlbmd0aCk7XG4gICAgICAgICAgX3RoaXMzLl9lbWl0U3VjY2VzcygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzMy5fb2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICBfdGhpczMuX3N0YXJ0VXBsb2FkKCk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgX3RoaXMzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byByZXN1bWUgdXBsb2FkXCIpLCBlcnIpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcbiAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlsZSB1c2luZyBQQVRDSCByZXF1ZXN0cy4gVGhlIGZpbGUgd2lsbCBiZSBkaXZpZGVkXG4gICAgICogaW50byBjaHVua3MgYXMgc3BlY2lmaWVkIGluIHRoZSBjaHVua1NpemUgb3B0aW9uLiBEdXJpbmcgdGhlIHVwbG9hZFxuICAgICAqIHRoZSBvblByb2dyZXNzIGV2ZW50IGhhbmRsZXIgbWF5IGJlIGludm9rZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9zdGFydFVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RhcnRVcGxvYWQoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgLy8gSWYgdGhlIHVwbG9hZCBoYXMgYmVlbiBhYm9ydGVkLCB3ZSB3aWxsIG5vdCBzZW5kIHRoZSBuZXh0IFBBVENIIHJlcXVlc3QuXG4gICAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBpZiB0aGUgYWJvcnQgbWV0aG9kIHdhcyBjYWxsZWQgZHVyaW5nIGEgY2FsbGJhY2ssIHN1Y2hcbiAgICAgIC8vIGFzIG9uQ2h1bmtDb21wbGV0ZSBvciBvblByb2dyZXNzLlxuICAgICAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gKDAsIF9yZXF1ZXN0Lm5ld1JlcXVlc3QpKCk7XG5cbiAgICAgIC8vIFNvbWUgYnJvd3NlciBhbmQgc2VydmVycyBtYXkgbm90IHN1cHBvcnQgdGhlIFBBVENIIG1ldGhvZC4gRm9yIHRob3NlXG4gICAgICAvLyBjYXNlcywgeW91IGNhbiB0ZWxsIHR1cy1qcy1jbGllbnQgdG8gdXNlIGEgUE9TVCByZXF1ZXN0IHdpdGggdGhlXG4gICAgICAvLyBYLUhUVFAtTWV0aG9kLU92ZXJyaWRlIGhlYWRlciBmb3Igc2ltdWxhdGluZyBhIFBBVENIIHJlcXVlc3QuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJyaWRlUGF0Y2hNZXRob2QpIHtcbiAgICAgICAgeGhyLm9wZW4oXCJQT1NUXCIsIHRoaXMudXJsLCB0cnVlKTtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJYLUhUVFAtTWV0aG9kLU92ZXJyaWRlXCIsIFwiUEFUQ0hcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4aHIub3BlbihcIlBBVENIXCIsIHRoaXMudXJsLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgICBfdGhpczQuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSB1cGxvYWRpbmcgY2h1bmtcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIpLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihvZmZzZXQpKSB7XG4gICAgICAgICAgX3RoaXM0Ll9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNC5fZW1pdFByb2dyZXNzKG9mZnNldCwgX3RoaXM0Ll9zaXplKTtcbiAgICAgICAgX3RoaXM0Ll9lbWl0Q2h1bmtDb21wbGV0ZShvZmZzZXQgLSBfdGhpczQuX29mZnNldCwgb2Zmc2V0LCBfdGhpczQuX3NpemUpO1xuXG4gICAgICAgIF90aGlzNC5fb2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgICAgIGlmIChvZmZzZXQgPT0gX3RoaXM0Ll9zaXplKSB7XG4gICAgICAgICAgaWYgKF90aGlzNC5vcHRpb25zLnJlbW92ZUZpbmdlcnByaW50T25TdWNjZXNzICYmIF90aGlzNC5vcHRpb25zLnJlc3VtZSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHN0b3JlZCBmaW5nZXJwcmludCBhbmQgY29ycmVzcG9uZGluZyBlbmRwb2ludC4gVGhpcyBjYXVzZXNcbiAgICAgICAgICAgIC8vIG5ldyB1cGxvYWQgb2YgdGhlIHNhbWUgZmlsZSBtdXN0IGJlIHRyZWF0ZWQgYXMgYSBkaWZmZXJlbnQgZmlsZS5cbiAgICAgICAgICAgIFN0b3JhZ2UucmVtb3ZlSXRlbShfdGhpczQuX2ZpbmdlcnByaW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBZYXksIGZpbmFsbHkgZG9uZSA6KVxuICAgICAgICAgIF90aGlzNC5fZW1pdFN1Y2Nlc3MoKTtcbiAgICAgICAgICBfdGhpczQuX3NvdXJjZS5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNC5fc3RhcnRVcGxvYWQoKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAvLyBEb24ndCBlbWl0IGFuIGVycm9yIGlmIHRoZSB1cGxvYWQgd2FzIGFib3J0ZWQgbWFudWFsbHlcbiAgICAgICAgaWYgKF90aGlzNC5fYWJvcnRlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNC5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gdXBsb2FkIGNodW5rIGF0IG9mZnNldCBcIiArIF90aGlzNC5fb2Zmc2V0KSwgZXJyKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFRlc3Qgc3VwcG9ydCBmb3IgcHJvZ3Jlc3MgZXZlbnRzIGJlZm9yZSBhdHRhY2hpbmcgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgIGlmIChcInVwbG9hZFwiIGluIHhocikge1xuICAgICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmICghZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgX3RoaXM0Ll9lbWl0UHJvZ3Jlc3Moc3RhcnQgKyBlLmxvYWRlZCwgX3RoaXM0Ll9zaXplKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcblxuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIsIHRoaXMuX29mZnNldCk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL29mZnNldCtvY3RldC1zdHJlYW1cIik7XG5cbiAgICAgIHZhciBzdGFydCA9IHRoaXMuX29mZnNldDtcbiAgICAgIHZhciBlbmQgPSB0aGlzLl9vZmZzZXQgKyB0aGlzLm9wdGlvbnMuY2h1bmtTaXplO1xuXG4gICAgICAvLyBUaGUgc3BlY2lmaWVkIGNodW5rU2l6ZSBtYXkgYmUgSW5maW5pdHkgb3IgdGhlIGNhbGNsdWF0ZWQgZW5kIHBvc2l0aW9uXG4gICAgICAvLyBtYXkgZXhjZWVkIHRoZSBmaWxlJ3Mgc2l6ZS4gSW4gYm90aCBjYXNlcywgd2UgbGltaXQgdGhlIGVuZCBwb3NpdGlvbiB0b1xuICAgICAgLy8gdGhlIGlucHV0J3MgdG90YWwgc2l6ZSBmb3Igc2ltcGxlciBjYWxjdWxhdGlvbnMgYW5kIGNvcnJlY3RuZXNzLlxuICAgICAgaWYgKGVuZCA9PT0gSW5maW5pdHkgfHwgZW5kID4gdGhpcy5fc2l6ZSkge1xuICAgICAgICBlbmQgPSB0aGlzLl9zaXplO1xuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZCh0aGlzLl9zb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuXG4gICAgICAvLyBFbWl0IGFuIHByb2dyZXNzIGV2ZW50IHdoZW4gYSBuZXcgY2h1bmsgYmVnaW5zIGJlaW5nIHVwbG9hZGVkLlxuICAgICAgdGhpcy5fZW1pdFByb2dyZXNzKHRoaXMuX29mZnNldCwgdGhpcy5fc2l6ZSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFVwbG9hZDtcbn0oKTtcblxuZnVuY3Rpb24gZW5jb2RlTWV0YWRhdGEobWV0YWRhdGEpIHtcbiAgaWYgKCFCYXNlNjQuaXNTdXBwb3J0ZWQpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuXG4gIHZhciBlbmNvZGVkID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG1ldGFkYXRhKSB7XG4gICAgZW5jb2RlZC5wdXNoKGtleSArIFwiIFwiICsgQmFzZTY0LmVuY29kZShtZXRhZGF0YVtrZXldKSk7XG4gIH1cblxuICByZXR1cm4gZW5jb2RlZC5qb2luKFwiLFwiKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIHN0YXR1cyBpcyBpbiB0aGUgcmFuZ2Ugb2YgdGhlIGV4cGVjdGVkIGNhdGVnb3J5LlxuICogRm9yIGV4YW1wbGUsIG9ubHkgYSBzdGF0dXMgYmV0d2VlbiAyMDAgYW5kIDI5OSB3aWxsIHNhdGlzZnkgdGhlIGNhdGVnb3J5IDIwMC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5TdGF0dXNDYXRlZ29yeShzdGF0dXMsIGNhdGVnb3J5KSB7XG4gIHJldHVybiBzdGF0dXMgPj0gY2F0ZWdvcnkgJiYgc3RhdHVzIDwgY2F0ZWdvcnkgKyAxMDA7XG59XG5cblVwbG9hZC5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBVcGxvYWQ7IiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgd2lsZGNhcmRcblxuICBWZXJ5IHNpbXBsZSB3aWxkY2FyZCBtYXRjaGluZywgd2hpY2ggaXMgZGVzaWduZWQgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICBmdW5jdGlvbmFsaXR5IHRoYXQgaXMgZm91bmQgaW4gdGhlXG4gIFtldmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9hZG9iZS13ZWJwbGF0Zm9ybS9ldmUpIGV2ZW50aW5nIGxpYnJhcnkuXG5cbiAgIyMgVXNhZ2VcblxuICBJdCB3b3JrcyB3aXRoIHN0cmluZ3M6XG5cbiAgPDw8IGV4YW1wbGVzL3N0cmluZ3MuanNcblxuICBBcnJheXM6XG5cbiAgPDw8IGV4YW1wbGVzL2FycmF5cy5qc1xuXG4gIE9iamVjdHMgKG1hdGNoaW5nIGFnYWluc3Qga2V5cyk6XG5cbiAgPDw8IGV4YW1wbGVzL29iamVjdHMuanNcblxuICBXaGlsZSB0aGUgbGlicmFyeSB3b3JrcyBpbiBOb2RlLCBpZiB5b3UgYXJlIGFyZSBsb29raW5nIGZvciBmaWxlLWJhc2VkXG4gIHdpbGRjYXJkIG1hdGNoaW5nIHRoZW4geW91IHNob3VsZCBoYXZlIGEgbG9vayBhdDpcblxuICA8aHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2I+XG4qKi9cblxuZnVuY3Rpb24gV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvcikge1xuICB0aGlzLnRleHQgPSB0ZXh0ID0gdGV4dCB8fCAnJztcbiAgdGhpcy5oYXNXaWxkID0gfnRleHQuaW5kZXhPZignKicpO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKTtcbn1cblxuV2lsZGNhcmRNYXRjaGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIHZhciBtYXRjaGVzID0gdHJ1ZTtcbiAgdmFyIHBhcnRzID0gdGhpcy5wYXJ0cztcbiAgdmFyIGlpO1xuICB2YXIgcGFydHNDb3VudCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIHRlc3RQYXJ0cztcblxuICBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmhhc1dpbGQgJiYgdGhpcy50ZXh0ICE9IGlucHV0KSB7XG4gICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlc3RQYXJ0cyA9IChpbnB1dCB8fCAnJykuc3BsaXQodGhpcy5zZXBhcmF0b3IpO1xuICAgICAgZm9yIChpaSA9IDA7IG1hdGNoZXMgJiYgaWkgPCBwYXJ0c0NvdW50OyBpaSsrKSB7XG4gICAgICAgIGlmIChwYXJ0c1tpaV0gPT09ICcqJykgIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpaSA8IHRlc3RQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICBtYXRjaGVzID0gcGFydHNbaWldID09PSB0ZXN0UGFydHNbaWldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtYXRjaGVzLCB0aGVuIHJldHVybiB0aGUgY29tcG9uZW50IHBhcnRzXG4gICAgICBtYXRjaGVzID0gbWF0Y2hlcyAmJiB0ZXN0UGFydHM7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dC5zcGxpY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG1hdGNoZXMgPSBbXTtcblxuICAgIGZvciAoaWkgPSBpbnB1dC5sZW5ndGg7IGlpLS07ICkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goaW5wdXRbaWldKSkge1xuICAgICAgICBtYXRjaGVzW21hdGNoZXMubGVuZ3RoXSA9IGlucHV0W2lpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdvYmplY3QnKSB7XG4gICAgbWF0Y2hlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGlucHV0KSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChrZXkpKSB7XG4gICAgICAgIG1hdGNoZXNba2V5XSA9IGlucHV0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsInZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHByZWFjdCA9IHJlcXVpcmUoJ3ByZWFjdCcpO1xudmFyIGZpbmRET01FbGVtZW50ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2ZpbmRET01FbGVtZW50Jyk7XG5cbi8qKlxuICogRGVmZXIgYSBmcmVxdWVudCBjYWxsIHRvIHRoZSBtaWNyb3Rhc2sgcXVldWUuXG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZuKSB7XG4gIHZhciBjYWxsaW5nID0gbnVsbDtcbiAgdmFyIGxhdGVzdEFyZ3MgPSBudWxsO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGxhdGVzdEFyZ3MgPSBhcmdzO1xuICAgIGlmICghY2FsbGluZykge1xuICAgICAgY2FsbGluZyA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsaW5nID0gbnVsbDtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4uYXBwbHkodW5kZWZpbmVkLCBsYXRlc3RBcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY2FsbGluZztcbiAgfTtcbn1cblxuLyoqXG4gKiBCb2lsZXJwbGF0ZSB0aGF0IGFsbCBQbHVnaW5zIHNoYXJlIC0gYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkuIEl0IGFsc28gc2hvd3Mgd2hpY2ggbWV0aG9kcyBmaW5hbCBwbHVnaW5zIHNob3VsZCBpbXBsZW1lbnQvb3ZlcnJpZGUsXG4gKiB0aGlzIGRlY2lkaW5nIG9uIHN0cnVjdHVyZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbWFpbiBVcHB5IGNvcmUgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IHdpdGggcGx1Z2luIG9wdGlvbnNcbiAqIEByZXR1cm4ge2FycmF5IHwgc3RyaW5nfSBmaWxlcyBvciBzdWNjZXNzL2ZhaWwgbWVzc2FnZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGx1Z2luKHVwcHksIG9wdHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGx1Z2luKTtcblxuICAgIHRoaXMudXBweSA9IHVwcHk7XG4gICAgdGhpcy5vcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm1vdW50ID0gdGhpcy5tb3VudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMudW5pbnN0YWxsID0gdGhpcy51bmluc3RhbGwuYmluZCh0aGlzKTtcbiAgfVxuXG4gIFBsdWdpbi5wcm90b3R5cGUuZ2V0UGx1Z2luU3RhdGUgPSBmdW5jdGlvbiBnZXRQbHVnaW5TdGF0ZSgpIHtcbiAgICB2YXIgX3VwcHkkZ2V0U3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKSxcbiAgICAgICAgcGx1Z2lucyA9IF91cHB5JGdldFN0YXRlLnBsdWdpbnM7XG5cbiAgICByZXR1cm4gcGx1Z2luc1t0aGlzLmlkXTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnNldFBsdWdpblN0YXRlID0gZnVuY3Rpb24gc2V0UGx1Z2luU3RhdGUodXBkYXRlKSB7XG4gICAgdmFyIF9leHRlbmRzMjtcblxuICAgIHZhciBfdXBweSRnZXRTdGF0ZTIgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKSxcbiAgICAgICAgcGx1Z2lucyA9IF91cHB5JGdldFN0YXRlMi5wbHVnaW5zO1xuXG4gICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IF9leHRlbmRzKHt9LCBwbHVnaW5zLCAoX2V4dGVuZHMyID0ge30sIF9leHRlbmRzMlt0aGlzLmlkXSA9IHVwZGF0ZSwgX2V4dGVuZHMyKSlcbiAgICB9KTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZShzdGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5lbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdXBkYXRlVUkpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVVJKHN0YXRlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG5cblxuICBQbHVnaW4ucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24gbW91bnQodGFyZ2V0LCBwbHVnaW4pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWQ7XG5cbiAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGZpbmRET01FbGVtZW50KHRhcmdldCk7XG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5pc1RhcmdldERPTUVsID0gdHJ1ZTtcblxuICAgICAgLy8gQVBJIGZvciBwbHVnaW5zIHRoYXQgcmVxdWlyZSBhIHN5bmNocm9ub3VzIHJlcmVuZGVyLlxuICAgICAgdGhpcy5yZXJlbmRlciA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAvLyBwbHVnaW4gY291bGQgYmUgcmVtb3ZlZCwgYnV0IHRoaXMucmVyZW5kZXIgaXMgZGVib3VuY2VkIGJlbG93LFxuICAgICAgICAvLyBzbyBpdCBjb3VsZCBzdGlsbCBiZSBjYWxsZWQgZXZlbiBhZnRlciB1cHB5LnJlbW92ZVBsdWdpbiBvciB1cHB5LmNsb3NlXG4gICAgICAgIC8vIGhlbmNlIHRoZSBjaGVja1xuICAgICAgICBpZiAoIV90aGlzLnVwcHkuZ2V0UGx1Z2luKF90aGlzLmlkKSkgcmV0dXJuO1xuICAgICAgICBfdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIoX3RoaXMucmVuZGVyKHN0YXRlKSwgdGFyZ2V0RWxlbWVudCwgX3RoaXMuZWwpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZVVJID0gZGVib3VuY2UodGhpcy5yZXJlbmRlcik7XG5cbiAgICAgIHRoaXMudXBweS5sb2coJ0luc3RhbGxpbmcgJyArIGNhbGxlclBsdWdpbk5hbWUgKyAnIHRvIGEgRE9NIGVsZW1lbnQnKTtcblxuICAgICAgLy8gY2xlYXIgZXZlcnl0aGluZyBpbnNpZGUgdGhlIHRhcmdldCBjb250YWluZXJcbiAgICAgIGlmICh0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQpIHtcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB0YXJnZXRFbGVtZW50KTtcblxuICAgICAgcmV0dXJuIHRoaXMuZWw7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldFBsdWdpbiA9IHZvaWQgMDtcbiAgICBpZiAoKHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHRhcmdldCkpID09PSAnb2JqZWN0JyAmJiB0YXJnZXQgaW5zdGFuY2VvZiBQbHVnaW4pIHtcbiAgICAgIC8vIFRhcmdldGluZyBhIHBsdWdpbiAqaW5zdGFuY2UqXG4gICAgICB0YXJnZXRQbHVnaW4gPSB0YXJnZXQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gdHlwZVxuICAgICAgdmFyIFRhcmdldCA9IHRhcmdldDtcbiAgICAgIC8vIEZpbmQgdGhlIHRhcmdldCBwbHVnaW4gaW5zdGFuY2UuXG4gICAgICB0aGlzLnVwcHkuaXRlcmF0ZVBsdWdpbnMoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgICBpZiAocGx1Z2luIGluc3RhbmNlb2YgVGFyZ2V0KSB7XG4gICAgICAgICAgdGFyZ2V0UGx1Z2luID0gcGx1Z2luO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldFBsdWdpbikge1xuICAgICAgdmFyIHRhcmdldFBsdWdpbk5hbWUgPSB0YXJnZXRQbHVnaW4uaWQ7XG4gICAgICB0aGlzLnVwcHkubG9nKCdJbnN0YWxsaW5nICcgKyBjYWxsZXJQbHVnaW5OYW1lICsgJyB0byAnICsgdGFyZ2V0UGx1Z2luTmFtZSk7XG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pO1xuICAgICAgcmV0dXJuIHRoaXMuZWw7XG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmxvZygnTm90IGluc3RhbGxpbmcgJyArIGNhbGxlclBsdWdpbk5hbWUpO1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICcgKyBjYWxsZXJQbHVnaW5OYW1lKTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcihzdGF0ZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXh0ZW5kIHRoZSByZW5kZXIgbWV0aG9kIHRvIGFkZCB5b3VyIHBsdWdpbiB0byBhIERPTSBlbGVtZW50Jyk7XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5hZGRUYXJnZXQgPSBmdW5jdGlvbiBhZGRUYXJnZXQocGx1Z2luKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHRlbmQgdGhlIGFkZFRhcmdldCBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGFub3RoZXIgcGx1Z2luXFwncyB0YXJnZXQnKTtcbiAgfTtcblxuICBQbHVnaW4ucHJvdG90eXBlLnVubW91bnQgPSBmdW5jdGlvbiB1bm1vdW50KCkge1xuICAgIGlmICh0aGlzLmlzVGFyZ2V0RE9NRWwgJiYgdGhpcy5lbCAmJiB0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbCgpIHt9O1xuXG4gIFBsdWdpbi5wcm90b3R5cGUudW5pbnN0YWxsID0gZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9O1xuXG4gIHJldHVybiBQbHVnaW47XG59KCk7IiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgVHJhbnNsYXRvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yJyk7XG52YXIgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpO1xudmFyIGN1aWQgPSByZXF1aXJlKCdjdWlkJyk7XG4vLyBjb25zdCB0aHJvdHRsZSA9IHJlcXVpcmUoJ2xvZGFzaC50aHJvdHRsZScpXG52YXIgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdwcmV0dGllci1ieXRlcycpO1xudmFyIG1hdGNoID0gcmVxdWlyZSgnbWltZS1tYXRjaCcpO1xudmFyIERlZmF1bHRTdG9yZSA9IHJlcXVpcmUoJ0B1cHB5L3N0b3JlLWRlZmF1bHQnKTtcbnZhciBnZXRGaWxlVHlwZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZScpO1xudmFyIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uJyk7XG52YXIgZ2VuZXJhdGVGaWxlSUQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2VuZXJhdGVGaWxlSUQnKTtcbnZhciBpc09iamVjdFVSTCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9pc09iamVjdFVSTCcpO1xudmFyIGdldFRpbWVTdGFtcCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRUaW1lU3RhbXAnKTtcbnZhciBQbHVnaW4gPSByZXF1aXJlKCcuL1BsdWdpbicpOyAvLyBFeHBvcnRlZCBmcm9tIGhlcmUuXG5cbi8qKlxuICogVXBweSBDb3JlIG1vZHVsZS5cbiAqIE1hbmFnZXMgcGx1Z2lucywgc3RhdGUgdXBkYXRlcywgYWN0cyBhcyBhbiBldmVudCBidXMsXG4gKiBhZGRzL3JlbW92ZXMgZmlsZXMgYW5kIG1ldGFkYXRhLlxuICovXG5cbnZhciBVcHB5ID0gZnVuY3Rpb24gKCkge1xuICAvKipcbiAgKiBJbnN0YW50aWF0ZSBVcHB5XG4gICogQHBhcmFtIHtvYmplY3R9IG9wdHMg4oCUIFVwcHkgb3B0aW9uc1xuICAqL1xuICBmdW5jdGlvbiBVcHB5KG9wdHMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVwcHkpO1xuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7XG4gICAgICAgIHlvdUNhbk9ubHlVcGxvYWRYOiB7XG4gICAgICAgICAgMDogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAgICAgMTogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIHlvdUhhdmVUb0F0TGVhc3RTZWxlY3RYOiB7XG4gICAgICAgICAgMDogJ1lvdSBoYXZlIHRvIHNlbGVjdCBhdCBsZWFzdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICBleGNlZWRzU2l6ZTogJ1RoaXMgZmlsZSBleGNlZWRzIG1heGltdW0gYWxsb3dlZCBzaXplIG9mJyxcbiAgICAgICAgeW91Q2FuT25seVVwbG9hZEZpbGVUeXBlczogJ1lvdSBjYW4gb25seSB1cGxvYWQ6JyxcbiAgICAgICAgdXBweVNlcnZlckVycm9yOiAnQ29ubmVjdGlvbiB3aXRoIFVwcHkgU2VydmVyIGZhaWxlZCcsXG4gICAgICAgIGZhaWxlZFRvVXBsb2FkOiAnRmFpbGVkIHRvIHVwbG9hZCAle2ZpbGV9JyxcbiAgICAgICAgbm9JbnRlcm5ldENvbm5lY3Rpb246ICdObyBJbnRlcm5ldCBjb25uZWN0aW9uJyxcbiAgICAgICAgY29ubmVjdGVkVG9JbnRlcm5ldDogJ0Nvbm5lY3RlZCB0byB0aGUgSW50ZXJuZXQnLFxuICAgICAgICAvLyBTdHJpbmdzIGZvciByZW1vdGUgcHJvdmlkZXJzXG4gICAgICAgIG5vRmlsZXNGb3VuZDogJ1lvdSBoYXZlIG5vIGZpbGVzIG9yIGZvbGRlcnMgaGVyZScsXG4gICAgICAgIHNlbGVjdFhGaWxlczoge1xuICAgICAgICAgIDA6ICdTZWxlY3QgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAgICAgMTogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgY2FuY2VsOiAnQ2FuY2VsJyxcbiAgICAgICAgbG9nT3V0OiAnTG9nIG91dCdcbiAgICAgIH1cblxuICAgICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIH07dmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgaWQ6ICd1cHB5JyxcbiAgICAgIGF1dG9Qcm9jZWVkOiB0cnVlLFxuICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIG1heEZpbGVTaXplOiBudWxsLFxuICAgICAgICBtYXhOdW1iZXJPZkZpbGVzOiBudWxsLFxuICAgICAgICBtaW5OdW1iZXJPZkZpbGVzOiBudWxsLFxuICAgICAgICBhbGxvd2VkRmlsZVR5cGVzOiBudWxsXG4gICAgICB9LFxuICAgICAgbWV0YToge30sXG4gICAgICBvbkJlZm9yZUZpbGVBZGRlZDogZnVuY3Rpb24gb25CZWZvcmVGaWxlQWRkZWQoY3VycmVudEZpbGUsIGZpbGVzKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50RmlsZTtcbiAgICAgIH0sXG4gICAgICBvbkJlZm9yZVVwbG9hZDogZnVuY3Rpb24gb25CZWZvcmVVcGxvYWQoZmlsZXMpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgICAgfSxcbiAgICAgIGxvY2FsZTogZGVmYXVsdExvY2FsZSxcbiAgICAgIHN0b3JlOiBEZWZhdWx0U3RvcmUoKVxuXG4gICAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIH07dGhpcy5vcHRzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKTtcbiAgICB0aGlzLm9wdHMucmVzdHJpY3Rpb25zID0gX2V4dGVuZHMoe30sIGRlZmF1bHRPcHRpb25zLnJlc3RyaWN0aW9ucywgdGhpcy5vcHRzLnJlc3RyaWN0aW9ucyk7XG5cbiAgICB0aGlzLmxvY2FsZSA9IF9leHRlbmRzKHt9LCBkZWZhdWx0TG9jYWxlLCB0aGlzLm9wdHMubG9jYWxlKTtcbiAgICB0aGlzLmxvY2FsZS5zdHJpbmdzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUuc3RyaW5ncywgdGhpcy5vcHRzLmxvY2FsZS5zdHJpbmdzKTtcblxuICAgIC8vIGkxOG5cbiAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcih7IGxvY2FsZTogdGhpcy5sb2NhbGUgfSk7XG4gICAgdGhpcy5pMThuID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZS5iaW5kKHRoaXMudHJhbnNsYXRvcik7XG5cbiAgICAvLyBDb250YWluZXIgZm9yIGRpZmZlcmVudCB0eXBlcyBvZiBwbHVnaW5zXG4gICAgdGhpcy5wbHVnaW5zID0ge307XG5cbiAgICB0aGlzLmdldFN0YXRlID0gdGhpcy5nZXRTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0UGx1Z2luID0gdGhpcy5nZXRQbHVnaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldEZpbGVNZXRhID0gdGhpcy5zZXRGaWxlTWV0YS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0RmlsZVN0YXRlID0gdGhpcy5zZXRGaWxlU3RhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmxvZyA9IHRoaXMubG9nLmJpbmQodGhpcyk7XG4gICAgdGhpcy5pbmZvID0gdGhpcy5pbmZvLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oaWRlSW5mbyA9IHRoaXMuaGlkZUluZm8uYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZEZpbGUgPSB0aGlzLmFkZEZpbGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUZpbGUgPSB0aGlzLnJlbW92ZUZpbGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhdXNlUmVzdW1lID0gdGhpcy5wYXVzZVJlc3VtZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzID0gdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cyA9IHRoaXMudXBkYXRlT25saW5lU3RhdHVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXNldFByb2dyZXNzID0gdGhpcy5yZXNldFByb2dyZXNzLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnBhdXNlQWxsID0gdGhpcy5wYXVzZUFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVzdW1lQWxsID0gdGhpcy5yZXN1bWVBbGwuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJldHJ5QWxsID0gdGhpcy5yZXRyeUFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuY2FuY2VsQWxsID0gdGhpcy5jYW5jZWxBbGwuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJldHJ5VXBsb2FkID0gdGhpcy5yZXRyeVVwbG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMudXBsb2FkID0gdGhpcy51cGxvYWQuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuZW1pdHRlciA9IGVlKCk7XG4gICAgdGhpcy5vbiA9IHRoaXMub24uYmluZCh0aGlzKTtcbiAgICB0aGlzLm9mZiA9IHRoaXMub2ZmLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmNlID0gdGhpcy5lbWl0dGVyLm9uY2UuYmluZCh0aGlzLmVtaXR0ZXIpO1xuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdHRlci5lbWl0LmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgIHRoaXMucHJlUHJvY2Vzc29ycyA9IFtdO1xuICAgIHRoaXMudXBsb2FkZXJzID0gW107XG4gICAgdGhpcy5wb3N0UHJvY2Vzc29ycyA9IFtdO1xuXG4gICAgdGhpcy5zdG9yZSA9IHRoaXMub3B0cy5zdG9yZTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHt9LFxuICAgICAgZmlsZXM6IHt9LFxuICAgICAgY3VycmVudFVwbG9hZHM6IHt9LFxuICAgICAgY2FwYWJpbGl0aWVzOiB7XG4gICAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IGZhbHNlXG4gICAgICB9LFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIG1ldGE6IF9leHRlbmRzKHt9LCB0aGlzLm9wdHMubWV0YSksXG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiB0cnVlLFxuICAgICAgICB0eXBlOiAnaW5mbycsXG4gICAgICAgIG1lc3NhZ2U6ICcnXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdG9yZVVuc3Vic2NyaWJlID0gdGhpcy5zdG9yZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaCkge1xuICAgICAgX3RoaXMuZW1pdCgnc3RhdGUtdXBkYXRlJywgcHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKTtcbiAgICAgIF90aGlzLnVwZGF0ZUFsbChuZXh0U3RhdGUpO1xuICAgIH0pO1xuXG4gICAgLy8gZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZ1xuICAgIC8vIHRoaXMudXBkYXRlTnVtID0gMFxuICAgIGlmICh0aGlzLm9wdHMuZGVidWcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvd1sndXBweUxvZyddID0gJyc7XG4gICAgICB3aW5kb3dbdGhpcy5vcHRzLmlkXSA9IHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkTGlzdGVuZXJzKCk7XG4gIH1cblxuICBVcHB5LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vbihldmVudCwgY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIG9mZihldmVudCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub2ZmKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLlxuICAgKiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXMuXG4gICAqXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUudXBkYXRlQWxsID0gZnVuY3Rpb24gdXBkYXRlQWxsKHN0YXRlKSB7XG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBwbHVnaW4udXBkYXRlKHN0YXRlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVXBkYXRlcyBzdGF0ZSB3aXRoIGEgcGF0Y2hcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhdGNoIHtmb286ICdiYXInfVxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gc2V0U3RhdGUocGF0Y2gpIHtcbiAgICB0aGlzLnN0b3JlLnNldFN0YXRlKHBhdGNoKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyBjdXJyZW50IHN0YXRlLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpO1xuICB9O1xuXG4gIC8qKlxuICAqIEJhY2sgY29tcGF0IGZvciB3aGVuIHVwcHkuc3RhdGUgaXMgdXNlZCBpbnN0ZWFkIG9mIHVwcHkuZ2V0U3RhdGUoKS5cbiAgKi9cblxuXG4gIC8qKlxuICAqIFNob3J0aGFuZCB0byBzZXQgc3RhdGUgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgKi9cbiAgVXBweS5wcm90b3R5cGUuc2V0RmlsZVN0YXRlID0gZnVuY3Rpb24gc2V0RmlsZVN0YXRlKGZpbGVJRCwgc3RhdGUpIHtcbiAgICB2YXIgX2V4dGVuZHMyO1xuXG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXHUyMDE5dCBzZXQgc3RhdGUgZm9yICcgKyBmaWxlSUQgKyAnICh0aGUgZmlsZSBjb3VsZCBoYXZlIGJlZW4gcmVtb3ZlZCknKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzLCAoX2V4dGVuZHMyID0ge30sIF9leHRlbmRzMltmaWxlSURdID0gX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdLCBzdGF0ZSksIF9leHRlbmRzMikpXG4gICAgfSk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUucmVzZXRQcm9ncmVzcyA9IGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3MoKSB7XG4gICAgdmFyIGRlZmF1bHRQcm9ncmVzcyA9IHtcbiAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgdXBsb2FkU3RhcnRlZDogZmFsc2VcbiAgICB9O1xuICAgIHZhciBmaWxlcyA9IF9leHRlbmRzKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpO1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICB2YXIgdXBkYXRlZEZpbGUgPSBfZXh0ZW5kcyh7fSwgZmlsZXNbZmlsZUlEXSk7XG4gICAgICB1cGRhdGVkRmlsZS5wcm9ncmVzcyA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZS5wcm9ncmVzcywgZGVmYXVsdFByb2dyZXNzKTtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGU7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICB0b3RhbFByb2dyZXNzOiAwXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPIERvY3VtZW50IG9uIHRoZSB3ZWJzaXRlXG4gICAgdGhpcy5lbWl0KCdyZXNldC1wcm9ncmVzcycpO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLmFkZFByZVByb2Nlc3NvciA9IGZ1bmN0aW9uIGFkZFByZVByb2Nlc3Nvcihmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZW1vdmVQcmVQcm9jZXNzb3IgPSBmdW5jdGlvbiByZW1vdmVQcmVQcm9jZXNzb3IoZm4pIHtcbiAgICB2YXIgaSA9IHRoaXMucHJlUHJvY2Vzc29ycy5pbmRleE9mKGZuKTtcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLmFkZFBvc3RQcm9jZXNzb3IgPSBmdW5jdGlvbiBhZGRQb3N0UHJvY2Vzc29yKGZuKSB7XG4gICAgdGhpcy5wb3N0UHJvY2Vzc29ycy5wdXNoKGZuKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZW1vdmVQb3N0UHJvY2Vzc29yID0gZnVuY3Rpb24gcmVtb3ZlUG9zdFByb2Nlc3Nvcihmbikge1xuICAgIHZhciBpID0gdGhpcy5wb3N0UHJvY2Vzc29ycy5pbmRleE9mKGZuKTtcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5hZGRVcGxvYWRlciA9IGZ1bmN0aW9uIGFkZFVwbG9hZGVyKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbik7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUucmVtb3ZlVXBsb2FkZXIgPSBmdW5jdGlvbiByZW1vdmVVcGxvYWRlcihmbikge1xuICAgIHZhciBpID0gdGhpcy51cGxvYWRlcnMuaW5kZXhPZihmbik7XG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICB0aGlzLnVwbG9hZGVycy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnNldE1ldGEgPSBmdW5jdGlvbiBzZXRNZXRhKGRhdGEpIHtcbiAgICB2YXIgdXBkYXRlZE1ldGEgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIGRhdGEpO1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcblxuICAgIE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgICBtZXRhOiBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2coJ0FkZGluZyBtZXRhZGF0YTonKTtcbiAgICB0aGlzLmxvZyhkYXRhKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbWV0YTogdXBkYXRlZE1ldGEsXG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuc2V0RmlsZU1ldGEgPSBmdW5jdGlvbiBzZXRGaWxlTWV0YShmaWxlSUQsIGRhdGEpIHtcbiAgICB2YXIgdXBkYXRlZEZpbGVzID0gX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcyk7XG4gICAgaWYgKCF1cGRhdGVkRmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhpcy5sb2coJ1dhcyB0cnlpbmcgdG8gc2V0IG1ldGFkYXRhIGZvciBhIGZpbGUgdGhhdOKAmXMgbm90IHdpdGggdXMgYW55bW9yZTogJywgZmlsZUlEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG5ld01ldGEgPSBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSk7XG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgIG1ldGE6IG5ld01ldGFcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IGEgZmlsZSBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSUQgVGhlIElEIG9mIHRoZSBmaWxlIG9iamVjdCB0byByZXR1cm4uXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuZ2V0RmlsZSA9IGZ1bmN0aW9uIGdldEZpbGUoZmlsZUlEKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGZpbGVzIGluIGFuIGFycmF5LlxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmdldEZpbGVzID0gZnVuY3Rpb24gZ2V0RmlsZXMoKSB7XG4gICAgdmFyIF9nZXRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKSxcbiAgICAgICAgZmlsZXMgPSBfZ2V0U3RhdGUuZmlsZXM7XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmlsZXMpLm1hcChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICByZXR1cm4gZmlsZXNbZmlsZUlEXTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgKlxuICAqIEBwcml2YXRlXG4gICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5fY2hlY2tNaW5OdW1iZXJPZkZpbGVzID0gZnVuY3Rpb24gX2NoZWNrTWluTnVtYmVyT2ZGaWxlcyhmaWxlcykge1xuICAgIHZhciBtaW5OdW1iZXJPZkZpbGVzID0gdGhpcy5vcHRzLnJlc3RyaWN0aW9ucy5taW5OdW1iZXJPZkZpbGVzO1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKGZpbGVzKS5sZW5ndGggPCBtaW5OdW1iZXJPZkZpbGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJycgKyB0aGlzLmkxOG4oJ3lvdUhhdmVUb0F0TGVhc3RTZWxlY3RYJywgeyBzbWFydF9jb3VudDogbWluTnVtYmVyT2ZGaWxlcyB9KSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAqIENoZWNrIGlmIGZpbGUgcGFzc2VzIGEgc2V0IG9mIHJlc3RyaWN0aW9ucyBzZXQgaW4gb3B0aW9uczogbWF4RmlsZVNpemUsXG4gICogbWF4TnVtYmVyT2ZGaWxlcyBhbmQgYWxsb3dlZEZpbGVUeXBlcy5cbiAgKlxuICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIG9iamVjdCB0byBjaGVja1xuICAqIEBwcml2YXRlXG4gICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5fY2hlY2tSZXN0cmljdGlvbnMgPSBmdW5jdGlvbiBfY2hlY2tSZXN0cmljdGlvbnMoZmlsZSkge1xuICAgIHZhciBfb3B0cyRyZXN0cmljdGlvbnMgPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zLFxuICAgICAgICBtYXhGaWxlU2l6ZSA9IF9vcHRzJHJlc3RyaWN0aW9ucy5tYXhGaWxlU2l6ZSxcbiAgICAgICAgbWF4TnVtYmVyT2ZGaWxlcyA9IF9vcHRzJHJlc3RyaWN0aW9ucy5tYXhOdW1iZXJPZkZpbGVzLFxuICAgICAgICBhbGxvd2VkRmlsZVR5cGVzID0gX29wdHMkcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXM7XG5cblxuICAgIGlmIChtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5nZXRTdGF0ZSgpLmZpbGVzKS5sZW5ndGggKyAxID4gbWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJycgKyB0aGlzLmkxOG4oJ3lvdUNhbk9ubHlVcGxvYWRYJywgeyBzbWFydF9jb3VudDogbWF4TnVtYmVyT2ZGaWxlcyB9KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFsbG93ZWRGaWxlVHlwZXMpIHtcbiAgICAgIHZhciBpc0NvcnJlY3RGaWxlVHlwZSA9IGFsbG93ZWRGaWxlVHlwZXMuZmlsdGVyKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIC8vIGlmICghZmlsZS50eXBlKSByZXR1cm4gZmFsc2VcblxuICAgICAgICAvLyBpcyB0aGlzIGlzIGEgbWltZS10eXBlXG4gICAgICAgIGlmICh0eXBlLmluZGV4T2YoJy8nKSA+IC0xKSB7XG4gICAgICAgICAgaWYgKCFmaWxlLnR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbWF0Y2goZmlsZS50eXBlLCB0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJykge1xuICAgICAgICAgIGlmIChmaWxlLmV4dGVuc2lvbiA9PT0gdHlwZS5zdWJzdHIoMSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLmxlbmd0aCA+IDA7XG5cbiAgICAgIGlmICghaXNDb3JyZWN0RmlsZVR5cGUpIHtcbiAgICAgICAgdmFyIGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLmkxOG4oJ3lvdUNhbk9ubHlVcGxvYWRGaWxlVHlwZXMnKSArICcgJyArIGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXhGaWxlU2l6ZSkge1xuICAgICAgaWYgKGZpbGUuZGF0YS5zaXplID4gbWF4RmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuaTE4bignZXhjZWVkc1NpemUnKSArICcgJyArIHByZXR0eUJ5dGVzKG1heEZpbGVTaXplKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAqIEFkZCBhIG5ldyBmaWxlIHRvIGBzdGF0ZS5maWxlc2AuIFRoaXMgd2lsbCBydW4gYG9uQmVmb3JlRmlsZUFkZGVkYCxcbiAgKiB0cnkgdG8gZ3Vlc3MgZmlsZSB0eXBlIGluIGEgY2xldmVyIHdheSwgY2hlY2sgZmlsZSBhZ2FpbnN0IHJlc3RyaWN0aW9ucyxcbiAgKiBhbmQgc3RhcnQgYW4gdXBsb2FkIGlmIGBhdXRvUHJvY2VlZCA9PT0gdHJ1ZWAuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gZmlsZSBvYmplY3QgdG8gYWRkXG4gICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5hZGRGaWxlID0gZnVuY3Rpb24gYWRkRmlsZShmaWxlKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXMsXG4gICAgICAgIF9leHRlbmRzMztcblxuICAgIHZhciBfZ2V0U3RhdGUyID0gdGhpcy5nZXRTdGF0ZSgpLFxuICAgICAgICBmaWxlcyA9IF9nZXRTdGF0ZTIuZmlsZXM7XG5cbiAgICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uIG9uRXJyb3IobXNnKSB7XG4gICAgICB2YXIgZXJyID0gKHR5cGVvZiBtc2cgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG1zZykpID09PSAnb2JqZWN0JyA/IG1zZyA6IG5ldyBFcnJvcihtc2cpO1xuICAgICAgX3RoaXMyLmxvZyhlcnIubWVzc2FnZSk7XG4gICAgICBfdGhpczIuaW5mbyhlcnIubWVzc2FnZSwgJ2Vycm9yJywgNTAwMCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfTtcblxuICAgIHZhciBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZUZpbGVBZGRlZChmaWxlLCBmaWxlcyk7XG5cbiAgICBpZiAob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmxvZygnTm90IGFkZGluZyBmaWxlIGJlY2F1c2Ugb25CZWZvcmVGaWxlQWRkZWQgcmV0dXJuZWQgZmFsc2UnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKHR5cGVvZiBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQpKSA9PT0gJ29iamVjdCcgJiYgb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQpIHtcbiAgICAgIC8vIHdhcm5pbmcgYWZ0ZXIgdGhlIGNoYW5nZSBpbiAwLjI0XG4gICAgICBpZiAob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQudGhlbikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvbkJlZm9yZUZpbGVBZGRlZCgpIHJldHVybmVkIGEgUHJvbWlzZSwgYnV0IHRoaXMgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZC4gSXQgbXVzdCBiZSBzeW5jaHJvbm91cy4nKTtcbiAgICAgIH1cbiAgICAgIGZpbGUgPSBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdDtcbiAgICB9XG5cbiAgICB2YXIgZmlsZVR5cGUgPSBnZXRGaWxlVHlwZShmaWxlKTtcbiAgICB2YXIgZmlsZU5hbWUgPSB2b2lkIDA7XG4gICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgZmlsZU5hbWUgPSBmaWxlLm5hbWU7XG4gICAgfSBlbHNlIGlmIChmaWxlVHlwZS5zcGxpdCgnLycpWzBdID09PSAnaW1hZ2UnKSB7XG4gICAgICBmaWxlTmFtZSA9IGZpbGVUeXBlLnNwbGl0KCcvJylbMF0gKyAnLicgKyBmaWxlVHlwZS5zcGxpdCgnLycpWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlTmFtZSA9ICdub25hbWUnO1xuICAgIH1cbiAgICB2YXIgZmlsZUV4dGVuc2lvbiA9IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uKGZpbGVOYW1lKS5leHRlbnNpb247XG4gICAgdmFyIGlzUmVtb3RlID0gZmlsZS5pc1JlbW90ZSB8fCBmYWxzZTtcblxuICAgIHZhciBmaWxlSUQgPSBnZW5lcmF0ZUZpbGVJRChmaWxlKTtcblxuICAgIHZhciBtZXRhID0gZmlsZS5tZXRhIHx8IHt9O1xuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lO1xuICAgIG1ldGEudHlwZSA9IGZpbGVUeXBlO1xuXG4gICAgdmFyIG5ld0ZpbGUgPSB7XG4gICAgICBzb3VyY2U6IGZpbGUuc291cmNlIHx8ICcnLFxuICAgICAgaWQ6IGZpbGVJRCxcbiAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgZXh0ZW5zaW9uOiBmaWxlRXh0ZW5zaW9uIHx8ICcnLFxuICAgICAgbWV0YTogX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5tZXRhLCBtZXRhKSxcbiAgICAgIHR5cGU6IGZpbGVUeXBlLFxuICAgICAgZGF0YTogZmlsZS5kYXRhLFxuICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5kYXRhLnNpemUgfHwgMCxcbiAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICB1cGxvYWRTdGFydGVkOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHNpemU6IGZpbGUuZGF0YS5zaXplIHx8IDAsXG4gICAgICBpc1JlbW90ZTogaXNSZW1vdGUsXG4gICAgICByZW1vdGU6IGZpbGUucmVtb3RlIHx8ICcnLFxuICAgICAgcHJldmlldzogZmlsZS5wcmV2aWV3XG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9jaGVja1Jlc3RyaWN0aW9ucyhuZXdGaWxlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIG9uRXJyb3IoZXJyKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiBfZXh0ZW5kcyh7fSwgZmlsZXMsIChfZXh0ZW5kczMgPSB7fSwgX2V4dGVuZHMzW2ZpbGVJRF0gPSBuZXdGaWxlLCBfZXh0ZW5kczMpKVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSk7XG4gICAgdGhpcy5sb2coJ0FkZGVkIGZpbGU6ICcgKyBmaWxlTmFtZSArICcsICcgKyBmaWxlSUQgKyAnLCBtaW1lIHR5cGU6ICcgKyBmaWxlVHlwZSk7XG5cbiAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkICYmICF0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzMi5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IG51bGw7XG4gICAgICAgIF90aGlzMi51cGxvYWQoKS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UgfHwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCA0KTtcbiAgICB9XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUucmVtb3ZlRmlsZSA9IGZ1bmN0aW9uIHJlbW92ZUZpbGUoZmlsZUlEKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICB2YXIgX2dldFN0YXRlMyA9IHRoaXMuZ2V0U3RhdGUoKSxcbiAgICAgICAgZmlsZXMgPSBfZ2V0U3RhdGUzLmZpbGVzLFxuICAgICAgICBjdXJyZW50VXBsb2FkcyA9IF9nZXRTdGF0ZTMuY3VycmVudFVwbG9hZHM7XG5cbiAgICB2YXIgdXBkYXRlZEZpbGVzID0gX2V4dGVuZHMoe30sIGZpbGVzKTtcbiAgICB2YXIgcmVtb3ZlZEZpbGUgPSB1cGRhdGVkRmlsZXNbZmlsZUlEXTtcbiAgICBkZWxldGUgdXBkYXRlZEZpbGVzW2ZpbGVJRF07XG5cbiAgICAvLyBSZW1vdmUgdGhpcyBmaWxlIGZyb20gaXRzIGBjdXJyZW50VXBsb2FkYC5cbiAgICB2YXIgdXBkYXRlZFVwbG9hZHMgPSBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHMpO1xuICAgIHZhciByZW1vdmVVcGxvYWRzID0gW107XG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goZnVuY3Rpb24gKHVwbG9hZElEKSB7XG4gICAgICB2YXIgbmV3RmlsZUlEcyA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5maWxlSURzLmZpbHRlcihmdW5jdGlvbiAodXBsb2FkRmlsZUlEKSB7XG4gICAgICAgIHJldHVybiB1cGxvYWRGaWxlSUQgIT09IGZpbGVJRDtcbiAgICAgIH0pO1xuICAgICAgLy8gUmVtb3ZlIHRoZSB1cGxvYWQgaWYgbm8gZmlsZXMgYXJlIGFzc29jaWF0ZWQgd2l0aCBpdCBhbnltb3JlLlxuICAgICAgaWYgKG5ld0ZpbGVJRHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlbW92ZVVwbG9hZHMucHVzaCh1cGxvYWRJRCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlZFVwbG9hZHNbdXBsb2FkSURdID0gX2V4dGVuZHMoe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgICBmaWxlSURzOiBuZXdGaWxlSURzXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IHVwZGF0ZWRVcGxvYWRzLFxuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlc1xuICAgIH0pO1xuXG4gICAgcmVtb3ZlVXBsb2Fkcy5mb3JFYWNoKGZ1bmN0aW9uICh1cGxvYWRJRCkge1xuICAgICAgX3RoaXMzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpO1xuICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGUpO1xuICAgIHRoaXMubG9nKCdGaWxlIHJlbW92ZWQ6ICcgKyByZW1vdmVkRmlsZS5pZCk7XG5cbiAgICAvLyBDbGVhbiB1cCBvYmplY3QgVVJMcy5cbiAgICBpZiAocmVtb3ZlZEZpbGUucHJldmlldyAmJiBpc09iamVjdFVSTChyZW1vdmVkRmlsZS5wcmV2aWV3KSkge1xuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChyZW1vdmVkRmlsZS5wcmV2aWV3KTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZygnUmVtb3ZlZCBmaWxlOiAnICsgZmlsZUlEKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5wYXVzZVJlc3VtZSA9IGZ1bmN0aW9uIHBhdXNlUmVzdW1lKGZpbGVJRCkge1xuICAgIGlmICh0aGlzLmdldEZpbGUoZmlsZUlEKS51cGxvYWRDb21wbGV0ZSkgcmV0dXJuO1xuXG4gICAgdmFyIHdhc1BhdXNlZCA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpLmlzUGF1c2VkIHx8IGZhbHNlO1xuICAgIHZhciBpc1BhdXNlZCA9ICF3YXNQYXVzZWQ7XG5cbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlSUQsIHtcbiAgICAgIGlzUGF1c2VkOiBpc1BhdXNlZFxuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQtcGF1c2UnLCBmaWxlSUQsIGlzUGF1c2VkKTtcblxuICAgIHJldHVybiBpc1BhdXNlZDtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5wYXVzZUFsbCA9IGZ1bmN0aW9uIHBhdXNlQWxsKCkge1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICB2YXIgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcyA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gIXVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJiB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZDtcbiAgICB9KTtcblxuICAgIGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgdmFyIHVwZGF0ZWRGaWxlID0gX2V4dGVuZHMoe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZTtcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KTtcblxuICAgIHRoaXMuZW1pdCgncGF1c2UtYWxsJyk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUucmVzdW1lQWxsID0gZnVuY3Rpb24gcmVzdW1lQWxsKCkge1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICB2YXIgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcyA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gIXVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJiB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZDtcbiAgICB9KTtcblxuICAgIGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMuZm9yRWFjaChmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgdmFyIHVwZGF0ZWRGaWxlID0gX2V4dGVuZHMoe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgICB9KTtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogdXBkYXRlZEZpbGVzIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdyZXN1bWUtYWxsJyk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUucmV0cnlBbGwgPSBmdW5jdGlvbiByZXRyeUFsbCgpIHtcbiAgICB2YXIgdXBkYXRlZEZpbGVzID0gX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcyk7XG4gICAgdmFyIGZpbGVzVG9SZXRyeSA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlZEZpbGVzW2ZpbGVdLmVycm9yO1xuICAgIH0pO1xuXG4gICAgZmlsZXNUb1JldHJ5LmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHZhciB1cGRhdGVkRmlsZSA9IF9leHRlbmRzKHt9LCB1cGRhdGVkRmlsZXNbZmlsZV0sIHtcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgICAgfSk7XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZTtcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCdyZXRyeS1hbGwnLCBmaWxlc1RvUmV0cnkpO1xuXG4gICAgdmFyIHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKGZpbGVzVG9SZXRyeSk7XG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRCk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuY2FuY2VsQWxsID0gZnVuY3Rpb24gY2FuY2VsQWxsKCkge1xuICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgdGhpcy5lbWl0KCdjYW5jZWwtYWxsJyk7XG5cbiAgICAvLyBUT0RPIE9yIHNob3VsZCB3ZSBqdXN0IGNhbGwgcmVtb3ZlRmlsZSBvbiBhbGwgZmlsZXM/XG5cbiAgICB2YXIgX2dldFN0YXRlNCA9IHRoaXMuZ2V0U3RhdGUoKSxcbiAgICAgICAgY3VycmVudFVwbG9hZHMgPSBfZ2V0U3RhdGU0LmN1cnJlbnRVcGxvYWRzO1xuXG4gICAgdmFyIHVwbG9hZElEcyA9IE9iamVjdC5rZXlzKGN1cnJlbnRVcGxvYWRzKTtcblxuICAgIHVwbG9hZElEcy5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgX3RoaXM0Ll9yZW1vdmVVcGxvYWQoaWQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczoge30sXG4gICAgICB0b3RhbFByb2dyZXNzOiAwLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZXRyeVVwbG9hZCA9IGZ1bmN0aW9uIHJldHJ5VXBsb2FkKGZpbGVJRCkge1xuICAgIHZhciB1cGRhdGVkRmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcbiAgICB2YXIgdXBkYXRlZEZpbGUgPSBfZXh0ZW5kcyh7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHsgZXJyb3I6IG51bGwsIGlzUGF1c2VkOiBmYWxzZSB9KTtcbiAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IHVwZGF0ZWRGaWxlO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHVwZGF0ZWRGaWxlc1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQtcmV0cnknLCBmaWxlSUQpO1xuXG4gICAgdmFyIHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKFtmaWxlSURdKTtcbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHRoaXMuY2FuY2VsQWxsKCk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuX2NhbGN1bGF0ZVByb2dyZXNzID0gZnVuY3Rpb24gX2NhbGN1bGF0ZVByb2dyZXNzKGZpbGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgdGhpcy5sb2coJ05vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnICsgZmlsZS5pZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgcHJvZ3Jlc3M6IF9leHRlbmRzKHt9LCB0aGlzLmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3MsIHtcbiAgICAgICAgYnl0ZXNVcGxvYWRlZDogZGF0YS5ieXRlc1VwbG9hZGVkLFxuICAgICAgICBieXRlc1RvdGFsOiBkYXRhLmJ5dGVzVG90YWwsXG4gICAgICAgIHBlcmNlbnRhZ2U6IE1hdGguZmxvb3IoKGRhdGEuYnl0ZXNVcGxvYWRlZCAvIGRhdGEuYnl0ZXNUb3RhbCAqIDEwMCkudG9GaXhlZCgyKSlcbiAgICAgIH0pXG4gICAgfSk7XG5cbiAgICB0aGlzLl9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKCk7XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MgPSBmdW5jdGlvbiBfY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpIHtcbiAgICAvLyBjYWxjdWxhdGUgdG90YWwgcHJvZ3Jlc3MsIHVzaW5nIHRoZSBudW1iZXIgb2YgZmlsZXMgY3VycmVudGx5IHVwbG9hZGluZyxcbiAgICAvLyBtdWx0aXBsaWVkIGJ5IDEwMCBhbmQgdGhlIHN1bW0gb2YgaW5kaXZpZHVhbCBwcm9ncmVzcyBvZiBlYWNoIGZpbGVcbiAgICB2YXIgZmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKTtcblxuICAgIHZhciBpblByb2dyZXNzID0gT2JqZWN0LmtleXMoZmlsZXMpLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgcmV0dXJuIGZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQ7XG4gICAgfSk7XG4gICAgdmFyIHByb2dyZXNzTWF4ID0gaW5Qcm9ncmVzcy5sZW5ndGggKiAxMDA7XG4gICAgdmFyIHByb2dyZXNzQWxsID0gMDtcbiAgICBpblByb2dyZXNzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHByb2dyZXNzQWxsID0gcHJvZ3Jlc3NBbGwgKyBmaWxlc1tmaWxlXS5wcm9ncmVzcy5wZXJjZW50YWdlO1xuICAgIH0pO1xuXG4gICAgdmFyIHRvdGFsUHJvZ3Jlc3MgPSBwcm9ncmVzc01heCA9PT0gMCA/IDAgOiBNYXRoLmZsb29yKChwcm9ncmVzc0FsbCAqIDEwMCAvIHByb2dyZXNzTWF4KS50b0ZpeGVkKDIpKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdG90YWxQcm9ncmVzczogdG90YWxQcm9ncmVzc1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgbGlzdGVuZXJzIGZvciBhbGwgZ2xvYmFsIGFjdGlvbnMsIGxpa2U6XG4gICAqIGBlcnJvcmAsIGBmaWxlLXJlbW92ZWRgLCBgdXBsb2FkLXByb2dyZXNzYFxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLl9hZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiBfYWRkTGlzdGVuZXJzKCkge1xuICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgdGhpcy5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIF90aGlzNS5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigndXBsb2FkLWVycm9yJywgZnVuY3Rpb24gKGZpbGUsIGVycm9yKSB7XG4gICAgICBfdGhpczUuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICBfdGhpczUuc2V0U3RhdGUoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcblxuICAgICAgdmFyIG1lc3NhZ2UgPSBfdGhpczUuaTE4bignZmFpbGVkVG9VcGxvYWQnLCB7IGZpbGU6IGZpbGUubmFtZSB9KTtcbiAgICAgIGlmICgodHlwZW9mIGVycm9yID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihlcnJvcikpID09PSAnb2JqZWN0JyAmJiBlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2UgPSB7IG1lc3NhZ2U6IG1lc3NhZ2UsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICAgIH1cbiAgICAgIF90aGlzNS5pbmZvKG1lc3NhZ2UsICdlcnJvcicsIDUwMDApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigndXBsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXM1LnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtc3RhcnRlZCcsIGZ1bmN0aW9uIChmaWxlLCB1cGxvYWQpIHtcbiAgICAgIGlmICghX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgX3RoaXM1LmxvZygnTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyBmaWxlLmlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgX3RoaXM1LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgdXBsb2FkU3RhcnRlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgICAgICBieXRlc1VwbG9hZGVkOiAwLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IGZpbGUuc2l6ZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHVwbG9hZCBwcm9ncmVzcyBldmVudHMgY2FuIG9jY3VyIGZyZXF1ZW50bHksIGVzcGVjaWFsbHkgd2hlbiB5b3UgaGF2ZSBhIGdvb2RcbiAgICAvLyBjb25uZWN0aW9uIHRvIHRoZSByZW1vdGUgc2VydmVyLiBUaGVyZWZvcmUsIHdlIGFyZSB0aHJvdHRlbGluZyB0aGVtIHRvXG4gICAgLy8gcHJldmVudCBhY2Nlc3NpdmUgZnVuY3Rpb24gY2FsbHMuXG4gICAgLy8gc2VlIGFsc286IGh0dHBzOi8vZ2l0aHViLmNvbS90dXMvdHVzLWpzLWNsaWVudC9jb21taXQvOTk0MGYyN2IyMzYxZmQ3ZTEwYmE1OGIwOWI2MGQ4MjQyMjE4M2JiYlxuICAgIC8vIGNvbnN0IF90aHJvdHRsZWRDYWxjdWxhdGVQcm9ncmVzcyA9IHRocm90dGxlKHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzLCAxMDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1wcm9ncmVzcycsIHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzKTtcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdWNjZXNzJywgZnVuY3Rpb24gKGZpbGUsIHVwbG9hZFJlc3AsIHVwbG9hZFVSTCkge1xuICAgICAgdmFyIGN1cnJlbnRQcm9ncmVzcyA9IF90aGlzNS5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzO1xuICAgICAgX3RoaXM1LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBfZXh0ZW5kcyh7fSwgY3VycmVudFByb2dyZXNzLCB7XG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IHRydWUsXG4gICAgICAgICAgcGVyY2VudGFnZTogMTAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsXG4gICAgICAgIH0pLFxuICAgICAgICB1cGxvYWRVUkw6IHVwbG9hZFVSTCxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgX3RoaXM1Ll9jYWxjdWxhdGVUb3RhbFByb2dyZXNzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgZnVuY3Rpb24gKGZpbGUsIHByb2dyZXNzKSB7XG4gICAgICBpZiAoIV90aGlzNS5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIF90aGlzNS5sb2coJ05vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnICsgZmlsZS5pZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIF90aGlzNS5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczogX2V4dGVuZHMoe30sIF90aGlzNS5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzLCB7XG4gICAgICAgICAgcHJlcHJvY2VzczogcHJvZ3Jlc3NcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigncHJlcHJvY2Vzcy1jb21wbGV0ZScsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBpZiAoIV90aGlzNS5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIF90aGlzNS5sb2coJ05vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnICsgZmlsZS5pZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBmaWxlcyA9IF9leHRlbmRzKHt9LCBfdGhpczUuZ2V0U3RhdGUoKS5maWxlcyk7XG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IF9leHRlbmRzKHt9LCBmaWxlc1tmaWxlLmlkXSwge1xuICAgICAgICBwcm9ncmVzczogX2V4dGVuZHMoe30sIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzKVxuICAgICAgfSk7XG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucHJlcHJvY2VzcztcblxuICAgICAgX3RoaXM1LnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigncG9zdHByb2Nlc3MtcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZmlsZSwgcHJvZ3Jlc3MpIHtcbiAgICAgIGlmICghX3RoaXM1LmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgX3RoaXM1LmxvZygnTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyBmaWxlLmlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgX3RoaXM1LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBfZXh0ZW5kcyh7fSwgX3RoaXM1LmdldFN0YXRlKCkuZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MsIHtcbiAgICAgICAgICBwb3N0cHJvY2VzczogcHJvZ3Jlc3NcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigncG9zdHByb2Nlc3MtY29tcGxldGUnLCBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgaWYgKCFfdGhpczUuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICBfdGhpczUubG9nKCdOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJyArIGZpbGUuaWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZmlsZXMgPSBfZXh0ZW5kcyh7fSwgX3RoaXM1LmdldFN0YXRlKCkuZmlsZXMpO1xuICAgICAgZmlsZXNbZmlsZS5pZF0gPSBfZXh0ZW5kcyh7fSwgZmlsZXNbZmlsZS5pZF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IF9leHRlbmRzKHt9LCBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcylcbiAgICAgIH0pO1xuICAgICAgZGVsZXRlIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzLnBvc3Rwcm9jZXNzO1xuICAgICAgLy8gVE9ETyBzaG91bGQgd2Ugc2V0IHNvbWUga2luZCBvZiBgZnVsbHlDb21wbGV0ZWAgcHJvcGVydHkgb24gdGhlIGZpbGUgb2JqZWN0XG4gICAgICAvLyBzbyBpdCdzIGVhc2llciB0byBzZWUgdGhhdCB0aGUgZmlsZSBpcyB1cGxvYWTigKZmdWxseSBjb21wbGV0ZeKApnJhdGhlciB0aGFuXG4gICAgICAvLyB3aGF0IHdlIGhhdmUgdG8gZG8gbm93IChgdXBsb2FkQ29tcGxldGUgJiYgIXBvc3Rwcm9jZXNzYClcblxuICAgICAgX3RoaXM1LnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbigncmVzdG9yZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBGaWxlcyBtYXkgaGF2ZSBjaGFuZ2VkLS1lbnN1cmUgcHJvZ3Jlc3MgaXMgc3RpbGwgYWNjdXJhdGUuXG4gICAgICBfdGhpczUuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKTtcbiAgICB9KTtcblxuICAgIC8vIHNob3cgaW5mb3JtZXIgaWYgb2ZmbGluZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29ubGluZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzNS51cGRhdGVPbmxpbmVTdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczUudXBkYXRlT25saW5lU3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXM1LnVwZGF0ZU9ubGluZVN0YXR1cygpO1xuICAgICAgfSwgMzAwMCk7XG4gICAgfVxuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLnVwZGF0ZU9ubGluZVN0YXR1cyA9IGZ1bmN0aW9uIHVwZGF0ZU9ubGluZVN0YXR1cygpIHtcbiAgICB2YXIgb25saW5lID0gdHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lIDogdHJ1ZTtcbiAgICBpZiAoIW9ubGluZSkge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vZmZsaW5lJyk7XG4gICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdub0ludGVybmV0Q29ubmVjdGlvbicpLCAnZXJyb3InLCAwKTtcbiAgICAgIHRoaXMud2FzT2ZmbGluZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb25saW5lJyk7XG4gICAgICBpZiAodGhpcy53YXNPZmZsaW5lKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnYmFjay1vbmxpbmUnKTtcbiAgICAgICAgdGhpcy5pbmZvKHRoaXMuaTE4bignY29ubmVjdGVkVG9JbnRlcm5ldCcpLCAnc3VjY2VzcycsIDMwMDApO1xuICAgICAgICB0aGlzLndhc09mZmxpbmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgVXBweS5wcm90b3R5cGUuZ2V0SUQgPSBmdW5jdGlvbiBnZXRJRCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBwbHVnaW4gd2l0aCBDb3JlLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gUGx1Z2luIG9iamVjdFxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdHNdIG9iamVjdCB3aXRoIG9wdGlvbnMgdG8gYmUgcGFzc2VkIHRvIFBsdWdpblxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHNlbGYgZm9yIGNoYWluaW5nXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKFBsdWdpbiwgb3B0cykge1xuICAgIGlmICh0eXBlb2YgUGx1Z2luICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgbXNnID0gJ0V4cGVjdGVkIGEgcGx1Z2luIGNsYXNzLCBidXQgZ290ICcgKyAoUGx1Z2luID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIFBsdWdpbiA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoUGx1Z2luKSkgKyAnLicgKyAnIFBsZWFzZSB2ZXJpZnkgdGhhdCB0aGUgcGx1Z2luIHdhcyBpbXBvcnRlZCBhbmQgc3BlbGxlZCBjb3JyZWN0bHkuJztcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICAvLyBJbnN0YW50aWF0ZVxuICAgIHZhciBwbHVnaW4gPSBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpO1xuICAgIHZhciBwbHVnaW5JZCA9IHBsdWdpbi5pZDtcbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdID0gdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSB8fCBbXTtcblxuICAgIGlmICghcGx1Z2luSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGFuIGlkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwbHVnaW4udHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYSB0eXBlJyk7XG4gICAgfVxuXG4gICAgdmFyIGV4aXN0c1BsdWdpbkFscmVhZHkgPSB0aGlzLmdldFBsdWdpbihwbHVnaW5JZCk7XG4gICAgaWYgKGV4aXN0c1BsdWdpbkFscmVhZHkpIHtcbiAgICAgIHZhciBfbXNnID0gJ0FscmVhZHkgZm91bmQgYSBwbHVnaW4gbmFtZWQgXFwnJyArIGV4aXN0c1BsdWdpbkFscmVhZHkuaWQgKyAnXFwnLiAnICsgKCdUcmllZCB0byB1c2U6IFxcJycgKyBwbHVnaW5JZCArICdcXCcuXFxuJykgKyAnVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgXFwnaWRcXCcgb3B0aW9ucy4gU2VlIGh0dHBzOi8vdXBweS5pby9kb2NzL3BsdWdpbnMvI2lkLic7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoX21zZyk7XG4gICAgfVxuXG4gICAgdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXS5wdXNoKHBsdWdpbik7XG4gICAgcGx1Z2luLmluc3RhbGwoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBGaW5kIG9uZSBQbHVnaW4gYnkgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgZGVzY3JpcHRpb25cbiAgICogQHJldHVybiB7b2JqZWN0IHwgYm9vbGVhbn1cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5nZXRQbHVnaW4gPSBmdW5jdGlvbiBnZXRQbHVnaW4obmFtZSkge1xuICAgIHZhciBmb3VuZFBsdWdpbiA9IG51bGw7XG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IHBsdWdpbi5pZDtcbiAgICAgIGlmIChwbHVnaW5OYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGZvdW5kUGx1Z2luID0gcGx1Z2luO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvdW5kUGx1Z2luO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIHRocm91Z2ggYWxsIGB1c2VgZCBwbHVnaW5zLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRob2QgdGhhdCB3aWxsIGJlIHJ1biBvbiBlYWNoIHBsdWdpblxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLml0ZXJhdGVQbHVnaW5zID0gZnVuY3Rpb24gaXRlcmF0ZVBsdWdpbnMobWV0aG9kKSB7XG4gICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnBsdWdpbnMpLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpblR5cGUpIHtcbiAgICAgIF90aGlzNi5wbHVnaW5zW3BsdWdpblR5cGVdLmZvckVhY2gobWV0aG9kKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVW5pbnN0YWxsIGFuZCByZW1vdmUgYSBwbHVnaW4uXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbnN0YW5jZSBUaGUgcGx1Z2luIGluc3RhbmNlIHRvIHJlbW92ZS5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5yZW1vdmVQbHVnaW4gPSBmdW5jdGlvbiByZW1vdmVQbHVnaW4oaW5zdGFuY2UpIHtcbiAgICB0aGlzLmxvZygnUmVtb3ZpbmcgcGx1Z2luICcgKyBpbnN0YW5jZS5pZCk7XG4gICAgdGhpcy5lbWl0KCdwbHVnaW4tcmVtb3ZlJywgaW5zdGFuY2UpO1xuXG4gICAgaWYgKGluc3RhbmNlLnVuaW5zdGFsbCkge1xuICAgICAgaW5zdGFuY2UudW5pbnN0YWxsKCk7XG4gICAgfVxuXG4gICAgdmFyIGxpc3QgPSB0aGlzLnBsdWdpbnNbaW5zdGFuY2UudHlwZV0uc2xpY2UoKTtcbiAgICB2YXIgaW5kZXggPSBsaXN0LmluZGV4T2YoaW5zdGFuY2UpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMucGx1Z2luc1tpbnN0YW5jZS50eXBlXSA9IGxpc3Q7XG4gICAgfVxuXG4gICAgdmFyIHVwZGF0ZWRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKTtcbiAgICBkZWxldGUgdXBkYXRlZFN0YXRlLnBsdWdpbnNbaW5zdGFuY2UuaWRdO1xuICAgIHRoaXMuc2V0U3RhdGUodXBkYXRlZFN0YXRlKTtcbiAgfTtcblxuICAvKipcbiAgICogVW5pbnN0YWxsIGFsbCBwbHVnaW5zIGFuZCBjbG9zZSBkb3duIHRoaXMgVXBweSBpbnN0YW5jZS5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgdGhpcy5sb2coJ0Nsb3NpbmcgVXBweSBpbnN0YW5jZSAnICsgdGhpcy5vcHRzLmlkICsgJzogcmVtb3ZpbmcgYWxsIGZpbGVzIGFuZCB1bmluc3RhbGxpbmcgcGx1Z2lucycpO1xuXG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgdGhpcy5fc3RvcmVVbnN1YnNjcmliZSgpO1xuXG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBfdGhpczcucmVtb3ZlUGx1Z2luKHBsdWdpbik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICogU2V0IGluZm8gbWVzc2FnZSBpbiBgc3RhdGUuaW5mb2AsIHNvIHRoYXQgVUkgcGx1Z2lucyBsaWtlIGBJbmZvcm1lcmBcbiAgKiBjYW4gZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nIHwgb2JqZWN0fSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBpbmZvcm1lclxuICAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV1cbiAgKiBAcGFyYW0ge251bWJlcn0gW2R1cmF0aW9uXVxuICAqL1xuXG4gIFVwcHkucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbiBpbmZvKG1lc3NhZ2UpIHtcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogJ2luZm8nO1xuICAgIHZhciBkdXJhdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMzAwMDtcblxuICAgIHZhciBpc0NvbXBsZXhNZXNzYWdlID0gKHR5cGVvZiBtZXNzYWdlID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihtZXNzYWdlKSkgPT09ICdvYmplY3QnO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpbmZvOiB7XG4gICAgICAgIGlzSGlkZGVuOiBmYWxzZSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgbWVzc2FnZTogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UubWVzc2FnZSA6IG1lc3NhZ2UsXG4gICAgICAgIGRldGFpbHM6IGlzQ29tcGxleE1lc3NhZ2UgPyBtZXNzYWdlLmRldGFpbHMgOiBudWxsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoJ2luZm8tdmlzaWJsZScpO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaW5mb1RpbWVvdXRJRCk7XG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaGlkZSB0aGUgaW5mb3JtZXIgYWZ0ZXIgYGR1cmF0aW9uYCBtaWxsaXNlY29uZHNcbiAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSBzZXRUaW1lb3V0KHRoaXMuaGlkZUluZm8sIGR1cmF0aW9uKTtcbiAgfTtcblxuICBVcHB5LnByb3RvdHlwZS5oaWRlSW5mbyA9IGZ1bmN0aW9uIGhpZGVJbmZvKCkge1xuICAgIHZhciBuZXdJbmZvID0gX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5pbmZvLCB7XG4gICAgICBpc0hpZGRlbjogdHJ1ZVxuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogbmV3SW5mb1xuICAgIH0pO1xuICAgIHRoaXMuZW1pdCgnaW5mby1oaWRkZW4nKTtcbiAgfTtcblxuICAvKipcbiAgICogTG9ncyBzdHVmZiB0byBjb25zb2xlLCBvbmx5IGlmIGBkZWJ1Z2AgaXMgc2V0IHRvIHRydWUuIFNpbGVudCBpbiBwcm9kdWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG1zZyB0byBsb2dcbiAgICogQHBhcmFtIHtTdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBgZXJyb3JgIG9yIGB3YXJuaW5nYFxuICAgKi9cblxuXG4gIFVwcHkucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uIGxvZyhtc2csIHR5cGUpIHtcbiAgICBpZiAoIXRoaXMub3B0cy5kZWJ1Zykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0gJ1tVcHB5XSBbJyArIGdldFRpbWVTdGFtcCgpICsgJ10gJyArIG1zZztcblxuICAgIHdpbmRvd1sndXBweUxvZyddID0gd2luZG93Wyd1cHB5TG9nJ10gKyAnXFxuJyArICdERUJVRyBMT0c6ICcgKyBtc2c7XG5cbiAgICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1zZyA9PT0gJycgKyBtc2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gJ1tVcHB5XSBbJyArIGdldFRpbWVTdGFtcCgpICsgJ10nO1xuICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgICBjb25zb2xlLmRpcihtc2cpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogT2Jzb2xldGUsIGV2ZW50IGxpc3RlbmVycyBhcmUgbm93IGFkZGVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiBydW4oKSB7XG4gICAgdGhpcy5sb2coJ0NhbGxpbmcgcnVuKCkgaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeS4nLCAnd2FybmluZycpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXN0b3JlIGFuIHVwbG9hZCBieSBpdHMgSUQuXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uIHJlc3RvcmUodXBsb2FkSUQpIHtcbiAgICB0aGlzLmxvZygnQ29yZTogYXR0ZW1wdGluZyB0byByZXN0b3JlIHVwbG9hZCBcIicgKyB1cGxvYWRJRCArICdcIicpO1xuXG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm9uZXhpc3RlbnQgdXBsb2FkJykpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gdXBsb2FkIGZvciBhIGJ1bmNoIG9mIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IGZpbGVJRHMgRmlsZSBJRHMgdG8gaW5jbHVkZSBpbiB0aGlzIHVwbG9hZC5cbiAgICogQHJldHVybiB7c3RyaW5nfSBJRCBvZiB0aGlzIHVwbG9hZC5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5fY3JlYXRlVXBsb2FkID0gZnVuY3Rpb24gX2NyZWF0ZVVwbG9hZChmaWxlSURzKSB7XG4gICAgdmFyIF9leHRlbmRzNDtcblxuICAgIHZhciB1cGxvYWRJRCA9IGN1aWQoKTtcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkJywge1xuICAgICAgaWQ6IHVwbG9hZElELFxuICAgICAgZmlsZUlEczogZmlsZUlEc1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogX2V4dGVuZHMoe30sIHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2FkcywgKF9leHRlbmRzNCA9IHt9LCBfZXh0ZW5kczRbdXBsb2FkSURdID0ge1xuICAgICAgICBmaWxlSURzOiBmaWxlSURzLFxuICAgICAgICBzdGVwOiAwLFxuICAgICAgICByZXN1bHQ6IHt9XG4gICAgICB9LCBfZXh0ZW5kczQpKVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVwbG9hZElEO1xuICB9O1xuXG4gIFVwcHkucHJvdG90eXBlLl9nZXRVcGxvYWQgPSBmdW5jdGlvbiBfZ2V0VXBsb2FkKHVwbG9hZElEKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBkYXRhIHRvIGFuIHVwbG9hZCdzIHJlc3VsdCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRJRCBUaGUgSUQgb2YgdGhlIHVwbG9hZC5cbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgRGF0YSBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgcmVzdWx0IG9iamVjdC5cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS5hZGRSZXN1bHREYXRhID0gZnVuY3Rpb24gYWRkUmVzdWx0RGF0YSh1cGxvYWRJRCwgZGF0YSkge1xuICAgIHZhciBfZXh0ZW5kczU7XG5cbiAgICBpZiAoIXRoaXMuX2dldFVwbG9hZCh1cGxvYWRJRCkpIHtcbiAgICAgIHRoaXMubG9nKCdOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcgKyB1cGxvYWRJRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjdXJyZW50VXBsb2FkcyA9IHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2FkcztcbiAgICB2YXIgY3VycmVudFVwbG9hZCA9IF9leHRlbmRzKHt9LCBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0sIHtcbiAgICAgIHJlc3VsdDogX2V4dGVuZHMoe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5yZXN1bHQsIGRhdGEpXG4gICAgfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogX2V4dGVuZHMoe30sIGN1cnJlbnRVcGxvYWRzLCAoX2V4dGVuZHM1ID0ge30sIF9leHRlbmRzNVt1cGxvYWRJRF0gPSBjdXJyZW50VXBsb2FkLCBfZXh0ZW5kczUpKVxuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gdXBsb2FkLCBlZy4gaWYgaXQgaGFzIGJlZW4gY2FuY2VsZWQgb3IgY29tcGxldGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuX3JlbW92ZVVwbG9hZCA9IGZ1bmN0aW9uIF9yZW1vdmVVcGxvYWQodXBsb2FkSUQpIHtcbiAgICB2YXIgY3VycmVudFVwbG9hZHMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzKTtcbiAgICBkZWxldGUgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogY3VycmVudFVwbG9hZHNcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogUnVuIGFuIHVwbG9hZC4gVGhpcyBwaWNrcyB1cCB3aGVyZSBpdCBsZWZ0IG9mZiBpbiBjYXNlIHRoZSB1cGxvYWQgaXMgYmVpbmcgcmVzdG9yZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuXG5cbiAgVXBweS5wcm90b3R5cGUuX3J1blVwbG9hZCA9IGZ1bmN0aW9uIF9ydW5VcGxvYWQodXBsb2FkSUQpIHtcbiAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgIHZhciB1cGxvYWREYXRhID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXTtcbiAgICB2YXIgZmlsZUlEcyA9IHVwbG9hZERhdGEuZmlsZUlEcztcbiAgICB2YXIgcmVzdG9yZVN0ZXAgPSB1cGxvYWREYXRhLnN0ZXA7XG5cbiAgICB2YXIgc3RlcHMgPSBbXS5jb25jYXQodGhpcy5wcmVQcm9jZXNzb3JzLCB0aGlzLnVwbG9hZGVycywgdGhpcy5wb3N0UHJvY2Vzc29ycyk7XG4gICAgdmFyIGxhc3RTdGVwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgc3RlcHMuZm9yRWFjaChmdW5jdGlvbiAoZm4sIHN0ZXApIHtcbiAgICAgIC8vIFNraXAgdGhpcyBzdGVwIGlmIHdlIGFyZSByZXN0b3JpbmcgYW5kIGhhdmUgYWxyZWFkeSBjb21wbGV0ZWQgdGhpcyBzdGVwIGJlZm9yZS5cbiAgICAgIGlmIChzdGVwIDwgcmVzdG9yZVN0ZXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsYXN0U3RlcCA9IGxhc3RTdGVwLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2V4dGVuZHM2O1xuXG4gICAgICAgIHZhciBfZ2V0U3RhdGU1ID0gX3RoaXM4LmdldFN0YXRlKCksXG4gICAgICAgICAgICBjdXJyZW50VXBsb2FkcyA9IF9nZXRTdGF0ZTUuY3VycmVudFVwbG9hZHM7XG5cbiAgICAgICAgdmFyIGN1cnJlbnRVcGxvYWQgPSBfZXh0ZW5kcyh7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLCB7XG4gICAgICAgICAgc3RlcDogc3RlcFxuICAgICAgICB9KTtcbiAgICAgICAgX3RoaXM4LnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50VXBsb2FkczogX2V4dGVuZHMoe30sIGN1cnJlbnRVcGxvYWRzLCAoX2V4dGVuZHM2ID0ge30sIF9leHRlbmRzNlt1cGxvYWRJRF0gPSBjdXJyZW50VXBsb2FkLCBfZXh0ZW5kczYpKVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gVE9ETyBnaXZlIHRoaXMgdGhlIGBjdXJyZW50VXBsb2FkYCBvYmplY3QgYXMgaXRzIG9ubHkgcGFyYW1ldGVyIG1heWJlP1xuICAgICAgICAvLyBPdGhlcndpc2Ugd2hlbiBtb3JlIG1ldGFkYXRhIG1heSBiZSBhZGRlZCB0byB0aGUgdXBsb2FkIHRoaXMgd291bGQga2VlcCBnZXR0aW5nIG1vcmUgcGFyYW1ldGVyc1xuICAgICAgICByZXR1cm4gZm4oZmlsZUlEcywgdXBsb2FkSUQpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBOb3QgcmV0dXJuaW5nIHRoZSBgY2F0Y2hgZWQgcHJvbWlzZSwgYmVjYXVzZSB3ZSBzdGlsbCB3YW50IHRvIHJldHVybiBhIHJlamVjdGVkXG4gICAgLy8gcHJvbWlzZSBmcm9tIHRoaXMgbWV0aG9kIGlmIHRoZSB1cGxvYWQgZmFpbGVkLlxuICAgIGxhc3RTdGVwLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIF90aGlzOC5lbWl0KCdlcnJvcicsIGVyciwgdXBsb2FkSUQpO1xuXG4gICAgICBfdGhpczguX3JlbW92ZVVwbG9hZCh1cGxvYWRJRCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbGFzdFN0ZXAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmlsZXMgPSBmaWxlSURzLm1hcChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICAgIHJldHVybiBfdGhpczguZ2V0RmlsZShmaWxlSUQpO1xuICAgICAgfSk7XG4gICAgICB2YXIgc3VjY2Vzc2Z1bCA9IGZpbGVzLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gZmlsZSAmJiAhZmlsZS5lcnJvcjtcbiAgICAgIH0pO1xuICAgICAgdmFyIGZhaWxlZCA9IGZpbGVzLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gZmlsZSAmJiBmaWxlLmVycm9yO1xuICAgICAgfSk7XG4gICAgICBfdGhpczguYWRkUmVzdWx0RGF0YSh1cGxvYWRJRCwgeyBzdWNjZXNzZnVsOiBzdWNjZXNzZnVsLCBmYWlsZWQ6IGZhaWxlZCwgdXBsb2FkSUQ6IHVwbG9hZElEIH0pO1xuXG4gICAgICB2YXIgX2dldFN0YXRlNiA9IF90aGlzOC5nZXRTdGF0ZSgpLFxuICAgICAgICAgIGN1cnJlbnRVcGxvYWRzID0gX2dldFN0YXRlNi5jdXJyZW50VXBsb2FkcztcblxuICAgICAgaWYgKCFjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0pIHtcbiAgICAgICAgX3RoaXM4LmxvZygnTm90IHNldHRpbmcgcmVzdWx0IGZvciBhbiB1cGxvYWQgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnICsgdXBsb2FkSUQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciByZXN1bHQgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0ucmVzdWx0O1xuICAgICAgX3RoaXM4LmVtaXQoJ2NvbXBsZXRlJywgcmVzdWx0KTtcblxuICAgICAgX3RoaXM4Ll9yZW1vdmVVcGxvYWQodXBsb2FkSUQpO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydCBhbiB1cGxvYWQgZm9yIGFsbCB0aGUgZmlsZXMgdGhhdCBhcmUgbm90IGN1cnJlbnRseSBiZWluZyB1cGxvYWRlZC5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG5cblxuICBVcHB5LnByb3RvdHlwZS51cGxvYWQgPSBmdW5jdGlvbiB1cGxvYWQoKSB7XG4gICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMucGx1Z2lucy51cGxvYWRlcikge1xuICAgICAgdGhpcy5sb2coJ05vIHVwbG9hZGVyIHR5cGUgcGx1Z2lucyBhcmUgdXNlZCcsICd3YXJuaW5nJyk7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVzID0gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzO1xuICAgIHZhciBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZVVwbG9hZChmaWxlcyk7XG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb3Qgc3RhcnRpbmcgdGhlIHVwbG9hZCBiZWNhdXNlIG9uQmVmb3JlVXBsb2FkIHJldHVybmVkIGZhbHNlJykpO1xuICAgIH1cblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCAmJiAodHlwZW9mIG9uQmVmb3JlVXBsb2FkUmVzdWx0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvbkJlZm9yZVVwbG9hZFJlc3VsdCkpID09PSAnb2JqZWN0Jykge1xuICAgICAgLy8gd2FybmluZyBhZnRlciB0aGUgY2hhbmdlIGluIDAuMjRcbiAgICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdC50aGVuKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQmVmb3JlVXBsb2FkKCkgcmV0dXJuZWQgYSBQcm9taXNlLCBidXQgdGhpcyBpcyBubyBsb25nZXIgc3VwcG9ydGVkLiBJdCBtdXN0IGJlIHN5bmNocm9ub3VzLicpO1xuICAgICAgfVxuXG4gICAgICBmaWxlcyA9IG9uQmVmb3JlVXBsb2FkUmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpczkuX2NoZWNrTWluTnVtYmVyT2ZGaWxlcyhmaWxlcyk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2dldFN0YXRlNyA9IF90aGlzOS5nZXRTdGF0ZSgpLFxuICAgICAgICAgIGN1cnJlbnRVcGxvYWRzID0gX2dldFN0YXRlNy5jdXJyZW50VXBsb2FkcztcbiAgICAgIC8vIGdldCBhIGxpc3Qgb2YgZmlsZXMgdGhhdCBhcmUgY3VycmVudGx5IGFzc2lnbmVkIHRvIHVwbG9hZHNcblxuXG4gICAgICB2YXIgY3VycmVudGx5VXBsb2FkaW5nRmlsZXMgPSBPYmplY3Qua2V5cyhjdXJyZW50VXBsb2FkcykucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBjdXJyKSB7XG4gICAgICAgIHJldHVybiBwcmV2LmNvbmNhdChjdXJyZW50VXBsb2Fkc1tjdXJyXS5maWxlSURzKTtcbiAgICAgIH0sIFtdKTtcblxuICAgICAgdmFyIHdhaXRpbmdGaWxlSURzID0gW107XG4gICAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICAgIHZhciBmaWxlID0gX3RoaXM5LmdldEZpbGUoZmlsZUlEKTtcbiAgICAgICAgLy8gaWYgdGhlIGZpbGUgaGFzbid0IHN0YXJ0ZWQgdXBsb2FkaW5nIGFuZCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGFzc2lnbmVkIHRvIGFuIHVwbG9hZC4uXG4gICAgICAgIGlmICghZmlsZS5wcm9ncmVzcy51cGxvYWRTdGFydGVkICYmIGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzLmluZGV4T2YoZmlsZUlEKSA9PT0gLTEpIHtcbiAgICAgICAgICB3YWl0aW5nRmlsZUlEcy5wdXNoKGZpbGUuaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIHVwbG9hZElEID0gX3RoaXM5Ll9jcmVhdGVVcGxvYWQod2FpdGluZ0ZpbGVJRHMpO1xuICAgICAgcmV0dXJuIF90aGlzOS5fcnVuVXBsb2FkKHVwbG9hZElEKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICB2YXIgbWVzc2FnZSA9ICh0eXBlb2YgZXJyID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihlcnIpKSA9PT0gJ29iamVjdCcgPyBlcnIubWVzc2FnZSA6IGVycjtcbiAgICAgIHZhciBkZXRhaWxzID0gKHR5cGVvZiBlcnIgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGVycikpID09PSAnb2JqZWN0JyA/IGVyci5kZXRhaWxzIDogbnVsbDtcbiAgICAgIF90aGlzOS5sb2cobWVzc2FnZSArICcgJyArIGRldGFpbHMpO1xuICAgICAgX3RoaXM5LmluZm8oeyBtZXNzYWdlOiBtZXNzYWdlLCBkZXRhaWxzOiBkZXRhaWxzIH0sICdlcnJvcicsIDQwMDApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCh0eXBlb2YgZXJyID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihlcnIpKSA9PT0gJ29iamVjdCcgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgX2NyZWF0ZUNsYXNzKFVwcHksIFt7XG4gICAga2V5OiAnc3RhdGUnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gVXBweTtcbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuICByZXR1cm4gbmV3IFVwcHkob3B0cyk7XG59O1xuXG4vLyBFeHBvc2UgY2xhc3MgY29uc3RydWN0b3IuXG5tb2R1bGUuZXhwb3J0cy5VcHB5ID0gVXBweTtcbm1vZHVsZS5leHBvcnRzLlBsdWdpbiA9IFBsdWdpbjsiLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKSxcbiAgICBQbHVnaW4gPSBfcmVxdWlyZS5QbHVnaW47XG5cbnZhciB0b0FycmF5ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3RvQXJyYXknKTtcbnZhciBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKTtcblxudmFyIF9yZXF1aXJlMiA9IHJlcXVpcmUoJ3ByZWFjdCcpLFxuICAgIGggPSBfcmVxdWlyZTIuaDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX1BsdWdpbikge1xuICBfaW5oZXJpdHMoRmlsZUlucHV0LCBfUGx1Z2luKTtcblxuICBmdW5jdGlvbiBGaWxlSW5wdXQodXBweSwgb3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWxlSW5wdXQpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX1BsdWdpbi5jYWxsKHRoaXMsIHVwcHksIG9wdHMpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMub3B0cy5pZCB8fCAnRmlsZUlucHV0JztcbiAgICBfdGhpcy50aXRsZSA9ICdGaWxlIElucHV0JztcbiAgICBfdGhpcy50eXBlID0gJ2FjcXVpcmVyJztcblxuICAgIHZhciBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICBjaG9vc2VGaWxlczogJ0Nob29zZSBmaWxlcydcbiAgICAgIH1cblxuICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgfTt2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6IG51bGwsXG4gICAgICBwcmV0dHk6IHRydWUsXG4gICAgICBpbnB1dE5hbWU6ICdmaWxlc1tdJyxcbiAgICAgIGxvY2FsZTogZGVmYXVsdExvY2FsZVxuXG4gICAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIH07X3RoaXMub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cyk7XG5cbiAgICBfdGhpcy5sb2NhbGUgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdExvY2FsZSwgX3RoaXMub3B0cy5sb2NhbGUpO1xuICAgIF90aGlzLmxvY2FsZS5zdHJpbmdzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUuc3RyaW5ncywgX3RoaXMub3B0cy5sb2NhbGUuc3RyaW5ncyk7XG5cbiAgICAvLyBpMThuXG4gICAgX3RoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHsgbG9jYWxlOiBfdGhpcy5sb2NhbGUgfSk7XG4gICAgX3RoaXMuaTE4biA9IF90aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQoX3RoaXMudHJhbnNsYXRvcik7XG5cbiAgICBfdGhpcy5yZW5kZXIgPSBfdGhpcy5yZW5kZXIuYmluZChfdGhpcyk7XG4gICAgX3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2UgPSBfdGhpcy5oYW5kbGVJbnB1dENoYW5nZS5iaW5kKF90aGlzKTtcbiAgICBfdGhpcy5oYW5kbGVDbGljayA9IF90aGlzLmhhbmRsZUNsaWNrLmJpbmQoX3RoaXMpO1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUuaGFuZGxlSW5wdXRDaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVJbnB1dENoYW5nZShldikge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgdGhpcy51cHB5LmxvZygnW0ZpbGVJbnB1dF0gU29tZXRoaW5nIHNlbGVjdGVkIHRocm91Z2ggaW5wdXQuLi4nKTtcblxuICAgIHZhciBmaWxlcyA9IHRvQXJyYXkoZXYudGFyZ2V0LmZpbGVzKTtcblxuICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIF90aGlzMi51cHB5LmFkZEZpbGUoe1xuICAgICAgICAgIHNvdXJjZTogX3RoaXMyLmlkLFxuICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgICAgICAgZGF0YTogZmlsZVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBOb3RoaW5nLCByZXN0cmljdGlvbiBlcnJvcnMgaGFuZGxlZCBpbiBDb3JlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgRmlsZUlucHV0LnByb3RvdHlwZS5oYW5kbGVDbGljayA9IGZ1bmN0aW9uIGhhbmRsZUNsaWNrKGV2KSB7XG4gICAgdGhpcy5pbnB1dC5jbGljaygpO1xuICB9O1xuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKHN0YXRlKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAvKiBodHRwOi8vdHltcGFudXMubmV0L2NvZHJvcHMvMjAxNS8wOS8xNS9zdHlsaW5nLWN1c3RvbWl6aW5nLWZpbGUtaW5wdXRzLXNtYXJ0LXdheS8gKi9cbiAgICB2YXIgaGlkZGVuSW5wdXRTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiAnMC4xcHgnLFxuICAgICAgaGVpZ2h0OiAnMC4xcHgnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgekluZGV4OiAtMVxuICAgIH07XG5cbiAgICB2YXIgcmVzdHJpY3Rpb25zID0gdGhpcy51cHB5Lm9wdHMucmVzdHJpY3Rpb25zO1xuXG4gICAgLy8gZW1wdHkgdmFsdWU9XCJcIiBvbiBmaWxlIGlucHV0LCBzbyB0aGF0IHRoZSBpbnB1dCBpcyBjbGVhcmVkIGFmdGVyIGEgZmlsZSBpcyBzZWxlY3RlZCxcbiAgICAvLyBiZWNhdXNlIFVwcHkgd2lsbCBiZSBoYW5kbGluZyB0aGUgdXBsb2FkIGFuZCBzbyB3ZSBjYW4gc2VsZWN0IHNhbWUgZmlsZVxuICAgIC8vIGFmdGVyIHJlbW92aW5nIOKAlCBvdGhlcndpc2UgYnJvd3NlciB0aGlua3MgaXTigJlzIGFscmVhZHkgc2VsZWN0ZWRcbiAgICByZXR1cm4gaChcbiAgICAgICdkaXYnLFxuICAgICAgeyAnY2xhc3MnOiAndXBweS1Sb290IHVwcHktRmlsZUlucHV0LWNvbnRhaW5lcicgfSxcbiAgICAgIGgoJ2lucHV0JywgeyAnY2xhc3MnOiAndXBweS1GaWxlSW5wdXQtaW5wdXQnLFxuICAgICAgICBzdHlsZTogdGhpcy5vcHRzLnByZXR0eSAmJiBoaWRkZW5JbnB1dFN0eWxlLFxuICAgICAgICB0eXBlOiAnZmlsZScsXG4gICAgICAgIG5hbWU6IHRoaXMub3B0cy5pbnB1dE5hbWUsXG4gICAgICAgIG9uY2hhbmdlOiB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlLFxuICAgICAgICBtdWx0aXBsZTogcmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMgIT09IDEsXG4gICAgICAgIGFjY2VwdDogcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMsXG4gICAgICAgIHJlZjogZnVuY3Rpb24gcmVmKGlucHV0KSB7XG4gICAgICAgICAgX3RoaXMzLmlucHV0ID0gaW5wdXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlOiAnJyB9KSxcbiAgICAgIHRoaXMub3B0cy5wcmV0dHkgJiYgaChcbiAgICAgICAgJ2J1dHRvbicsXG4gICAgICAgIHsgJ2NsYXNzJzogJ3VwcHktRmlsZUlucHV0LWJ0bicsIHR5cGU6ICdidXR0b24nLCBvbmNsaWNrOiB0aGlzLmhhbmRsZUNsaWNrIH0sXG4gICAgICAgIHRoaXMuaTE4bignY2hvb3NlRmlsZXMnKVxuICAgICAgKVxuICAgICk7XG4gIH07XG5cbiAgRmlsZUlucHV0LnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5vcHRzLnRhcmdldDtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIEZpbGVJbnB1dC5wcm90b3R5cGUudW5pbnN0YWxsID0gZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9O1xuXG4gIHJldHVybiBGaWxlSW5wdXQ7XG59KFBsdWdpbik7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50Jyk7XG5cbnZhciBfZ2V0TmFtZSA9IGZ1bmN0aW9uIF9nZXROYW1lKGlkKSB7XG4gIHJldHVybiBpZC5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKTtcbiAgfSkuam9pbignICcpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX1JlcXVlc3RDbGllbnQpIHtcbiAgX2luaGVyaXRzKFByb3ZpZGVyLCBfUmVxdWVzdENsaWVudCk7XG5cbiAgZnVuY3Rpb24gUHJvdmlkZXIodXBweSwgb3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQcm92aWRlcik7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfUmVxdWVzdENsaWVudC5jYWxsKHRoaXMsIHVwcHksIG9wdHMpKTtcblxuICAgIF90aGlzLnByb3ZpZGVyID0gb3B0cy5wcm92aWRlcjtcbiAgICBfdGhpcy5pZCA9IF90aGlzLnByb3ZpZGVyO1xuICAgIF90aGlzLmF1dGhQcm92aWRlciA9IG9wdHMuYXV0aFByb3ZpZGVyIHx8IF90aGlzLnByb3ZpZGVyO1xuICAgIF90aGlzLm5hbWUgPSBfdGhpcy5vcHRzLm5hbWUgfHwgX2dldE5hbWUoX3RoaXMuaWQpO1xuICAgIF90aGlzLnRva2VuS2V5ID0gJ3VwcHktc2VydmVyLScgKyBfdGhpcy5pZCArICctYXV0aC10b2tlbic7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgLy8gQHRvZG8oaS5vbGFyZXdhanUpIGNvbnNpZGVyIHdoZXRoZXIgb3Igbm90IHRoaXMgbWV0aG9kIHNob3VsZCBiZSBleHBvc2VkXG4gIFByb3ZpZGVyLnByb3RvdHlwZS5zZXRBdXRoVG9rZW4gPSBmdW5jdGlvbiBzZXRBdXRoVG9rZW4odG9rZW4pIHtcbiAgICAvLyBAdG9kbyhpLm9sYXJld2FqdSkgYWRkIGZhbGxiYWNrIGZvciBPT00gc3RvcmFnZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMudG9rZW5LZXksIHRva2VuKTtcbiAgfTtcblxuICBQcm92aWRlci5wcm90b3R5cGUuY2hlY2tBdXRoID0gZnVuY3Rpb24gY2hlY2tBdXRoKCkge1xuICAgIHJldHVybiB0aGlzLmdldCh0aGlzLmlkICsgJy9hdXRob3JpemVkJykudGhlbihmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgICAgcmV0dXJuIHBheWxvYWQuYXV0aGVudGljYXRlZDtcbiAgICB9KTtcbiAgfTtcblxuICBQcm92aWRlci5wcm90b3R5cGUuYXV0aFVybCA9IGZ1bmN0aW9uIGF1dGhVcmwoKSB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdG5hbWUgKyAnLycgKyB0aGlzLmlkICsgJy9jb25uZWN0JztcbiAgfTtcblxuICBQcm92aWRlci5wcm90b3R5cGUuZmlsZVVybCA9IGZ1bmN0aW9uIGZpbGVVcmwoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ob3N0bmFtZSArICcvJyArIHRoaXMuaWQgKyAnL2dldC8nICsgaWQ7XG4gIH07XG5cbiAgUHJvdmlkZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbiBsaXN0KGRpcmVjdG9yeSkge1xuICAgIHJldHVybiB0aGlzLmdldCh0aGlzLmlkICsgJy9saXN0LycgKyAoZGlyZWN0b3J5IHx8ICcnKSk7XG4gIH07XG5cbiAgUHJvdmlkZXIucHJvdG90eXBlLmxvZ291dCA9IGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHZhciByZWRpcmVjdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbG9jYXRpb24uaHJlZjtcblxuICAgIHJldHVybiB0aGlzLmdldCh0aGlzLmlkICsgJy9sb2dvdXQ/cmVkaXJlY3Q9JyArIHJlZGlyZWN0KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKF90aGlzMi50b2tlbktleSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb3ZpZGVyLmluaXRQbHVnaW4gPSBmdW5jdGlvbiBpbml0UGx1Z2luKHBsdWdpbiwgb3B0cywgZGVmYXVsdE9wdHMpIHtcbiAgICBwbHVnaW4udHlwZSA9ICdhY3F1aXJlcic7XG4gICAgcGx1Z2luLmZpbGVzID0gW107XG4gICAgaWYgKGRlZmF1bHRPcHRzKSB7XG4gICAgICBwbHVnaW4ub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0cywgb3B0cyk7XG4gICAgfVxuICAgIGlmIChvcHRzLnNlcnZlclBhdHRlcm4pIHtcbiAgICAgIHZhciBwYXR0ZXJuID0gb3B0cy5zZXJ2ZXJQYXR0ZXJuO1xuICAgICAgLy8gdmFsaWRhdGUgc2VydmVyUGF0dGVybiBwYXJhbVxuICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJyAmJiAhQXJyYXkuaXNBcnJheShwYXR0ZXJuKSAmJiAhKHBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHApKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IocGx1Z2luLmlkICsgJzogdGhlIG9wdGlvbiBcInNlcnZlclBhdHRlcm5cIiBtdXN0IGJlIG9uZSBvZiBzdHJpbmcsIEFycmF5LCBSZWdFeHAnKTtcbiAgICAgIH1cbiAgICAgIHBsdWdpbi5vcHRzLnNlcnZlclBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkb2VzIG5vdCBzdGFydCB3aXRoIGh0dHBzOi8vXG4gICAgICBpZiAoL14oPyFodHRwcz86XFwvXFwvKS4qJC8udGVzdChvcHRzLnNlcnZlclVybCkpIHtcbiAgICAgICAgcGx1Z2luLm9wdHMuc2VydmVyUGF0dGVybiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIG9wdHMuc2VydmVyVXJsLnJlcGxhY2UoL15cXC9cXC8vLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW4ub3B0cy5zZXJ2ZXJQYXR0ZXJuID0gb3B0cy5zZXJ2ZXJVcmw7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9jcmVhdGVDbGFzcyhQcm92aWRlciwgW3tcbiAgICBrZXk6ICdkZWZhdWx0SGVhZGVycycsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIF9SZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5kZWZhdWx0SGVhZGVycywgeyAndXBweS1hdXRoLXRva2VuJzogbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy50b2tlbktleSkgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFByb3ZpZGVyO1xufShSZXF1ZXN0Q2xpZW50KTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIFJlbW92ZSB0aGUgdHJhaWxpbmcgc2xhc2ggc28gd2UgY2FuIGFsd2F5cyBzYWZlbHkgYXBwZW5kIC94eXouXG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIHN0cmlwU2xhc2godXJsKSB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvJC8sICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFJlcXVlc3RDbGllbnQodXBweSwgb3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZXF1ZXN0Q2xpZW50KTtcblxuICAgIHRoaXMudXBweSA9IHVwcHk7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlID0gdGhpcy5vblJlY2VpdmVSZXNwb25zZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgUmVxdWVzdENsaWVudC5wcm90b3R5cGUub25SZWNlaXZlUmVzcG9uc2UgPSBmdW5jdGlvbiBvblJlY2VpdmVSZXNwb25zZShyZXNwb25zZSkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpO1xuICAgIHZhciB1cHB5U2VydmVyID0gc3RhdGUudXBweVNlcnZlciB8fCB7fTtcbiAgICB2YXIgaG9zdCA9IHRoaXMub3B0cy5zZXJ2ZXJVcmw7XG4gICAgdmFyIGhlYWRlcnMgPSByZXNwb25zZS5oZWFkZXJzO1xuICAgIC8vIFN0b3JlIHRoZSBzZWxmLWlkZW50aWZpZWQgZG9tYWluIG5hbWUgZm9yIHRoZSB1cHB5LXNlcnZlciB3ZSBqdXN0IGhpdC5cbiAgICBpZiAoaGVhZGVycy5oYXMoJ2ktYW0nKSAmJiBoZWFkZXJzLmdldCgnaS1hbScpICE9PSB1cHB5U2VydmVyW2hvc3RdKSB7XG4gICAgICB2YXIgX2V4dGVuZHMyO1xuXG4gICAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgICB1cHB5U2VydmVyOiBfZXh0ZW5kcyh7fSwgdXBweVNlcnZlciwgKF9leHRlbmRzMiA9IHt9LCBfZXh0ZW5kczJbaG9zdF0gPSBoZWFkZXJzLmdldCgnaS1hbScpLCBfZXh0ZW5kczIpKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcblxuICBSZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5fZ2V0VXJsID0gZnVuY3Rpb24gX2dldFVybCh1cmwpIHtcbiAgICBpZiAoL14oaHR0cHM/OnwpXFwvXFwvLy50ZXN0KHVybCkpIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhvc3RuYW1lICsgJy8nICsgdXJsO1xuICB9O1xuXG4gIFJlcXVlc3RDbGllbnQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChwYXRoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHJldHVybiBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICBoZWFkZXJzOiB0aGlzLmhlYWRlcnNcbiAgICB9KVxuICAgIC8vIEB0b2RvIHZhbGlkYXRlIHJlc3BvbnNlIHN0YXR1cyBiZWZvcmUgY2FsbGluZyBqc29uXG4gICAgLnRoZW4odGhpcy5vblJlY2VpdmVSZXNwb25zZSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgJyArIF90aGlzLl9nZXRVcmwocGF0aCkgKyAnLiAnICsgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxuICBSZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gcG9zdChwYXRoLCBkYXRhKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICByZXR1cm4gZmV0Y2godGhpcy5fZ2V0VXJsKHBhdGgpLCB7XG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgfSkudGhlbih0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzIDwgMjAwIHx8IHJlcy5zdGF0dXMgPiAzMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcG9zdCAnICsgX3RoaXMyLl9nZXRVcmwocGF0aCkgKyAnLiAnICsgcmVzLnN0YXR1c1RleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcy5qc29uKCk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcG9zdCAnICsgX3RoaXMyLl9nZXRVcmwocGF0aCkgKyAnLiAnICsgZXJyKTtcbiAgICB9KTtcbiAgfTtcblxuICBSZXF1ZXN0Q2xpZW50LnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiBfZGVsZXRlKHBhdGgsIGRhdGEpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHJldHVybiBmZXRjaCh0aGlzLmhvc3RuYW1lICsgJy8nICsgcGF0aCwge1xuICAgICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuaGVhZGVycyxcbiAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IG51bGxcbiAgICB9KS50aGVuKHRoaXMub25SZWNlaXZlUmVzcG9uc2UpXG4gICAgLy8gQHRvZG8gdmFsaWRhdGUgcmVzcG9uc2Ugc3RhdHVzIGJlZm9yZSBjYWxsaW5nIGpzb25cbiAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZWxldGUgJyArIF90aGlzMy5fZ2V0VXJsKHBhdGgpICsgJy4gJyArIGVycik7XG4gICAgfSk7XG4gIH07XG5cbiAgX2NyZWF0ZUNsYXNzKFJlcXVlc3RDbGllbnQsIFt7XG4gICAga2V5OiAnaG9zdG5hbWUnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIF91cHB5JGdldFN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKCksXG4gICAgICAgICAgdXBweVNlcnZlciA9IF91cHB5JGdldFN0YXRlLnVwcHlTZXJ2ZXI7XG5cbiAgICAgIHZhciBob3N0ID0gdGhpcy5vcHRzLnNlcnZlclVybDtcbiAgICAgIHJldHVybiBzdHJpcFNsYXNoKHVwcHlTZXJ2ZXIgJiYgdXBweVNlcnZlcltob3N0XSA/IHVwcHlTZXJ2ZXJbaG9zdF0gOiBob3N0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkZWZhdWx0SGVhZGVycycsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2hlYWRlcnMnLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCB0aGlzLmRlZmF1bHRIZWFkZXJzLCB0aGlzLm9wdHMuc2VydmVySGVhZGVycyB8fCB7fSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFJlcXVlc3RDbGllbnQ7XG59KCk7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFVwcHlTb2NrZXQob3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBweVNvY2tldCk7XG5cbiAgICB0aGlzLnF1ZXVlZCA9IFtdO1xuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KG9wdHMudGFyZ2V0KTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBlZSgpO1xuXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIF90aGlzLmlzT3BlbiA9IHRydWU7XG5cbiAgICAgIHdoaWxlIChfdGhpcy5xdWV1ZWQubGVuZ3RoID4gMCAmJiBfdGhpcy5pc09wZW4pIHtcbiAgICAgICAgdmFyIGZpcnN0ID0gX3RoaXMucXVldWVkWzBdO1xuICAgICAgICBfdGhpcy5zZW5kKGZpcnN0LmFjdGlvbiwgZmlyc3QucGF5bG9hZCk7XG4gICAgICAgIF90aGlzLnF1ZXVlZCA9IF90aGlzLnF1ZXVlZC5zbGljZSgxKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBfdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5faGFuZGxlTWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2U7XG5cbiAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmNlID0gdGhpcy5vbmNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZW5kID0gdGhpcy5zZW5kLmJpbmQodGhpcyk7XG4gIH1cblxuICBVcHB5U29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICB9O1xuXG4gIFVwcHlTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiBzZW5kKGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIC8vIGF0dGFjaCB1dWlkXG5cbiAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLnF1ZXVlZC5wdXNoKHsgYWN0aW9uOiBhY3Rpb24sIHBheWxvYWQ6IHBheWxvYWQgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgIHBheWxvYWQ6IHBheWxvYWRcbiAgICB9KSk7XG4gIH07XG5cbiAgVXBweVNvY2tldC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKTtcbiAgfTtcblxuICBVcHB5U29ja2V0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChhY3Rpb24sIHBheWxvYWQpO1xuICB9O1xuXG4gIFVwcHlTb2NrZXQucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbmNlKGFjdGlvbiwgaGFuZGxlcik7XG4gIH07XG5cbiAgVXBweVNvY2tldC5wcm90b3R5cGUuX2hhbmRsZU1lc3NhZ2UgPSBmdW5jdGlvbiBfaGFuZGxlTWVzc2FnZShlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFVwcHlTb2NrZXQ7XG59KCk7IiwiJ3VzZS1zdHJpY3QnO1xuLyoqXG4gKiBNYW5hZ2VzIGNvbW11bmljYXRpb25zIHdpdGggVXBweSBTZXJ2ZXJcbiAqL1xuXG52YXIgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpO1xudmFyIFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpO1xudmFyIFNvY2tldCA9IHJlcXVpcmUoJy4vU29ja2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZXF1ZXN0Q2xpZW50OiBSZXF1ZXN0Q2xpZW50LFxuICBQcm92aWRlcjogUHJvdmlkZXIsXG4gIFNvY2tldDogU29ja2V0XG59OyIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciB0aHJvdHRsZSA9IHJlcXVpcmUoJ2xvZGFzaC50aHJvdHRsZScpO1xudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgc3RhdHVzQmFyU3RhdGVzID0gcmVxdWlyZSgnLi9TdGF0dXNCYXJTdGF0ZXMnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncHJlYWN0JyksXG4gICAgaCA9IF9yZXF1aXJlLmg7XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVByb2Nlc3NpbmdQcm9ncmVzcyhmaWxlcykge1xuICAvLyBDb2xsZWN0IHByZSBvciBwb3N0cHJvY2Vzc2luZyBwcm9ncmVzcyBzdGF0ZXMuXG4gIHZhciBwcm9ncmVzc2VzID0gW107XG4gIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICB2YXIgcHJvZ3Jlc3MgPSBmaWxlc1tmaWxlSURdLnByb2dyZXNzO1xuXG4gICAgaWYgKHByb2dyZXNzLnByZXByb2Nlc3MpIHtcbiAgICAgIHByb2dyZXNzZXMucHVzaChwcm9ncmVzcy5wcmVwcm9jZXNzKTtcbiAgICB9XG4gICAgaWYgKHByb2dyZXNzLnBvc3Rwcm9jZXNzKSB7XG4gICAgICBwcm9ncmVzc2VzLnB1c2gocHJvZ3Jlc3MucG9zdHByb2Nlc3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gSW4gdGhlIGZ1dHVyZSB3ZSBzaG91bGQgcHJvYmFibHkgZG8gdGhpcyBkaWZmZXJlbnRseS4gRm9yIG5vdyB3ZSdsbCB0YWtlIHRoZVxuICAvLyBtb2RlIGFuZCBtZXNzYWdlIGZyb20gdGhlIGZpcnN0IGZpbGXigKZcbiAgdmFyIF9wcm9ncmVzc2VzJCA9IHByb2dyZXNzZXNbMF0sXG4gICAgICBtb2RlID0gX3Byb2dyZXNzZXMkLm1vZGUsXG4gICAgICBtZXNzYWdlID0gX3Byb2dyZXNzZXMkLm1lc3NhZ2U7XG5cbiAgdmFyIHZhbHVlID0gcHJvZ3Jlc3Nlcy5maWx0ZXIoaXNEZXRlcm1pbmF0ZSkucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgcHJvZ3Jlc3MsIGluZGV4LCBhbGwpIHtcbiAgICByZXR1cm4gdG90YWwgKyBwcm9ncmVzcy52YWx1ZSAvIGFsbC5sZW5ndGg7XG4gIH0sIDApO1xuICBmdW5jdGlvbiBpc0RldGVybWluYXRlKHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIHByb2dyZXNzLm1vZGUgPT09ICdkZXRlcm1pbmF0ZSc7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG1vZGU6IG1vZGUsXG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlUGF1c2VSZXN1bWUocHJvcHMpIHtcbiAgaWYgKHByb3BzLmlzQWxsQ29tcGxldGUpIHJldHVybjtcblxuICBpZiAoIXByb3BzLnJlc3VtYWJsZVVwbG9hZHMpIHtcbiAgICByZXR1cm4gcHJvcHMuY2FuY2VsQWxsKCk7XG4gIH1cblxuICBpZiAocHJvcHMuaXNBbGxQYXVzZWQpIHtcbiAgICByZXR1cm4gcHJvcHMucmVzdW1lQWxsKCk7XG4gIH1cblxuICByZXR1cm4gcHJvcHMucGF1c2VBbGwoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgcHJvcHMgPSBwcm9wcyB8fCB7fTtcblxuICB2YXIgdXBsb2FkU3RhdGUgPSBwcm9wcy51cGxvYWRTdGF0ZTtcblxuICB2YXIgcHJvZ3Jlc3NWYWx1ZSA9IHByb3BzLnRvdGFsUHJvZ3Jlc3M7XG4gIHZhciBwcm9ncmVzc01vZGUgPSB2b2lkIDA7XG4gIHZhciBwcm9ncmVzc0JhckNvbnRlbnQgPSB2b2lkIDA7XG5cbiAgaWYgKHVwbG9hZFN0YXRlID09PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfUFJFUFJPQ0VTU0lORyB8fCB1cGxvYWRTdGF0ZSA9PT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1BPU1RQUk9DRVNTSU5HKSB7XG4gICAgdmFyIHByb2dyZXNzID0gY2FsY3VsYXRlUHJvY2Vzc2luZ1Byb2dyZXNzKHByb3BzLmZpbGVzKTtcbiAgICBwcm9ncmVzc01vZGUgPSBwcm9ncmVzcy5tb2RlO1xuICAgIGlmIChwcm9ncmVzc01vZGUgPT09ICdkZXRlcm1pbmF0ZScpIHtcbiAgICAgIHByb2dyZXNzVmFsdWUgPSBwcm9ncmVzcy52YWx1ZSAqIDEwMDtcbiAgICB9XG5cbiAgICBwcm9ncmVzc0JhckNvbnRlbnQgPSBQcm9ncmVzc0JhclByb2Nlc3NpbmcocHJvZ3Jlc3MpO1xuICB9IGVsc2UgaWYgKHVwbG9hZFN0YXRlID09PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfQ09NUExFVEUpIHtcbiAgICBwcm9ncmVzc0JhckNvbnRlbnQgPSBQcm9ncmVzc0JhckNvbXBsZXRlKHByb3BzKTtcbiAgfSBlbHNlIGlmICh1cGxvYWRTdGF0ZSA9PT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1VQTE9BRElORykge1xuICAgIHByb2dyZXNzQmFyQ29udGVudCA9IFByb2dyZXNzQmFyVXBsb2FkaW5nKHByb3BzKTtcbiAgfSBlbHNlIGlmICh1cGxvYWRTdGF0ZSA9PT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX0VSUk9SKSB7XG4gICAgcHJvZ3Jlc3NWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICBwcm9ncmVzc0JhckNvbnRlbnQgPSBQcm9ncmVzc0JhckVycm9yKHByb3BzKTtcbiAgfVxuXG4gIHZhciB3aWR0aCA9IHR5cGVvZiBwcm9ncmVzc1ZhbHVlID09PSAnbnVtYmVyJyA/IHByb2dyZXNzVmFsdWUgOiAxMDA7XG4gIHZhciBpc0hpZGRlbiA9IHVwbG9hZFN0YXRlID09PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfV0FJVElORyAmJiBwcm9wcy5oaWRlVXBsb2FkQnV0dG9uIHx8IHVwbG9hZFN0YXRlID09PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfV0FJVElORyAmJiAhcHJvcHMubmV3RmlsZXMgPiAwIHx8IHVwbG9hZFN0YXRlID09PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfQ09NUExFVEUgJiYgcHJvcHMuaGlkZUFmdGVyRmluaXNoO1xuXG4gIHZhciBwcm9ncmVzc0NsYXNzTmFtZXMgPSAndXBweS1TdGF0dXNCYXItcHJvZ3Jlc3NcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnICsgKHByb2dyZXNzTW9kZSA/ICdpcy0nICsgcHJvZ3Jlc3NNb2RlIDogJycpO1xuXG4gIHZhciBzdGF0dXNCYXJDbGFzc05hbWVzID0gY2xhc3NOYW1lcygndXBweScsICd1cHB5LVN0YXR1c0JhcicsICdpcy0nICsgdXBsb2FkU3RhdGUsIHsgJ3VwcHktU3RhdHVzQmFyLS1kZXRhaWxlZFByb2dyZXNzJzogcHJvcHMuc2hvd1Byb2dyZXNzRGV0YWlscyB9KTtcblxuICByZXR1cm4gaChcbiAgICAnZGl2JyxcbiAgICB7ICdjbGFzcyc6IHN0YXR1c0JhckNsYXNzTmFtZXMsICdhcmlhLWhpZGRlbic6IGlzSGlkZGVuIH0sXG4gICAgaCgnZGl2JywgeyAnY2xhc3MnOiBwcm9ncmVzc0NsYXNzTmFtZXMsXG4gICAgICBzdHlsZTogeyB3aWR0aDogd2lkdGggKyAnJScgfSxcbiAgICAgIHJvbGU6ICdwcm9ncmVzc2JhcicsXG4gICAgICAnYXJpYS12YWx1ZW1pbic6ICcwJyxcbiAgICAgICdhcmlhLXZhbHVlbWF4JzogJzEwMCcsXG4gICAgICAnYXJpYS12YWx1ZW5vdyc6IHByb2dyZXNzVmFsdWUgfSksXG4gICAgcHJvZ3Jlc3NCYXJDb250ZW50LFxuICAgIGgoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgJ2NsYXNzJzogJ3VwcHktU3RhdHVzQmFyLWFjdGlvbnMnIH0sXG4gICAgICBwcm9wcy5uZXdGaWxlcyAmJiAhcHJvcHMuaGlkZVVwbG9hZEJ1dHRvbiA/IGgoVXBsb2FkQnRuLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgdXBsb2FkU3RhdGU6IHVwbG9hZFN0YXRlIH0pKSA6IG51bGwsXG4gICAgICBwcm9wcy5lcnJvciAmJiAhcHJvcHMuaGlkZVJldHJ5QnV0dG9uID8gaChSZXRyeUJ0biwgcHJvcHMpIDogbnVsbCxcbiAgICAgICFwcm9wcy5oaWRlUGF1c2VSZXN1bWVDYW5jZWxCdXR0b25zICYmIHVwbG9hZFN0YXRlICE9PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfV0FJVElORyAmJiB1cGxvYWRTdGF0ZSAhPT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX0NPTVBMRVRFID8gaChDYW5jZWxCdG4sIHByb3BzKSA6IG51bGxcbiAgICApXG4gICk7XG59O1xuXG52YXIgVXBsb2FkQnRuID0gZnVuY3Rpb24gVXBsb2FkQnRuKHByb3BzKSB7XG4gIHZhciB1cGxvYWRCdG5DbGFzc05hbWVzID0gY2xhc3NOYW1lcygndXBweS11LXJlc2V0JywgJ3VwcHktYy1idG4nLCAndXBweS1TdGF0dXNCYXItYWN0aW9uQnRuJywgJ3VwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tdXBsb2FkJywgeyAndXBweS1jLWJ0bi1wcmltYXJ5JzogcHJvcHMudXBsb2FkU3RhdGUgPT09IHN0YXR1c0JhclN0YXRlcy5TVEFURV9XQUlUSU5HIH0pO1xuXG4gIHJldHVybiBoKFxuICAgICdidXR0b24nLFxuICAgIHsgdHlwZTogJ2J1dHRvbicsXG4gICAgICAnY2xhc3MnOiB1cGxvYWRCdG5DbGFzc05hbWVzLFxuICAgICAgJ2FyaWEtbGFiZWwnOiBwcm9wcy5pMThuKCd1cGxvYWRYRmlsZXMnLCB7IHNtYXJ0X2NvdW50OiBwcm9wcy5uZXdGaWxlcyB9KSxcbiAgICAgIG9uY2xpY2s6IHByb3BzLnN0YXJ0VXBsb2FkIH0sXG4gICAgcHJvcHMubmV3RmlsZXMgJiYgcHJvcHMudXBsb2FkU3RhcnRlZCA/IHByb3BzLmkxOG4oJ3VwbG9hZFhOZXdGaWxlcycsIHsgc21hcnRfY291bnQ6IHByb3BzLm5ld0ZpbGVzIH0pIDogcHJvcHMuaTE4bigndXBsb2FkWEZpbGVzJywgeyBzbWFydF9jb3VudDogcHJvcHMubmV3RmlsZXMgfSlcbiAgKTtcbn07XG5cbnZhciBSZXRyeUJ0biA9IGZ1bmN0aW9uIFJldHJ5QnRuKHByb3BzKSB7XG4gIHJldHVybiBoKFxuICAgICdidXR0b24nLFxuICAgIHsgdHlwZTogJ2J1dHRvbicsXG4gICAgICAnY2xhc3MnOiAndXBweS11LXJlc2V0IHVwcHktYy1idG4gdXBweS1TdGF0dXNCYXItYWN0aW9uQnRuIHVwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tcmV0cnknLFxuICAgICAgJ2FyaWEtbGFiZWwnOiBwcm9wcy5pMThuKCdyZXRyeVVwbG9hZCcpLFxuICAgICAgb25jbGljazogcHJvcHMucmV0cnlBbGwgfSxcbiAgICBwcm9wcy5pMThuKCdyZXRyeScpXG4gICk7XG59O1xuXG52YXIgQ2FuY2VsQnRuID0gZnVuY3Rpb24gQ2FuY2VsQnRuKHByb3BzKSB7XG4gIHJldHVybiBoKFxuICAgICdidXR0b24nLFxuICAgIHsgdHlwZTogJ2J1dHRvbicsXG4gICAgICAnY2xhc3MnOiAndXBweS11LXJlc2V0IHVwcHktYy1idG4gdXBweS1TdGF0dXNCYXItYWN0aW9uQnRuIHVwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tY2FuY2VsJyxcbiAgICAgICdhcmlhLWxhYmVsJzogcHJvcHMuaTE4bignY2FuY2VsJyksXG4gICAgICBvbmNsaWNrOiBwcm9wcy5jYW5jZWxBbGwgfSxcbiAgICBwcm9wcy5pMThuKCdjYW5jZWwnKVxuICApO1xufTtcblxudmFyIFBhdXNlUmVzdW1lQnV0dG9ucyA9IGZ1bmN0aW9uIFBhdXNlUmVzdW1lQnV0dG9ucyhwcm9wcykge1xuICB2YXIgcmVzdW1hYmxlVXBsb2FkcyA9IHByb3BzLnJlc3VtYWJsZVVwbG9hZHMsXG4gICAgICBpc0FsbFBhdXNlZCA9IHByb3BzLmlzQWxsUGF1c2VkLFxuICAgICAgaTE4biA9IHByb3BzLmkxOG47XG5cbiAgdmFyIHRpdGxlID0gcmVzdW1hYmxlVXBsb2FkcyA/IGlzQWxsUGF1c2VkID8gaTE4bigncmVzdW1lVXBsb2FkJykgOiBpMThuKCdwYXVzZVVwbG9hZCcpIDogaTE4bignY2FuY2VsVXBsb2FkJyk7XG5cbiAgcmV0dXJuIGgoXG4gICAgJ2J1dHRvbicsXG4gICAgeyB0aXRsZTogdGl0bGUsICdjbGFzcyc6ICd1cHB5LXUtcmVzZXQgdXBweS1TdGF0dXNCYXItc3RhdHVzSW5kaWNhdG9yJywgdHlwZTogJ2J1dHRvbicsIG9uY2xpY2s6IGZ1bmN0aW9uIG9uY2xpY2soKSB7XG4gICAgICAgIHJldHVybiB0b2dnbGVQYXVzZVJlc3VtZShwcm9wcyk7XG4gICAgICB9IH0sXG4gICAgcmVzdW1hYmxlVXBsb2FkcyA/IGlzQWxsUGF1c2VkID8gaChcbiAgICAgICdzdmcnLFxuICAgICAgeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsICdjbGFzcyc6ICdVcHB5SWNvbicsIHdpZHRoOiAnMTUnLCBoZWlnaHQ6ICcxNycsIHZpZXdCb3g6ICcwIDAgMTEgMTMnIH0sXG4gICAgICBoKCdwYXRoJywgeyBkOiAnTTEuMjYgMTIuNTM0YS42Ny42NyAwIDAgMS0uNjc0LjAxMi42Ny42NyAwIDAgMS0uMzM2LS41ODN2LTExQy4yNS43MjQuMzguNS41ODYuMzgyYS42NTguNjU4IDAgMCAxIC42NzMuMDEybDkuMTY1IDUuNWEuNjYuNjYgMCAwIDEgLjMyNS41Ny42Ni42NiAwIDAgMS0uMzI1LjU3M2wtOS4xNjYgNS41eicgfSlcbiAgICApIDogaChcbiAgICAgICdzdmcnLFxuICAgICAgeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsICdjbGFzcyc6ICdVcHB5SWNvbicsIHdpZHRoOiAnMTYnLCBoZWlnaHQ6ICcxNycsIHZpZXdCb3g6ICcwIDAgMTIgMTMnIH0sXG4gICAgICBoKCdwYXRoJywgeyBkOiAnTTQuODg4LjgxdjExLjM4YzAgLjQ0Ni0uMzI0LjgxLS43MjIuODFIMi43MjJDMi4zMjQgMTMgMiAxMi42MzYgMiAxMi4xOVYuODFjMC0uNDQ2LjMyNC0uODEuNzIyLS44MWgxLjQ0NGMuMzk4IDAgLjcyMi4zNjQuNzIyLjgxek05Ljg4OC44MXYxMS4zOGMwIC40NDYtLjMyNC44MS0uNzIyLjgxSDcuNzIyQzcuMzI0IDEzIDcgMTIuNjM2IDcgMTIuMTlWLjgxYzAtLjQ0Ni4zMjQtLjgxLjcyMi0uODFoMS40NDRjLjM5OCAwIC43MjIuMzY0LjcyMi44MXonIH0pXG4gICAgKSA6IGgoXG4gICAgICAnc3ZnJyxcbiAgICAgIHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLCAnY2xhc3MnOiAnVXBweUljb24nLCB3aWR0aDogJzE2cHgnLCBoZWlnaHQ6ICcxNnB4Jywgdmlld0JveDogJzAgMCAxOSAxOScgfSxcbiAgICAgIGgoJ3BhdGgnLCB7IGQ6ICdNMTcuMzE4IDE3LjIzMkw5Ljk0IDkuODU0IDkuNTg2IDkuNWwtLjM1NC4zNTQtNy4zNzggNy4zNzhoLjcwN2wtLjYyLS42MnYuNzA2TDkuMzE4IDkuOTRsLjM1NC0uMzU0LS4zNTQtLjM1NEwxLjk0IDEuODU0di43MDdsLjYyLS42MmgtLjcwNmw3LjM3OCA3LjM3OC4zNTQuMzU0LjM1NC0uMzU0IDcuMzc4LTcuMzc4aC0uNzA3bC42MjIuNjJ2LS43MDZMOS44NTQgOS4yMzJsLS4zNTQuMzU0LjM1NC4zNTQgNy4zNzggNy4zNzguNzA4LS43MDctNy4zOC03LjM3OHYuNzA4bDcuMzgtNy4zOC4zNTMtLjM1My0uMzUzLS4zNTMtLjYyMi0uNjIyLS4zNTMtLjM1My0uMzU0LjM1Mi03LjM3OCA3LjM4aC43MDhMMi41NiAxLjIzIDIuMjA4Ljg4bC0uMzUzLjM1My0uNjIyLjYyLS4zNTMuMzU1LjM1Mi4zNTMgNy4zOCA3LjM4di0uNzA4bC03LjM4IDcuMzgtLjM1My4zNTMuMzUyLjM1My42MjIuNjIyLjM1My4zNTMuMzU0LS4zNTMgNy4zOC03LjM4aC0uNzA4bDcuMzggNy4zOHonIH0pXG4gICAgKVxuICApO1xufTtcblxudmFyIFByb2dyZXNzQmFyUHJvY2Vzc2luZyA9IGZ1bmN0aW9uIFByb2dyZXNzQmFyUHJvY2Vzc2luZyhwcm9wcykge1xuICB2YXIgdmFsdWUgPSBNYXRoLnJvdW5kKHByb3BzLnZhbHVlICogMTAwKTtcblxuICByZXR1cm4gaChcbiAgICAnZGl2JyxcbiAgICB7ICdjbGFzcyc6ICd1cHB5LVN0YXR1c0Jhci1jb250ZW50JyB9LFxuICAgIHByb3BzLm1vZGUgPT09ICdkZXRlcm1pbmF0ZScgPyB2YWx1ZSArICclIFxceEI3ICcgOiAnJyxcbiAgICBwcm9wcy5tZXNzYWdlXG4gICk7XG59O1xuXG52YXIgcHJvZ3Jlc3NEZXRhaWxzID0gZnVuY3Rpb24gcHJvZ3Jlc3NEZXRhaWxzKHByb3BzKSB7XG4gIHJldHVybiBoKFxuICAgICdzcGFuJyxcbiAgICB7ICdjbGFzcyc6ICd1cHB5LVN0YXR1c0Jhci1zdGF0dXNTZWNvbmRhcnknIH0sXG4gICAgcHJvcHMuaW5Qcm9ncmVzcyA+IDEgJiYgcHJvcHMuaTE4bignZmlsZXNVcGxvYWRlZE9mVG90YWwnLCB7IGNvbXBsZXRlOiBwcm9wcy5jb21wbGV0ZSwgc21hcnRfY291bnQ6IHByb3BzLmluUHJvZ3Jlc3MgfSkgKyAnIFxceEI3ICcsXG4gICAgcHJvcHMuaTE4bignZGF0YVVwbG9hZGVkT2ZUb3RhbCcsIHsgY29tcGxldGU6IHByb3BzLnRvdGFsVXBsb2FkZWRTaXplLCB0b3RhbDogcHJvcHMudG90YWxTaXplIH0pICsgJyBcXHhCNyAnLFxuICAgIHByb3BzLmkxOG4oJ3hUaW1lTGVmdCcsIHsgdGltZTogcHJvcHMudG90YWxFVEEgfSlcbiAgKTtcbn07XG5cbnZhciBUaHJvdHRsZWRQcm9ncmVzc0RldGFpbHMgPSB0aHJvdHRsZShwcm9ncmVzc0RldGFpbHMsIDUwMCwgeyBsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZSB9KTtcblxudmFyIFByb2dyZXNzQmFyVXBsb2FkaW5nID0gZnVuY3Rpb24gUHJvZ3Jlc3NCYXJVcGxvYWRpbmcocHJvcHMpIHtcbiAgaWYgKCFwcm9wcy5pc1VwbG9hZFN0YXJ0ZWQgfHwgcHJvcHMuaXNBbGxDb21wbGV0ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHRpdGxlID0gcHJvcHMuaXNBbGxQYXVzZWQgPyBwcm9wcy5pMThuKCdwYXVzZWQnKSA6IHByb3BzLmkxOG4oJ3VwbG9hZGluZycpO1xuXG4gIHJldHVybiBoKFxuICAgICdkaXYnLFxuICAgIHsgJ2NsYXNzJzogJ3VwcHktU3RhdHVzQmFyLWNvbnRlbnQnLCAnYXJpYS1sYWJlbCc6IHRpdGxlLCB0aXRsZTogdGl0bGUgfSxcbiAgICAhcHJvcHMuaGlkZVBhdXNlUmVzdW1lQ2FuY2VsQnV0dG9ucyAmJiBoKFBhdXNlUmVzdW1lQnV0dG9ucywgcHJvcHMpLFxuICAgIGgoXG4gICAgICAnZGl2JyxcbiAgICAgIHsgJ2NsYXNzJzogJ3VwcHktU3RhdHVzQmFyLXN0YXR1cycgfSxcbiAgICAgIGgoXG4gICAgICAgICdzcGFuJyxcbiAgICAgICAgeyAnY2xhc3MnOiAndXBweS1TdGF0dXNCYXItc3RhdHVzUHJpbWFyeScgfSxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgICc6ICcsXG4gICAgICAgIHByb3BzLnRvdGFsUHJvZ3Jlc3MsXG4gICAgICAgICclJ1xuICAgICAgKSxcbiAgICAgIGgoJ2JyJywgbnVsbCksXG4gICAgICAhcHJvcHMuaXNBbGxQYXVzZWQgJiYgaChUaHJvdHRsZWRQcm9ncmVzc0RldGFpbHMsIHByb3BzKVxuICAgIClcbiAgKTtcbn07XG5cbnZhciBQcm9ncmVzc0JhckNvbXBsZXRlID0gZnVuY3Rpb24gUHJvZ3Jlc3NCYXJDb21wbGV0ZShfcmVmKSB7XG4gIHZhciB0b3RhbFByb2dyZXNzID0gX3JlZi50b3RhbFByb2dyZXNzLFxuICAgICAgaTE4biA9IF9yZWYuaTE4bjtcblxuICByZXR1cm4gaChcbiAgICAnZGl2JyxcbiAgICB7ICdjbGFzcyc6ICd1cHB5LVN0YXR1c0Jhci1jb250ZW50Jywgcm9sZTogJ3N0YXR1cycsIHRpdGxlOiBpMThuKCdjb21wbGV0ZScpIH0sXG4gICAgaChcbiAgICAgICdzdmcnLFxuICAgICAgeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsICdjbGFzcyc6ICd1cHB5LVN0YXR1c0Jhci1zdGF0dXNJbmRpY2F0b3IgVXBweUljb24nLCB3aWR0aDogJzE4JywgaGVpZ2h0OiAnMTcnLCB2aWV3Qm94OiAnMCAwIDIzIDE3JyB9LFxuICAgICAgaCgncGF0aCcsIHsgZDogJ004Ljk0NCAxN0wwIDcuODY1bDIuNTU1LTIuNjEgNi4zOSA2LjUyNUwyMC40MSAwIDIzIDIuNjQ1eicgfSlcbiAgICApLFxuICAgIGkxOG4oJ2NvbXBsZXRlJylcbiAgKTtcbn07XG5cbnZhciBQcm9ncmVzc0JhckVycm9yID0gZnVuY3Rpb24gUHJvZ3Jlc3NCYXJFcnJvcihfcmVmMikge1xuICB2YXIgZXJyb3IgPSBfcmVmMi5lcnJvcixcbiAgICAgIHJldHJ5QWxsID0gX3JlZjIucmV0cnlBbGwsXG4gICAgICBoaWRlUmV0cnlCdXR0b24gPSBfcmVmMi5oaWRlUmV0cnlCdXR0b24sXG4gICAgICBpMThuID0gX3JlZjIuaTE4bjtcblxuICByZXR1cm4gaChcbiAgICAnZGl2JyxcbiAgICB7ICdjbGFzcyc6ICd1cHB5LVN0YXR1c0Jhci1jb250ZW50Jywgcm9sZTogJ2FsZXJ0JyB9LFxuICAgIGgoXG4gICAgICAnc3Ryb25nJyxcbiAgICAgIHsgJ2NsYXNzJzogJ3VwcHktU3RhdHVzQmFyLWNvbnRlbnRQYWRkaW5nJyB9LFxuICAgICAgaTE4bigndXBsb2FkRmFpbGVkJyksXG4gICAgICAnLidcbiAgICApLFxuICAgICFoaWRlUmV0cnlCdXR0b24gJiYgaChcbiAgICAgICdzcGFuJyxcbiAgICAgIHsgJ2NsYXNzJzogJ3VwcHktU3RhdHVzQmFyLWNvbnRlbnRQYWRkaW5nJyB9LFxuICAgICAgaTE4bigncGxlYXNlUHJlc3NSZXRyeScpXG4gICAgKSxcbiAgICBoKFxuICAgICAgJ3NwYW4nLFxuICAgICAgeyAnY2xhc3MnOiAndXBweS1TdGF0dXNCYXItZGV0YWlscycsXG4gICAgICAgICdhcmlhLWxhYmVsJzogZXJyb3IsXG4gICAgICAgICdkYXRhLW1pY3JvdGlwLXBvc2l0aW9uJzogJ3RvcCcsXG4gICAgICAgICdkYXRhLW1pY3JvdGlwLXNpemUnOiAnbGFyZ2UnLFxuICAgICAgICByb2xlOiAndG9vbHRpcCcgfSxcbiAgICAgICc/J1xuICAgIClcbiAgKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdTVEFURV9FUlJPUic6ICdlcnJvcicsXG4gICdTVEFURV9XQUlUSU5HJzogJ3dhaXRpbmcnLFxuICAnU1RBVEVfUFJFUFJPQ0VTU0lORyc6ICdwcmVwcm9jZXNzaW5nJyxcbiAgJ1NUQVRFX1VQTE9BRElORyc6ICd1cGxvYWRpbmcnLFxuICAnU1RBVEVfUE9TVFBST0NFU1NJTkcnOiAncG9zdHByb2Nlc3NpbmcnLFxuICAnU1RBVEVfQ09NUExFVEUnOiAnY29tcGxldGUnXG59OyIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnQHVwcHkvY29yZScpLFxuICAgIFBsdWdpbiA9IF9yZXF1aXJlLlBsdWdpbjtcblxudmFyIFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpO1xudmFyIFN0YXR1c0JhclVJID0gcmVxdWlyZSgnLi9TdGF0dXNCYXInKTtcbnZhciBzdGF0dXNCYXJTdGF0ZXMgPSByZXF1aXJlKCcuL1N0YXR1c0JhclN0YXRlcycpO1xudmFyIGdldFNwZWVkID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFNwZWVkJyk7XG52YXIgZ2V0Qnl0ZXNSZW1haW5pbmcgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0Qnl0ZXNSZW1haW5pbmcnKTtcbnZhciBwcmV0dHlFVEEgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvcHJldHR5RVRBJyk7XG52YXIgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdwcmV0dGllci1ieXRlcycpO1xuXG4vKipcbiAqIFN0YXR1c0JhcjogcmVuZGVycyBhIHN0YXR1cyBiYXIgd2l0aCB1cGxvYWQvcGF1c2UvcmVzdW1lL2NhbmNlbC9yZXRyeSBidXR0b25zLFxuICogcHJvZ3Jlc3MgcGVyY2VudGFnZSBhbmQgdGltZSByZW1haW5pbmcuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKF9QbHVnaW4pIHtcbiAgX2luaGVyaXRzKFN0YXR1c0JhciwgX1BsdWdpbik7XG5cbiAgZnVuY3Rpb24gU3RhdHVzQmFyKHVwcHksIG9wdHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3RhdHVzQmFyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9QbHVnaW4uY2FsbCh0aGlzLCB1cHB5LCBvcHRzKSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLm9wdHMuaWQgfHwgJ1N0YXR1c0Jhcic7XG4gICAgX3RoaXMudGl0bGUgPSAnU3RhdHVzQmFyJztcbiAgICBfdGhpcy50eXBlID0gJ3Byb2dyZXNzaW5kaWNhdG9yJztcblxuICAgIHZhciBkZWZhdWx0TG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge1xuICAgICAgICB1cGxvYWRpbmc6ICdVcGxvYWRpbmcnLFxuICAgICAgICBjb21wbGV0ZTogJ0NvbXBsZXRlJyxcbiAgICAgICAgdXBsb2FkRmFpbGVkOiAnVXBsb2FkIGZhaWxlZCcsXG4gICAgICAgIHBsZWFzZVByZXNzUmV0cnk6ICdQbGVhc2UgcHJlc3MgUmV0cnkgdG8gdXBsb2FkIGFnYWluJyxcbiAgICAgICAgcGF1c2VkOiAnUGF1c2VkJyxcbiAgICAgICAgZXJyb3I6ICdFcnJvcicsXG4gICAgICAgIHJldHJ5OiAnUmV0cnknLFxuICAgICAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgICAgICBwcmVzc1RvUmV0cnk6ICdQcmVzcyB0byByZXRyeScsXG4gICAgICAgIHJldHJ5VXBsb2FkOiAnUmV0cnkgdXBsb2FkJyxcbiAgICAgICAgcmVzdW1lVXBsb2FkOiAnUmVzdW1lIHVwbG9hZCcsXG4gICAgICAgIGNhbmNlbFVwbG9hZDogJ0NhbmNlbCB1cGxvYWQnLFxuICAgICAgICBwYXVzZVVwbG9hZDogJ1BhdXNlIHVwbG9hZCcsXG4gICAgICAgIGZpbGVzVXBsb2FkZWRPZlRvdGFsOiB7XG4gICAgICAgICAgMDogJyV7Y29tcGxldGV9IG9mICV7c21hcnRfY291bnR9IGZpbGUgdXBsb2FkZWQnLFxuICAgICAgICAgIDE6ICcle2NvbXBsZXRlfSBvZiAle3NtYXJ0X2NvdW50fSBmaWxlcyB1cGxvYWRlZCdcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YVVwbG9hZGVkT2ZUb3RhbDogJyV7Y29tcGxldGV9IG9mICV7dG90YWx9JyxcbiAgICAgICAgeFRpbWVMZWZ0OiAnJXt0aW1lfSBsZWZ0JyxcbiAgICAgICAgdXBsb2FkWEZpbGVzOiB7XG4gICAgICAgICAgMDogJ1VwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnVXBsb2FkICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICB1cGxvYWRYTmV3RmlsZXM6IHtcbiAgICAgICAgICAwOiAnVXBsb2FkICsle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnVXBsb2FkICsle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgfTt2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6ICdib2R5JyxcbiAgICAgIGhpZGVVcGxvYWRCdXR0b246IGZhbHNlLFxuICAgICAgaGlkZVJldHJ5QnV0dG9uOiBmYWxzZSxcbiAgICAgIGhpZGVQYXVzZVJlc3VtZUNhbmNlbEJ1dHRvbnM6IGZhbHNlLFxuICAgICAgc2hvd1Byb2dyZXNzRGV0YWlsczogZmFsc2UsXG4gICAgICBsb2NhbGU6IGRlZmF1bHRMb2NhbGUsXG4gICAgICBoaWRlQWZ0ZXJGaW5pc2g6IHRydWVcblxuICAgICAgLy8gbWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB9O190aGlzLm9wdHMgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpO1xuXG4gICAgX3RoaXMubG9jYWxlID0gX2V4dGVuZHMoe30sIGRlZmF1bHRMb2NhbGUsIF90aGlzLm9wdHMubG9jYWxlKTtcbiAgICBfdGhpcy5sb2NhbGUuc3RyaW5ncyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0TG9jYWxlLnN0cmluZ3MsIF90aGlzLm9wdHMubG9jYWxlLnN0cmluZ3MpO1xuXG4gICAgX3RoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKHsgbG9jYWxlOiBfdGhpcy5sb2NhbGUgfSk7XG4gICAgX3RoaXMuaTE4biA9IF90aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQoX3RoaXMudHJhbnNsYXRvcik7XG5cbiAgICBfdGhpcy5zdGFydFVwbG9hZCA9IF90aGlzLnN0YXJ0VXBsb2FkLmJpbmQoX3RoaXMpO1xuICAgIF90aGlzLnJlbmRlciA9IF90aGlzLnJlbmRlci5iaW5kKF90aGlzKTtcbiAgICBfdGhpcy5pbnN0YWxsID0gX3RoaXMuaW5zdGFsbC5iaW5kKF90aGlzKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBTdGF0dXNCYXIucHJvdG90eXBlLmdldFRvdGFsU3BlZWQgPSBmdW5jdGlvbiBnZXRUb3RhbFNwZWVkKGZpbGVzKSB7XG4gICAgdmFyIHRvdGFsU3BlZWQgPSAwO1xuICAgIGZpbGVzLmZvckVhY2goZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHRvdGFsU3BlZWQgPSB0b3RhbFNwZWVkICsgZ2V0U3BlZWQoZmlsZS5wcm9ncmVzcyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdGFsU3BlZWQ7XG4gIH07XG5cbiAgU3RhdHVzQmFyLnByb3RvdHlwZS5nZXRUb3RhbEVUQSA9IGZ1bmN0aW9uIGdldFRvdGFsRVRBKGZpbGVzKSB7XG4gICAgdmFyIHRvdGFsU3BlZWQgPSB0aGlzLmdldFRvdGFsU3BlZWQoZmlsZXMpO1xuICAgIGlmICh0b3RhbFNwZWVkID09PSAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICB2YXIgdG90YWxCeXRlc1JlbWFpbmluZyA9IGZpbGVzLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIGZpbGUpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIGdldEJ5dGVzUmVtYWluaW5nKGZpbGUucHJvZ3Jlc3MpO1xuICAgIH0sIDApO1xuXG4gICAgcmV0dXJuIE1hdGgucm91bmQodG90YWxCeXRlc1JlbWFpbmluZyAvIHRvdGFsU3BlZWQgKiAxMCkgLyAxMDtcbiAgfTtcblxuICBTdGF0dXNCYXIucHJvdG90eXBlLnN0YXJ0VXBsb2FkID0gZnVuY3Rpb24gc3RhcnRVcGxvYWQoKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy51cHB5LnVwbG9hZCgpLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIF90aGlzMi51cHB5LmxvZyhlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UgfHwgZXJyKTtcbiAgICAgIC8vIElnbm9yZVxuICAgIH0pO1xuICB9O1xuXG4gIFN0YXR1c0Jhci5wcm90b3R5cGUuZ2V0VXBsb2FkaW5nU3RhdGUgPSBmdW5jdGlvbiBnZXRVcGxvYWRpbmdTdGF0ZShpc0FsbEVycm9yZWQsIGlzQWxsQ29tcGxldGUsIGZpbGVzKSB7XG4gICAgaWYgKGlzQWxsRXJyb3JlZCkge1xuICAgICAgcmV0dXJuIHN0YXR1c0JhclN0YXRlcy5TVEFURV9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoaXNBbGxDb21wbGV0ZSkge1xuICAgICAgcmV0dXJuIHN0YXR1c0JhclN0YXRlcy5TVEFURV9DT01QTEVURTtcbiAgICB9XG5cbiAgICB2YXIgc3RhdGUgPSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfV0FJVElORztcbiAgICB2YXIgZmlsZUlEcyA9IE9iamVjdC5rZXlzKGZpbGVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVJRHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwcm9ncmVzcyA9IGZpbGVzW2ZpbGVJRHNbaV1dLnByb2dyZXNzO1xuICAgICAgLy8gSWYgQU5ZIGZpbGVzIGFyZSBiZWluZyB1cGxvYWRlZCByaWdodCBub3csIHNob3cgdGhlIHVwbG9hZGluZyBzdGF0ZS5cbiAgICAgIGlmIChwcm9ncmVzcy51cGxvYWRTdGFydGVkICYmICFwcm9ncmVzcy51cGxvYWRDb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1VQTE9BRElORztcbiAgICAgIH1cbiAgICAgIC8vIElmIGZpbGVzIGFyZSBiZWluZyBwcmVwcm9jZXNzZWQgQU5EIHBvc3Rwcm9jZXNzZWQgYXQgdGhpcyB0aW1lLCB3ZSBzaG93IHRoZVxuICAgICAgLy8gcHJlcHJvY2VzcyBzdGF0ZS4gSWYgYW55IGZpbGVzIGFyZSBiZWluZyB1cGxvYWRlZCB3ZSBzaG93IHVwbG9hZGluZy5cbiAgICAgIGlmIChwcm9ncmVzcy5wcmVwcm9jZXNzICYmIHN0YXRlICE9PSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfVVBMT0FESU5HKSB7XG4gICAgICAgIHN0YXRlID0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1BSRVBST0NFU1NJTkc7XG4gICAgICB9XG4gICAgICAvLyBJZiBOTyBmaWxlcyBhcmUgYmVpbmcgcHJlcHJvY2Vzc2VkIG9yIHVwbG9hZGVkIHJpZ2h0IG5vdywgYnV0IHNvbWUgZmlsZXMgYXJlXG4gICAgICAvLyBiZWluZyBwb3N0cHJvY2Vzc2VkLCBzaG93IHRoZSBwb3N0cHJvY2VzcyBzdGF0ZS5cbiAgICAgIGlmIChwcm9ncmVzcy5wb3N0cHJvY2VzcyAmJiBzdGF0ZSAhPT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1VQTE9BRElORyAmJiBzdGF0ZSAhPT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1BSRVBST0NFU1NJTkcpIHtcbiAgICAgICAgc3RhdGUgPSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfUE9TVFBST0NFU1NJTkc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZTtcbiAgfTtcblxuICBTdGF0dXNCYXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcihzdGF0ZSkge1xuICAgIHZhciBmaWxlcyA9IHN0YXRlLmZpbGVzO1xuXG4gICAgdmFyIHVwbG9hZFN0YXJ0ZWRGaWxlcyA9IE9iamVjdC5rZXlzKGZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiBmaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkO1xuICAgIH0pO1xuICAgIHZhciBuZXdGaWxlcyA9IE9iamVjdC5rZXlzKGZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiAhZmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCAmJiAhZmlsZXNbZmlsZV0ucHJvZ3Jlc3MucHJlcHJvY2VzcyAmJiAhZmlsZXNbZmlsZV0ucHJvZ3Jlc3MucG9zdHByb2Nlc3M7XG4gICAgfSk7XG4gICAgdmFyIGNvbXBsZXRlRmlsZXMgPSBPYmplY3Qua2V5cyhmaWxlcykuZmlsdGVyKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gZmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGU7XG4gICAgfSk7XG4gICAgdmFyIGVycm9yZWRGaWxlcyA9IE9iamVjdC5rZXlzKGZpbGVzKS5maWx0ZXIoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIHJldHVybiBmaWxlc1tmaWxlXS5lcnJvcjtcbiAgICB9KTtcbiAgICB2YXIgaW5Qcm9ncmVzc0ZpbGVzID0gT2JqZWN0LmtleXMoZmlsZXMpLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgcmV0dXJuICFmaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJiBmaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkICYmICFmaWxlc1tmaWxlXS5pc1BhdXNlZDtcbiAgICB9KTtcbiAgICB2YXIgcHJvY2Vzc2luZ0ZpbGVzID0gT2JqZWN0LmtleXMoZmlsZXMpLmZpbHRlcihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgcmV0dXJuIGZpbGVzW2ZpbGVdLnByb2dyZXNzLnByZXByb2Nlc3MgfHwgZmlsZXNbZmlsZV0ucHJvZ3Jlc3MucG9zdHByb2Nlc3M7XG4gICAgfSk7XG5cbiAgICB2YXIgaW5Qcm9ncmVzc0ZpbGVzQXJyYXkgPSBpblByb2dyZXNzRmlsZXMubWFwKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICByZXR1cm4gZmlsZXNbZmlsZV07XG4gICAgfSk7XG5cbiAgICB2YXIgdG90YWxTcGVlZCA9IHByZXR0eUJ5dGVzKHRoaXMuZ2V0VG90YWxTcGVlZChpblByb2dyZXNzRmlsZXNBcnJheSkpO1xuICAgIHZhciB0b3RhbEVUQSA9IHByZXR0eUVUQSh0aGlzLmdldFRvdGFsRVRBKGluUHJvZ3Jlc3NGaWxlc0FycmF5KSk7XG5cbiAgICAvLyB0b3RhbCBzaXplIGFuZCB1cGxvYWRlZCBzaXplXG4gICAgdmFyIHRvdGFsU2l6ZSA9IDA7XG4gICAgdmFyIHRvdGFsVXBsb2FkZWRTaXplID0gMDtcbiAgICBpblByb2dyZXNzRmlsZXNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICB0b3RhbFNpemUgPSB0b3RhbFNpemUgKyAoZmlsZS5wcm9ncmVzcy5ieXRlc1RvdGFsIHx8IDApO1xuICAgICAgdG90YWxVcGxvYWRlZFNpemUgPSB0b3RhbFVwbG9hZGVkU2l6ZSArIChmaWxlLnByb2dyZXNzLmJ5dGVzVXBsb2FkZWQgfHwgMCk7XG4gICAgfSk7XG4gICAgdG90YWxTaXplID0gcHJldHR5Qnl0ZXModG90YWxTaXplKTtcbiAgICB0b3RhbFVwbG9hZGVkU2l6ZSA9IHByZXR0eUJ5dGVzKHRvdGFsVXBsb2FkZWRTaXplKTtcblxuICAgIHZhciBpc1VwbG9hZFN0YXJ0ZWQgPSB1cGxvYWRTdGFydGVkRmlsZXMubGVuZ3RoID4gMDtcblxuICAgIHZhciBpc0FsbENvbXBsZXRlID0gc3RhdGUudG90YWxQcm9ncmVzcyA9PT0gMTAwICYmIGNvbXBsZXRlRmlsZXMubGVuZ3RoID09PSBPYmplY3Qua2V5cyhmaWxlcykubGVuZ3RoICYmIHByb2Nlc3NpbmdGaWxlcy5sZW5ndGggPT09IDA7XG5cbiAgICB2YXIgaXNBbGxFcnJvcmVkID0gaXNVcGxvYWRTdGFydGVkICYmIGVycm9yZWRGaWxlcy5sZW5ndGggPT09IHVwbG9hZFN0YXJ0ZWRGaWxlcy5sZW5ndGg7XG5cbiAgICB2YXIgaXNBbGxQYXVzZWQgPSBpblByb2dyZXNzRmlsZXMubGVuZ3RoID09PSAwICYmICFpc0FsbENvbXBsZXRlICYmICFpc0FsbEVycm9yZWQgJiYgdXBsb2FkU3RhcnRlZEZpbGVzLmxlbmd0aCA+IDA7XG5cbiAgICB2YXIgcmVzdW1hYmxlVXBsb2FkcyA9IHN0YXRlLmNhcGFiaWxpdGllcy5yZXN1bWFibGVVcGxvYWRzIHx8IGZhbHNlO1xuXG4gICAgcmV0dXJuIFN0YXR1c0JhclVJKHtcbiAgICAgIGVycm9yOiBzdGF0ZS5lcnJvcixcbiAgICAgIHVwbG9hZFN0YXRlOiB0aGlzLmdldFVwbG9hZGluZ1N0YXRlKGlzQWxsRXJyb3JlZCwgaXNBbGxDb21wbGV0ZSwgc3RhdGUuZmlsZXMgfHwge30pLFxuICAgICAgdG90YWxQcm9ncmVzczogc3RhdGUudG90YWxQcm9ncmVzcyxcbiAgICAgIHRvdGFsU2l6ZTogdG90YWxTaXplLFxuICAgICAgdG90YWxVcGxvYWRlZFNpemU6IHRvdGFsVXBsb2FkZWRTaXplLFxuICAgICAgdXBsb2FkU3RhcnRlZDogdXBsb2FkU3RhcnRlZEZpbGVzLmxlbmd0aCxcbiAgICAgIGlzQWxsQ29tcGxldGU6IGlzQWxsQ29tcGxldGUsXG4gICAgICBpc0FsbFBhdXNlZDogaXNBbGxQYXVzZWQsXG4gICAgICBpc0FsbEVycm9yZWQ6IGlzQWxsRXJyb3JlZCxcbiAgICAgIGlzVXBsb2FkU3RhcnRlZDogaXNVcGxvYWRTdGFydGVkLFxuICAgICAgY29tcGxldGU6IGNvbXBsZXRlRmlsZXMubGVuZ3RoLFxuICAgICAgbmV3RmlsZXM6IG5ld0ZpbGVzLmxlbmd0aCxcbiAgICAgIGluUHJvZ3Jlc3M6IGluUHJvZ3Jlc3NGaWxlcy5sZW5ndGgsXG4gICAgICB0b3RhbFNwZWVkOiB0b3RhbFNwZWVkLFxuICAgICAgdG90YWxFVEE6IHRvdGFsRVRBLFxuICAgICAgZmlsZXM6IHN0YXRlLmZpbGVzLFxuICAgICAgaTE4bjogdGhpcy5pMThuLFxuICAgICAgcGF1c2VBbGw6IHRoaXMudXBweS5wYXVzZUFsbCxcbiAgICAgIHJlc3VtZUFsbDogdGhpcy51cHB5LnJlc3VtZUFsbCxcbiAgICAgIHJldHJ5QWxsOiB0aGlzLnVwcHkucmV0cnlBbGwsXG4gICAgICBjYW5jZWxBbGw6IHRoaXMudXBweS5jYW5jZWxBbGwsXG4gICAgICBzdGFydFVwbG9hZDogdGhpcy5zdGFydFVwbG9hZCxcbiAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IHJlc3VtYWJsZVVwbG9hZHMsXG4gICAgICBzaG93UHJvZ3Jlc3NEZXRhaWxzOiB0aGlzLm9wdHMuc2hvd1Byb2dyZXNzRGV0YWlscyxcbiAgICAgIGhpZGVVcGxvYWRCdXR0b246IHRoaXMub3B0cy5oaWRlVXBsb2FkQnV0dG9uLFxuICAgICAgaGlkZVJldHJ5QnV0dG9uOiB0aGlzLm9wdHMuaGlkZVJldHJ5QnV0dG9uLFxuICAgICAgaGlkZVBhdXNlUmVzdW1lQ2FuY2VsQnV0dG9uczogdGhpcy5vcHRzLmhpZGVQYXVzZVJlc3VtZUNhbmNlbEJ1dHRvbnMsXG4gICAgICBoaWRlQWZ0ZXJGaW5pc2g6IHRoaXMub3B0cy5oaWRlQWZ0ZXJGaW5pc2hcbiAgICB9KTtcbiAgfTtcblxuICBTdGF0dXNCYXIucHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbiBpbnN0YWxsKCkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLm9wdHMudGFyZ2V0O1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgU3RhdHVzQmFyLnByb3RvdHlwZS51bmluc3RhbGwgPSBmdW5jdGlvbiB1bmluc3RhbGwoKSB7XG4gICAgdGhpcy51bm1vdW50KCk7XG4gIH07XG5cbiAgcmV0dXJuIFN0YXR1c0Jhcjtcbn0oUGx1Z2luKTsiLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKipcbiAqIERlZmF1bHQgc3RvcmUgdGhhdCBrZWVwcyBzdGF0ZSBpbiBhIHNpbXBsZSBvYmplY3QuXG4gKi9cbnZhciBEZWZhdWx0U3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIERlZmF1bHRTdG9yZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGVmYXVsdFN0b3JlKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICB9XG5cbiAgRGVmYXVsdFN0b3JlLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlO1xuICB9O1xuXG4gIERlZmF1bHRTdG9yZS5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiBzZXRTdGF0ZShwYXRjaCkge1xuICAgIHZhciBwcmV2U3RhdGUgPSBfZXh0ZW5kcyh7fSwgdGhpcy5zdGF0ZSk7XG4gICAgdmFyIG5leHRTdGF0ZSA9IF9leHRlbmRzKHt9LCB0aGlzLnN0YXRlLCBwYXRjaCk7XG5cbiAgICB0aGlzLnN0YXRlID0gbmV4dFN0YXRlO1xuICAgIHRoaXMuX3B1Ymxpc2gocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKTtcbiAgfTtcblxuICBEZWZhdWx0U3RvcmUucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGxpc3RlbmVyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICAgIF90aGlzLmNhbGxiYWNrcy5zcGxpY2UoX3RoaXMuY2FsbGJhY2tzLmluZGV4T2YobGlzdGVuZXIpLCAxKTtcbiAgICB9O1xuICB9O1xuXG4gIERlZmF1bHRTdG9yZS5wcm90b3R5cGUuX3B1Ymxpc2ggPSBmdW5jdGlvbiBfcHVibGlzaCgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRGVmYXVsdFN0b3JlO1xufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRTdG9yZSgpIHtcbiAgcmV0dXJuIG5ldyBEZWZhdWx0U3RvcmUoKTtcbn07IiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdAdXBweS9jb3JlJyksXG4gICAgUGx1Z2luID0gX3JlcXVpcmUuUGx1Z2luO1xuXG52YXIgdHVzID0gcmVxdWlyZSgndHVzLWpzLWNsaWVudCcpO1xuXG52YXIgX3JlcXVpcmUyID0gcmVxdWlyZSgnQHVwcHkvc2VydmVyLXV0aWxzJyksXG4gICAgUHJvdmlkZXIgPSBfcmVxdWlyZTIuUHJvdmlkZXIsXG4gICAgUmVxdWVzdENsaWVudCA9IF9yZXF1aXJlMi5SZXF1ZXN0Q2xpZW50LFxuICAgIFNvY2tldCA9IF9yZXF1aXJlMi5Tb2NrZXQ7XG5cbnZhciBlbWl0U29ja2V0UHJvZ3Jlc3MgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZW1pdFNvY2tldFByb2dyZXNzJyk7XG52YXIgZ2V0U29ja2V0SG9zdCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRTb2NrZXRIb3N0Jyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3NldHRsZScpO1xudmFyIGxpbWl0UHJvbWlzZXMgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvbGltaXRQcm9taXNlcycpO1xuXG4vLyBFeHRyYWN0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdHVzL3R1cy1qcy1jbGllbnQvYmxvYi9tYXN0ZXIvbGliL3VwbG9hZC5qcyNMMTNcbi8vIGV4Y2VwdGVkIHdlIHJlbW92ZWQgJ2ZpbmdlcnByaW50JyBrZXkgdG8gYXZvaWQgYWRkaW5nIG1vcmUgZGVwZW5kZW5jaWVzXG52YXIgdHVzRGVmYXVsdE9wdGlvbnMgPSB7XG4gIGVuZHBvaW50OiAnJyxcbiAgcmVzdW1lOiB0cnVlLFxuICBvblByb2dyZXNzOiBudWxsLFxuICBvbkNodW5rQ29tcGxldGU6IG51bGwsXG4gIG9uU3VjY2VzczogbnVsbCxcbiAgb25FcnJvcjogbnVsbCxcbiAgaGVhZGVyczoge30sXG4gIGNodW5rU2l6ZTogSW5maW5pdHksXG4gIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gIHVwbG9hZFVybDogbnVsbCxcbiAgdXBsb2FkU2l6ZTogbnVsbCxcbiAgb3ZlcnJpZGVQYXRjaE1ldGhvZDogZmFsc2UsXG4gIHJldHJ5RGVsYXlzOiBudWxsXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHdyYXBwZXIgYXJvdW5kIGFuIGV2ZW50IGVtaXR0ZXIgd2l0aCBhIGByZW1vdmVgIG1ldGhvZCB0byByZW1vdmVcbiAgICogYWxsIGV2ZW50cyB0aGF0IHdlcmUgYWRkZWQgdXNpbmcgdGhlIHdyYXBwZWQgZW1pdHRlci5cbiAgICovXG59O2Z1bmN0aW9uIGNyZWF0ZUV2ZW50VHJhY2tlcihlbWl0dGVyKSB7XG4gIHZhciBldmVudHMgPSBbXTtcbiAgcmV0dXJuIHtcbiAgICBvbjogZnVuY3Rpb24gb24oZXZlbnQsIGZuKSB7XG4gICAgICBldmVudHMucHVzaChbZXZlbnQsIGZuXSk7XG4gICAgICByZXR1cm4gZW1pdHRlci5vbihldmVudCwgZm4pO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgZXZlbnQgPSBfcmVmWzBdLFxuICAgICAgICAgICAgZm4gPSBfcmVmWzFdO1xuXG4gICAgICAgIGVtaXR0ZXIub2ZmKGV2ZW50LCBmbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVHVzIHJlc3VtYWJsZSBmaWxlIHVwbG9hZGVyXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChfUGx1Z2luKSB7XG4gIF9pbmhlcml0cyhUdXMsIF9QbHVnaW4pO1xuXG4gIGZ1bmN0aW9uIFR1cyh1cHB5LCBvcHRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFR1cyk7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfUGx1Z2luLmNhbGwodGhpcywgdXBweSwgb3B0cykpO1xuXG4gICAgX3RoaXMudHlwZSA9ICd1cGxvYWRlcic7XG4gICAgX3RoaXMuaWQgPSAnVHVzJztcbiAgICBfdGhpcy50aXRsZSA9ICdUdXMnO1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHJlc3VtZTogdHJ1ZSxcbiAgICAgIGF1dG9SZXRyeTogdHJ1ZSxcbiAgICAgIHVzZUZhc3RSZW1vdGVSZXRyeTogdHJ1ZSxcbiAgICAgIGxpbWl0OiAwLFxuICAgICAgcmV0cnlEZWxheXM6IFswLCAxMDAwLCAzMDAwLCA1MDAwXVxuXG4gICAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIH07X3RoaXMub3B0cyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cyk7XG5cbiAgICAvLyBTaW11bHRhbmVvdXMgdXBsb2FkIGxpbWl0aW5nIGlzIHNoYXJlZCBhY3Jvc3MgYWxsIHVwbG9hZHMgd2l0aCB0aGlzIHBsdWdpbi5cbiAgICBpZiAodHlwZW9mIF90aGlzLm9wdHMubGltaXQgPT09ICdudW1iZXInICYmIF90aGlzLm9wdHMubGltaXQgIT09IDApIHtcbiAgICAgIF90aGlzLmxpbWl0VXBsb2FkcyA9IGxpbWl0UHJvbWlzZXMoX3RoaXMub3B0cy5saW1pdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLmxpbWl0VXBsb2FkcyA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZm47XG4gICAgICB9O1xuICAgIH1cblxuICAgIF90aGlzLnVwbG9hZGVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgX3RoaXMudXBsb2FkZXJFdmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIF90aGlzLnVwbG9hZGVyU29ja2V0cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICBfdGhpcy5oYW5kbGVSZXNldFByb2dyZXNzID0gX3RoaXMuaGFuZGxlUmVzZXRQcm9ncmVzcy5iaW5kKF90aGlzKTtcbiAgICBfdGhpcy5oYW5kbGVVcGxvYWQgPSBfdGhpcy5oYW5kbGVVcGxvYWQuYmluZChfdGhpcyk7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgVHVzLnByb3RvdHlwZS5oYW5kbGVSZXNldFByb2dyZXNzID0gZnVuY3Rpb24gaGFuZGxlUmVzZXRQcm9ncmVzcygpIHtcbiAgICB2YXIgZmlsZXMgPSBfZXh0ZW5kcyh7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkuZmlsZXMpO1xuICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWxlSUQpIHtcbiAgICAgIC8vIE9ubHkgY2xvbmUgdGhlIGZpbGUgb2JqZWN0IGlmIGl0IGhhcyBhIFR1cyBgdXBsb2FkVXJsYCBhdHRhY2hlZC5cbiAgICAgIGlmIChmaWxlc1tmaWxlSURdLnR1cyAmJiBmaWxlc1tmaWxlSURdLnR1cy51cGxvYWRVcmwpIHtcbiAgICAgICAgdmFyIHR1c1N0YXRlID0gX2V4dGVuZHMoe30sIGZpbGVzW2ZpbGVJRF0udHVzKTtcbiAgICAgICAgZGVsZXRlIHR1c1N0YXRlLnVwbG9hZFVybDtcbiAgICAgICAgZmlsZXNbZmlsZUlEXSA9IF9leHRlbmRzKHt9LCBmaWxlc1tmaWxlSURdLCB7IHR1czogdHVzU3RhdGUgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoeyBmaWxlczogZmlsZXMgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIGFsbCByZWZlcmVuY2VzIGZvciBhIGZpbGUncyB1cGxvYWQ6IHRoZSB0dXMuVXBsb2FkIGluc3RhbmNlLFxuICAgKiBhbnkgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIGZpbGUsIGFuZCB0aGUgdXBweS1zZXJ2ZXIgV2ViU29ja2V0IGNvbm5lY3Rpb24uXG4gICAqL1xuXG5cbiAgVHVzLnByb3RvdHlwZS5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyA9IGZ1bmN0aW9uIHJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGVJRCkge1xuICAgIGlmICh0aGlzLnVwbG9hZGVyc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLnVwbG9hZGVyc1tmaWxlSURdLmFib3J0KCk7XG4gICAgICB0aGlzLnVwbG9hZGVyc1tmaWxlSURdID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXSkge1xuICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLnJlbW92ZSgpO1xuICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0pIHtcbiAgICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0uY2xvc2UoKTtcbiAgICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0gPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFR1cyB1cGxvYWRcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpbGUgZm9yIHVzZSB3aXRoIHVwbG9hZFxuICAgKiBAcGFyYW0ge2ludGVnZXJ9IGN1cnJlbnQgZmlsZSBpbiBhIHF1ZXVlXG4gICAqIEBwYXJhbSB7aW50ZWdlcn0gdG90YWwgbnVtYmVyIG9mIGZpbGVzIGluIGEgcXVldWVcbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuXG5cbiAgVHVzLnByb3RvdHlwZS51cGxvYWQgPSBmdW5jdGlvbiB1cGxvYWQoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCk7XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgdHVzIHVwbG9hZFxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgb3B0c1R1cyA9IF9leHRlbmRzKHt9LCB0dXNEZWZhdWx0T3B0aW9ucywgX3RoaXMyLm9wdHMsXG4gICAgICAvLyBJbnN0YWxsIGZpbGUtc3BlY2lmaWMgdXBsb2FkIG92ZXJyaWRlcy5cbiAgICAgIGZpbGUudHVzIHx8IHt9KTtcblxuICAgICAgb3B0c1R1cy5vbkVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICBfdGhpczIudXBweS5sb2coZXJyKTtcbiAgICAgICAgX3RoaXMyLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyKTtcbiAgICAgICAgZXJyLm1lc3NhZ2UgPSAnRmFpbGVkIGJlY2F1c2U6ICcgKyBlcnIubWVzc2FnZTtcblxuICAgICAgICBfdGhpczIucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCk7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcblxuICAgICAgb3B0c1R1cy5vblByb2dyZXNzID0gZnVuY3Rpb24gKGJ5dGVzVXBsb2FkZWQsIGJ5dGVzVG90YWwpIHtcbiAgICAgICAgX3RoaXMyLm9uUmVjZWl2ZVVwbG9hZFVybChmaWxlLCB1cGxvYWQudXJsKTtcbiAgICAgICAgX3RoaXMyLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgIHVwbG9hZGVyOiBfdGhpczIsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogYnl0ZXNVcGxvYWRlZCxcbiAgICAgICAgICBieXRlc1RvdGFsOiBieXRlc1RvdGFsXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgb3B0c1R1cy5vblN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzMi51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkLCB1cGxvYWQudXJsKTtcblxuICAgICAgICBpZiAodXBsb2FkLnVybCkge1xuICAgICAgICAgIF90aGlzMi51cHB5LmxvZygnRG93bmxvYWQgJyArIHVwbG9hZC5maWxlLm5hbWUgKyAnIGZyb20gJyArIHVwbG9hZC51cmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMyLnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpO1xuICAgICAgICByZXNvbHZlKHVwbG9hZCk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgY29weVByb3AgPSBmdW5jdGlvbiBjb3B5UHJvcChvYmosIHNyY1Byb3AsIGRlc3RQcm9wKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBzcmNQcm9wKSAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZGVzdFByb3ApKSB7XG4gICAgICAgICAgb2JqW2Rlc3RQcm9wXSA9IG9ialtzcmNQcm9wXTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gdHVzZCB1c2VzIG1ldGFkYXRhIGZpZWxkcyAnZmlsZXR5cGUnIGFuZCAnZmlsZW5hbWUnXG4gICAgICB2YXIgbWV0YSA9IF9leHRlbmRzKHt9LCBmaWxlLm1ldGEpO1xuICAgICAgY29weVByb3AobWV0YSwgJ3R5cGUnLCAnZmlsZXR5cGUnKTtcbiAgICAgIGNvcHlQcm9wKG1ldGEsICduYW1lJywgJ2ZpbGVuYW1lJyk7XG4gICAgICBvcHRzVHVzLm1ldGFkYXRhID0gbWV0YTtcblxuICAgICAgdmFyIHVwbG9hZCA9IG5ldyB0dXMuVXBsb2FkKGZpbGUuZGF0YSwgb3B0c1R1cyk7XG4gICAgICBfdGhpczIudXBsb2FkZXJzW2ZpbGUuaWRdID0gdXBsb2FkO1xuICAgICAgX3RoaXMyLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gY3JlYXRlRXZlbnRUcmFja2VyKF90aGlzMi51cHB5KTtcblxuICAgICAgX3RoaXMyLm9uRmlsZVJlbW92ZShmaWxlLmlkLCBmdW5jdGlvbiAodGFyZ2V0RmlsZUlEKSB7XG4gICAgICAgIF90aGlzMi5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKTtcbiAgICAgICAgcmVzb2x2ZSgndXBsb2FkICcgKyB0YXJnZXRGaWxlSUQgKyAnIHdhcyByZW1vdmVkJyk7XG4gICAgICB9KTtcblxuICAgICAgX3RoaXMyLm9uUGF1c2UoZmlsZS5pZCwgZnVuY3Rpb24gKGlzUGF1c2VkKSB7XG4gICAgICAgIGlmIChpc1BhdXNlZCkge1xuICAgICAgICAgIHVwbG9hZC5hYm9ydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVwbG9hZC5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgX3RoaXMyLm9uUGF1c2VBbGwoZmlsZS5pZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICB1cGxvYWQuYWJvcnQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpczIub25DYW5jZWxBbGwoZmlsZS5pZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczIucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCk7XG4gICAgICB9KTtcblxuICAgICAgX3RoaXMyLm9uUmVzdW1lQWxsKGZpbGUuaWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgICB1cGxvYWQuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICB1cGxvYWQuc3RhcnQoKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWZpbGUuaXNQYXVzZWQpIHtcbiAgICAgICAgdXBsb2FkLnN0YXJ0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgVHVzLnByb3RvdHlwZS51cGxvYWRSZW1vdGUgPSBmdW5jdGlvbiB1cGxvYWRSZW1vdGUoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCk7XG5cbiAgICB2YXIgb3B0cyA9IF9leHRlbmRzKHt9LCB0aGlzLm9wdHMsXG4gICAgLy8gSW5zdGFsbCBmaWxlLXNwZWNpZmljIHVwbG9hZCBvdmVycmlkZXMuXG4gICAgZmlsZS50dXMgfHwge30pO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIF90aGlzMy51cHB5LmxvZyhmaWxlLnJlbW90ZS51cmwpO1xuICAgICAgaWYgKGZpbGUuc2VydmVyVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMy5jb25uZWN0VG9TZXJ2ZXJTb2NrZXQoZmlsZSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICAgIH1cblxuICAgICAgX3RoaXMzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKTtcbiAgICAgIHZhciBDbGllbnQgPSBmaWxlLnJlbW90ZS5wcm92aWRlck9wdGlvbnMucHJvdmlkZXIgPyBQcm92aWRlciA6IFJlcXVlc3RDbGllbnQ7XG4gICAgICB2YXIgY2xpZW50ID0gbmV3IENsaWVudChfdGhpczMudXBweSwgZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zKTtcbiAgICAgIGNsaWVudC5wb3N0KGZpbGUucmVtb3RlLnVybCwgX2V4dGVuZHMoe30sIGZpbGUucmVtb3RlLmJvZHksIHtcbiAgICAgICAgZW5kcG9pbnQ6IG9wdHMuZW5kcG9pbnQsXG4gICAgICAgIHVwbG9hZFVybDogb3B0cy51cGxvYWRVcmwsXG4gICAgICAgIHByb3RvY29sOiAndHVzJyxcbiAgICAgICAgc2l6ZTogZmlsZS5kYXRhLnNpemUsXG4gICAgICAgIG1ldGFkYXRhOiBmaWxlLm1ldGFcbiAgICAgIH0pKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgX3RoaXMzLnVwcHkuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHsgc2VydmVyVG9rZW46IHJlcy50b2tlbiB9KTtcbiAgICAgICAgZmlsZSA9IF90aGlzMy51cHB5LmdldEZpbGUoZmlsZS5pZCk7XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMzLmNvbm5lY3RUb1NlcnZlclNvY2tldChmaWxlKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLmNvbm5lY3RUb1NlcnZlclNvY2tldCA9IGZ1bmN0aW9uIGNvbm5lY3RUb1NlcnZlclNvY2tldChmaWxlKSB7XG4gICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHRva2VuID0gZmlsZS5zZXJ2ZXJUb2tlbjtcbiAgICAgIHZhciBob3N0ID0gZ2V0U29ja2V0SG9zdChmaWxlLnJlbW90ZS5zZXJ2ZXJVcmwpO1xuICAgICAgdmFyIHNvY2tldCA9IG5ldyBTb2NrZXQoeyB0YXJnZXQ6IGhvc3QgKyAnL2FwaS8nICsgdG9rZW4gfSk7XG4gICAgICBfdGhpczQudXBsb2FkZXJTb2NrZXRzW2ZpbGUuaWRdID0gc29ja2V0O1xuICAgICAgX3RoaXM0LnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gY3JlYXRlRXZlbnRUcmFja2VyKF90aGlzNC51cHB5KTtcblxuICAgICAgX3RoaXM0Lm9uRmlsZVJlbW92ZShmaWxlLmlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KTtcbiAgICAgICAgcmVzb2x2ZSgndXBsb2FkICcgKyBmaWxlLmlkICsgJyB3YXMgcmVtb3ZlZCcpO1xuICAgICAgfSk7XG5cbiAgICAgIF90aGlzNC5vblBhdXNlKGZpbGUuaWQsIGZ1bmN0aW9uIChpc1BhdXNlZCkge1xuICAgICAgICBpc1BhdXNlZCA/IHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KSA6IHNvY2tldC5zZW5kKCdyZXN1bWUnLCB7fSk7XG4gICAgICB9KTtcblxuICAgICAgX3RoaXM0Lm9uUGF1c2VBbGwoZmlsZS5pZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc29ja2V0LnNlbmQoJ3BhdXNlJywge30pO1xuICAgICAgfSk7XG5cbiAgICAgIF90aGlzNC5vbkNhbmNlbEFsbChmaWxlLmlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSk7XG4gICAgICB9KTtcblxuICAgICAgX3RoaXM0Lm9uUmVzdW1lQWxsKGZpbGUuaWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSk7XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KTtcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpczQub25SZXRyeShmaWxlLmlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KTtcbiAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KTtcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpczQub25SZXRyeUFsbChmaWxlLmlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KTtcbiAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZmlsZS5pc1BhdXNlZCkge1xuICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSk7XG4gICAgICB9XG5cbiAgICAgIHNvY2tldC5vbigncHJvZ3Jlc3MnLCBmdW5jdGlvbiAocHJvZ3Jlc3NEYXRhKSB7XG4gICAgICAgIHJldHVybiBlbWl0U29ja2V0UHJvZ3Jlc3MoX3RoaXM0LCBwcm9ncmVzc0RhdGEsIGZpbGUpO1xuICAgICAgfSk7XG5cbiAgICAgIHNvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyRGF0YSkge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGVyckRhdGEuZXJyb3IubWVzc2FnZTtcblxuICAgICAgICB2YXIgZXJyb3IgPSBfZXh0ZW5kcyhuZXcgRXJyb3IobWVzc2FnZSksIHsgY2F1c2U6IGVyckRhdGEuZXJyb3IgfSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHJlbW90ZSByZXRyeSBvcHRpbWlzYXRpb24gc2hvdWxkIG5vdCBiZSB1c2VkLFxuICAgICAgICAvLyBjbG9zZSB0aGUgc29ja2V04oCUdGhpcyB3aWxsIHRlbGwgdXBweS1zZXJ2ZXIgdG8gY2xlYXIgc3RhdGUgYW5kIGRlbGV0ZSB0aGUgZmlsZS5cbiAgICAgICAgaWYgKCFfdGhpczQub3B0cy51c2VGYXN0UmVtb3RlUmV0cnkpIHtcbiAgICAgICAgICBfdGhpczQucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCk7XG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZXJ2ZXJUb2tlbiBzbyB0aGF0IGEgbmV3IG9uZSB3aWxsIGJlIGNyZWF0ZWQgZm9yIHRoZSByZXRyeS5cbiAgICAgICAgICBfdGhpczQudXBweS5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICAgICAgc2VydmVyVG9rZW46IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNC51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgICBzb2NrZXQub24oJ3N1Y2Nlc3MnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBfdGhpczQudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIGRhdGEsIGRhdGEudXJsKTtcbiAgICAgICAgX3RoaXM0LnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLm9uUmVjZWl2ZVVwbG9hZFVybCA9IGZ1bmN0aW9uIG9uUmVjZWl2ZVVwbG9hZFVybChmaWxlLCB1cGxvYWRVUkwpIHtcbiAgICB2YXIgY3VycmVudEZpbGUgPSB0aGlzLnVwcHkuZ2V0RmlsZShmaWxlLmlkKTtcbiAgICBpZiAoIWN1cnJlbnRGaWxlKSByZXR1cm47XG4gICAgLy8gT25seSBkbyB0aGUgdXBkYXRlIGlmIHdlIGRpZG4ndCBoYXZlIGFuIHVwbG9hZCBVUkwgeWV0LFxuICAgIC8vIG9yIHJlc3VtZTogZmFsc2UgaW4gb3B0aW9uc1xuICAgIGlmICgoIWN1cnJlbnRGaWxlLnR1cyB8fCBjdXJyZW50RmlsZS50dXMudXBsb2FkVXJsICE9PSB1cGxvYWRVUkwpICYmIHRoaXMub3B0cy5yZXN1bWUpIHtcbiAgICAgIHRoaXMudXBweS5sb2coJ1tUdXNdIFN0b3JpbmcgdXBsb2FkIHVybCcpO1xuICAgICAgdGhpcy51cHB5LnNldEZpbGVTdGF0ZShjdXJyZW50RmlsZS5pZCwge1xuICAgICAgICB0dXM6IF9leHRlbmRzKHt9LCBjdXJyZW50RmlsZS50dXMsIHtcbiAgICAgICAgICB1cGxvYWRVcmw6IHVwbG9hZFVSTFxuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIFR1cy5wcm90b3R5cGUub25GaWxlUmVtb3ZlID0gZnVuY3Rpb24gb25GaWxlUmVtb3ZlKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2ZpbGUtcmVtb3ZlZCcsIGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBpZiAoZmlsZUlEID09PSBmaWxlLmlkKSBjYihmaWxlLmlkKTtcbiAgICB9KTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLm9uUGF1c2UgPSBmdW5jdGlvbiBvblBhdXNlKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ3VwbG9hZC1wYXVzZScsIGZ1bmN0aW9uICh0YXJnZXRGaWxlSUQsIGlzUGF1c2VkKSB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgLy8gY29uc3QgaXNQYXVzZWQgPSB0aGlzLnVwcHkucGF1c2VSZXN1bWUoZmlsZUlEKVxuICAgICAgICBjYihpc1BhdXNlZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgVHVzLnByb3RvdHlwZS5vblJldHJ5ID0gZnVuY3Rpb24gb25SZXRyeShmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCd1cGxvYWQtcmV0cnknLCBmdW5jdGlvbiAodGFyZ2V0RmlsZUlEKSB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLm9uUmV0cnlBbGwgPSBmdW5jdGlvbiBvblJldHJ5QWxsKGZpbGVJRCwgY2IpIHtcbiAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncmV0cnktYWxsJywgZnVuY3Rpb24gKGZpbGVzVG9SZXRyeSkge1xuICAgICAgaWYgKCFfdGhpczUudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVybjtcbiAgICAgIGNiKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgVHVzLnByb3RvdHlwZS5vblBhdXNlQWxsID0gZnVuY3Rpb24gb25QYXVzZUFsbChmaWxlSUQsIGNiKSB7XG4gICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ3BhdXNlLWFsbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghX3RoaXM2LnVwcHkuZ2V0RmlsZShmaWxlSUQpKSByZXR1cm47XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9O1xuXG4gIFR1cy5wcm90b3R5cGUub25DYW5jZWxBbGwgPSBmdW5jdGlvbiBvbkNhbmNlbEFsbChmaWxlSUQsIGNiKSB7XG4gICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2NhbmNlbC1hbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIV90aGlzNy51cHB5LmdldEZpbGUoZmlsZUlEKSkgcmV0dXJuO1xuICAgICAgY2IoKTtcbiAgICB9KTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLm9uUmVzdW1lQWxsID0gZnVuY3Rpb24gb25SZXN1bWVBbGwoZmlsZUlELCBjYikge1xuICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCdyZXN1bWUtYWxsJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFfdGhpczgudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVybjtcbiAgICAgIGNiKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgVHVzLnByb3RvdHlwZS51cGxvYWRGaWxlcyA9IGZ1bmN0aW9uIHVwbG9hZEZpbGVzKGZpbGVzKSB7XG4gICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICB2YXIgYWN0aW9ucyA9IGZpbGVzLm1hcChmdW5jdGlvbiAoZmlsZSwgaSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBwYXJzZUludChpLCAxMCkgKyAxO1xuICAgICAgdmFyIHRvdGFsID0gZmlsZXMubGVuZ3RoO1xuXG4gICAgICBpZiAoZmlsZS5lcnJvcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZmlsZS5lcnJvcikpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChmaWxlLmlzUmVtb3RlKSB7XG4gICAgICAgIC8vIFdlIGVtaXQgdXBsb2FkLXN0YXJ0ZWQgaGVyZSwgc28gdGhhdCBpdCdzIGFsc28gZW1pdHRlZCBmb3IgZmlsZXNcbiAgICAgICAgLy8gdGhhdCBoYXZlIHRvIHdhaXQgZHVlIHRvIHRoZSBgbGltaXRgIG9wdGlvbi5cbiAgICAgICAgX3RoaXM5LnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzOS51cGxvYWRSZW1vdGUuYmluZChfdGhpczksIGZpbGUsIGN1cnJlbnQsIHRvdGFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzOS51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSk7XG4gICAgICAgIHJldHVybiBfdGhpczkudXBsb2FkLmJpbmQoX3RoaXM5LCBmaWxlLCBjdXJyZW50LCB0b3RhbCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgcHJvbWlzZXMgPSBhY3Rpb25zLm1hcChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICB2YXIgbGltaXRlZEFjdGlvbiA9IF90aGlzOS5saW1pdFVwbG9hZHMoYWN0aW9uKTtcbiAgICAgIHJldHVybiBsaW1pdGVkQWN0aW9uKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2V0dGxlKHByb21pc2VzKTtcbiAgfTtcblxuICBUdXMucHJvdG90eXBlLmhhbmRsZVVwbG9hZCA9IGZ1bmN0aW9uIGhhbmRsZVVwbG9hZChmaWxlSURzKSB7XG4gICAgdmFyIF90aGlzMTAgPSB0aGlzO1xuXG4gICAgaWYgKGZpbGVJRHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKCdUdXM6IG5vIGZpbGVzIHRvIHVwbG9hZCEnKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkubG9nKCdUdXMgaXMgdXBsb2FkaW5nLi4uJyk7XG4gICAgdmFyIGZpbGVzVG9VcGxvYWQgPSBmaWxlSURzLm1hcChmdW5jdGlvbiAoZmlsZUlEKSB7XG4gICAgICByZXR1cm4gX3RoaXMxMC51cHB5LmdldEZpbGUoZmlsZUlEKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzVG9VcGxvYWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG4gIH07XG5cbiAgVHVzLnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgY2FwYWJpbGl0aWVzOiBfZXh0ZW5kcyh7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLCB7XG4gICAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IHRydWVcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgdGhpcy51cHB5LmFkZFVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKTtcblxuICAgIHRoaXMudXBweS5vbigncmVzZXQtcHJvZ3Jlc3MnLCB0aGlzLmhhbmRsZVJlc2V0UHJvZ3Jlc3MpO1xuXG4gICAgaWYgKHRoaXMub3B0cy5hdXRvUmV0cnkpIHtcbiAgICAgIHRoaXMudXBweS5vbignYmFjay1vbmxpbmUnLCB0aGlzLnVwcHkucmV0cnlBbGwpO1xuICAgIH1cbiAgfTtcblxuICBUdXMucHJvdG90eXBlLnVuaW5zdGFsbCA9IGZ1bmN0aW9uIHVuaW5zdGFsbCgpIHtcbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgY2FwYWJpbGl0aWVzOiBfZXh0ZW5kcyh7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLCB7XG4gICAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IGZhbHNlXG4gICAgICB9KVxuICAgIH0pO1xuICAgIHRoaXMudXBweS5yZW1vdmVVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZCk7XG5cbiAgICBpZiAodGhpcy5vcHRzLmF1dG9SZXRyeSkge1xuICAgICAgdGhpcy51cHB5Lm9mZignYmFjay1vbmxpbmUnLCB0aGlzLnVwcHkucmV0cnlBbGwpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gVHVzO1xufShQbHVnaW4pOyIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qKlxuICogVHJhbnNsYXRlcyBzdHJpbmdzIHdpdGggaW50ZXJwb2xhdGlvbiAmIHBsdXJhbGl6YXRpb24gc3VwcG9ydC5cbiAqIEV4dGVuc2libGUgd2l0aCBjdXN0b20gZGljdGlvbmFyaWVzIGFuZCBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBCb3Jyb3dzIGhlYXZpbHkgZnJvbSBhbmQgaW5zcGlyZWQgYnkgUG9seWdsb3QgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcyxcbiAqIGJhc2ljYWxseSBhIHN0cmlwcGVkLWRvd24gdmVyc2lvbiBvZiBpdC4gRGlmZmVyZW5jZXM6IHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zIGFyZSBub3QgaGFyZGNvZGVkXG4gKiBhbmQgY2FuIGJlIGVhc2lseSBhZGRlZCBhbW9uZyB3aXRoIGRpY3Rpb25hcmllcywgbmVzdGVkIG9iamVjdHMgYXJlIHVzZWQgZm9yIHBsdXJhbGl6YXRpb25cbiAqIGFzIG9wcG9zZWQgdG8gYHx8fHxgIGRlbGltZXRlclxuICpcbiAqIFVzYWdlIGV4YW1wbGU6IGB0cmFuc2xhdG9yLnRyYW5zbGF0ZSgnZmlsZXNfY2hvc2VuJywge3NtYXJ0X2NvdW50OiAzfSlgXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFRyYW5zbGF0b3Iob3B0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2xhdG9yKTtcblxuICAgIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGxvY2FsZToge1xuICAgICAgICBzdHJpbmdzOiB7fSxcbiAgICAgICAgcGx1cmFsaXplOiBmdW5jdGlvbiBwbHVyYWxpemUobikge1xuICAgICAgICAgIGlmIChuID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5vcHRzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKTtcbiAgICB0aGlzLmxvY2FsZSA9IF9leHRlbmRzKHt9LCBkZWZhdWx0T3B0aW9ucy5sb2NhbGUsIG9wdHMubG9jYWxlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHN0cmluZyB3aXRoIHBsYWNlaG9sZGVyIHZhcmlhYmxlcyBsaWtlIGAle3NtYXJ0X2NvdW50fSBmaWxlIHNlbGVjdGVkYFxuICAgKiBhbmQgcmVwbGFjZXMgaXQgd2l0aCB2YWx1ZXMgZnJvbSBvcHRpb25zIGB7c21hcnRfY291bnQ6IDV9YFxuICAgKlxuICAgKiBAbGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAgICogdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL2xpYi9wb2x5Z2xvdC5qcyNMMjk5XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgdGhhdCBuZWVkcyBpbnRlcnBvbGF0aW9uLCB3aXRoIHBsYWNlaG9sZGVyc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGludGVycG9sYXRlZFxuICAgKi9cblxuXG4gIFRyYW5zbGF0b3IucHJvdG90eXBlLmludGVycG9sYXRlID0gZnVuY3Rpb24gaW50ZXJwb2xhdGUocGhyYXNlLCBvcHRpb25zKSB7XG4gICAgdmFyIF9TdHJpbmckcHJvdG90eXBlID0gU3RyaW5nLnByb3RvdHlwZSxcbiAgICAgICAgc3BsaXQgPSBfU3RyaW5nJHByb3RvdHlwZS5zcGxpdCxcbiAgICAgICAgcmVwbGFjZSA9IF9TdHJpbmckcHJvdG90eXBlLnJlcGxhY2U7XG5cbiAgICB2YXIgZG9sbGFyUmVnZXggPSAvXFwkL2c7XG4gICAgdmFyIGRvbGxhckJpbGxzWWFsbCA9ICckJCQkJztcbiAgICB2YXIgaW50ZXJwb2xhdGVkID0gW3BocmFzZV07XG5cbiAgICBmb3IgKHZhciBhcmcgaW4gb3B0aW9ucykge1xuICAgICAgaWYgKGFyZyAhPT0gJ18nICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoYXJnKSkge1xuICAgICAgICAvLyBFbnN1cmUgcmVwbGFjZW1lbnQgdmFsdWUgaXMgZXNjYXBlZCB0byBwcmV2ZW50IHNwZWNpYWwgJC1wcmVmaXhlZFxuICAgICAgICAvLyByZWdleCByZXBsYWNlIHRva2Vucy4gdGhlIFwiJCQkJFwiIGlzIG5lZWRlZCBiZWNhdXNlIGVhY2ggXCIkXCIgbmVlZHMgdG9cbiAgICAgICAgLy8gYmUgZXNjYXBlZCB3aXRoIFwiJFwiIGl0c2VsZiwgYW5kIHdlIG5lZWQgdHdvIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0LlxuICAgICAgICB2YXIgcmVwbGFjZW1lbnQgPSBvcHRpb25zW2FyZ107XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVwbGFjZW1lbnQgPSByZXBsYWNlLmNhbGwob3B0aW9uc1thcmddLCBkb2xsYXJSZWdleCwgZG9sbGFyQmlsbHNZYWxsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgYFJlZ0V4cGAgZWFjaCB0aW1lIGluc3RlYWQgb2YgdXNpbmcgYSBtb3JlLWVmZmljaWVudFxuICAgICAgICAvLyBzdHJpbmcgcmVwbGFjZSBzbyB0aGF0IHRoZSBzYW1lIGFyZ3VtZW50IGNhbiBiZSByZXBsYWNlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAvLyBpbiB0aGUgc2FtZSBwaHJhc2UuXG4gICAgICAgIGludGVycG9sYXRlZCA9IGluc2VydFJlcGxhY2VtZW50KGludGVycG9sYXRlZCwgbmV3IFJlZ0V4cCgnJVxcXFx7JyArIGFyZyArICdcXFxcfScsICdnJyksIHJlcGxhY2VtZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJwb2xhdGVkO1xuXG4gICAgZnVuY3Rpb24gaW5zZXJ0UmVwbGFjZW1lbnQoc291cmNlLCByeCwgcmVwbGFjZW1lbnQpIHtcbiAgICAgIHZhciBuZXdQYXJ0cyA9IFtdO1xuICAgICAgc291cmNlLmZvckVhY2goZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgIHNwbGl0LmNhbGwoY2h1bmssIHJ4KS5mb3JFYWNoKGZ1bmN0aW9uIChyYXcsIGksIGxpc3QpIHtcbiAgICAgICAgICBpZiAocmF3ICE9PSAnJykge1xuICAgICAgICAgICAgbmV3UGFydHMucHVzaChyYXcpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEludGVybGFjZSB3aXRoIHRoZSBgcmVwbGFjZW1lbnRgIHZhbHVlXG4gICAgICAgICAgaWYgKGkgPCBsaXN0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gocmVwbGFjZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXdQYXJ0cztcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1YmxpYyB0cmFuc2xhdGUgbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgbGF0ZXIgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gc3RyaW5nXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdHJhbnNsYXRlZCAoYW5kIGludGVycG9sYXRlZClcbiAgICovXG5cblxuICBUcmFuc2xhdG9yLnByb3RvdHlwZS50cmFuc2xhdGUgPSBmdW5jdGlvbiB0cmFuc2xhdGUoa2V5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlQXJyYXkoa2V5LCBvcHRpb25zKS5qb2luKCcnKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IGEgdHJhbnNsYXRpb24gYW5kIHJldHVybiB0aGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzIGFzIGFuIGFycmF5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gICAqIEByZXR1cm4ge0FycmF5fSBUaGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzLCBpbiBvcmRlci5cbiAgICovXG5cblxuICBUcmFuc2xhdG9yLnByb3RvdHlwZS50cmFuc2xhdGVBcnJheSA9IGZ1bmN0aW9uIHRyYW5zbGF0ZUFycmF5KGtleSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnNtYXJ0X2NvdW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHBsdXJhbCA9IHRoaXMubG9jYWxlLnBsdXJhbGl6ZShvcHRpb25zLnNtYXJ0X2NvdW50KTtcbiAgICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMub3B0cy5sb2NhbGUuc3RyaW5nc1trZXldW3BsdXJhbF0sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMub3B0cy5sb2NhbGUuc3RyaW5nc1trZXldLCBvcHRpb25zKTtcbiAgfTtcblxuICByZXR1cm4gVHJhbnNsYXRvcjtcbn0oKTsiLCJ2YXIgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKTtcblxuZnVuY3Rpb24gX2VtaXRTb2NrZXRQcm9ncmVzcyh1cGxvYWRlciwgcHJvZ3Jlc3NEYXRhLCBmaWxlKSB7XG4gIHZhciBwcm9ncmVzcyA9IHByb2dyZXNzRGF0YS5wcm9ncmVzcyxcbiAgICAgIGJ5dGVzVXBsb2FkZWQgPSBwcm9ncmVzc0RhdGEuYnl0ZXNVcGxvYWRlZCxcbiAgICAgIGJ5dGVzVG90YWwgPSBwcm9ncmVzc0RhdGEuYnl0ZXNUb3RhbDtcblxuICBpZiAocHJvZ3Jlc3MpIHtcbiAgICB1cGxvYWRlci51cHB5LmxvZygnVXBsb2FkIHByb2dyZXNzOiAnICsgcHJvZ3Jlc3MpO1xuICAgIHVwbG9hZGVyLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgdXBsb2FkZXI6IHVwbG9hZGVyLFxuICAgICAgYnl0ZXNVcGxvYWRlZDogYnl0ZXNVcGxvYWRlZCxcbiAgICAgIGJ5dGVzVG90YWw6IGJ5dGVzVG90YWxcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlKF9lbWl0U29ja2V0UHJvZ3Jlc3MsIDMwMCwgeyBsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZSB9KTsiLCJ2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBpc0RPTUVsZW1lbnQgPSByZXF1aXJlKCcuL2lzRE9NRWxlbWVudCcpO1xuXG4vKipcbiAqIEZpbmQgYSBET00gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBlbGVtZW50XG4gKiBAcmV0dXJuIHtOb2RlfG51bGx9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmluZERPTUVsZW1lbnQoZWxlbWVudCkge1xuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XG4gIH1cblxuICBpZiAoKHR5cGVvZiBlbGVtZW50ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihlbGVtZW50KSkgPT09ICdvYmplY3QnICYmIGlzRE9NRWxlbWVudChlbGVtZW50KSkge1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG59OyIsIi8qKlxuICogVGFrZXMgYSBmaWxlIG9iamVjdCBhbmQgdHVybnMgaXQgaW50byBmaWxlSUQsIGJ5IGNvbnZlcnRpbmcgZmlsZS5uYW1lIHRvIGxvd2VyY2FzZSxcbiAqIHJlbW92aW5nIGV4dHJhIGNoYXJhY3RlcnMgYW5kIGFkZGluZyB0eXBlLCBzaXplIGFuZCBsYXN0TW9kaWZpZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZmlsZVxuICogQHJldHVybiB7U3RyaW5nfSB0aGUgZmlsZUlEXG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdlbmVyYXRlRmlsZUlEKGZpbGUpIHtcbiAgLy8gZmlsdGVyIGlzIG5lZWRlZCB0byBub3Qgam9pbiBlbXB0eSB2YWx1ZXMgd2l0aCBgLWBcbiAgcmV0dXJuIFsndXBweScsIGZpbGUubmFtZSA/IGZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teQS1aMC05XS9pZywgJycpIDogJycsIGZpbGUudHlwZSwgZmlsZS5kYXRhLnNpemUsIGZpbGUuZGF0YS5sYXN0TW9kaWZpZWRdLmZpbHRlcihmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfSkuam9pbignLScpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEJ5dGVzUmVtYWluaW5nKGZpbGVQcm9ncmVzcykge1xuICByZXR1cm4gZmlsZVByb2dyZXNzLmJ5dGVzVG90YWwgLSBmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZDtcbn07IiwiLyoqXG4qIFRha2VzIGEgZnVsbCBmaWxlbmFtZSBzdHJpbmcgYW5kIHJldHVybnMgYW4gb2JqZWN0IHtuYW1lLCBleHRlbnNpb259XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBmdWxsRmlsZU5hbWVcbiogQHJldHVybiB7b2JqZWN0fSB7bmFtZSwgZXh0ZW5zaW9ufVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZnVsbEZpbGVOYW1lKSB7XG4gIHZhciByZSA9IC8oPzpcXC4oW14uXSspKT8kLztcbiAgdmFyIGZpbGVFeHQgPSByZS5leGVjKGZ1bGxGaWxlTmFtZSlbMV07XG4gIHZhciBmaWxlTmFtZSA9IGZ1bGxGaWxlTmFtZS5yZXBsYWNlKCcuJyArIGZpbGVFeHQsICcnKTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICBleHRlbnNpb246IGZpbGVFeHRcbiAgfTtcbn07IiwidmFyIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpO1xudmFyIG1pbWVUeXBlcyA9IHJlcXVpcmUoJy4vbWltZVR5cGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZVR5cGUoZmlsZSkge1xuICB2YXIgZmlsZUV4dGVuc2lvbiA9IGZpbGUubmFtZSA/IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uKGZpbGUubmFtZSkuZXh0ZW5zaW9uIDogbnVsbDtcblxuICBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgIC8vIHNvbWUgcmVtb3RlIHByb3ZpZGVycyBkbyBub3Qgc3VwcG9ydCBmaWxlIHR5cGVzXG4gICAgcmV0dXJuIGZpbGUudHlwZSA/IGZpbGUudHlwZSA6IG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG1pbWUgdHlwZSBpcyBzZXQgaW4gdGhlIGZpbGUgb2JqZWN0XG4gIGlmIChmaWxlLnR5cGUpIHtcbiAgICByZXR1cm4gZmlsZS50eXBlO1xuICB9XG5cbiAgLy8gc2VlIGlmIHdlIGNhbiBtYXAgZXh0ZW5zaW9uIHRvIGEgbWltZSB0eXBlXG4gIGlmIChmaWxlRXh0ZW5zaW9uICYmIG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXSkge1xuICAgIHJldHVybiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl07XG4gIH1cblxuICAvLyBpZiBhbGwgZmFpbHMsIHdlbGwsIHJldHVybiBlbXB0eVxuICByZXR1cm4gbnVsbDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTb2NrZXRIb3N0KHVybCkge1xuICAvLyBnZXQgdGhlIGhvc3QgZG9tYWluXG4gIHZhciByZWdleCA9IC9eKD86aHR0cHM/OlxcL1xcL3xcXC9cXC8pPyg/OlteQFxcbl0rQCk/KD86d3d3XFwuKT8oW15cXG5dKykvO1xuICB2YXIgaG9zdCA9IHJlZ2V4LmV4ZWModXJsKVsxXTtcbiAgdmFyIHNvY2tldFByb3RvY29sID0gbG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonID8gJ3dzcycgOiAnd3MnO1xuXG4gIHJldHVybiBzb2NrZXRQcm90b2NvbCArICc6Ly8nICsgaG9zdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTcGVlZChmaWxlUHJvZ3Jlc3MpIHtcbiAgaWYgKCFmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCkgcmV0dXJuIDA7XG5cbiAgdmFyIHRpbWVFbGFwc2VkID0gbmV3IERhdGUoKSAtIGZpbGVQcm9ncmVzcy51cGxvYWRTdGFydGVkO1xuICB2YXIgdXBsb2FkU3BlZWQgPSBmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCAvICh0aW1lRWxhcHNlZCAvIDEwMDApO1xuICByZXR1cm4gdXBsb2FkU3BlZWQ7XG59OyIsIi8qKlxuICogUmV0dXJucyBhIHRpbWVzdGFtcCBpbiB0aGUgZm9ybWF0IG9mIGBob3VyczptaW51dGVzOnNlY29uZHNgXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRUaW1lU3RhbXAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgdmFyIGhvdXJzID0gcGFkKGRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygpKTtcbiAgdmFyIG1pbnV0ZXMgPSBwYWQoZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKSk7XG4gIHZhciBzZWNvbmRzID0gcGFkKGRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCkpO1xuICByZXR1cm4gaG91cnMgKyAnOicgKyBtaW51dGVzICsgJzonICsgc2Vjb25kcztcbn07XG5cbi8qKlxuICogQWRkcyB6ZXJvIHRvIHN0cmluZ3Mgc2hvcnRlciB0aGFuIHR3byBjaGFyYWN0ZXJzXG4qL1xuZnVuY3Rpb24gcGFkKHN0cikge1xuICByZXR1cm4gc3RyLmxlbmd0aCAhPT0gMiA/IDAgKyBzdHIgOiBzdHI7XG59IiwidmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhIERPTSBlbGVtZW50LiBEdWNrLXR5cGluZyBiYXNlZCBvbiBgbm9kZVR5cGVgLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNET01FbGVtZW50KG9iaikge1xuICByZXR1cm4gb2JqICYmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvYmopKSA9PT0gJ29iamVjdCcgJiYgb2JqLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbn07IiwiLyoqXG4gKiBDaGVjayBpZiBhIFVSTCBzdHJpbmcgaXMgYW4gb2JqZWN0IFVSTCBmcm9tIGBVUkwuY3JlYXRlT2JqZWN0VVJMYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzT2JqZWN0VVJMKHVybCkge1xuICByZXR1cm4gdXJsLmluZGV4T2YoJ2Jsb2I6JykgPT09IDA7XG59OyIsIi8qKlxuICogTGltaXQgdGhlIGFtb3VudCBvZiBzaW11bHRhbmVvdXNseSBwZW5kaW5nIFByb21pc2VzLlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gcGFzc2VkIGEgZnVuY3Rpb24gYGZuYCxcbiAqIHdpbGwgbWFrZSBzdXJlIHRoYXQgYXQgbW9zdCBgbGltaXRgIGNhbGxzIHRvIGBmbmAgYXJlIHBlbmRpbmcuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0XG4gKiBAcmV0dXJuIHtmdW5jdGlvbigpfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxpbWl0UHJvbWlzZXMobGltaXQpIHtcbiAgdmFyIHBlbmRpbmcgPSAwO1xuICB2YXIgcXVldWUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2FsbCA9IGZ1bmN0aW9uIGNhbGwoKSB7XG4gICAgICAgIHBlbmRpbmcrKztcbiAgICAgICAgdmFyIHByb21pc2UgPSBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgICAgICBwcm9taXNlLnRoZW4ob25maW5pc2gsIG9uZmluaXNoKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICBpZiAocGVuZGluZyA+PSBsaW1pdCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHF1ZXVlLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbCgpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2FsbCgpO1xuICAgIH07XG4gIH07XG4gIGZ1bmN0aW9uIG9uZmluaXNoKCkge1xuICAgIHBlbmRpbmctLTtcbiAgICB2YXIgbmV4dCA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgaWYgKG5leHQpIG5leHQoKTtcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ21kJzogJ3RleHQvbWFya2Rvd24nLFxuICAnbWFya2Rvd24nOiAndGV4dC9tYXJrZG93bicsXG4gICdtcDQnOiAndmlkZW8vbXA0JyxcbiAgJ21wMyc6ICdhdWRpby9tcDMnLFxuICAnc3ZnJzogJ2ltYWdlL3N2Zyt4bWwnLFxuICAnanBnJzogJ2ltYWdlL2pwZWcnLFxuICAncG5nJzogJ2ltYWdlL3BuZycsXG4gICdnaWYnOiAnaW1hZ2UvZ2lmJyxcbiAgJ3lhbWwnOiAndGV4dC95YW1sJyxcbiAgJ3ltbCc6ICd0ZXh0L3lhbWwnLFxuICAnY3N2JzogJ3RleHQvY3N2JyxcbiAgJ2F2aSc6ICd2aWRlby94LW1zdmlkZW8nLFxuICAnbWtzJzogJ3ZpZGVvL3gtbWF0cm9za2EnLFxuICAnbWt2JzogJ3ZpZGVvL3gtbWF0cm9za2EnLFxuICAnbW92JzogJ3ZpZGVvL3F1aWNrdGltZScsXG4gICdkb2MnOiAnYXBwbGljYXRpb24vbXN3b3JkJyxcbiAgJ2RvY20nOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQuZG9jdW1lbnQubWFjcm9lbmFibGVkLjEyJyxcbiAgJ2RvY3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICAnZG90JzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gICdkb3RtJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMicsXG4gICdkb3R4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlJyxcbiAgJ3hsYSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxhbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsYyc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxmJzogJ2FwcGxpY2F0aW9uL3gteGxpZmYreG1sJyxcbiAgJ3hsbSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGxzJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gICd4bHNiJzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsc20nOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0Lm1hY3JvZW5hYmxlZC4xMicsXG4gICd4bHN4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JyxcbiAgJ3hsdCc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICAneGx0bSc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgJ3hsdHgnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGUnLFxuICAneGx3JzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCdcbn07IiwidmFyIHNlY29uZHNUb1RpbWUgPSByZXF1aXJlKCcuL3NlY29uZHNUb1RpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcmV0dHlFVEEoc2Vjb25kcykge1xuICB2YXIgdGltZSA9IHNlY29uZHNUb1RpbWUoc2Vjb25kcyk7XG5cbiAgLy8gT25seSBkaXNwbGF5IGhvdXJzIGFuZCBtaW51dGVzIGlmIHRoZXkgYXJlIGdyZWF0ZXIgdGhhbiAwIGJ1dCBhbHdheXNcbiAgLy8gZGlzcGxheSBtaW51dGVzIGlmIGhvdXJzIGlzIGJlaW5nIGRpc3BsYXllZFxuICAvLyBEaXNwbGF5IGEgbGVhZGluZyB6ZXJvIGlmIHRoZSB0aGVyZSBpcyBhIHByZWNlZGluZyB1bml0OiAxbSAwNXMsIGJ1dCA1c1xuICB2YXIgaG91cnNTdHIgPSB0aW1lLmhvdXJzID8gdGltZS5ob3VycyArICdoICcgOiAnJztcbiAgdmFyIG1pbnV0ZXNWYWwgPSB0aW1lLmhvdXJzID8gKCcwJyArIHRpbWUubWludXRlcykuc3Vic3RyKC0yKSA6IHRpbWUubWludXRlcztcbiAgdmFyIG1pbnV0ZXNTdHIgPSBtaW51dGVzVmFsID8gbWludXRlc1ZhbCArICdtICcgOiAnJztcbiAgdmFyIHNlY29uZHNWYWwgPSBtaW51dGVzVmFsID8gKCcwJyArIHRpbWUuc2Vjb25kcykuc3Vic3RyKC0yKSA6IHRpbWUuc2Vjb25kcztcbiAgdmFyIHNlY29uZHNTdHIgPSBzZWNvbmRzVmFsICsgJ3MnO1xuXG4gIHJldHVybiAnJyArIGhvdXJzU3RyICsgbWludXRlc1N0ciArIHNlY29uZHNTdHI7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2Vjb25kc1RvVGltZShyYXdTZWNvbmRzKSB7XG4gIHZhciBob3VycyA9IE1hdGguZmxvb3IocmF3U2Vjb25kcyAvIDM2MDApICUgMjQ7XG4gIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzIC8gNjApICUgNjA7XG4gIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzICUgNjApO1xuXG4gIHJldHVybiB7IGhvdXJzOiBob3VycywgbWludXRlczogbWludXRlcywgc2Vjb25kczogc2Vjb25kcyB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShwcm9taXNlcykge1xuICB2YXIgcmVzb2x1dGlvbnMgPSBbXTtcbiAgdmFyIHJlamVjdGlvbnMgPSBbXTtcbiAgZnVuY3Rpb24gcmVzb2x2ZWQodmFsdWUpIHtcbiAgICByZXNvbHV0aW9ucy5wdXNoKHZhbHVlKTtcbiAgfVxuICBmdW5jdGlvbiByZWplY3RlZChlcnJvcikge1xuICAgIHJlamVjdGlvbnMucHVzaChlcnJvcik7XG4gIH1cblxuICB2YXIgd2FpdCA9IFByb21pc2UuYWxsKHByb21pc2VzLm1hcChmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVzb2x2ZWQsIHJlamVjdGVkKTtcbiAgfSkpO1xuXG4gIHJldHVybiB3YWl0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzZnVsOiByZXNvbHV0aW9ucyxcbiAgICAgIGZhaWxlZDogcmVqZWN0aW9uc1xuICAgIH07XG4gIH0pO1xufTsiLCIvKipcbiAqIENvbnZlcnRzIGxpc3QgaW50byBhcnJheVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9BcnJheShsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKTtcbn07IiwiY29uc3QgVXBweSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgRmlsZUlucHV0ID0gcmVxdWlyZSgnQHVwcHkvZmlsZS1pbnB1dCcpXG5jb25zdCBTdGF0dXNCYXIgPSByZXF1aXJlKCdAdXBweS9zdGF0dXMtYmFyJylcbmNvbnN0IFR1cyA9IHJlcXVpcmUoJ0B1cHB5L3R1cycpXG5cbmNvbnN0IHVwcHlPbmUgPSBuZXcgVXBweSh7ZGVidWc6IHRydWV9KVxudXBweU9uZVxuICAudXNlKEZpbGVJbnB1dCwgeyB0YXJnZXQ6ICcuVXBweUlucHV0JywgcHJldHR5OiBmYWxzZSB9KVxuICAudXNlKFR1cywgeyBlbmRwb2ludDogJy8vbWFzdGVyLnR1cy5pby9maWxlcy8nIH0pXG4gIC51c2UoU3RhdHVzQmFyLCB7IHRhcmdldDogJy5VcHB5SW5wdXQtUHJvZ3Jlc3MnLCBoaWRlVXBsb2FkQnV0dG9uOiB0cnVlIH0pXG4iXX0=
