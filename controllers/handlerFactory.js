const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		// To allow for nested GET reviews on tour (hack)
		let filter = {};
		if (req.params.tourId) {
			filter = { tour: req.params.tourId };
		}
		// Manipulating the query
		const features = new APIFeatures(
			Model.find(filter),
			req.query,
		)
			.filter()
			.sort()
			.limit()
			.paginate();

		// EXECUTE QUERY

		const documents = await features.query;
		res.status(200).json({
			status: 'success',
			results: documents.length,
			data: { data: documents },
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		// SAVING RESOURCES
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);
		const document = await query;
		if (!document) {
			return next(
				new AppError(
					'No document found with the provided ID!',
					404,
				),
			);
		}
		res.status(200).json({
			status: 'success',
			data: { data: document },
		});
	});

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const newDocument = await Model.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				data: newDocument,
			},
		});
	});

exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const documentToUpdate =
			await Model.findByIdAndUpdate(
				req.params.id,
				req.body,
				{
					new: true, // New Updated Document will be returned
					runValidators: true, // Run Schema's Validation Rules once again
				},
			);
		if (!documentToUpdate) {
			return next(
				new AppError(
					'No document found with the provided ID!',
					404,
				),
			);
		}
		res.status(200).json({
			status: 'success',
			data: {
				data: documentToUpdate,
			},
		});
	});

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(
			req.params.id,
		);
		if (!doc) {
			return next(
				new AppError(
					`No document found with the provided ID!`,
					404,
				),
			);
		}
		res.status(204).json({
			status: 'success',
			message: 'Document Deleted!',
			data: null,
		});
	});
