var crypto = require('crypto');
 
function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://localhost/business_case');
 
if(process.argv.length == 4){
	var newUser = db.model('user');
	var user    = new newUser({boardID: process.argv[2], password: hashString(process.argv[3]) });
	user.save(function(err){
		console.log("User added to database");
		process.exit(0);
	});
	
}else{
	console.error("Script requires exactly 2 arguments");
	console.error("Usage: node addUser.js <email> <password>");
	process.exit(1);
}