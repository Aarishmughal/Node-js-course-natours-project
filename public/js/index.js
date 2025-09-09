/* eslint-disabled */
import '@babel/polyfill';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './bookTour.js';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector(
	'.nav__el--logout',
);
const userDataForm = document.querySelector(
	'.form--user-data',
);
const userSettingsForm = document.querySelector(
	'.form--user-settings',
);
const checkoutBtn = document.querySelector('.checkout-btn');

// VALUES

if (loginForm)
	loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const email =
			document.getElementById('email').value;
		const password =
			document.getElementById('password').value;
		login(email, password);
	});

if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (userDataForm)
	userDataForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector(
			'.btn--save-settings',
		).textContent = 'Updating...';
		const formData = new FormData();
		formData.append(
			'name',
			document.getElementById('name').value,
		);
		formData.append(
			'email',
			document.getElementById('email').value,
		);
		formData.append(
			'photo',
			document.getElementById('photo').files[0],
		);
		console.log(formData);
		await updateSettings(formData, 'data');
	});
if (userSettingsForm)
	userSettingsForm.addEventListener(
		'submit',
		async (e) => {
			e.preventDefault();
			document.querySelector(
				'.btn--save-password',
			).textContent = 'Updating...';
			const passwordCurrent = document.getElementById(
				'password-current',
			).value;
			const password =
				document.getElementById('password').value;
			const passwordConfirm = document.getElementById(
				'password-confirm',
			).value;
			console.log(
				`${passwordCurrent} ${password} ${passwordConfirm}`,
			);
			await updateSettings(
				{
					passwordCurrent,
					password,
					passwordConfirm,
				},
				'password',
			);

			document.getElementById(
				'password-current',
			).value = '';
			document.getElementById('password').value = '';
			document.getElementById(
				'password-confirm',
			).value = '';
		},
	);
if (checkoutBtn)
	checkoutBtn.addEventListener('click', async (e) => {
		e.target.textContent = 'Processing...';
		const tourId = e.target.dataset.tourId;
		bookTour(tourId);
	});
