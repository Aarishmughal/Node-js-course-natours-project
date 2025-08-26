/**
 * Express application for the Natours API.
 *
 * - Loads tour data from a JSON file.
 * - Provides RESTful endpoints to get all tours, get a tour by ID, create a new tour, and update a tour.
 *
 * Endpoints:
 *   GET    /api/v1/tours         - Returns all tours.
 *   GET    /api/v1/tours/:id     - Returns a single tour by ID.
 *   POST   /api/v1/tours         - Creates a new tour.
 *   PATCH  /api/v1/tours/:id     - Updates an existing tour (not yet implemented).
 *   DELETE  /api/v1/tours/:id    - Deletes an existing tour (not yet implemented).
 *
 * @module app
 * @requires express
 * @requires fs
 */

// IMPORTS
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// CONSTANTS
const app = express();

// MIDDLEWARE(s)
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// ROUTE(s)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
