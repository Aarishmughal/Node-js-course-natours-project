// This function will return another function which will become the value of each object below. This `another` function is almost the same to the original Async function except that it is chained to the `catch` method.
module.exports = (func) => {
	return (req, res, next) => {
		// func(req, res, next).catch((err) => next(err));
		func(req, res, next).catch(next);
		//Both are equal, js automatically call the function on the parameter that the callback receives
	};
};
