// IMPORTS
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// CONSTANTS
const app = express();

// MIDDLEWARE(s)
// Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Security HTTP Headers
app.use(helmet());
// Limit Requests on same API
const limiter = rateLimit({
	max: 100, // max requests
	windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
	message:
		'Too many requests from this IP, please try again in an hour!',
});
app.use('/api/v1', limiter); // Apply to all routes that start with /api

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Body size limit

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (Cross Site Scripting) attacks
// Removes HTML and JS code from input
app.use(xss());

// HTTP Parameter Pollution Protection: Clears up the Query String
// Alters Query String so that it uses only the last parameter
// Whitelist: Allows duplicates for specified parameters
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsAverage',
			'ratingsQuantity',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	}),
);

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// ROUTE(s)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// The above middlewares/route-handlers didn't catch this route, so it must be undefined
// `all() method handles all http methods
// '*' means all the routes
app.all('*', (req, res, next) => {
	next(
		new AppError(
			`404! Page not Found at '${req.originalUrl}' on this server.`,
			404,
		),
	);
});

app.use(globalErrorHandler);
// GOING INTO SERVER.js
module.exports = app;
