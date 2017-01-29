tr-promised-readline
====================

A Javascript wrapper on top of readline.

Examples
--------

```
const r = require('tr-promised-readline');

(r.question('What is your name? ')
 .then(function(res) {
   console.log('Hello ' + res + '. Nice to meet you.');
 })
 .catch(function(e) {
   console.log('Too bad :(');
   throw e;
 }));
```

And somewhat more elaborate use case.

```
const r = require('tr-promised-readline');

(Promise.all([r.question('Name: ', { failOnEmpty: true }),
              r.question('Your motto: '),
              r.question('Email address: ',
                         { allowedReplies: /^[a-z0-9_-]+@[a-z0-9_-]+(.[a-z0-9_-]+)*$/ }),
              r.question('Country code: ',
                         { allowedReplies: ['FI','EE','NL','GB','ES'], caseSensitive: false }),
              r.question('Default currency: ',
                         { allowedReplies: ['EUR','USD','GBP'], caseSensitive: false })])
 .then(function(res) {
     var name = res[0], motto = res[1], email = res[2], country = res[3], currency = res[4];
     // And so on ...
 })
 .catch(function(e) {
     throw e;
 })
```

License
-------

MIT
