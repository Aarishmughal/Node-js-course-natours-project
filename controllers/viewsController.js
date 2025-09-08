const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Only for rendered Pages, No errors!
// Goal of this middleware is to check if there is a logged in user
// Any error here means that there is no logged in user
exports.isLoggedIn = async (req, res, next) => {
	if (req.cookies.jwt) {
		try {
			// STEP 02: Verification the Token
			const decodedToken = await promisify(
				jwt.verify,
			)(req.cookies.jwt, process.env.JWT_SECRET);

			// STEP 03: Check if User still exists
			const user = await User.findById(
				decodedToken.id,
			);
			if (!user) {
				return next();
			}

			// STEP 04: Check if User changed password after token issue
			if (
				user.changedPasswordAfter(decodedToken.iat)
			) {
				return next();
			}

			// STEP 05: It means that there is a Logged in User
			res.locals.user = user;
		} catch (err) {
			return next();
		}
	}
	next();
};
exports.getBase = (req, res) => {
	res.status(200).render('base', {
		tour: 'The Forest Hiker',
		user: 'Aarish',
		title: 'Exciting tours for adventurous people',
	});
};
exports.getOverview = catchAsync(async (req, res, next) => {
	// STEP 01: Get Tour data from the collection
	const tours = await Tour.find();
	// STEP 02: Build Template

	// STEP 03: Render that template using the tour data from collection

	res.status(200).render('overview', {
		title: 'All Tours',
		tours,
	});
});
exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findOne({
		slug: req.params.slug,
	}).populate({
		path: 'reviews',
		fields: 'review rating user',
	});

	if (!tour) {
		return next(
			new AppError(
				'There is no tour with that name',
				404,
			),
		);
	}

	// BUILD TEMPLATE
	res.status(200).render('tour', {
		title: tour.name,
		tour,
	});
});
exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Login to your Account',
	});
};
exports.getAccount = catchAsync(async (req, res, next) => {
	// const token = req.cookies.jwt;
	// const decoded = await promisify(jwt.verify)(
	// 	token,
	// 	process.env.JWT_SECRET,
	// );
	// const currentUser = await User.findById(decoded.id);
	console.log(res.locals.user);
	res.status(200).render('account', {
		title: 'Your Account',
	});
});
exports.getSignupForm = (req, res) => {
	res.status(200).render('signup', {
		title: 'Signup a New Account',
	});
};
exports.updateUserData = catchAsync(
	async (req, res, next) => {
		const user = await User.findByIdAndUpdate(
			req.user.id,
			{
				name: req.body.name,
				email: req.body.email,
			},
			{
				new: true,
				runValidators: true,
			},
		);
		res.status(200).render('account', {
			title: 'Your Account',
			user,
		});
	},
);
