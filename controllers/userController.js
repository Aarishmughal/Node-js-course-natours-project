const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	let newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) {
			newObj = obj[el];
		}
	});
	return newObj;
};
exports.getMe = (req, res, next) => {
	req.params.id = req.user._id;
	next();
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
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
