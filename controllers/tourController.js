const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields =
		'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
	// Manipulating the query
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limit()
		.paginate();

	// EXECUTE QUERY

	const tours = await features.query;
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: { tours },
	});
	// 	try {
	// 		// BUILD QUERY
	// 		// console.log(req.query);
	// 		// // 1) Filtering
	// 		// const queryObj = { ...req.query };
	// 		// const excludedFields = [
	// 		// 	'page',
	// 		// 	'sort',
	// 		// 	'limit',
	// 		// 	'fields',
	// 		// ];
	// 		// excludedFields.forEach((el) => delete queryObj[el]);
	// 		// let queryStr = JSON.stringify(queryObj);

	// 		// // 2) Advanced Filtering
	// 		// queryStr = queryStr.replace(
	// 		// 	/\b(gte|gt|lte|lt)\b/g,
	// 		// 	(match) => `$${match}`,
	// 		// );
	// 		// // OPERATORS TO REPLACE: gte, gt, lte, lt
	// 		// // { difficulty: 'easy', duration:{ $gte:5 }}	//Original MongoDB Object Filter Query
	// 		// // console.log(JSON.parse(queryStr));
	// 		// let query = Tour.find(JSON.parse(queryStr)); // Using Filter Object

	// 		// // 3) Sorting
	// 		// if (req.query.sort) {
	// 		// 	const sortBy = req.query.sort
	// 		// 		.split(',')
	// 		// 		.join(' ');
	// 		// 	query = query.sort(sortBy);
	// 		// } else {
	// 		// 	query = query.sort('-createdAt');
	// 		// }

	// 		// // 4) Field Limiting
	// 		// if (req.query.fields) {
	// 		// 	const fields = req.query.fields
	// 		// 		.split(',')
	// 		// 		.join(' ');
	// 		// 	query = query.select(fields); // Projecting
	// 		// } else {
	// 		// 	query = query.select('-__v'); // Minus acts as Excluder
	// 		// }

	// 		// // 5) Pagination
	// 		// const page = req.query.page * 1 || 1;
	// 		// const limit = req.query.limit * 1 || 100;

	// 		// const skip = (page - 1) * limit; // Calculate Skip Value, Skip all documents upto last page
	// 		// query = query.skip(skip).limit(limit);

	// 		// page=2&limit=10		// Page01: 1-10, Page02: 11-20, ...
	// 		// query = query.skip(10).limit(10);

	// 		// if (req.query.page) {
	// 		// 	const numTours = await Tour.countDocuments();
	// 		// 	if (skip >= numTours)
	// 		// 		throw new Error('This page does not exist');
	// 		// }

	// 		// const tours = await Tour.find()
	// 		// 	.where('duration')
	// 		// 	.equals(req.query.duration)
	// 		// 	.where('difficulty')
	// 		// 	.equals(req.query.difficulty); 		// Mongoose Methods

	// 		// const tours = await Tour.find();		// Return all objects without any filtering
	// }
});
exports.getTour = catchAsync(async (req, res, next) => {
	//Tour.findOne({ _id: req.params.id})
	const tour = await Tour.findById(req.params.id);
	if (!tour) {
		return next(
			new AppError(
				'No tour found with the provided ID!',
				404,
			),
		);
	}
	res.status(200).json({
		status: 'success',
		data: { tour },
	});
});
exports.createTour = catchAsync(async (req, res, next) => {
	// const newTour = new Tour({});
	// newTour.save();			// LEGACY METHOD

	const newTour = await Tour.create(req.body); // BETTER METHOD
	res.status(201).json({
		status: 'success',
		data: {
			tour: newTour,
		},
	});
	// try {
	// } catch (err) {
	// 	res.status(400).json({
	// 		status: 'fail',
	// 		message: err,
	// 	});
	// }
});
exports.updateTour = catchAsync(async (req, res, next) => {
	const tourToUpdate = await Tour.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true, // New Updated Document will be returned
			runValidators: true, // Run Schema's Validation Rules once again
		},
	);
	if (!tourToUpdate) {
		return next(
			new AppError(
				'No tour found with the provided ID!',
				404,
			),
		);
	}
	res.status(200).json({
		status: 'success',
		data: {
			tour: tourToUpdate,
		},
	});
});
exports.deleteTour = catchAsync(async (req, res, next) => {
	if (!(await Tour.findByIdAndDelete(req.params.id))) {
		return next(
			new AppError(
				'No tour found with the provided ID!',
				404,
			),
		);
	}
	res.status(204).json({
		status: 'success',
		message: 'Tour Deleted!',
		data: null,
	});
});

exports.getTourStats = catchAsync(
	async (req, res, next) => {
		const stats = await Tour.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } },
			},
			{
				$group: {
					// _id: null,
					_id: { $toUpper: '$difficulty' },
					numTours: { $sum: 1 },
					numRatings: {
						$sum: '$ratingsQuantity',
					},
					avgRating: { $avg: '$ratingsAverage' },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
				},
			},
			{
				$sort: {
					avgPrice: 1,
				},
			},
			// {
			// 	$match: { _id: { $ne: 'EASY' } },
			// },
		]);
		res.status(200).json({
			status: 'success',
			data: {
				stats,
			},
		});
	},
);

exports.getMonthlyPlan = catchAsync(
	async (req, res, next) => {
		const year = req.params.year * 1;
		const plan = await Tour.aggregate([
			{
				$unwind: '$startDates',
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`), // YYYY-MM-DD
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$startDates' },
					numTourStarts: { $sum: 1 },
					tours: {
						$push: '$name',
					},
				},
			},
			{
				$addFields: { month: '$_id' },
			},
			{
				$project: {
					_id: 0,
				},
			},
			{
				$sort: {
					numTourStarts: -1,
				},
			},
			{
				// $limit: 6,
			},
		]);
		res.status(200).json({
			status: 'success',
			data: { plan },
		});
	},
);
