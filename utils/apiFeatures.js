class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		const queryObj = { ...this.queryString };
		// REMOVING SPECIAL KEYWORDS FROM QUERY
		const excludedFields = [
			'page',
			'sort',
			'limit',
			'fields',
		];
		excludedFields.forEach((el) => delete queryObj[el]);

		// FORMING THE CORRECT MONGO QUERY
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`,
		);

		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort
				.split(',')
				.join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	limit() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields
				.split(',')
				.join(' ');
			this.query = this.query.select(fields); // Projecting
		} else {
			this.query = this.query.select('-__v'); // Minus acts as Excluder
		}
		return this;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;

		const skip = (page - 1) * limit; // Calculate Skip Value, Skip all documents upto last page
		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}
module.exports = APIFeatures;
