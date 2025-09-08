/* eslint-disabled */
import '@babel/polyfill';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';

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
		const email =
			document.getElementById('email').value;
		const name = document.getElementById('name').value;
		await updateSettings({ name, email }, 'data');
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
