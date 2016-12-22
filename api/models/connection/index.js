var mongoose   = require('mongoose'),
	config = require('../../../config');

if(process.env.NODE_ENV === 'production'){
	mongoose.connect('mongodb://localhost:27017/'+config.dbNameProd); // connect to our database	
}else if(process.env.NODE_ENV === 'development'){
	mongoose.connect('mongodb://localhost:27017/'+ config.dbNameDev); // connect to our database
}else if(process.env.NODE_ENV === 'test'){
	mongoose.connect('mongodb://localhost:27017/'+config.dbNameTest); // connect to our database	
}else{
	mongoose.connect('mongodb://localhost:27017/'+ config.dbNameDev); // connect to our database
}	
module.exports = mongoose ;