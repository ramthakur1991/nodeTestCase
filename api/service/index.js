var fs = require('fs') ,
	path = require('path'),
	config = require('../../config'),
	jwt    = require('jsonwebtoken'),
	nodemailer = require('nodemailer');


function decodeBase64Image(dataString) {
	var matchArray = dataString.trim().match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};
	if (matchArray.length !== 3) {
		return {"status":500, "error": "Invalid base64 content to upload media"} ;
	}
	response.status = 200 ;
	response.type = matchArray[1].split('/')[1];
	response.data = new Buffer(matchArray[2], 'base64');
	return response;
}

module.exports = {
	mediaUpload : function(content, callback){
		var mediaBuffer = decodeBase64Image(content) ,
		imageName = Math.random().toString(36).slice(2) ,
		fileName = `${imageName}.${mediaBuffer.type}`;
		if(mediaBuffer.status === 500){
			callback({"status":500, "error": mediaBuffer.error},null);	
		}
		
		fs.writeFile(`${path.resolve('./')}/assets/uploads/${fileName}`,mediaBuffer.data, function (error) {
			if(error){
				callback({"status":500, "error": error},null);
			}else{
				var mediaPath = `${config.mediaPath}/uploads/${fileName}` ;
				callback(null, {"status":200, "path": mediaPath});
			}
		});
	},
	response : function(status, Message, content, type){
		if(type){
			return {
				status : status ,
				responseMessage : Message ,
				error : content
			};
		}else{
			return {
				status : status ,
				responseMessage : Message ,
				data : content
			};
		}
	},
	emailService: function(email, mailBody, cb){
		if (mailBody){
			var transport = nodemailer.createTransport(require('nodemailer-smtp-transport')(config.appSMTP));
			var mailOptions = {
				from: 'TestEmail<info@info.com>', // sender address
				to: email, // list of receivers
				subject: 'ForgetPassword', // Subject line
				html: mailBody ,  // html body , 
				tls : {rejectUnauthorized: false}  , 
				strictSSL: false
			};
			transport.sendMail(mailOptions, function(err, info) {
				if(err) cb(err, null);
				if(info){
					cb(null, "Mail send Successfully.");	
				}else{
					cb(null, "Error while sending email for the email address :- "+ email);	
				}
			});
		}
	},
	issueToken: function(id){
		return jwt.sign(id, config.apiSecret );
	},
	
	verifyApiToken : function(req, cb){
		var token = req.headers['x-access-token'];
		if(token){
			jwt.verify(token, config.apiSecret, {}, function(err, decode) {
				if (err) cb({"status": true, "reason": "Invalid apiToken", "code": 403});
				cb({"status": false, "reason": decode, "code": 200});
			});
		}else{
			cb({"status": true, "reason": "Api token is missing", "code": 400});
		}
	}
};