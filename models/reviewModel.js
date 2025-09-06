const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			trim: true,
			required: [true, 'A Review is required'],
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: [true, 'A review must have a Rating'],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [
				true,
				'Review must belong to a Tour',
			],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [
				true,
				'Review must belong to a User',
			],
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
	},
);

// To prevent duplicate reviews from same user on same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
	this
		// .populate({
		// 	path: 'tour',
		// 	select: 'name',
		// })
		.populate({
			path: 'user',
			select: 'name photo',
		});
	next();
});

// Static Methods are available on the Model
reviewSchema.statics.calcAverageRatings = async function (
	tourId,
) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

reviewSchema.post('save', function () {
	this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
	// We need access to the document, so we execute this query to get the document
	// At `pre` time of the query, the document is being fetched directly from the database. (Unupdated)
	this.r = await this.findOne();
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	// this.r = await this.findOne(); // This won't work here becuase the query is already executed and lost
	await this.r.constructor.calcAverageRatings(
		this.r.tour,
	);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
