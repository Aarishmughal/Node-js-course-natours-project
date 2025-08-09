const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({
	path: './config.env',
});

// LISTENER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`App is Listening on: ${PORT}`);
});
