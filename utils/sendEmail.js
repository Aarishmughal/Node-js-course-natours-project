const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// const catchAsync = require('./catchAsync');

// Format for using
// new Email(user, url).sendWelcome();

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firtName = user.name.split(' ')[0];
		this.url = url;
		this.from = `${process.env.MAILER_SENDER_NAME} <${process.env.MAILER_SENDER_EMAIL_ADDRESS}>`;
	}

	newTransport() {
		if (process.env.NODE_ENV === 'production') {
			// Sendgrid
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: process.env.SENDGRID_USERNAME,
					pass: process.env.SENDGRID_PASSWORD,
				},
			});
		}

		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	// Send the actual email
	async send(template, subject) {
		// 1. Render HTML Based on a PUG template
		const html = pug.renderFile(
			`${__dirname}/../views/email/${template}.pug`,
			{
				firstName: this.firtName,
				url: this.url,
				subject,
			},
		);
		// 2. Define Email Options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText.convert(html, {
				wordwrap: 130,
			}),
		};
		// 3. Create Transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send(
			'welcome',
			'Welcome to Natours Family',
		);
	}

	async sendPasswordReset() {
		await this.send(
			'passwordReset',
			`Reset your Natours Account Password 🔒🔑`,
		);
	}
};
