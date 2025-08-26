const mongoose = require('mongoose');
const dotenv = require('dotenv');

// GLOBAL UNHANDLED EXCEPTION Handler
process.on('uncaughtException', (err) => {
	console.log('Server is Shutting Down...💀');
	console.log(
		`Error 💥: ${err.name}\nMessage 💬: ${err.message.toUpperCase()}`,
	);
	process.exit(1);
});

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
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Database Connection Successful ✅');
	});

// LISTENER
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log(`App is Listening on: ${PORT}`);
});

// GLOBAL UNHANDLED REJECTION Handler
process.on('unhandledRejection', (err) => {
	console.log('Server is Shutting Down...💀');
	console.log(err);
	server.close(() => {
		process.exit(1);
	});
});
