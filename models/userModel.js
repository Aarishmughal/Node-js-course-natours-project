const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'User Name is missing'],
		trim: true,
	},
	email: {
		type: String,
		required: [true, 'User Email Address is missing'],
		unique: true,
		lowercase: true,
		validate: [
			validator.isEmail,
			'Provide Email Address is invalid',
		],
		trim: true,
	},
	photo: {
		type: String,
	},
	password: {
		type: String,
		required: ['true', 'User Password is missing'],
		minLength: [
			8,
			'Password must be atleast 8 characters',
		],
		trim: true,
		select: false, // Never shows up in any select outputs
	},
	passwordConfirm: {
		type: String,
		required: ['true', 'User Passwords do not match'],
		trim: true,
		validate: {
			// This Custom validator only works on save.
			validator: function (el) {
				return el === this.password;
			},
			message: 'User Passwords do not match',
		},
	},
});

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
	// Skip this middleware if Password wasn't modified
	if (!this.isModified('password')) return next();

	// Hash the Password with a cost of 12
	this.password = await bcrypt.hash(this.password, 12);
	// Delete the PasswordConfirm field
	this.passwordConfirm = undefined;
	next();
});

// INSTANCE METHOD
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	// `this.password` won't be available
	return await bcrypt.compare(
		candidatePassword,
		userPassword,
	);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
