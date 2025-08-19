const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields =
		'name,price,ratingsAverage,summary,difficulty';
	next();
};
exports.getAllTours = async (req, res) => {
	try {
		// BUILD QUERY
		console.log(req.query);
		// 1) Filtering
		const queryObj = { ...req.query };
		const excludedFields = [
			'page',
			'sort',
			'limit',
			'fields',
		];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 2) Advanced Filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`,
		);
		// OPERATORS TO REPLACE: gte, gt, lte, lt
		// { difficulty: 'easy', duration:{ $gte:5 }}	//Original MongoDB Object Filter Query
		// console.log(JSON.parse(queryStr));
		let query = Tour.find(JSON.parse(queryStr)); // Using Filter Object

		// 3) Sorting
		if (req.query.sort) {
			const sortBy = req.query.sort
				.split(',')
				.join(' ');
			query = query.sort(sortBy);
		} else {
			query = query.sort('-createdAt');
		}

		// 4) Field Limiting
		if (req.query.fields) {
			const fields = req.query.fields
				.split(',')
				.join(' ');
			query = query.select(fields); // Projecting
		} else {
			query = query.select('-__v'); // Minus acts as Excluder
		}

		// 5) Pagination
		const page = req.query.page * 1 || 1;
		const limit = req.query.limit * 1 || 100;

		const skip = (page - 1) * limit; // Calculate Skip Value, Skip all documents upto last page
		query = query.skip(skip).limit(limit);

		// page=2&limit=10		// Page01: 1-10, Page02: 11-20, ...
		// query = query.skip(10).limit(10);

		if (req.query.page) {
			const numTours = await Tour.countDocuments();
			if (skip >= numTours)
				throw new Error('This page does not exist');
		}

		// EXECUTE QUERY
		const tours = await query;

		// const tours = await Tour.find()
		// 	.where('duration')
		// 	.equals(req.query.duration)
		// 	.where('difficulty')
		// 	.equals(req.query.difficulty); 		// Mongoose Methods

		// const tours = await Tour.find();		// Return all objects without any filtering
		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: { tours },
		});
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
		});
	}
};
exports.getTour = async (req, res) => {
	try {
		//Tour.findOne({ _id: req.params.id})
		const tour = await Tour.findById(req.params.id);
		res.status(200).json({
			status: 'success',
			data: { tour },
		});
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
		});
	}
};
exports.createTour = async (req, res) => {
	// const newTour = new Tour({});
	// newTour.save();			// LEGACY METHOD

	try {
		const newTour = await Tour.create(req.body); // BETTER METHOD
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};
exports.updateTour = async (req, res) => {
	try {
		const tourToUpdate = await Tour.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true, // New Updated Document will be returned
				runValidators: true, // Run Schema's Validation Rules once again
			},
		);

		res.status(200).json({
			status: 'success',
			data: {
				tour: tourToUpdate,
			},
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};
exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);
		res.status(204).json({
			status: 'success',
			message: 'Tour Deleted!',
			data: null,
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};
