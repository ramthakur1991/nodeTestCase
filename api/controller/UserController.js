var User = require('../models/User'),
	Service = require('../service') ,
	bcrypt = require('bcryptjs'),
	localization = require('../service/localization'),
	_ = require('lodash');

module.exports = {
	register : function(req, res){
		
		var params = _.pick(req.body, 'userName', 'fullName', 'email', 'phoneNumber', 'profilePic', 'password', 'userMood', 'userStatus', 'deviceId', 'deviceType');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.BodyMissing, true));
		}
		
		if(_.isEmpty(params.userName)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.UsernameMissing, true));
		}
		
		if(_.isEmpty(params.email)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.EmailMissing, true));
		}
		
		if(_.isEmpty(params.password)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.PasswordMissing, true));
		}
		
		if(_.isEmpty(params.deviceId)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceIdMissing, true));
		}
		
		if(_.isEmpty(params.deviceType)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceTypeMissing, true));
		}

		User
		.findOne({
			$or : [{
				userName : params.userName.toString().trim()	
			},
			{
				email : params.email.toString().trim() 	
			}]
		}).exec((err, user)=>{
			
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			
			if(_.isEmpty(user)){
				if(_.isEmpty(params.profilePic)){
					bcrypt.hash(params.password.trim(), 10, function (err, hash) {
						var Obj = new User({
									userName: params.userName,
									fullName: params.fullName || null,
									email: params.email,
									phoneNumber: params.phoneNumber || null,
									password: hash,
									profilePic: null,
									userMood: params.userMood || null,
									userStatus: params.userStatus || null,
									deviceId: params.deviceId,
									deviceType: params.deviceType,
									apiToken: Service.issueToken(params.userName),
								});
						
						Obj.save((err, userSaved)=>{
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							return res.status(200).json(Service.response(200, localization.RecordCreated, userSaved, false));
						});
					});
				}else{
					Service.mediaUpload(params.profilePic, (err, mediaResult)=>{
						if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
						
						bcrypt.hash(params.password.trim(), 10, function (err, hash) {
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							var imgObj = new User({
									userName: params.userName,
									fullName: params.fullName || null,
									email: params.email,
									phoneNumber: params.phoneNumber || null,
									password: hash,
									profilePic: mediaResult.path ,
									userMood: params.userMood || null,
									userStatus: params.userStatus || null,
									deviceId: params.deviceId,
									deviceType: params.deviceType,
									apiToken: Service.issueToken(params.userName),
								});
							imgObj.save((err, userSaved)=>{
								if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
								return res.status(200).json(Service.response(200, localization.RecordCreated, userSaved, false));
							});
						});
					});
				}
			}else{
				return res.status(400).json(Service.response(400, localization.validationError, localization.AlreadyExists, true));
			}
		});
	},
	
	login: function(req, res){
		var params = _.pick(req.body, 'userName', 'password', 'deviceId', 'deviceType');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.BodyMissing, true));
		}
		
		if(_.isEmpty(params.userName)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.UsernameMissing, true));
		}
		
		if(_.isEmpty(params.password)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.PasswordMissing, true));
		}
		
		if(_.isEmpty(params.deviceId)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceIdMissing, true));	
		}
		
		if(_.isEmpty(params.deviceType)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceTypeMissing, true));	
		}
		
		User
		.findOne({
			$or: [
				{
					userName: params.userName.toString().trim()
				},
				{
					email: params.userName.toString().trim()
				} 
			]	
		})
		.exec((err, user)=>{
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			
			if(_.isEmpty(user)){
				return res.status(400).json(Service.response(400, localization.AuthenticationError, params, true));
			}else{
				if(!user.isActive){
					return res.status(400).json(Service.response(400, localization.DisabledByAdmin, params, true));
				}
				
				if(user.isDeleted){
					return res.status(400).json(Service.response(400, localization.DeletedByAdmin, params, true));
				}
				
				bcrypt.compare(params.password, user.password, function(err, isVerify) {
					if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
					if(isVerify){
						User
						.findOneAndUpdate({
							$or: [
									{
										userName: params.userName.toString().trim()
									},
									{
										email: params.userName.toString().trim()
									} 
								]	
						},{
							deviceId: params.deviceId.trim(),
							deviceType: params.deviceType.trim(),
							apiToken: Service.issueToken(user._id),
						},{
							new: true
						})
						.exec(function(err, tokenUpdated){
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							return res.status(200).json(Service.response(200, localization.AuthenticationSuccessfully, tokenUpdated, false));
						});
						
					}else{
						return res.status(400).json(Service.response(400, localization.AuthenticationError, localization.PasswordError, false));
					}
				});
			}
		});
	},
	
	updateProfile: function(req, res){
		var params = _.pick(req.body, 'userName', 'email', 'fullName', 'phoneNumber', 'profilePic', 'userMood', 'userStatus');
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.BodyMissing, true));
		}

		if(_.isEmpty(params.userName) || _.isEmpty(params.email)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.RequiredFiledMissing, true));
		}
		
		User
		.findOne({
			$or: [
				{
					userName: params.userName.toString().trim()
				},
				{
					email: params.email.toString().trim()
				} 
			]	
		})
		.exec((err, user)=>{
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			
			if(_.isEmpty(user)){
				return res.status(400).json(Service.response(400, localization.validationError, localization.NoRecordWithCredentails, true));
			}else{
				if(_.isEmpty(params.profilePic)){
					try{
						User
						.findOneAndUpdate({
							$or : [
								{
									userName: params.userName.toString().trim()
								},
								{
									email: params.email.toString().trim()
								}
							]	
						},{
							fullName: params.fullName || user.fullName,
							phoneNumber: params.phoneNumber || user.phoneNumber,
							profilePic: params.profilePic || user.profilePic,
							userMood: params.userMood || user.userMood,
							userStatus: params.userStatus || user.userStatus
						},{
							new: true
						})
						.exec((err, userUpdated)=>{
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							return res.status(201).json(Service.response(201, localization.RecordUpdated, userUpdated, false));
						});
					}catch(e){
						return res.status(500).json(Service.response(500, localization.ServerError, e, true));
					}
				}else{
					try{
						Service.mediaUpload(params.profilePic, (err, mediaResult)=>{
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							
							User
							.findOneAndUpdate({
								$or : [
									{
										userName: params.userName.toString().trim()
									},
									{
										email: params.email.toString().trim()
									}
								]	
							},{
								fullName: params.fullName || user.fullName,
								phoneNumber: params.phoneNumber || user.phoneNumber,
								profilePic: mediaResult.path,
								userMood: params.userMood || user.userMood,
								userStatus: params.userStatus || user.userStatus
							},{
								new: true
							})
							.exec((err, userUpdated)=>{
								if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
								return res.status(201).json(Service.response(201, localization.RecordUpdated, userUpdated, false));
							});
						});
					}catch(e){
						return res.status(500).json(Service.response(500, localization.ServerError, e, true));
					}
				}
			}
		});
	},
	
	forgetPassword: function(req, res){
		var params = _.pick(req.body, 'email');
		
		User
		.findOne({
			email: params.email.toString().trim(),
			isActive: true,
			isDeleted: false 
		})
		.exec((err, user)=>{
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			
			if(_.isEmpty(user)){
				return res.status(400).json(Service.response(400, localization.AuthenticationError, params, true));
			}else{
				var encryptPassword = bcrypt.genSaltSync(10);
				bcrypt.hash(encryptPassword, 10, function (err, hash) {
					User
					.findOneAndUpdate({
						email: params.email.toString().trim()
					},{
						password: hash
					},{
						new: true
					})
					.exec((err, userUpdated)=>{
						if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
						res.render('emailTemplate/forgetPassword', {"password":hash, "email": params.email}, (err, mailBody)=>{
							if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
							Service.emailService(userUpdated.email, mailBody, (err, isSend)=>{
								if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
								return res.status(201).json(Service.response(200, localization.PasswordUpdated, isSend, false));
							});
						});
					});
				});
			}
		});
	},
	
	listUsers: function(req, res){
		User
		.find({
			"isDeleted": false
		})
		.exec((err, users)=>{
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			return res.status(200).json(Service.response(200, localization.UserFetched, users, false));
		});
	},
	
	socialLogin: function(req, res){
		var params = _.pick(req.body, 'userName', 'fullName', 'email', 'phoneNumber', 'profilePic', 'userMood', 'userStatus', 'deviceId', 'deviceType');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.BodyMissing, true));
		}
		
		if(_.isEmpty(params.userName)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.UsernameMissing, true));
		}
		
		if(_.isEmpty(params.email)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.EmailMissing, true));
		}
		
		if(_.isEmpty(params.deviceId)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceIdMissing, true));
		}
		
		if(_.isEmpty(params.deviceType)){
			return res.status(400).json(Service.response(400, localization.validationError, localization.DeviceTypeMissing, true));
		}
		
		User
		.findOne({
			$or : [{
				userName : params.userName.toString().trim()	
			},
			{
				email : params.email.toString().trim() 	
			}]
		})
		.exec((err, user)=>{
			if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
			
			if(_.isEmpty(user)){
				// Need to create new social login user 
				bcrypt.hash("thisIsOurSocialLoginUserPassword", 10, function (err, hash) {
					var Obj = new User({
								userName: params.userName,
								fullName: params.fullName || null,
								email: params.email,
								phoneNumber: params.phoneNumber || null,
								password: hash,
								profilePic: params.profilePic,
								userType: "social",
								userMood: params.userMood || null,
								userStatus: params.userStatus || null,
								deviceId: params.deviceId,
								deviceType: params.deviceType,
								apiToken: Service.issueToken(params.userName),
							});
					
					Obj.save((err, userSaved)=>{
						if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
						return res.status(200).json(Service.response(200, localization.RecordCreated, userSaved, false));
					});
				});
			}else{
				//Social Login user already exists need to just update information
				User
				.findOneAndUpdate({
					$or: [
							{
								userName: params.userName.toString().trim()
							},
							{
								email: params.userName.toString().trim()
							} 
						]	
				},{
					deviceId: params.deviceId.trim(),
					deviceType: params.deviceType.trim(),
					apiToken: Service.issueToken(user._id),
				},{
					new: true
				})
				.exec(function(err, tokenUpdated){
					if(err) return res.status(500).json(Service.response(500, localization.ServerError, err, true));
					return res.status(200).json(Service.response(200, localization.AuthenticationSuccessfully, tokenUpdated, false));
				});
			}
		});
	},
	
	importContacts : function(req, res){
		var params = _.pick(req.body, 'contacts');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Please check contact array before request", "Validation Error", true));
		}
		User.find({
			phoneNumber : {
				$in : params.contacts
			}
		})
		.select({'userName' : 1 , 'fullName' : 1, 'email' : 1, 'phoneNumber': 1, 'profilePic': 1})
		.exec(function(err, user){
			if(err){
				return res.status(500).json(Service.response(500,"Error While import contacts", err, true));
			}
			return res.status(200).json(Service.response(200,"Import contacts successfully", user, false));
		});
	},
};
