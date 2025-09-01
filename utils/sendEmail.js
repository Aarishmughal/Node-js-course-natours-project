const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
	// STEP 01: Create Transporter
	const transporter = nodemailer.createTransport({
		// service: 'Gmail',
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
		// Activate the 'less secure app' option in Gmail when using gmail as service
	});

	// STEP 02: Define Email Options
	const mailOptions = {
		from: 'Muhammad Aarish <admin@natours.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		// html: options.html,
	};

	// STEP 03: Actually Send the Email
	await transporter.sendMail(mailOptions);
});
module.exports = sendEmail;
