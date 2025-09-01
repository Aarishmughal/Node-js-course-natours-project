const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
	let newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) {
			newObj = obj[el];
		}
	});
	return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: { users },
	});
});
exports.getUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined yet.',
	});
};
exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined yet.',
	});
};
exports.updateMe = catchAsync(async (req, res, next) => {
	// STEP 00: Perform Sanitization
	// const { email, password } = req.body;	// This method is not scalable
	const filteredBody = filterObj(
		req.body,
		'name',
		'email',
	);

	// STEP 01: Create Error if User POSTs Password Data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword',
				400,
			),
		);
	}

	// STEP 02: Update the User Document
	const user = await User.findByIdAndUpdate(
		req.user._id,
		filteredBody,
		{ new: true, runValidators: true },
	);

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, {
		active: false,
	});
	res.status(204).json({
		status: 'success',
		data: null,
	});
});
exports.updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined yet.',
	});
};
exports.deleteUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined yet.',
	});
};
