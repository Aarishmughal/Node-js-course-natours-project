const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
	// THIS SOLUTION WAS SUGGESTED BY CHATGPT
	// IT WORKS, BUT I PREFER THE ONE BELOW
	// const match = err.message.match(/(["'])(.*?)\1/);
	// console.log(match);
	// const value = match ? match[2] : 'unknown';
	const match = err.message.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate Field Value: ${match}. Please use another value!`;
	return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map(
		(el) => el.message,
	);
	const message = `Invalid Input Data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};
const handleJWTError = () =>
	new AppError('Invalid Token. Please login Again', 401);
const handleJWTExpiredError = () =>
	new AppError(
		'Your token was expired. Please login again',
		401,
	);

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	// OPERATIONAL ERROR, We send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
		// PROGRAMMING ERROR, No Details to client
	} else {
		// LOGGING FIRST
		console.error('ERROR 💣💣', err);
		// SEND GENERIC MESSAGE
		res.status(500).json({
			status: 'error',
			message:
				"It's not you, it's us. Something went wrong on our end.",
		});
	}
};
module.exports = (err, req, res, next) => {
	// DEFAULTING
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	// SENDING RESPONSE
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		// CREATING COPY
		let error = {
			...err,
			name: err.name,
			message: err.message,
		};

		// 1. Invalid ID Error
		if (error.name === 'CastError')
			error = handleCastErrorDB(error);

		// 2. Duplicate Field Error
		if (error.code === 11000)
			error = handleDuplicateFieldsDB(error);

		// 3. Validation Error
		if (error.name === 'ValidationError') {
			error = handleValidationErrorDB(error);
		}
		// 4. JWT Invalid Error
		if (error.name === 'JsonWebTokenError') {
			error = handleJWTError();
		}
		// 5. JWT Expired Error
		if (error.name === 'TokenExpiredError') {
			error = handleJWTExpiredError();
		}
		sendErrorProd(error, res);
	}
};
