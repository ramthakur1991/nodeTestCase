//setting up environment
	process.env.NODE_ENV = 'test';
console.log("=============================================");
console.log("UserController testcase begin from here....");
console.log("=============================================");
// add dev dependencies from here ..
var User = require('../api/models/User'),
	chai = require('chai'),
	chaiHttp = require('chai-http'),
	server = require('../index'),
	should = chai.should();

	//use chaiHttp for Api hits
	chai.use(chaiHttp);

describe('Users', ()=>{

	describe('Register Api', ()=>{
		beforeEach((done) => {
			User.remove({}, () => { done(); });     
		});
		
		it('it should return the error if required fields are empty', (done)=>{
			var obj = { "userName": "", "email": "", "phoneNumber": "9815098150", "profilePic": "", "userMood": "awesome",        "userStatus": "I'm the king of world", "deviceId": "", "deviceType": "", "apiToken": "asdfsadsa0d9sa8d0sa8d90sa8d0sad8s90ad"};
			
			chai.request(server)
			.post('/api/registration')
			.send(obj)
			.end((err, res)=>{
				res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('responseMessage').eql('Validation Error Please check params.');
				done();
			});
		});
		
		it('it should save the user if all requried filed is filled up', (done)=>{
			var obj = { "userName": "testUser", "email": "test@test.com", "phoneNumber": "9815098150", "password": "Admin123#",
				"profilePic": "", "deviceType": "ios", "deviceId": "asdsadasuikdhaduikhaouidfhqw89qyw8qwuydf89d" };

			chai
			.request(server)
			.post('/api/registration')
			.send(obj)
			.end((err, res)=>{
				res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                res.body.should.have.property('responseMessage').eql('Record created successfully.');
				done();
			});
		});
	});
	
	describe('List users record Api', ()=>{
		var UserData = {} ;
	
		beforeEach(function (done) {
			//remove if any existing user exists
			User.remove({}, () => {  });
			//setup the userobject before going to save into data
			chai
			.request(server)
			.post('/api/registration')
			.send({ "userName": "testUser", "email": "test@test.com", "phoneNumber": "9815098150", "password": "Admin123#", "profilePic": "", "deviceType": "ios", "deviceId": "asdsadasuikdhaduikhaouidfhqw89qyw8qwuydf89d"})
			.end((err, res)=>{
				UserData = res.body.data ;
				done();
			});
		});
		
		it('it should get all the users which has isDeleted false', (done)=>{
			chai.request(server)
			.get('/api/listUsers')
			.set("x-access-token", UserData.apiToken)
			.end((err, res)=>{
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
				res.body.data.should.be.a('array');
                res.body.data.length.should.be.not.eql(0);
				done();
			});
		});
	});
	
	describe('Update user profile APi', ()=>{
		var UserData = {} ;
	
		beforeEach(function (done) {
			//remove if any existing user exists
			User.remove({}, () => {  });
			//setup the userobject before going to save into data
			chai
			.request(server)
			.post('/api/registration')
			.send({ "userName": "testUser", "email": "test@test.com", "phoneNumber": "9815098150", "password": "Admin123#", "profilePic": "", "deviceType": "ios", "deviceId": "asdsadasuikdhaduikhaouidfhqw89qyw8qwuydf89d"})
			.end((err, res)=>{
				UserData = res.body.data ;
				done();
			});
		});
		
		it('it should return validation error if required field is missing', (done)=>{
			chai
			.request(server)
			.post('/api/updateProfile')
			.set("x-access-token", UserData.apiToken)
			.send({"userName": "","fullName": "Test User","email": "","phoneNumber": "09815098150","userMood": "awesome","profilePic": "",	"userStatus": "Test Quotes"})
			.end((err, res)=>{
				res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('responseMessage').eql('Validation Error Please check params.');
				done();
			});
		});
		
		it('it should successfully update user record', (done)=>{
			chai
			.request(server)
			.post('/api/updateProfile')
			.set("x-access-token", UserData.apiToken)
			.send({"userName": "testUser","fullName": "Dummy User","email": "test@test.com","phoneNumber": "09815098150","userMood": "bad mood","profilePic": "","userStatus": "Test Quotes for dummy user"})
			.end((err, res)=>{
				res.should.have.status(201);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
				res.body.should.have.property('responseMessage').eql('Record Updated successfully.');
				done();
			});
		});
	});
		
	describe('Login Api', ()=>{
		var UserData = {} ;
	
		beforeEach(function (done) {
			//remove if any existing user exists
			User.remove({}, () => {  });
			//setup the userobject before going to save into data
			chai
			.request(server)
			.post('/api/registration')
			.send({ "userName": "testUser", "email": "test@test.com", "phoneNumber": "9815098150", "password": "Admin123#", "profilePic": "", "deviceType": "ios", "deviceId": "asdsadasuikdhaduikhaouidfhqw89qyw8qwuydf89d"})
			.end((err, res)=>{
				UserData = res.body.data ;
				done();
			});
		});
		
		it('it should return the error if email/userName missing', (done)=>{
			var obj = {"userName":"","password":"Admin123#","deviceType":"ios","deviceId":"asdsadasuikdhaduikhaouidfhqw89qyw8qwuydf89d"};
			chai.request(server)
			.post('/api/login')
			.set("x-access-token", UserData.apiToken)
			.send(obj)
			.end((err, res)=>{
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('error').eql('Username is missing.');
				done();
			});
		});
		
		it('it should return the error if password missing', (done)=>{
			var obj = { "userName": "test@test.com", "password": "","deviceType":"ios","deviceId":"asdsadasuikdhaduikhaouidfhqw89qyw8"};
			chai.request(server)
			.post('/api/login')
			.send(obj)
			.set("x-access-token", UserData.apiToken)
			.end((err, res)=>{
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('error').eql('Password is missing');
				done();
			});
		});
		
		it('it should return the error if either username/email is not exist in database', (done)=>{
			var obj = { "userName": "test1233@test.com", "password": "Admin123#","deviceType":"ios","deviceId":"asdsadasuikdhaduikh"};
			chai.request(server)
			.post('/api/login')
			.set("x-access-token", UserData.apiToken)
			.send(obj)
			.end((err, res)=>{
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('error');
				res.body.should.have.property('responseMessage').eql('Invalid userName or email address.');
				done();
			});
		});
		
		it('it should return the error if password in incorrect', (done)=>{
			var obj = { "userName": "test@test.com", "password": "Admin1asd23#","deviceType":"ios","deviceId":"asdsadasuikdhaduikhaouidf"};
			chai.request(server)
			.post('/api/login')
			.send(obj)
			.set("x-access-token", UserData.apiToken)
			.end((err, res)=>{
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('data').eql('Invalid password.');
				done();
			});
		});
		
		it('it should be successfull login if credentails are correct', ()=>{
			var obj = { "userName": "test@test.com", "password": "Admin123#","deviceType":"ios","deviceId":"asdsadasuikdhaduikhaouidfhqw"};
			chai.request(server)
			.post('/api/login')
			.send(obj)
			.set("x-access-token", UserData.apiToken)
			.end((err, res)=>{
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('error').eql('Password Authenticated successfully');
				done();
			});
		});
	});
});

