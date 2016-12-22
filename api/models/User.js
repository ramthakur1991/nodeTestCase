var mongoose = require('./connection') ,
	Schema = mongoose.Schema;
	
var UserModel = new Schema({
    userName: {
		type: String,
		lowercase: true ,
		trim: true ,
		required: [true, 'Username is required.'],
		unique: true ,
		index: true 
	},
	fullName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		index: true,
		required: [true, 'Email is required.']
	},
	phoneNumber: {
		type: Number,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	profilePic: {
		type: String,
		trim: true 
	},
	userMood: {
		type: String,
		trim: true 
	},
	userStatus: {
		type: String,
		trim: true
	},
	userType: {
		type: String,
		default: "user",
		trim: true,
		enum: ['admin','user','social']
	},
	deviceId: {
		type: String ,
		trim: true ,
		unique: true 
	},
	deviceType: {
		type: String,
		trim: true,
		enum: ['ios','android']
	},
	isActive: {
		type: Boolean,
		default: true 
	},
	isDeleted: {
		type: Boolean,
		default: false 
	},
	apiToken: {
		type: String,
		default: null,
		trim: true 
	},
	updatedAt: {
		type: Date,
		default: Date.now()
	},
	createdAt: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('User', UserModel);