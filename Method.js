/**
 * For defining method stubs that will be replaced with methods on demand.
 * @class Method
 */
Method = {

	/**
	 * Assign this in place of any asynchronous method
	 * that would have a callback and/or return a Promise.
	 * Then call Method.define() on the object containing these.
	 * @property {boolean} stub
	 */
	stub: {},

	/**
	 * Call this on any object that contains Method.stub
	 * in place of some asynchronous methods. It will set up code to load
	 * implementations of these methods on demand, from files found at URLs
	 * of the form {{prefix}}/{{methodName}}.js . In those files, you can
	 * write code such as the following, using constant objects:
	 * export function (Users, _private) { 
	 *   return function myCoolMethod(options, callback) {
	 *     return new Promise(...);
	 *   }
	 * };
	 * When the method is first called, it loads the implementation, and
	 * returns a promise that resolves to whatever the implementation returns.
	 * Subsequent calls to the method would simply invoke the implementation.
	 * @param {Object} o The object which contains some asynchronous methods
	 * @param {String} prefix The part of the URL before "/{{methodName}}.js".
	 *  For example something like "/MyObject/SubObject/methods"
	 * @param {Function} closure Optional, this function could reference some
	 *  constants in a closure, and return array of these constants, to be used
	 *  inside the method implementation in a separate file. The closure constants
	 *  can be objects, whose contents are dynamic, but the constants themselves
	 *  should never change between invocations of the method. 
	 */
	define: function (o, prefix, closure) {
		for (var k in o) {
			if (!o.hasOwnProperty(k) || o[k] !== Method.stub) {
				break;
			}
			// method stub is still there
			o[k] = function Method_shim () {
				var url = prefix + '/' + k + '.js';
				var t = this, a = arguments;
				return new Promise(function (resolve, reject) {
					return import(url).then(function (exported) {
						var method, args;
						if (exported) {
							args = closure ? closure() : [];
							var method = exported.apply(o, args);
							if (typeof method === 'function') {
								o[k] = method;
							}
						}
						if (o[k] === Method_shim) {
							throw ("Method.define: Must override method '" + k + "'");
						}
						return (method.apply(t, a)); // might throw and reject promise
					}); // might throw and reject promise
				});
			}
		}
		return o;
	}

};
