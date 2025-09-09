const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
		default: 'default.jpg',
	},
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
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
	passwordChangedAt: { type: Date },
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
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

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew)
		return next();
	this.passwordChangedAt = Date.now() - 1000; // Ensures that the token is always created after the password has been changed
	next();
});

// This middleware finds documents where active is not equal to false
userSchema.pre(/^find/, function (next) {
	// this points to the current query
	this.find({ active: { $ne: false } });
	next();
});

// INSTANCE METHODS
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

userSchema.methods.changedPasswordAfter = function (
	JWTTimeStamp,
) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10, //Base-10
		);
		return JWTTimeStamp < changedTimestamp; //100 < 200
	}
	// Default False: Means password is not changed
	return false;
};
userSchema.methods.createPasswordResetToken = function () {
	const token = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Minutes * Seconds * MilSeconds
	return token;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
