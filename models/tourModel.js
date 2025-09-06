const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A Tour must have a Name'],
			unique: true,
			trim: true,
			maxLength: [
				40,
				'A Tour Name cannot be longer than 40 characters',
			],
			minLength: [
				5,
				'A Tour Name cannot be shorter than 5 characters',
			],
			// validate: [
			// 	validator.isAlpha,
			// 	'A Tour name can only contain alphabets',
			// ],
		},
		duration: {
			type: Number,
			required: [true, 'A Tour must have a Duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [
				true,
				'A Tour must have a Group Size',
			],
		},
		difficulty: {
			type: String,
			required: [
				true,
				'A Tour must have a Difficulty',
			],
			trim: true,
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message:
					'A tour difficulty can either be easy, medium and difficult',
			},
		},
		slug: String,
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [
				1,
				'A Tour cannot have rating less than 1.0',
			],
			max: [
				5,
				'A Tour cannot have rating more than 5.0',
			],
			//Min, max also works on dates
			set: (val) => Math.round(val * 10) / 10, //4.666666, 46.6666, 47, 4.7
			// This hack `(*10)/10` is necessary because Math.round returns integers
		},
		ratingsQuantity: { type: Number, default: 0 },
		price: {
			type: Number,
			required: [true, 'A Tour must have a Price'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					// this only points to current doc on NEW document creation.
					// Means it wont work if only the discount price is being updated.
					return val < this.price;
				},
				message:
					'Discount Price ({VALUE}) should be below the regular price',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A Tour must have a Summary'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			trim: true,
			required: [
				true,
				'A tour must have a Cover Image',
			],
		},
		images: [{ type: String }],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [
			{
				type: Date,
				// required: [
				// true,
				// 'A tour must have a Start Date',
				// ],
			},
		],
		secretTour: { type: Boolean, default: false },
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number], // Array of numbers: Longitude, Latitude
			address: String,
			description: String,
		},
		locations: [
			{
				// GeoJSON
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number], // Array of numbers: Longitude, Latitude
				address: String,
				description: String,
			},
		],
		guides: [
			{ type: mongoose.Schema.ObjectId, ref: 'User' },
		],
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

tourSchema.index({ price: 1, ratingsAverage: -1 }); // Compound Index
// price is in ascending order(1) and ratingsAverage is in descending order(-1)
tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

// `pre`, `post` are hook names; `save`, `find`, etc are middleware names

// DOCUMENT MIDDLEWARE: runs before .save() .create(). Not works on .insertMany()
tourSchema.pre('save', function (next) {
	// Each middleware function in the `pre-save` middleware has access to `next`
	this.slug = slugify(this.name, { lower: true });
	next();
});

// tourSchema.pre('save', function (next) {
// 	console.log('2nd Middlware');
// 	next();
// });
// tourSchema.post('save', function (doc, next) {
// 	console.log(doc);
// 	next();
// });

// QUERY MIDDLEWARE: runs before executing a query

// This middleware is using `find` and not `findOne`
// let timeTaken;
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
	// timeTaken = Date.now();
	this.start = Date.now();
	this.find({ secretTour: { $ne: true } });
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	}); // Populate 'guides' field with user data
	next();
});
tourSchema.post(/^find/, function (docs, next) {
	// timeTaken = Date.now() - timeTaken;
	console.log(
		`Process took ${Date.now() - this.start}ms.`,
	);
	next();
});

// NOT GOOD PRACTICE
// tourSchema.pre('findOne', function (next) {
// 	this.find({ secretTour: { $ne: true } });
// 	next();
// });

// AGGREGATION MIDDLEWARE: runs before executing an aggregation
// tourSchema.pre('aggregate', function (next) {
// 	this.pipeline().unshift({
// 		$match: { secretTour: { $ne: true } },
// 	});
// 	console.log(this.pipeline());
// 	next();
// });

tourSchema.virtual('durationInWeeks').get(function () {
	// We used Regular Function instead of arrow function because we need access to `this` keyword
	return this.duration / 7;
}); // This Virtual property will be created each time we get data from the database.

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
	// Compare `localField` from this Model with `foreignField` from the `ref` Model
}); // Virtual Populate

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
