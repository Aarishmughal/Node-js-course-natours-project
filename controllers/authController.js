const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/sendEmail');
const AppError = require('./../utils/appError');

const signToken = (id) => {
	// sign([PAYLOAD], [SECRET_KEY], [OPTIONS])
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};
const createAndSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() +
				process.env.JWT_COOKIE_EXPIRES_IN *
					24 *
					60 *
					60 *
					1000,
		),
		httpOnly: true,
		//secure: true, // Cookie will only be sent on an encrypted connection (HTTPS)
	};
	if (process.env.NODE_ENV === 'production')
		cookieOptions.secure = true;

	// Remove password from output
	user.password = undefined;

	res.cookie('jwt', token, cookieOptions);
	res.status(statusCode).json({
		status: 'success',
		token,
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});
	createAndSendToken(newUser, 201, res);
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
	createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
	// STEP 01: Get Token and check if it exists
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
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
	const decodedToken = await promisify(jwt.verify)(
		token,
		process.env.JWT_SECRET,
	);

	// STEP 03: Check if User still exists
	const user = await User.findById(decodedToken.id);
	if (!user) {
		return next(
			new AppError('User Account not found', 401),
		);
	}

	// STEP 04: Check if User changed password after token issue
	if (user.changedPasswordAfter(decodedToken.iat)) {
		return next(
			new AppError(
				'User Recently changed their password, Please login again',
				401,
			),
		);
	}

	// STEP 05: Grant Access to Protected Route
	req.user = user;
	res.locals.user = user; // For Pug Templates
	next();
});

exports.restrictTo = (...userRoles) => {
	return (req, res, next) => {
		// userRoles is an array: ['admin', 'user']
		if (!userRoles.includes(req.user.role)) {
			return next(
				new AppError(
					'Current User is not Authorized to perform this action',
					403,
				),
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(
	async (req, res, next) => {
		// STEP 01: Get User based on Email
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return next(
				new AppError(
					'No user was found against provided email address',
					404,
				),
			);
		}

		// STEP 02: Generate Random Token
		const resetToken = user.createPasswordResetToken();
		await user.save({ validateBeforeSave: false }); // User document is modified but not saved

		// STEP 03: Send this token to User's Email Address
		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

		const message = `Forgot your password? Submit a patch request with your new password to: ${resetURL}\nIf you didn't request this, ignore this email.`;

		try {
			await sendEmail({
				email: user.email,
				subject:
					'Reset your Password [Expires in 10 Minutes]',
				message,
			});
		} catch (err) {
			user.passwordResetToken = undefined;
			user.passwordResetExpired = undefined;
			await user.save({ validateBeforeSave: false });
			return next(
				new AppError(
					'There was an error sending the Password Reset Link. Please Try again later',
					500,
				),
			);
		}

		// STEP 00: Send a nice Response to the client
		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!',
		});
	},
);
exports.resetPassword = catchAsync(
	async (req, res, next) => {
		// STEP 01: Get User based on the Token
		const hashedToken = crypto
			.createHash('sha256')
			.update(req.params.token)
			.digest('hex');
		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		// STEP 02: If token has not expired, and there is user, set the new password
		if (!user) {
			return next(
				new AppError(
					'Passwor Reset Token is Invalid or has expired',
					400,
				),
			);
		}
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// STEP 03: Update changedPasswordAt property for the user
		// Look into this method code in userModel.js
		// It is a pre-save middleware
		// It will only be executed when the password is modified and the document is not new
		// So we don't need to call it here explicitly
		// *****IT SAVES THE TIMES AS `Date.now() - 1000`[Subtracting 1 second] TO MAKE SURE THAT TOKEN IS SIGNED AFTER THE PASSWORD IS CHANGED*****

		// STEP 04: Log the user in, send JWT
		createAndSendToken(user, 200, res);
	},
);

exports.updatePassword = catchAsync(
	async (req, res, next) => {
		// STEP 00: Check Fields exist
		const {
			passwordCurrent,
			password,
			passwordConfirm,
		} = req.body;
		if (
			!passwordCurrent ||
			!password ||
			!passwordConfirm
		)
			return next(
				new AppError(
					'Please provide all the details to update your password',
				),
			);

		// STEP 01: Get user from collection
		// User data is coming from `protect` middleware
		const user = await User.findById(
			req.user._id,
		).select('+password');

		// STEP 02: Check if POSTed password is correct
		if (
			!(await user.correctPassword(
				passwordCurrent,
				user.password,
			))
		)
			return next(
				new AppError('Incorrect Current Password'),
			);

		// STEP 03: If so, update password
		user.password = password;
		user.passwordConfirm = passwordConfirm;
		await user.save();

		// STEP 04: Login the User, send JWT
		createAndSendToken(user, 200, res);
	},
);
