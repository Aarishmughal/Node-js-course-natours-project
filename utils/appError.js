class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4')
			? 'fail'
			: 'error';
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
		// When an object is created, it'll not pollute the original Error object's stack trace.
	}
}
module.exports = AppError;
