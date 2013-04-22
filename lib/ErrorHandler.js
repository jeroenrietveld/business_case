var fs = require('fs');

exports = module.exports = function errorHandler(options) {
	options = options || {};

	var showStack = options.showStack,
		showMessage = options.showMessage,
		dumpExceptions = options.dumpExceptions,
		logErrors = options.logErrors,
		logErrorsStream = false;

	if (options.logErrors) {
		logErrorsStream = fs.createWriteStream(logErrors, {'flags': 'a', encoding: 'utf-8', mode: 0666});
	}

	return function errorHandler(err, req, res, next) {
		res.statusCode = 500;

		if (dumpExceptions) {
			console.error(err.stack);
		}

		if (logErrors) {
			var now = new Date();
			logErrorsStream.write(now.toJSON() +  ' - Error: \n' + err.stack + "\n");
		}

		var accept = req.headers.accept || '';
		if (showStack) {
			if (~accept.indexOf('html')) {
				res.render('error.jade', {
					layout: false,
					stack: err.stack || '',
					error: err.toString()
				});
			} else if (~accept.indexOf('json')) {
				var json = JSON.stringify({error: err});
				res.setHeader('Content-Header', 'application/json');
				res.end(json);
			} else {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end(err.stack);
			}
		} else {
			if (~accept.indexOf('html')) {
				res.render('error.jade', {
					layout: false
				});
			} else if (~accept.indexOf('json')) {
				var json = JSON.stringify({error: "Error generating content"});
				res.setHeader('Content-Header', 'application/json');
				res.end(json);
			} else {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end("500 - Server Error");
			}
		}
	}
}