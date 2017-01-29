'use strict';

const TrPromisedReadline = require('./promisedreadline.js');
var r = new TrPromisedReadline();

(r.question('Hello. What is your name? ')
 .then(function(res) {
	 console.log("Hello " + res + ".");
	 return r.question('Is everything OK? ',
					   { caseSensitive: false,
						 allowedReplies: [[ 'yes', 'y', 'affirmative', 'positive' ],
										  [ 'no',
											'n',
											/^negative$/i,
											function(x) { return x.toLowerCase() === 'njet'; } ]] });
 })
 .then(function(res) {
	 if (res === 'no') {
		 throw 'Abort';
	 }
	 return Promise.all([r.question('Question 1: '),
						 r.question('Question 2: '),
						 r.question('Question 3: '),
						 r.question('Question 4: '),
						 r.question('Question 5: '),
						 r.question('Question 6: '),
						 r.question('Question 7: '),
						 r.question('Question 8: '),
						 r.question('Question 9: ')]);
 })
 .then(function(res) {
	 var i;
	 for (i = 0; i < res.length; i++) {
		 console.log((i+1).toFixed(0) + ': ' + res[i]);
	 }
	 r.close();
	 process.exit(0);
 })
 .catch(function(e) {
	 r.close();
	 console.log("Abort.");
	 process.exit(1);
 }));


