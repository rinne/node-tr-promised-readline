'use strict';

const readline = require('readline');
const err = require('./err.js');

var PromisedReadline = function(config) {
	this.rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	this.pending = [];
	this.closed = false;
	this.active = false;
};

var complete = function(answer) {
	if (this.closed) {
		return;
	}
	var q = this.pending.shift();
	if (typeof(answer) === 'string') {
		if ((answer === '') && q.options.failOnEmpty) {
			q.reject(err('Empty answer'));
		} else if (q.options.allowedReplies === undefined) {
			q.resolve(answer);
		} else {
			var ans = undefined;
			q.options.allowedReplies.some(function(x) {
				if (typeof(x) === 'string') {
					if (q.options.caseSensitive) {
						if (x === answer) {
							ans = answer;
							return true;
						}
					} else {
						if (x.toLowerCase() === answer.toLowerCase()) {
							ans = x;
							return true;
						}
					}
				} else if ((typeof(x) === 'object') && (x instanceof RegExp)) {
					if (answer.match(x)) {
						ans = answer;
						return true;
					}
				} else if (typeof(x) === 'function') {
					var testResult = x(answer);
					if (testResult === true) {
						ans = answer;
						return true;
					} else if (typeof(testResult) === 'string') {
						ans = testResult;
						return true;
					}
				}
				return false;
			});
			if (ans !== undefined) {
				q.resolve(ans);
			} else if (q.options.failOnInvalidReply) {
				q.reject(err('Invalid answer'));
			} else {
				if (! q.retry) {
					q.retry = true;
					q.question = 'Invalid answer. ' + q.question;
				}
				this.pending.unshift(q);
			}
		}
	} else {
		console.log(typeof(answer));
		q.reject(err('Unable to read answer'));
	}
	if (this.pending.length > 0) {
		this.rl.question(this.pending[0].question, complete.bind(this));
	}
}

PromisedReadline.prototype.question = function(question, options) {
	var o = {
		allowedReplies: undefined,
		caseSensitive: true,
		failOnEmpty: false,
		failOnInvalidReply: false
	};
	if (options) {
		if (typeof(options) === 'object') {
			if (options.hasOwnProperty('allowedReplies')) {
				if (typeof(options.allowedReplies) === 'object') {
					if (Array.isArray(options.allowedReplies)) {
						o.allowedReplies = options.allowedReplies.filter(function(x) {
							return ((typeof(x) === 'string') ||
									(typeof(x) === 'function') ||
									((typeof(x) === 'object') &&
									 (x instanceof RegExp)));
						});
					} else if ((typeof (options.allowedReplies) === 'string') ||
							   (typeof (options.allowedReplies) === 'function') ||
							   ((typeof (options.allowedReplies) === 'object') &&
								(options.allowedReplies instanceof RegExp))) {
						o.allowedReplies = [ options.allowedReplies ];
					} else {
						return err('Invalid line reader options');
					}
				} else {
					return err('Invalid line reader options');
				}
			}
			if (options.hasOwnProperty('caseSensitive') &&
				(options.caseSensitive !== undefined)) {
				o.caseSensitive = options.caseSensitive ? true : false;
			}
			if (options.hasOwnProperty('failOnEmpty') &&
				(options.failOnEmpty !== undefined)) {
				o.failOnEmpty = options.failOnEmpty ? true : false;
			}
			if (options.hasOwnProperty('failOnInvalidReply') &&
				(options.failOnInvalidReply !== undefined)) {
				o.failOnInvalidReply = options.failOnInvalidReply ? true : false;
			}
		}
	}
	return new Promise(function(resolve, reject) {
		if (this.closed) {
			return err('Line reader closed');
		}
		this.pending.push({ question: question,
							resolve: resolve,
							reject: reject,
							options: o,
							retry: false });
		if (! this.active) {
			this.rl.question(this.pending[0].question, complete.bind(this));
		}
	}.bind(this));
}

PromisedReadline.prototype.close = function() {
	if (this.closed) {
		throw err('Line reader closed');
	}
	this.closed = true;
	this.rl.close();
	while (this.pending.length > 0) {
		this.pending.shift().reject(err('Line reader closed'));
	}
}

module.exports = PromisedReadline;
