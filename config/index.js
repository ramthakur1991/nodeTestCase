module.exports = {
	dbNameDev: 'yapp_dev',
	dbNameProd: 'yapp_prod',
	dbNameTest: 'yapp_test',
	mediaPath: "http://mastersoftwaretechnologies.com:8026",
	apiSecret: "myYappApiTokenSecretKeyIsHereIfyougetthistokenotnot",
	apiTokenExpirationTime: 365*24*60*60 ,
	appSMTP: {
		host: 'smtp.gmail.com',
		port: 587,
		debug: true,
		auth: {
		  user: "testmss42@gmail.com",
		  pass: "chotabhem"
		}
	},
	port: 8026,
};
