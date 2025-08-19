const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
	path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<DATABASE_PASSWORD>',
	process.env.DATABASE_PASSWORD,
);
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log('Database Connection Successful!');
	});

// LISTENER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`App is Listening on: ${PORT}`);
});
