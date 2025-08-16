const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
	try {
		const tours = await Tour.find();
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
			message: 'Invalid Data Sent!',
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
			message: 'Invalid Data Sent!',
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
			message: 'Invalid Data Sent!',
		});
	}
};
