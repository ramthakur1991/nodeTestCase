var UserController = require('../api/controller/UserController'),
	Service = require('../api/service');
	
module.exports = function(router){

	router.get('/',function(req,res){
		res.render('index');
	});

	/**
	 *	UserController Api's routes are listed as follows
	 **/
	router.post('/api/registration', (req, res)=>{
		return UserController.register(req, res);
	});
	
	router.post('/api/login', (req, res)=>{
		return UserController.login(req, res);
	});
	
	router.post('/api/updateProfile', (req, res)=>{
		Service.verifyApiToken(req, (err)=>{
			if(err.status) {
				if(err.code === 403){
					return res.status(403).json(Service.response(403, "Authorization Error", err.reason, true));
				}else{
					return res.status(400).json(Service.response(400, "Bad request", err.reason, true));
				}
			}
			return UserController.updateProfile(req, res);
		});
	});
	
	router.get('/api/listUsers', (req, res)=>{
		Service.verifyApiToken(req, (err)=>{
			if(err.status) {
				if(err.code === 403){
					return res.status(403).json(Service.response(403, "Authorization Error", err.reason, true));
				}else{
					return res.status(400).json(Service.response(400, "Bad request", err.reason, true));
				}
			}else{
				return UserController.listUsers(req, res);	
			}
		});
	});
	
	router.post('/api/socialLogin', (req, res)=>{
		return UserController.socialLogin(req, res);	
	});
	
	router.post('/api/forgetPassword', (req, res)=>{
		return UserController.forgetPassword(req, res);
	});
	
	router.post('/api/importContacts', (req, res)=>{
		Service.verifyApiToken(req, (err)=>{
			if(err.status) {
				if(err.code === 403){
					return res.status(403).json(Service.response(403, "Authorization Error", err.reason, true));
				}else{
					return res.status(400).json(Service.response(400, "Bad request", err.reason, true));
				}
			}else{
				return UserController.importContacts(req, res);
			}
		});
	});
};