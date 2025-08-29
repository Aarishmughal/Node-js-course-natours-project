const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});
	// sign([PAYLOAD], [SECRET_KEY], [OPTIONS])
	const token = signToken(newUser._id);
	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser,
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	// ES6 DESTRUCTURING: Property Name is same as the Variable Name
	const { email, password } = req.body;

	// STEP 01: Check Email/Password Actually exist
	if (!email || !password) {
		return next(
			// Use `return` to avoid sending double responses
			new AppError(
				'Please provide Email and Password',
				400,
			),
		);
	}

	// STEP 02: Check If User exists & Compare Password
	const user = await User.findOne({
		email, // ES6 SELECTION: FIELD NAME AND VARIABLE NAME IS SAME, `email:email`
	}).select('+password');

	// We are using whole statement instead of storing result in a variable because it only works if `user` exists
	if (
		!user ||
		!(await user.correctPassword(
			password,
			user.password,
		))
	) {
		return next(
			// Use `return` to avoid sending double responses
			new AppError(
				'Incorrect Email Address or Password',
				401,
			),
		);
	}

	// STEP 03: If everything is ok, Send JWT to client
	const token = signToken(user._id);
	res.status(200).json({
		status: 'success',
		token,
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	// STEP 01: Get Token and check if it exists
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) {
		return next(
			new AppError(
				'Unable to Login at the moment',
				401,
			),
		);
	}

	// STEP 02: Verification the Token
	
	// STEP 03: Check if User still exists
	// STEP 04: Check if User changed password after token issue

	// STEP 05: Call `next()` if all passes
	next();
});
