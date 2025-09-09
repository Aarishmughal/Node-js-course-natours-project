const stripe = require('stripe')(
	process.env.STRIPE_SECRET_KEY,
);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.createCheckoutSession = catchAsync(
	async (req, res, next) => {
		const tour = await Tour.findById(req.params.tourId);
		if (!tour) {
			return next(
				new AppError(
					'No tour found with that ID',
					404,
				),
			);
		}
		const product = await stripe.products.create({
			name: `${tour.name} Tour`,
			description: tour.summary,
			images: [
				`https://www.natours.dev/img/tours/${tour.imageCover}`,
			],
		});

		const price = await stripe.prices.create({
			product: product.id,
			unit_amount: tour.price * 100,
			currency: 'usd',
		});
		const session =
			await stripe.checkout.sessions.create({
				success_url: `${req.protocol}://${req.get('host')}/`,
				cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
				customer_email: req.user.email,
				client_reference_id: req.params.tourId,
				line_items: [
					{
						price: price.id,
						quantity: 1,
					},
				],
				mode: 'payment',
			});
		res.status(200).json({
			status: 'success',
			session,
		});
	},
);
